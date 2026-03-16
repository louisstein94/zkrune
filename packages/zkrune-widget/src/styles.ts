export function getStyles(theme: 'dark' | 'light'): string {
  const t = theme === 'dark'
    ? {
        bg: '#0a0a0f', bgOverlay: 'rgba(0,0,0,0.7)', surface: '#111118', surfaceHover: '#1a1a24',
        border: 'rgba(255,255,255,0.1)', borderHover: 'rgba(255,255,255,0.2)',
        text: '#e5e7eb', textMuted: '#9ca3af', textDim: '#6b7280',
        primary: '#6366f1', primaryHover: '#5b5bd6', primaryText: '#fff',
        success: '#34d399', successBg: 'rgba(52,211,153,0.1)',
        error: '#f87171', errorBg: 'rgba(248,113,113,0.1)',
        inputBg: 'rgba(255,255,255,0.05)', inputBorder: 'rgba(255,255,255,0.1)',
        badgeBg: '#6366f1', badgeText: '#fff',
        scrollThumb: '#333',
      }
    : {
        bg: '#ffffff', bgOverlay: 'rgba(0,0,0,0.4)', surface: '#f9fafb', surfaceHover: '#f3f4f6',
        border: 'rgba(0,0,0,0.1)', borderHover: 'rgba(0,0,0,0.2)',
        text: '#111827', textMuted: '#6b7280', textDim: '#9ca3af',
        primary: '#6366f1', primaryHover: '#4f46e5', primaryText: '#fff',
        success: '#059669', successBg: 'rgba(5,150,105,0.1)',
        error: '#dc2626', errorBg: 'rgba(220,38,38,0.1)',
        inputBg: '#fff', inputBorder: 'rgba(0,0,0,0.15)',
        badgeBg: '#6366f1', badgeText: '#fff',
        scrollThumb: '#ccc',
      };

  return `
:host { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

* { box-sizing: border-box; margin: 0; padding: 0; }

.zkr-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border: none; border-radius: 8px;
  background: ${t.badgeBg}; color: ${t.badgeText};
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.zkr-btn:hover { background: ${t.primaryHover}; transform: translateY(-1px); }
.zkr-btn:active { transform: translateY(0); }
.zkr-btn svg { width: 18px; height: 18px; }

.zkr-overlay {
  position: fixed; inset: 0; z-index: 999999;
  background: ${t.bgOverlay}; display: flex; align-items: center; justify-content: center;
  animation: zkr-fadeIn 0.2s ease;
}

.zkr-modal {
  background: ${t.bg}; border: 1px solid ${t.border}; border-radius: 16px;
  width: 90vw; max-width: 480px; max-height: 85vh; overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3);
  animation: zkr-slideUp 0.25s ease;
}
.zkr-modal::-webkit-scrollbar { width: 6px; }
.zkr-modal::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 3px; }

.zkr-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid ${t.border};
}
.zkr-header h2 { font-size: 18px; font-weight: 700; color: ${t.text}; }
.zkr-close {
  width: 32px; height: 32px; border: none; border-radius: 8px;
  background: ${t.surface}; color: ${t.textMuted}; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; transition: background 0.15s;
}
.zkr-close:hover { background: ${t.surfaceHover}; }

.zkr-body { padding: 24px; }

.zkr-circuits {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
.zkr-circuit-card {
  padding: 14px; border: 1px solid ${t.border}; border-radius: 10px;
  background: ${t.surface}; cursor: pointer; transition: all 0.15s;
}
.zkr-circuit-card:hover { border-color: ${t.primary}; background: ${t.surfaceHover}; }
.zkr-circuit-card h4 { font-size: 13px; font-weight: 600; color: ${t.text}; margin-bottom: 4px; }
.zkr-circuit-card p { font-size: 11px; color: ${t.textMuted}; line-height: 1.4; }
.zkr-circuit-card .zkr-cat { font-size: 10px; color: ${t.primary}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }

.zkr-form { display: flex; flex-direction: column; gap: 16px; }
.zkr-field label { display: block; font-size: 13px; font-weight: 500; color: ${t.text}; margin-bottom: 6px; }
.zkr-field .zkr-desc { font-size: 11px; color: ${t.textDim}; margin-bottom: 6px; }
.zkr-field input {
  width: 100%; padding: 10px 12px; border: 1px solid ${t.inputBorder};
  border-radius: 8px; background: ${t.inputBg}; color: ${t.text};
  font-size: 14px; outline: none; transition: border 0.15s;
}
.zkr-field input:focus { border-color: ${t.primary}; }
.zkr-field input::placeholder { color: ${t.textDim}; }

.zkr-errors { padding: 12px; border-radius: 8px; background: ${t.errorBg}; border: 1px solid ${t.error}; }
.zkr-errors p { font-size: 12px; color: ${t.error}; }

.zkr-submit {
  width: 100%; padding: 12px; border: none; border-radius: 10px;
  background: ${t.primary}; color: ${t.primaryText};
  font-size: 15px; font-weight: 600; cursor: pointer;
  transition: background 0.15s;
}
.zkr-submit:hover { background: ${t.primaryHover}; }
.zkr-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.zkr-back {
  background: none; border: none; color: ${t.primary};
  font-size: 13px; cursor: pointer; padding: 0; margin-bottom: 16px;
  display: flex; align-items: center; gap: 4px;
}
.zkr-back:hover { text-decoration: underline; }

.zkr-progress {
  display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 32px 0;
}
.zkr-spinner {
  width: 48px; height: 48px; border: 3px solid ${t.border};
  border-top-color: ${t.primary}; border-radius: 50%;
  animation: zkr-spin 0.8s linear infinite;
}
.zkr-progress-label { font-size: 14px; color: ${t.textMuted}; }

.zkr-result {
  display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 24px 0;
}
.zkr-result-icon { font-size: 48px; }
.zkr-result-title { font-size: 20px; font-weight: 700; color: ${t.text}; }
.zkr-result-sub { font-size: 13px; color: ${t.textMuted}; text-align: center; }
.zkr-result-pass { color: ${t.success}; }
.zkr-result-fail { color: ${t.error}; }

.zkr-result-details {
  width: 100%; padding: 14px; border-radius: 10px;
  background: ${t.surface}; border: 1px solid ${t.border};
  font-size: 12px; color: ${t.textMuted}; word-break: break-all;
}
.zkr-result-details dt { font-weight: 600; color: ${t.text}; margin-top: 8px; }
.zkr-result-details dt:first-child { margin-top: 0; }
.zkr-result-details dd { margin: 2px 0 0; }

.zkr-footer {
  padding: 16px 24px; border-top: 1px solid ${t.border};
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 11px; color: ${t.textDim};
}
.zkr-footer a { color: ${t.primary}; text-decoration: none; }
.zkr-footer a:hover { text-decoration: underline; }

@keyframes zkr-fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes zkr-slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes zkr-spin { to { transform: rotate(360deg); } }
`;
}
