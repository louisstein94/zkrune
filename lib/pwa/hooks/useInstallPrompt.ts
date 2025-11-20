/**
 * PWA Install Prompt Hook
 * Handles PWA installation logic across different platforms
 */

'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  promptInstall: () => Promise<void>;
  dismissPrompt: () => void;
}

/**
 * Hook for managing PWA installation
 * Provides platform-specific installation logic
 */
export function useInstallPrompt(): InstallPromptState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      if (typeof window !== 'undefined') {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isIOSStandalone = (window.navigator as any).standalone === true;
        setIsInstalled(isStandalone || isIOSStandalone);
      }
    };

    // Detect platform
    const detectPlatform = () => {
      if (typeof window !== 'undefined') {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        const isAndroidDevice = /android/.test(userAgent);
        
        setIsIOS(isIOSDevice);
        setIsAndroid(isAndroidDevice);
      }
    };

    // Listen for beforeinstallprompt event (Android/Desktop Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    checkInstalled();
    detectPlatform();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Trigger the install prompt (Android/Desktop Chrome)
   */
  const promptInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  /**
   * Dismiss the install prompt
   */
  const dismissPrompt = () => {
    setIsInstallable(false);
    setDeferredPrompt(null);
  };

  return {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    promptInstall,
    dismissPrompt,
  };
}

