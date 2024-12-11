import { useReducer, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EnvironmentTab } from '@/components/EnvironmentsTabs/EnvironmentTab';
import { ConfigureLakeTab } from '@/components/EnvironmentsTabs/ConfigureLakeTab';
import { PreConfigureZonesTab } from '@/components/EnvironmentsTabs/PreConfigureZonesTab';
import { ConfigureLifecycleTab } from '@/components/EnvironmentsTabs/ConfigureLifecycleTab';
import { useNavigate } from 'react-router-dom';
import { createEnvironment } from '@/redux/EnvironmentSlice';
import { useAppDispatch } from '@/redux/hooks';
import { Spinner } from "@/components/ui/spinner";
import { encrypt_string } from '@/services/encryption';
import useToast from '@/oldcomponents/teast-service';

// Types
type Tag = {
  tagList: { key: string; value: string }[];
} | null;
type ZoneDetail = { name: string; url: string };
type LifecycleConfig = { [key: string]: string };
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
  verification: boolean;
};

// Constants
const TABS = [
  "environment",
  "configure-lake",
  "preconfigure-zones",
  "configure-lifecycle",
] as const;
type TabType = (typeof TABS)[number];

const INITIAL_ZONE_DETAILS: ZoneDetail[] = [
  { name: "Bronze Zone", url: "S3://Mylake.R.Vyz12.Abc.Com" },
  { name: "Silver Zone", url: "S3://Mylake.R.Vyz12.Abc.Com" },
  { name: "Gold Zone", url: "S3://Mylake.R.Vyz12.Abc.Com" },
  { name: "Log Zone", url: "S3://Mylake.R.Vyz12.Abc.Com" },
  { name: "Quarantine Zone", url: "S3://Mylake.R.Vyz12.Abc.Com" },
];

// Reducer
type State = {
  activeTab: TabType;
  tags: Tag[];
  selectedPlatform: string;
  zoneDetails: ZoneDetail[];
  businessUrl: string;
  lakeName: string;
  lakeDescription: string;
  environmentTab: EnvironmentTabState;
  standardZoneConfig: LifecycleConfig;
  archiveZoneConfig: LifecycleConfig;
};

type Action =
  | { type: 'SET_ACTIVE_TAB'; payload: TabType }
  | { type: 'SET_TAGS'; payload: Tag[] }
  | { type: 'SET_SELECTED_PLATFORM'; payload: string }
  | { type: 'SET_ZONE_DETAILS'; payload: ZoneDetail[] }
  | { type: 'SET_BUSINESS_URL'; payload: string }
  | { type: 'SET_LAKE_NAME'; payload: string }
  | { type: 'SET_LAKE_DESCRIPTION'; payload: string }
  | { type: 'SET_STANDARD_ZONE_CONFIG'; payload: LifecycleConfig }
  | { type: 'SET_ARCHIVE_ZONE_CONFIG'; payload: LifecycleConfig }
  | { type: 'SET_ENVIRONMENT_TAB'; payload: Partial<EnvironmentTabState> }
  | { type: 'SET_VERIFICATION'; payload: boolean };


