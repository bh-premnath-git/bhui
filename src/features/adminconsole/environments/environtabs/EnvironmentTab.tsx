import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, PlusCircle, X } from 'lucide-react';
import { FileUpload } from '@/components/bh-upload';
import { ApiService } from '@/services/apiServices';
import { ValidationComponent } from '@/components/ui/validation-component';
import { Badge } from "@/components/ui/badge";
import { encrypt_string } from '@/services/encryption';
import { AccordionSection } from '@/components/shared/Accordion';
import { CATALOG_API_PORT } from '@/services/environment';
import { RequiredLabel } from '@/components/ui/required-fields';

const environmentOptions = {
  "301": "Development",
  "302": "Staging",
  "303": "Production"
} as const;

const locationOptions = ["us-east-1", "us-west-1", "eu-central-1"] as const;
type LocationOption = typeof locationOptions[number];

const schema = z
  .object({
    environmentName: z.string().min(1, "Environment name is required"),
    environment: z.string().min(1, "Environment is required"),
    projectId: z.string().min(1, "Project ID is required"),
    location: z.string().min(1, "Location is required"),
    accessKey: z.string().optional(),
    secretAccessKey: z.string().optional(),
    privateKeyFile: z.instanceof(File).or(z.null()).optional(),
    airflowUrl: z.string().optional(),
    airflowDagBucket: z.string().optional(),
    selectedPlatform: z.string().min(1, "Platform is required"),
    selectedMwaaEnv: z.string().nullable().optional(),
    awsPvtKey: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.selectedPlatform === 'aws') {
      if (!data.accessKey?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Access Key is required for AWS",
          path: ["accessKey"],
        });
      }
      if (!data.secretAccessKey?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Secret Access Key is required for AWS",
          path: ["secretAccessKey"],
        });
      }
    }
    if (data.selectedPlatform === 'google-cloud') {
      if (!data.privateKeyFile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Private Key File is required for Google Cloud",
          path: ["privateKeyFile"],
        });
      }
    }
  });

export type FormValues = z.infer<typeof schema>;

type Tag = {
  tagList: { key: string; value: string }[];
} | null;

type Platform = {
  id: string;
  name: string;
  logo: string;
  cloud_provider: number;
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
  disabledPlatforms?: string[];
};

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

