import { NextRequest, NextResponse } from 'next/server';

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[c] ?? c;
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const circuit = searchParams.get('circuit') ?? '';
  const theme = searchParams.get('theme') ?? 'dark';

  const safeCircuit = escapeHtml(circuit);
  const safeTheme = theme === 'light' ? 'light' : 'dark';
  const bg = safeTheme === 'dark' ? '#0A0A0F' : '#ffffff';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>zkRune Widget</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: ${bg};
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #zkrune-verify { width: 100%; max-width: 420px; }
    .zkr-loading {
      text-align: center;
      color: ${safeTheme === 'dark' ? '#888' : '#666'};
      padding: 24px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div id="zkrune-verify">
    <div class="zkr-loading">Loading zkRune widget…</div>
  </div>

  <script src="/zkrune-widget.js"><\/script>
  <script>
    (function() {
      var circuit = '${safeCircuit}' || undefined;
      var theme = '${safeTheme}';
      var attempts = 0;

      function tryInit() {
        if (typeof ZkRuneWidget !== 'undefined' && ZkRuneWidget.init) {
          ZkRuneWidget.init({
            container: '#zkrune-verify',
            circuit: circuit,
            theme: theme,
            verifierUrl: '/api/verify-proof',
            circuitBaseUrl: '/circuits',
            buttonLabel: 'Verify with zkRune',
            onResult: function(result) {
              if (window.parent !== window) {
                window.parent.postMessage({ type: 'zkrune-result', verified: result.verified, circuitName: result.circuitName, proofHash: result.proofHash, publicSignals: result.publicSignals, timestamp: result.timestamp }, '*');
              }
            },
            onError: function(error) {
              if (window.parent !== window) {
                window.parent.postMessage({ type: 'zkrune-error', code: error.code, message: error.message }, '*');
              }
            }
          });
        } else if (attempts < 50) {
          attempts++;
          setTimeout(tryInit, 100);
        } else {
          document.getElementById('zkrune-verify').innerHTML =
            '<div class="zkr-loading">Failed to load widget. Please refresh.</div>';
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
      } else {
        tryInit();
      }
    })();
  <\/script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
