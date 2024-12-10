import { useState, useEffect } from 'react';
import { 
    Stack, Typography, Paper, TableContainer, 
    TextField, Chip, IconButton
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FlexibleTable } from '@/components/Tabel';
import { toast } from 'react-toastify';
import { Plus, X } from 'lucide-react';
import About from '@/components/Catalog/About';

interface FieldData {
    field_id: string | number;
    field_name: string;
    description: string;
    tags: string[];
    isEditing?: {
        field_name?: boolean;
        description?: boolean;
        tags?: boolean;
    };
}

// Mock data generator
const generateMockData = (): FieldData[] => [
    {
        field_id: 1,
        field_name: "employee_id",
        description: "Unique identifier for employee records",
        tags: ["primary_key", "integer"]
    },
    {
        field_id: 2,
        field_name: "first_name",
        description: "Employee's first name",
        tags: ["personal", "varchar"]
    },
    {
        field_id: 3,
        field_name: "last_name",
        description: "Employee's last name",
        tags: ["personal", "varchar"]
    },
    {
        field_id: 4,
        field_name: "hire_date",
        description: "Date when employee was hired",
        tags: ["date", "timestamp"]
    },
    {
        field_id: 5,
        field_name: "salary",
        description: "Employee's current salary",
        tags: ["confidential", "decimal"]
    }
];

