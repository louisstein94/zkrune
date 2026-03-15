/**
 * zkRune Mobile - Global Polyfills
 * Must be imported FIRST before any other imports
 */

// Polyfill for crypto.getRandomValues (required for Solana)
import 'react-native-get-random-values';

// Buffer polyfill (required for many crypto operations)
import { Buffer } from 'buffer';
global.Buffer = Buffer;

// Process polyfill (some libraries expect this)
if (typeof global.process === 'undefined') {
  global.process = {
    env: {},
    version: '',
    nextTick: (fn) => setTimeout(fn, 0),
  };
} else {
  if (typeof global.process.version === 'undefined') {
    global.process.version = '';
  }
  if (typeof global.process.env === 'undefined') {
    global.process.env = {};
  }
  if (typeof global.process.nextTick === 'undefined') {
    global.process.nextTick = (fn) => setTimeout(fn, 0);
  }
}

// TextEncoder/TextDecoder polyfill (required for some crypto libs)
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(str) {
      const utf8 = unescape(encodeURIComponent(str));
      const arr = new Uint8Array(utf8.length);
      for (let i = 0; i < utf8.length; i++) {
        arr[i] = utf8.charCodeAt(i);
      }
      return arr;
    }
  };
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    decode(arr) {
      if (!arr) return '';
      const bytes = arr instanceof Uint8Array ? arr : new Uint8Array(arr);
      let str = '';
      for (let i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
      }
      return decodeURIComponent(escape(str));
    }
  };
}

// URL polyfill for React Native (Hermes 0.73+ has native URL support)
if (typeof global.URL === 'undefined') {
  global.URL = class URL {
    constructor(url, base) {
      if (base) {
        url = base.replace(/\/$/, '') + '/' + url.replace(/^\//, '');
      }
      this.href = url;
      const match = url.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);
      this.protocol = (match[2] || '') + ':';
      this.host = match[4] || '';
      this.hostname = (match[4] || '').split(':')[0];
      this.port = (match[4] || '').split(':')[1] || '';
      this.pathname = match[5] || '/';
      this.search = match[6] || '';
      this.hash = match[8] || '';
      this.origin = this.protocol + '//' + this.host;
      this.searchParams = new URLSearchParamsPolyfill(match[7] || '');
    }
    toString() { return this.href; }
  };

  class URLSearchParamsPolyfill {
    constructor(query) {
      this._params = {};
      query.split('&').forEach(pair => {
        if (!pair) return;
        const [key, ...rest] = pair.split('=');
        this._params[decodeURIComponent(key)] = decodeURIComponent(rest.join('='));
      });
    }
    get(key) { return this._params[key] ?? null; }
    has(key) { return key in this._params; }
  }

  if (typeof global.URLSearchParams === 'undefined') {
    global.URLSearchParams = URLSearchParamsPolyfill;
  }
}

console.log('[Shim] Polyfills loaded successfully');
