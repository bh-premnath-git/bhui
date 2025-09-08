import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';


export const SqlBlock: React.FC<{ title: string; sql: string; canCopy?: boolean }> = ({ title, sql, canCopy = true }) => {
const { copy } = useCopyToClipboard();
return (
<div className="text-left text-sm bg-muted/30 rounded-md p-3 overflow-auto animate-in fade-in duration-300">
<div className="flex items-center justify-between mb-1">
<div className="text-xs text-muted-foreground">{title}</div>
{canCopy && (
<Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copy(sql)}>
<Copy className="h-4 w-4" />
</Button>
)}
</div>
<pre className="whitespace-pre-wrap break-words text-foreground">{sql}</pre>
</div>
);
};