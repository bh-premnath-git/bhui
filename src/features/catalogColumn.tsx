import { Stack, Typography } from "@mui/material";
import { BsChatDots } from "react-icons/bs";
import { LuCalendarDays } from "react-icons/lu";

interface LayoutField {
    lyt_fld_name: string;
    lyt_fld_desc: string;
    lyt_fld_id: number;
    lyt_fld_tags: object;
}
type ColumnConfig = {
    key: string;
    header: string;
    sortable?: boolean;
    filterable?: boolean;
    type?: 'text' | 'number' | 'date' | 'badge';
    badgeConfig?: {
        colorMap: Record<string, string>;
    };
    render?: (value: any, rowData: LayoutField) => React.ReactNode;
};
export const catalogColumns: ColumnConfig[] = [
    {
        key: 'lyt_fld_name',
        header: 'Field',
        sortable: true,
        filterable: false,
        type: 'text',
        render: (value: string, rowData: LayoutField) => (
            <div>
                <Typography variant='body1' sx={{ fontSize: '15px', py: '2px' }}>{rowData?.lyt_fld_name}</Typography>

                <Stack direction="row" spacing={2}>
                    <Typography variant='body2' sx={{ padding: '4px', background: '#f2f3f5', borderRadius: '2px' }}><LuCalendarDays /></Typography>
                    <Typography variant='body2' sx={{ padding: '4px', background: '#f2f3f5', borderRadius: '2px' }}><BsChatDots /></Typography>

                </Stack>
            </div>
        ),
    },
    {
        key: 'lyt_fld_desc',
        header: 'Description',
        sortable: true,
        filterable: false,
        type: 'text',
    },
    {
        key: 'lyt_fld_tags',
        header: 'Tags',
        sortable: true,
        filterable: false,
        type: 'text',
        render: (value: any | null) => {
            return (<>
                {value?.tagList ? (
                    <>
                        {value?.tagList?.map((item: any, index: any) => (
                            <div key={index}>
                                <span className='bg-gray-100 p-1 rounded-sm'>
                                    {Object.keys(item)} {'>>'}{Object.values(item)}
                                </span>

                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <div >
                            <span className='bg-gray-100 p-1 rounded-sm'>
                                {Object.keys(value)} {'>>'}{Object.values(value)}
                            </span>

                        </div>

                    </>
                )}
            </>)
        },

    },
    {
        key: 'glossary_terms',
        header: 'Glossary Terms',
        sortable: true,
        filterable: false,
        type: 'text',
        render: (value: string | null) => value || 'Glossary Terms',

    },

];