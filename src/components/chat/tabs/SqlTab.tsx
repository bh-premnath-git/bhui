import React from 'react';
import { SqlBlock } from '@/components/chat/features/SqlBlock';


export const SqlTab: React.FC<{ sql?: string | null }> = ({ sql }) => {
if (sql === undefined) return <div className="text-sm text-muted-foreground italic">SQL not available.</div>;
return <SqlBlock title="SQL" sql={sql ?? '(no SQL generated)'} canCopy={!!sql} />;
};