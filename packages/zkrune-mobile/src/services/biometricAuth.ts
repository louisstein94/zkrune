/**
 * zkRune Mobile - Biometric Authentication Service
 * Face ID / Touch ID / Fingerprint authentication
 */

import * as LocalAuthentication from 'expo-local-authentication';
import { secureStorage, STORAGE_KEYS } from './secureStorage';

export enum BiometricType {
  NONE = 'none',
  FINGERPRINT = 'fingerprint',
  FACIAL_RECOGNITION = 'facial',
  IRIS = 'iris',
}

export interface BiometricStatus {
  isAvailable: boolean;
  biometricType: BiometricType;
  isEnrolled: boolean;
  isEnabled: boolean;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  errorCode?: string;
}

/**
 * Biometric authentication service
 */
class BiometricAuthService {
  private _cachedStatus: BiometricStatus | null = null;

  /**
   * Check if device supports biometric authentication
   */
  async checkSupport(): Promise<BiometricStatus> {
    try {
      // Check hardware support
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      
      // Check if biometrics are enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      // Get supported authentication types
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      // Check if user has enabled biometric in app
      const isEnabledStr = await secureStorage.get(STORAGE_KEYS.BIOMETRIC_ENABLED);
      const isEnabled = isEnabledStr === 'true';
      
      // Determine biometric type
      let biometricType = BiometricType.NONE;
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = BiometricType.FACIAL_RECOGNITION;
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = BiometricType.FINGERPRINT;
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = BiometricType.IRIS;
      }

      const status: BiometricStatus = {
        isAvailable: hasHardware && isEnrolled,
        biometricType,
        isEnrolled,
        isEnabled,
      };

      this._cachedStatus = status;
      return status;
    } catch (error) {
      console.error('[BiometricAuth] Failed to check support:', error);
      return {
        isAvailable: false,
        biometricType: BiometricType.NONE,
        isEnrolled: false,
        isEnabled: false,
      };
    }
  }

  /**
   * Get cached status or fetch new one
   */
  async getStatus(): Promise<BiometricStatus> {
    if (this._cachedStatus) {
      return this._cachedStatus;
    }
    return this.checkSupport();
  }

  /**
   * Authenticate user with biometrics
   */
  async authenticate(reason?: string): Promise<AuthResult> {
    try {
      const status = await this.checkSupport();
      
      if (!status.isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available',
          errorCode: 'NOT_AVAILABLE',
        };
      }

      if (!status.isEnrolled) {
        return {
          success: false,
          error: 'No biometrics enrolled on this device',
          errorCode: 'NOT_ENROLLED',
        };
      }

      const promptMessage = reason || 'Authenticate to access zkRune';
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false, // Allow PIN/password fallback
      });

      if (result.success) {
        return { success: true };
      }

      // Handle different error cases
      let errorMessage = 'Authentication failed';
      let errorCode = 'UNKNOWN';

      if (result.error === 'user_cancel') {
        errorMessage = 'Authentication cancelled';
        errorCode = 'USER_CANCEL';
      } else if (result.error === 'user_fallback') {
        errorMessage = 'User chose fallback authentication';
        errorCode = 'USER_FALLBACK';
      } else if (result.error === 'system_cancel') {
        errorMessage = 'System cancelled authentication';
        errorCode = 'SYSTEM_CANCEL';
      } else if (result.error === 'lockout') {
        errorMessage = 'Too many failed attempts. Please try again later.';
        errorCode = 'LOCKOUT';
      }

      return {
        success: false,
        error: errorMessage,
        errorCode,
      };
    } catch (error) {
      console.error('[BiometricAuth] Authentication error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
        errorCode: 'EXCEPTION',
      };
    }
  }

  /**
   * Enable biometric authentication
   */
  async enable(): Promise<boolean> {
    try {
      const status = await this.checkSupport();
      
      if (!status.isAvailable) {
        return false;
      }

      // Verify with biometrics before enabling
      const authResult = await this.authenticate('Enable biometric authentication');
      
      if (!authResult.success) {
        return false;
      }

      await secureStorage.set(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
      this._cachedStatus = { ...status, isEnabled: true };
      return true;
    } catch (error) {
      console.error('[BiometricAuth] Failed to enable:', error);
      return false;
    }
  }

  /**
   * Disable biometric authentication
   */
  async disable(): Promise<boolean> {
    try {
      await secureStorage.set(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
      if (this._cachedStatus) {
        this._cachedStatus.isEnabled = false;
      }
      return true;
    } catch (error) {
      console.error('[BiometricAuth] Failed to disable:', error);
      return false;
    }
  }

  /**
   * Get human-readable biometric type name
   */
  getBiometricName(type: BiometricType): string {
    switch (type) {
      case BiometricType.FACIAL_RECOGNITION:
        return 'Face ID';
      case BiometricType.FINGERPRINT:
        return 'Touch ID / Fingerprint';
      case BiometricType.IRIS:
        return 'Iris Scanner';
      default:
        return 'Biometric';
    }
  }

  /**
   * Get icon name for biometric type
   */
  getBiometricIcon(type: BiometricType): string {
    switch (type) {
      case BiometricType.FACIAL_RECOGNITION:
        return 'scan-outline';
      case BiometricType.FINGERPRINT:
        return 'finger-print';
      case BiometricType.IRIS:
        return 'eye-outline';
      default:
        return 'lock-closed-outline';
    }
  }
}

export const biometricAuth = new BiometricAuthService();
export default biometricAuth;
