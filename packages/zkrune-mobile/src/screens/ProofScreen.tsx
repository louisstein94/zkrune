/**
 * zkRune Proof Generation Screen
 * Generate ZK proofs with beautiful UI
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, layout } from '../theme';
import { Button, Card, GradientText } from '../components/ui';

interface ProofTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const templates: ProofTemplate[] = [
  { id: 'age', name: 'Age Verification', description: 'Prove you are over 18', icon: 'person', color: colors.brand.primary },
  { id: 'balance', name: 'Balance Proof', description: 'Prove minimum balance', icon: 'wallet', color: colors.accent.emerald },
  { id: 'membership', name: 'Membership', description: 'Prove group membership', icon: 'people', color: colors.accent.cyan },
  { id: 'credential', name: 'Credential', description: 'Prove credentials', icon: 'ribbon', color: colors.accent.pink },
];

export function ProofScreen({ navigation, route }: any) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // Check if we can go back (came from stack, not tab)
  const canGoBack = navigation.canGoBack();

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate proof generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsGenerating(false);
    // Navigate to result
  };

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
        {/* Template Selection */}
        <Text style={styles.sectionTitle}>Select Proof Type</Text>
        
        <View style={styles.templates}>
          {templates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.templateCard,
                selectedTemplate === template.id && styles.templateCardSelected,
              ]}
              onPress={() => setSelectedTemplate(template.id)}
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
              
              {selectedTemplate === template.id && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.brand.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Section */}
        {selectedTemplate && (
          <>
            <Text style={styles.sectionTitle}>Enter Details</Text>
            
            <Card style={styles.inputCard}>
              <Text style={styles.inputLabel}>
                {selectedTemplate === 'age' && 'Your Birth Year'}
                {selectedTemplate === 'balance' && 'Minimum Balance (zkRUNE)'}
                {selectedTemplate === 'membership' && 'Group ID'}
                {selectedTemplate === 'credential' && 'Credential Hash'}
              </Text>
              
              <TextInput
                style={styles.input}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={
                  selectedTemplate === 'age' ? '1990' :
                  selectedTemplate === 'balance' ? '1000' :
                  selectedTemplate === 'membership' ? 'group_123' :
                  '0x...'
                }
                placeholderTextColor={colors.text.tertiary}
                keyboardType={['age', 'balance'].includes(selectedTemplate) ? 'numeric' : 'default'}
              />
              
              <View style={styles.inputInfo}>
                <Ionicons name="shield-checkmark" size={16} color={colors.brand.primary} />
                <Text style={styles.inputInfoText}>
                  Your data never leaves your device
                </Text>
              </View>
            </Card>
          </>
        )}

        {/* Generate Button */}
        {selectedTemplate && (
          <View style={styles.generateSection}>
            <Button
              title={isGenerating ? 'Generating...' : 'Generate Proof'}
              onPress={handleGenerate}
              loading={isGenerating}
              disabled={!inputValue}
              size="lg"
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

        <View style={{ height: 40 }} />
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
  inputLabel: {
    ...typography.styles.label,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  input: {
    height: layout.input.height,
    backgroundColor: colors.background.tertiary,
    borderRadius: layout.input.radius,
    paddingHorizontal: layout.input.paddingHorizontal,
    color: colors.text.primary,
    fontSize: 16,
    marginBottom: spacing[3],
  },
  inputInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  inputInfoText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  generateSection: {
    marginBottom: spacing[6],
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
});
