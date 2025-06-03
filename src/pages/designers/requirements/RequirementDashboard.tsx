import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Filter, XCircle } from 'lucide-react';
import { RequirementStatus, mockRequirements } from '@/utils/mockData';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import CancelModal from '@/components/CancelModal';
import StatusBadge from '@/components/requirements/StatusBadge';
import PipelineAndFlowViewer from '@/components/PipelineAndFlowViewer';
import { ROUTES } from '@/config/routes';

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: RequirementStatus.COMPLETED, label: 'Completed' },
  { value: RequirementStatus.IN_PROGRESS, label: 'In Progress' },
  { value: RequirementStatus.PENDING, label: 'Pending User Input' },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>(['all']);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null);
  const [showPipelineDrawer, setShowPipelineDrawer] = useState(false);

  const filteredRequirements = React.useMemo(() => {
    return mockRequirements.filter(req => {
      const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatuses.includes('all') || 
                            selectedStatuses.includes(req.status);
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatuses]);

  const handleStatusChange = (status: string) => {
    if (status === 'all') {
      setSelectedStatuses(['all']);
    } else {
      const newSelected = selectedStatuses.includes(status)
        ? selectedStatuses.filter(s => s !== status)
        : [...selectedStatuses.filter(s => s !== 'all'), status];
      
      setSelectedStatuses(newSelected.length === 0 ? ['all'] : newSelected);
    }
  };

  const handleCancel = (id: string) => {
    setSelectedRequirement(id);
    setShowCancelModal(true);
  };

  const closeModal = () => {
    setShowCancelModal(false);
    setSelectedRequirement(null);
  };

  return (
    <>
      <div className="space-y-8 max-w-7xl mx-auto mt-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Pipeline Requirements</h1>
          <p className="text-muted-foreground">
            Manage and track your data pipeline requirements
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requirements..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {statusFilters.map((filter) => (
                  <DropdownMenuCheckboxItem
                    key={filter.value}
                    checked={selectedStatuses.includes(filter.value)}
                    onCheckedChange={() => handleStatusChange(filter.value)}
                  >
                    {filter.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link to="new">
              <Button className="whitespace-nowrap">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Requirement
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Mapped</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequirements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    No requirements found.
                  </td>
                </tr>
              ) : (
                filteredRequirements.map((req) => {
                  const totalMappings = req.mappings.length;
                  const mapped = req.mappings.filter((m: any) => !m.needsInput).length;
                  const pending = totalMappings - mapped;
                  const percent = req.status === RequirementStatus.COMPLETED ? 100 : totalMappings === 0 ? 0 : Math.round((mapped / totalMappings) * 100);
                  return (
                    <tr key={req.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{req.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={req.status} /></td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(req.updatedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="font-semibold cursor-pointer"
                          title={`Total: ${totalMappings}\nMapped: ${mapped}\nPending: ${pending}`}
                        >
                          {percent}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(ROUTES.DESIGNERS.REQUIREMENTS.DETAILS(req.id))}
                        >
                          View Details
                        </Button>
                        {req.status === RequirementStatus.COMPLETED ? (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setShowPipelineDrawer(true)}
                            >
                              View Pipeline & Flow
                            </Button>
                          </>
                        ) : (
                          <button onClick={() => handleCancel(req.id)} className="inline-flex items-center text-red-600 hover:underline"><XCircle className="w-4 h-4 mr-1" />Cancel</button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <CancelModal open={showCancelModal} onClose={closeModal} requirementId={selectedRequirement} />
      </div>
      <PipelineAndFlowViewer open={showPipelineDrawer} onClose={() => setShowPipelineDrawer(false)} />
    </>
  );
};

export default LandingPage;