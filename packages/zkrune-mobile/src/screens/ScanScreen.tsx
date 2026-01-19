/**
 * zkRune QR Scanner Screen
 * Scan and verify ZK proofs via QR code
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, layout } from '../theme';
import { Button, Card } from '../components/ui';
import { useZkProof } from '../hooks';

const { width, height } = Dimensions.get('window');
const SCAN_SIZE = width * 0.7;

interface ScanScreenProps {
  navigation: any;
}

export function ScanScreen({ navigation }: ScanScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    proofType?: string;
    message: string;
  } | null>(null);

  const { verifyProof, templates } = useZkProof();

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    setIsVerifying(true);

    try {
      // Parse the scanned data
      let proofData;
      
      // Check if it's a zkRune URL
      if (data.startsWith('https://zkrune.com/verify/')) {
        const url = new URL(data);
        const encodedData = url.searchParams.get('data');
        if (encodedData) {
          proofData = JSON.parse(Buffer.from(encodedData, 'base64').toString());
        }
      } else {
        // Try to parse as direct JSON
        proofData = JSON.parse(data);
      }

      if (!proofData || !proofData.p || !proofData.s || !proofData.t) {
        throw new Error('Invalid proof format');
      }

      // Verify the proof
      const isValid = await verifyProof({
        proof: proofData.p,
        publicSignals: proofData.s,
        type: proofData.t,
        proofId: 'scanned',
        timestamp: Date.now(),
        verified: false,
      });

      const template = templates.find(t => t.type === proofData.t);

      setVerificationResult({
        success: isValid,
        proofType: template?.name || proofData.t,
        message: isValid 
          ? 'This proof is valid and has been verified.' 
          : 'This proof could not be verified.',
      });
    } catch (error) {
      setVerificationResult({
        success: false,
        message: 'Invalid QR code. Please scan a valid zkRune proof.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setVerificationResult(null);
  };

  // Permission not determined
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="camera-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.permissionText}>Checking camera permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Scan Proof</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.centerContent}>
          <View style={styles.permissionIcon}>
            <Ionicons name="camera-outline" size={48} color={colors.brand.primary} />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionDescription}>
            zkRune needs camera access to scan QR codes and verify proofs.
          </Text>
          <Button
            title="Grant Access"
            onPress={requestPermission}
            style={styles.grantButton}
          />
          <TouchableOpacity onPress={() => Linking.openSettings()}>
            <Text style={styles.settingsLink}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Verification result screen
  if (verificationResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Verification Result</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.resultContent}>
          <LinearGradient
            colors={verificationResult.success 
              ? [colors.status.success + '20', 'transparent']
              : [colors.status.error + '20', 'transparent']
            }
            style={styles.resultCard}
          >
            <View style={[
              styles.resultIcon,
              { backgroundColor: verificationResult.success ? colors.status.success + '20' : colors.status.error + '20' }
            ]}>
              <Ionicons 
                name={verificationResult.success ? 'checkmark-circle' : 'close-circle'} 
                size={64} 
                color={verificationResult.success ? colors.status.success : colors.status.error} 
              />
            </View>

            <Text style={styles.resultTitle}>
              {verificationResult.success ? 'Proof Verified!' : 'Verification Failed'}
            </Text>

            {verificationResult.proofType && (
              <View style={styles.proofTypeTag}>
                <Ionicons name="shield-checkmark" size={16} color={colors.brand.primary} />
                <Text style={styles.proofTypeText}>{verificationResult.proofType}</Text>
              </View>
            )}

            <Text style={styles.resultMessage}>{verificationResult.message}</Text>
          </LinearGradient>

          <View style={styles.resultActions}>
            <Button
              title="Scan Another"
              onPress={handleScanAgain}
              variant="secondary"
              icon={<Ionicons name="scan-outline" size={18} color={colors.text.primary} />}
            />
            <Button
              title="Done"
              onPress={() => navigation.goBack()}
              style={styles.doneButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Scanner view
  return (
    <View style={styles.scannerContainer}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <SafeAreaView style={styles.scannerHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.scannerTitle}>Scan QR Code</Text>
          <TouchableOpacity style={styles.flashButton}>
            <Ionicons name="flash-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Scan area */}
        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            {/* Corner decorations */}
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
            
            {/* Scanning line animation would go here */}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Position the QR code within the frame to verify a zkRune proof
          </Text>
          
          <View style={styles.proofTypes}>
            <View style={styles.proofTypeItem}>
              <Ionicons name="person" size={16} color={colors.accent.purple} />
              <Text style={styles.proofTypeLabel}>Age</Text>
            </View>
            <View style={styles.proofTypeItem}>
              <Ionicons name="wallet" size={16} color={colors.accent.emerald} />
              <Text style={styles.proofTypeLabel}>Balance</Text>
            </View>
            <View style={styles.proofTypeItem}>
              <Ionicons name="people" size={16} color={colors.accent.cyan} />
              <Text style={styles.proofTypeLabel}>Membership</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Loading overlay */}
      {isVerifying && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <Ionicons name="shield-checkmark" size={32} color={colors.brand.primary} />
            <Text style={styles.loadingText}>Verifying proof...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.brand.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  permissionTitle: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  permissionText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing[4],
  },
  permissionDescription: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
    lineHeight: 22,
  },
  grantButton: {
    width: '100%',
    marginBottom: spacing[4],
  },
  settingsLink: {
    ...typography.styles.body,
    color: colors.brand.primary,
  },
  // Scanner
  scannerContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.brand.primary,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  instructions: {
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[12],
  },
  instructionText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  proofTypes: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  proofTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
  },
  proofTypeLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: colors.background.secondary,
    padding: spacing[6],
    borderRadius: layout.radius.lg,
    alignItems: 'center',
    gap: spacing[3],
  },
  loadingText: {
    ...typography.styles.body,
    color: colors.text.primary,
  },
  // Result
  resultContent: {
    flex: 1,
    padding: spacing[6],
  },
  resultCard: {
    borderRadius: layout.radius.xl,
    padding: spacing[8],
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  resultTitle: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  proofTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.brand.primary + '15',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
    marginBottom: spacing[4],
  },
  proofTypeText: {
    ...typography.styles.bodySmall,
    color: colors.brand.primary,
    fontWeight: '600',
  },
  resultMessage: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  resultActions: {
    gap: spacing[3],
  },
  doneButton: {
    marginTop: spacing[2],
  },
});

export default ScanScreen;
