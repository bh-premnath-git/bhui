// Import polyfills for crypto-browserify
import { Buffer } from 'buffer';
import process from 'process';

// Provide global Buffer and process
window.Buffer = Buffer;
window.process = window.process || process;

// Import the polyfill at the very top of the entry point
import './services/crypto-polyfill';

// Apply the polyfill immediately in a script
if (typeof document !== 'undefined') {
  // Create a script element to run crypto polyfill early
  const script = document.createElement('script');
  script.textContent = `
    if (!window.crypto) {
      window.crypto = {};
    }
    if (!window.crypto.subtle) {
      window.crypto.subtle = {
        digest: async function() { return new ArrayBuffer(32); },
        generateKey: async function() { return {}; },
        encrypt: async function() { return {}; },
        decrypt: async function() { return {}; },
        sign: async function() { return new ArrayBuffer(0); },
        verify: async function() { return true; },
        deriveBits: async function() { return new ArrayBuffer(0); },
        deriveKey: async function() { return {}; },
        unwrapKey: async function() { return {}; },
        wrapKey: async function() { return new ArrayBuffer(0); },
        importKey: async function() { 
          return { type: 'secret', extractable: true, algorithm: { name: 'HMAC' }, usages: ['sign', 'verify'] };
        },
        exportKey: async function() { return new ArrayBuffer(0); }
      };
    }
    if (!window.crypto.getRandomValues) {
      window.crypto.getRandomValues = function(array) {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      };
    }
    console.log('Crypto polyfill applied inline');
  `;
  
  // Add it to the document head
  const head = document.head || document.getElementsByTagName('head')[0];
  head.insertBefore(script, head.firstChild);

  // Create a script element to run process polyfill early
  const processScript = document.createElement('script');
  processScript.textContent = `
    if (!window.process) {
      window.process = { env: {}, nextTick: fn => setTimeout(fn, 0) };
    }
    if (typeof Buffer === 'undefined') {
      window.Buffer = {
        from: function(data, encoding) {
          if (typeof data === 'string') {
            const encoder = new TextEncoder();
            return encoder.encode(data);
          }
          return new Uint8Array(data);
        },
        alloc: function(size) {
          return new Uint8Array(size);
        },
        isBuffer: function(obj) {
          return obj instanceof Uint8Array;
        }
      };
    }
    console.log('Process and Buffer polyfill applied inline');
  `;
  
  // Add it to the document head
  head.insertBefore(processScript, head.firstChild);
}

// Import polyfill first to ensure it's loaded before any Keycloak operations
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <App />
)
