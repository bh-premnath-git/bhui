import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createShortUUID } from '@/lib/utils';

interface ChatTableViewProps {
  data: any[];
}

export function ChatTableView({ data }: ChatTableViewProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">
          <p>No data available to display</p>
        </div>
      </Card>
    );
  }

  const columns = Object.keys(data[0]);
  
  // Generate stable row IDs once on component mount
  const rowIds = data.map(() => `row-${createShortUUID()}`);

  return (
    <Card className="p-4">
      <ScrollArea className="h-full max-h-[400px] w-full">
        <div className="w-full">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={`header-${column}`} className="text-left truncate" style={{ maxWidth: `${100 / columns.length}%` }}>
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={rowIds[i]}>
                  {columns.map((column) => (
                    <TableCell key={`${rowIds[i]}-${column}`} className="truncate" style={{ maxWidth: `${100 / columns.length}%` }}>
                      <div className="truncate" title={String(row[column])}>
                        {row[column]}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </Card>
  );
}