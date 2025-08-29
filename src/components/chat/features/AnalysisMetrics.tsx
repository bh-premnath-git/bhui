import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { IdentifyEvent, MetaCompletedEvent } from '@/types/streaming';

interface AnalysisMetricsProps {
  identify?: IdentifyEvent['content'][];
  duration_ms?: MetaCompletedEvent['data']['duration_ms'];
  results_summary?: MetaCompletedEvent['data']['results_summary'];
}

export const AnalysisMetrics: React.FC<AnalysisMetricsProps> = ({
  identify,
  duration_ms,
  results_summary
}) => {
  const duration = typeof duration_ms === 'number' ? `${(duration_ms / 1000).toFixed(1)}s` : undefined;
  const tablesGenerated = results_summary?.tables_generated;
  const identifyLabel = identify?.join(', ');
  const identifyPlural = (identify?.length || 0) > 1;

  if (!identifyLabel && !duration && !tablesGenerated) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="text-left text-sm text-muted-foreground">
        {identifyLabel && (
          <>Identified {identifyPlural ? 'sources' : 'source'}: <span className="font-medium text-foreground">{identifyLabel}</span></>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {duration && (
          <Badge variant="secondary" className="rounded-full">
            Thought for: {duration}
          </Badge>
        )}
      </div>
    </div>
  );
};
