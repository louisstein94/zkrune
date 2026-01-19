/**
 * zkRune Mobile - Push Notification Service
 * Handle push notifications for proofs, governance, and alerts
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { secureStorage, STORAGE_KEYS } from './secureStorage';

// Notification channels for Android
export const NOTIFICATION_CHANNELS = {
  PROOFS: 'proofs',
  GOVERNANCE: 'governance',
  TRANSACTIONS: 'transactions',
  ALERTS: 'alerts',
} as const;

export type NotificationChannel = typeof NOTIFICATION_CHANNELS[keyof typeof NOTIFICATION_CHANNELS];

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  channel?: NotificationChannel;
}

export interface NotificationSettings {
  enabled: boolean;
  proofsEnabled: boolean;
  governanceEnabled: boolean;
  transactionsEnabled: boolean;
  alertsEnabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  proofsEnabled: true,
  governanceEnabled: true,
  transactionsEnabled: true,
  alertsEnabled: true,
};

/**
 * Push notification service
 */
class NotificationService {
  private _expoPushToken: string | null = null;
  private _settings: NotificationSettings = DEFAULT_SETTINGS;
  private _isInitialized = false;

  /**
   * Initialize notification service
   */
  async init(): Promise<boolean> {
    if (this._isInitialized) return true;

    try {
      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Load saved settings
      await this._loadSettings();

      // Setup Android channels
      if (Platform.OS === 'android') {
        await this._setupAndroidChannels();
      }

      this._isInitialized = true;
      return true;
    } catch (error) {
      console.error('[Notifications] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Request notification permissions and get push token
   */
  async requestPermissions(): Promise<string | null> {
    try {
      // Check if running on physical device
      if (!Device.isDevice) {
        console.warn('[Notifications] Must use physical device for push notifications');
        return null;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[Notifications] Permission not granted');
        return null;
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Replace with actual Expo project ID
      });

      this._expoPushToken = tokenData.data;
      
      // Update settings
      this._settings.enabled = true;
      await this._saveSettings();

      console.log('[Notifications] Push token:', this._expoPushToken);
      return this._expoPushToken;
    } catch (error) {
      console.error('[Notifications] Failed to get push token:', error);
      return null;
    }
  }

  /**
   * Check if notifications are enabled
   */
  async isEnabled(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted' && this._settings.enabled;
  }

  /**
   * Get current push token
   */
  getPushToken(): string | null {
    return this._expoPushToken;
  }

  /**
   * Get notification settings
   */
  getSettings(): NotificationSettings {
    return { ...this._settings };
  }

  /**
   * Update notification settings
   */
  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    this._settings = { ...this._settings, ...settings };
    await this._saveSettings();
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(
    payload: NotificationPayload,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          ...(Platform.OS === 'android' && payload.channel
            ? { channelId: payload.channel }
            : {}),
        },
        trigger: trigger || null, // null = immediate
      });

      return notificationId;
    } catch (error) {
      console.error('[Notifications] Failed to schedule notification:', error);
      return null;
    }
  }

  /**
   * Send immediate local notification
   */
  async sendLocalNotification(payload: NotificationPayload): Promise<string | null> {
    return this.scheduleLocalNotification(payload, null);
  }

  /**
   * Notify proof generated
   */
  async notifyProofGenerated(proofType: string, proofId: string): Promise<void> {
    if (!this._settings.proofsEnabled) return;

    await this.sendLocalNotification({
      title: '✅ Proof Generated',
      body: `Your ${proofType} proof is ready`,
      data: { type: 'proof_generated', proofId },
      channel: NOTIFICATION_CHANNELS.PROOFS,
    });
  }

  /**
   * Notify proof verified
   */
  async notifyProofVerified(proofId: string): Promise<void> {
    if (!this._settings.proofsEnabled) return;

    await this.sendLocalNotification({
      title: '🔒 Proof Verified',
      body: 'Your zero-knowledge proof has been verified on-chain',
      data: { type: 'proof_verified', proofId },
      channel: NOTIFICATION_CHANNELS.PROOFS,
    });
  }

  /**
   * Notify new governance proposal
   */
  async notifyGovernanceProposal(proposalId: string, title: string): Promise<void> {
    if (!this._settings.governanceEnabled) return;

    await this.sendLocalNotification({
      title: '🗳️ New Proposal',
      body: title,
      data: { type: 'governance_proposal', proposalId },
      channel: NOTIFICATION_CHANNELS.GOVERNANCE,
    });
  }

  /**
   * Notify transaction received
   */
  async notifyTransactionReceived(amount: string, from: string): Promise<void> {
    if (!this._settings.transactionsEnabled) return;

    await this.sendLocalNotification({
      title: '💰 Transaction Received',
      body: `Received ${amount} zkRUNE from ${from}`,
      data: { type: 'transaction_received', from },
      channel: NOTIFICATION_CHANNELS.TRANSACTIONS,
    });
  }

  /**
   * Notify security alert
   */
  async notifySecurityAlert(message: string): Promise<void> {
    if (!this._settings.alertsEnabled) return;

    await this.sendLocalNotification({
      title: '⚠️ Security Alert',
      body: message,
      data: { type: 'security_alert' },
      channel: NOTIFICATION_CHANNELS.ALERTS,
    });
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get delivered notifications
   */
  async getDeliveredNotifications(): Promise<Notifications.Notification[]> {
    return await Notifications.getPresentedNotificationsAsync();
  }

  /**
   * Dismiss all delivered notifications
   */
  async dismissAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Add notification received listener
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  // Private methods

  private async _setupAndroidChannels(): Promise<void> {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.PROOFS, {
      name: 'ZK Proofs',
      description: 'Notifications about proof generation and verification',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8B5CF6',
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.GOVERNANCE, {
      name: 'Governance',
      description: 'Notifications about proposals and voting',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#06B6D4',
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.TRANSACTIONS, {
      name: 'Transactions',
      description: 'Notifications about token transfers',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.ALERTS, {
      name: 'Security Alerts',
      description: 'Important security notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#EF4444',
    });
  }

  private async _loadSettings(): Promise<void> {
    try {
      const saved = await secureStorage.getObject<NotificationSettings>(
        STORAGE_KEYS.USER_PREFERENCES as any
      );
      if (saved) {
        this._settings = { ...DEFAULT_SETTINGS, ...saved };
      }
    } catch {
      this._settings = DEFAULT_SETTINGS;
    }
  }

  private async _saveSettings(): Promise<void> {
    await secureStorage.setObject(
      STORAGE_KEYS.USER_PREFERENCES as any,
      this._settings
    );
  }
}

export const notificationService = new NotificationService();
export default notificationService;
