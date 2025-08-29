import { toast } from 'sonner';
import { Button } from './button';

interface ErrorToastProps {
    title: string;
    description: string;
    duration?: number;
}

export const showErrorToast = ({ title, description, duration = 10000 }: ErrorToastProps) => {
    const isLongMessage = description.length > 300;
    
    if (isLongMessage) {
        // For long messages, create a custom toast with expandable content
        toast.error(title, {
            description: (
                <div className="max-w-none">
                    <details className="group">
                        <summary className="cursor-pointer list-none">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">
                                    {description.substring(0, 150)}...
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-6 px-2 group-open:hidden"
                                >
                                    Show More
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-6 px-2 hidden group-open:inline-flex"
                                >
                                    Show Less
                                </Button>
                            </div>
                        </summary>
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                            <pre className="text-xs whitespace-pre-wrap text-gray-700 max-h-60 overflow-y-auto">
                                {description}
                            </pre>
                        </div>
                    </details>
                </div>
            ),
            duration,
            className: 'max-w-2xl',
            style: {
                maxWidth: '800px',
            },
            action: {
                label: 'Copy Error',
                onClick: () => navigator.clipboard.writeText(description)
            }
        });
    } else {
        // For shorter messages, use regular toast
        toast.error(title, {
            description,
            duration,
            style: {
                maxWidth: '600px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
            }
        });
    }
};