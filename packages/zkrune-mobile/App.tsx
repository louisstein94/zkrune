/**
 * zkRune Mobile - Production App
 * Real navigation with all services integrated
 */

// CRITICAL: Polyfills must be imported FIRST
import './shim';

import React, { useEffect, useState, useRef } from 'react';
import { StatusBar, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './src/navigation';
import { ZkProofEngine, ZkProofEngineRef } from './src/components/ZkProofEngine';
import { zkProofService } from './src/services';

// Error Boundary for catching crashes
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
    this.setState({ 
      errorInfo: errorInfo.componentStack || '' 
    });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={styles.errorContainer} contentContainerStyle={styles.errorContent}>
          <Text style={styles.errorTitle}>⚠️ Uygulama Hatası</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Bilinmeyen hata'}
          </Text>
          <Text style={styles.errorStack}>
            {this.state.error?.stack?.slice(0, 1000)}
          </Text>
          {this.state.errorInfo ? (
            <Text style={styles.errorComponent}>
              Component: {this.state.errorInfo.slice(0, 300)}
            </Text>
          ) : null}
          <TouchableOpacity 
            style={styles.reloadButtonContainer}
            onPress={this.handleReload}
          >
            <Text style={styles.reloadButton}>🔄 Tekrar Dene</Text>
          </TouchableOpacity>
        </ScrollView>
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
  },
  errorContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
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
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  errorComponent: {
    color: '#F59E0B',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  reloadButtonContainer: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  reloadButton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
