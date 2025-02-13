import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounce } from 'use-debounce';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    ChevronDown,
    ChevronUp,
    PlusCircle,
    X,
    AlertTriangle,
    Save,
    Loader
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { RequiredLabel } from '@/components/ui/required-fields';
import { clearSearchResults, searchFlow } from '@/store/oldstore/FlowSlice';
import { jwtDecode } from 'jwt-decode';

// Types
type Tag = {
    tagList: { key: string; value: string }[];
};

interface CreateFlowFormProps {
    onClose: () => void;
    onCreateFlow: (payload: CreateFlowPayload) => Promise<any>;
    isLoading: boolean;
}

interface CreateFlowPayload {
    flow_name: string;
    recipient_email: Record<string, string[]>;
    notes: string;
    tags: Tag;
    bh_project_id: number;
    bh_env_id: number;
    projectName: string;
    alert_settings: {
        on_job_start: boolean;
        on_job_failure: boolean;
        on_job_success: boolean;
        long_running: boolean;
    };
    flow_json: Record<string, any>;
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

// Zod Schema
const formSchema = z.object({
    selectedProject: z.string().nonempty('Project is required'),
    selectedEnvironment: z.string().nonempty('Environment is required'),
    name: z
        .string()
        .min(2, 'Flow name must be at least 2 characters')
        .max(50, 'Flow name must not exceed 50 characters'),
    recipientEmails: z
        .array(z.string().email('Invalid email'))
        .min(1, 'At least one email is required'),
    notes: z.string().optional(),
    alert_settings: z.object({
        on_job_start: z.boolean().default(false),
        on_job_failure: z.boolean().default(true),
        on_job_success: z.boolean().default(false),
        long_running: z.boolean().default(false),
    }),
});

type FormValues = z.infer<typeof formSchema>;

// Accordion Section Component
export const AccordionSection: React.FC<AccordionSectionProps> = ({
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
                        {hasError && (
                            <AlertTriangle className="ml-2 h-5 w-5 text-red-500 inline" />
                        )}
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
const MultipleEmailInput: React.FC<{
    value: string[];
    onChange: (emails: string[]) => void;
    error?: string;
}> = ({ value, onChange, error }) => {
    const [inputValue, setInputValue] = useState('');

    const validateEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    useEffect(() => {
        // Attempt to auto-fill from token if no emails are present
        const token = sessionStorage?.getItem("token");
        if (token) {
            const decoded: any = jwtDecode(token);
            const decodedEmail = decoded?.email;
            if (decodedEmail && value.length === 0) {
                onChange([decodedEmail]);
            }
        }
    }, [value, onChange]);

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
                    <Badge
                        key={index}
                        variant="secondary"
                        className="px-2 py-1 bg-blue-100 text-blue-800"
                    >
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
    const { environments, projects, searchedFlow, searchLoading } =
        useAppSelector((state) => state.flowApi);

    // Local states
    const [showNotes, setShowNotes] = useState(false);
    const [tags, setTags] = useState<Tag>({ tagList: [] });
    const [flowExistsModalOpen, setFlowExistsModalOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // React Hook Form
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors, isValid, isSubmitting },
        setValue,
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            selectedProject: '',
            selectedEnvironment: '',
            name: '',
            recipientEmails: [],
            notes: '',
            alert_settings: {
                on_job_start: false,
                on_job_failure: true,
                on_job_success: false,
                long_running: false,
            },
        },
        mode: 'onChange',
    });

    // Watch the name field, then debounce the value
    const nameValue = watch('name');
    const [debouncedNameValue] = useDebounce(nameValue, 500);

    // Trigger flow search when flow name changes
    useEffect(() => {
        if (debouncedNameValue && debouncedNameValue.length >= 3) {
            dispatch(searchFlow(debouncedNameValue));
        } else {
            dispatch(clearSearchResults());
        }
    }, [debouncedNameValue, dispatch]);

    // If search results return existing flows, show name-exists warning
    useEffect(() => {
        if (Array.isArray(searchedFlow) && searchedFlow.length > 0) {
            setFlowExistsModalOpen(true);
        } else {
            setFlowExistsModalOpen(false);
        }
    }, [searchedFlow]);

