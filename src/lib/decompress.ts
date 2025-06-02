import pako from "pako";

/**
 * Decompresses a Base64-encoded, GZIP-compressed string into UTF-8 text in the browser.
 *
 * @param base64GzipStr  The input Base64(GZIP) string.
 * @returns              The decompressed UTF-8 string.
 */
export function decompressValue(base64GzipStr: string): string {
    try {
        // check null and not string
        if (!base64GzipStr && typeof base64GzipStr !== 'string') {
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
