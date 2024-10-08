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
import { PlusCircle, X } from 'lucide-react';
import useToast from '@/oldcomponents/teast-service';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createProject, searchProject, updateProject } from '@/redux/ProjectSlice';
import ApiService from '@/Services/ApiServices';
import { isEmpty } from '@/Utils/isObjectEmpty';

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
  const { editProjectData, searchProjectList } = useAppSelector(
    (state) => state.projectApi
  );
  const [tags, setTags] = useState<{ tagKey: string; tagValue: string }[]>([]);
  const [githubProviderList, setGithubProviderList] = useState<GithubProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagKey, setTagKey] = useState('');
  const [tagValue, setTagValue] = useState('');
  const [ToastComponent, showToast] = useToast();
  const [debouncedProjectName, setDebouncedProjectName] = useState('');
  const [projectExistsModalOpen, setProjectExistsModalOpen] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<'valid' | 'inValid'>(
    isEmpty(editProjectData) ? 'inValid' : 'valid'
  );

  const [initialValue, setInitialValue] = useState<ProjectFormValues>({
    bh_project_id: null,
    bh_project_name: '',
    bh_github_provider: '',
    bh_github_username: '',
    bh_github_email: '',
    bh_default_branch: '',
    bh_github_url: '',
    bh_github_token_url: '',
    tags: { tagList: [] },
  });

  useEffect(() => {
    // Fetch GitHub providers
    const fetchData = async () => {
      try {
        const result = await ApiService('8011', 'get', '/codes_hdr/30');
        setGithubProviderList(result.codes_dtl);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    if (!isEmpty(editProjectData)) {
      setInitialValue({
        ...editProjectData,
        bh_github_token_url: '',
        tags: { tagList: editProjectData?.tags?.tagList || [] },
      });
      setTags(editProjectData?.tags?.tagList || []);
    }
  }, [editProjectData]);

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
    try {
      const result = await ApiService('8011', 'post', 'bh_project/validate-token/', {
        token: values.bh_github_token_url,
        bh_github_provider: values.bh_github_provider,
      });
      if (result.status >= 200 && result.status < 300) {
        setIsTokenValid('valid');
        showToast('Token Validated Successfully', { color: '#4caf50' });
      } else {
        setIsTokenValid('inValid');
        showToast('Invalid Token, please check your token', { color: '#FF0000' });
      }
    } catch (error) {
      setIsTokenValid('inValid');
      showToast('Error validating token', { color: '#FF0000' });
    }
  };

  const handleSubmitForm = async (values: ProjectFormValues) => {
    values.tags = { tagList: tags };
    try {
      if (isEmpty(editProjectData)) {
        // Create a new project
        const result = await dispatch(createProject(values));
        if (result.payload) {
          showToast('Project created successfully', { color: '#4caf50' });
          navigate('/all-projects');
        }
      } else {
        // Update existing project
        const response = await dispatch(updateProject(values));
        if (response.payload) {
          showToast('Project updated successfully', { color: '#4caf50' });
          navigate('/all-projects');
        }
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error submitting form', { color: '#FF0000' });
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
    <div className="max-w-6xl mx-auto p-6 space-y-6 rounded-xl border bg-card text-card-foreground shadow w-full mt-4">
      <Formik
        initialValues={initialValue}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmitForm}
      >
        {({ values, setFieldValue, isValid }) => (
          <Form>
            <div className="flex justify-between items-start">
              <div className="space-y-1 w-1/2">
                <Label htmlFor="bh_project_name">Project Name</Label>
                <Field name="bh_project_name">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      id="bh_project_name"
                      placeholder="Project Name"
                      className="h-9 w-1/2"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleProjectNameChange(e, setFieldValue)
                      }
                    />
                  )}
                </Field>
                <ErrorMessage name="bh_project_name" component="div" className="text-red-500" />
              </div>
              <Button
                variant="dark"
                className="mt-1"
                onClick={() => navigate('/all-projects')}
              >
                View All Projects
              </Button>
            </div>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="bh_github_provider">Github Provider</Label>
                  <Field name="bh_github_provider">
                    {({ field }: any) => {
                      return (
                        <Select
                          value={field.value || 'select-provider'}
                          onValueChange={(value: string) => {
                            setFieldValue('bh_github_provider', value === 'select-provider' ? '' : value);
                            setSelectedProvider(value === 'select-provider' ? '' : value);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue className="whitespace-nowrap overflow-hidden text-ellipsis">
                              {field.value
                                ? githubProviderList.find((item) => item.id.toString() === field.value)?.dtl_desc
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
                      );
                    }}
                  </Field>
                  <ErrorMessage
                    name="bh_github_provider"
                    component="div"
                    className="text-red-500"
                  />
                </div>
                <div>
                  <Label htmlFor="bh_github_username">Github Username</Label>
                  <Field name="bh_github_username">
                    {({ field }: any) => (
                      <Input {...field} id="bh_github_username" placeholder="Github Username" />
                    )}
                  </Field>
                  <ErrorMessage
                    name="bh_github_username"
                    component="div"
                    className="text-red-500"
                  />
                </div>
                <div>
                  <Label htmlFor="bh_github_email">Github Email</Label>
                  <Field name="bh_github_email">
                    {({ field }: any) => (
                      <Input {...field} id="bh_github_email" placeholder="user@github.com" />
                    )}
                  </Field>
                  <ErrorMessage
                    name="bh_github_email"
                    component="div"
                    className="text-red-500"
                  />
                </div>
                <div>
                  <Label htmlFor="bh_default_branch">Default Branch</Label>
                  <Field name="bh_default_branch">
                    {({ field }: any) => (
                      <Input {...field} id="bh_default_branch" placeholder="<main>" />
                    )}
                  </Field>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="bh_github_url">Github Repository URL</Label>
                  <Field name="bh_github_url">
                    {({ field }: any) => (
                      <Input {...field} id="bh_github_url" placeholder="https://github.com/..."  className='w-2/3'/>
                    )}
                  </Field>
                  <ErrorMessage name="bh_github_url" component="div" className="text-red-500" />
                </div>
                <div>
                  <Label htmlFor="bh_github_token_url">Github Token</Label>
                  <Field name="bh_github_token_url">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        id="bh_github_token_url"
                        type="password"
                        placeholder="********"
                        onChange={(e: any) => {
                          setIsTokenValid('inValid');
                          field.onChange(e);
                        }}
                        className='w-2/3'
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="bh_github_token_url"
                    component="div"
                    className="text-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  className="text-[#70e5e8] hover:underline hover:underline-offset-4 cursor-pointer bg-transparent border-none p-0 font-semibold transition-all duration-200"
                  onClick={() => handleVerification(values)}
                >
                  Validate Github Credentials
                </button>
              </div>

              <div>
                <Label>Add Tags</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Add one or more tags to easily identify compute instances created by
                  BigHammer.ai in your AWS account (e.g., Key: Product, Value: BigHammer.ai)
                </p>
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
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="transparent"
                      className="flex items-center text-emerald-500 hover:text-emerald-600 transition-colors duration-200"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      ADD TAG
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Tag</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tagKey" className="text-right">
                          Key
                        </Label>
                        <Input
                          id="tagKey"
                          value={tagKey}
                          onChange={(e) => setTagKey(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tagValue" className="text-right">
                          Value
                        </Label>
                        <Input
                          id="tagValue"
                          value={tagValue}
                          onChange={(e) => setTagValue(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={addTag} className="w-full">
                        Add Tag
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                type="submit"
                className="w-1/6 bg-gray-900 text-white hover:bg-gray-800"
                disabled={isTokenValid === 'inValid' || !isValid}
              >
                {isEmpty(editProjectData) ? 'Create Project' : 'Update Project'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>

      {projectExistsModalOpen && (
        <Dialog open={projectExistsModalOpen} onOpenChange={setProjectExistsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Project Already Exists</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center gap-2 py-2">
            <p className="text-gray-700">
              A project with this name already exists.
            </p>
            <p className="text-gray-700">
              Please choose a different name.
            </p>
            </div>
            <DialogFooter>
              <Button className='text-white bg-black' onClick={() => setProjectExistsModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <ToastComponent />
    </div>
  );
}
