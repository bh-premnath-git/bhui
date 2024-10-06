import React, { useState, useRef } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, PlusCircle, X } from 'lucide-react';

// Types
type Tag = { key: string; value: string };
type Platform = { id: string; name: string; logo: string };

// Constants
const PLATFORMS: Platform[] = [
  {
    id: "google-cloud",
    name: "Google Cloud",
    logo: "/src/assets/environments/google.svg?height=40&width=40",
  },
  {
    id: "aws",
    name: "Amazon Web Services",
    logo: "/src/assets/environments/aws.svg?height=40&width=40",
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    logo: "/src/assets/environments/azure.svg?height=40&width=40",
  },
  {
    id: "bighammer",
    name: "BigHammer.ai",
    logo: "/src/assets/environments/bighammer.svg?height=40&width=40",
  },
];

// Helper Components
const PlatformSelector: React.FC<{
  selectedPlatform: string;
  setSelectedPlatform: (id: string) => void;
}> = ({ selectedPlatform, setSelectedPlatform }) => (
  <div className="flex justify-between">
    {PLATFORMS.map((platform) => (
      <div
        key={platform.id}
        className={`flex flex-row items-center space-x-3 border rounded-md p-3 cursor-pointer ${
          selectedPlatform === platform.id
            ? "border-green-500"
            : "border-gray-200"
        }`}
        onClick={() => setSelectedPlatform(platform.id)}
        style={{ width: "22%" }}
      >
        <div
          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
            selectedPlatform === platform.id
              ? "border-green-500 bg-green-500"
              : "border-gray-300"
          }`}
        >
          {selectedPlatform === platform.id && (
            <Check className="w-3 h-3 text-white" />
          )}
        </div>
        <div className="flex flex-col items-center flex-grow">
          <img
            src={platform.logo}
            alt={`${platform.name} logo`}
            className="w-10 h-10 mb-1"
          />
          <span className="text-xs text-center leading-tight">
            {platform.name}
          </span>
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
        Add one or more tags to easily identify compute instances created by
        bighammer.ai in your AWS account (Eg : Key : Product, Value :
        Bighammer.ai)
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
          >
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
}> = ({ label, id, placeholder, value, onChange }) => (
  <div className="space-y-2 w-[45%]">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      placeholder={placeholder}
      className="w-[60%]"
      value={value}
      onChange={onChange}
    />
  </div>
);

const SelectField: React.FC<{
  label: string;
  id: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}> = ({ label, id, options, value, onChange }) => (
  <div className="space-y-2 w-[45%]">
    <Label htmlFor={id}>{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-[60%]">
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const FileUpload: React.FC<{
  handleUploadClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}> = ({ handleUploadClick, fileInputRef }) => (
  <div className="border-2 border-dashed rounded-md p-4 text-center w-[70%]">
    <div className="group">
      <PlusCircle
        className="mx-auto p-2 rounded-full transition-colors duration-300 h-8 w-8 text-gray-400 flex items-center justify-center bg-gray-200 group-hover:bg-black group-hover:text-gray-400"
        aria-hidden="true"
      />
    </div>
    <p className="mt-2 text-sm text-gray-600">
      Drag & Drop your file here or{" "}
      <span
        className="upload-text text-blue-500 cursor-pointer transition-all duration-300 ease-in-out hover:text-blue-700"
        onClick={handleUploadClick}
      >
        Upload
      </span>
    </p>
    <input
      type="file"
      id="private-key"
      className="sr-only"
      ref={fileInputRef}
      aria-label="Upload private key file"
    />
  </div>
);

export const EnvironmentTab: React.FC<{
  selectedPlatform: string;
  setSelectedPlatform: (id: string) => void;
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}> = ({
  selectedPlatform,
  setSelectedPlatform,
  tags,
  setTags,
}) => {
  const [environmentName, setEnvironmentName] = useState("");
  const [environment, setEnvironment] = useState("");
  const [projectId, setProjectId] = useState("");
  const [location, setLocation] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = (): void => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="w-full flex justify-between items-start">
        <InputField
          label="Environment Name*"
          id="environment-name"
          placeholder="Enter Environment Name"
          value={environmentName}
          onChange={(e) => setEnvironmentName(e.target.value)}
        />
        <SelectField
          label="Environment*"
          id="environment-select"
          options={[
            { value: "dev", label: "Development" },
            { value: "staging", label: "Staging" },
            { value: "prod", label: "Production" },
          ]}
          value={environment}
          onChange={setEnvironment}
        />
      </div>
      <div className="space-y-2">
        <Label>Select Platform*</Label>
        <PlatformSelector
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
        />
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Credentials</h3>
        <div className="w-full flex justify-between items-start">
          <InputField
            label="GCP Project ID*"
            id="gcp-project-id"
            placeholder="Enter Project Id"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
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
            onChange={setLocation}
          />
        </div>
        <div className="w-full">
          <div className="space-y-2">
            <Label htmlFor="private-key">Private Key*</Label>
            <FileUpload
              handleUploadClick={handleUploadClick}
              fileInputRef={fileInputRef}
            />
          </div>
        </div>
        <TagInput tags={tags} setTags={setTags} />
      </div>
    </div>
  );
};