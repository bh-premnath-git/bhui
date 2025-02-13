import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CreateFlowForm from './create-flowform';
import { ApiService } from "@/services/api.services";
import { CATALOG_API_PORT } from '@/services/environment';
import { useAppDispatch } from '@/hooks/useRedux';
import { getFlowProjectList } from '@/store/features/flowSlice';

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
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(getFlowProjectList({ offset: 0, limit: 1000 }));
    }, [dispatch, getFlowProjectList]);
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
            <DialogContent className="max-w-[50vw] h-[90vh]">
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
