import React, { useState } from 'react';
import { FlexibleTable } from '../Tabel';
import { useNavigate } from 'react-router-dom';
import { Chip } from '@mui/material';
import { Info, AlertTriangle, AlertCircle } from 'lucide-react'
import { Button } from '@mui/material';
import { AddAlert, PersonAddAlt } from '@mui/icons-material'; 
import { Card } from '../ui/card';
import { ErrorDisplay } from "@/components/ui/error-display";
import { Spinner } from '../ui/spinner';
import AssignUserDialog from './AlertDialog';
import ResolutionReason from './AlertReason';

interface AlertTable {
  alert_id: string;
  alert_description: string;
  alter_status: string;
  flow_name: string;
  project_name: string;
  assigned_to: string | null;
  resolution_reason: { preventionPlan: string; correctionPlan: string } | null;
  created_by: string;
  updated_by: string;
  created_on: string;
  updated_on: string;
  monitor: {
    monitor_type: string;
  };
}

interface AlertTableDtlProps {
  jobDetailList: AlertTable[];
  loading?: boolean;
  error?: { message: string } | null;
}

type ColumnConfig = {
  key: keyof AlertTable | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'number' | 'date' | 'badge';
  badgeConfig?: {
    colorMap: Record<string, string>;
  };
  render?: (value: any, rowData: AlertTable) => React.ReactNode;
  align?: "left" | "center" | "right";
}

const columns: ColumnConfig[] = [
  {
    key: 'flow_name',
    header: 'Flow Name',
    type: 'text',
    sortable: true,
    filterable: true,
  },
  {
    key: 'project_name',
    header: 'Project Name',
    type: 'text',
    sortable: true,
    filterable: true,
  },
  {
    key: 'monitor.monitor_type',
    header: 'Monitor Type',
    type: 'text',
    sortable: true,
    render: (value, rowData) => {
      const type = rowData.monitor.monitor_type.toLowerCase()
      return (
        <div className="flex items-center gap-2">
          {type === 'information' ? (
            <Info className="w-4 h-4 text-blue-500" />
          ) : type === 'action' ? (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          ) : null}
          <span className={`${
            type === 'information' ? 'text-blue-500' : 
            type === 'action' ? 'text-red-500' : ''
          }`}>
            {rowData.monitor.monitor_type}
          </span>
        </div>
      )
    },
  },
  {
    key: 'alert_description',
    header: 'Alert Description',
    type: 'text',
    filterable: true,
    sortable: false,
    render: (value) => {
      const words = value.replace(/[_-]/g, ' ').split(' ');
      
      return words.map((word, index) => 
        index === 0 ? 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : 
          word.toLowerCase()
      ).join(' ');
    }
  },
  {
    key: 'alter_status',
    header: 'Alert Status',
    type: 'badge',
    sortable: true,
    badgeConfig: {
      colorMap: {
        'open': 'error',
        'closed': 'success',
        'in_progress': 'warning',
      }
    },
    render: (value) => (
      <Chip 
        label={value} 
        color={value === 'open' ? 'success' : value === 'closed' ? 'error' : 'warning'} 
        size="small" 
      />
    ),
  },
  {
    key: 'assigned_to',
    header: 'Assigned To',
    type: 'text',
    sortable: true,
    render: (value, rowData) => {
      const [isDialogOpen, setIsDialogOpen] = useState(false);

      const handleAssign = async (username: string) => {
        try {
          console.log(`Assigning user ${username} to alert ${rowData.alert_id}`);
        } catch (error) {
          console.error('Error after assigning user:', error);
        }
      };

      if (rowData.monitor.monitor_type.toLowerCase() === 'information') {
        return <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>N/A</span>;
      }

      if (value && value !== 'null') {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{value}</span>
            <Button
              variant="text"
              size="small"
              style={{ minWidth: '32px', padding: '4px' }}
              onClick={() => setIsDialogOpen(true)}
            >
              <PersonAddAlt style={{ color: 'black', fontSize: '20px' }} />
            </Button>
            <AssignUserDialog
              open={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              onAssign={handleAssign}
              alertId={rowData.alert_id}
              currentAssignee={value}
            />
          </div>
        );
      }

      return (
        <>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PersonAddAlt style={{ color: 'black' }} />}
            style={{ borderColor: 'black', color: 'black' }}
            onClick={() => setIsDialogOpen(true)}
          >
            Assign
          </Button>
          <AssignUserDialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onAssign={handleAssign}
            alertId={rowData.alert_id}
          />
        </>
      );
    },
  },
  {
    key: 'resolution_reason',
    header: 'Resolution Reason',
    type: 'text',
    sortable: true,
    render: (value, rowData) => {
      const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
      const handleAssign = ({ preventionPlan, correctionPlan }) => {
        console.log(`Alert ID: ${rowData.alert_id}, Prevention Plan: ${preventionPlan}, Correction Plan: ${correctionPlan}`);
      };
  
      if (rowData.monitor.monitor_type.toLowerCase() === 'information') {
        return <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>N/A</span>;
      }
      
      if (!value) {
        return (
          <>
            <Button
              variant="outlined"
              size="small"
              style={{ borderColor: 'black', color: 'black' }}
              onClick={() => setIsDialogOpen(true)}
            >
              Add Reason
            </Button>
            <ResolutionReason
              open={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              onAssign={handleAssign}
              alertId={rowData.alert_id}
            />
          </>
        );
      }

      // If value exists, display it
      return (
        <div>
          <Button
            variant="text"
            size="small"
            style={{ minWidth: '32px', padding: '4px' }}
            onClick={() => setIsDialogOpen(true)}
          >
            Edit
          </Button>
          <ResolutionReason
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onAssign={handleAssign}
            alertId={rowData.alert_id}
            initialValues={value}
          />
        </div>
      );
    },
  },
  {
    key: 'created_on',
    header: 'Created On',
    type: 'date',
    sortable: true,
    render: (value) => new Date(value).toLocaleString(),
  },
];

const EmptyComponent = () => {
  return (
    <Card className="relative overflow-hidden w-full max-w-2xl mx-auto mt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-gradient/5 via-primary/2 to-background" />
      <div className="relative p-8 sm:p-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          <div className="relative inline-flex mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/0 blur-2xl" />
            <div className="relative bg-gradient-to-br from-background to-muted p-4 rounded-2xl border border-gradient/10">
              <AlertCircle className="w-12 h-12 text-gradient" />
            </div>
          </div>

          <h2 className="text-3xl font-bold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome to Your Monitor
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Ready to monitor the flow when the job is started
          </p>
        </div>
      </div>
    </Card>
  );
};

const AlertTableDtl: React.FC<AlertTableDtlProps> = ({ jobDetailList, loading, error }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container p-0">
        <ErrorDisplay message={''} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {(!jobDetailList || jobDetailList.length === 0) ? (
        <EmptyComponent />
      ) : (
        <FlexibleTable
          data={jobDetailList}
          columns={columns}
          itemsPerPageOptions={[5, 10, 20]}
          defaultItemsPerPage={10}
          isAction={false}
        />
      )}
    </div>
  );
}

export default AlertTableDtl;

