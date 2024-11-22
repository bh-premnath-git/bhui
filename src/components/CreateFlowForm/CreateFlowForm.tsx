import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { IntervalModalComponent, IntervalModalRef, IntervalState } from "@/components/IntervalModal";
import { Spinner } from "@/components/ui/spinner";
import { useAppSelector } from '@/redux/hooks';
import { omitSpaceSymbolNumeric } from '@/Utils/stringOmission';

// Types
interface Project {
  ProjectId: string;
  Name: string;
  BranchNames: string[];
}

interface Environment {
  id: string;
  envName: string;
}

interface CreateFlowFormProps {
  onClose: () => void;
  onCreateFlow: (payload: CreateFlowPayload) => void;
  isLoading: boolean;
}

interface CreateFlowPayload {
  flow_name: string;
  flow_key: string;
  git_branch: string;
  bh_project_id: number;
  metadata_flow: string;
  bh_env_id: number;
  flow_class: number;
  job: string;
  schedule_interval: {
    schedule_type: string;
    time: IntervalState;
  };
  recipent_emails: string;
}

interface FormValues {
  selectedProject: string;
  selectedBranch: string;
  name: string;
  selectedEnvironment: string;
  selectedClass: string;
  recipientEmail: string;
  notes: string;
  onJobStart: boolean;
  onJobFailure: boolean;
  onJobSuccess: boolean;
}

// Validation schema
const validationSchema = Yup.object().shape({
  selectedProject: Yup.string().required('Project is required'),
  selectedBranch: Yup.string().required('Branch is required'),
  name: Yup.string().required('Name is required'),
  selectedEnvironment: Yup.string().required('Environment is required'),
  selectedClass: Yup.string().required('Class is required'),
  recipientEmail: Yup.string().email('Invalid email').required('Recipient email is required'),
});

