import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { PlusCircle, X, AlertTriangle, CheckCircle } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingState } from '@/components/shared/LoadingState';
import { RequiredLabel } from '@/components/ui/required-fields';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { createProject, searchProject } from '@/store/oldstore/ProjectSlice';
import { ApiService } from "@/services/api.services";
import { encrypt_string } from '@/services/encryption';
import { CATALOG_API_PORT } from '@/services/environment';
import { ValidationComponent } from '@/components/ui/validation-component';


// ------------------- Zod Schema Definition -------------------
const projectFormSchema = z.object({
  bh_project_id: z.string().nullable(),
  bh_project_name: z.string().nonempty('Project Name is required'),
  bh_github_provider: z.string().nonempty('Git Provider is required'),
  bh_github_username: z.string().nonempty('Git Username is required'),
  bh_github_email: z.string()
    .email('Invalid email')
    .nonempty('Git Email is required'),
  bh_default_branch: z.string().optional(),
  bh_github_url: z.string()
    .url('Invalid URL')
    .nonempty('Git Repository URL is required'),
  bh_github_token_url: z.string().nonempty('Git Token is required'),
  tags: z.object({
    tagList: z.array(
      z.object({
        tagKey: z.string(),
        tagValue: z.string(),
      })
    ),
  }).nullable(),
  init_vector: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface GithubProvider {
  id: string;
  dtl_desc: string;
}

export default function ProjectCreationComponent() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // ------------------- Redux Data -------------------
  const { searchProjectList } = useAppSelector((state) => state.projectApi);

  // ------------------- Local States -------------------
  const [githubProviderList, setGithubProviderList] = useState<GithubProvider[]>([]);
  const [tags, setTags] = useState<{ tagKey: string; tagValue: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagKey, setTagKey] = useState('');
  const [tagValue, setTagValue] = useState('');
  const [projectExistsModalOpen, setProjectExistsModalOpen] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<'valid' | 'inValid'>('inValid');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [validationErrorMsg, setValidationErrorMsg] = useState('');

  // ------------------- Form Hook Setup -------------------
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    getValues,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      bh_project_id: null,
      bh_project_name: '',
      bh_github_provider: '',
      bh_github_username: '',
      bh_github_email: '',
      bh_default_branch: '',
      bh_github_url: '',
      bh_github_token_url: '',
      tags: { tagList: [] },
    },
    mode: 'onChange',
  });

  // ------------------- Data Fetching -------------------
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

  // ------------------- Debounce Search -------------------
  const watchProjectName = watch('bh_project_name');
  const [debouncedProjectName] = useDebounce(watchProjectName, 500);

  useEffect(() => {
    if (debouncedProjectName && debouncedProjectName.length >= 3) {
      dispatch(searchProject(debouncedProjectName));
    }
  }, [debouncedProjectName, dispatch]);

  // ------------------- Check if Project Already Exists -------------------
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

  // ------------------- Token Verification -------------------
  const handleVerification = async () => {
    setValidationError(false);
    setValidationErrorMsg('');

    const currentValues = getValues();

    if (
      !currentValues.bh_github_provider ||
      !currentValues.bh_github_token_url ||
      !currentValues.bh_github_url ||
      !currentValues.bh_github_username
    ) {
      setValidationError(true);
      setValidationErrorMsg('Please fill in all required fields before validating the token.');
      return false;
    }

    try {
      const { encryptedString, initVector } = encrypt_string(currentValues.bh_github_token_url);
      const body = {
        bh_github_token_url: encryptedString,
        bh_github_provider: currentValues.bh_github_provider,
        bh_github_username: currentValues.bh_github_username,
        bh_github_url: currentValues.bh_github_url,
        init_vector: initVector,
      };

      const result = await ApiService({
        portNumber: CATALOG_API_PORT,
        method: 'post',
        url: 'bh_project/validate-token/',
        data: body
      });
      
      if (result.status >= 200 && result.status < 300) {
        setIsTokenValid('valid');
        toast.success('Token Validated Successfully');
        return true;
      } else {
        setIsTokenValid('inValid');
        setValidationError(true);
        setValidationErrorMsg('Error validating your token.');
        toast.error(result.error || 'Error validating token');
        return false;
      }
    } catch (error) {
      setIsTokenValid('inValid');
      setValidationError(true);
      setValidationErrorMsg('Error validating your token.');
      toast.error('Error validating token');
      return false;
    }
  };

  // ------------------- Form Submission -------------------
  const onSubmit = async (formData: ProjectFormValues) => {
    try {
      // combine local tags with form data
      formData.tags = { tagList: tags };

      // encrypt token
      const { encryptedString, initVector } = encrypt_string(formData.bh_github_token_url);
      formData.bh_github_token_url = encryptedString;
      formData.init_vector = initVector;

      setIsLoading(true);

      const result = await dispatch(createProject(formData));
      if ((result as any).payload) {
        toast.success('Project created successfully');
        setTimeout(() => navigate('/admin-console/projects'), 1000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error submitting form');
    } finally {
      setProjectExistsModalOpen(false);
      setIsLoading(false);
    }
  };

  // ------------------- Tag Management -------------------
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

  // ------------------- JSX Markup -------------------
  return (
    <div className="max-w-4xl mx-auto p-3 space-y-6 rounded border bg-white text-black shadow w-full mt-8">
      {/* Header Section */}
      <div className="border-b pb-2">
        <h2 className="text-xl font-semibold">Create New Project</h2>
        <p className="text-sm text-gray-700 mt-1">
          Configure your project settings and repository details.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Project Name Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-1 w-1/2">
            <RequiredLabel>
              <Label htmlFor="bh_project_name" className="font-medium">
                Project Name
              </Label>
            </RequiredLabel>
            <div className="relative">
              <Input
                id="bh_project_name"
                placeholder="Enter project name"
                className="h-8 w-2/3 border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400"
                {...register('bh_project_name')}
                onChange={(e) => {
                  // We still rely on react-hook-form's watch, 
                  // so no need to manually set state here
                  // but you could if needed, e.g. setValue('bh_project_name', e.target.value);
                }}
              />
              {projectExistsModalOpen && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 flex items-center text-xs">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Name exists
                </span>
              )}
            </div>
            {errors.bh_project_name && (
              <p className="text-red-500 text-xs">{errors.bh_project_name.message}</p>
            )}
          </div>

          <Button
            variant="outline"
            className="text-xs font-medium px-3 py-1 border-gray-300 hover:bg-gray-100"
            onClick={() => navigate('/admin-console/projects')}
          >
            View All Projects
          </Button>
        </div>

        {/* Repository Details Section */}
        <div className="p-3 rounded bg-white border space-y-4">
          <h3 className="text-base font-medium text-black border-b pb-2">Repository Details</h3>
          <div className="grid grid-cols-4 gap-2">
            {/* Git Provider */}
            <div className="space-y-1">
              <RequiredLabel>
                <Label htmlFor="bh_github_provider" className="font-medium text-sm">
                  Git Provider
                </Label>
              </RequiredLabel>
              <Select
                onValueChange={(value) => {
                  setValue('bh_github_provider', value === 'select-provider' ? '' : value);
                }}
                value={watch('bh_github_provider') || 'select-provider'}
              >
                <SelectTrigger className="h-8 w-full border-gray-300 text-sm focus:ring focus:ring-blue-200 focus:border-blue-400">
                  <SelectValue className="whitespace-nowrap overflow-hidden text-ellipsis">
                    {
                      watch('bh_github_provider')
                        ? githubProviderList.find(
                            (provider) =>
                              provider.id.toString() === watch('bh_github_provider')
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
                <p className="text-red-500 text-xs">{errors.bh_github_provider.message}</p>
              )}
            </div>

            {/* Git Username */}
            <div className="space-y-1">
              <RequiredLabel>
                <Label htmlFor="bh_github_username" className="font-medium text-sm">
                  Git Username
                </Label>
              </RequiredLabel>
              <Input
                id="bh_github_username"
                placeholder="e.g. johndoe"
                className="h-8 border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400"
                {...register('bh_github_username')}
              />
              {errors.bh_github_username && (
                <p className="text-red-500 text-xs">{errors.bh_github_username.message}</p>
              )}
            </div>

            {/* Git Email */}
            <div className="space-y-1">
              <RequiredLabel>
                <Label htmlFor="bh_github_email" className="font-medium text-sm">
                  Git Email
                </Label>
              </RequiredLabel>
              <Input
                id="bh_github_email"
                placeholder="user@github.com"
                className="h-8 border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400"
                {...register('bh_github_email')}
              />
              {errors.bh_github_email && (
                <p className="text-red-500 text-xs">{errors.bh_github_email.message}</p>
              )}
            </div>

            {/* Default Branch */}
            <div className="space-y-1">
              <Label htmlFor="bh_default_branch" className="font-medium text-sm">
                Default Branch
              </Label>
              <Input
                id="bh_default_branch"
                placeholder="e.g. main"
                className="h-8 border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400"
                {...register('bh_default_branch')}
              />
            </div>
          </div>

          {/* GitHub URL and Token Row */}
          <div className="grid grid-cols-3 gap-2 mt-2 items-center" style={{ minHeight: '60px' }}>
            {/* GitHub URL */}
            <div className="space-y-1 col-span-1">
              <RequiredLabel>
                <Label htmlFor="bh_github_url" className="font-medium text-sm">
                  GitHub URL
                </Label>
              </RequiredLabel>
              <Input
                id="bh_github_url"
                placeholder="https://github.com/username/repository"
                className="h-8 w-full border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400"
                {...register('bh_github_url')}
              />
              {errors.bh_github_url && (
                <p className="text-red-500 text-xs">{errors.bh_github_url.message}</p>
              )}
            </div>

            {/* Token + Validation Button */}
            <div className="col-span-2 flex items-end gap-2">
              <div className="flex flex-col space-y-1 w-1/2">
                <RequiredLabel>
                  <Label htmlFor="bh_github_token_url" className="font-medium text-sm">
                    GitHub Token
                  </Label>
                </RequiredLabel>
                <div className="relative">
                  <Input
                    id="bh_github_token_url"
                    type="password"
                    placeholder="••••••••"
                    className="h-8 w-full border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400 pr-8"
                    {...register('bh_github_token_url', {
                      onChange: () => setIsTokenValid('inValid'),
                    })}
                  />
                  {errors.bh_github_token_url && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.bh_github_token_url.message}
                    </p>
                  )}
                  {isTokenValid === 'valid' && (
                    <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <ValidationComponent
                  onValidate={handleVerification}
                  error={validationError}
                  errorMsg={validationErrorMsg}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="p-3 rounded bg-white border space-y-2">
          <div className="flex justify-between items-center mb-1">
            <div>
              <Label className="text-base font-medium">Tags</Label>
              <p className="text-xs text-gray-700 mt-1">
                Add tags to identify compute instances.
              </p>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center text-xs font-medium px-2 py-1 border-gray-300 hover:bg-gray-100"
                >
                  <PlusCircle className="mr-1 h-3 w-3" />
                  Add Tag
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[300px] rounded-md bg-white text-black border border-gray-300 p-3">
                <DialogHeader>
                  <DialogTitle className="text-base font-semibold">Add a New Tag</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-2">
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="tagKey" className="text-sm font-medium">
                      Tag Key
                    </Label>
                    <Input
                      id="tagKey"
                      value={tagKey}
                      onChange={(e) => setTagKey(e.target.value)}
                      className="border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400 h-8"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="tagValue" className="text-sm font-medium">
                      Tag Value
                    </Label>
                    <Input
                      id="tagValue"
                      value={tagValue}
                      onChange={(e) => setTagValue(e.target.value)}
                      className="border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400 h-8"
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button
                    onClick={addTag}
                    className="w-full bg-black text-white hover:bg-gray-800 h-8 text-sm"
                  >
                    Add Tag
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-wrap gap-1 min-h-[40px] bg-gray-50 p-1 rounded border border-gray-200">
            {tags.length === 0 ? (
              <p className="text-gray-400 text-xs">No tags added yet</p>
            ) : (
              tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-2 py-1 text-xs bg-gray-100 text-black border border-gray-300 flex items-center"
                >
                  {`${tag.tagKey}: ${tag.tagValue}`}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                    onClick={() => removeTag(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            className="w-1/4 h-8 bg-black hover:bg-gray-800 text-white font-medium text-sm focus:ring focus:ring-blue-200"
            disabled={isTokenValid === 'inValid' || !isValid || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <LoadingState className="max-h-[10px]" />
              </div>
            ) : (
              'Create Project'
            )}
          </Button>
        </div>
      </form>

      {/* Existing Project Warning Modal */}
      {projectExistsModalOpen && (
        <Dialog open={projectExistsModalOpen} onOpenChange={setProjectExistsModalOpen}>
          <DialogContent className="rounded-md bg-white text-black border border-gray-300 p-3">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-red-600 flex items-center">
                <AlertTriangle className="mr-1 h-4 w-4 text-red-600" />
                Project Already Exists
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center gap-1 py-2 text-center">
              <p className="text-sm text-gray-700">
                A project with this name already exists. Please choose a different name.
              </p>
              <Button
                onClick={() => setProjectExistsModalOpen(false)}
                className="bg-black text-white hover:bg-gray-800 mt-2 h-8 text-sm"
              >
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
