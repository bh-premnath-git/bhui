import React from 'react';
import type { TableEvent } from '@/types/streaming';

interface OverviewTabProps {
    explanation?: string | null;
    table?: TableEvent['content'];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ explanation, table }) => {
    return (
        <div>
            <div className="border rounded-lg p-4 bg-muted/20">
                <div className="h-64 w-full border-2 border-dashed border-muted-foreground/20 rounded-md grid place-items-center">
                    <div className="text-sm text-muted-foreground">
                        Chart will render here
                        <span className="block text-xs">Replace this with your Chart component.</span>
                        {table && (
                            <span className="block text-xs mt-1 text-green-600">
                                Table data available: {table.column_names.length} columns, {table.column_values.length} rows
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="text-left text-sm bg-muted/10 rounded-md p-3 mt-4">
                <div className="text-xs text-muted-foreground mb-1">Explanation</div>
                {explanation ? (
                    <p className="text-foreground whitespace-pre-wrap break-words">{explanation}</p>
                ) : (
                    <p className="text-muted-foreground italic">No explanation generated.</p>
                )}
            </div>
        </div>
    );
};