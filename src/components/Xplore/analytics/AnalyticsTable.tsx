import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AnalyticsTableProps {
  data: any[];
  activeFilter: string | null;
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  formatCurrency: (value: number) => string;
}

export default function AnalyticsTable({
  data,
  activeFilter,
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
  formatCurrency
}: AnalyticsTableProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px] font-bold">Date</TableHead>
              {!activeFilter ? (
                <>
                  <TableHead className="text-right font-bold">Dole</TableHead>
                  <TableHead className="text-right font-bold">Frieda's</TableHead>
                  <TableHead className="text-right font-bold">Goya</TableHead>
                  <TableHead className="text-right font-bold">Chiquita</TableHead>
                </>
              ) : (
                <TableHead className="text-right font-bold">{activeFilter}</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow 
                key={row.date}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-muted/20'}
              >
                <TableCell className="font-medium">{row.date}</TableCell>
                {!activeFilter ? (
                  <>
                    <TableCell className="text-right">{formatCurrency(row.Dole)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row["Frieda's"])}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.Goya)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.Chiquita)}</TableCell>
                  </>
                ) : (
                  <TableCell className="text-right">
                    {formatCurrency(row[activeFilter as keyof typeof row])}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}