import { useState, useEffect } from 'react';
import {
    Stack, Typography, Paper, TableContainer, TextField, Chip, IconButton,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FlexibleTable } from '@/components/Tabel';
import { Plus, X } from 'lucide-react';
import About from '@/components/Catalog/About';

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

// Utility to fetch mock data
// const generateMockData = (): FieldData[] => [
//     { field_id: 1, field_name: "employee_id", description: "Unique identifier for employee records", tags: ["primary_key", "integer"] },
//     { field_id: 2, field_name: "first_name", description: "Employee's first name", tags: ["personal", "varchar"] },
//     { field_id: 3, field_name: "last_name", description: "Employee's last name", tags: ["personal", "varchar"] },
//     { field_id: 4, field_name: "hire_date", description: "Date when employee was hired", tags: ["date", "timestamp"] },
//     { field_id: 5, field_name: "salary", description: "Employee's current salary", tags: ["confidential", "decimal"] }
// ];

// Component for editing text fields
const EditableField = ({
    value, isEditing, onStartEdit, onSaveEdit, fieldKey
}: {
    value: string;
    isEditing: boolean | undefined;
    onStartEdit: () => void;
    onSaveEdit: (newValue: string) => void;
    fieldKey: string;
}) => (
    isEditing ? (
        <TextField
            size="small"
            defaultValue={value}
            autoFocus
            variant="standard"
            multiline={fieldKey === "description"}
            onBlur={(e) => onSaveEdit(e.target.value)}
            onKeyDown={(e: any) => {
                if (e.key === 'Enter' && (fieldKey !== "description" || !e.shiftKey)) {
                    e.preventDefault();
                    onSaveEdit(e.target.value);
                }
            }}
            sx={{
                '& .MuiInputBase-root': {
                    fontSize: '0.875rem',
                    '&:before, &:after': { borderBottom: '2px solid', borderColor: 'green' }
                }
            }}
        />
    ) : (
        <Typography
            onClick={onStartEdit}
            sx={{
                cursor: 'pointer', p: 0.5, borderRadius: 1,
                '&:hover': { backgroundColor: 'action.hover', color: 'green' }
            }}
        >
            {value}
        </Typography>
    )
);

// Component for tag management
const TagManager = ({
    tags, isEditing, onAddTag, onRemoveTag, onStartEdit
}: {
    tags: string[];
    isEditing: boolean | undefined;
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
    onStartEdit: () => void;
}) => {
    const [newTag, setNewTag] = useState('');

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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onAddTag(newTag);
                            if (e.key === 'Escape') onStartEdit();
                        }}
                        sx={{
                            width: '100px',
                            '& .MuiInputBase-root': {
                                fontSize: '0.875rem',
                                '&:before, &:after': { borderBottom: '2px solid', borderColor: 'green' }
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

// Main component
export default function CatalogsBody() {
    const { layoutList } = useSelector((state: RootState) => state.catalogApi);
    const [fields, setFields] = useState<FieldData[]>([]);

    async function dataSourceLayout(): Promise<FieldData[]> {
        try {
            const result = layoutList[0].layout_fields
            return result.map((item: any) => { 
                return ({
                field_id:item.lyt_fld_id,
                field_name: item.lyt_fld_name,
                description: item.lyt_fld_desc,
                tags: Object.values(item.lyt_fld_tags),
                isEditing: {}
            })});
        } catch (error) {
            console.error("Unable to get the data", error);
            return [];
        }
    }
    

    useEffect(() => {
        const fetchData = async () => {
            const fetchedFields = await dataSourceLayout();
            setFields(fetchedFields);
        };
        fetchData();
    }, []);
    
    const handleEditField = (fieldId: number, key: string, value: any) => {
        setFields(prev => prev.map(field =>
            field.field_id === fieldId ? {
                ...field,
                [key]: value,
                isEditing: { ...field.isEditing, [key]: false }
            } : field
        ));
    };

    const columns = [
        { key: 'field_name', header: 'Field', render: (value: string, row: FieldData) => (
            <EditableField
                value={value}
                isEditing={row.isEditing?.field_name}
                onStartEdit={() => setFields(prev => prev.map(field =>
                    field.field_id === row.field_id ? { ...field, isEditing: { field_name: true } } : field
                ))}
                onSaveEdit={(newValue) => handleEditField(row.field_id, 'field_name', newValue)}
                fieldKey="field_name"
            />
        ) },
        { key: 'description', header: 'Description', render: (value: string, row: FieldData) => (
            <EditableField
                value={value}
                isEditing={row.isEditing?.description}
                onStartEdit={() => setFields(prev => prev.map(field =>
                    field.field_id === row.field_id ? { ...field, isEditing: { description: true } } : field
                ))}
                onSaveEdit={(newValue) => handleEditField(row.field_id, 'description', newValue)}
                fieldKey="description"
            />
        ) },
        { key: 'tags', header: 'Tags', render: (value: string[], row: FieldData) => (
            <TagManager
                tags={value}
                isEditing={row.isEditing?.tags}
                onAddTag={(tag) => handleEditField(row.field_id, 'tags', [...value, tag])}
                onRemoveTag={(tag) => handleEditField(row.field_id, 'tags', value.filter(t => t !== tag))}
                onStartEdit={() => setFields(prev => prev.map(field =>
                    field.field_id === row.field_id ? { ...field, isEditing: { tags: !row.isEditing?.tags } } : field
                ))}
            />
        ) }
    ];

    return (
        <Stack direction="row" spacing={2} sx={{ height: '100%' }}>
            <Paper sx={{ width: '75%', borderRadius: 4, border: '1px solid lightgrey' }}>
                <Stack sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {layoutList[0]?.data_src_lyt_name || 'Employee Data Schema'}
                    </Typography>
                    <TableContainer sx={{ maxHeight: 800 }}>
                        <FlexibleTable
                            data={fields}
                            columns={columns}
                            itemsPerPageOptions={[5, 10, 20]}
                            defaultItemsPerPage={10}
                            rowColorFn={(row, index) => (index % 2 === 0 ? "bg-white" : "bg-gray-100")}
                        />
                    </TableContainer>
                </Stack>
            </Paper>
            <Paper sx={{ width: '25%', borderRadius: 4, border: '1px solid lightgrey' }}>
                <About />
            </Paper>
        </Stack>
    );
}