const initialState: State = {
  activeTab: TABS[0],
  tags: [],
  selectedPlatform: "aws",
  zoneDetails: INITIAL_ZONE_DETAILS,
  businessUrl: "",
  lakeName: "",
  lakeDescription: "",
  standardZoneConfig: {},
  archiveZoneConfig: {},
  environmentTab: {
    environmentName: "",
    environment: "",
    projectId: "",
    location: "",
    accessKey: "",
    secretAccessKey: "",
    airflowUrl: "",
    airflowDagBucket: "",
    privateKeyFile: null,
    verification: false
  },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_TAGS':
      return { ...state, tags: action.payload as Tag[] };
    case 'SET_SELECTED_PLATFORM':
      return { ...state, selectedPlatform: action.payload };
    case 'SET_ZONE_DETAILS':
      return { ...state, zoneDetails: action.payload };
    case 'SET_BUSINESS_URL':
      return { ...state, businessUrl: action.payload };
    case 'SET_LAKE_NAME':
      return { ...state, lakeName: action.payload };
    case 'SET_LAKE_DESCRIPTION':
      return { ...state, lakeDescription: action.payload };
    case 'SET_STANDARD_ZONE_CONFIG':
      return { ...state, standardZoneConfig: action.payload };
    case 'SET_ARCHIVE_ZONE_CONFIG':
      return { ...state, archiveZoneConfig: action.payload };
    case 'SET_ENVIRONMENT_TAB':
      return {
        ...state,
        environmentTab: { ...state.environmentTab, ...action.payload }
      };
    case 'SET_VERIFICATION':
      return { ...state, environmentTab: { ...state.environmentTab, verification: action.payload } };

    default:
      return state;
  }
}

