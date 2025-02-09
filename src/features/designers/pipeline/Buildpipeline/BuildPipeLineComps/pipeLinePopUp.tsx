import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FiFilter } from 'react-icons/fi';
import { IoFilterSharp, IoClose } from 'react-icons/io5';
import { FaSearch } from 'react-icons/fa';
import { DataTable } from '@/components/bh-table/data-table';
import { Terminal } from './LogsPage';
import AddFilterPopUp from './AddFilterPopUp';
import AddSortPopUp from './AddSortPopUp';
import { downloadCSV } from '@/lib/utils';

export default function PipeLinePopUp({ open, handleClose, transformData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [openSort, setOpenSort] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const handleFilterOpen = () => {
    setOpenFilter(true);
  };

  const handleFilterClose = () => {
    setOpenFilter(false);
  };

  const handleSortOpen = () => {
    setOpenSort(true);
  };

  const handleSortClose = () => {
    setOpenSort(false);
  };

  useEffect(() => {
    console.log(transformData);
  }, [transformData]);

  const handleCloseLogs = () => {
    setIsLogsOpen(false);
  };

  // Dynamically generate columns based on transformData keys
  const columns = transformData[0]
    ? Object.keys(transformData[0]).map((key) => ({
        accessorKey: key,
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      }))
    : [];

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl">
        {!isExpanded ? (
          <>
            <DialogHeader>
              <DialogTitle>Test_pipeline 1 (out)</DialogTitle>
              <Button variant="ghost" className="ml-auto" onClick={handleClose}>
                <IoClose />
              </Button>
            </DialogHeader>
            <DialogDescription>
              <div className="flex justify-between mb-4">
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={handleFilterOpen} className="flex items-center space-x-2">
                    <FiFilter size={18} />
                    <span>Filter</span>
                  </Button>
                  <Button variant="outline" onClick={handleSortOpen} className="flex items-center space-x-2">
                    <IoFilterSharp size={18} />
                    <span>Sort</span>
                  </Button>
                </div>
                <Button variant="outline" onClick={() => downloadCSV(transformData)}>
                  Download CSV
                </Button>
              </div>
              <div className="min-w-full">
                <DataTable columns={columns} data={transformData} />
              </div>
            </DialogDescription>
          </>
        ) : (
          <div className="p-4">
            <div className="flex justify-between mb-4">
              <div className="font-semibold">Pipeline Name: Test_pipeline 1 (out)</div>
              <div className="flex space-x-4 items-center">
                <Input
                  placeholder="Search By Keywords"
                  className="h-8"
                  startAdornment={<FaSearch className="mr-2" />}
                />
                <Button variant="outline" onClick={() => downloadCSV(transformData)}>
                  Download CSV
                </Button>
                <Button variant="ghost" onClick={handleClose}>
                  <IoClose />
                </Button>
              </div>
            </div>
            <div className="font-semibold mb-2">Showing All Logs</div>
            <Terminal
              isOpen={isLogsOpen}
              onClose={handleCloseLogs}
              title="Pipeline Logs"
              logs={[
                { timestamp: '2024-03-14 10:30:15', message: 'Pipeline started', level: 'info' },
                { timestamp: '2024-03-14 10:30:16', message: 'Processing node 1', level: 'info' },
                { timestamp: '2024-03-14 10:30:17', message: 'Warning: High memory usage', level: 'warning' },
                { timestamp: '2024-03-14 10:30:18', message: 'Error: Failed to process node 2', level: 'error' },
              ]}
            />
          </div>
        )}
      </DialogContent>

      <AddFilterPopUp handleFilterClose={handleFilterClose} openFilter={openFilter} />
      <AddSortPopUp handleSortClose={handleSortClose} openSort={openSort} />
    </Dialog>
  );
}
