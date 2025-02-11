import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CreateFlowForm from './create-flowform';
import { ApiService } from "@/services/api.services";
import { CATALOG_API_PORT } from '@/services/environment';

// Define the props for the popup
interface FlowCreatePopupProps {
    open: boolean;
    handleClose: () => void;
    showToast: any;
}

const FlowCreatePopup: React.FC<FlowCreatePopupProps> = ({
    open,
    handleClose,
    showToast,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const onCreateFlow = async (payload: any) => {
        setIsLoading(true);
        try {
            const response = await ApiService({
                portNumber: CATALOG_API_PORT,
                method: 'post',
                url: '/flow',
                data: payload
            }
            );

            if (response?.error) {
                showToast(response.error, { color: 'red' });
                setIsLoading(false);
                return new Error(response.error);
            } else {
                showToast('Flow created successfully', { color: 'green' });
                setIsLoading(false);
                // Optionally, you can perform additional actions here,
                // such as refreshing data or navigating to the newly created flow.
                return response;
            }
        } catch (error: any) {
            setIsLoading(false);
            showToast(error?.message || 'An error occurred', { color: 'red' });
            return new Error(error?.message || 'An error occurred');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-[80vw] h-[80vh]">
                <CreateFlowForm
                    onClose={handleClose}
                    onCreateFlow={onCreateFlow}
                    isLoading={isLoading}
                />
            </DialogContent>
        </Dialog>
    );
};

export default FlowCreatePopup;
