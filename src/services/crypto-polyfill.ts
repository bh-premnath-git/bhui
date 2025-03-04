/**
 * Web Crypto API polyfill
 * This polyfill provides a fallback for environments where the Web Crypto API is not available.
 * It uses the crypto-js library which is already installed in the project.
 */

import CryptoJS from 'crypto-js';

// Only apply the polyfill if window.crypto.subtle is not available
if (typeof window !== 'undefined' && (!window.crypto || !window.crypto.subtle)) {
  console.warn('Web Crypto API not available, using polyfill instead');

  // Create a minimal polyfill that covers the basic functionality needed by Keycloak
  const cryptoPolyfill = {
    getRandomValues: (array: Uint8Array) => {
      const words = CryptoJS.lib.WordArray.random(array.length);
      const bytes = words.words;
      
      for (let i = 0; i < array.length; i++) {
        // Use the bytes from WordArray to fill the Uint8Array
        array[i] = ((bytes[Math.floor(i / 4)] >>> ((3 - (i % 4)) * 8)) & 0xff);
      }
      
      return array;
    },
    subtle: {
      // Implement only the digest method which is commonly used by Keycloak
      digest: async (algorithm: string, data: ArrayBuffer) => {
        const dataWords = CryptoJS.lib.WordArray.create(
          new Uint8Array(data)
        );
        
        let hash;
        if (algorithm === 'SHA-256') {
          hash = CryptoJS.SHA256(dataWords);
        } else if (algorithm === 'SHA-1') {
          hash = CryptoJS.SHA1(dataWords);
        } else {
          throw new Error(`Algorithm ${algorithm} not supported by the polyfill`);
        }
        
        // Convert the result to ArrayBuffer
        const hashWords = hash.words;
        const hashBuffer = new ArrayBuffer(hash.sigBytes);
        const hashView = new DataView(hashBuffer);
        
        for (let i = 0; i < hash.sigBytes / 4; i++) {
          hashView.setUint32(i * 4, hashWords[i], false);
        }
        
        return hashBuffer;
      }
    }
  };

  // Apply the polyfill
  if (!window.crypto) {
    // @ts-ignore - we're intentionally adding crypto to window
    window.crypto = cryptoPolyfill;
  } else if (!window.crypto.subtle) {
    // @ts-ignore - we're intentionally adding subtle to window.crypto
    window.crypto.subtle = cryptoPolyfill.subtle;
  }
}

export {};