const PlatformSelector: React.FC<{
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  disabledPlatforms?: string[];
}> = ({ selectedPlatform, setSelectedPlatform, disabledPlatforms = [] }) => (
  <div className="flex flex-wrap gap-6">
    {PLATFORMS.map((platform) => {
      const isDisabled = disabledPlatforms.includes(platform.id);
      return (
        <div
          key={platform.id}
          className={[
            "flex flex-row items-center space-x-3 border rounded-md p-1 transition-all duration-200",
            selectedPlatform === platform.id
              ? "border-green-500 bg-green-50 shadow-md"
              : "border-gray-700 bg-gray-50",
            isDisabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-gray-200 hover:shadow-sm",
          ].join(" ")}
          onClick={() => {
            if (!isDisabled) {
              setSelectedPlatform(platform.id);
            }
          }}
          style={{ width: "250px", minWidth: "200px" }}
        >
          <div
            className={[
              "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors duration-200",
              selectedPlatform === platform.id
                ? "border-green-500 bg-green-500"
                : "border-gray-700 bg-gray-200",
            ].join(" ")}
          >
            {selectedPlatform === platform.id && <Check className="w-3 h-3 text-white" />}
          </div>
          <div className="flex flex-col items-center flex-grow text-center">
            <img src={platform.logo} alt={`${platform.name} logo`} className="w-10 h-10 mb-1" />
            <span className="text-xs font-medium text-gray-800">{platform.name}</span>
          </div>
        </div>
      );
    })}
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
  selectedPlatform: propSelectedPlatform,
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
  disabledPlatforms = [],
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      environmentName,
      environment,
      projectId,
      location,
      accessKey,
      secretAccessKey,
      airflowUrl,
      airflowDagBucket,
      privateKeyFile,
      selectedPlatform: propSelectedPlatform,
      selectedMwaaEnv: "",
      awsPvtKey: null,
    },
  });

  const formValues = watch();
  const [mwaaEnvironments, setMwaaEnvironments] = useState<string[]>([]);
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
      return {
        environmentDetails: false,
        platform: false,
        credentials: false,
        advancedSettings: false,
        tags: false,
        [section]: !isCurrentlyOpen,
      };
    });
  };

  const handleValidate = async (values: FormValues) => {
    try {
      if (!values.accessKey || !values.secretAccessKey || !values.location) {
        toast.error('Please fill in all required fields');
        return false;
      }
      const locationVal = locationOptions[parseInt(values.location) - 1];
      const encryted_aws_key_id = encrypt_string(values.accessKey);
      const encryted_aws_secret_access_key = encrypt_string(
        values.secretAccessKey,
        encryted_aws_key_id.initVector
      );
      const params = {
        bh_env_name: values.environmentName,
      };
      const credentials = {
        aws_access_key_id: encryted_aws_key_id.encryptedString,
        aws_secret_access_key: encryted_aws_secret_access_key.encryptedString,
        location: locationVal,
        init_vector: encryted_aws_key_id.initVector,
      };

      const result = await ApiService(CATALOG_API_PORT, 'post', '/aws/test_connection', credentials, params);
      const pvtkey = result["pvt_key"];
      onChange({ awsPvtKey: pvtkey });
      const success = result && typeof result === 'object' && 'success' in result;

      if (success) {
        const res = await ApiService(CATALOG_API_PORT, 'get', '/bh_airflow/list-airflow-environments', null, {
          ...params,
          location: locationVal,
        });
        setMwaaEnvironments(res as string[]);
      }

      if (success) {
        toast.success('Successfully connected to AWS');
      } else {
        toast.error('Failed to connect');
      }
      changeVerification(success);
      return success;
    } catch (error) {
      toast.error('Failed to connect');
      changeVerification(false);
      return false;
    }
  };

  const handleFileUpload = (file: File) => {
    onChange({ privateKeyFile: file });
    setValue("privateKeyFile", file);
  };

  const handleGetMWAAInfos = async (value: string) => {
    try {
      if (!value) return;
      const result = await ApiService(
        CATALOG_API_PORT,
        'get',
        `/bh_airflow/get_airflow_environment`,
        null,
        {
          airflow_env_name: value,
          location: formValues.location,
          bh_env_name: formValues.environmentName,
        }
      );
      if (result) {
        setValue('airflowUrl', result.WebserverUrl);
        setValue('airflowDagBucket', result.SourceBucketArn);
        onChange({
          airflowUrl: result.WebserverUrl,
          airflowDagBucket: result.SourceBucketArn,
        });
      }
    } catch (error) {
      console.error("Error fetching MWAA info", error);
    }
  };

  const onSubmit = (data: FormValues) => {
    // No action on form submit as changes are handled on-the-fly
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 p bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--background))] ..."
>
      <div className="space-y-3 mb-4">
        <h1 className="text-xl font-bold text-foreground">Configure Environment</h1>
        <p className="text-sm text-muted-foreground">
          Set up your environment details, select a cloud platform, and provide necessary credentials.
        </p>
      </div>

      <AccordionSection
        title="Environment Details"
        isOpen={openSections.environmentDetails}
        onToggle={() => toggleSection('environmentDetails')}
        borderColor="blue-100"
        titleColor="text-blue-800"
        hasError={!!(errors.environmentName || errors.environment)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <RequiredLabel>
              <Label htmlFor="environmentName" className="font-medium">
                Environment Name
              </Label>
            </RequiredLabel>
            <Input
              id="environmentName"
              placeholder="e.g. My Dev Env"
              className="border-blue-200 focus:ring-blue-500"
              {...register("environmentName", {
                onChange: (e) => onChange({ environmentName: e.target.value }),
              })}
            />
            {errors.environmentName && (
              <div className="text-red-500 text-sm">{errors.environmentName.message}</div>
            )}
          </div>

          <div className="space-y-2">
            <RequiredLabel>
              <Label htmlFor="environment" className="font-medium">
                Environment
              </Label>
            </RequiredLabel>
            <Controller
              name="environment"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    onChange({ environment: value });
                  }}
                >
                  <SelectTrigger className="border-blue-200">
                    <SelectValue placeholder="Select Environment">
                      {field.value
                        ? environmentOptions[field.value as keyof typeof environmentOptions]
                        : "Select Environment"}
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
              )}
            />
            {errors.environment && (
              <div className="text-red-500 text-sm">{errors.environment.message}</div>
            )}
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Select Platform"
        isOpen={openSections.platform}
        onToggle={() => toggleSection('platform')}
        borderColor="emerald-100"
        titleColor="text-emerald-800"
        hasError={!!errors.selectedPlatform}
      >
        <RequiredLabel>
          <Label className="font-medium">Select which platform you'd like to use</Label>
        </RequiredLabel>
        <PlatformSelector
          selectedPlatform={watch("selectedPlatform")}
          setSelectedPlatform={(platform) => {
            setValue("selectedPlatform", platform);
            setSelectedPlatform(platform);
            onChange({ selectedPlatform: platform });
          }}
          disabledPlatforms={disabledPlatforms}
        />
        {errors.selectedPlatform && (
          <div className="text-red-500 text-sm">{errors.selectedPlatform.message}</div>
        )}
      </AccordionSection>

      <AccordionSection
        title="Credentials"
        isOpen={openSections.credentials}
        onToggle={() => toggleSection('credentials')}
        borderColor="yellow-100"
        titleColor="text-yellow-800"
        hasError={
          !!(errors.projectId ||
            errors.location ||
            errors.accessKey ||
            errors.secretAccessKey ||
            errors.privateKeyFile)
        }
      >
        <div className="text-sm text-gray-600 mb-2">
          Select a project, location, and provide platform-specific credentials.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-2">
            <RequiredLabel>
              <Label htmlFor="projectId" className="font-medium">
                Project ID
              </Label>
            </RequiredLabel>
            <Input
              id="projectId"
              placeholder="Enter project ID"
              className="border-blue-200 focus:ring-blue-500"
              {...register("projectId", {
                onChange: (e) => onChange({ projectId: e.target.value }),
              })}
            />
            {errors.projectId && (
              <div className="text-red-500 text-sm">{errors.projectId.message}</div>
            )}
          </div>

          <div className="space-y-2">
            <RequiredLabel>
              <Label htmlFor="location" className="font-medium">
                Location
              </Label>
            </RequiredLabel>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? locationOptions[parseInt(field.value) - 1] : undefined}
                  onValueChange={(value) => {
                    const locationIndex = locationOptions.indexOf(value as LocationOption);
                    const locationNumber = (locationIndex + 1).toString();
                    field.onChange(locationNumber);
                    onChange({ location: locationNumber });
                  }}
                >
                  <SelectTrigger className="border-blue-200">
                    <SelectValue placeholder="Select Location">
                      {field.value ? locationOptions[parseInt(field.value) - 1] : "Select Location"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((loc) => (
                      <SelectItem key={loc} value={loc} className="text-gray-800 hover:bg-gray-50">
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.location && (
              <div className="text-red-500 text-sm">{errors.location.message}</div>
            )}
          </div>
        </div>

        {watch("selectedPlatform") === 'aws' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="space-y-2">
              <RequiredLabel>
                <Label htmlFor="accessKey" className="font-medium">
                  Access Key
                </Label>
              </RequiredLabel>
              <Input
                id="accessKey"
                placeholder="Enter AWS Access Key"
                className="border-blue-200 focus:ring-blue-500"
                {...register("accessKey", {
                  onChange: (e) => onChange({ accessKey: e.target.value }),
                })}
              />
              {errors.accessKey && (
                <div className="text-red-500 text-sm">{errors.accessKey.message}</div>
              )}
            </div>
            <div className="space-y-2">
              <RequiredLabel>
                <Label htmlFor="secretAccessKey" className="font-medium">
                  Secret Access Key
                </Label>
              </RequiredLabel>
              <Input
                id="secretAccessKey"
                type="password"
                placeholder="Enter AWS Secret Access Key"
                className="border-blue-200 focus:ring-blue-500"
                {...register("secretAccessKey", {
                  onChange: (e) => onChange({ secretAccessKey: e.target.value }),
                })}
              />
              {errors.secretAccessKey && (
                <div className="text-red-500 text-sm">{errors.secretAccessKey.message}</div>
              )}
            </div>
            <div className="mt h-16 flex items-center">
              <ValidationComponent onValidate={() => handleValidate(formValues)} error={false} errorMsg="Failed to connect" />
            </div>
          </div>
        )}

        {watch("selectedPlatform") === 'google-cloud' && (
          <div className="mt space-y-2">
            <RequiredLabel>
              <Label htmlFor="privateKeyFile" className="font-medium">
                Google Cloud Private Key
              </Label>
            </RequiredLabel>
            <div className="w-full md:w-1/2">
              <FileUpload onFileUpload={handleFileUpload} maxSize={10 * 1024 * 1024} />
            </div>
            {errors.privateKeyFile && (
              <div className="text-red-500 text-sm">{errors.privateKeyFile.message}</div>
            )}
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
            <Label htmlFor="mwaaEnvironment" className="font-medium">
              MWAA Environment
            </Label>
            <Controller
              name="selectedMwaaEnv"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    onChange({ selectedMwaaEnv: value });
                    handleGetMWAAInfos(value);
                  }}
                >
                  <SelectTrigger className="border-blue-200">
                    <SelectValue placeholder={mwaaEnvironments.length === 0 ? "No MWAA Environments available" : field.value || "Select MWAA Environment"}>
                      {mwaaEnvironments.length === 0 ? "No MWAA Environments available" : field.value || "Select MWAA Environment"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {mwaaEnvironments.map((env) => (
                      <SelectItem key={env} value={env} className="text-gray-800 hover:bg-gray-50">
                        {env}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="airflowUrl" className="font-medium">
              Airflow URL
            </Label>
            <Input
              id="airflowUrl"
              placeholder="https://my-airflow-url"
              className="border-blue-200 focus:ring-blue-500"
              {...register("airflowUrl")}
              readOnly
            />
            {errors.airflowUrl && (
              <div className="text-red-500 text-sm">{errors.airflowUrl.message}</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="airflowDagBucket" className="font-medium">
              Airflow DAG Bucket
            </Label>
            <Input
              id="airflowDagBucket"
              placeholder="my-airflow-dag-bucket"
              className="border-blue-200 focus:ring-blue-500"
              {...register("airflowDagBucket")}
              readOnly
            />
            {errors.airflowDagBucket && (
              <div className="text-red-500 text-sm">{errors.airflowDagBucket.message}</div>
            )}
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
        <TagInput tags={tags} setTags={setTags} />
      </AccordionSection>
    </form>
  );
};

export default EnvironmentTab;
