import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import { Formik, Form, Field } from 'formik';
import useToast from '@/oldcomponents/teast-service';
import CustomField from '@/common/CustomField';

interface CostOptimizationFormProps {
    open: boolean;
    jobDetail: any;
    onClose: () => void;
}

const CostOptimizationForm: React.FC<CostOptimizationFormProps> = ({ open, onClose }) => {
    const [ToastComponent, showToast]: any = useToast();
    return (
        <Dialog open={open} onClose={onClose} sx={{ borderRadius: 4 }} maxWidth={'md'}>
            <CostOptimization onClose={onClose}/>
        </Dialog>
    );
};

export default CostOptimizationForm;

const CostOptimization = ({onClose}:any) => {
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

    return (
        <div className="max-w-92 mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-8">
                <h4 className="text-lg font-semibold text-gray-800">Cost Optimization for Daily Job</h4>
                <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <Formik initialValues={initialValues} onSubmit={(values) => console.log(values)}>
                <Form className="space-y-4"> {/* Reduced spacing */}
                    {/* Metrics Section */}
                    <div>
                        <div className="grid grid-cols-3  rounded-md "> {/* Reduced padding and gap */}
                            <div className="font-medium p-2 text-gray-600 bg-gray-100">Metrics</div>
                            <div className="font-medium p-2 text-gray-600 bg-gray-100">Recommended</div>
                            <div className="font-medium p-2 text-gray-600 bg-gray-100">Actual</div>
                            <div className='p-2'>CPU Utilization</div>
                            <div className='p-2'>&gt;80%</div>
                            <CustomField name="cpuUtilization" className="border rounded px-1 w-full" disabled /> {/* Smaller padding */}
                            <div className='p-2'>IOPS</div>
                            <div className='p-2'>&gt;50%</div>
                            <CustomField name="iops" className="border rounded px-1 w-full" disabled />
                            <div className='p-2'>Disk Usage</div>
                            <div className='p-2'>&gt;50%</div>
                            <CustomField name="diskUsage" className="border rounded px-1 w-full" disabled />
                        </div>
                    </div>

                    <div className='rounded shadow-sm'>
                        <h5 className="text-md font-semibold text-gray-700  p-2 rounded-md bg-gray-100">Cost of Run</h5>
                        <div className="grid grid-cols-2 gap-2 p-2  rounded-md"> {/* Reduced padding and gap */}
                            <div>Current</div>
                            <CustomField name="currentCost" disabled />
                            <div>Proposed</div>
                            <CustomField name="proposedCost" disabled />
                        </div>
                    </div>

                    {/* Machine Configuration Section */}
                    <div className='rounded shadow-sm'>
                        <h5 className="text-md font-semibold text-gray-700  p-2 rounded-md bg-gray-100">Machine Configuration</h5>
                        <div className="grid grid-cols-4 gap-2 p-2  rounded-md"> {/* Reduced padding and gap */}
                            <div className="font-medium text-gray-600">Type</div>
                            <div className="font-medium text-gray-600">Current</div>
                            <div className="font-medium text-gray-600">Proposed</div>
                            <div className="font-medium text-gray-600">Override</div>
                            <div>Master</div>
                            <CustomField name="masterCurrent" disabled />
                            <CustomField name="masterProposed" disabled />
                            <CustomField name="masterOverride" />
                            <div>Worker</div>
                            <CustomField name="workerCurrent" disabled />
                            <CustomField name="workerProposed" disabled />
                            <CustomField name="workerOverride" />
                        </div>
                    </div>

                    {/* Spark Tuning Section */}
                    <div className='rounded shadow-sm'>
                        <h5 className="text-md font-semibold text-gray-700 bg-gray-100 p-2 rounded-md">Spark Tuning</h5>
                        <div className="grid grid-cols-4 gap-2 p-2 rounded-md"> {/* Reduced padding and gap */}
                            <div className="font-medium text-gray-600">Parameter</div>
                            <div className="font-medium text-gray-600">Current</div>
                            <div className="font-medium text-gray-600">Proposed</div>
                            <div className="font-medium text-gray-600">Override</div>
                            <div>Executors</div>
                            <CustomField name="executorsCurrent" disabled />
                            <CustomField name="executorsProposed" disabled />
                            <CustomField name="executorsOverride" />
                            <div>Memory</div>
                            <CustomField name="memoryCurrent" disabled />
                            <CustomField name="memoryProposed" disabled />
                            <CustomField name="memoryOverride" />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2"> {/* Reduced space between buttons */}
                        <button onClick={onClose} type="button" className="px-3 py-2 border rounded-md text-gray-600 hover:bg-gray-100">
                            Reject
                        </button>
                        <button onClick={onClose} type="submit" className="px-3 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700">
                            Accept
                        </button>
                    </div>
                </Form>
            </Formik>

        </div>
    );
};
