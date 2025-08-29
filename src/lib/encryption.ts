import * as CryptoJS from 'crypto-js';
import {DECRYPTION_KEY} from '@/config/platformenv'

const Config = {
    DECRYPTION_KEY: `${DECRYPTION_KEY}`
};

class AESEncryptionError extends Error {
    context: { [key: string]: string };

    constructor(message: string, context: { [key: string]: string }) {
        super(message);
        this.name = "AESEncryptionError";
        this.context = context;
    }
}

class AESEncryptorService {
    key: CryptoJS.lib.WordArray;
    iv: CryptoJS.lib.WordArray;
    byteTextEncoding: CryptoJS.lib.WordArray;

    constructor(
        key: CryptoJS.lib.WordArray | string,
        iv: CryptoJS.lib.WordArray | string,
        encoding: string = 'utf8'
    ) {
        // Convert string key to WordArray if necessary
        if (typeof key === 'string') {
            key = CryptoJS.enc.Utf8.parse(key);
        }

        // Ensure key is 16, 24, or 32 bytes
        const keySize = key.sigBytes;
        if (keySize !== 16 && keySize !== 24 && keySize !== 32) {
            throw new Error('Invalid key size. Key must be 16, 24, or 32 bytes.');
        }
        this.key = key;

        // Convert string IV to WordArray if necessary
        if (typeof iv === 'string') {
            iv = CryptoJS.enc.Base64.parse(iv); // Parse as Base64
        }
        // Ensure IV is 16 bytes
        if (iv.sigBytes !== 16) {
            throw new Error('Invalid IV size. IV must be 16 bytes.');
        }
        this.iv = iv;

        this.byteTextEncoding = CryptoJS.enc.Utf8.parse(encoding);
    }

    encrypt(plainText: string): { encryptedText: string; iv: string } {
        const cipher = CryptoJS.AES.encrypt(plainText, this.key, {
            iv: this.iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        const encryptedText = cipher.toString(); // Base64 encoded
        return {
            encryptedText,
            iv: CryptoJS.enc.Base64.stringify(this.iv)
        };
    }
    decrypt(b64Text: string): string {
        try {
            const cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: CryptoJS.enc.Base64.parse(b64Text)
            });

            const decrypted = CryptoJS.AES.decrypt(cipherParams, this.key, {
                iv: this.iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            });

            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            throw new AESEncryptionError("Decryption failed", { value: 'Password' });
        }
    }
}

function encrypt_string(
    text: string,
    initVector?: string
): { encryptedString: string; initVector: string } {
    const decryptionKey = Config.DECRYPTION_KEY;

    let ivWordArray;
    if (!initVector) {
        // Generate random IV if not provided
        ivWordArray = CryptoJS.lib.WordArray.random(16); // 16 bytes IV
        initVector = CryptoJS.enc.Base64.stringify(ivWordArray);
    } else {
        ivWordArray = CryptoJS.enc.Base64.parse(initVector);
    }

    const aes = new AESEncryptorService(decryptionKey, ivWordArray);
    const { encryptedText } = aes.encrypt(text);

    return {
        encryptedString: encryptedText,
        initVector,
    };
}

function decrypt_string(
    encryptedString: string,
    initVector: string,
    ignoreEncryption: boolean = false
): string {
    try {
        const decryptionKey = Config.DECRYPTION_KEY;
        const ivWordArray = CryptoJS.enc.Base64.parse(initVector);
        const aes = new AESEncryptorService(decryptionKey, ivWordArray);
        return aes.decrypt(encryptedString);
    } catch (error) {
        if (error instanceof AESEncryptionError && ignoreEncryption) {
            return encryptedString;
        }
        throw error;
    }
}

export { encrypt_string, decrypt_string };

