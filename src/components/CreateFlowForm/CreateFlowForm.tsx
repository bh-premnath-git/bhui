import React, { useState, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, PlusCircle, X, AlertTriangle } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as Yup from 'yup';
import { Spinner } from "@/components/ui/spinner";
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import RequiredLabel from '@/components/RequiredFieldLabel';
import { clearSearchResults, searchFlow } from '@/redux/FlowSlice';
import { jwtDecode } from 'jwt-decode';

// Types

type Tag = {
  tagList: { key: string; value: string }[];
};

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
  bh_env_id: number;
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
  selectedEnvironment: string;
  name: string;
  recipientEmails: string[];
  notes: string;
  alert_settings: {
    on_job_start: boolean;
    on_job_failure: boolean;
    on_job_success: boolean;
    on_job_in_progress: boolean;
  };
}

interface MultipleEmailInputProps {
  value: string[];
  onChange: (emails: string[]) => void;
  error?: string;
}

interface TagInputProps {
  tags: Tag;
  setTags: React.Dispatch<React.SetStateAction<Tag>>;
}

interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  borderColor: string;
  titleColor: string;
  hasError?: boolean;
}

interface FlowSearchResult {
  exists: boolean;
  flowName: string;
}

// Validation Schema
const validationSchema = Yup.object().shape({
  selectedProject: Yup.string().required('Project is required'),
  selectedEnvironment: Yup.string().required('Environment is required'),
  name: Yup.string()
    .required('Flow name is required')
    .min(2, 'Flow name must be at least 2 characters')
    .max(50, 'Flow name must not exceed 50 characters'),
  recipientEmails: Yup.array()
    .of(Yup.string().email('Invalid email'))
    .min(1, 'At least one email is required')
    .required('Recipient email is required'),
});

// Accordion Section Component
const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  isOpen,
  onToggle,
  children,
  borderColor,
  titleColor,
  hasError = false,
}) => {
  return (
    <Card className={`border-${borderColor} transition-all duration-200`}>
      <CardHeader className="cursor-pointer hover:bg-gray-50" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg font-semibold ${titleColor}`}>
            {title}
            {hasError && <AlertTriangle className="ml-2 h-5 w-5 text-red-500 inline" />}
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </CardHeader>
      <div
        className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[500px]' : 'max-h-0'
          }`}
      >
        <CardContent className="space-y-4">{children}</CardContent>
      </div>
    </Card>
  );
};

// Multiple Email Input Component
const MultipleEmailInput: React.FC<MultipleEmailInputProps> = ({
  value,
  onChange,
  error,
}) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const token = sessionStorage?.getItem("token");
    const decoded: any = token ? jwtDecode(token) : null;
    const decodedEmail = decoded?.email;

    if (decodedEmail && value.length === 0) {
      onChange([decodedEmail]);
    }
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue.includes(',')) {
      const emails = newValue
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email && validateEmail(email) && !value.includes(email));
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
          <Badge key={index} variant="secondary" className="px-2 py-1 bg-blue-100 text-blue-800">
            {email}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-4 w-4 p-0 hover:text-red-500"
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
        className="w-full border-blue-200 focus:ring-blue-500"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

