import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface TableViewProps {
  data: Record<string, any>[] | null | undefined;
}

export const TableView = ({ data }: TableViewProps) => {
  // Handle null or undefined data
  if (!data) {
    return <div className="text-center text-sm text-muted-foreground p-4">No data to display.</div>;
  }

  // Handle error cases - check if data contains error objects
  if (Array.isArray(data) && data.length > 0 && data[0]?.error) {
    return (
      <Alert variant="destructive" className="m-2">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Query Error</AlertTitle>
        <AlertDescription className="text-xs whitespace-pre-wrap max-h-32 overflow-auto">
          {data[0].error}
        </AlertDescription>
      </Alert>
    );
  }

  // Handle empty array
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-center text-sm text-muted-foreground p-4">No data to display.</div>;
  }

  // Handle case where first row doesn't have valid columns
  const firstRow = data[0];
  if (!firstRow || typeof firstRow !== 'object') {
    return <div className="text-center text-sm text-muted-foreground p-4">Invalid data format.</div>;
  }

  const columns = Object.keys(firstRow);
  
  // Handle case where there are no columns
  if (columns.length === 0) {
    return <div className="text-center text-sm text-muted-foreground p-4">No columns to display.</div>;
  }

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
                  {row[column] ?? ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};