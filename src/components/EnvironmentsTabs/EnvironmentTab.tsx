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
import { Badge } from "@/components/ui/badge"
// Types
type Tag = {
  tagList: { key: string; value: string }[];
} | null;
type Platform = { id: string; name: string; logo: string; cloud_provider: number };

interface EnvironmentTabProps {
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  tags: Tag[];
  setTags: (newTags: Tag[] | ((prevTags: Tag[]) => Tag[])) => void;
  onChange: (changes: Partial<FormValues>) => void;
  environmentName: string;
  environment: string;
  projectId: string;
  location: string;
  accessKey: string;
  secretAccessKey: string;
  airflowUrl: string;
  airflowDagBucket: string;
  privateKeyFile: File | null;
  chamgeVerification: (verified: boolean) => void;
}


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
// Constants
const PLATFORMS: Platform[] = [
  {
    id: "aws",
    name: "Amazon Web Services",
    logo: "/src/assets/environments/aws.svg?height=40&width=40",
    cloud_provider: 101,
  },
  {
    id: "google-cloud",
    name: "Google Cloud",
    logo: "/src/assets/environments/google.svg?height=40&width=40",
    cloud_provider: 102,
  },
];

// Validation Schema
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

// Helper Components
const PlatformSelector: React.FC<{
  selectedPlatform: string;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
}> = ({ selectedPlatform, setFieldValue }) => (
  <div className="flex flex-wrap gap-3">
    {PLATFORMS.map((platform) => (
      <div
        key={platform.id}
        className={`flex flex-row items-center space-x-3 border rounded-md p-3 cursor-pointer ${selectedPlatform === platform.id ? "border-green-500" : "border-gray-200"
          }`}
        onClick={() => setFieldValue('selectedPlatform', platform.id)}
        style={{ width: "22%" }}
      >
        <div
          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedPlatform === platform.id ? "border-green-500 bg-green-500" : "border-gray-500 bg-gray-200"
            }`}
        >
          {selectedPlatform === platform.id && <Check className="w-3 h-3 text-white" />}
        </div>
        <div className="flex flex-col items-center flex-grow">
          <img src={platform.logo} alt={`${platform.name} logo`} className="w-10 h-10 mb-1" />
          <span className="text-xs text-center leading-tight">{platform.name}</span>
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

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagKey && tagValue) {
      setTags([...tags,  { tagList: [{ key: tagKey, value: tagValue }] }]);
      setTagKey("");
      setTagValue("");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Add one or more tags to easily identify compute instances created by bighammer.ai in your cloud account
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag, index) => (
          tag !== null &&
          tag.tagList.map((item, itemIndex) => (
            <Badge key={`${index}-${itemIndex}`} variant="secondary" className="px-2 py-1">
              {`${item.key} >> ${item.value}`}
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-4 w-4 p-0"
                onClick={() => removeTag(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        ))}
      </div>
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
  );
};

export const EnvironmentTab: React.FC<EnvironmentTabProps> = ({
  selectedPlatform,
  setSelectedPlatform,
  tags,
  setTags,
  onChange,
  environmentName,
  environment,
  projectId,
  location,
  accessKey,
  secretAccessKey,
  airflowUrl,
  airflowDagBucket,
  privateKeyFile,
  chamgeVerification,
}) => {
  const [ToastComponent, showToast] = useToast();
  const [isTestConnection, setIsTestConnection] = useState(false);

  const handleValidate = async (values: FormValues) => {
    try {
      const result = await ApiService('8011', 'post', `/aws/test_connection`, {
        aws_access_key_id: values.accessKey,
        aws_secret_access_key: values.secretAccessKey
      });
      if (result.status) {
        setIsTestConnection(true);
        showToast('Successfully able to connect', { color: '#00b060' });
        chamgeVerification(true);
        return true;
      } else {
        setIsTestConnection(false);
        showToast('Failed to connect', { color: '#FF0000' });
        chamgeVerification(false);
        return false;
      }
    } catch (error) {
      setIsTestConnection(false);
      showToast('Failed to connect', { color: '#FF0000' });
      chamgeVerification(false);
      return false;
    }
  };

  const handleSetTags: React.Dispatch<React.SetStateAction<Tag[]>> = (newTags) => {
    if (typeof newTags === 'function') {
      setTags((prevTags) => newTags(prevTags));
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
  
  type LocationOptions = {
    "1": string;
    "2": string;
    "3": string;
  }
  
  const locationOptions: LocationOptions = {
    "1": "US East",
    "2": "US West",
    "3": "EU Central",
  } as const;

  return (
    <Formik
      initialValues={{
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
      }}
      validationSchema={validationSchema}
      onSubmit={(values, formikHelpers) => { }}
    >
      {({ values, errors, touched, setFieldValue, handleChange, handleBlur }) => (
        <Form className="space-y-6">
          <div className="w-full flex justify-between items-start">
            <div className="space-y-2 w-[45%]">
              <Label htmlFor="environmentName">Environment Name*</Label>
              <Field
                as={Input}
                id="environmentName"
                name="environmentName"
                placeholder="Enter Environment Name"
                className="w-[60%]"
                onChange={(e: { target: { value: any; }; }) => {
                  handleChange(e);
                  onChange({ environmentName: e.target.value });
                }}
              />
              <ErrorMessage name="environmentName" component="div" className="text-red-500 text-sm" />
            </div>
            <div className="space-y-2 w-[45%]">
              <Label htmlFor="environment">Environment*</Label>
              <Select
                defaultValue={values.environment}
                value={values.environment}
                onValueChange={(value: keyof EnvironmentOptions) => {
                  setFieldValue('environment', value);
                  onChange({ environment: value });
                }}
              >
                <SelectTrigger className="w-[60%]">
                  <SelectValue placeholder="Select Environment" >
                    {values.environment ? environmentOptions[values.environment as keyof EnvironmentOptions] : "Select Environment"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(environmentOptions) as [keyof EnvironmentOptions, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ErrorMessage name="environment" component="div" className="text-red-500 text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Platform*</Label>
            <PlatformSelector
              selectedPlatform={values.selectedPlatform}
              setFieldValue={(field, value) => {
                setFieldValue(field, value);
                setSelectedPlatform(value);
                onChange({ selectedPlatform: value });
              }}
            />
          </div>

          <div className="w-full space-y-4">
            <h3 className="text-base font-medium">Credentials</h3>
            <div className="grid grid-cols-6 gap-2">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="projectId">Project ID*</Label>
                <Field
                  as={Input}
                  id="projectId"
                  name="projectId"
                  placeholder="Enter Project Id"
                  className="w-[60%]"
                  onChange={(e: { target: { value: any; }; }) => {
                    handleChange(e);
                    onChange({ projectId: e.target.value });
                  }}
                />
                <ErrorMessage name="projectId" component="div" className="text-red-500 text-sm" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="location">Location*</Label>
                <Select
                  defaultValue={values.location}
                  value = {values.location}
                  onValueChange={(value: keyof LocationOptions) => {
                    setFieldValue('location', value);
                    onChange({ location: value });
                  }}
                >
                  <SelectTrigger className="w-[60%]">
                  <SelectValue placeholder="Select Environment" >
                      {values.location ? locationOptions[values.location as keyof LocationOptions] : "Select Location"}
                  </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                  {(Object.entries(locationOptions) as [keyof LocationOptions, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
                <ErrorMessage name="location" component="div" className="text-red-500 text-sm" />
              </div>
              <div className="col-span-2"></div>
              {values.selectedPlatform === 'aws' && (
              <>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="accessKey">Access Key</Label>
                    <Field
                      as={Input}
                      id="accessKey"
                      name="accessKey"
                      placeholder="Enter Access Key"
                      className="w-[60%]"
                      onChange={(e: { target: { value: any; }; }) => {
                        handleChange(e);
                        onChange({ accessKey: e.target.value });
                      }}
                    />
                    <ErrorMessage name="accessKey" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div className="col-span-3 space-y-2">
                    <Label htmlFor="secretAccessKey">Secret Access Key</Label>
                    <Field
                      as={Input}
                      id="secretAccessKey"
                      name="secretAccessKey"
                      type="password"
                      placeholder="Enter Secret Access Key"
                      className="w-[60%]"
                      onChange={(e: { target: { value: any; }; }) => {
                        handleChange(e);
                        onChange({ secretAccessKey: e.target.value });
                      }}
                    />
                    <ErrorMessage name="secretAccessKey" component="div" className="text-red-500 text-sm" />
                  </div>
                <div className="w-1/4-plus flex justify-center mt-2">
                  <ValidationComponent onValidate={() => handleValidate(values)} />
                </div>
              </>
            )}
            </div>
            {values.selectedPlatform === 'google-cloud' && (
              <div className="w-full">
                <div className="space-y-2">
                  <Label htmlFor="privateKeyFile">Private Key*</Label>
                  <div className="w-1/2">
                    <FileUpload onFileUpload={handleFileUpload} maxSize={10 * 1024 * 1024} />
                  </div>
                  <ErrorMessage name="privateKeyFile" component="div" className="text-red-500 text-sm" />
                </div>
              </div>
            )}

            <div className="w-full flex justify-between items-start space-x-4">
              <div className="space-y-2 w-1/2">
                <Label htmlFor="airflowUrl">Airflow URL</Label>
                <Field
                  as={Input}
                  id="airflowUrl"
                  name="airflowUrl"
                  placeholder="Enter Airflow URL"
                  className="w-[60%]"
                  onChange={(e: { target: { value: any; }; }) => {
                    handleChange(e);
                    onChange({ airflowUrl: e.target.value });
                  }}
                />
                <ErrorMessage name="airflowUrl" component="div" className="text-red-500 text-sm" />
              </div>
              <div className="space-y-2 w-1/2">
                <Label htmlFor="airflowDagBucket">Airflow DAG Bucket</Label>
                <Field
                  as={Input}
                  id="airflowDagBucket"
                  name="airflowDagBucket"
                  placeholder="Enter Airflow DAG Bucket"
                  className="w-[60%]"
                  onChange={(e: { target: { value: any; }; }) => {
                    handleChange(e);
                    onChange({ airflowDagBucket: e.target.value });
                  }}
                />
                <ErrorMessage name="airflowDagBucket" component="div" className="text-red-500 text-sm" />
              </div>
            </div>

            <TagInput tags={tags} setTags={handleSetTags} />
          </div>

          <ToastComponent />
        </Form>
      )}
    </Formik>
  );
};

export default EnvironmentTab;                