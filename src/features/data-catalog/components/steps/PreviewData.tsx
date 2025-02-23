import { useImport } from '@/context/datacatalog/ImportContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const dummyData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Editor' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User' },
];

export function PreviewData() {
  const { setStep } = useImport();

  return (
    <Card className="p-6 w-full max-w-4xl mx-auto animate-fadeIn">
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Preview Data</h3>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(dummyData[0]).map((header) => (
                    <TableHead key={header} className="capitalize">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyData.map((row) => (
                  <TableRow key={row.id}>
                    {Object.values(row).map((value, index) => (
                      <TableCell key={index}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(2)}>
            Back
          </Button>
          <Button onClick={() => alert("Import completed!")}>
            Import Data
          </Button>
        </div>
      </div>
    </Card>
  );
}