// Tag Input Component
const TagInput: React.FC<TagInputProps> = ({ tags, setTags }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagKey, setTagKey] = useState('');
  const [tagValue, setTagValue] = useState('');

  const removeTag = (itemIndex: number) => {
    setTags((prevTags) => ({
      tagList: prevTags.tagList.filter((_, index) => index !== itemIndex),
    }));
  };

  const addTag = () => {
    if (tagKey && tagValue) {
      setTags((prevTags) => ({
        tagList: [...prevTags.tagList, { key: tagKey, value: tagValue }],
      }));
      setTagKey('');
      setTagValue('');
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
          <Badge
            key={index}
            variant="secondary"
            className="px-2 py-1 bg-purple-100 text-purple-800"
          >
            {`${item.key} >> ${item.value}`}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-4 w-4 p-0 hover:text-red-500"
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
            className="flex items-center text-purple-600 hover:text-purple-700 transition-colors duration-200"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            ADD TAG
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[385px]" aria-describedby="flowcreation">
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
            <Button
              onClick={addTag}
              className="w-full bg-purple-600 text-white hover:bg-purple-700"
            >
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Main Form Component
const CreateFlowForm: React.FC<CreateFlowFormProps> = ({
  onClose,
  onCreateFlow,
  isLoading,
}) => {
  const dispatch = useAppDispatch();
  const [showNotes, setShowNotes] = useState(false);
  const [tags, setTags] = useState<Tag>({ tagList: [] });
  const [flowExistsModalOpen, setFlowExistsModalOpen] = useState(false);
  const { environments, flowProjectList: projects, searchedFlow, searchLoading } = useAppSelector(
    (state) => state.flowApi
  );

  // Accordion state
  const [openSections, setOpenSections] = useState({
    basicInfo: true,
    additionalDetails: false,
    notifications: false,
  });

  // Modified toggleSection function:
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => {
      const isCurrentlyOpen = prev[section];
      // Close all sections first
      const newState = {
        basicInfo: false,
        additionalDetails: false,
        notifications: false,
      };
      // Toggle the clicked section
      newState[section] = !isCurrentlyOpen;
      return newState;
    });
  };

  const debouncedSearchFlow = useMemo(
    () =>
      debounce((flowName: string) => {
        if (flowName.length >= 3) {
          dispatch(searchFlow(flowName));
        } else {
          dispatch(clearSearchResults());
        }
      }, 500),
    [dispatch]
  );

  const handleFlowNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    e.preventDefault();
    const flowName = e.target.value;
    setFieldValue('name', flowName);

    // Clear search results if input is too short
    if (flowName.length < 3) {
      setFlowExistsModalOpen(false);
      dispatch(clearSearchResults());
      return;
    }

    debouncedSearchFlow(flowName);
  };

  useEffect(() => {
    return () => {
      debouncedSearchFlow.cancel(); // Cleanup debounce on unmount
    };
  }, [debouncedSearchFlow]);

  useEffect(() => {
    if (Array.isArray(searchedFlow) && searchedFlow.length > 0) {
      setFlowExistsModalOpen(true);
    } else {
      setFlowExistsModalOpen(false);
    }
  }, [searchedFlow]);

  const initialValues: FormValues = {
    selectedProject: '',
    selectedEnvironment: '',
    name: '',
    recipientEmails: [],
    notes: '',
    alert_settings: {
      on_job_start: false,
      on_job_failure: true,
      on_job_success: false,
      on_job_in_progress: false,
    },
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
      <div className="border-b pb-2 mb-2">
        <h2 className="text-3xl font-bold text-gray-800">Create Flow</h2>
        <p className="text-gray-500 mt-0">
          Configure your flow settings and notifications
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          const payload: CreateFlowPayload = {
            flow_name: values.name,
            bh_project_id: Number(values.selectedProject),
            bh_env_id: Number(values.selectedEnvironment),
            notes: values.notes,
            recipient_email: { email: values.recipientEmails },
            tags: tags,
            alert_settings: values.alert_settings,
            flow_json: {},
          };
          onCreateFlow(payload);
          setSubmitting(false);
        }}
      >
        {({ values, setFieldValue, errors, isValid, isSubmitting }) => {
          // Determine if there are errors in each section
          const hasError = (errorFields: string[]) => {
            return errorFields.some((field) => {
              const error = field.split('.').reduce((acc, curr) => {
                return acc ? acc[curr] : null;
              }, errors as any);
              return !!error;
            });
          };

          const basicInfoHasError = hasError([
            'selectedProject',
            'selectedEnvironment',
            'name',
          ]);

          const notificationsHasError = hasError(['recipientEmails']);

          return (
            <Form className="space-y-2">
              <AccordionSection
                title="Basic Information"
                isOpen={openSections.basicInfo}
                onToggle={() => toggleSection('basicInfo')}
                borderColor="blue-100"
                titleColor="text-blue-800"
                hasError={basicInfoHasError}
              >
                <div className="grid grid-cols-2 gap-4 ">
                  <div>
                    <RequiredLabel>
                      <Label htmlFor="selectedProject" className="text-sm font-medium mb-2">
                        Project
                      </Label>
                    </RequiredLabel>
                    <Field name="selectedProject">
                      {({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(value) => setFieldValue('selectedProject', value)}
                        >
                          <SelectTrigger id="selectedProject" className="border-blue-200">
                            <SelectValue placeholder="Select Project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem
                                key={project.ProjectId}
                                value={project.ProjectId.toString()}
                              >
                                {project.Name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage
                      name="selectedProject"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <RequiredLabel>
                      <Label htmlFor="selectedEnvironment" className="text-sm font-medium mb-2">
                        Environment
                      </Label>
                    </RequiredLabel>
                    <Field name="selectedEnvironment">
                      {({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(value) => setFieldValue('selectedEnvironment', value)}
                        >
                          <SelectTrigger id="selectedEnvironment" className="border-blue-200">
                            <SelectValue placeholder="Select Environment" />
                          </SelectTrigger>
                          <SelectContent>
                            {environments.map((env) => (
                              <SelectItem key={env.id} value={env.id.toString()}>
                                {env.envName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage
                      name="selectedEnvironment"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <RequiredLabel>
                      <Label htmlFor="name" className="text-sm font-medium mb-2 relative">
                        Flow Name
                      </Label>
                    </RequiredLabel>
                    <Field name="name">
                      {({ field }) => (
                        <div>
                          <Input
                            id="name"
                            placeholder="Enter Flow Name"
                            {...field} // Spread Formik's field props first
                            onChange={(e) => handleFlowNameChange(e, setFieldValue)}
                            className="border-blue-200 focus:ring-blue-500"
                          />
                          {flowExistsModalOpen && (
                            <span className="absolute right-12 top-1/2 -translate-y-1/2 mr-3 text-red-500">
                              ⚠️ Name exists
                            </span>
                          )}
                        </div>
                      )}
                    </Field>
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>
              </AccordionSection>

              <AccordionSection
                title="Additional Details"
                isOpen={openSections.additionalDetails}
                onToggle={() => toggleSection('additionalDetails')}
                borderColor="purple-100"
                titleColor="text-purple-800"
              >
                <div>
                  <button
                    type="button"
                    className="text-purple-600 flex items-center font-medium hover:text-purple-700 transition-colors"
                    onClick={() => setShowNotes(!showNotes)}
                  >
                    {showNotes ? 'Hide Notes' : 'Add Notes'}
                    {showNotes ? (
                      <ChevronUp className="ml-1" size={16} />
                    ) : (
                      <ChevronDown className="ml-1" size={16} />
                    )}
                  </button>
                  {showNotes && (
                    <Field name="notes">
                      {({ field }) => (
                        <textarea
                          className="mt-2 w-full p-3 border border-purple-200 rounded-md resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter notes here..."
                          rows={4}
                          {...field}
                        />
                      )}
                    </Field>
                  )}
                </div>
                <TagInput tags={tags} setTags={setTags} />
              </AccordionSection>

              <AccordionSection
                title="Notification Settings"
                isOpen={openSections.notifications}
                onToggle={() => toggleSection('notifications')}
                borderColor="green-100"
                titleColor="text-green-800"
                hasError={notificationsHasError}
              >
                <div>
                  <RequiredLabel>
                    <Label htmlFor="recipientEmails" className="text-sm font-medium mb-2">
                      Recipient Email IDs
                    </Label>
                  </RequiredLabel>
                  <MultipleEmailInput
                    value={values.recipientEmails}
                    onChange={(emails) => setFieldValue('recipientEmails', emails)}
                    error={errors.recipientEmails as string}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(values.alert_settings).map(([key]) => (
                    <div
                      key={key}
                      className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg hover:bg-green-100 transition-colors duration-200"
                    >
                      <Field name={`alert_settings.${key}`} type="checkbox">
                        {({ field }) => (
                          <Checkbox
                            id={key}
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              setFieldValue(`alert_settings.${key}`, checked)
                            }
                            className="border-green-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          />
                        )}
                      </Field>
                      <label htmlFor={key} className="text-sm capitalize">
                        {key.split('_').join(' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionSection>

              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={onClose}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-slate-600 to-black hover:from-slate-700 hover:to-black text-white"
                  type="submit"
                  disabled={!isValid || isSubmitting || isLoading}
                >
                  {isLoading ? <Spinner /> : 'Create Flow'}
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default CreateFlowForm;
