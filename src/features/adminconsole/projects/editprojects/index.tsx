import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, X } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { searchProject, updateProject } from '@/store/oldstore/ProjectSlice';
import { ApiService } from "@/services/api.services";
import { isEmpty } from '@/lib/isObjectEmpty';
import { LoadingState } from '@/components/shared/LoadingState';
import { encrypt_string } from '@/services/encryption';
import { ValidationComponent } from '@/components/ui/validation-component';
import { RequiredLabel } from '@/components/ui/required-fields';

import { CATALOG_API_PORT } from '@/services/environment';

// -------------------- Zod Schema --------------------
const projectFormSchema = z.object({
    bh_project_id: z.string().nullable(),
    bh_project_name: z.string().nonempty('Project Name is required'),
    bh_github_provider: z.string().nonempty('Git Provider is required'),
    bh_github_username: z.string().nonempty('Git Username is required'),
    bh_github_email: z.string().email('Invalid email').nonempty('Git Email is required'),
    bh_default_branch: z.string().optional(),
    bh_github_url: z.string().url('Invalid URL').nonempty('Git Repository URL is required'),
    bh_github_token_url: z.string().nonempty('Git Token is required'),
    tags: z.object({
        tagList: z.array(
            z.object({ tagKey: z.string(), tagValue: z.string() })
        ),
    }).nullable(),
    init_vector: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface GithubProvider {
    id: string;
    dtl_desc: string;
}

export default function ProjectEditComponent() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // ------------- Redux Selectors -------------
    const { editProjectData, searchProjectList } = useAppSelector((state) => state.projectApi);

    // ------------- Local State -------------
    const [githubProviderList, setGithubProviderList] = useState<GithubProvider[]>([]);
    const [tags, setTags] = useState<Array<{ tagKey: string; tagValue: string }>>(() => {
        return (initialFormValues.tags?.tagList || []).map(tag => ({
            tagKey: tag.tagKey || '',
            tagValue: tag.tagValue || ''
        }));
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tagKey, setTagKey] = useState('');
    const [tagValue, setTagValue] = useState('');
    const [projectExistsModalOpen, setProjectExistsModalOpen] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState<'valid' | 'inValid'>(
        isEmpty(editProjectData) ? 'inValid' : 'valid'
    );
    const [isLoading, setIsLoading] = useState(false);

    // ------------- Validation Errors -------------
    const [validationError, setValidationError] = useState(false);
    const [validationErrorMsg, setValidationErrorMsg] = useState('');

    // ------------- Initial Form Values -------------
    const initialFormValues: ProjectFormValues = {
        bh_project_id: editProjectData?.bh_project_id || null,
        bh_project_name: editProjectData?.bh_project_name || '',
        bh_github_provider: editProjectData?.bh_github_provider || '',
        bh_github_username: editProjectData?.bh_github_username || '',
        bh_github_email: editProjectData?.bh_github_email || '',
        bh_default_branch: editProjectData?.bh_default_branch || '',
        bh_github_url: editProjectData?.bh_github_url || '',
        bh_github_token_url: '',
        tags: {
            tagList: editProjectData?.tags?.tagList || [],
        },
        init_vector: undefined,
    };

    // ------------- React Hook Form Setup -------------
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isValid, dirtyFields },
        setValue,
        getValues,
    } = useForm<ProjectFormValues>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: initialFormValues,
        mode: 'onChange',
    });

    useEffect(() => {
        setTags(
            initialFormValues.tags?.tagList?.map(tag => ({
                tagKey: tag.tagKey || '',
                tagValue: tag.tagValue || ''
            })) || []
        );
    }, [editProjectData]);

    const watchProjectName = watch('bh_project_name');
    const [debouncedProjectName] = useDebounce(watchProjectName, 500);

    useEffect(() => {
        if (debouncedProjectName && debouncedProjectName.length >= 3) {
            dispatch(searchProject(debouncedProjectName));
        }
    }, [debouncedProjectName, dispatch]);

    // ------------- Check if Project Name Exists -------------
    useEffect(() => {
        if (debouncedProjectName && searchProjectList) {
            const projectExists = searchProjectList.some(
                (project: any) =>
                    project.bh_project_name.toLowerCase() === debouncedProjectName.toLowerCase()
            );
            setProjectExistsModalOpen(projectExists);
        } else {
            setProjectExistsModalOpen(false);
        }
    }, [searchProjectList, debouncedProjectName]);

    // ------------- Fetch Git Providers -------------
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await ApiService({
                    portNumber: CATALOG_API_PORT,
                    method: 'get',
                    url: '/codes_hdr/30'
                });
                setGithubProviderList(result.codes_dtl);
            } catch (error) {
                console.error('Error fetching Git provider list:', error);
            }
        };
        fetchData();
    }, []);

    // ------------- Token Validation -------------
    const handleVerification = async () => {
        setValidationError(false);
        setValidationErrorMsg('');

        const values = getValues();
        if (
            !values.bh_github_provider ||
            !values.bh_github_token_url ||
            !values.bh_github_url ||
            !values.bh_github_username
        ) {
            setValidationError(true);
            setValidationErrorMsg('Fill in all required fields');
            return false;
        }

        try {
            const { encryptedString, initVector } = encrypt_string(values.bh_github_token_url);
            const body = {
                bh_github_token_url: encryptedString,
                bh_github_provider: values.bh_github_provider,
                bh_github_username: values.bh_github_username,
                bh_github_url: values.bh_github_url,
                init_vector: initVector,
            };

            const result = await ApiService({
                portNumber: CATALOG_API_PORT, method: 'post', url: 'bh_project/validate-token/', data: body
            })

            if (result.status >= 200 && result.status < 300) {
                setIsTokenValid('valid');
                toast.success('Token Validated Successfully');
                return true;
            } else {
                setIsTokenValid('inValid');
                setValidationError(true);
                setValidationErrorMsg('Error validating');
                toast.error(result.error || 'Error validating token');
                return false;
            }
        } catch (error) {
            setIsTokenValid('inValid');
            setValidationError(true);
            setValidationErrorMsg('Error validating');
            toast.error('Error validating token');
            return false;
        }
    };

    // ------------- Form Submission -------------
    const onSubmit = async (formData: ProjectFormValues) => {
        try {
            // combine local tags with form data
            formData.tags = { tagList: tags };

            // Encrypt token
            const { encryptedString, initVector } = encrypt_string(formData.bh_github_token_url);
            formData.bh_github_token_url = encryptedString;
            formData.init_vector = initVector;

            setIsLoading(true);
            const result = await dispatch(updateProject(formData));

            if ((result as any).payload) {
                toast.success('Project updated successfully');
                setTimeout(() => {
                    navigate('/admin-console/projects');
                }, 1000);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error submitting form');
        } finally {
            setIsLoading(false);
        }
    };

    // ------------- Tag Management -------------
    const addTag = () => {
        if (tagKey && tagValue) {
            setTags([...tags, { tagKey, tagValue }]);
            setTagKey('');
            setTagValue('');
            setIsModalOpen(false);
        }
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    // ------------- Rendering -------------
    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6 rounded-xl border bg-card text-card-foreground shadow w-full mt-4">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex justify-between items-start">
                    {/* Project Name */}
                    <div className="space-y-1 w-1/2">
                        <RequiredLabel>
                            <Label htmlFor="bh_project_name">Project Name</Label>
                        </RequiredLabel>
                        <Input
                            id="bh_project_name"
                            placeholder="Project Name"
                            className="h-9 w-1/2"
                            readOnly={!isEmpty(editProjectData)} // If you want to disable editing the name
                            {...register('bh_project_name', {
                                onChange: () => setIsTokenValid('inValid'),
                            })}
                        />
                        {errors.bh_project_name && (
                            <p className="text-red-500 text-sm mt-1">{errors.bh_project_name.message}</p>
                        )}
                    </div>

                    {/* View All Projects */}
                    <Button
                        variant="ghost"
                        className="mt-1"
                        onClick={() => navigate('/admin-console/projects')}
                    >
                        View All Projects
                    </Button>
                </div>

                <div className="space-y-4 mt-4">
                    {/* First Row: Provider, Username, Email, Default Branch */}
                    <div className="grid grid-cols-4 gap-4">
                        {/* Git Provider */}
                        <div>
                            <RequiredLabel>
                                <Label htmlFor="bh_github_provider">Git Provider</Label>
                            </RequiredLabel>
                            <Select
                                onValueChange={(value) => {
                                    setValue('bh_github_provider', value === 'select-provider' ? '' : value);
                                    setIsTokenValid('inValid');
                                }}
                                value={watch('bh_github_provider') || 'select-provider'}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue>
                                        {
                                            watch('bh_github_provider')
                                                ? githubProviderList.find(
                                                    (p) => p.id.toString() === watch('bh_github_provider')
                                                )?.dtl_desc || 'Select Provider'
                                                : 'Select Provider'
                                        }
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="select-provider" disabled>
                                        Select Provider
                                    </SelectItem>
                                    {githubProviderList.map((provider) => (
                                        <SelectItem key={provider.id} value={provider.id.toString()}>
                                            {provider.dtl_desc}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.bh_github_provider && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.bh_github_provider.message}
                                </p>
                            )}
                        </div>

                        {/* Git Username */}
                        <div>
                            <RequiredLabel>
                                <Label htmlFor="bh_github_username">Git Username</Label>
                            </RequiredLabel>
                            <Input
                                id="bh_github_username"
                                placeholder="Github Username"
                                {...register('bh_github_username', {
                                    onChange: () => setIsTokenValid('inValid'),
                                })}
                            />
                            {errors.bh_github_username && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.bh_github_username.message}
                                </p>
                            )}
                        </div>

                        {/* Git Email */}
                        <div>
                            <RequiredLabel>
                                <Label htmlFor="bh_github_email">Git Email</Label>
                            </RequiredLabel>
                            <Input
                                id="bh_github_email"
                                placeholder="user@github.com"
                                {...register('bh_github_email', {
                                    onChange: () => setIsTokenValid('inValid'),
                                })}
                            />
                            {errors.bh_github_email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.bh_github_email.message}
                                </p>
                            )}
                        </div>

                        {/* Default Branch */}
                        <div>
                            <Label htmlFor="bh_default_branch">Default Branch</Label>
                            <Input
                                id="bh_default_branch"
                                placeholder="<main>"
                                {...register('bh_default_branch')}
                            />
                        </div>
                    </div>

                    {/* Second Row: GitHub URL, Token, Validate */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* GitHub URL */}
                        <div className="space-y-2">
                            <RequiredLabel>
                                <Label htmlFor="bh_github_url">GitHub Repository URL</Label>
                            </RequiredLabel>
                            <Input
                                id="bh_github_url"
                                placeholder="https://github.com/..."
                                className="w-full"
                                {...register('bh_github_url', {
                                    onChange: () => setIsTokenValid('inValid'),
                                })}
                            />
                            {errors.bh_github_url && (
                                <p className="text-red-500 text-sm">
                                    {errors.bh_github_url.message}
                                </p>
                            )}
                        </div>

                        {/* GitHub Token */}
                        <div className="space-y-2">
                            <RequiredLabel>
                                <Label htmlFor="bh_github_token_url">GitHub Token</Label>
                            </RequiredLabel>
                            <Input
                                id="bh_github_token_url"
                                type="password"
                                placeholder="********"
                                className="w-full"
                                {...register('bh_github_token_url', {
                                    onChange: () => setIsTokenValid('inValid'),
                                })}
                            />
                            {errors.bh_github_token_url && (
                                <p className="text-red-500 text-sm">
                                    {errors.bh_github_token_url.message}
                                </p>
                            )}
                        </div>

                        {/* Validate Token Button */}
                        <div className="flex items-end">
                            <ValidationComponent
                                onValidate={handleVerification}
                                error={validationError}
                                errorMsg={validationErrorMsg}
                            />
                        </div>
                    </div>

                    {/* Tags Section */}
                    <div>
                        <Label className="font-medium">Add Tags</Label>
                        <p className="text-sm text-gray-500 mb-2">
                            Add one or more tags to easily identify compute instances created by BigHammer.ai
                        </p>

                        {/* Existing Tags */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="px-2 py-1">
                                    {`${tag.tagKey} >> ${tag.tagValue}`}
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

                        {/* Add Tag Dialog */}
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
                </div>

                {/* Submit Button */}
                <div className="flex justify-center mt-6">
                    <Button
                        type="submit"
                        className="w-1/6 bg-gray-900 text-white hover:bg-gray-800"
                        disabled={isTokenValid === 'inValid' || !isValid || isLoading || Object.keys(dirtyFields).length === 0}
                    >
                        {isLoading ? (
                            <LoadingState />
                        ) : (
                            'Update Project'
                        )}
                    </Button>
                </div>
            </form>

            {/* Existing Project Warning Modal */}
            {projectExistsModalOpen && (
                <Dialog open={projectExistsModalOpen} onOpenChange={setProjectExistsModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Project Already Exists</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center gap-2 py-2">
                            <p className="text-gray-700">A project with this name already exists.</p>
                            <p className="text-gray-700">Please choose a different name.</p>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
