// Use a window-level polyfill approach for complete module compatibility
const setupCryptoPolyfill = () => {
  if (typeof window === 'undefined') return;

  // Polyfill CommonJS globals for crypto-browserify
  if (typeof window.exports === 'undefined') {
    // @ts-ignore - intentionally adding exports
    window.exports = {};
  }
  
  if (typeof window.module === 'undefined') {
    // @ts-ignore - intentionally adding module
    window.module = { exports: window.exports };
  }
  
  if (typeof window.require === 'undefined') {
    // @ts-ignore - intentionally adding require
    window.require = function(modulePath: string) {
      // Basic implementation to handle common modules
      if (modulePath === 'crypto') return window.crypto;
      return {};
    };
  }

  console.log('Checking crypto availability...');
  
  try {
    // Import crypto-browserify dynamically to avoid direct reference
    import('crypto-browserify').then(cryptoBrowserify => {
      // Check if window.crypto is available
      if (!window.crypto || !window.crypto.subtle) {
        console.log('Web Crypto API not fully available, applying crypto-browserify shim');
        
        // Create a minimal Web Crypto API adapter using crypto-browserify
        const cryptoShim = {
          getRandomValues: (array: Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array) => {
            const bytes = cryptoBrowserify.randomBytes(array.length);
            for (let i = 0; i < array.length; i++) {
              array[i] = bytes[i];
            }
            return array;
          },
          
          subtle: {
            digest: async (algorithm: string | { name: string }, data: ArrayBuffer) => {
              // Handle different algorithm parameter formats
              let algo: string;
              if (typeof algorithm === 'string') {
                algo = algorithm.toLowerCase().replace('-', '');
              } else if (algorithm && typeof algorithm === 'object' && 'name' in algorithm) {
                algo = algorithm.name.toLowerCase().replace('-', '');
              } else {
                console.error('Invalid algorithm parameter:', algorithm);
                algo = 'sha256'; // Default to SHA-256
              }
                
              const hash = cryptoBrowserify.createHash(algo);
              hash.update(new Uint8Array(data));
              
              return new Uint8Array(hash.digest()).buffer;
            },
            
            // Default implementations for other methods Keycloak might use
            generateKey: async () => ({}),
            encrypt: async () => ({}),
            decrypt: async () => ({}),
            sign: async () => new ArrayBuffer(0),
            verify: async () => true,
            deriveBits: async () => new ArrayBuffer(0),
            deriveKey: async () => ({}),
            unwrapKey: async () => ({}),
            wrapKey: async () => new ArrayBuffer(0),
            importKey: async () => ({ 
              type: 'secret', 
              extractable: true, 
              algorithm: { name: 'HMAC' }, 
              usages: ['sign', 'verify'] 
            }),
            exportKey: async () => new ArrayBuffer(0)
          }
        };
        
        // Apply the shim if needed
        if (!window.crypto) {
          // @ts-ignore - we're intentionally adding crypto
          window.crypto = cryptoShim;
          console.log('Added window.crypto shim using crypto-browserify');
        } else if (!window.crypto.subtle) {
          // @ts-ignore - we're intentionally adding subtle
          window.crypto.subtle = cryptoShim.subtle;
          console.log('Added window.crypto.subtle shim using crypto-browserify');
        } else if (!window.crypto.getRandomValues) {
          // @ts-ignore - we're intentionally adding getRandomValues
          window.crypto.getRandomValues = cryptoShim.getRandomValues;
          console.log('Added window.crypto.getRandomValues shim using crypto-browserify');
        }
        
        console.log('Crypto shim successfully applied');
      } else {
        console.log('Web Crypto API is available, no shim needed');
      }
    }).catch(err => {
      console.error('Failed to import crypto-browserify:', err);
    });
  } catch (e) {
    console.error('Error setting up crypto polyfill:', e);
  }
};

/**
 * Function to patch Keycloak's crypto functionality
 * Mostly used for monitoring and hijacking crypto methods to prevent errors
 */
const patchKeycloakCrypto = () => {
  if (typeof window === 'undefined') return;
  
  // Helper to monitor and wrap methods for better error handling
  const monitorMethod = <T extends object, K extends keyof T>(
    obj: T, 
    methodName: K, 
    fallbackFn?: (...args: any[]) => any
  ) => {
    const originalMethod = obj[methodName];
    
    if (typeof originalMethod === 'function') {
      // @ts-ignore - need to override with monitored version
      obj[methodName] = function(...args: any[]) {
        try {
          const result = originalMethod.apply(this, args);
          return result;
        } catch (error) {
          console.error(`Error in ${String(methodName)}:`, error);
          if (fallbackFn) {
            console.log(`Using fallback for ${String(methodName)}`);
            return fallbackFn(...args);
          }
          throw error;
        }
      };
    }
  };
  
  // Patch window.crypto methods in case they throw errors
  if (window.crypto && window.crypto.subtle) {
    try {
      const subtle = window.crypto.subtle;
      monitorMethod(subtle, 'digest', async (algorithm: any, data: ArrayBuffer) => {
      const cryptoBrowserify = await import('crypto-browserify');
        let algo: string;
        if (typeof algorithm === 'string') {
          algo = algorithm.toLowerCase().replace('-', '');
        } else if (algorithm && typeof algorithm === 'object' && 'name' in algorithm) {
          algo = algorithm.name.toLowerCase().replace('-', '');
        } else {
          console.error('Invalid algorithm parameter:', algorithm);
          algo = 'sha256'; // Default to SHA-256
        }
        
        const hash = cryptoBrowserify.createHash(algo);
        hash.update(new Uint8Array(data));
        
        return new Uint8Array(hash.digest()).buffer;
      });
    } catch (e) {
      console.error('Failed to patch crypto.subtle methods:', e);
    }
  }
  
  // Also patch window.crypto.getRandomValues if needed
  if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
    monitorMethod(window.crypto, 'getRandomValues', async (array) => {
      console.log('Fallback getRandomValues being used');
      const cryptoBrowserify = await import('crypto-browserify');
      const bytes = cryptoBrowserify.randomBytes(array.length);
      for (let i = 0; i < array.length; i++) {
        array[i] = bytes[i];
      }
      return array;
    });
  }
};

setupCryptoPolyfill();
setTimeout(patchKeycloakCrypto, 100);

export { setupCryptoPolyfill as applyCryptoShim, patchKeycloakCrypto };
