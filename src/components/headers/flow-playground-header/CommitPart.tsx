import { useState } from 'react';
import { GitCommit, GitCommitHorizontal, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { RootState } from "@/store/";
import { commitFlowVersion } from '@/store/slices/designer/flowSlice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';

export const CommitPart = () => {
    const dispatch = useAppDispatch();
    const { selectedFlow, loading } = useAppSelector((state: RootState) => state.flow);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [commitMessage, setCommitMessage] = useState('');

    const handleCommit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFlow?.flow_deployment?.[0]?.flow_deployment_id) {
            toast.error("No flow deployment selected");
            return;
        }

        try {
            await dispatch(commitFlowVersion({
                flow_deployment_id: selectedFlow.flow_deployment[0].flow_deployment_id,
                comment: commitMessage
            })).unwrap();

            toast.success("Successfully committed changes");
            setCommitMessage('');
            setIsDialogOpen(false);
        } catch (error) {
            toast.error("Failed to commit changes. Please try again.");
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setIsDialogOpen(true)}
                        disabled={loading || !selectedFlow?.flow_deployment?.[0]?.flow_deployment_id}
                    >
                        <GitCommit className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center">
                    <p>Commit changes</p>
                </TooltipContent>
            </Tooltip>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Commit Changes</DialogTitle>
                        <DialogDescription>
                            Enter a message to describe your changes.
                        </DialogDescription>
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
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={loading || !commitMessage.trim()}
                                className="bg-black hover:bg-gray-800 text-white"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <GitCommitHorizontal className="h-4 w-4 mr-2" />
                                        Commit
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
};