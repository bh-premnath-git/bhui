import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ValidationComponent } from '@/components/ui/validation-component';
import { RequiredLabel } from '@/components/ui/required-fields';
import { LoadingState } from '@/components/shared/LoadingState';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { searchProject, updateProject } from '@/store/oldstore/ProjectSlice';
import { ApiService } from '@/services/api.services';
import { encrypt_string } from '@/services/encryption';
import { isEmpty } from '@/lib/isObjectEmpty';
import { CATALOG_API_PORT } from '@/services/environment';

import { projectEditFormSchema, ProjectEditFormValues } from '@/features/adminconsole/projects/project/projectSchema';
import { TagManager } from '@/features/adminconsole/projects/project/TagManager';
import { ExistingProjectModal } from '@/features/adminconsole/projects/project/ExistingProjectModal';
import {GithubProvider} from "@/types/features/project/types"


export function ProjectEditForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { editProjectData, searchProjectList } = useAppSelector((state) => state.projectApi);

  const initialFormValues: ProjectEditFormValues = {
    bh_project_id: editProjectData?.bh_project_id || null,
    bh_project_name: editProjectData?.bh_project_name || '',
    bh_github_provider: editProjectData?.bh_github_provider || '',
    bh_github_username: editProjectData?.bh_github_username || '',
    bh_github_email: editProjectData?.bh_github_email || '',
    bh_default_branch: editProjectData?.bh_default_branch || '',
    bh_github_url: editProjectData?.bh_github_url || '',
    bh_github_token_url: '',
    tags: { tagList: editProjectData?.tags?.tagList || [] },
    init_vector: undefined,
  };

  const [tags, setTags] = useState<{ tagKey: string; tagValue: string }[]>(
    (initialFormValues.tags?.tagList || [])
      .filter(tag => tag)
      .map(tag => ({ 
        tagKey: tag?.tagKey || '',
        tagValue: tag?.tagValue || ''
      }))
  );
  const [githubProviderList, setGithubProviderList] = useState<GithubProvider[]>([]);
  const [projectExistsModalOpen, setProjectExistsModalOpen] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<'valid' | 'inValid'>(
    isEmpty(editProjectData) ? 'inValid' : 'valid'
  );
  const [isLoading, setIsLoading] = useState(false);

  const [validationError, setValidationError] = useState(false);
  const [validationErrorMsg, setValidationErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, dirtyFields },
    setValue,
    getValues,
  } = useForm<ProjectEditFormValues>({
    resolver: zodResolver(projectEditFormSchema),
    defaultValues: initialFormValues,
    mode: 'onChange',
  });

  // Fetch Git Providers
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

  // Search if name >= 3 chars
  useEffect(() => {
    if (debouncedProjectName && debouncedProjectName.length >= 3) {
      dispatch(searchProject(debouncedProjectName));
    }
  }, [debouncedProjectName, dispatch]);

  // Check if project name exists
  useEffect(() => {
    if (debouncedProjectName && searchProjectList) {
      const projectExists = searchProjectList.some(
        (p: any) =>
          p.bh_project_name.toLowerCase() === debouncedProjectName.toLowerCase()
      );
      setProjectExistsModalOpen(projectExists);
    } else {
      setProjectExistsModalOpen(false);
    }
  }, [searchProjectList, debouncedProjectName]);

  // ---------- Token Validation ----------
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

  // ---------- Form Submission ----------
  const onSubmit = async (formData: ProjectEditFormValues) => {
    try {
      // Attach local tags
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

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Project Name & View All Button */}
        <div className="flex justify-between items-start">
          <div className="space-y-1 w-1/2">
            <RequiredLabel>
              <Label htmlFor="bh_project_name">Project Name</Label>
            </RequiredLabel>
            <Input
              id="bh_project_name"
              placeholder="Project Name"
              className="h-9 w-1/2"
              readOnly={!isEmpty(editProjectData)}
              {...register('bh_project_name', {
                onChange: () => setIsTokenValid('inValid'),
              })}
            />
            {errors.bh_project_name && (
              <p className="text-red-500 text-sm mt-1">{errors.bh_project_name.message}</p>
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
        <div className="space-y-4 mt-4">
          {/* Provider, Username, Email, Branch */}
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
                    {watch('bh_github_provider')
                      ? githubProviderList.find(
                          (p) => p.id.toString() === watch('bh_github_provider')
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
                placeholder="main"
                {...register('bh_default_branch')}
              />
            </div>
          </div>

          {/* GitHub URL, Token, Validate */}
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

            {/* Validate Button */}
            <div className="flex items-end">
              <ValidationComponent
                onValidate={handleVerification}
                error={validationError}
                errorMsg={validationErrorMsg}
              />
            </div>
          </div>

          {/* Tags Section (Use TagManager) */}
          <TagManager tags={tags} setTags={setTags} />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-6">
          <Button
            type="submit"
            className="w-1/6 bg-gray-900 text-white hover:bg-gray-800"
            disabled={
              isTokenValid === 'inValid' ||
              !isValid ||
              isLoading ||
              Object.keys(dirtyFields).length === 0
            }
          >
            {isLoading ? <LoadingState /> : 'Update Project'}
          </Button>
        </div>
      </form>

      {/* Existing Project Warning Modal */}
      <ExistingProjectModal
        open={projectExistsModalOpen}
        onClose={() => setProjectExistsModalOpen(false)}
      />
    </>
  );
}
