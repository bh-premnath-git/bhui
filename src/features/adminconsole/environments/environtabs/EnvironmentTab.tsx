import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequiredLabel } from "@/components/ui/required-fields";
import { AccordionSection } from "@/components/shared/Accordion";
import { FileUpload } from "@/components/bh-upload";
import { ValidationComponent } from "@/components/ui/validation-component";

// Services
import { ApiService } from "@/services/api.services";
import { encrypt_string } from "@/services/encryption";
import { CATALOG_API_PORT } from "@/services/environment";

// Local Imports
import { Tag, locationOptions, LocationOption, environmentOptions } from "@/types/features/environment/types";
import { environmentSchema, EnvironmentFormValues } from "./schema";
import { PlatformSelector } from "./PlatformSelector";
import { TagInput } from "./TagInput";

interface EnvironmentTabProps {
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  tags: Tag[];
  setTags: (newTags: Tag[] | ((prevTags: Tag[]) => Tag[])) => void;
  onChange: (changes: Partial<EnvironmentFormValues>) => void;
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
  isEditing?: boolean;
}

export const EnvironmentTab: React.FC<EnvironmentTabProps> = ({
  selectedPlatform: propSelectedPlatform,
  setSelectedPlatform,
  tags,
  setTags,
  onChange,
  environmentName = "",
  environment = "",
  projectId = "",
  location = "",
  accessKey = "",
  secretAccessKey = "",
  airflowUrl = "",
  airflowDagBucket = "",
  privateKeyFile = null,
  changeVerification,
  disabledPlatforms = [],
  isEditing = false,
}) => {

  // -------------------------------------------------------
  // 1. Set up React Hook Form with Zod validation
  // -------------------------------------------------------
  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<EnvironmentFormValues>({
    mode: "all",
    resolver: zodResolver(environmentSchema),
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

  // -------------------------------------------------------
  // 3. AWS credentials validation & MWAA listing
  // -------------------------------------------------------
  const handleValidate = async (values: EnvironmentFormValues) => {
    try {
      if (!values.accessKey || !values.secretAccessKey || !values.location) {
        toast.error("Please fill in all required fields");
        return false;
      }

      // Convert the numeric string (e.g. "1", "2", "3") to actual location (e.g. "us-east-1")
      const locationVal = locationOptions[parseInt(values.location) - 1];
      if (!locationVal) {
        toast.error("Invalid location selected");
        return false;
      }

      // Encrypt credentials
      const encryptedAwsKeyId = encrypt_string(values.accessKey);
      const encryptedAwsSecretKey = encrypt_string(
        values.secretAccessKey,
        encryptedAwsKeyId.initVector
      );

      // Prepare request payload
      const params = { bh_env_name: values.environmentName };
      const credentials = {
        aws_access_key_id: encryptedAwsKeyId.encryptedString,
        aws_secret_access_key: encryptedAwsSecretKey.encryptedString,
        location: locationVal,
        init_vector: encryptedAwsKeyId.initVector,
      };

      // Test AWS connection
      const result = await ApiService({
        portNumber: CATALOG_API_PORT,
        method: "post",
        url: "/aws/test_connection",
        data: credentials,
        params,
      });

      // e.g. The server might return a private key once validated
      const pvtKey = result["pvt_key"];
      onChange({ awsPvtKey: pvtKey });

      const success = result && typeof result === "object" && "success" in result;
      if (success) {
        // If success, fetch MWAA environments
        const mwaaRes = await ApiService({
          portNumber: CATALOG_API_PORT,
          method: "get",
          url: "/bh_airflow/list-airflow-environments",
          data: null,
          params: {
            ...params,
            location: locationVal,
          },
        });

        setMwaaEnvironments(mwaaRes as string[]);
        toast.success("Successfully connected to AWS");
      } else {
        toast.error("Failed to connect");
      }

      // Notify the parent about the verification status
      changeVerification(success);
      return success;
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect");
      changeVerification(false);
      return false;
    }
  };
  // -------------------------------------------------------
  // 4. GCP private key file handling
  // -------------------------------------------------------
  const handleFileUpload = (file: File) => {
    onChange({ privateKeyFile: file });
    setValue("privateKeyFile", file);
  };

  // -------------------------------------------------------
  // 5. MWAA environment details fetch
  // -------------------------------------------------------
  const handleGetMWAAInfos = async (selectedEnv: string) => {
    try {
      if (!selectedEnv) return;

      const locationVal = locationOptions[parseInt(formValues.location) - 1];
      const result = await ApiService({
        portNumber: CATALOG_API_PORT,
        method: "get",
        url: `/bh_airflow/get_airflow_environment`,
        data: null,
        params: {
          airflow_env_name: selectedEnv,
          location: locationVal,
          bh_env_name: formValues.environmentName,
        },
      });

      if (result) {
        // Update the form with new values
        setValue("airflowUrl", result.WebserverUrl);
        setValue("airflowDagBucket", result.SourceBucketArn);
        onChange({
          airflowUrl: result.WebserverUrl,
          airflowDagBucket: result.SourceBucketArn,
        });
      }
    } catch (error) {
      console.error("Error fetching MWAA info:", error);
    }
  };

  // -------------------------------------------------------
  // 6. React Hook Form submission handler (optional)
  // -------------------------------------------------------
  const onSubmit = (data: EnvironmentFormValues) => {
    // Form values are updated on the fly via onChange,
    // but you can still handle an explicit submit if needed.
    console.log("Form submitted with data:", data);
  };

  useEffect(() => {
    if (isEditing) {
      reset({
        environmentName: environmentName,
        // Any other fields you want to reset
      });
    }
  }, [isEditing, environmentName, reset]);
  // -------------------------------------------------------
  // 7. Render JSX
  // -------------------------------------------------------
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-2 p bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--background))]"
    >
      {/* Heading */}
      <div className="space-y-3 mb-4">
        <h1 className="text-xl font-bold text-foreground">
          Configure Environment
        </h1>
        <p className="text-sm text-muted-foreground">
          Set up your environment details, select a cloud platform, and provide
          necessary credentials.
        </p>
      </div>
      {/* ------------------------------ */}
      {/* 1. Environment Details        */}
      {/* ------------------------------ */}
      <AccordionSection
        title="Environment Details"
        isOpen={openSections.environmentDetails}
        onToggle={() => toggleSection("environmentDetails")}
        borderColor="blue-100"
        titleColor="text-blue-800"
        hasError={!!(errors.environmentName || errors.environment)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Environment Name */}
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
              <div className="text-red-500 text-sm">
                {errors.environmentName.message}
              </div>
            )}
          </div>

          {/* Environment Options (Dev, Staging, Prod) */}
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
                    {Object.entries(environmentOptions).map(
                      ([value, label]) => (
                        <SelectItem
                          key={value}
                          value={value}
                          className="text-gray-800 hover:bg-gray-50"
                        >
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.environment && (
              <div className="text-red-500 text-sm">
                {errors.environment.message}
              </div>
            )}
          </div>
        </div>
      </AccordionSection>
      {/* ------------------------------ */}
      {/* 2. Platform Selection          */}
      {/* ------------------------------ */}
      <AccordionSection
        title="Select Platform"
        isOpen={openSections.platform}
        onToggle={() => toggleSection("platform")}
        borderColor="emerald-100"
        titleColor="text-emerald-800"
        hasError={!!errors.selectedPlatform}
      >
        <RequiredLabel>
          <Label className="font-medium">Select which platform to use</Label>
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
          <div className="text-red-500 text-sm">
            {errors.selectedPlatform.message}
          </div>
        )}
      </AccordionSection>
      {/* ------------------------------ */}
      {/* 3. Credentials                 */}
      {/* ------------------------------ */}
      <AccordionSection
        title="Credentials"
        isOpen={openSections.credentials}
        onToggle={() => toggleSection("credentials")}
        borderColor="yellow-100"
        titleColor="text-yellow-800"
        hasError={
          !!(
            errors.projectId ||
            errors.location ||
            errors.accessKey ||
            errors.secretAccessKey ||
            errors.privateKeyFile
          )
        }
      >
        <div className="text-sm text-gray-600 mb-2">
          Provide cloud project ID, location, and platform-specific credentials.
        </div>

        {/* Project ID & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Project ID */}
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
              <div className="text-red-500 text-sm">
                {errors.projectId.message}
              </div>
            )}
          </div>
          {/* Location */}
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
                  // Convert stored numeric string to actual location option
                  value={
                    field.value ? locationOptions[parseInt(field.value) - 1] : ""
                  }
                  onValueChange={(selectedLoc) => {
                    const locationIndex = locationOptions.indexOf(
                      selectedLoc as LocationOption
                    );
                    const locationNumber = (locationIndex + 1).toString();
                    field.onChange(locationNumber);
                    onChange({ location: locationNumber });
                  }}
                >
                  <SelectTrigger className="border-blue-200">
                    <SelectValue placeholder="Select Location">
                      {field.value
                        ? locationOptions[parseInt(field.value) - 1]
                        : "Select Location"}
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
              )}
            />
            {errors.location && (
              <div className="text-red-500 text-sm">{errors.location.message}</div>
            )}
          </div>
        </div>

        {/* AWS Credentials */}
        {watch("selectedPlatform") === "aws" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {/* Access Key */}
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
                <div className="text-red-500 text-sm">
                  {errors.accessKey.message}
                </div>
              )}
            </div>
            {/* Secret Access Key */}
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
                <div className="text-red-500 text-sm">
                  {errors.secretAccessKey.message}
                </div>
              )}
            </div>
            {/* Validation Button (to test credentials) */}
            <div className="mt h-16 flex items-center">
              <ValidationComponent
                onValidate={() => handleValidate(formValues)}
                error={false}
                errorMsg="Failed to connect"
              />
            </div>
          </div>
        )}
        {/* Google Cloud Credentials */}
        {watch("selectedPlatform") === "google-cloud" && (
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
              <div className="text-red-500 text-sm">
                {errors.privateKeyFile.message}
              </div>
            )}
          </div>
        )}
      </AccordionSection>
      {/* ------------------------------ */}
      {/* 4. Advanced Settings           */}
      {/* ------------------------------ */}
      <AccordionSection
        title="Advanced Settings"
        isOpen={openSections.advancedSettings}
        onToggle={() => toggleSection("advancedSettings")}
        borderColor="purple-100"
        titleColor="text-purple-800"
      >
        <p className="text-sm text-gray-600 mb-4">
          Provide optional Airflow configuration (e.g. MWAA) if needed.
        </p>

        {/* MWAA Environment */}
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
                    <SelectValue
                      placeholder={
                        mwaaEnvironments.length === 0
                          ? "No MWAA Environments available"
                          : field.value || "Select MWAA Environment"
                      }
                    >
                      {mwaaEnvironments.length === 0
                        ? "No MWAA Environments available"
                        : field.value || "Select MWAA Environment"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {mwaaEnvironments.map((env) => (
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
              )}
            />
          </div>
        </div>
        {/* Airflow URL & DAG Bucket (populated after MWAA is selected) */}
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
              <div className="text-red-500 text-sm">
                {errors.airflowUrl.message}
              </div>
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
              <div className="text-red-500 text-sm">
                {errors.airflowDagBucket.message}
              </div>
            )}
          </div>
        </div>
      </AccordionSection>
      {/* ------------------------------ */}
      {/* 5. Tags                        */}
      {/* ------------------------------ */}
      <AccordionSection
        title="Tags"
        isOpen={openSections.tags}
        onToggle={() => toggleSection("tags")}
        borderColor="pink-100"
        titleColor="text-pink-800"
      >
        <TagInput tags={tags} setTags={setTags} />
      </AccordionSection>
    </form>
  );
};