    // Accordion state
    const [openSections, setOpenSections] = useState({
        basicInfo: true,
        additionalDetails: false,
        notifications: false,
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections((prev) => {
            const isCurrentlyOpen = prev[section];
            const newState = {
                basicInfo: false,
                additionalDetails: false,
                notifications: false,
            };
            newState[section] = !isCurrentlyOpen;
            return newState;
        });
    };

    // Submit handler
    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        try {
            const selectedProjectObject = projects.find(
                (project) => project.bh_project_id.toString() === values.selectedProject
            );

            const payload: CreateFlowPayload = {
                flow_name: values.name,
                bh_project_id: Number(values.selectedProject),
                bh_env_id: Number(values.selectedEnvironment),
                notes: values.notes || '',
                recipient_email: { email: values.recipientEmails },
                tags,
                alert_settings: {
                    on_job_start: values.alert_settings?.on_job_start || false,
                    on_job_failure: values.alert_settings?.on_job_failure || false,
                    on_job_success: values.alert_settings?.on_job_success || false,
                    long_running: values.alert_settings?.long_running || false,
                },
                flow_json: {},
                projectName: selectedProjectObject?.bh_project_name || '',
            };

            const result = await onCreateFlow(payload);

            if (result instanceof Error) {
                setErrorMsg(result.message);
            } else {
                // Handle success if needed
            }
        } catch (error: any) {
            console.log(error);
            setErrorMsg(error?.message || 'An error occurred');
        }
    };

    // Helper function to check if a group of fields has errors
    const hasError = (fields: string[]) => {
        return fields.some((fieldPath) => {
            const segments = fieldPath.split('.');
            let current: any = errors;
            for (const segment of segments) {
                if (!current[segment]) {
                    return false;
                }
                current = current[segment];
            }
            return !!current;
        });
    };

