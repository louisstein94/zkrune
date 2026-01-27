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

// URL polyfill for React Native
if (typeof global.URL === 'undefined') {
  global.URL = require('react-native').Linking;
}

console.log('[Shim] Polyfills loaded successfully');
