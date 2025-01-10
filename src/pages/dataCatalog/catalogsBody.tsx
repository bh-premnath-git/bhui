import React, {
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import {
  Stack,
  Typography,
  Paper,
  TableContainer,
  TextField,
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FlexibleTable } from '@/components/Tabel';
import About from '@/components/Catalog/About';
import { ApiService } from '@/services/apiServices';
import { Plus, X } from 'lucide-react';

/**
 * 1) Define Interfaces for clarity and type-safety
 */
interface FieldData {
  field_id: number;
  field_name: string;
  description: string;
  tags: string[];
  isEditing?: {
    field_name?: boolean;
    description?: boolean;
    tags?: boolean;
  };
}

interface PassValueItem {
  name: string;
  data_type: number;
  description: string;
}

interface CodeType {
  id: number;
  codes_hdr_id: number;
  dtl_desc: string;
  dtl_id_filter: number;
}

interface EditableFieldProps {
  value: string;
  isEditing: boolean | undefined;
  onStartEdit: () => void;
  onSaveEdit: (newValue: string) => void;
  fieldKey: string;
}

interface TagManagerProps {
  tags: string[];
  isEditing: boolean | undefined;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onStartEdit: () => void;
}

interface CatalogsBodyProps {
  selectedSource: SelectedSource; // Defined interface
}

interface SelectedSource {
  data_src_name: string;
  // Add other relevant properties if necessary
}

/**
 * 2) EditableField Sub-component
 */
const EditableField: React.FC<EditableFieldProps> = ({
  value,
  isEditing,
  onStartEdit,
  onSaveEdit,
  fieldKey,
}) => {
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onSaveEdit(e.target.value);
    },
    [onSaveEdit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // Press Enter to commit changes (unless SHIFT+Enter on 'description').
      if (e.key === 'Enter' && (fieldKey !== 'description' || !e.shiftKey)) {
        e.preventDefault();
        onSaveEdit(e.currentTarget.value);
      }
    },
    [fieldKey, onSaveEdit]
  );

  if (!isEditing) {
    return (
      <Typography
        onClick={onStartEdit}
        sx={{
          cursor: 'pointer',
          p: 0.5,
          borderRadius: 1,
          '&:hover': {
            backgroundColor: 'action.hover',
            color: 'green'
          }
        }}
      >
        {value}
      </Typography>
    );
  }

  return (
    <TextField
      size="small"
      defaultValue={value}
      autoFocus
      variant="standard"
      multiline={fieldKey === 'description'}
      onBlur={handleBlur}
      inputProps={{
        onKeyDown: handleKeyDown
      }}
      sx={{
        '& .MuiInputBase-root': {
          fontSize: '0.875rem',
          '&:before, &:after': {
            borderBottom: '2px solid',
            borderColor: 'green'
          }
        }
      }}
    />
  );
};

/**
 * 3) TagManager Sub-component
 */
const TagManager: React.FC<TagManagerProps> = ({
  tags,
  isEditing,
  onAddTag,
  onRemoveTag,
  onStartEdit
}) => {
  const [newTag, setNewTag] = useState('');

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && newTag.trim() !== '') {
        onAddTag(newTag.trim());
        setNewTag('');
      } else if (e.key === 'Escape') {
        onStartEdit();
      }
    },
    [newTag, onAddTag, onStartEdit]
  );

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
      {tags.map((tag, index) => (
        <Chip
          key={index}
          label={tag}
          size="small"
          onDelete={() => onRemoveTag(tag)}
          sx={{
            borderRadius: '4px',
            backgroundColor: 'primary.lighter', // Restored to original
            color: '#20405f',
            height: '24px',
            fontSize: '0.75rem',
            '& .MuiChip-deleteIcon:hover': { color: 'error.main' }
          }}
        />
      ))}

      {isEditing ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            value={newTag}
            placeholder="Add tag"
            variant="standard"
            onChange={(e) => setNewTag(e.target.value)}
            inputProps={{
              onKeyDown: handleTagKeyDown
            }}
            sx={{
              width: '100px',
              '& .MuiInputBase-root': {
                fontSize: '0.875rem',
                '&:before, &:after': {
                  borderBottom: '2px solid',
                  borderColor: 'green'
                }
              }
            }}
          />
          <IconButton size="small" onClick={onStartEdit}>
            <X size={16} />
          </IconButton>
        </Stack>
      ) : (
        <IconButton size="small" onClick={onStartEdit}>
          <Plus size={16} />
        </IconButton>
      )}
    </Stack>
  );
};

