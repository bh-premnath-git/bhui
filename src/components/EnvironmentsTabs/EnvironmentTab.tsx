import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, PlusCircle, X } from 'lucide-react';
import { FileUpload } from '@/components/FileUploadComp';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import ApiService from '@/Services/ApiServices';

// Types
type Tag = { key: string; value: string };
type Platform = { id: string; name: string; logo: string; cloud_provider: number };
type SelectFieldValue = string | number | undefined;
type EnvironmentTabState = {
  environmentName: string;
  environment: string;
  projectId: string;
  location: string;
  accessKey: string;
  secretAccessKey: string;
  airflowUrl: string;
  airflowDagBucket: string;
  privateKeyFile: File | null;
};

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

// Helper Components
const PlatformSelector: React.FC<{
  selectedPlatform: string;
  setSelectedPlatform: (id: string) => void;
}> = ({ selectedPlatform, setSelectedPlatform }) => (
  <div className="flex flex-wrap gap-3">
    {PLATFORMS.map((platform) => (
      <div
        key={platform.id}
        className={`flex flex-row items-center space-x-3 border rounded-md p-3 cursor-pointer ${
          selectedPlatform === platform.id ? "border-green-500" : "border-gray-200"
        }`}
        onClick={() => setSelectedPlatform(platform.id)}
        style={{ width: "22%" }}
      >
        <div
          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
            selectedPlatform === platform.id ? "border-green-500 bg-green-500" : "border-gray-500 bg-gray-200"
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
      setTags([...tags, { key: tagKey, value: tagValue }]);
      setTagKey("");
      setTagValue("");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Add Tags</Label>
      <p className="text-sm text-gray-600">
        Add one or more tags to easily identify compute instances created by bighammer.ai in your AWS account (e.g., Key: Product, Value: Bighammer.ai)
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag, index) => (
          <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
            <span>
              {tag.key} &gt;&gt; {tag.value}
            </span>
            <button
              onClick={() => removeTag(index)}
              className="ml-2 text-gray-500 hover:text-gray-700"
              aria-label={`Remove tag ${tag.key}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
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
          <div className="flex justify-center">
            <Button onClick={addTag} className="w-1/3">
              Add Tag
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InputField: React.FC<{
  label: string;
  id: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}> = ({ label, id, placeholder, value, onChange, className }) => (
  <div className={`space-y-2 w-[45%] ${className}`}>
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} placeholder={placeholder} className="w-[60%]" value={value} onChange={onChange} />
  </div>
);

const SelectField: React.FC<{
  label: string;
  id: string;
  options: { value: string; label: string }[];
  value: SelectFieldValue;
  onChange: (value: string) => void;
  className?: string;
}> = ({ label, id, options, value, onChange, className }) => {
  const stringValue = value?.toString();

  const handleChange = (newValue: string) => {
    const originalOption = options.find((opt) => opt.value.toString() === newValue);
    const finalValue = originalOption ? originalOption.value : newValue;
    onChange(finalValue.toString());
  };

  return (
    <div className={`space-y-2 w-[45%] ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <Select value={stringValue} onValueChange={handleChange}>
        <SelectTrigger id={id} className="w-[60%]">
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value.toString()} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

type EnvironmentTabProps = {
  selectedPlatform: string;
  setSelectedPlatform: (id: string) => void;
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  onChange: (changes: Partial<EnvironmentTabState>) => void;
} & EnvironmentTabState;

export const EnvironmentTab: React.FC<EnvironmentTabProps> = ({
  selectedPlatform,
  setSelectedPlatform,
  tags,
  setTags,
  environmentName,
  environment,
  projectId,
  location,
  accessKey,
  secretAccessKey,
  airflowUrl,
  airflowDagBucket,
  privateKeyFile,
  onChange,
}) => {
  const handleChange = (field: keyof EnvironmentTabState, value: string | File | null) => {
    if(selectedPlatform === "google-cloud") {
      onChange({ [field]: value });
      onChange({ ["accessKey"]: "" });
      onChange({ ["secretAccessKey"]: "" });
    }else{
      onChange({ [field]: value });
      onChange({["privateKeyFile"]: null});
    }
  };

  const handleFileUpload = (file: File) => {
    handleChange('privateKeyFile', file);
  };

  const handleValidate = () => {
    console.log("Validating credentials...");
    // Implement credential validation logic here
  };

  const renderCredentialsForm = () => {
    if (selectedPlatform === "aws") {
      return (
        <>
          <div className="w-full flex justify-between items-start space-x-4">
            <InputField
              label="AWS Project ID*"
              id="aws-project-id"
              placeholder="Enter Project Id"
              value={projectId}
              onChange={(e) => handleChange('projectId', e.target.value)}
              className="w-1/2"
            />
            <SelectField
              label="Location*"
              id="location"
              options={[
                { value: "1", label: "US East" },
                { value: "2", label: "US West" },
                { value: "3", label: "EU Central" },
              ]}
              value={location}
              onChange={(value) => handleChange('location', value)}
              className="w-1/2"
            />
          </div>
          <div className="w-full flex justify-between items-start space-x-4">
            <InputField
              label="Access Key"
              id="access-key"
              placeholder="Enter Access Key"
              value={accessKey}
              onChange={(e) => handleChange('accessKey', e.target.value)}
              className="w-1/2"
            />
            <InputField
              label="Secret Access Key"
              id="secret-access-key"
              placeholder="Enter Secret Access Key"
              value={secretAccessKey}
              onChange={(e) => handleChange('secretAccessKey', e.target.value)}
              className="w-1/2"
            />
          </div>
          <div className="w-80 flex justify-end mt-2">
            <button
              onClick={handleValidate}
              type="button"
              className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline hover:underline-offset-4 transition-all duration-200"
            >
              Validate
            </button>
          </div>
        </>
      );
    } else if (selectedPlatform === "google-cloud") {
      return (
        <>
          <div className="w-full flex justify-between items-start space-x-4">
            <InputField
              label="GCP Project ID*"
              id="gcp-project-id"
              placeholder="Enter Project Id"
              value={projectId}
              onChange={(e) => handleChange('projectId', e.target.value)}
              className="w-1/2"
            />
            <SelectField
              label="Location*"
              id="location"
              options={[
                { value: "us-east", label: "US East" },
                { value: "us-west", label: "US West" },
                { value: "eu-central", label: "EU Central" },
              ]}
              value={location}
              onChange={(value) => handleChange('location', value)}
              className="w-1/2"
            />
          </div>
          <div className="w-full">
            <div className="space-y-2">
              <Label htmlFor="private-key">Private Key*</Label>
              <div className="w-1/2">
                <FileUpload onFileUpload={handleFileUpload} maxSize={10 * 1024 * 1024} />
                {privateKeyFile && (
                  <p className="mt-2 text-sm text-gray-600">Uploaded file: {privateKeyFile.name}</p>
                )}
              </div>
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="w-full flex justify-between items-start">
        <InputField
          label="Environment Name*"
          id="environment-name"
          placeholder="Enter Environment Name"
          value={environmentName}
          onChange={(e) => handleChange('environmentName', e.target.value)}
        />
        <SelectField
          label="Environment*"
          id="environment-select"
          options={[
            { value: "301", label: "Development" },
            { value: "302", label: "Staging" },
            { value: "303", label: "Production" },
          ]}
          value={environment}
          onChange={(value) => handleChange('environment', value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Select Platform*</Label>
        <PlatformSelector selectedPlatform={selectedPlatform} setSelectedPlatform={setSelectedPlatform} />
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Credentials</h3>
        {renderCredentialsForm()}
        <div className="w-full flex justify-between items-start space-x-4">
          <InputField
            label="Airflow URL"
            id="airflow-url"
            placeholder="Enter Airflow URL"
            value={airflowUrl}
            onChange={(e) => handleChange('airflowUrl', e.target.value)}
            className="w-1/2"
          />
          <InputField
            label="Airflow DAG Bucket"
            id="airflow-dag-bucket"
            placeholder="Enter Airflow DAG Bucket"
            value={airflowDagBucket}
            onChange={(e) => handleChange('airflowDagBucket', e.target.value)}
            className="w-1/2"
          />
        </div>
        <TagInput tags={tags} setTags={setTags} />
      </div>
    </div>
  );
};
