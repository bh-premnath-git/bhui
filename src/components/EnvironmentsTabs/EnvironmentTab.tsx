import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, PlusCircle, X } from 'lucide-react';
import { FileUpload } from '@/components/FileUploadComp';
import { ApiService } from '@/services/apiServices';
import useToast from '@/oldcomponents/teast-service';
import ValidationComponent from '@/components/validation-component';
import { Badge } from "@/components/ui/badge";
import RequiredLabel from '@/components/RequiredFieldLabel';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { encrypt_string } from '@/services/encryption';
import { getFlowProjectList } from '@/redux/FlowSlice';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Types
type Tag = {
  tagList: { key: string; value: string }[];
} | null;

type Platform = {
  id: string;
  name: string;
  logo: string;
  cloud_provider: number;
};

interface FormValues {
  environmentName: string;
  environment: string;
  projectId: string;
  location: string;
  accessKey: string;
  secretAccessKey: string;
  airflowUrl: string;
  airflowDagBucket: string;
  privateKeyFile: File | null;
  selectedPlatform: string;
}

interface EnvironmentTabProps {
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  tags: Tag[];
  setTags: (newTags: Tag[] | ((prevTags: Tag[]) => Tag[])) => void;
  onChange: (changes: Partial<FormValues>) => void;
  environmentName?: string;
  environment?: string;
  projectId?: string;
  location?: string;
  accessKey?: string;
  secretAccessKey?: string;
  airflowUrl?: string;
  airflowDagBucket?: string;
  privateKeyFile?: File | null;
  chamgeVerification: (verified: boolean) => void;
}

// Constants
const PLATFORMS: Platform[] = [
  {
    id: "aws",
    name: "Amazon Web Services",
    logo: "/assets/environments/aws.svg?height=40&width=40",
    cloud_provider: 101,
  },
  {
    id: "google-cloud",
    name: "Google Cloud",
    logo: "/assets/environments/google.svg?height=40&width=40",
    cloud_provider: 102,
  },
];

const validationSchema = Yup.object().shape({
  environmentName: Yup.string().required('Environment name is required'),
  environment: Yup.string().required('Environment is required'),
  projectId: Yup.string().required('Project ID is required'),
  location: Yup.string().required('Location is required'),
  selectedPlatform: Yup.string().required('Platform is required'),
  accessKey: Yup.string().when('selectedPlatform', {
    is: 'aws',
    then: () => Yup.string().required('Access Key is required for AWS'),
    otherwise: () => Yup.string().notRequired(),
  }),
  secretAccessKey: Yup.string().when('selectedPlatform', {
    is: 'aws',
    then: () => Yup.string().required('Secret Access Key is required for AWS'),
    otherwise: () => Yup.string().notRequired(),
  }),
  privateKeyFile: Yup.mixed().when('selectedPlatform', {
    is: 'google-cloud',
    then: () => Yup.mixed().required('Private Key File is required for Google Cloud'),
    otherwise: () => Yup.mixed().notRequired(),
  }),
  airflowUrl: Yup.string().url('Invalid URL format').notRequired(),
  airflowDagBucket: Yup.string().notRequired(),
});

