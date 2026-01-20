/**
 * zkRune Mobile - Production App
 * Real navigation with all services integrated
 */

// Polyfills for Node.js crypto libraries
import 'react-native-get-random-values';

import React, { useEffect, useState, useRef } from 'react';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './src/navigation';
import { ZkProofEngine, ZkProofEngineRef } from './src/components/ZkProofEngine';
import { zkProofService } from './src/services';

// Error Boundary for catching crashes
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Uygulama Hatası</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Bilinmeyen hata'}
          </Text>
          <Text style={styles.errorStack}>
            {this.state.error?.stack?.slice(0, 500)}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const zkEngineRef = useRef<ZkProofEngineRef>(null);

  useEffect(() => {
    // Small delay to ensure everything is loaded
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Connect ZK Engine to service when ready
  useEffect(() => {
    if (isReady) {
      // Small delay to ensure ZkProofEngine is mounted
      const timer = setTimeout(() => {
        if (zkEngineRef.current) {
          zkProofService.setEngineRef(zkEngineRef.current);
          console.log('[App] ZK Proof Engine connected to service');
        } else {
          console.warn('[App] ZK Engine ref not available');
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>zkRune</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <Navigation />
        {/* Hidden ZK Proof Engine - runs snarkjs in WebView */}
        <ZkProofEngine 
          ref={zkEngineRef}
          onReady={() => console.log('[App] ZK Engine ready')}
        />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#06B6D4',
    fontSize: 32,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#1a0a0a',
    padding: 20,
    justifyContent: 'center',
  },
  errorTitle: {
    color: '#EF4444',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  errorMessage: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  errorStack: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
