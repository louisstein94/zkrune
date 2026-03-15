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
}

// TextEncoder/TextDecoder polyfill (required for some crypto libs)
if (typeof global.TextEncoder === 'undefined') {
  class TextEncoderPolyfill {
    encode(str) {
      const arr = [];
      for (let i = 0; i < str.length; i++) {
        arr.push(str.charCodeAt(i) & 0xff);
      }
      return new Uint8Array(arr);
    }
  }
  global.TextEncoder = TextEncoderPolyfill;
}

if (typeof global.TextDecoder === 'undefined') {
  class TextDecoderPolyfill {
    decode(arr) {
      if (!arr) return '';
      let result = '';
      for (let i = 0; i < arr.length; i++) {
        result += String.fromCharCode(arr[i]);
      }
      return result;
    }
  }
  global.TextDecoder = TextDecoderPolyfill;
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