const PlatformSelector: React.FC<{
  selectedPlatform: string;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
}> = ({ selectedPlatform, setFieldValue }) => (
  <div className="flex flex-wrap gap-6">
    {PLATFORMS.map((platform) => (
      <div
        key={platform.id}
        className={`flex flex-row items-center space-x-3 border rounded-md p-1 cursor-pointer transition-all duration-200 ${selectedPlatform === platform.id
          ? "border-green-500 bg-green-50 shadow-md"
          : "border-gray-700 bg-gray-50 hover:bg-gray-200 hover:shadow-sm"
          }`}
        onClick={() => setFieldValue('selectedPlatform', platform.id)}
        style={{ width: "250px", minWidth: "200px" }}
      >
        <div
          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${selectedPlatform === platform.id
            ? "border-green-500 bg-green-500"
            : "border-gray-700 bg-gray-200"
            }`}
        >
          {selectedPlatform === platform.id && <Check className="w-3 h-3 text-white" />}
        </div>
        <div className="flex flex-col items-center flex-grow text-center">
          <img src={platform.logo} alt={`${platform.name} logo`} className="w-10 h-10 mb-1" />
          <span className="text-xs font-medium text-gray-800">{platform.name}</span>
        </div>
      </div>
    ))}
  </div>
);

const TagInput: React.FC<{
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}> = ({ tags, setTags }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagKey, setTagKey] = useState("");
  const [tagValue, setTagValue] = useState("");

  const removeTag = (tagIndex: number, itemIndex: number) => {
    setTags((prevTags) => {
      return prevTags
        .map((tag, i) => {
          if (i === tagIndex && tag && tag.tagList.length > 1) {
            return {
              tagList: tag.tagList.filter((_, j) => j !== itemIndex),
            };
          }
          return i === tagIndex ? null : tag;
        })
        .filter(Boolean);
    });
  };

  const addTag = () => {
    if (tagKey && tagValue) {
      setTags((prevTags) => [...prevTags, { tagList: [{ key: tagKey, value: tagValue }] }]);
      setTagKey("");
      setTagValue("");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-700">
        Add tags to help identify compute instances in your cloud account.
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag, index) =>
          tag !== null
            ? tag.tagList.map((item, itemIndex) => (
              <Badge
                key={`${index}-${itemIndex}`}
                variant="secondary"
                className="px-2 py-1 flex items-center bg-gray-100 text-gray-800 border border-gray-300 rounded-md shadow-sm"
              >
                {`${item.key}: ${item.value}`}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-4 w-4 p-0"
                  onClick={() => removeTag(index, itemIndex)}
                >
                  <X className="h-3 w-3 text-gray-600" />
                </Button>
              </Badge>
            ))
            : null
        )}
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center space-x-2 text-emerald-600 border-emerald-500 hover:bg-emerald-50"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Tag</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[385px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add New Tag</DialogTitle>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="tagKey" className="text-sm font-medium text-gray-800">
                Key
              </Label>
              <Input
                id="tagKey"
                value={tagKey}
                onChange={(e) => setTagKey(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="e.g. environment"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="tagValue" className="text-sm font-medium text-gray-800">
                Value
              </Label>
              <Input
                id="tagValue"
                value={tagValue}
                onChange={(e) => setTagValue(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="e.g. production"
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

export const EnvironmentTab: React.FC<EnvironmentTabProps> = ({
  selectedPlatform = '',
  setSelectedPlatform,
  tags,
  setTags,
  onChange,
  environmentName = '',
  environment = '',
  projectId = '',
  location = '',
  accessKey = '',
  secretAccessKey = '',
  airflowUrl = '',
  airflowDagBucket = '',
  privateKeyFile = null,
  chamgeVerification,
}) => {
  const [ToastComponent, showToast] = useToast();
  const { flowProjectList } = useAppSelector((state) => state.flowApi);
  const dispatch = useAppDispatch();
  const [formKey, setFormKey] = useState(0);
  const [initialValues, setInitialValues] = useState<FormValues>({
    environmentName,
    environment,
    projectId,
    location,
    accessKey,
    secretAccessKey,
    airflowUrl,
    airflowDagBucket,
    privateKeyFile,
    selectedPlatform,
  });

  useEffect(() => {
    dispatch(getFlowProjectList({}));
  }, [dispatch]);

  useEffect(() => {
    setInitialValues({
      environmentName,
      environment,
      projectId,
      location,
      accessKey,
      secretAccessKey,
      airflowUrl,
      airflowDagBucket,
      privateKeyFile,
      selectedPlatform,
    });
    setFormKey(prev => prev + 1);
  }, [
    environmentName,
    environment,
    projectId,
    location,
    accessKey,
    secretAccessKey,
    airflowUrl,
    airflowDagBucket,
    privateKeyFile,
    selectedPlatform,
  ]);

  const handleValidate = async (values: FormValues) => {
    try {
      if (!values.accessKey || !values.secretAccessKey || !values.location) {
        showToast('Please fill in all required fields', { color: '#FF0000' });
        return false;
      }
      const encryted_aws_key_id = encrypt_string(values.accessKey);
      const encryted_aws_secret_access_key = encrypt_string(
        values.secretAccessKey,
        encryted_aws_key_id.initVector
      );

      const result = await ApiService('8011', 'post', '/environment/list-mwaa-environments', {
        aws_access_key_id: encryted_aws_key_id.encryptedString,
        aws_secret_access_key: encryted_aws_secret_access_key.encryptedString,
        location: values.location,
        init_vector: encryted_aws_key_id.initVector
      });

      const success = result && typeof result === 'object' && 'environments' in result;

      showToast(
        success ? 'Successfully connected to AWS' : 'Failed to connect',
        { color: success ? '#00b060' : '#FF0000' }
      );
      chamgeVerification(success);
      return success;
    } catch (error) {
      showToast('Failed to connect', { color: '#FF0000' });
      chamgeVerification(false);
      return false;
    } finally {
    }
  };

  const handleSetTags = (newTags: Tag[] | ((prevTags: Tag[]) => Tag[])) => {
    if (typeof newTags === 'function') {
      setTags(prevTags => newTags(prevTags));
    } else {
      setTags(newTags);
    }
  };

  const handleFileUpload = (file: File) => {
    onChange({ privateKeyFile: file });
  };

  type EnvironmentOptions = {
    "301": string;
    "302": string;
    "303": string;
  };

  const environmentOptions: EnvironmentOptions = {
    "301": "Development",
    "302": "Staging",
    "303": "Production"
  } as const;

  const locationOptions = ["us-east-1", "us-west-1", "eu-central-1"] as const;

  return (
    <Formik
      key={formKey}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => { }}
      enableReinitialize={true}
    >
      {({ values, errors, touched, setFieldValue, handleChange }) => (
        <Form className="space-y-6 p-6 rounded-lg">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-800">Configure Environment</h1>
            <p className="text-sm text-gray-600">
              Set up your environment details, select a cloud platform, and provide necessary credentials.
            </p>
          </div>
          {/* Environment Details Card */}
          <Card className="border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-800 text-left">Environment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-col md:flex-row space-x-0 md:space-x-6 space-y-4 md:space-y-0">
                <div className="w-full md:w-1/2 space-y-2">
                  <RequiredLabel>
                    <Label htmlFor="environmentName" className="text-gray-800 font-medium">Environment Name</Label>
                  </RequiredLabel>
                  <Field
                    as={Input}
                    id="environmentName"
                    name="environmentName"
                    placeholder="e.g. My Dev Env"
                    className="w-full bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      onChange({ environmentName: e.target.value });
                    }}
                  />
                  <ErrorMessage name="environmentName" component="div" className="text-red-500 text-sm" />
                </div>
                <div className="w-full md:w-1/2 space-y-2">
                  <RequiredLabel>
                    <Label htmlFor="environment" className="text-gray-800 font-medium">Environment</Label>
                  </RequiredLabel>
                  <Select
                    defaultValue={values.environment}
                    value={values.environment}
                    onValueChange={(value) => {
                      setFieldValue('environment', value);
                      onChange({ environment: value });
                    }}
                  >
                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all duration-200">
                      <SelectValue placeholder="Select Environment">
                        {values.environment ? environmentOptions[values.environment as keyof EnvironmentOptions] : "Select Environment"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                      {Object.entries(environmentOptions).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="text-gray-800 hover:bg-gray-50">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorMessage name="environment" component="div" className="text-red-500 text-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Selection Card */}
          <Card className="border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-800 text-left">Select Platform</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <RequiredLabel>
                <Label className="text-gray-800 font-medium">Select which platform you'd like to use</Label>
              </RequiredLabel>
              <PlatformSelector
                selectedPlatform={values.selectedPlatform}
                setFieldValue={setFieldValue}
              />
              <ErrorMessage name="selectedPlatform" component="div" className="text-red-500 text-sm mt-2" />
            </CardContent>
          </Card>

          {/* Credentials Card */}
          <Card className="border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-800 text-left">Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="text-sm text-gray-600">
                Select a project, location, and provide platform-specific credentials.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <RequiredLabel>
                    <Label htmlFor="projectId" className="text-gray-800 font-medium">Project ID</Label>
                  </RequiredLabel>
                  <Select
                    value={values.projectId}
                    onValueChange={(value) => {
                      setFieldValue('projectId', value);
                      onChange({ projectId: value });
                    }}
                  >
                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all duration-200">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                      {flowProjectList.map((project) => (
                        <SelectItem key={project.ProjectId} value={project.ProjectId.toString()} className="text-gray-800 hover:bg-gray-50">
                          {project.Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorMessage name="projectId" component="div" className="text-red-500 text-sm" />
                </div>

                <div className="space-y-2">
                  <RequiredLabel>
                    <Label htmlFor="location" className="text-gray-800 font-medium">Location</Label>
                  </RequiredLabel>
                  <Select
                    value={values.location}
                    onValueChange={(value) => {
                      setFieldValue('location', value);
                      onChange({ location: value });
                    }}
                  >
                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all duration-200">
                      <SelectValue placeholder="Select Location">
                        {values.location || "Select Location"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                      {locationOptions.map((loc) => (
                        <SelectItem key={loc} value={loc} className="text-gray-800 hover:bg-gray-50">
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorMessage name="location" component="div" className="text-red-500 text-sm" />
                </div>
              </div>

              {values.selectedPlatform === 'aws' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <RequiredLabel>
                      <Label htmlFor="accessKey" className="text-gray-800 font-medium">Access Key</Label>
                    </RequiredLabel>
                    <Field
                      as={Input}
                      id="accessKey"
                      name="accessKey"
                      placeholder="Enter AWS Access Key"
                      className="w-full bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange(e);
                        onChange({ accessKey: e.target.value });
                      }}
                    />
                    <ErrorMessage name="accessKey" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <RequiredLabel>
                      <Label htmlFor="secretAccessKey" className="text-gray-800 font-medium">Secret Access Key</Label>
                    </RequiredLabel>
                    <Field
                      as={Input}
                      id="secretAccessKey"
                      name="secretAccessKey"
                      type="password"
                      placeholder="Enter AWS Secret Access Key"
                      className="w-full bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange(e);
                        onChange({ secretAccessKey: e.target.value });
                      }}
                    />
                    <ErrorMessage name="secretAccessKey" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div className="mt-2 flex items-center">
                    <ValidationComponent
                      onValidate={() => handleValidate(values)}
                      error={false}
                      errorMsg="Failed to connect"
                    />
                  </div>
                </div>
              )}

              {values.selectedPlatform === 'google-cloud' && (
                <div className="mt-4 space-y-2">
                  <RequiredLabel>
                    <Label htmlFor="privateKeyFile" className="text-gray-800 font-medium">Google Cloud Private Key</Label>
                  </RequiredLabel>
                  <div className="w-full md:w-1/2">
                    <FileUpload onFileUpload={handleFileUpload} maxSize={10 * 1024 * 1024} />
                  </div>
                  <ErrorMessage name="privateKeyFile" component="div" className="text-red-500 text-sm" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Settings Card */}
          <Card className="border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-800 text-left">Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-sm text-gray-600">
                Provide optional Airflow configuration if needed.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="airflowUrl" className="text-gray-800 font-medium">Airflow URL</Label>
                  <Field
                    as={Input}
                    id="airflowUrl"
                    name="airflowUrl"
                    placeholder="https://my-airflow-url"
                    className="w-full bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      onChange({ airflowUrl: e.target.value });
                    }}
                  />
                  <ErrorMessage name="airflowUrl" component="div" className="text-red-500 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="airflowDagBucket" className="text-gray-800 font-medium">Airflow DAG Bucket</Label>
                  <Field
                    as={Input}
                    id="airflowDagBucket"
                    name="airflowDagBucket"
                    placeholder="my-airflow-dag-bucket"
                    className="w-full bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      onChange({ airflowDagBucket: e.target.value });
                    }}
                  />
                  <ErrorMessage name="airflowDagBucket" component="div" className="text-red-500 text-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags Card */}
          <Card className="border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-800 text-left">Tags</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <TagInput tags={tags} setTags={handleSetTags} />
            </CardContent>
          </Card>

          <ToastComponent />
        </Form>
      )}
    </Formik>
  );
};

export default EnvironmentTab;