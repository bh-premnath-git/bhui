import React, { useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, InfoIcon, Plus, Check, X, PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Types
type Tag = { key: string; value: string };
type Platform = { id: string; name: string; logo: string };
type ZoneDetail = { name: string; url: string };
type LifecycleConfig = { [key: string]: string };

// Constants
const TABS = [
  "environment",
  "configure-lake",
  "preconfigure-zones",
  "configure-lifecycle",
] as const;
type TabType = (typeof TABS)[number];
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
const INITIAL_ZONE_DETAILS: ZoneDetail[] = [
  { name: "Bronze Zone", url: "S3://Mylake.R.Vyz12.Abc.Com" },
  { name: "Silver Zone", url: "S3://Mylake.R.Vyz12.Abc.Com" },
  { name: "Gold Zone", url: "S3://Mylake.R.Vyz12.Abc.Com" },
  { name: "Log Zone", url: "S3://Mylake.R.Vyz12.Abc.Com" },
  { name: "Quarantine Zone", url: "S3://Mylake.R.Vyz12.Abc.Com" },
];
const ZONES = [
  "Bronze Zone",
  "Silver Zone",
  "Gold Zone",
  "Log Zone",
  "Quarantine Zone",
] as const;

// @ts-ignore
type ZoneType = (typeof ZONES)[number];

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
        {options.map((option: { value: string; label: string }) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const InputFieldWithIcon: React.FC<{
  label: string;
  id: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, id, placeholder, value, onChange }) => (
  <div className="flex-1 space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative">
      <Input
        id={id}
        placeholder={placeholder}
        className="w-full pr-10"
        value={value}
        onChange={onChange}
      />
      <HelpCircle className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
    </div>
  </div>
);

const FileUpload: React.FC<{
  handleUploadClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}> = ({ handleUploadClick, fileInputRef }) => (
  <div className="border-2 border-dashed rounded-md p-4 text-center w-[70%]">
    <div className="group">
      <Plus
        className="mx-auto p-2 rounded-full transition-colors duration-300 h-8 w-8 text-gray-400 flex items-center justify-center rounded-full bg-gray-200 group-hover:bg-black group-hover:text-gray-400"
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

const ZoneDetailItem: React.FC<{
  zone: ZoneDetail;
  index: number;
  handleUrlChange: (index: number, newUrl: string) => void;
}> = ({ zone, index, handleUrlChange }) => (
  <div className="flex items-center space-x-4 bg-gray-100 p-2 rounded">
    <div className="w-48 flex items-center justify-end">
      <span className="font-medium">{zone.name}</span>
      <InfoIcon className="w-4 h-4 ml-1 text-gray-400" />
    </div>
    <div
      className="w-64 p-2 rounded text-sm overflow-hidden"
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => handleUrlChange(index, e.currentTarget.textContent || "")}
    >
      {zone.url}
    </div>
  </div>
);

const ConfigSection: React.FC<{
  title: string;
  config: LifecycleConfig;
  setConfig: React.Dispatch<React.SetStateAction<LifecycleConfig>>;
}> = ({ title, config, setConfig }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {ZONES.map((zone) => (
          <div key={zone} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor={zone.toLowerCase().replace(" ", "-")}
                className="text-sm flex items-center"
              >
                {zone}
              </Label>
            </div>
            <Input
              id={zone.toLowerCase().replace(" ", "-")}
              placeholder="Enter days"
              className="text-sm w-full"
              value={config[zone] || ""}
              onChange={(e) => setConfig({ ...config, [zone]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const EnvironmentTab: React.FC<{
  selectedPlatform: string;
  setSelectedPlatform: (id: string) => void;
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleUploadClick: () => void;
}> = ({
  selectedPlatform,
  setSelectedPlatform,
  tags,
  setTags,
  fileInputRef,
  handleUploadClick,
}) => {
  return (
    <div className="space-y-6">
      <div className="w-full flex justify-between items-start">
        <InputField
          label="Environment Name*"
          id="environment-name"
          placeholder="Enter Environment Name"
          value=""
          onChange={() => {}}
        />
        <SelectField
          label="Environment*"
          id="environment-select"
          options={[
            { value: "dev", label: "Development" },
            { value: "staging", label: "Staging" },
            { value: "prod", label: "Production" },
          ]}
          value=""
          onChange={() => {}}
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
            value=""
            onChange={() => {}}
          />
          <SelectField
            label="Location*"
            id="location"
            options={[
              { value: "us-east", label: "US East" },
              { value: "us-west", label: "US West" },
              { value: "eu-central", label: "EU Central" },
            ]}
            value=""
            onChange={() => {}}
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

const ConfigureLakeTab: React.FC<{
  businessUrl: string;
  setBusinessUrl: (url: string) => void;
  lakeName: string;
  setLakeName: (name: string) => void;
  lakeDescription: string;
  setLakeDescription: (description: string) => void;
}> = ({
  businessUrl,
  setBusinessUrl,
  lakeName,
  setLakeName,
  lakeDescription,
  setLakeDescription,
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <InputFieldWithIcon
          label="Business URL"
          id="business-url"
          placeholder="Enter Business URL"
          value={businessUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setBusinessUrl(e.target.value)
          }
        />
        <InputFieldWithIcon
          label="Lake Name"
          id="lake-name"
          placeholder="Enter Lake Name"
          value={lakeName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLakeName(e.target.value)
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lake-description">Lake Description</Label>
        <Textarea
          id="lake-description"
          placeholder="Type Your Description Here"
          className="w-full h-32"
          value={lakeDescription}
          onChange={(e) => setLakeDescription(e.target.value)}
        />
      </div>
    </div>
  );
};

const PreConfigureZonesTab: React.FC<{
  zoneDetails: ZoneDetail[];
  handleUrlChange: (index: number, newUrl: string) => void;
}> = ({ zoneDetails, handleUrlChange }) => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <p className="text-sm text-gray-600 mb-4">
        Based on the business URL and lake name, all zones are preconfigured.
        Please find the zone details below. To know more about data zone{" "}
        <a href="/data-zone-info" className="text-blue-500 hover:underline">
          Click Here
        </a>
        .
      </p>
      <div className="space-y-2">
        {zoneDetails.map((zone: ZoneDetail, index: number) => (
          <ZoneDetailItem
            key={index}
            zone={zone}
            index={index}
            handleUrlChange={handleUrlChange}
          />
        ))}
      </div>
    </div>
  );
};

const ConfigureLifecycleTab: React.FC<{
  standardZoneConfig: LifecycleConfig;
  setStandardZoneConfig: React.Dispatch<React.SetStateAction<LifecycleConfig>>;
  archiveZoneConfig: LifecycleConfig;
  setArchiveZoneConfig: React.Dispatch<React.SetStateAction<LifecycleConfig>>;
}> = ({
  standardZoneConfig,
  setStandardZoneConfig,
  archiveZoneConfig,
  setArchiveZoneConfig,
}) => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <p className="text-center mb-6 text-sm">
        Configure duration for which data needs to be stored. Please note life
        cycle policy is done as per the organization governance standards. To
        know more about life cycle policy{" "}
        <a href="#" className="text-blue-600 hover:underline">
          Click Here.
        </a>
      </p>
      <div className="space-y-6">
        <ConfigSection
          title="Days in Standard Zone"
          config={standardZoneConfig}
          setConfig={setStandardZoneConfig}
        />
        <ConfigSection
          title="Days in Archive Zone"
          config={archiveZoneConfig}
          setConfig={setArchiveZoneConfig}
        />
      </div>
    </div>
  );
};

// Main component
export default function EnvironmentConsoleComponent(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>(TABS[0]);
  const [tags, setTags] = useState<Tag[]>([
    { key: "Department", value: "Tech" },
    { key: "Region", value: "USA" },
  ]);
  const [selectedPlatform, setSelectedPlatform] =
    useState<string>("google-cloud");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoneDetails, setZoneDetails] =
    useState<ZoneDetail[]>(INITIAL_ZONE_DETAILS);

  const [businessUrl, setBusinessUrl] = useState<string>("");
  const [lakeName, setLakeName] = useState<string>("");
  const [lakeDescription, setLakeDescription] = useState<string>("");

  const [standardZoneConfig, setStandardZoneConfig] = useState<LifecycleConfig>(
    {}
  );
  const [archiveZoneConfig, setArchiveZoneConfig] = useState<LifecycleConfig>(
    {}
  );

  const handleBack = (): void => {
    const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1]);
    }
  };

  const handleNext = (): void => {
    const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1]);
    }
  };

  const handleUploadClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleUrlChange = (index: number, newUrl: string): void => {
    const updatedZoneDetails = [...zoneDetails];
    updatedZoneDetails[index].url = newUrl;
    setZoneDetails(updatedZoneDetails);
  };

  const handleTabChange = (value: string): void => {
    if (TABS.includes(value as TabType)) {
      setActiveTab(value as TabType);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex justify-between items-center">
          <div className="flex-1 flex justify-center">
            <TabsList aria-label="Environment Console Tabs" className="bg-transparent">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="px-4 py-2 rounded-md transition-colors duration-200 data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  {tab.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <Button variant="default" className="bg-gray-800 text-white hover:bg-gray-700">
            View All Environments
          </Button>
        </div>

        <Card className="w-full mt-4">
          <CardContent className="p-6">
            <div className="max-w-[800px] mx-auto">
              <TabsContent value="environment">
                <EnvironmentTab
                  selectedPlatform={selectedPlatform}
                  setSelectedPlatform={setSelectedPlatform}
                  tags={tags}
                  setTags={setTags}
                  fileInputRef={fileInputRef}
                  handleUploadClick={handleUploadClick}
                />
              </TabsContent>
              <TabsContent value="configure-lake">
                <ConfigureLakeTab
                  businessUrl={businessUrl}
                  setBusinessUrl={setBusinessUrl}
                  lakeName={lakeName}
                  setLakeName={setLakeName}
                  lakeDescription={lakeDescription}
                  setLakeDescription={setLakeDescription}
                />
              </TabsContent>
              <TabsContent value="preconfigure-zones">
                <PreConfigureZonesTab zoneDetails={zoneDetails} handleUrlChange={handleUrlChange} />
              </TabsContent>
              <TabsContent value="configure-lifecycle">
                <ConfigureLifecycleTab
                  standardZoneConfig={standardZoneConfig}
                  setStandardZoneConfig={setStandardZoneConfig}
                  archiveZoneConfig={archiveZoneConfig}
                  setArchiveZoneConfig={setArchiveZoneConfig}
                />
              </TabsContent>
            </div>
          </CardContent>
        </Card>
      </Tabs>
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={handleBack} disabled={activeTab === TABS[0]}>
          Back
        </Button>
        <Button className="bg-gray-800 text-white hover:bg-gray-700" onClick={handleNext}>
          {activeTab === TABS[TABS.length - 1] ? "Create Environment" : "Next"}
        </Button>
      </div>
    </div>
  );
}
