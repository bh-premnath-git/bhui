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

  return (
    <Card className="p-4">
      <ScrollArea className="h-full max-h-[400px] w-full">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column} className="text-left">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                {columns.map((column) => (
                  <TableCell key={column}>{row[column]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}