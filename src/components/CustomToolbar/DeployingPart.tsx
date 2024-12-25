import { useEffect } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { dagParserTimeFunc as fetchDagParserTime } from '@/redux/FlowSlice';
export const DeployingPart = ({ selectedData, selectedEnvName }) => {
    const dispatch = useAppDispatch();
    const { error, dagParserTime } = useAppSelector((state) => state.flowApi)

    useEffect(() => {
        if ( selectedData && selectedEnvName) {
            const query = {
                dag_id: selectedData.flow_name,
                ...selectedEnvName
            }

            dispatch(fetchDagParserTime(query));
        }
    }, [dispatch, selectedData, selectedEnvName]);

    const formatDagParserTime = (time: string | null): string => {
        if (!time) return "none";
        const date = new Date(time);
        if (isNaN(date.getTime())) return "Invalid date";
        return date.toLocaleString();
    };

    return (
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 border border-gray-100 rounded-md text-gray-600 hover:bg-gray-100 transition-colors duration-200 ease-in-out">
            <Clock className="h-2 w-2 text-gray-500" />
            <time
                className="text-sm"
                dateTime={dagParserTime || undefined}
            >
                Last deployed: <span className="font-medium">{formatDagParserTime(dagParserTime)}</span>
            </time>
            {error && (
                <AlertCircle className="ml h-2 w-2 text-red-500" />
            )}
        </div>
    )
}
