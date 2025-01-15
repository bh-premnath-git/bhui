import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, X, AlertTriangle, CheckCircle } from 'lucide-react';
import useToast from '@/components/teast-service';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createProject, searchProject } from '@/redux/ProjectSlice';
import { ApiService } from '@/services/apiServices';
import { Spinner } from '@/components/ui/spinner';
import { encrypt_string } from '@/services/encryption';
import ValidationComponent from '@/components/validation-component';
import RequiredLabel from '@/components/RequiredFieldLabel';

interface GithubProvider {
  id: string;
  dtl_desc: string;
}

interface ProjectFormValues {
  bh_project_id: string | null;
  bh_project_name: string;
  bh_github_provider: string;
  bh_github_username: string;
  bh_github_email: string;
  bh_default_branch: string;
  bh_github_url: string;
  bh_github_token_url: string;
  tags: {
    tagList: { tagKey: string; tagValue: string }[];
  } | null;
  init_vector?: string;
}

const validationSchema = Yup.object().shape({
  bh_project_name: Yup.string().required('Project Name is required'),
  bh_github_provider: Yup.string().required('Git Provider is required'),
  bh_github_username: Yup.string().required('Git Username is required'),
  bh_github_email: Yup.string().email('Invalid email').required('Git Email is required'),
  bh_github_url: Yup.string().url('Invalid URL').required('Git Repository URL is required'),
  bh_github_token_url: Yup.string().required('Git Token is required'),
});

