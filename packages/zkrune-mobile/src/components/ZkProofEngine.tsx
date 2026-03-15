/**
 * zkRune Mobile - ZK Proof Engine Component
 * Hidden WebView that runs snarkjs for real ZK proof generation
 */

import React, { useRef, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import {
  ProofType,
  isCircuitCached,
  downloadCircuit,
  buildProofHTMLFile,
  cleanupProofHTML,
} from '../services/zkProofBridge';

export interface ZkProofResult {
  success: boolean;
  proof?: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  publicSignals?: string[];
  verified?: boolean;
  generationTime?: number;
  error?: string;
}

export interface ZkProofEngineRef {
  generateProof: (
    type: ProofType,
    inputs: Record<string, string>,
    onProgress?: (status: string) => void
  ) => Promise<ZkProofResult>;
  isCircuitReady: (type: ProofType) => Promise<boolean>;
  downloadCircuit: (
    type: ProofType,
    onProgress?: (progress: number, status: string) => void
  ) => Promise<boolean>;
}

interface Props {
  onReady?: () => void;
}

export const ZkProofEngine = forwardRef<ZkProofEngineRef, Props>(({ onReady }, ref) => {
  const webViewRef = useRef<WebView>(null);
  const [htmlUri, setHtmlUri] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Promise resolver for current operation
  const resolverRef = useRef<{
    resolve: (result: ZkProofResult) => void;
    onProgress?: (status: string) => void;
  } | null>(null);

  // Handle messages from WebView
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'status') {
        resolverRef.current?.onProgress?.(data.message);
      } else if (data.type === 'success') {
        resolverRef.current?.resolve({
          success: true,
          proof: {
            pi_a: data.proof.pi_a,
            pi_b: data.proof.pi_b,
            pi_c: data.proof.pi_c,
            protocol: data.proof.protocol || 'groth16',
            curve: data.proof.curve || 'bn128',
          },
          publicSignals: data.publicSignals,
          verified: data.verified,
          generationTime: data.generationTime,
        });
        setIsGenerating(false);
        setHtmlUri('');
        cleanupProofHTML();
      } else if (data.type === 'error') {
        resolverRef.current?.resolve({
          success: false,
          error: data.message,
        });
        setIsGenerating(false);
        setHtmlUri('');
        cleanupProofHTML();
      }
    } catch (error) {
      console.error('[ZkEngine] Failed to parse WebView message:', error);
    }
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    generateProof: async (
      type: ProofType,
      inputs: Record<string, string>,
      onProgress?: (status: string) => void
    ): Promise<ZkProofResult> => {
      if (isGenerating) {
        return { success: false, error: 'Already generating a proof' };
      }

      const cached = await isCircuitCached(type);
      if (!cached) {
        return { success: false, error: 'Circuit not downloaded. Please download first.' };
      }

      onProgress?.('Loading circuit files...');

      const filePath = await buildProofHTMLFile(type, inputs);
      if (!filePath) {
        return { success: false, error: 'Failed to prepare proof computation' };
      }

      onProgress?.('Preparing proof computation...');

      return new Promise((resolve) => {
        resolverRef.current = { resolve, onProgress };
        setIsGenerating(true);
        setHtmlUri(filePath);
      });
    },

    isCircuitReady: async (type: ProofType): Promise<boolean> => {
      return isCircuitCached(type);
    },

    downloadCircuit: async (
      type: ProofType,
      onProgress?: (progress: number, status: string) => void
    ): Promise<boolean> => {
      return downloadCircuit(type, onProgress);
    },
  }), [isGenerating]);

  // Notify when ready
  React.useEffect(() => {
    onReady?.();
  }, [onReady]);

  // Always render container (for ref), only render WebView when generating
  return (
    <View style={styles.container}>
      {htmlUri ? (
        <WebView
          ref={webViewRef}
          source={{ uri: htmlUri }}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          originWhitelist={['*']}
          onError={(error) => {
            console.error('[ZkEngine] WebView error:', error);
            resolverRef.current?.resolve({
              success: false,
              error: 'WebView error',
            });
            setIsGenerating(false);
            setHtmlUri('');
            cleanupProofHTML();
          }}
          style={styles.webview}
        />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  webview: {
    width: 1,
    height: 1,
  },
});

export default ZkProofEngine;
