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
  const selectedBrands = activeFilter ? activeFilter.split(',') : ["Dole", "Frieda's", "Goya", "Chiquita"];

  return (
    <Card>
      <CardContent className="p-6">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px] font-bold">Date</TableHead>
              {selectedBrands.map((brand) => (
                <TableHead key={brand} className="text-right font-bold">{brand}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow 
                key={row.date}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-muted/20'}
              >
                <TableCell className="font-medium">{row.date}</TableCell>
                {selectedBrands.map((brand) => (
                  <TableCell key={brand} className="text-right">
                    {formatCurrency(row[brand] || 0)}
                  </TableCell>
                ))}
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