export default function EnvironmentConsoleComponent(): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState);
  const dispatchApi = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [ToastComponent, showToast] = useToast();
  const navigate = useNavigate();
  const handleBack = (): void => {
    const currentIndex = TABS.indexOf(state.activeTab);
    if (currentIndex > 0) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: TABS[currentIndex - 1] });
    }
  };

  const handleNext = async (): Promise<void> => {
    const currentIndex = TABS.indexOf(state.activeTab);
    if (currentIndex < TABS.length - 1) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: TABS[currentIndex + 1] });
    } else {
      const { encryptedString, initVector } = encrypt_string(state.environmentTab.secretAccessKey);
      const { encryptedString: encryptedString1 } = encrypt_string(state.environmentTab.accessKey, initVector);
      const formattedTags = state.tags.filter(tag => tag && tag.tagList).flatMap(tag => tag?.tagList);
      const values = {
        bh_env_name: state.environmentTab.environmentName,
        bh_env_provider: parseInt(state.environmentTab.environment),
        cloud_provider_cd: state.selectedPlatform === "aws" ? 101 : 102,
        cloud_region_cd: parseInt(state.environmentTab.location),
        status_cd: "active",
        project_id: state.environmentTab.projectId,
        file: state.environmentTab.privateKeyFile,
        access_key: encryptedString1,
        secret_access_key: encryptedString,
        init_vector: initVector,
        airflow_url: state.environmentTab.airflowUrl,
        airflowDagBucket: state.environmentTab.airflowDagBucket,
        tags: JSON.stringify({
          tagList: formattedTags
        }),
      };
      setIsLoading(() => true);
      dispatchApi(createEnvironment(values))
        .then((response: any) => {
          if (response.type === "environment/create/fulfilled")
            showToast('Environment created successfully', { color: '#4caf50' });
          setTimeout(() => {
            navigate('/admin-console/environment');
          }, 1000);
        })
        .catch((error: any) => {
          console.error(error)
          showToast(error.response?.data?.message || 'Error submitting form', { color: '#FF0000' });
          navigate('/admin-console/environment');
        }).finally(() => {
          setIsLoading(() => false);
        });

    }
  };

  const handleTabChange = (value: string): void => {
    if (TABS.includes(value as TabType)) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: value as TabType });
    }
  };

  const handleEnvironmentTabChange = (changes: Partial<EnvironmentTabState>) => {
    dispatch({ type: 'SET_ENVIRONMENT_TAB', payload: changes });
  };

  const handleChangeVerification = (data: boolean) => {
    dispatch({ type: 'SET_VERIFICATION', payload: data });
  }

  return (
    <div className="container p-0 space-y-2">
      <Tabs value={state.activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex justify-between items-center">
          <div className="flex-1 flex justify-center">
            <TabsList aria-label="Environment Console Tabs" className="bg-transparent">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="px-2 py-2 rounded-md transition-colors duration-200 data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  {tab.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <Button variant="default" className="bg-gray-800 text-white hover:bg-gray-700" onClick={() => navigate('/admin-console/environment')}>
            View All Environments
          </Button>
        </div>

        <Card className="w-full mt-2">
          <CardContent className="p-2">
            <div className="max-w-[1050px] mx-auto">
              <TabsContent value="environment">
                <EnvironmentTab
                  selectedPlatform={state.selectedPlatform}
                  setSelectedPlatform={(platform) => dispatch({ type: 'SET_SELECTED_PLATFORM', payload: platform })}
                  tags={state.tags}
                  setTags={(newTags) => {
                    if (typeof newTags === 'function') {
                      dispatch({ type: 'SET_TAGS', payload: newTags(state.tags) });
                    } else {
                      dispatch({ type: 'SET_TAGS', payload: newTags });
                    }
                  }}
                  onChange={handleEnvironmentTabChange}
                  environmentName={state.environmentTab.environmentName}
                  environment={state.environmentTab.environment}
                  projectId={state.environmentTab.projectId}
                  location={state.environmentTab.location}
                  accessKey={state.environmentTab.accessKey}
                  secretAccessKey={state.environmentTab.secretAccessKey}
                  airflowUrl={state.environmentTab.airflowUrl}
                  airflowDagBucket={state.environmentTab.airflowDagBucket}
                  privateKeyFile={state.environmentTab.privateKeyFile}
                  changeVerification={handleChangeVerification}
                />
              </TabsContent>
              <TabsContent value="configure-lake">
                <ConfigureLakeTab
                  businessUrl={state.businessUrl}
                  setBusinessUrl={(url) => dispatch({ type: 'SET_BUSINESS_URL', payload: url })}
                  lakeName={state.lakeName}
                  setLakeName={(name) => dispatch({ type: 'SET_LAKE_NAME', payload: name })}
                  lakeDescription={state.lakeDescription}
                  setLakeDescription={(description) => dispatch({ type: 'SET_LAKE_DESCRIPTION', payload: description })}
                />
              </TabsContent>
              <TabsContent value="preconfigure-zones">
                <PreConfigureZonesTab
                  zoneDetails={state.zoneDetails}
                  handleUrlsChange={(index, newUrl) => {
                    const newZoneDetails = [...state.zoneDetails];
                    newZoneDetails[index].url = newUrl;
                    dispatch({ type: 'SET_ZONE_DETAILS', payload: newZoneDetails });
                  }}
                />
              </TabsContent>
              <TabsContent value="configure-lifecycle">
                <ConfigureLifecycleTab
                  standardZoneConfig={state.standardZoneConfig}
                  setStandardZoneConfig={(config) => {
                    // Check if config is a function, and call it with the current state.standardZoneConfig
                    if (typeof config === 'function') {
                      dispatch({ type: 'SET_STANDARD_ZONE_CONFIG', payload: config(state.standardZoneConfig) });
                    } else {
                      dispatch({ type: 'SET_STANDARD_ZONE_CONFIG', payload: config });
                    }
                  }}
                  archiveZoneConfig={state.archiveZoneConfig}
                  setArchiveZoneConfig={(config) => {
                    // Check if config is a function, and call it with the current state.archiveZoneConfig
                    if (typeof config === 'function') {
                      dispatch({ type: 'SET_ARCHIVE_ZONE_CONFIG', payload: config(state.archiveZoneConfig) });
                    } else {
                      dispatch({ type: 'SET_ARCHIVE_ZONE_CONFIG', payload: config });
                    }
                  }}

                />
              </TabsContent>
            </div>
          </CardContent>
        </Card>
      </Tabs>
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={handleBack} disabled={state.activeTab === TABS[0]}>
          Back
        </Button>
        <Button className="bg-gray-900 text-white hover:bg-gray-800" onClick={handleNext} disabled={!state.environmentTab.verification}>
          {state.activeTab === TABS[TABS.length - 1] ? <>{
            isLoading ? <Spinner /> : null
          }{"Create Environment"}</> : "Next"}
        </Button>
      </div>
      <ToastComponent />
    </div>
  );
}