export default function CatalogsBody(data:any) {
    const { layoutList } = useSelector((state: RootState) => state.catalogApi);
    const [fields, setFields] = useState<FieldData[]>([]);
    const [editingField, setEditingField] = useState<FieldData | null>(null);
    const [newTag, setNewTag] = useState('');

    // Fetch mock data
    useEffect(() => {
        const mockData = generateMockData();
        setFields(mockData.map(field => ({ ...field, isEditing: {} })));
    }, []);

    // Mock API call
    const mockApiCall = async (data: any) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    };

    const handleStartEdit = (field: FieldData, field_key: string) => {
        setFields(prevFields => 
            prevFields.map(f => 
                f.field_id === field.field_id 
                    ? { ...f, isEditing: { ...f.isEditing, [field_key]: true } }
                    : f
            )
        );
    };

    const handleSaveEdit = async (field: FieldData, field_key: string, value: any) => {
        try {
            await mockApiCall({ field_id: field.field_id, [field_key]: value });
            setFields(prevFields =>
                prevFields.map(f =>
                    f.field_id === field.field_id
                        ? { 
                            ...f, 
                            [field_key]: value,
                            isEditing: { ...f.isEditing, [field_key]: false }
                          }
                        : f
                )
            );
            toast.success('Field updated successfully', {
                position: "top-right",
                autoClose: 3000
            });
        } catch (error) {
            toast.error('Failed to update field', {
                position: "top-right",
                autoClose: 3000
            });
        }
    };

    const handleAddTag = async (field: FieldData, tag: string) => {
        if (!tag.trim()) return;
        try {
            await mockApiCall({ field_id: field.field_id, tag });
            setFields(prevFields =>
                prevFields.map(f =>
                    f.field_id === field.field_id
                        ? { ...f, tags: [...f.tags, tag.trim()] }
                        : f
                )
            );
            setNewTag('');
        } catch (error) {
            toast.error('Failed to add tag');
        }
    };

    const handleRemoveTag = async (field: FieldData, tagToRemove: string) => {
        try {
            await mockApiCall({ field_id: field.field_id, tag: tagToRemove });
            setFields(prevFields =>
                prevFields.map(f =>
                    f.field_id === field.field_id
                        ? { ...f, tags: f.tags.filter(tag => tag !== tagToRemove) }
                        : f
                )
            );
        } catch (error) {
            toast.error('Failed to remove tag');
        }
    };

    const catalogColumns = [
        {
            key: 'field_name',
            header: 'Field',
            type: 'text' as const,
            render: (value: string, row: FieldData) => (
                row.isEditing?.field_name ? (
                    <TextField
                        size="small"
                        defaultValue={value}
                        autoFocus
                        variant="standard"
                        onBlur={(e) => handleSaveEdit(row, 'field_name', e.target.value)}
                        onKeyDown={(e:any) => {
                            if (e.key === 'Enter') {
                                handleSaveEdit(row, 'field_name', e.target.value);
                            }
                        }}
                        sx={{
                            '& .MuiInputBase-root': {
                                fontSize: '0.875rem',
                                '&:before, &:after': {
                                    borderBottom: '2px solid',
                                    borderColor: 'primary.main'
                                }
                            }
                        }}
                    />
                ) : (
                    <Typography 
                        onClick={() => handleStartEdit(row, 'field_name')}
                        sx={{ 
                            cursor: 'pointer', 
                            p: 0.5,
                            borderRadius: 1,
                            '&:hover': { 
                                backgroundColor: 'action.hover',
                                color: 'primary.main'
                            }
                        }}
                    >
                        {value}
                    </Typography>
                )
            )
        },
        {
            key: 'description',
            header: 'Description',
            type: 'text' as const,
            render: (value: string, row: FieldData) => (
                row.isEditing?.description ? (
                    <TextField
                        size="small"
                        defaultValue={value}
                        autoFocus
                        variant="standard"
                        multiline
                        onBlur={(e) => handleSaveEdit(row, 'description', e.target.value)}
                        onKeyDown={(e:any) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSaveEdit(row, 'description', e.target.value);
                            }
                        }}
                        sx={{
                            width: '100%',
                            '& .MuiInputBase-root': {
                                fontSize: '0.875rem',
                                '&:before, &:after': {
                                    borderBottom: '2px solid',
                                    borderColor: 'primary.main'
                                }
                            }
                        }}
                    />
                ) : (
                    <Typography 
                        onClick={() => handleStartEdit(row, 'description')}
                        sx={{ 
                            cursor: 'pointer', 
                            p: 0.5,
                            borderRadius: 1,
                            '&:hover': { 
                                backgroundColor: 'action.hover',
                                color: 'primary.main'
                            }
                        }}
                    >
                        {value}
                    </Typography>
                )
            )
        },
        {
            key: 'tags',
            header: 'Tags',
            type: 'text' as const,
            render: (value: string[], row: FieldData) => (
                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                    {value?.map((tag: string, index: number) => (
                        <Chip
                            key={index}
                            label={tag}
                            size="small"
                            onDelete={() => handleRemoveTag(row, tag)}
                            sx={{
                                borderRadius: '4px',
                                backgroundColor: 'primary.lighter',
                                color: '#20405f',
                                height: '24px',
                                fontSize: '0.75rem',
                                '& .MuiChip-deleteIcon': {
                                    '&:hover': {
                                        color: 'error.main', 
                                    },
                                },
                            }}
                        />
                    ))}
                    {row.isEditing?.tags ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                                size="small"
                                value={newTag}
                                placeholder="Add tag"
                                variant="standard"
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddTag(row, newTag);
                                    } else if (e.key === 'Escape') {
                                        setFields(prevFields =>
                                            prevFields.map(f =>
                                                f.field_id === row.field_id
                                                    ? { ...f, isEditing: { ...f.isEditing, tags: false } }
                                                    : f
                                            )
                                        );
                                    }
                                }}
                                sx={{
                                    width: '100px',
                                    '& .MuiInputBase-root': {
                                        fontSize: '0.875rem',
                                        '&:before, &:after': {
                                            borderBottom: '2px solid',
                                            borderColor: 'primary.main'
                                        }
                                    }
                                }}
                            />
                            <IconButton 
                                size="small" 
                                onClick={() => setFields(prevFields =>
                                    prevFields.map(f =>
                                        f.field_id === row.field_id
                                            ? { ...f, isEditing: { ...f.isEditing, tags: false } }
                                            : f
                                    )
                                )}
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                        color: 'error.main'
                                    }
                                }}
                            >
                                <X size={16} />
                            </IconButton>
                        </Stack>
                    ) : (
                        <IconButton 
                            size="small" 
                            onClick={() => handleStartEdit(row, 'tags')}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                    color: 'primary.main',
                                    backgroundColor: 'primary.lighter'
                                }
                            }}
                        >
                            <Plus size={16} />
                        </IconButton>
                    )}
                </Stack>
            )
        }
    ];

    return (
        <>
            <Stack direction={'row'} spacing={2} sx={{ height: '100%' }}>
                <Paper 
                    sx={{ 
                        width: '75%',
                        overflow: 'hidden', 
                        borderRadius: '4px', 
                        border: '1px solid lightgrey' 
                    }} 
                    elevation={0}
                >
                    <Stack sx={{ p: '24px' }}>
                        <Stack direction={'row'} justifyContent={'space-between'} sx={{ mb: 2 }}>
                            <Typography variant='h6' fontWeight={'bold'}>
                                {layoutList[0]?.data_src_lyt_name || 'Employee Data Schema'}
                            </Typography>
                        </Stack>
                        <TableContainer sx={{ maxHeight: 800 }}>
                            <FlexibleTable
                                data={fields}
                                columns={catalogColumns}
                                itemsPerPageOptions={[5, 10, 20]}
                                defaultItemsPerPage={10}
                                isSearch={false}
                            />
                        </TableContainer>
                    </Stack>
                </Paper>
                
                <Paper 
                    sx={{ 
                        width: '25%',
                        overflow: 'hidden', 
                        borderRadius: '4px', 
                        border: '1px solid lightgrey'
                    }} 
                    elevation={0}
                >
                    <About />
                </Paper>
            </Stack>
        </>
    );
}