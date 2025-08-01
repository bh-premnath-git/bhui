import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TableViewProps {
  data: Record<string, any>[];
}

export const TableView = ({ data }: TableViewProps) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-sm text-muted-foreground p-4">No data to display.</div>;
  }

  const columns = Object.keys(data[0]);

  return (
    <ScrollArea className="h-full w-full">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className="text-xs font-semibold py-2 px-3 capitalize">
                {column.replace(/_/g, ' ')}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, cellIndex) => (
                <TableCell key={cellIndex} className="text-xs py-1 px-3">
                  {row[column]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};