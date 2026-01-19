/**
 * zkRune Mobile - useNotifications Hook
 * React hook for push notifications
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { 
  notificationService, 
  NotificationSettings,
  NotificationPayload,
} from '../services/notificationService';

export interface UseNotificationsReturn {
  // State
  isEnabled: boolean;
  isPending: boolean;
  pushToken: string | null;
  settings: NotificationSettings;
  badgeCount: number;
  lastNotification: Notifications.Notification | null;
  
  // Actions
  requestPermissions: () => Promise<boolean>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  sendLocalNotification: (payload: NotificationPayload) => Promise<void>;
  clearBadge: () => Promise<void>;
  dismissAll: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [badgeCount, setBadgeCount] = useState(0);
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);
  
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      await notificationService.init();
      
      const enabled = await notificationService.isEnabled();
      setIsEnabled(enabled);
      
      const token = notificationService.getPushToken();
      setPushToken(token);
      
      const count = await notificationService.getBadgeCount();
      setBadgeCount(count);
      
      setSettings(notificationService.getSettings());
    };

    init();

    // Add notification listeners
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        setLastNotification(notification);
        setBadgeCount(prev => prev + 1);
      }
    );

    responseListener.current = notificationService.addNotificationResponseListener(
      (response) => {
        // Handle notification tap
        const data = response.notification.request.content.data;
        console.log('[useNotifications] Notification tapped:', data);
        // You can navigate based on notification type here
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Request permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setIsPending(true);
    
    try {
      const token = await notificationService.requestPermissions();
      
      if (token) {
        setPushToken(token);
        setIsEnabled(true);
        setSettings(notificationService.getSettings());
        return true;
      }
      
      return false;
    } finally {
      setIsPending(false);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>): Promise<void> => {
    await notificationService.updateSettings(newSettings);
    setSettings(notificationService.getSettings());
    
    if (newSettings.enabled !== undefined) {
      setIsEnabled(newSettings.enabled);
    }
  }, []);

  // Send local notification
  const sendLocalNotification = useCallback(async (payload: NotificationPayload): Promise<void> => {
    await notificationService.sendLocalNotification(payload);
  }, []);

  // Clear badge
  const clearBadge = useCallback(async (): Promise<void> => {
    await notificationService.setBadgeCount(0);
    setBadgeCount(0);
  }, []);

  // Dismiss all notifications
  const dismissAll = useCallback(async (): Promise<void> => {
    await notificationService.dismissAllNotifications();
    await clearBadge();
  }, [clearBadge]);

  return {
    isEnabled,
    isPending,
    pushToken,
    settings,
    badgeCount,
    lastNotification,
    requestPermissions,
    updateSettings,
    sendLocalNotification,
    clearBadge,
    dismissAll,
  };
}

export default useNotifications;
