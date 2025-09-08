import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '@/hooks/useRedux';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Database, Loader2 } from 'lucide-react';
import { setData, setStatus } from '@/store/slices/chat/renderSlice';
import { addMessage } from '@/store/slices/chat/chatSlice';
import { useConnections, useConnectionSearch } from '@/features/admin/connection/hooks/useConnection';
import { Connection } from '@/types/admin/connection';

// Pagination constants
const PAGE_LIMIT = 6;

export const DataExplorerConnectionSelector = () => {
  const dispatch = useAppDispatch();

  /* ----------------------------- Search support ---------------------------- */
  const {
    searchedConnection,
    connectionFound,
    connectionNotFound,
    debounceSearchConnection,
  } = useConnectionSearch();

  /* ----------------------------- Pagination ------------------------------- */
  const [offset, setOffset] = useState(0);
  const { connections: pageConnections, next, isFetching } = useConnections({
    limit: PAGE_LIMIT,
    offset,
    shouldFetch: true,
  });

  // Aggregate pages so we don’t lose previous results on refetch
  const [connectionList, setConnectionList] = useState<Connection[]>([]);

  useEffect(() => {
    if (pageConnections.length) {
      setConnectionList((prev) =>
        offset === 0 ? pageConnections : [...prev, ...pageConnections]
      );
    }
  }, [pageConnections, offset]);

  /* --------------------------- Infinite scroll ---------------------------- */
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const onScroll = () => {
      if (isFetching || !next) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) {
        setOffset((prev) => prev + PAGE_LIMIT);
      }
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [isFetching, next]);

  /* ----------------------------- Selection -------------------------------- */
  const handleConnectionSelect = (connectionId: number | string) => {
    const connection = connectionList.find((c) => c.id === connectionId);
    if (!connection) return;

    dispatch(
      addMessage({
        role: 'assistant',
        content: `Connected to ${connection.connection_config_name}. What would you like to explore in your data?`,
      })
    );

    dispatch(setData({ selectedConnection: connection }));
    dispatch(setStatus('ready'));
  };

  /* --------------------------- Render helpers ----------------------------- */
  const filteredConnections: Connection[] = connectionFound && searchedConnection
    ? [searchedConnection as Connection]
    : connectionNotFound
      ? []
      : connectionList;

  return (
    <div className="h-full flex flex-col items-center justify-start p-3 bg-background overflow-y-auto">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-4">
          <Database className="w-8 h-8 text-primary mx-auto mb-3" />
          <h2 className="text-xl font-semibold mb-1">Select Data Connection</h2>
          <p className="text-muted-foreground">Choose a database connection to start exploring your data</p>
        </div>

        {/* Search field */}
        <Input
          placeholder="Search by connection name…"
          className="mb-4"
          onChange={(e) => debounceSearchConnection(e.target.value)}
        />

        {/* Connection list */}
        <div ref={listRef} className="grid gap-3 mb-4 max-h-[420px] overflow-y-auto pr-1">
          {filteredConnections.map((conn) => (
            <Card key={conn.id} className="p-3 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Database className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{conn.connection_config_name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {conn.connection_name} • status: {conn.connection_status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${conn.connection_status === "active" ? 'bg-success' : 'bg-destructive'
                      }`}
                  />
                  <Button
                    onClick={() => handleConnectionSelect(conn.id!)}
                    disabled={conn.connection_status !== "active"}
                    size="sm"
                    className="px-3 py-1 text-xs"
                  >
                    Select
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {isFetching && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="animate-spin h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {filteredConnections.length === 0 && !isFetching && (
            <p className="text-center text-muted-foreground text-sm">No connections found.</p>
          )}
        </div>
      </div>
    </div>
  );
};