export default function ProjectCreationComponent() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { searchProjectList } = useAppSelector((state) => state.projectApi);
  const [tags, setTags] = useState<{ tagKey: string; tagValue: string }[]>([]);
  const [githubProviderList, setGithubProviderList] = useState<GithubProvider[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagKey, setTagKey] = useState('');
  const [tagValue, setTagValue] = useState('');
  const [ToastComponent, showToast] = useToast();
  const [debouncedProjectName, setDebouncedProjectName] = useState('');
  const [projectExistsModalOpen, setProjectExistsModalOpen] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<'valid' | 'inValid'>('inValid');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [validationErrorMsg, setValidationErrorMsg] = useState('');

  const initialValue: ProjectFormValues = {
    bh_project_id: null,
    bh_project_name: '',
    bh_github_provider: '',
    bh_github_username: '',
    bh_github_email: '',
    bh_default_branch: '',
    bh_github_url: '',
    bh_github_token_url: '',
    tags: { tagList: [] },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await ApiService('8011', 'get', '/codes_hdr/30');
        setGithubProviderList(result.codes_dtl);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const debouncedSearchProject = useCallback(
    debounce((projectName: string) => {
      dispatch(searchProject(projectName));
      setDebouncedProjectName(projectName);
    }, 500),
    [dispatch]
  );

  const handleProjectNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const projectName = e.target.value;
    setFieldValue('bh_project_name', projectName);
    if (projectName.length >= 3) {
      debouncedSearchProject(projectName);
    } else {
      setDebouncedProjectName('');
    }
    setIsTokenValid('inValid');
  };

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

  const handleVerification = async (values: ProjectFormValues) => {
    // Reset error states
    setValidationError(false);
    setValidationErrorMsg('');

    if (
      !values.bh_github_provider ||
      !values.bh_github_token_url ||
      !values.bh_github_url ||
      !values.bh_github_username
    ) {
      setValidationError(true);
      setValidationErrorMsg('Please fill in all required fields before validating the token.');
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

      const result = await ApiService('8011', 'post', 'bh_project/validate-token/', body);
      if (result.status >= 200 && result.status < 300) {
        setIsTokenValid('valid');
        showToast('Token Validated Successfully', { color: '#4caf50' });
        return true;
      } else {
        setIsTokenValid('inValid');
        setValidationError(true);
        setValidationErrorMsg('Error validating your token.');
        showToast(result.error, { color: '#FF0000' });
        return false;
      }
    } catch (error) {
      setIsTokenValid('inValid');
      setValidationError(true);
      setValidationErrorMsg('Error validating your token.');
      showToast('Error validating token', { color: '#FF0000' });
      return false;
    }
  };

  const handleSubmitForm = async (values: ProjectFormValues) => {
    values.tags = { tagList: tags };

    const { encryptedString, initVector } = encrypt_string(values.bh_github_token_url);
    values.bh_github_token_url = encryptedString;
    values.init_vector = initVector;
    setIsLoading(true);
    try {
      const result = await dispatch(createProject(values));
      if (result.payload) {
        showToast('Project created successfully', { color: '#4caf50' });
        setTimeout(() => {
          navigate('/admin-console/projects');
        }, 1000);
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error submitting form', { color: '#FF0000' });
    } finally {
      setProjectExistsModalOpen(false);
      setIsLoading(false);
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto p-3 space-y-6 rounded border bg-white text-black shadow w-full mt-8">
      {/* Header Section */}
      <div className="border-b pb-2">
        <h2 className="text-xl font-semibold">Create New Project</h2>
        <p className="text-sm text-gray-700 mt-1">
          Configure your project settings and repository details.
        </p>
      </div>

      <Formik
        initialValues={initialValue}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmitForm}
      >
        {({ values, setFieldValue, isValid }) => (
          <Form className="space-y-6">
            {/* Project Name Section */}
            <div className="flex items-center justify-between">
              <div className="space-y-1 w-1/2">
                <RequiredLabel>
                  <Label htmlFor="bh_project_name" className="font-medium">
                    Project Name
                  </Label>
                </RequiredLabel>
                <Field name="bh_project_name">
                  {({ field }: any) => (
                    <div className="relative">
                      <Input
                        {...field}
                        id="bh_project_name"
                        placeholder="Enter project name"
                        className="h-8 w-2/3 border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleProjectNameChange(e, setFieldValue)
                        }
                      />
                      {projectExistsModalOpen && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 flex items-center text-xs">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Name exists
                        </span>
                      )}
                    </div>
                  )}
                </Field>
                <ErrorMessage name="bh_project_name" component="div" className="text-red-500 text-xs" />
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
                <div className="space-y-1">
                  <RequiredLabel>
                    <Label htmlFor="bh_github_provider" className="font-medium text-sm">
                      Git Provider
                    </Label>
                  </RequiredLabel>
                  <Field name="bh_github_provider">
                    {({ field }: any) => {
                      const initialProviderId = initialValue.bh_github_provider?.toString();
                      const providerName = githubProviderList.find(
                        (provider) => provider.id.toString() === initialProviderId?.toString()
                      )?.dtl_desc || '';

                      return (
                        <Select
                          value={field.value || initialProviderId || 'select-provider'}
                          onValueChange={(value: string) => {
                            const selectedProviderId = value === 'select-provider' ? '' : value;
                            setFieldValue('bh_github_provider', selectedProviderId);
                          }}
                        >
                          <SelectTrigger className="h-8 w-full border-gray-300 text-sm focus:ring focus:ring-blue-200 focus:border-blue-400">
                            <SelectValue className="whitespace-nowrap overflow-hidden text-ellipsis">
                              {field.value && githubProviderList.find((item) => item.id.toString() === field.value)
                                ? githubProviderList.find((item) => item.id.toString() === field.value)?.dtl_desc
                                : providerName || 'Select Provider'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="select-provider" disabled>
                              Select Provider
                            </SelectItem>
                            {githubProviderList.map(provider => (
                              <SelectItem key={provider.id} value={provider.id.toString()}>
                                {provider.dtl_desc}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  </Field>
                  <ErrorMessage
                    name="bh_github_provider"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <RequiredLabel>
                    <Label htmlFor="bh_github_username" className="font-medium text-sm">Git Username</Label>
                  </RequiredLabel>
                  <Field name="bh_github_username">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        id="bh_github_username"
                        placeholder="e.g. johndoe"
                        className="h-8 border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400"
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="bh_github_username"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <RequiredLabel>
                    <Label htmlFor="bh_github_email" className="font-medium text-sm">Git Email</Label>
                  </RequiredLabel>
                  <Field name="bh_github_email">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        id="bh_github_email"
                        placeholder="user@github.com"
                        className="h-8 border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400"
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="bh_github_email"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="bh_default_branch" className="font-medium text-sm">Default Branch</Label>
                  <Field name="bh_default_branch">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        id="bh_default_branch"
                        placeholder="e.g. main"
                        className="h-8 border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400"
                      />
                    )}
                  </Field>
                </div>
              </div>

              {/* GitHub URL and Token Row */}
              <div className="grid grid-cols-3 gap-2 mt-2 items-center" style={{ minHeight: '60px' }}>
                <div className="space-y-1 col-span-1">
                  <RequiredLabel>
                    <Label htmlFor="bh_github_url" className="font-medium text-sm">GitHub URL</Label>
                  </RequiredLabel>
                  <Field name="bh_github_url">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        id="bh_github_url"
                        placeholder="https://github.com/username/repository"
                        className="h-8 w-full border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400"
                      />
                    )}
                  </Field>
                  <ErrorMessage name="bh_github_url" component="div" className="text-red-500 text-xs" />
                </div>

                {/* Token and Validation on the same line */}
                <div className="col-span-2 flex items-end gap-2">
                  <div className="flex flex-col space-y-1 w-1/2">
                    <RequiredLabel>
                      <Label htmlFor="bh_github_token_url" className="font-medium text-sm">GitHub Token</Label>
                    </RequiredLabel>
                    <div className="relative">
                      <Field name="bh_github_token_url">
                        {({ field }: any) => (
                          <Input
                            {...field}
                            id="bh_github_token_url"
                            type="password"
                            placeholder="••••••••"
                            onChange={(e: any) => {
                              setIsTokenValid('inValid');
                              field.onChange(e);
                            }}
                            className="h-8 w-full border-gray-300 text-sm focus:ring-blue-200 focus:border-blue-400 pr-8"
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="bh_github_token_url"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                      {isTokenValid === 'valid' && (
                        <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <ValidationComponent
                      onValidate={() => handleVerification(values)}
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
                      <Button onClick={addTag} className="w-full bg-black text-white hover:bg-gray-800 h-8 text-sm">
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
                    <Spinner className="max-h-[10px]" showLoadingTxt={false} />
                  </div>
                ) : (
                  'Create Project'
                )}
              </Button>
            </div>
          </Form>
        )}
      </Formik>

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
              <Button onClick={() => setProjectExistsModalOpen(false)} className="bg-black text-white hover:bg-gray-800 mt-2 h-8 text-sm">
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ToastComponent />
    </div>
  );
}
