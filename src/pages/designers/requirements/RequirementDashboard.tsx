import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, XCircle, Eye, Play } from 'lucide-react';
import { RequirementStatus, mockRequirements } from '@/utils/mockData';
import CancelModal from '@/components/CancelModal';
import StatusBadge from '@/components/requirements/StatusBadge';
import PipelineAndFlowViewer from '@/components/PipelineAndFlowViewer';
import { ROUTES } from '@/config/routes';
import { DataTable } from '@/components/bh-table/data-table';
import { ColumnDef } from '@tanstack/react-table';

interface RequirementRow {
  id: string;
  name: string;
  status: RequirementStatus;
  updatedAt: string;
  mappings: any[];
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null);
  const [showPipelineDrawer, setShowPipelineDrawer] = useState(false);

  const data: RequirementRow[] = useMemo(() => 
    mockRequirements.map(req => ({
      id: req.id,
      name: req.name,
      status: req.status,
      updatedAt: req.updatedAt,
      mappings: req.mappings
    })), 
    []
  );

  const columns: ColumnDef<RequirementRow>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: "Requirement Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("status")} />
      ),
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) => (
        <span>{new Date(row.getValue("updatedAt")).toLocaleDateString()}</span>
      ),
    },
    {
      id: "mapped",
      header: "% Mapped",
      cell: ({ row }) => {
        const mappings = row.original.mappings;
        const totalMappings = mappings.length;
        const mapped = mappings.filter((m: any) => !m.needsInput).length;
        const pending = totalMappings - mapped;
        const percent = row.original.status === RequirementStatus.COMPLETED ? 100 : totalMappings === 0 ? 0 : Math.round((mapped / totalMappings) * 100);
        
        return (
          <Badge 
            variant={percent === 100 ? "default" : "secondary"}
            className="cursor-pointer"
            title={`Total: ${totalMappings}\nMapped: ${mapped}\nPending: ${pending}`}
          >
            {percent}%
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(ROUTES.DESIGNERS.REQUIREMENTS.DETAILS(row.original.id))}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          {row.original.status === RequirementStatus.COMPLETED ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowPipelineDrawer(true)}
            >
              <Play className="h-4 w-4 mr-2" />
              View Pipeline
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCancel(row.original.id)}
              className="text-destructive hover:text-destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ], [navigate]);

  const handleCancel = (id: string) => {
    setSelectedRequirement(id);
    setShowCancelModal(true);
  };

  const closeModal = () => {
    setShowCancelModal(false);
    setSelectedRequirement(null);
  };

  const toolbarConfig = {
    buttons: [
      {
        label: (
          <>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Requirement
          </>
        ),
        variant: "default" as const,
        onClick: () => navigate("/designers/requirements/new"),
      }
    ]
  };

  return (
    <>
      <div className="p-6">
        <div className="space-y-6">
          <DataTable 
            data={data}
            columns={columns}
            topVariant="simple"
            toolbarConfig={toolbarConfig}
            pagination={true}
          />
        </div>
        
        <CancelModal open={showCancelModal} onClose={closeModal} requirementId={selectedRequirement} />
      </div>
      <PipelineAndFlowViewer open={showPipelineDrawer} onClose={() => setShowPipelineDrawer(false)} />
    </>
  );
};

export default LandingPage;