import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from "@/components/ui/button";
import { GitCommit, GitCommitHorizontal, Loader } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiService } from '@/services/apiServices';
import useToast from '@/components/teast-service';

interface CommitPayload {
    id: string;
    message: string;
}

export const CommitPart = ({ selectedData }: { selectedData: any }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [commitMessage, setCommitMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false); // For showing the loader
    const [ToastComponent, showToast] = useToast();

    async function commitApi({ id, message }: CommitPayload) {
        try {
            const payload = { "flow_deployment_id": id, "comment": message };
            await ApiService('8011', 'post', '/flow/flow-version', payload);
            showToast('Successfully able to commited', { color: '#00b060' });
        } catch (error) {
            showToast('Error committing data. Please try again.', { color: '#f44336' });
            console.error('Error commit data:', error);
        }
    }

    const handleCommit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true); // Start loader
        await commitApi({ id: selectedData?.flow_deployment_id, message: commitMessage });
        setIsLoading(false); // Stop loader
        setCommitMessage('');
        setIsDialogOpen(false);
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="border border-gray-100 hover:bg-gray-200 rounded-md h-10 w-10 p-2"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <GitCommit className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent
                    className="bg-gray-900 px-3 py-1.5 text-xs font-medium text-white rounded-md border-0"
                    sideOffset={5}
                >
                    <p>Commit changes</p>
                </TooltipContent>
            </Tooltip>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Commit</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCommit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="commit-message" className="text-right">
                                    Message
                                </Label>
                                <Input
                                    id="commit-message"
                                    value={commitMessage}
                                    onChange={(e) => setCommitMessage(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Enter commit message"
                                    disabled={isLoading} // Disable input during loading
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                className="bg-black hover:bg-gray-800 text-white flex items-center justify-center"
                                type="submit"
                                disabled={isLoading} // Disable button during loading
                            >
                                {isLoading ? (
                                    <Loader className="animate-spin h-4 w-4" />
                                ) : (
                                    <GitCommitHorizontal className="h-4 w-4" />
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <ToastComponent />
        </TooltipProvider>
    );
};
