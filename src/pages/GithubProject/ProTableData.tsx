import { MenuItem } from '@mui/material';
import CustomTable, { generateColumnsFromData } from '../../common/CustomTable';

interface ProTableDataProps {
    data: any[];
    excludeKeys?: string[];
    onEdit?: (index: number) => void;
    onStatusChange?: (index: number) => void;
  }

  const ProTableData: React.FC<ProTableDataProps> = ({ data, excludeKeys = [], onEdit, onStatusChange }) => {
    const columns = generateColumnsFromData(data, excludeKeys);
  
    const menuActions = (row: any, index: number) => [
      onEdit && <MenuItem key={`edit-${index}`} onClick={() => onEdit(index)}>Edit</MenuItem>,
      onStatusChange && (
        <MenuItem key={`status-${index}`} onClick={() => onStatusChange(index)}>
          {row.status === 'active' ? 'Disable' : 'Enable'}
        </MenuItem>
      ),
    ].filter(Boolean);
  
    return <CustomTable columns={columns} data={data} menuActions={menuActions} />;
  };
  
  export default ProTableData;