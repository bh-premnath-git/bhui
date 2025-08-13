import pako from "pako";

export function decompressValue(base64GzipStr: string | null): any {
    try {
        // check null, undefined, empty string, or not string
        if (!base64GzipStr || typeof base64GzipStr !== 'string' || base64GzipStr.trim() === '') {
            return null;
        }
        const binaryString = atob(base64GzipStr);
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }
        const decompressed = pako.inflate(uint8Array, { to: 'string' });
        // Parse JSON
        return JSON.parse(decompressed);
    } catch (error) {
        console.error('Error decompressing Plotly data:', error);
        return null;
    }
};

export function compressValue(value: any): string {
    try {
        // Convert value to JSON string
        const jsonString = JSON.stringify(value);
        
        // Compress the string using pako - deflate returns a Uint8Array directly
        const uint8Array = pako.deflate(new TextEncoder().encode(jsonString));
        
        // Convert to base64
        let binary = '';
        const bytes = new Uint8Array(uint8Array);
        bytes.forEach(byte => {
            binary += String.fromCharCode(byte);
        });
        
        return btoa(binary);
    } catch (error) {
        console.error('Error compressing data:', error);
        return null;
    }
};