/**
 * 4) Main CatalogsBody Component
 */
const CatalogsBody: React.FC<CatalogsBodyProps> = ({ selectedSource }) => {
  const { layoutList } = useSelector((state: RootState) => state.catalogApi);
  const [fields, setFields] = useState<FieldData[]>([]);
  const [types, setTypes] = useState<CodeType[]>([]);
  const [passValues, setPassValues] = useState<PassValueItem[]>([]);
  const [loadingDescriptions, setLoadingDescriptions] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch and map data from layoutList
  const dataSourceLayout = useCallback(async (): Promise<FieldData[]> => {
    if (!layoutList || layoutList.length === 0) {
      console.warn('layoutList is empty or undefined.');
      return [];
    }

    try {
      const result = layoutList[0].layout_fields;

      // Create a minimal array for passValues
      const resultantVal = result.map((item: any) => ({
        name: item.lyt_fld_name,
        data_type: item.lyt_fld_data_type_cd,
        description: item.lyt_fld_desc
      }));
      setPassValues(resultantVal);

      // Return the array for fields
      return result.map((item: any) => ({
        field_id: item.lyt_fld_id,
        field_name: item.lyt_fld_name,
        description: item.lyt_fld_desc,
        tags: Object.values(item.lyt_fld_tags),
        isEditing: {}
      }));
    } catch (error) {
      console.error('Unable to get the data', error);
      return [];
    }
  }, [layoutList]);

  // Load fields and types on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Get data types
        const { codes_dtl } = await ApiService('8011', 'get', '/codes_hdr/13');
        setTypes(codes_dtl);

        // 2) Get fields from layout
        const fetchedFields = await dataSourceLayout();
        setFields(fetchedFields);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load initial data.');
      }
    };
    fetchData();
  }, [dataSourceLayout]);

  // Transform passValues -> passValuesWithDesc
  const passValuesWithDesc = useMemo(() => {
    return passValues.map((item) => {
      const matchedType = types.find((t) => t.id === item.data_type);
      return {
        ...item,
        data_type: matchedType ? matchedType.dtl_desc : 'Unknown'
      };
    });
  }, [passValues, types]);

  // Fetch new descriptions based on selectedSource and passValuesWithDesc
  useEffect(() => {
    const fetchDescriptions = async () => {
      if (!selectedSource || passValuesWithDesc.length === 0) return;

      setLoadingDescriptions(true);
      setError(null);

      const body = {
        operation_type: 'column_description',
        thread_id: 'desc_123',
        params: {
          source_name: selectedSource.data_src_name,
          columns: passValuesWithDesc,
        },
      };

      try {
        const dresponse = await ApiService(
          '8090',
          'post',
          '/pipeline_agent/generate',
          body
        );
        const descriptionResponse = (JSON.parse(dresponse.result)).descriptions
        if (Array.isArray(descriptionResponse)) {
          setFields((prevFields) =>
            prevFields.map((field, index) => ({
              ...field,
              description: descriptionResponse[index]?.description || field.description
            }))
          );
        } else if (typeof descriptionResponse === 'object' && descriptionResponse !== null) {
          setFields((prevFields) =>
            prevFields.map((field) => ({
              ...field,
              description:
                descriptionResponse[field.field_id]?.description || field.description
            }))
          );
        } else {
          console.warn('Unexpected description response format:', descriptionResponse);
          setError('Unexpected response format from description API.');
        }
      } catch (err) {
        console.error('Error fetching descriptions:', err);
        setError('Failed to load descriptions.');
      } finally {
        setLoadingDescriptions(false);
      }
    };

    fetchDescriptions();
  }, [selectedSource, passValuesWithDesc]);

  // Table cell editing
  const handleEditField = useCallback(
    (fieldId: number, key: keyof FieldData, value: any) => {
      setFields((prev) =>
        prev.map((field) =>
          field.field_id === fieldId
            ? {
              ...field,
              [key]: value,
              isEditing: { ...field.isEditing, [key]: false }
            }
            : field
        )
      );
    },
    []
  );

  // Define columns for FlexibleTable
  const columns = useMemo(
    () => [
      {
        key: 'field_name',
        header: 'Field',
        render: (value: string, row: FieldData) => (
          <EditableField
            value={value}
            isEditing={row.isEditing?.field_name}
            onStartEdit={() =>
              setFields((prev) =>
                prev.map((field) =>
                  field.field_id === row.field_id
                    ? {
                      ...field,
                      isEditing: { ...field.isEditing, field_name: true }
                    }
                    : field
                )
              )
            }
            onSaveEdit={(newValue) =>
              handleEditField(row.field_id, 'field_name', newValue)
            }
            fieldKey="field_name"
          />
        )
      },
      {
        key: 'description',
        header: 'Description',
        render: (value: string, row: FieldData) => (
          <EditableField
            value={value}
            isEditing={row.isEditing?.description}
            onStartEdit={() =>
              setFields((prev) =>
                prev.map((field) =>
                  field.field_id === row.field_id
                    ? {
                      ...field,
                      isEditing: { ...field.isEditing, description: true }
                    }
                    : field
                )
              )
            }
            onSaveEdit={(newValue) =>
              handleEditField(row.field_id, 'description', newValue)
            }
            fieldKey="description"
          />
        )
      },
      {
        key: 'tags',
        header: 'Tags',
        render: (value: string[], row: FieldData) => (
          <TagManager
            tags={value}
            isEditing={row.isEditing?.tags}
            onAddTag={(tag) =>
              handleEditField(row.field_id, 'tags', [...value, tag])
            }
            onRemoveTag={(tag) =>
              handleEditField(
                row.field_id,
                'tags',
                value.filter((t) => t !== tag)
              )
            }
            onStartEdit={() =>
              setFields((prev) =>
                prev.map((field) =>
                  field.field_id === row.field_id
                    ? {
                      ...field,
                      isEditing: {
                        ...field.isEditing,
                        tags: !row.isEditing?.tags
                      }
                    }
                    : field
                )
              )
            }
          />
        )
      }
    ],
    [handleEditField]
  );

  // Render
  return (
    <Stack direction="row" spacing={2} sx={{ height: '100%' }}>
      {/* Main Table */}
      <Paper
        sx={{
          width: '75%',
          borderRadius: 4,
          border: '1px solid lightgrey'
        }}
      >
        <Stack sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            {layoutList && layoutList.length > 0
              ? layoutList[0].data_src_lyt_name
              : 'Employee Data Schema'}
          </Typography>

          {/* Loading Indicator */}
          {loadingDescriptions && (
            <Stack direction="row" alignItems="center" spacing={1} my={2}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="textSecondary">
                Loading descriptions...
              </Typography>
            </Stack>
          )}

          {/* Error Message */}
          {error && (
            <Typography variant="body2" color="error" mb={2}>
              {error}
            </Typography>
          )}

          <TableContainer sx={{ maxHeight: 800 }}>
            <FlexibleTable
              data={fields}
              columns={columns}
              itemsPerPageOptions={[5, 10, 20]}
              defaultItemsPerPage={10}
              rowColorFn={(_, index) =>
                index % 2 === 0 ? 'background.paper' : 'grey.100'
              }
            />
          </TableContainer>
        </Stack>
      </Paper>

      {/* Side Panel */}
      <Paper
        sx={{
          width: '25%',
          borderRadius: 4,
          border: '1px solid lightgrey'
        }}
      >
        {/* Pass data_type desc along to About */}
        <About
          sourceName={selectedSource?.data_src_name || 'Unknown Source'}
          passValues={passValuesWithDesc}
        />
      </Paper>
    </Stack>
  );
};

export default CatalogsBody;
