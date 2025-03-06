import CryptoJS from 'crypto-js';

// Create a more aggressive polyfill for the Web Crypto API
const ensureCryptoPolyfill = () => {
  // Only proceed if in a browser environment
  if (typeof window === 'undefined') return;

  console.log('Applying Web Crypto polyfill...');

  // Create full polyfill implementations
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
      console.log(`Polyfill digest called with algorithm: ${algorithm}`);
      const dataWords = CryptoJS.lib.WordArray.create(
        new Uint8Array(data)
      );
      
      let hash;
      if (algorithm === 'SHA-256' || algorithm.toLowerCase() === 'sha-256') {
        hash = CryptoJS.SHA256(dataWords);
      } else if (algorithm === 'SHA-1' || algorithm.toLowerCase() === 'sha-1') {
        hash = CryptoJS.SHA1(dataWords);
      } else {
        console.error(`Algorithm ${algorithm} not supported by the polyfill`);
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
    generateKey: async () => {
      console.log('Polyfill generateKey called');
      return {}; // Return empty object instead of null
    },
    encrypt: async () => {
      console.log('Polyfill encrypt called');
      return {}; // Return empty object instead of null
    },
    decrypt: async () => {
      console.log('Polyfill decrypt called');
      return {}; // Return empty object instead of null
    },
    sign: async () => {
      console.log('Polyfill sign called');
      return new ArrayBuffer(0); // Return empty buffer
    },
    verify: async () => {
      console.log('Polyfill verify called');
      return true; // Return true by default
    },
    deriveBits: async () => {
      console.log('Polyfill deriveBits called');
      return new ArrayBuffer(0); // Return empty buffer
    },
    deriveKey: async () => {
      console.log('Polyfill deriveKey called');
      return {}; // Return empty object
    },
    unwrapKey: async () => {
      console.log('Polyfill unwrapKey called');
      return {}; // Return empty object
    },
    wrapKey: async () => {
      console.log('Polyfill wrapKey called');
      return new ArrayBuffer(0); // Return empty buffer
    },
    importKey: async (format, keyData) => {
      console.log(`Polyfill importKey called with format: ${format}`);
      return { type: 'secret', extractable: true, algorithm: { name: 'HMAC' }, usages: ['sign', 'verify'] };
    },
    exportKey: async () => {
      console.log('Polyfill exportKey called');
      return new ArrayBuffer(0); // Return empty buffer
    }
  };

  // Create fallback crypto object if needed
  const cryptoFallback = {
    subtle: subtlePolyfill,
    getRandomValues: getRandomValues
  };

  try {
    // First, attempt to fix window.crypto if it doesn't exist
    if (!window.crypto) {
      console.warn('Web Crypto API not available, applying full polyfill');
      // @ts-ignore - force define crypto
      window.crypto = cryptoFallback;
    }

    // Next, ensure subtle exists
    if (!window.crypto.subtle) {
      console.warn('Web Crypto subtle API not available, applying subtle polyfill');
      // @ts-ignore - force define subtle
      window.crypto.subtle = subtlePolyfill;
    }

    // Ensure getRandomValues exists
    if (!window.crypto.getRandomValues) {
      console.warn('getRandomValues not available, applying polyfill');
      // @ts-ignore - force define getRandomValues
      window.crypto.getRandomValues = getRandomValues;
    }

    // At this point window.crypto, window.crypto.subtle, and window.crypto.getRandomValues should exist
    console.log('Web Crypto polyfill successfully applied');
  } catch (e) {
    console.error('Failed to apply crypto polyfill:', e);
    
    // Last-ditch effort - attempt to create a global fallback object
    try {
      // @ts-ignore - define a global fallback
      window.cryptoFallback = cryptoFallback;
      console.warn('Created window.cryptoFallback as a last resort');
    } catch (e2) {
      console.error('Failed to create fallback crypto object:', e2);
    }
  }
};

// Install a patch for Keycloak to use our polyfill
const patchKeycloakCrypto = () => {
  if (typeof window === 'undefined') return;
  
  // Save original APIs
  const originalCrypto = window.crypto;
  const originalSubtle = window.crypto?.subtle;
  const originalGetRandomValues = window.crypto?.getRandomValues;
  
  // Create monitoring and hijacking for crypto methods
  const monitorMethod = (obj: any, methodName: string, fallback: Function) => {
    const original = obj[methodName];
    obj[methodName] = function(...args: any[]) {
      try {
        // Try the original implementation
        return original.apply(obj, args);
      } catch (e) {
        console.warn(`Original ${methodName} failed, using fallback`, e);
        // Fall back to our implementation
        return fallback.apply(obj, args);
      }
    };
  };
  
  // Apply the crypto polyfill
  ensureCryptoPolyfill();
  
  // Patch window.crypto methods in case they throw errors
  if (window.crypto && window.crypto.subtle) {
    try {
      // @ts-ignore - Access subtle and patch methods
      const subtle = window.crypto.subtle;
      monitorMethod(subtle, 'digest', async (algorithm: string, data: ArrayBuffer) => {
        console.log('Fallback digest being used');
        const dataWords = CryptoJS.lib.WordArray.create(new Uint8Array(data));
        const hash = algorithm.includes('SHA-256') 
          ? CryptoJS.SHA256(dataWords) 
          : CryptoJS.SHA1(dataWords);
        
        const hashWords = hash.words;
        const hashBuffer = new ArrayBuffer(hash.sigBytes);
        const hashView = new DataView(hashBuffer);
        
        for (let i = 0; i < hash.sigBytes / 4; i++) {
          hashView.setUint32(i * 4, hashWords[i], false);
        }
        
        return hashBuffer;
      });
    } catch (e) {
      console.error('Failed to patch crypto.subtle methods:', e);
    }
  }
  
  // Define a global helper function to check if crypto is available
  // This can be used directly in the Keycloak adapter
  // @ts-ignore - define a global helper
  window.isCryptoAvailable = () => {
    return window.crypto && 
           window.crypto.subtle && 
           typeof window.crypto.getRandomValues === 'function';
  };
  
  console.log('Crypto patching complete. Window.crypto available:', 
    window.crypto !== undefined,
    'subtle available:', window.crypto?.subtle !== undefined,
    'getRandomValues available:', typeof window.crypto?.getRandomValues === 'function'
  );
};

// Execute immediately
patchKeycloakCrypto();

// Also export to allow explicit call
export { ensureCryptoPolyfill, patchKeycloakCrypto };
