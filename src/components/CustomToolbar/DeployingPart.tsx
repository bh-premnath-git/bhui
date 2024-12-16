import {
    Clock
} from 'lucide-react';

export const DeployingPart = ({ selectedData }) => {
    return (
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 border border-gray-100 rounded-md text-gray-600 hover:bg-gray-100 transition-colors duration-200 ease-in-out">
            <Clock className="h-4 w-4 text-gray-500" />
            <time
                className="text-sm"
                dateTime="2023-11-28T08:45"
            >
                Last deployed: <span className="font-medium">{"none"}</span>
            </time>
        </div>
    )
}
