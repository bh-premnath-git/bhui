import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, PlusCircle, X } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import * as Yup from 'yup';
import { Spinner } from "@/components/ui/spinner";
import { useAppSelector } from '@/redux/hooks';
import RequiredLabel from '@/components/RequiredFieldLabel';

// Types
type Tag = {
  tagList: { key: string; value: string }[];
};

interface Project {
  ProjectId: string;
  Name: string;
}

interface CreateFlowFormProps {
  onClose: () => void;
  onCreateFlow: (payload: CreateFlowPayload) => void;
  isLoading: boolean;
}

interface CreateFlowPayload {
  flow_name: string;
  recipient_email: Record<string, string[]>; 
  notes: string;
  tags: Tag;
  bh_project_id: number;
  alert_settings: {
    on_job_start: boolean;
    on_job_failure: boolean;
    on_job_success: boolean;
    on_job_in_progress: boolean;
  };
  flow_json: Record<string, any>;
}

interface FormValues {
  selectedProject: string;
  name: string;
  recipientEmails: string[]; // Changed to string array
  notes: string;
  alert_settings: {
    on_job_start: boolean;
    on_job_failure: boolean;
    on_job_success: boolean;
    on_job_in_progress: boolean;
  };
}

// Multiple Email Input Component
const MultipleEmailInput: React.FC<{
  value: string[];
  onChange: (emails: string[]) => void;
  error?: string;
}> = ({ value, onChange, error }) => {
  const [inputValue, setInputValue] = useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Handle comma separation
    if (newValue.includes(',')) {
      const emails = newValue.split(',')
        .map(email => email.trim())
        .filter(email => email && validateEmail(email) && !value.includes(email));
      if (emails.length > 0) {
        onChange([...value, ...emails]);
        setInputValue('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      const trimmedEmail = inputValue.trim();
      if (validateEmail(trimmedEmail) && !value.includes(trimmedEmail)) {
        onChange([...value, trimmedEmail]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeEmail = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((email, index) => (
          <Badge key={index} variant="secondary" className="px-2 py-1 text-white">
            {email}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-4 w-4 p-0"
              onClick={() => removeEmail(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter email and press Enter or comma to add"
        className="w-full"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

// Tag Input Component
const TagInput: React.FC<{
  tags: Tag;
  setTags: React.Dispatch<React.SetStateAction<Tag>>;
}> = ({ tags, setTags }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagKey, setTagKey] = useState("");
  const [tagValue, setTagValue] = useState("");

  const removeTag = (itemIndex: number) => {
    setTags(prevTags => ({
      tagList: prevTags.tagList.filter((_, index) => index !== itemIndex)
    }));
  };

  const addTag = () => {
    if (tagKey && tagValue) {
      setTags(prevTags => ({
        tagList: [...prevTags.tagList, { key: tagKey, value: tagValue }]
      }));
      setTagKey("");
      setTagValue("");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Add tags to help organize and identify your flows
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.tagList.map((item, index) => (
          <Badge key={index} variant="secondary" className="px-2 py-1 text-white">
            {`${item.key} >> ${item.value}`}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-4 w-4 p-0"
              onClick={() => removeTag(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center text-emerald-500 hover:text-emerald-600 transition-colors duration-200"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            ADD TAG
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[385px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add New Tag</DialogTitle>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="tagKey" className="text-sm font-medium">
                Key
              </Label>
              <Input
                id="tagKey"
                value={tagKey}
                onChange={(e) => setTagKey(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="tagValue" className="text-sm font-medium">
                Value
              </Label>
              <Input
                id="tagValue"
                value={tagValue}
                onChange={(e) => setTagValue(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button onClick={addTag} className="w-full bg-black text-white hover:bg-gray-800">
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Validation Schema
const validationSchema = Yup.object().shape({
  selectedProject: Yup.string().required('Project is required'),
  name: Yup.string().required('Name is required'),
  recipientEmails: Yup.array()
    .of(Yup.string().email('Invalid email'))
    .min(1, 'At least one email is required')
    .required('Recipient email is required'),
});

// Main Form Component
const CreateFlowForm: React.FC<CreateFlowFormProps> = ({ onClose, onCreateFlow, isLoading }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [tags, setTags] = useState<Tag>({ tagList: [] });
  const { flowProjectList: data } = useAppSelector((state) => state.flowApi);

  const initialValues: FormValues = {
    selectedProject: '',
    name: '',
    recipientEmails: [],
    notes: '',
    alert_settings: {
      on_job_start: false,
      on_job_failure: false,
      on_job_success: false,
      on_job_in_progress: false,
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg w-full">
      <h2 className="text-2xl font-semibold mb-6">Create Flow</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          const payload: CreateFlowPayload = {
            flow_name: values.name,
            bh_project_id: Number(values.selectedProject),
            notes: values.notes,
            recipient_email:{email: values.recipientEmails},
            tags: tags,
            alert_settings: values.alert_settings,
            flow_json: {}
          };
          onCreateFlow(payload);
          setSubmitting(false);
        }}
      >
        {({ values, setFieldValue, errors }) => (
          <Form className="space-y-3">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <RequiredLabel>
                  <Label htmlFor="selectedProject" className="text-sm font-medium">Project</Label>
                </RequiredLabel>
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
                        {data.map((project: Project) => (
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
                <RequiredLabel>
                  <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                </RequiredLabel>
                <Field name="name">
                  {({ field }: any) => (
                    <Input
                      id="name"
                      placeholder="Enter Flow Name"
                      {...field}
                      className="w-full"
                    />
                  )}
                </Field>
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>
            </div>

            <div>
              <button
                type="button"
                className="text-blue-600 flex items-center font-medium"
                onClick={() => setShowNotes(!showNotes)}
              >
                {showNotes ? 'Hide Notes' : 'Add Notes'}
                {showNotes ? <ChevronUp className="ml-1" size={16} /> : <ChevronDown className="ml-1" size={16} />}
              </button>
              {showNotes && (
                <Field name="notes">
                  {({ field }: any) => (
                    <textarea
                      className="mt-2 w-full p-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter notes here..."
                      rows={4}
                      {...field}
                    />
                  )}
                </Field>
              )}
            </div>

            <div className="space-y-4">
              <TagInput tags={tags} setTags={setTags} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Alert Settings</h3>
              <div>
                <RequiredLabel>
                  <Label htmlFor="recipientEmails" className="text-sm font-medium">
                    Recipient Email IDs
                  </Label>
                </RequiredLabel>
                <MultipleEmailInput
                  value={values.recipientEmails}
                  onChange={(emails) => setFieldValue('recipientEmails', emails)}
                  error={errors.recipientEmails as string}
                />
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Field name="alert_settings.on_job_start" type="checkbox">
                    {({ field }: any) => (
                      <Checkbox
                        id="on_job_start"
                        checked={field.value}
                        onCheckedChange={(checked) => setFieldValue('alert_settings.on_job_start', checked)}
                        className="border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                    )}
                  </Field>
                  <label htmlFor="on_job_start" className="text-sm">On Job Start</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Field name="alert_settings.on_job_failure" type="checkbox">
                    {({ field }: any) => (
                      <Checkbox
                        id="on_job_failure"
                        checked={field.value}
                        onCheckedChange={(checked) => setFieldValue('alert_settings.on_job_failure', checked)}
                        className="border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                    )}
                  </Field>
                  <label htmlFor="on_job_failure" className="text-sm">On Job Failure</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Field name="alert_settings.on_job_success" type="checkbox">
                    {({ field }: any) => (
                      <Checkbox
                        id="on_job_success"
                        checked={field.value}
                        onCheckedChange={(checked) => setFieldValue('alert_settings.on_job_success', checked)}
                        className="border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                    )}
                  </Field>
                  <label htmlFor="on_job_success" className="text-sm">On Job Success</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Field name="alert_settings.on_job_in_progress" type="checkbox">
                    {({ field }: any) => (
                      <Checkbox
                        id="on_job_in_progress"
                        checked={field.value}
                        onCheckedChange={(checked) => setFieldValue('alert_settings.on_job_in_progress', checked)}
                        className="border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                    )}
                  </Field>
                  <label htmlFor="on_job_in_progress" className="text-sm">On Job InProgress</label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button className="bg-black text-white hover:bg-gray-800" type="submit" disabled={isLoading}>
                {isLoading ? <Spinner /> : "Create Flow"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateFlowForm;