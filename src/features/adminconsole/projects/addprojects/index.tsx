import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { AlertTriangle, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { LoadingState } from '@/components/shared/LoadingState';
import { RequiredLabel } from '@/components/ui/required-fields';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { createProject, searchProject } from '@/store/oldstore/ProjectSlice';
import { ApiService } from '@/services/api.services';
import { encrypt_string } from '@/services/encryption';
import { CATALOG_API_PORT } from '@/services/environment';

import { projectFormSchema, ProjectFormValues } from '@/features/adminconsole/projects/project/projectSchema';
import { TagManager } from '@/features/adminconsole/projects/project/TagManager';
import { ExistingProjectModal } from '@/features/adminconsole/projects/project/ExistingProjectModal';
import { ValidationComponent } from '@/components/ui/validation-component';

interface GithubProvider {
  id: string;
  dtl_desc: string;
}

export function ProjectForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux Data
  const { searchProjectList } = useAppSelector((state) => state.projectApi);

  // Local States
  const [githubProviderList, setGithubProviderList] = useState<GithubProvider[]>([]);
  const [tags, setTags] = useState<{ tagKey: string; tagValue: string }[]>([]);
  const [projectExistsModalOpen, setProjectExistsModalOpen] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<'valid' | 'inValid'>('inValid');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [validationErrorMsg, setValidationErrorMsg] = useState('');

  // Form Hook
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

  // Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await ApiService({
          portNumber: CATALOG_API_PORT,
          method: 'get',
          url: '/codes_hdr/30',
        });
        setGithubProviderList(result.codes_dtl);
      } catch (error) {
        console.error('Error fetching Git provider list:', error);
      }
    };
    fetchData();
  }, []);

  // Debounce Project Name
  const watchProjectName = watch('bh_project_name');
  const [debouncedProjectName] = useDebounce(watchProjectName, 500);

  // Dispatch search if name >= 3 letters
  useEffect(() => {
    if (debouncedProjectName && debouncedProjectName.length >= 3) {
      dispatch(searchProject(debouncedProjectName));
    }
  }, [debouncedProjectName, dispatch]);

  // Check if project name already exists
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

  // Token Verification
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
        data: body,
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

  // Submit Handler
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

  return (
    <div className="max-w-4xl mx-auto p-1 space-y-6 rounded border bg-card text-card-foreground shadow w-full mt-4">
    <div className="border-b pb-2">
      <h2 className="text-xl font-semibold">Create New Project</h2>
      <p className="text-sm text-gray-700 mt-1">
        Configure your project settings and repository details.
      </p>
    </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Top row: Project Name & View All Button */}
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
                className="h-8 w-2/3 border-gray-300 text-sm"
                {...register('bh_project_name')}
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

        {/* Repository Details */}
        <div className="p-3 rounded bg-inherit border space-y-4">
          <h3 className="text-base font-medium border-b pb-2">Repository Details</h3>
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
                <SelectTrigger className="h-8 w-full border-gray-300 text-sm">
                  <SelectValue>
                    {watch('bh_github_provider')
                      ? githubProviderList.find(
                          (provider) => provider.id.toString() === watch('bh_github_provider')
                        )?.dtl_desc || 'Select Provider'
                      : 'Select Provider'}
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
                className="h-8 border-gray-300 text-sm"
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
                className="h-8 border-gray-300 text-sm"
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
                className="h-8 border-gray-300 text-sm"
                {...register('bh_default_branch')}
              />
            </div>
          </div>

          {/* GitHub URL & Token */}
          <div className="grid grid-cols-3 gap-2 mt-2 items-center" style={{ minHeight: '60px' }}>
            <div className="space-y-1 col-span-1">
              <RequiredLabel>
                <Label htmlFor="bh_github_url" className="font-medium text-sm">
                  GitHub URL
                </Label>
              </RequiredLabel>
              <Input
                id="bh_github_url"
                placeholder="https://github.com/username/repository"
                className="h-8 w-full border-gray-300 text-sm"
                {...register('bh_github_url')}
              />
              {errors.bh_github_url && (
                <p className="text-red-500 text-xs">{errors.bh_github_url.message}</p>
              )}
            </div>

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
                    className="h-8 w-full border-gray-300 text-sm pr-8"
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

              {/* Validation button */}
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
        <TagManager tags={tags} setTags={setTags} />

        {/* Submit Button */}
        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            className="w-1/4 h-8 bg-black hover:bg-gray-800 text-white font-medium text-sm"
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
      <ExistingProjectModal
        open={projectExistsModalOpen}
        onClose={() => setProjectExistsModalOpen(false)}
      />
    </div>
  );
}
