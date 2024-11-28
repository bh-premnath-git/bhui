import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Formik, Form } from 'formik';
import useToast from '@/oldcomponents/teast-service';
import CustomField from '@/common/CustomField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface CostOptimizationFormProps {
    open: boolean;
    jobDetail: any;
    onClose: () => void;
}

const CostOptimizationForm: React.FC<CostOptimizationFormProps> = ({ open, onClose }) => {
    const [ToastComponent, showToast]: any = useToast();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            sx={{ borderRadius: 4 }}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle className="flex justify-between items-center bg-gray-100">
                <span className="text-lg font-semibold text-black">Cost Optimization</span>
                <IconButton onClick={onClose} aria-label="close">
                    <CloseIcon className="text-black" />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <CostOptimization onClose={onClose} showToast={showToast} />
            </DialogContent>
            {ToastComponent}
        </Dialog>
    );
};

export default CostOptimizationForm;

const CostOptimization = ({ onClose, showToast }: any) => {
    const initialValues = {
        cpuUtilization: '~20%',
        iops: '~10%',
        diskUsage: '~30%',
        currentCost: '$10/Run',
        proposedCost: '$5/Run',
        masterCurrent: 'N2D16 - One Node',
        masterProposed: 'N2D8 - One Node',
        masterOverride: '',
        workerCurrent: 'N2D16 - Ten Nodes',
        workerProposed: 'N2D4 - Ten Nodes',
        workerOverride: '',
        executorsCurrent: '10',
        executorsProposed: '8',
        executorsOverride: '',
        memoryCurrent: '20G',
        memoryProposed: '10G',
        memoryOverride: ''
    };

    const handleSubmit = (values: any) => {
        console.log(values);
        showToast({ message: 'Cost optimization settings saved!', type: 'success' });
        onClose();
    };

    return (
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
                <Form className="space-y-6">
                    {/* Metrics Section */}
                    <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="metrics-content"
                            id="metrics-header"
                        >
                            <Typography className="text-md font-semibold text-black">Metrics</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="font-medium text-gray-600">Metric</div>
                                <div className="font-medium text-gray-600">Recommended</div>
                                <div className="font-medium text-gray-600">Actual</div>

                                <div className="text-black">CPU Utilization</div>
                                <div className="text-black">&gt;80%</div>
                                <CustomField name="cpuUtilization" className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-black" disabled />

                                <div className="text-black">IOPS</div>
                                <div className="text-black">&gt;50%</div>
                                <CustomField name="iops" className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-black" disabled />

                                <div className="text-black">Disk Usage</div>
                                <div className="text-black">&gt;50%</div>
                                <CustomField name="diskUsage" className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-black" disabled />
                            </div>
                        </AccordionDetails>
                    </Accordion>

                    {/* Cost of Run Section */}
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="cost-of-run-content"
                            id="cost-of-run-header"
                        >
                            <Typography className="text-md font-semibold text-black">Cost of Run</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-black">Current</div>
                                <CustomField name="currentCost" className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-black" disabled />

                                <div className="text-black">Proposed</div>
                                <CustomField name="proposedCost" className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-black" disabled />
                            </div>
                        </AccordionDetails>
                    </Accordion>

                    {/* Machine Configuration Section */}
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="machine-config-content"
                            id="machine-config-header"
                        >
                            <Typography className="text-md font-semibold text-black">Machine Configuration</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="font-medium text-gray-600">Type</div>
                                <div className="font-medium text-gray-600">Current</div>
                                <div className="font-medium text-gray-600">Proposed</div>
                                <div className="font-medium text-gray-600">Override</div>

                                <div className="text-black">Master</div>
                                <CustomField name="masterCurrent" className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-black" disabled />
                                <CustomField name="masterProposed" className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-black" disabled />
                                <CustomField name="masterOverride" className="border border-gray-300 rounded px-3 py-2 bg-white text-black" />

                                <div className="text-black">Worker</div>
                                <CustomField name="workerCurrent" className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-black" disabled />
                                <CustomField name="workerProposed" className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-black" disabled />
                                <CustomField name="workerOverride" className="border border-gray-300 rounded px-3 py-2 bg-white text-black" />
                            </div>
                        </AccordionDetails>
                    </Accordion>

                    {/* Spark Tuning Section */}
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="spark-tuning-content"
                            id="spark-tuning-header"
                        >
                            <Typography className="text-md font-semibold text-black">Spark Tuning</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="font-medium text-gray-600">Parameter</div>
                                <div className="font-medium text-gray-600">Current</div>
                                <div className="font-medium text-gray-600">Proposed</div>
                                <div className="font-medium text-gray-600">Override</div>

                                <div className="text-black">Executors</div>
                                <CustomField name="executorsCurrent" className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-black" disabled />
                                <CustomField name="executorsProposed" className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-black" disabled />
                                <CustomField name="executorsOverride" className="border border-gray-300 rounded px-3 py-2 bg-white text-black" />

                                <div className="text-black">Memory</div>
                                <CustomField name="memoryCurrent" className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-black" disabled />
                                <CustomField name="memoryProposed" className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-black" disabled />
                                <CustomField name="memoryOverride" className="border border-gray-300 rounded px-3 py-2 bg-white text-black" />
                            </div>
                        </AccordionDetails>
                    </Accordion>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            onClick={onClose}
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 transition"
                        >
                            Reject
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
                        >
                            Accept
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};