    const basicInfoHasError = hasError([
        'selectedProject',
        'selectedEnvironment',
        'name',
    ]);
    const notificationsHasError = hasError(['recipientEmails']);

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white p-2 rounded-xl shadow-lg w-full max-w-4xl mx-auto">
            <div className="border-b pb-1 mb-1">
                <h2 className="text-xl font-bold text-gray-800">Create Flow</h2>
                <p className="text-gray-500 mt-0">
                    Configure your flow settings and notifications
                </p>
                {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                {/* BASIC INFO ACCORDION */}
                <AccordionSection
                    title="Basic Information"
                    isOpen={openSections.basicInfo}
                    onToggle={() => toggleSection('basicInfo')}
                    borderColor="blue-100"
                    titleColor="text-blue-800"
                    hasError={basicInfoHasError}
                >
                    <div className="grid grid-cols-2 gap-4">
                        {/* Project */}
                        <div>
                            <RequiredLabel>
                                <Label htmlFor="selectedProject" className="text-sm font-medium mb-2">
                                    Project
                                </Label>
                            </RequiredLabel>
                            <Controller
                                name="selectedProject"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={(val) => field.onChange(val)}
                                    >
                                        <SelectTrigger id="selectedProject" className="border-blue-200">
                                            <SelectValue placeholder="Select Project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects.map((project) => (
                                                <SelectItem
                                                    key={project.bh_project_id}
                                                    value={project.bh_project_id.toString()}
                                                >
                                                    {project.bh_project_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.selectedProject && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.selectedProject.message}
                                </p>
                            )}
                        </div>

                        {/* Environment */}
                        <div>
                            <RequiredLabel>
                                <Label htmlFor="selectedEnvironment" className="text-sm font-medium mb-2">
                                    Environment
                                </Label>
                            </RequiredLabel>
                            <Controller
                                name="selectedEnvironment"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={(val) => field.onChange(val)}
                                    >
                                        <SelectTrigger id="selectedEnvironment" className="border-blue-200">
                                            <SelectValue placeholder="Select Environment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                        {environments.map((env) =>(
                                                <SelectItem key={env.bh_env_id} value={env.bh_env_id.toString()}>
                                                    {env.bh_env_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.selectedEnvironment && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.selectedEnvironment.message}
                                </p>
                            )}
                        </div>

                        {/* Flow Name */}
                        <div className="relative">
                            <RequiredLabel>
                                <Label htmlFor="name" className="text-sm font-medium mb-2">
                                    Flow Name
                                </Label>
                            </RequiredLabel>
                            <Input
                                id="name"
                                placeholder="Enter Flow Name"
                                className="border-blue-200 focus:ring-blue-500"
                                {...register('name')}
                            />
                            {flowExistsModalOpen && (
                                <span className="absolute right-12 top-1/2 -translate-y-1/2 mr-3 text-red-500">
                                    ⚠️ Name exists
                                </span>
                            )}
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>
                    </div>
                </AccordionSection>

                {/* ADDITIONAL DETAILS ACCORDION */}
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
                            <textarea
                                className="mt-2 w-full p-3 border border-purple-200 rounded-md resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter notes here..."
                                rows={4}
                                {...register('notes')}
                            />
                        )}
                    </div>
                    <TagInput tags={tags} setTags={setTags} />
                </AccordionSection>

                {/* MONITOR SETTINGS ACCORDION */}
                <AccordionSection
                    title="Monitor Settings"
                    isOpen={openSections.notifications}
                    onToggle={() => toggleSection('notifications')}
                    borderColor="green-100"
                    titleColor="text-green-800"
                    hasError={notificationsHasError}
                >
                    <div className="space-y-6">
                        {/* Recipient Email IDs */}
                        <div>
                            <RequiredLabel>
                                <Label htmlFor="recipientEmails" className="text-sm font-medium mb-2">
                                    Recipient Email IDs
                                </Label>
                            </RequiredLabel>
                            <Controller
                                name="recipientEmails"
                                control={control}
                                render={({ field }) => (
                                    <MultipleEmailInput
                                        value={field.value}
                                        onChange={(val) => field.onChange(val)}
                                        error={errors.recipientEmails?.message}
                                    />
                                )}
                            />
                        </div>

                        {/* Alert Settings */}
                        <div>
                            <Label className="text-sm font-medium">Alert Settings</Label>
                            {/* First row: on_job_start, on_job_failure, on_job_success */}
                            <div className="flex gap-4 mt-2">
                                {['on_job_start', 'on_job_failure', 'on_job_success'].map((key) => (
                                    <Controller
                                        key={`alert_settings.${key}`}
                                        name={`alert_settings.${key as 'on_job_start' | 'on_job_failure' | 'on_job_success'}` as const}
                                        control={control}
                                        render={({ field }) => (
                                            <div
                                                className={`flex items-center space-x-2 p-3 rounded-lg hover:bg-green-50 transition-colors duration-200 ${field.value ? 'bg-green-50' : 'bg-gray-50'
                                                    }`}
                                            >
                                                <Checkbox
                                                    id={key}
                                                    checked={field.value}
                                                    onCheckedChange={(checked: boolean) => field.onChange(checked)}
                                                    className="border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                                />
                                                <label htmlFor={key} className="text-sm capitalize">
                                                    {key.replace(/_/g, ' ')}
                                                </label>
                                            </div>
                                        )}
                                    />
                                ))}
                            </div>
                            {/* Second row: long_running */}
                            <div className="flex gap-4 mt-2">
                                <Controller
                                    key="alert_settings.long_running"
                                    name="alert_settings.long_running"
                                    control={control}
                                    render={({ field }) => (
                                        <div
                                            className={`flex items-center space-x-2 p-3 rounded-lg hover:bg-green-50 transition-colors duration-200 ${field.value ? 'bg-green-50' : 'bg-gray-50'
                                                }`}
                                        >
                                            <Checkbox
                                                id="long_running"
                                                checked={field.value}
                                                onCheckedChange={(checked: boolean) => field.onChange(checked)}
                                                className="border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                            />
                                            <label htmlFor="long_running" className="text-sm capitalize">
                                                Delayed
                                            </label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </AccordionSection>

                {/* ACTION BUTTONS */}
                <div className="flex justify-end space-x-4 pt-2">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={onClose}
                        className="border-gray-300 hover:bg-gray-50 flex items-center space-x-2"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <Button
                        className="bg-gradient-to-r from-slate-600 to-black hover:from-slate-700 hover:to-black text-white flex items-center space-x-2"
                        type="submit"
                        disabled={!isValid || isSubmitting || isLoading}
                    >
                        {isLoading ? (
                            <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateFlowForm;
