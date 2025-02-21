import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSaving, setSaved, setSaveError } from '@/store/slices/designer/features/autoSaveSlice';
import { convertUIToPipelineJson, useUpdatePipelineMutation } from '@/lib/pipelineJsonConverter';
import { CATALOG_API_PORT } from '@/config/platformenv';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import { useParams } from 'react-router-dom';

export const useAutoSave = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { nodes, edges, pipelineDtl, setValidationErrors, setConversionLogs, setShowLogs } = usePipelineContext();
    const saveStatus = useSelector((state: any) => state.autoSave);
    const time = import.meta.env.VITE_AUTO_SAVE_TIME;
    const autoSaveInterval = parseInt(time, 10) || 10000;
    const updatePipeline = useUpdatePipelineMutation();

    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (saveStatus.hasUnsavedChanges) {
                try {
                    dispatch(setSaving());
                    const pipeline_json = convertUIToPipelineJson(nodes, edges, pipelineDtl);
                    await updatePipeline.mutateAsync({ id, pipeline_json });
                    dispatch(setSaved());
                    setValidationErrors([]);
                } catch (error: any) {
                    if (error.logs) {
                        setConversionLogs(error.logs);
                        setShowLogs(true);
                    }
                    if (error.message && error.message.includes('Pipeline is incomplete or broken:')) {
                        const errorMessages = error.message.split('\n').slice(1);
                        setValidationErrors(errorMessages);
                    }
                    console.error('Error saving pipeline state:', error);
                    dispatch(setSaveError(error.message));
                }
            }
        }, autoSaveInterval);

        return () => clearInterval(intervalId);
    }, [
        nodes,
        edges,
        id,
        dispatch,
        saveStatus.hasUnsavedChanges,
        autoSaveInterval,
        pipelineDtl,
        setValidationErrors,
        setConversionLogs,
        setShowLogs,
        updatePipeline
    ]);
};