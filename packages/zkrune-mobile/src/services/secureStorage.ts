/**
 * zkRune Mobile - Secure Storage Service
 * Encrypted key-value storage for sensitive data
 * Falls back to localStorage on web platform
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Check if running on web
const isWeb = Platform.OS === 'web';

// Storage keys
export const STORAGE_KEYS = {
  WALLET_SECRET: 'zkrune_wallet_secret',
  WALLET_PUBLIC_KEY: 'zkrune_wallet_pubkey',
  BIOMETRIC_ENABLED: 'zkrune_biometric_enabled',
  PIN_HASH: 'zkrune_pin_hash',
  ONBOARDED: 'zkrune_onboarded',
  NETWORK: 'zkrune_network',
  RPC_ENDPOINT: 'zkrune_rpc_endpoint',
  LAST_PROOF_ID: 'zkrune_last_proof_id',
  USER_PREFERENCES: 'zkrune_user_prefs',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Secure storage service with encryption
 * Uses SecureStore on native, localStorage on web
 */
class SecureStorageService {
  /**
   * Store a value securely
   */
  async set(key: StorageKey, value: string): Promise<boolean> {
    try {
      if (isWeb) {
        localStorage.setItem(key, value);
        return true;
      }
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      return true;
    } catch (error) {
      console.debug(`[SecureStorage] Failed to set ${key}:`, error);
      return false;
    }
  }

  /**
   * Retrieve a value securely
   */
  async get(key: StorageKey): Promise<string | null> {
    try {
      if (isWeb) {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.debug(`[SecureStorage] Failed to get ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a stored value
   */
  async delete(key: StorageKey): Promise<boolean> {
    try {
      if (isWeb) {
        localStorage.removeItem(key);
        return true;
      }
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.debug(`[SecureStorage] Failed to delete ${key}:`, error);
      return false;
    }
  }

  /**
   * Store a JSON object
   */
  async setObject<T extends object>(key: StorageKey, value: T): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(value);
      return await this.set(key, jsonString);
    } catch (error) {
      console.error(`[SecureStorage] Failed to set object ${key}:`, error);
      return false;
    }
  }

  /**
   * Retrieve a JSON object
   */
  async getObject<T extends object>(key: StorageKey): Promise<T | null> {
    try {
      const jsonString = await this.get(key);
      if (!jsonString) return null;
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error(`[SecureStorage] Failed to get object ${key}:`, error);
      return null;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: StorageKey): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Clear all zkRune data
   */
  async clearAll(): Promise<boolean> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await Promise.all(keys.map(key => this.delete(key)));
      return true;
    } catch (error) {
      console.error('[SecureStorage] Failed to clear all:', error);
      return false;
    }
  }

  /**
   * Store wallet credentials
   */
  async saveWallet(publicKey: string, secretKey: string): Promise<boolean> {
    const pubResult = await this.set(STORAGE_KEYS.WALLET_PUBLIC_KEY, publicKey);
    const secResult = await this.set(STORAGE_KEYS.WALLET_SECRET, secretKey);
    return pubResult && secResult;
  }

  /**
   * Get stored wallet
   */
  async getWallet(): Promise<{ publicKey: string; secretKey: string } | null> {
    const publicKey = await this.get(STORAGE_KEYS.WALLET_PUBLIC_KEY);
    const secretKey = await this.get(STORAGE_KEYS.WALLET_SECRET);
    
    if (!publicKey || !secretKey) return null;
    return { publicKey, secretKey };
  }

  /**
   * Remove wallet credentials
   */
  async removeWallet(): Promise<boolean> {
    const pubResult = await this.delete(STORAGE_KEYS.WALLET_PUBLIC_KEY);
    const secResult = await this.delete(STORAGE_KEYS.WALLET_SECRET);
    return pubResult && secResult;
  }
}

export const secureStorage = new SecureStorageService();
export default secureStorage;
