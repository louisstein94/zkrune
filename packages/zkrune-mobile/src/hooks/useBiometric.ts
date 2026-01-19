/**
 * zkRune Mobile - useBiometric Hook
 * React hook for biometric authentication
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  biometricAuth, 
  BiometricStatus, 
  BiometricType, 
  AuthResult 
} from '../services/biometricAuth';

export interface UseBiometricReturn {
  // State
  status: BiometricStatus | null;
  isAvailable: boolean;
  isEnabled: boolean;
  biometricType: BiometricType;
  biometricName: string;
  biometricIcon: string;
  isAuthenticating: boolean;
  lastError: string | null;
  
  // Actions
  authenticate: (reason?: string) => Promise<AuthResult>;
  enable: () => Promise<boolean>;
  disable: () => Promise<boolean>;
  checkStatus: () => Promise<void>;
}

export function useBiometric(): UseBiometricReturn {
  const [status, setStatus] = useState<BiometricStatus | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Check biometric status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  // Check biometric status
  const checkStatus = useCallback(async (): Promise<void> => {
    try {
      const newStatus = await biometricAuth.checkSupport();
      setStatus(newStatus);
    } catch (error) {
      console.error('[useBiometric] Failed to check status:', error);
    }
  }, []);

  // Authenticate
  const authenticate = useCallback(async (reason?: string): Promise<AuthResult> => {
    setIsAuthenticating(true);
    setLastError(null);
    
    try {
      const result = await biometricAuth.authenticate(reason);
      
      if (!result.success && result.error) {
        setLastError(result.error);
      }
      
      return result;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  // Enable biometric
  const enable = useCallback(async (): Promise<boolean> => {
    const success = await biometricAuth.enable();
    if (success) {
      await checkStatus();
    }
    return success;
  }, [checkStatus]);

  // Disable biometric
  const disable = useCallback(async (): Promise<boolean> => {
    const success = await biometricAuth.disable();
    if (success) {
      await checkStatus();
    }
    return success;
  }, [checkStatus]);

  // Derived values
  const biometricType = status?.biometricType || BiometricType.NONE;
  const biometricName = biometricAuth.getBiometricName(biometricType);
  const biometricIcon = biometricAuth.getBiometricIcon(biometricType);

  return {
    status,
    isAvailable: status?.isAvailable || false,
    isEnabled: status?.isEnabled || false,
    biometricType,
    biometricName,
    biometricIcon,
    isAuthenticating,
    lastError,
    authenticate,
    enable,
    disable,
    checkStatus,
  };
}

export default useBiometric;
