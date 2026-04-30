// Minimal types for the Telegram WebApp SDK we rely on.
// Loaded by <Script src="https://telegram.org/js/telegram-web-app.js" /> in layout.tsx.

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: { id: number; first_name?: string; username?: string };
    [key: string]: unknown;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  showAlert: (msg: string, cb?: () => void) => void;
  HapticFeedback?: { notificationOccurred: (t: 'error' | 'success' | 'warning') => void };
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  platform: string;
  version: string;
}

interface Window {
  Telegram?: { WebApp: TelegramWebApp };
}
