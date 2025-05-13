import { useState, useEffect, useCallback } from "react";
import { DataSource } from "@/types/data-catalog/dataCatalog";

// You can extend this with props like filters or API loader if needed
export function useSourceSelector() {
  const [currentSourceData, setCurrentSourceData] = useState<DataSource | null>(null);
  const [foundSources, setFoundSources] = useState<DataSource[]>([]);
  const [awaitingSourceSelection, setAwaitingSourceSelection] = useState(false);

  const resetSources = useCallback(() => {
    setCurrentSourceData(null);
    setFoundSources([]);
    setAwaitingSourceSelection(false);
  }, []);

  // Optional: Call this when user selects a source
  const selectSource = useCallback((source: DataSource) => {
    setCurrentSourceData(source);
    setAwaitingSourceSelection(false);
  }, []);

  // Optional: Use this to populate source list from API
  const loadSources = useCallback(async (fetcher: () => Promise<DataSource[]>) => {
    try {
      const sources = await fetcher();
      setFoundSources(sources);
      setAwaitingSourceSelection(true);
    } catch (err) {
      console.error("Failed to load sources", err);
    }
  }, []);

  return {
    currentSourceData,
    setCurrentSourceData,
    foundSources,
    setFoundSources,
    awaitingSourceSelection,
    setAwaitingSourceSelection,
    selectSource,
    loadSources,
    resetSources
  };
}
