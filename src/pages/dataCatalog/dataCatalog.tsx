import React, { useLayoutEffect, useState } from "react";
import { FlexibleTable } from "@/components/Tabel";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { getGitProject } from '@/redux/ProjectSlice';
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { FileQuestion } from "lucide-react";
import { getDataSourceLayout, getdataSourceList, setSelectedDataSource } from "@/redux/CatalogSlice";
import { formatedDate } from "@/Utils/dateFormatter";
import { Paper, Typography, Box, LinearProgress, Tooltip, Drawer, IconButton } from "@mui/material";
import { 
  Database, 
  Users, 
  Clock
} from "lucide-react";
import CloseIcon from '@mui/icons-material/Close';
import CatalogSchema from "./catalogSchema";

// Define types in a separate file for better organization
interface CatalogInter {
  data_src_name: string;
  data_src_desc: string;
  data_src_quality: number;
  data_src_id: number;
  bh_project_id: number;
  data_src_tags: object;
  data_source_metadata: Array<object>[];
  data_src_last_updated: any;
}
interface DataCatalogTableProps {
  catalogList: CatalogInter[];
  loading: boolean;
  error: { message: string } | null;
}

// Define the ColumnConfig type based on what FlexibleTable expects
type ColumnConfig = {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'number' | 'date' | 'badge';
  badgeConfig?: {
    colorMap: Record<string, string>;
  };
  render?: (value: any, rowData: CatalogInter) => React.ReactNode;
};

// Define column configurations outside the component for better performance
const columns: ColumnConfig[] = [
  {
    key: 'data_src_name',
    header: 'Data Source',
    sortable: true,
    filterable: true,
    type: 'text',
    render: (value: string, rowData: CatalogInter) => (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        minWidth: '250px' // Ensure consistent width for this column
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'action.hover',
          borderRadius: 1,
          p: 1
        }}>
          <Database color="green" size={20} />
        </Box>
        <Box>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 500,
              color: 'text.primary',
              mb: 0.5
            }}
          >
            {value || 'Never'}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              maxWidth: '200px'
            }}
          >
            {rowData.data_src_desc || 'No description available'}
          </Typography>
        </Box>
      </Box>
    ),
  },
  {
    key: 'bh_project_name',
    header: 'Project',
    sortable: true,
    filterable: true,
    type: 'text',
  },
  {
    key: 'owner',
    header: 'Owner',
    sortable: true,
    filterable: true,
    type: 'text',
    // render: (value: string | null) => value || 'Jhon',

  },
  {
    key: 'total_customer',
    header: 'Total Consumers',
    sortable: true,
    filterable: true,
    type: 'text',
    render: (value: string) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Users size={16} className="text-gray-500" />
        <Typography>{value || '0'}</Typography>
      </Box>
    ),
  },
  {
    key: 'total_records',
    header: 'Total Records',
    sortable: true,
    filterable: false,
    type: 'text',
    // render: (value: string | null) => value || '125',

  },
  {
    key: 'data_src_quality',
    header: 'Quality',
    sortable: true,
    filterable: true,
    type: 'text',
    render: (value: string) => {
      const qualityScore = parseInt(value, 10);
      const getColor = (score: number) => {
        if (score >= 80) return 'success.main';
        if (score >= 50) return 'warning.main';
        return 'error.main';
      };
      
      return (
        <Tooltip title={`Quality Score: ${qualityScore}%`}>
          <Box sx={{ width: '120px' }}> {/* Fixed width for consistency */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 1 
            }}>
              <Typography 
                variant="body2" 
                sx={{ fontWeight: 500 }}
              >
                {qualityScore}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={qualityScore}
              sx={{ 
                height: 6, 
                borderRadius: 3,
                backgroundColor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  backgroundColor: getColor(qualityScore)
                }
              }}
            />
          </Box>
        </Tooltip>
      );
    },
  },
  {
    key: 'data_src_last_updated',
    header: 'Last Updated',
    sortable: true,
    filterable: false,
    type: 'text',
    render: (value: any) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Clock size={16} className="text-gray-500" />
        <Typography>{formatedDate(value)}</Typography>
      </Box>
    ),
  },
];

const EmptyComponent: React.FC = () => (
  <Paper 
    elevation={0} 
    sx={{ 
      height: 400, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'background.default',
      border: '1px dashed',
      borderColor: 'divider',
      borderRadius: 2,
      m: 2
    }}
  >
    <FileQuestion 
      size={64} 
      className="text-gray-400" 
      style={{ marginBottom: '1.5rem' }} 
    />
    <Typography 
      variant="h5" 
      sx={{ 
        mb: 1, 
        fontWeight: 600,
        color: 'text.primary'
      }}
    >
      No Data Sources Available
    </Typography>
    <Typography 
      variant="body1" 
      sx={{ 
        color: 'text.secondary',
        textAlign: 'center'
      }}
    >
      Start by adding your first data source
    </Typography>
  </Paper>
);

function DataCatalogTable({
  catalogList,
  loading,
  error,
}: DataCatalogTableProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);

  useLayoutEffect(() => {
    dispatch(getGitProject());
    dispatch(getdataSourceList({offset: 0, limit: 1000}));
  }, [dispatch]);

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (error) {
    return <ErrorDisplay message={error.message} />;
  }

  const createNewFn = () => {
    // navigate("/all-projects/new");
  };

  const playRowFn = async (rowData: any) => {
    await dispatch(getDataSourceLayout({ data_src_id: rowData.data_src_id }));
    dispatch(setSelectedDataSource(rowData));
    setSelectedSource(rowData);
    setIsDrawerOpen(true);
  };

  return (
    <Box sx={{ 
      maxWidth: '100%',
      backgroundColor: 'background.default',
      p: 3
    }}>
      
      <Paper 
        elevation={0} 
        sx={{ 
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          '& .MuiTableContainer-root': {
            boxShadow: 'none'
          }
        }}
      >
        
          <FlexibleTable 
            data={catalogList}
            columns={columns}
            itemsPerPageOptions={[10, 25, 50]}
            defaultItemsPerPage={10}
            tableName="Xplore"
            createNewFn={createNewFn}
            playRowFn={playRowFn}
            playRow={true}
            background="bg-black"
          />
        
      </Paper>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '75%',
            minWidth: '900px',
            maxWidth: '1200px',
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
            borderLeft: '1px solid',
            borderColor: 'divider',
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <Box sx={{ height: '100%' }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {selectedSource?.data_src_name}
            </Typography>
            <IconButton 
              onClick={() => setIsDrawerOpen(false)}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'action.hover' 
                } 
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ p: 2, height: 'calc(100% - 64px)', overflow: 'auto' }}>
            <CatalogSchema />
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}

const DataCatalog: React.FC = () => {

  const { dataSourceList, loading, error: apiError } = useAppSelector(
    (state: RootState) => state.catalogApi
  );
 
  const error = apiError ? { message: apiError } : null;

  return (
    <DataCatalogTable
      catalogList={dataSourceList}
      loading={loading}
      error={error}
    />
  );
};

export default DataCatalog;