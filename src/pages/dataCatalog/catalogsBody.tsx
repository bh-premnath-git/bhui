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
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FlexibleTable } from '@/components/Table';
import About from '@/components/Catalog/About';
import { ApiService } from '@/services/apiServices';
import { Plus, X } from 'lucide-react';
import { CATALOG_API_PORT, AGENT_PORT } from '@/configration/environment';

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
  selectedSource: SelectedSource;
}

interface SelectedSource {
  data_src_name: string;
  data_src_desc: string;
}

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
            backgroundColor: 'primary.lighter',
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

const CatalogsBody: React.FC<CatalogsBodyProps> = ({ selectedSource }) => {
  const { layoutList } = useSelector((state: RootState) => state.catalogApi);
  const [fields, setFields] = useState<FieldData[]>([]);
  const [types, setTypes] = useState<CodeType[]>([]);
  const [passValues, setPassValues] = useState<PassValueItem[]>([]);
  const [loadingDescriptions, setLoadingDescriptions] = useState<boolean>(false);
  const [descriptionLoaded, setDescriptionLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  const dataSourceLayout = useCallback(async (): Promise<FieldData[]> => {
    if (!layoutList || layoutList.length === 0) {
      return [];
    }

    try {
      const result = layoutList[0].layout_fields;
      const resultantVal = result.map((item: any) => ({
        name: item.lyt_fld_name,
        data_type: item.lyt_fld_data_type_cd,
        description: item.lyt_fld_desc
      }));
      setPassValues(resultantVal);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { codes_dtl } = await ApiService(CATALOG_API_PORT, 'get', '/codes_hdr/13');
        setTypes(codes_dtl);
        const fetchedFields = await dataSourceLayout();
        setFields(fetchedFields);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load initial data.');
      }
    };
    fetchData();
  }, [dataSourceLayout]);

  const passValuesWithDesc = useMemo(() => {
    return passValues.map((item) => {
      const matchedType = types.find((t) => t.id === item.data_type);
      return {
        ...item,
        data_type: matchedType ? matchedType.dtl_desc : 'Unknown'
      };
    });
  }, [passValues, types]);

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
        AGENT_PORT,
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
        setDescriptionLoaded(true);
        setAiStatus("Success");
      } else {
        console.warn('Unexpected description response format:', descriptionResponse);
        setError('Unexpected response format from description API.');
      }
    } catch (err) {
      console.error('Error fetching descriptions:', err);
      setAiStatus("Failed");
    } finally {
      setLoadingDescriptions(false);
    }
  };

  const saveDesField = async () => {
    const descriptions = fields.map((field) => ({
      lyt_fld_id: field.field_id,
      lyt_fld_desc: field.description,
    }))

    setSaveLoading(true);
    setSaveStatus(null);
    try {
      await ApiService(
        CATALOG_API_PORT,
        'patch',
        `/layout_fields/descriptions/${layoutList[0].data_src_lyt_id}`,
        { descriptions }
      );
      setSaveStatus('Success');
    } catch (err) {
      console.error('Error saving descriptions:', err);
      setSaveStatus('Failed');
    } finally {
      setSaveLoading(false);
    }
  };

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
            onSaveEdit={(newValue) => {
              handleEditField(row.field_id, 'description', newValue)
              setDescriptionLoaded(true)
            }
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

  return (
    <Stack direction="row" spacing={2} sx={{ height: '100%' }}>
      <Paper
        sx={{
          width: '75%',
          borderRadius: 4,
          border: '1px solid lightgrey'
        }}
      >
        <Stack sx={{ p: 3 }}>
          {error && (
            <Typography variant="body2" color="error" mb={2}>
              {error}
            </Typography>
          )}

          <TableContainer sx={{ maxHeight: 800 }}>
            <FlexibleTable
              data={fields}
              columns={columns}
              tableName="Catalog Table"
              itemsPerPageOptions={[5, 10, 20]}
              defaultItemsPerPage={10}
              handleAIgenFn={fetchDescriptions}
              handleAIsaveFn={saveDesField}
              isAIGenerated={descriptionLoaded}
              aiLoading={loadingDescriptions}
              aiStatus={aiStatus}
              saveLoading={saveLoading}
              saveStatus={saveStatus}
              isAction={false}
              rowColorFn={(row, index) => (index % 2 === 0 ? "bg-white" : "bg-gray-100")}
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
        <About
          sourceName={selectedSource?.data_src_name || 'Unknown Source'}
          passValues={passValuesWithDesc}
          dataSource={layoutList[0]}
          description={selectedSource?.data_src_desc}
        />
      </Paper>
    </Stack>
  );
};

export default CatalogsBody;
