import { useCallback, useState } from 'react';


export function useCopyToClipboard() {
    const [copied, setCopied] = useState<boolean>(false);


    const copy = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
            // hook does not toast by itself to keep SRP; caller may toast
            return true;
        } catch {
            return false;
        }
    }, []);


    return { copied, copy } as const;
}