const CreateFlowForm: React.FC<CreateFlowFormProps> = ({ onClose, onCreateFlow, isLoading }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [scheduleInterval, setScheduleInterval] = useState<CreateFlowPayload['schedule_interval']>({
    schedule_type: 'minutes',
    time: {
      selectedInterval: "minutes",
      repeatEvery: "1",
      repeatAt: "12:00",
      selectedDays: ["Sun"],
      selectedMonth: "January",
      selectedDate: "1"
    },
  });

  const intervalModalRef = useRef<IntervalModalRef>(null);
  const { flowProjectList: data, environments: envData } = useAppSelector((state) => state.flowApi);

  const formatScheduleDisplay = (schedule: typeof scheduleInterval) => {
    const { schedule_type, time } = schedule;
    const parts = [schedule_type];
    
    if (time.repeatEvery !== "1") {
      parts.push(`Every ${time.repeatEvery}`);
    }
    
    if (time.repeatAt) {
      parts.push(`at ${time.repeatAt}`);
    }
    
    if (schedule_type === 'weekly' && time.selectedDays.length > 0) {
      parts.push(`on ${time.selectedDays.join(', ')}`);
    }
    
    if (schedule_type === 'monthly' || schedule_type === 'yearly') {
      parts.push(`on ${time.selectedDate}`);
    }
    
    if (schedule_type === 'yearly') {
      parts.push(time.selectedMonth);
    }
    
    return parts.join(' ');
  };

  const handleIntervalSave = (interval: string) => {
    const parsedInterval = JSON.parse(interval);
    setScheduleInterval({
      schedule_type: parsedInterval.selectedInterval.toLowerCase(),
      time: parsedInterval,
    });
  };

  const handleIntervalStateChange = (state: IntervalState) => {
    // Optional: Handle intermediate state changes if needed
  };

  const openIntervalModal = () => {
    if (intervalModalRef.current) {
      intervalModalRef.current.open();
    }
  };

  const initialValues: FormValues = {
    selectedProject: '',
    selectedBranch: '',
    name: '',
    selectedEnvironment: '',
    selectedClass: '',
    recipientEmail: '',
    notes: '',
    onJobStart: true,
    onJobFailure: false,
    onJobSuccess: false,
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-l font-medium mb-6">Create Flow</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          const payload: CreateFlowPayload = {
            flow_name: values.name,
            flow_key: omitSpaceSymbolNumeric(values.name),
            git_branch: values.selectedBranch,
            bh_project_id: Number(values.selectedProject),
            metadata_flow: values.notes,
            bh_env_id: Number(values.selectedEnvironment),
            flow_class: Number(values.selectedClass),
            job: 'on_job_start',
            schedule_interval: scheduleInterval,
            recipent_emails: values.recipientEmail,
          };
          onCreateFlow(payload);
          setSubmitting(false);
        }}
      >
        {({ values, setFieldValue }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="selectedProject">Project*</Label>
                <Field name="selectedProject">
                  {({ field, form }: any) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => {
                        form.setFieldValue('selectedProject', Number(value));
                      }}
                    >
                      <SelectTrigger id="selectedProject">
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.map((project: any) => (
                          <SelectItem key={project.ProjectId} value={project.ProjectId}>
                            {project.Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
                <ErrorMessage name="selectedProject" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div>
                <Label htmlFor="selectedBranch">Branch*</Label>
                <Field name="selectedBranch">
                  {({ field }: any) => (
                    <Input
                      id="selectedBranch"
                      placeholder="Enter Branch"
                      {...field}
                    />
                  )}
                </Field>
                <ErrorMessage name="selectedBranch" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div>
                <Label htmlFor="name">Name*</Label>
                <Field name="name">
                  {({ field }: any) => (
                    <Input
                      id="name"
                      placeholder="Enter Name"
                      {...field}
                    />
                  )}
                </Field>
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="selectedEnvironment">Environment Name*</Label>
                <Field name="selectedEnvironment">
                  {({ field, form }: any) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => form.setFieldValue('selectedEnvironment', Number(value))}
                    >
                      <SelectTrigger id="selectedEnvironment">
                        <SelectValue placeholder="Select Environment" />
                      </SelectTrigger>
                      <SelectContent>
                        {envData.map((env: Environment) => (
                          <SelectItem key={env.id} value={env.id}>
                            {env.envName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
                <ErrorMessage name="selectedEnvironment" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div>
                <Label htmlFor="selectedClass">Class*</Label>
                <Field name="selectedClass">
                  {({ field, form }: any) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => form.setFieldValue('selectedClass', value)}
                    >
                      <SelectTrigger id="selectedClass">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Small</SelectItem>
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="3">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </Field>
                <ErrorMessage name="selectedClass" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div>
                <Label htmlFor="schedule">Schedule</Label>
                <div className="relative">
                  <Input
                    id="schedule"
                    placeholder="Schedule Interval"
                    value={formatScheduleDisplay(scheduleInterval)}
                    readOnly
                    onClick={openIntervalModal}
                    className="cursor-pointer"
                  />
                  <Clock
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                    size={20}
                    onClick={openIntervalModal}
                  />
                </div>
              </div>
            </div>
            <div>
              <button
                type="button"
                className="text-blue-600 flex items-center"
                onClick={() => setShowNotes(!showNotes)}
              >
                Add Notes {showNotes ? <ChevronUp className="ml-1" size={16} /> : <ChevronDown className="ml-1" size={16} />}
              </button>
              {showNotes && (
                <Field name="notes">
                  {({ field }: any) => (
                    <textarea
                      className="mt-2 w-full p-2 border rounded-md"
                      placeholder="Enter notes here..."
                      rows={3}
                      {...field}
                    />
                  )}
                </Field>
              )}
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Select Alert Settings</h3>
              <div>
                <Label htmlFor="recipientEmail">Recipient Email ID *</Label>
                <Field name="recipientEmail">
                  {({ field }: any) => (
                    <Input
                      id="recipientEmail"
                      placeholder="Enter Recipient Email ID"
                      {...field}
                    />
                  )}
                </Field>
                <ErrorMessage name="recipientEmail" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div className="mt-4 flex space-x-6">
                <div className="flex items-center space-x-2">
                  <Field name="onJobStart" type="checkbox">
                    {({ field }: any) => (
                      <Checkbox
                        id="onJobStart"
                        checked={field.value}
                        onCheckedChange={(checked) => setFieldValue('onJobStart', checked)}
                        className="border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                    )}
                  </Field>
                  <label htmlFor="onJobStart">On Job Start</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Field name="onJobFailure" type="checkbox">
                    {({ field }: any) => (
                      <Checkbox
                        id="onJobFailure"
                        checked={field.value}
                        onCheckedChange={(checked) => setFieldValue('onJobFailure', checked)}
                        className="border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                    )}
                  </Field>
                  <label htmlFor="onJobFailure">On Job Failure</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Field name="onJobSuccess" type="checkbox">
                    {({ field }: any) => (
                      <Checkbox
                        id="onJobSuccess"
                        checked={field.value}
                        onCheckedChange={(checked) => setFieldValue('onJobSuccess', checked)}
                        className="border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                    )}
                  </Field>
                  <label htmlFor="onJobSuccess">On Job Success</label>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-4 mt-6">
              <Button variant="outline" type="button" onClick={onClose}>
                Close
              </Button>
              <Button className="bg-black text-white hover:bg-gray-800" type="submit" disabled={isLoading}>
                {isLoading ? <Spinner /> : "Create Flow"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
      <IntervalModalComponent
        ref={intervalModalRef}
        onSave={handleIntervalSave}
        onStateChange={handleIntervalStateChange}
        initialState={scheduleInterval.time}
      />
    </div>
  );
};

export default CreateFlowForm;