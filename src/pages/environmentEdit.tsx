import { useEffect, useReducer, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EnvironmentTab } from '@/components/EnvironmentsTabs/EnvironmentTab';
import { useNavigate } from 'react-router-dom';
import { editEnvironment } from '@/redux/EnvironmentSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Spinner } from "@/components/ui/spinner";
import { encrypt_string } from '@/services/encryption';
import useToast from '@/components/teast-service';

type Tag = {
  tagList: { key: string; value: string }[];
} | null;

type EnvironmentTabState = {
  environmentName: string;
  environment: string;
  projectId: string;
  location: string;
  accessKey: string;
  secretAccessKey: string;
  airflowUrl: string;
  airflowDagBucket: string;
  awsPvtKey: string | null;
  privateKeyFile: File | null;
  verification: boolean;
  selectedMwaaEnv: string | null;
};

const TABS = [
  "environment",
  /* "configure-lake",
  "preconfigure-zones",
  "configure-lifecycle", */
] as const;

type TabType = (typeof TABS)[number];

type State = {
  activeTab: TabType;
  tags: Tag[];
  selectedPlatform: string;

  environmentTab: EnvironmentTabState;
};

type Action =
  | { type: 'SET_ACTIVE_TAB'; payload: TabType }
  | { type: 'SET_TAGS'; payload: Tag[] }
  | { type: 'SET_SELECTED_PLATFORM'; payload: string }
  | { type: 'SET_ENVIRONMENT_TAB'; payload: Partial<EnvironmentTabState> }
  | { type: 'SET_VERIFICATION'; payload: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    case 'SET_SELECTED_PLATFORM':
      return { ...state, selectedPlatform: action.payload };
    case 'SET_ENVIRONMENT_TAB':
      return {
        ...state,
        environmentTab: { ...state.environmentTab, ...action.payload },
      };
    case 'SET_VERIFICATION':
      return {
        ...state,
        environmentTab: {
          ...state.environmentTab,
          verification: action.payload,
        },
      };
    default:
      return state;
  }
}

const initialState: State = {
  activeTab: TABS[0],
  tags: [],
  selectedPlatform: "aws",
  environmentTab: {
    environmentName: "",
    environment: "",
    projectId: "",
    location: "",
    accessKey: "",
    secretAccessKey: "",
    airflowUrl: "",
    airflowDagBucket: "",
    selectedMwaaEnv: null,
    awsPvtKey: null,
    privateKeyFile: null,
    verification: false
  },
};

