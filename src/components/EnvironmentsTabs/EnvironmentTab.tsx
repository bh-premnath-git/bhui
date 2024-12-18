import React, { useState } from 'react';
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
import { encrypt_string } from '@/services/encryption';
import { AccordionSection } from '../CreateFlowForm/CreateFlowForm'; // Ensure this is correctly imported

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
type MWAAEnvironments = {
  environments: string[];
};

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
  changeVerification: (verified: boolean) => void;
}

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
  setSelectedPlatform: (platform: string) => void;
}> = ({ selectedPlatform, setSelectedPlatform }) => (
  <div className="flex flex-wrap gap-6">
    {PLATFORMS.map((platform) => (
      <div
        key={platform.id}
        className={`flex flex-row items-center space-x-3 border rounded-md p-1 cursor-pointer transition-all duration-200 ${selectedPlatform === platform.id
          ? "border-green-500 bg-green-50 shadow-md"
          : "border-gray-700 bg-gray-50 hover:bg-gray-200 hover:shadow-sm"
          }`}
        onClick={() => setSelectedPlatform(platform.id)}
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
  changeVerification,
}) => {
  const [ToastComponent, showToast] = useToast();
  const [mwaaEnvironments, setMwaaEnvironments] = useState<MWAAEnvironments>({ environments: [] });
  const [selectedMwaaEnv, setSelectedMwaaEnv] = useState("")
  const [credentialsVal, setCredentialsVal] = useState<{
    aws_access_key_id: string;
    aws_secret_access_key: string;
    location: string;
    init_vector: string;
  } | null>(null);

  // Ensure only one section is expanded at a time:
  const [openSections, setOpenSections] = useState({
    environmentDetails: true,
    platform: false,
    credentials: false,
    advancedSettings: false,
    tags: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => {
      const isCurrentlyOpen = prev[section];
      const newState = {
        environmentDetails: false,
        platform: false,
        credentials: false,
        advancedSettings: false,
        tags: false,
      };
      newState[section] = !isCurrentlyOpen;
      return newState;
    });
  };

  const initialValues: FormValues = {
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
  };

  const environmentOptions = {
    "301": "Development",
    "302": "Staging",
    "303": "Production"
  } as const;

  const locationOptions = ["us-east-1", "us-west-1", "eu-central-1"] as const;
  type LocationOption = typeof locationOptions[number];

  const handleValidate = async (values: FormValues) => {
    try {
      if (!values.accessKey || !values.secretAccessKey || !values.location) {
        showToast('Please fill in all required fields', { color: '#FF0000' });
        return false;
      }
      const locationVal = locationOptions[parseInt(values.location) - 1];
      const encryted_aws_key_id = encrypt_string(values.accessKey);
      const encryted_aws_secret_access_key = encrypt_string(
        values.secretAccessKey,
        encryted_aws_key_id.initVector
      );

      const credentials = {
        aws_access_key_id: encryted_aws_key_id.encryptedString,
        aws_secret_access_key: encryted_aws_secret_access_key.encryptedString,
        location: locationVal,
        init_vector: encryted_aws_key_id.initVector
      };

      setCredentialsVal(credentials);

      const result = await ApiService('8011', 'post', '/environment/list-mwaa-environments', credentials);
      const success = result && typeof result === 'object' && 'environments' in result;

      if (success) {
        setMwaaEnvironments(result as MWAAEnvironments);
      }

      showToast(
        success ? 'Successfully connected to AWS' : 'Failed to connect',
        { color: success ? '#00b060' : '#FF0000' }
      );
      changeVerification(success);
      return success;
    } catch (error) {
      showToast('Failed to connect', { color: '#FF0000' });
      changeVerification(false);
      return false;
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

  const hasError = (fields: string[], errors: any) => {
    return fields.some((field) => {
      const fieldParts = field.split('.');
      let current: any = errors;
      for (const part of fieldParts) {
        if (!current) break;
        current = current[part];
      }
      return !!current;
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={() => {}}
      validateOnChange={true}
      validateOnBlur={true}
    >
      {({ values, errors, handleChange, setFieldValue }) => {
        const environmentDetailsHasError = hasError(['environmentName', 'environment'], errors);
        const platformHasError = hasError(['selectedPlatform'], errors);

        const credentialsFields = ['projectId', 'location'];
        if (values.selectedPlatform === 'aws') {
          credentialsFields.push('accessKey', 'secretAccessKey');
        } else if (values.selectedPlatform === 'google-cloud') {
          credentialsFields.push('privateKeyFile');
        }
        const credentialsHasError = hasError(credentialsFields, errors);

        const handleGetMWAAInfos = async (value: string) => {
          try {
            if (!credentialsVal) return;
            const result = await ApiService(
              '8011',
              'post',
              `/environment/get_aws_mwaa_env_connection?env_name=${value}`,
              credentialsVal
            );
            if (result) {
              setFieldValue('airflowUrl', result.environment_details.WebserverUrl);
              setFieldValue('airflowDagBucket', result.environment_details.SourceBucketArn);
            }
          } catch (error) {
            console.error("err", error);
          }
        };

        return (
          <Form className="space-y-2 p-2 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-md">
            <div className="space-y-3 mb-4">
              <h1 className="text-2xl font-bold text-gray-800">Configure Environment</h1>
              <p className="text-sm text-gray-600">
                Set up your environment details, select a cloud platform, and provide necessary credentials.
              </p>
            </div>

            <AccordionSection
              title="Environment Details"
              isOpen={openSections.environmentDetails}
              onToggle={() => toggleSection('environmentDetails')}
              borderColor="blue-100"
              titleColor="text-blue-800"
              hasError={environmentDetailsHasError}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <RequiredLabel>
                    <Label htmlFor="environmentName" className="font-medium">Environment Name</Label>
                  </RequiredLabel>
                  <Field
                    as={Input}
                    id="environmentName"
                    name="environmentName"
                    placeholder="e.g. My Dev Env"
                    className="border-blue-200 focus:ring-blue-500"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      onChange({ environmentName: e.target.value });
                    }}
                  />
                  <ErrorMessage name="environmentName" component="div" className="text-red-500 text-sm" />
                </div>

                <div className="space-y-2">
                  <RequiredLabel>
                    <Label htmlFor="environment" className="font-medium">Environment</Label>
                  </RequiredLabel>
                  <Select
                    defaultValue={values.environment}
                    value={values.environment}
                    onValueChange={(value) => {
                      setFieldValue('environment', value);
                      onChange({ environment: value });
                    }}
                  >
                    <SelectTrigger className="border-blue-200">
                      <SelectValue placeholder="Select Environment">
                        {values.environment ? environmentOptions[values.environment as keyof typeof environmentOptions] : "Select Environment"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
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
            </AccordionSection>

            <AccordionSection
              title="Select Platform"
              isOpen={openSections.platform}
              onToggle={() => toggleSection('platform')}
              borderColor="emerald-100"
              titleColor="text-emerald-800"
              hasError={platformHasError}
            >
              <RequiredLabel>
                <Label className="font-medium">Select which platform you'd like to use</Label>
              </RequiredLabel>
              <PlatformSelector
                selectedPlatform={values.selectedPlatform}
                setSelectedPlatform={(platform) => {
                  setFieldValue('selectedPlatform', platform);
                  setSelectedPlatform(platform);
                }}
              />
              <ErrorMessage name="selectedPlatform" component="div" className="text-red-500 text-sm mt-2" />
            </AccordionSection>

            <AccordionSection
              title="Credentials"
              isOpen={openSections.credentials}
              onToggle={() => toggleSection('credentials')}
              borderColor="yellow-100"
              titleColor="text-yellow-800"
              hasError={credentialsHasError}
            >
              <div className="text-sm text-gray-600 mb-4">
                Select a project, location, and provide platform-specific credentials.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <RequiredLabel>
                    <Label htmlFor="projectId" className="font-medium">Project ID</Label>
                  </RequiredLabel>
                  <Field
                    as={Input}
                    id="projectId"
                    name="projectId"
                    placeholder="Enter project ID"
                    className="border-blue-200 focus:ring-blue-500"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      onChange({ projectId: e.target.value });
                    }}
                  />
                  <ErrorMessage name="projectId" component="div" className="text-red-500 text-sm" />
                </div>

                <div className="space-y-2">
                  <RequiredLabel>
                    <Label htmlFor="location" className="font-medium">Location</Label>
                  </RequiredLabel>
                  <Select
                    value={values.location ? locationOptions[parseInt(values.location) - 1] : undefined}
                    onValueChange={(value) => {
                      const locationIndex = locationOptions.indexOf(value as LocationOption);
                      const locationNumber = (locationIndex + 1).toString();
                      setFieldValue('location', locationNumber);
                      onChange({ location: locationNumber });
                    }}
                  >
                    <SelectTrigger className="border-blue-200">
                      <SelectValue placeholder="Select Location">
                        {values.location ? locationOptions[parseInt(values.location) - 1] : "Select Location"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((loc) => (
                        <SelectItem
                          key={loc}
                          value={loc}
                          className="text-gray-800 hover:bg-gray-50"
                        >
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
                      <Label htmlFor="accessKey" className="font-medium">Access Key</Label>
                    </RequiredLabel>
                    <Field
                      as={Input}
                      id="accessKey"
                      name="accessKey"
                      placeholder="Enter AWS Access Key"
                      className="border-blue-200 focus:ring-blue-500"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange(e);
                        onChange({ accessKey: e.target.value });
                      }}
                    />
                    <ErrorMessage name="accessKey" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <RequiredLabel>
                      <Label htmlFor="secretAccessKey" className="font-medium">Secret Access Key</Label>
                    </RequiredLabel>
                    <Field
                      as={Input}
                      id="secretAccessKey"
                      name="secretAccessKey"
                      type="password"
                      placeholder="Enter AWS Secret Access Key"
                      className="border-blue-200 focus:ring-blue-500"
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
                    <Label htmlFor="privateKeyFile" className="font-medium">Google Cloud Private Key</Label>
                  </RequiredLabel>
                  <div className="w-full md:w-1/2">
                    <FileUpload onFileUpload={handleFileUpload} maxSize={10 * 1024 * 1024} />
                  </div>
                  <ErrorMessage name="privateKeyFile" component="div" className="text-red-500 text-sm" />
                </div>
              )}
            </AccordionSection>

            <AccordionSection
              title="Advanced Settings"
              isOpen={openSections.advancedSettings}
              onToggle={() => toggleSection('advancedSettings')}
              borderColor="purple-100"
              titleColor="text-purple-800"
            >
              <p className="text-sm text-gray-600 mb-4">
                Provide optional Airflow configuration if needed.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mwaaEnvironment" className="font-medium">MWAA Environment</Label>
                  <Select
                    value={selectedMwaaEnv}
                    onValueChange={(value) => {
                      setSelectedMwaaEnv(value);
                      handleGetMWAAInfos(value);
                    }}
                  >
                    <SelectTrigger className="border-blue-200">
                      <SelectValue placeholder={mwaaEnvironments.environments.length === 0
                        ? "No MWAA Environments available"
                        : selectedMwaaEnv || "Select MWAA Environment"}>
                        {mwaaEnvironments.environments.length === 0
                          ? "No MWAA Environments available"
                          : selectedMwaaEnv || "Select MWAA Environment"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {mwaaEnvironments.environments.map((env) => (
                        <SelectItem
                          key={env}
                          value={env}
                          className="text-gray-800 hover:bg-gray-50"
                        >
                          {env}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="airflowUrl" className="font-medium">Airflow URL</Label>
                  <Field
                    as={Input}
                    id="airflowUrl"
                    name="airflowUrl"
                    value={values.airflowUrl}
                    placeholder="https://my-airflow-url"
                    className="border-blue-200 focus:ring-blue-500"
                    readOnly
                  />
                  <ErrorMessage name="airflowUrl" component="div" className="text-red-500 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="airflowDagBucket" className="font-medium">Airflow DAG Bucket</Label>
                  <Field
                    as={Input}
                    id="airflowDagBucket"
                    name="airflowDagBucket"
                    value={values.airflowDagBucket}
                    placeholder="my-airflow-dag-bucket"
                    className="border-blue-200 focus:ring-blue-500"
                    readOnly
                  />
                  <ErrorMessage name="airflowDagBucket" component="div" className="text-red-500 text-sm" />
                </div>
              </div>
            </AccordionSection>

            <AccordionSection
              title="Tags"
              isOpen={openSections.tags}
              onToggle={() => toggleSection('tags')}
              borderColor="pink-100"
              titleColor="text-pink-800"
            >
              <TagInput tags={tags} setTags={handleSetTags} />
            </AccordionSection>

            <ToastComponent />
          </Form>
        );
      }}
    </Formik>
  );
};

export default EnvironmentTab;
