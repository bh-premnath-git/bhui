import CryptoJS from 'crypto-js';

// More robust check to ensure polyfill is applied
const ensureCryptoPolyfill = () => {
  if (typeof window !== 'undefined') {
    const cryptoPolyfill = {
      getRandomValues: (array: Uint8Array) => {
        const words = CryptoJS.lib.WordArray.random(array.length);
        const bytes = words.words;
        
        for (let i = 0; i < array.length; i++) {
          array[i] = ((bytes[Math.floor(i / 4)] >>> ((3 - (i % 4)) * 8)) & 0xff);
        }
        return array;
      },
      subtle: {
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
        // Adding other required methods used by Keycloak
        generateKey: async () => {
          throw new Error("generateKey not implemented in polyfill");
        },
        encrypt: async () => {
          throw new Error("encrypt not implemented in polyfill");
        },
        decrypt: async () => {
          throw new Error("decrypt not implemented in polyfill");
        },
        sign: async () => {
          throw new Error("sign not implemented in polyfill");
        },
        verify: async () => {
          throw new Error("verify not implemented in polyfill");
        },
        deriveBits: async () => {
          throw new Error("deriveBits not implemented in polyfill");
        },
        deriveKey: async () => {
          throw new Error("deriveKey not implemented in polyfill");
        },
        unwrapKey: async () => {
          throw new Error("unwrapKey not implemented in polyfill");
        },
        wrapKey: async () => {
          throw new Error("wrapKey not implemented in polyfill");
        },
        importKey: async () => {
          throw new Error("importKey not implemented in polyfill");
        },
        exportKey: async () => {
          throw new Error("exportKey not implemented in polyfill");
        }
      }
    };

    // Apply the polyfill
    if (!window.crypto) {
      console.warn('Web Crypto API not available, using full polyfill');
      // @ts-ignore - we're intentionally adding crypto to window
      window.crypto = cryptoPolyfill;
    } else if (!window.crypto.subtle) {
      console.warn('Web Crypto subtle API not available, using partial polyfill');
      // @ts-ignore - we're intentionally adding subtle to window.crypto
      window.crypto.subtle = cryptoPolyfill.subtle;
    } else {
      // Check if we're in a secure context
      if (window.isSecureContext === false) {
        console.warn('In insecure context, applying crypto polyfill as a precaution');
        // @ts-ignore - overriding for insecure context
        window.crypto = cryptoPolyfill;
      }
    }
  }
};

// Execute immediately
ensureCryptoPolyfill();

// Also export to allow explicit call from keycloak.ts
export { ensureCryptoPolyfill };