export default function EnvironmentConsoleComponent(): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState);
  const dispatchApi = useAppDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [ToastComponent, showToast] = useToast();

  const { editEnvironmentData: editenvdata } = useAppSelector(
    (reduxState) => reduxState.environmentApi
  );
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (editenvdata && editenvdata.Environment_Id) {
      setIsEditing(true);

      dispatch({ type: 'SET_ENVIRONMENT_TAB', payload: editenvdata });

      const tagData = editenvdata.tags
        ? [{ tagList: editenvdata.tags.tagList || [] }]
        : [{ tagList: [] }];
      dispatch({ type: 'SET_TAGS', payload: tagData });
    } else {
      setIsEditing(false);
      dispatch({ type: 'SET_TAGS', payload: [{ tagList: [] }] });
    }
  }, [editenvdata]);

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
      return;
    }

    const { secretAccessKey, accessKey } = state.environmentTab;
    const { encryptedString, initVector } = encrypt_string(secretAccessKey);
    const { encryptedString: encryptedString1 } = encrypt_string(accessKey, initVector);

    const formattedTags = state.tags
      .filter(tag => tag && tag.tagList)
      .flatMap(tag => tag?.tagList);
    const tagsPayload = { tagList: Array.isArray(formattedTags) ? formattedTags : [] };

    const values = {
      bh_env_name: state.environmentTab.environmentName || editenvdata?.bh_env_name || '',
      bh_env_provider: parseInt(state.environmentTab.environment) || editenvdata?.bh_env_provider || null,
      cloud_provider_cd: state.selectedPlatform === "aws" ? 101 : 102,
      cloud_region_cd: parseInt(state.environmentTab.location) || editenvdata?.cloud_region_cd || null,
      status_cd: "active",
      project_id: state.environmentTab.projectId || editenvdata?.project_id || '',
      file: state.environmentTab.privateKeyFile || editenvdata?.file || null,
      access_key: encryptedString1,
      secret_access_key: encryptedString,
      init_vector: initVector,
      airflow_url: state.environmentTab.airflowUrl || editenvdata?.airflow_url || '',
      airflow_bucket_name: state.environmentTab.airflowDagBucket || editenvdata?.airflow_bucket_name || '',
      tags: tagsPayload,
    };

    setIsLoading(true);

    if (isEditing && editenvdata?.Environment_Id) {
      dispatchApi(editEnvironment({ ...values, id: editenvdata.Environment_Id }))
        .then((response: any) => {
          if (response.type === "environment/edit/fulfilled") {
            showToast('Environment updated successfully', { color: '#4caf50' });
            setTimeout(() => {
              navigate('/admin-console/environment');
            }, 1000);
          }
        })
        .catch((error: any) => {
          console.error(error);
          showToast(error.response?.data?.message || 'Error submitting form', { color: '#FF0000' });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      showToast('No environment to update.', { color: '#FF0000' });
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
  };

  return (
    <div className="container mx-auto p-2 space-y-4">
      <Tabs
        value={state.activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="flex justify-between items-center">
          <div className="flex-1 flex justify-center">
          {TABS.length > 1 && (
            <TabsList aria-label="Environment Console Tabs" className="bg-transparent">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="px-4 py-2 rounded-md transition-colors duration-200 data-[state=active]:bg-black data-[state=active]:text-white"
                >
                  {tab
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </TabsTrigger>
              ))}
            </TabsList>
          )}
          </div>
          <Button
            variant="default"
            className="bg-gray-800 text-white hover:bg-gray-700"
            onClick={() => navigate('/admin-console/environment')}
          >
            View All Environments
          </Button>
        </div>

        <Card className="w-full mt-4">
          <CardContent className="p-6">
            <div className="max-w-[850px] mx-auto">
              <TabsContent value="environment">
                <EnvironmentTab
                  selectedPlatform={state.selectedPlatform}
                  setSelectedPlatform={(platform) =>
                    dispatch({ type: 'SET_SELECTED_PLATFORM', payload: platform })
                  }
                  tags={state.tags}
                  setTags={(newTags) => {
                    const updatedTags =
                      typeof newTags === 'function' ? newTags(state.tags) : newTags;
                    dispatch({ type: 'SET_TAGS', payload: updatedTags });
                  }}
                  onChange={handleEnvironmentTabChange}

                  environmentName={state.environmentTab.environmentName || editenvdata?.bh_env_name || ''}
                  environment={state.environmentTab.environment || editenvdata?.bh_env_provider || ''}
                  projectId={state.environmentTab.projectId || editenvdata?.project_id || ''}
                  location={state.environmentTab.location || editenvdata?.cloud_region_cd || ''}
                  accessKey={state.environmentTab.accessKey || editenvdata?.accessKey || ''}
                  secretAccessKey={state.environmentTab.secretAccessKey || editenvdata?.secret_access_key || ''}
                  airflowUrl={state.environmentTab.airflowUrl || editenvdata?.airflow_url || ''}
                  airflowDagBucket={state.environmentTab.airflowDagBucket || editenvdata?.airflow_bucket_name || ''}
                  privateKeyFile={state.environmentTab.privateKeyFile || editenvdata?.privateKeyFile || ''}

                  changeVerification={handleChangeVerification}
                />
              </TabsContent>
            </div>
          </CardContent>
        </Card>
      </Tabs>

      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={state.activeTab === TABS[0]}
        >
          Back
        </Button>
        <Button
          className="bg-gray-900 text-white hover:bg-gray-800"
          onClick={handleNext}
          disabled={!state.environmentTab.verification}
        >
          {state.activeTab === TABS[TABS.length - 1] ? (
            <>
              {isLoading ? <Spinner className="w-4 h-4 mr-2" /> : null}
              {"Update Environment"}
            </>
          ) : "Next"}
        </Button>
      </div>

      <ToastComponent />
    </div>
  );
}
