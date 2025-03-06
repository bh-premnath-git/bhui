import CryptoJS from 'crypto-js';

// More robust check to ensure polyfill is applied
const ensureCryptoPolyfill = () => {
  if (typeof window !== 'undefined') {
    // Create our polyfill implementations
    const getRandomValues = (array: Uint8Array) => {
      const words = CryptoJS.lib.WordArray.random(array.length);
      const bytes = words.words;
      
      for (let i = 0; i < array.length; i++) {
        array[i] = ((bytes[Math.floor(i / 4)] >>> ((3 - (i % 4)) * 8)) & 0xff);
      }
      return array;
    };

    const subtlePolyfill = {
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
        
        const hashWords = hash.words;
        const hashBuffer = new ArrayBuffer(hash.sigBytes);
        const hashView = new DataView(hashBuffer);
        
        for (let i = 0; i < hash.sigBytes / 4; i++) {
          hashView.setUint32(i * 4, hashWords[i], false);
        }
        
        return hashBuffer;
      },
      // Stub implementations for other methods required by Keycloak
      generateKey: async () => Promise.resolve(null),
      encrypt: async () => Promise.resolve(null),
      decrypt: async () => Promise.resolve(null),
      sign: async () => Promise.resolve(null),
      verify: async () => Promise.resolve(null),
      deriveBits: async () => Promise.resolve(null),
      deriveKey: async () => Promise.resolve(null),
      unwrapKey: async () => Promise.resolve(null),
      wrapKey: async () => Promise.resolve(null),
      importKey: async () => Promise.resolve(null),
      exportKey: async () => Promise.resolve(null)
    };

    // Apply polyfill in a safer way
    try {
      if (!window.crypto) {
        console.warn('Web Crypto API not available, polyfill may not work in this browser');
        // Can't directly set window.crypto in modern browsers
      } else {
        // If subtle is missing, we can add it
        if (!window.crypto.subtle) {
          console.warn('Web Crypto subtle API not available, using partial polyfill');
          // Use defineProperty to safely add subtle
          try {
            Object.defineProperty(window.crypto, 'subtle', {
              value: subtlePolyfill,
              writable: false,
              configurable: true
            });
          } catch (e) {
            console.error('Failed to apply subtle polyfill:', e);
          }
        }

        // In insecure context, only polyfill methods (don't try to replace the whole object)
        if (window.isSecureContext === false) {
          console.warn('In insecure context, applying method-level crypto polyfill');
          // Polyfill getRandomValues if it doesn't exist
          if (!window.crypto.getRandomValues) {
            try {
              Object.defineProperty(window.crypto, 'getRandomValues', {
                value: getRandomValues,
                writable: false,
                configurable: true
              });
            } catch (e) {
              console.error('Failed to polyfill getRandomValues:', e);
            }
          }
        }
      }
    } catch (e) {
      console.error('Error applying crypto polyfill:', e);
    }
  }
};

// Execute immediately
ensureCryptoPolyfill();

// Also export to allow explicit call from keycloak.ts
export { ensureCryptoPolyfill };
