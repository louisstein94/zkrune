/**
 * zkRune Proof Generation Screen
 * Generate ZK proofs with real service integration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors, typography, spacing, layout } from '../theme';
import { Button, Card, GradientText } from '../components/ui';
import { useZkProof, useWallet } from '../hooks';
import { ProofType, ProofInput } from '../services';

export function ProofScreen({ navigation }: any) {
  const { 
    templates, 
    isGenerating, 
    progress, 
    currentProof, 
    error,
    generateProof,
    exportProof,
    getShareableUrl,
    clearCurrentProof,
  } = useZkProof();
  
  const { isConnected, connection } = useWallet();
  
  const [selectedTemplate, setSelectedTemplate] = useState<ProofType | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  
  const canGoBack = navigation.canGoBack();

  const selectedTemplateData = selectedTemplate 
    ? templates.find(t => t.type === selectedTemplate) 
    : null;

  const handleInputChange = (field: string, value: string) => {
    setInputValues(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !selectedTemplateData) return;

    // Validate inputs
    const missingFields = selectedTemplateData.fields
      .filter(f => f.required && !inputValues[f.name])
      .map(f => f.label);

    if (missingFields.length > 0) {
      Alert.alert('Missing Fields', `Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    // Separate private and public inputs
    const privateInputs: Record<string, any> = {};
    const publicInputs: Record<string, any> = {};

    selectedTemplateData.fields.forEach(field => {
      const value = inputValues[field.name];
      if (field.type === 'secret') {
        privateInputs[field.name] = value;
      } else {
        publicInputs[field.name] = value;
      }
    });

    const input: ProofInput = {
      type: selectedTemplate,
      privateInputs,
      publicInputs,
    };

    await generateProof(input);
  };

  const handleCopyProof = async () => {
    if (!currentProof) return;
    const json = exportProof(currentProof);
    await Clipboard.setStringAsync(json);
    Alert.alert('Copied', 'Proof copied to clipboard');
  };

  const handleShareProof = () => {
    if (!currentProof) return;
    const url = getShareableUrl(currentProof);
    Alert.alert('Share URL', url);
  };

  const handleNewProof = () => {
    clearCurrentProof();
    setSelectedTemplate(null);
    setInputValues({});
  };

  // Show result screen if proof is generated
  if (currentProof) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleNewProof} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <GradientText style={styles.title}>Proof Ready</GradientText>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {/* Success Card */}
          <LinearGradient
            colors={[colors.status.success + '20', 'transparent']}
            style={styles.successCard}
          >
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color={colors.status.success} />
            </View>
            <Text style={styles.successTitle}>Proof Generated Successfully!</Text>
            <Text style={styles.successSubtitle}>
              Your zero-knowledge proof is ready to use
            </Text>
          </LinearGradient>

          {/* Proof Details */}
          <Card style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Proof ID</Text>
              <Text style={styles.detailValue}>{currentProof.proofId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>
                {templates.find(t => t.type === currentProof.type)?.name}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Verified</Text>
              <View style={[
                styles.verifiedBadge,
                currentProof.verified && styles.verifiedBadgeSuccess
              ]}>
                <Ionicons 
                  name={currentProof.verified ? 'checkmark' : 'close'} 
                  size={14} 
                  color={currentProof.verified ? colors.status.success : colors.status.error} 
                />
                <Text style={[
                  styles.verifiedText,
                  currentProof.verified && styles.verifiedTextSuccess
                ]}>
                  {currentProof.verified ? 'Valid' : 'Invalid'}
                </Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Protocol</Text>
              <Text style={styles.detailValue}>{currentProof.proof.protocol}</Text>
            </View>
          </Card>

          {/* Actions */}
          <View style={styles.actionButtons}>
            <Button
              title="Copy Proof"
              onPress={handleCopyProof}
              variant="secondary"
              icon={<Ionicons name="copy-outline" size={18} color={colors.brand.primary} />}
            />
            <Button
              title="Share"
              onPress={handleShareProof}
              variant="secondary"
              icon={<Ionicons name="share-outline" size={18} color={colors.brand.primary} />}
            />
          </View>

          <Button
            title="Generate Another Proof"
            onPress={handleNewProof}
            size="lg"
            style={styles.newProofButton}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {canGoBack ? (
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <GradientText style={styles.title}>Generate Proof</GradientText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Connection Warning */}
        {!isConnected && (
          <Card style={styles.warningCard}>
            <View style={styles.warningRow}>
              <Ionicons name="warning" size={20} color={colors.status.warning} />
              <Text style={styles.warningText}>
                Connect a wallet to verify proofs on-chain
              </Text>
            </View>
          </Card>
        )}

        {/* Template Selection */}
        <Text style={styles.sectionTitle}>Select Proof Type</Text>
        
        <View style={styles.templates}>
          {templates.map((template) => (
            <TouchableOpacity
              key={template.type}
              style={[
                styles.templateCard,
                selectedTemplate === template.type && styles.templateCardSelected,
              ]}
              onPress={() => {
                setSelectedTemplate(template.type);
                setInputValues({});
              }}
            >
              <View 
                style={[
                  styles.templateIcon,
                  { backgroundColor: template.color + '20' },
                ]}
              >
                <Ionicons 
                  name={template.icon as any} 
                  size={24} 
                  color={template.color} 
                />
              </View>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateDescription}>{template.description}</Text>
              
              {selectedTemplate === template.type && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.brand.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Section */}
        {selectedTemplateData && (
          <>
            <Text style={styles.sectionTitle}>Enter Details</Text>
            
            <Card style={styles.inputCard}>
              {selectedTemplateData.fields.map((field) => (
                <View key={field.name} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {field.label}
                    {field.required && <Text style={styles.requiredMark}> *</Text>}
                  </Text>
                  
                  <TextInput
                    style={styles.input}
                    value={inputValues[field.name] || ''}
                    onChangeText={(value) => handleInputChange(field.name, value)}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                    secureTextEntry={field.type === 'secret'}
                  />
                </View>
              ))}
              
              <View style={styles.inputInfo}>
                <Ionicons name="shield-checkmark" size={16} color={colors.brand.primary} />
                <Text style={styles.inputInfoText}>
                  Your data never leaves your device
                </Text>
              </View>
            </Card>
          </>
        )}

        {/* Error Display */}
        {error && (
          <Card style={styles.errorCard}>
            <Ionicons name="alert-circle" size={20} color={colors.status.error} />
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        {/* Generate Button */}
        {selectedTemplate && (
          <View style={styles.generateSection}>
            {isGenerating && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
            )}
            
            <Button
              title={isGenerating ? 'Generating...' : 'Generate Proof'}
              onPress={handleGenerate}
              loading={isGenerating}
              disabled={isGenerating}
              size="lg"
              icon={!isGenerating ? <Ionicons name="flash" size={20} color={colors.text.primary} /> : undefined}
            />
            
            {isGenerating && (
              <View style={styles.generatingInfo}>
                <Text style={styles.generatingText}>
                  Creating zero-knowledge proof...
                </Text>
                <Text style={styles.generatingSubtext}>
                  This may take a few seconds
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Privacy Notice */}
        <Card style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <Ionicons name="lock-closed" size={20} color={colors.brand.primary} />
            <Text style={styles.privacyTitle}>Privacy Guaranteed</Text>
          </View>
          <Text style={styles.privacyText}>
            Zero-knowledge proofs allow you to prove facts without revealing the underlying data. 
            Your private information never leaves your device.
          </Text>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[4],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: layout.screenPadding,
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  warningCard: {
    backgroundColor: colors.status.warning + '15',
    borderColor: colors.status.warning + '30',
    marginBottom: spacing[4],
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  warningText: {
    ...typography.styles.bodySmall,
    color: colors.status.warning,
    flex: 1,
  },
  templates: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  templateCard: {
    width: '47%',
    backgroundColor: colors.background.secondary,
    borderRadius: layout.radius.lg,
    padding: spacing[4],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateCardSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary + '10',
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  templateName: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  templateDescription: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
  },
  inputCard: {
    marginBottom: spacing[6],
  },
  inputGroup: {
    marginBottom: spacing[4],
  },
  inputLabel: {
    ...typography.styles.label,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  requiredMark: {
    color: colors.status.error,
  },
  input: {
    height: layout.input.height,
    backgroundColor: colors.background.tertiary,
    borderRadius: layout.input.radius,
    paddingHorizontal: layout.input.paddingHorizontal,
    color: colors.text.primary,
    fontSize: 16,
  },
  inputInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  inputInfoText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.status.error + '15',
    borderColor: colors.status.error + '30',
    marginBottom: spacing[4],
  },
  errorText: {
    ...typography.styles.bodySmall,
    color: colors.status.error,
    flex: 1,
  },
  generateSection: {
    marginBottom: spacing[6],
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 4,
  },
  progressText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    width: 40,
    textAlign: 'right',
  },
  generatingInfo: {
    alignItems: 'center',
    marginTop: spacing[4],
  },
  generatingText: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  generatingSubtext: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  privacyCard: {
    backgroundColor: colors.brand.primary + '10',
    borderColor: colors.brand.primary + '30',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  privacyTitle: {
    ...typography.styles.body,
    color: colors.brand.primary,
    fontWeight: '600',
  },
  privacyText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  // Success screen styles
  successCard: {
    borderRadius: layout.radius.xl,
    padding: spacing[8],
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  successIcon: {
    marginBottom: spacing[4],
  },
  successTitle: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  successSubtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  detailsCard: {
    marginBottom: spacing[4],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  detailLabel: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.status.error + '20',
    borderRadius: 6,
  },
  verifiedBadgeSuccess: {
    backgroundColor: colors.status.success + '20',
  },
  verifiedText: {
    ...typography.styles.bodySmall,
    color: colors.status.error,
    fontWeight: '500',
  },
  verifiedTextSuccess: {
    color: colors.status.success,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  newProofButton: {
    marginTop: spacing[2],
  },
});
