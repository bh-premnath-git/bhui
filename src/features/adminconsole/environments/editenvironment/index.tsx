import { useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from '@/components/shared/LoadingState';
import { EnvironmentTab } from '@/features/adminconsole/environments/environtabs/EnvironmentTab';
import { editEnvironment } from '@/store/oldstore/EnvironmentSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { encrypt_string } from '@/services/encryption';
import { areAllRequiredFieldsFilled } from '@/lib/environment';
import { EnvironmentTabState, State, Action, initialState } from "@/types/features/environment/types";

function reducer(state: State, action: Action): State {
  switch (action.type) {
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
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_EDITING':
      return { ...state, isEditing: action.payload };
    default:
      return state;
  }
}

export default function EnvironmentConsoleComponent(): JSX.Element {
  const navigate = useNavigate();
  const dispatchApi = useAppDispatch();

  const [state, dispatch] = useReducer(reducer, initialState);
  const { editEnvironmentData: editenvdata } = useAppSelector(
    (reduxState) => reduxState.environmentApi
  );
  
  useEffect(() => {
    if (editenvdata && editenvdata.bh_env_id) {
      dispatch({ type: 'SET_EDITING', payload: true });
      dispatch({
        type: 'SET_ENVIRONMENT_TAB',
        payload: {
          environmentName: editenvdata.bh_env_name || "",
          environment: String(editenvdata.bh_env_provider || ""),
          projectId: editenvdata.project_id || "",
          location: String(editenvdata.cloud_region_cd || ""),
          accessKey: editenvdata.accessKey || "",
          secretAccessKey: editenvdata.secret_access_key || "",
          airflowUrl: editenvdata.airflow_url || "",
          airflowDagBucket: editenvdata.airflow_bucket_name || "",
          awsPvtKey: editenvdata.pvt_key || null,
          selectedMwaaEnv: editenvdata.airflow_env_name || null,
          privateKeyFile: editenvdata.file || null,
          verification: false,
        },
      });

      const tagData =
        editenvdata.tags
          ? [{ tagList: editenvdata.tags.tagList || [] }]
          : [{ tagList: [] }];
      dispatch({ type: 'SET_TAGS', payload: tagData });

      if (editenvdata.cloud_provider_cd === 101) {
        dispatch({ type: 'SET_SELECTED_PLATFORM', payload: 'aws' });
      } else {
        dispatch({ type: 'SET_SELECTED_PLATFORM', payload: 'google-cloud' });
      }
    } else {
      dispatch({ type: 'SET_EDITING', payload: false });
      dispatch({ type: 'SET_TAGS', payload: [{ tagList: [] }] });
    }
  }, [editenvdata]);

  const handleEnvironmentTabChange = (changes: Partial<EnvironmentTabState>) => {
    dispatch({ type: 'SET_ENVIRONMENT_TAB', payload: changes });
  };

  const handleChangeVerification = (data: boolean) => {
    dispatch({ type: 'SET_VERIFICATION', payload: data });
  };

  const canUpdate = areAllRequiredFieldsFilled(
    state.environmentTab,
    state.selectedPlatform
  ) && state.environmentTab.verification;

  const handleUpdate = async (): Promise<void> => {
    if (!state.isEditing || !editenvdata?.Environment_Id) {
      toast.error('No environment to update.');
      return;
    }

    const { secretAccessKey, accessKey } = state.environmentTab;
    const { encryptedString, initVector } = encrypt_string(secretAccessKey);
    const { encryptedString: encryptedString1 } = encrypt_string(
      accessKey,
      initVector
    );

    const formattedTags = state.tags
      .filter(tag => tag && tag.tagList)
      .flatMap(tag => tag?.tagList);

    const tagsPayload = JSON.stringify({
      tagList: Array.isArray(formattedTags) ? formattedTags : [],
    });

    const bucketMatch = state.environmentTab.airflowDagBucket?.match(/([^:]+)$/);
    const bucketName = bucketMatch?.[1] || state.environmentTab.airflowDagBucket;

    // Final payload
    const values = {
      bh_env_name:
        state.environmentTab.environmentName || editenvdata?.bh_env_name || '',
      bh_env_provider:
        parseInt(state.environmentTab.environment) ||
        editenvdata?.bh_env_provider ||
        null,
      cloud_provider_cd: state.selectedPlatform === 'aws' ? 101 : 102,
      cloud_region_cd:
        parseInt(state.environmentTab.location) || editenvdata?.cloud_region_cd || null,
      status_cd: 'active',
      project_id:
        state.environmentTab.projectId || editenvdata?.project_id || '',
      file:
        state.environmentTab.privateKeyFile ||
        editenvdata?.file ||
        null,
      access_key: encryptedString1,
      secret_access_key: encryptedString,
      init_vector: initVector,
      airflow_url:
        state.environmentTab.airflowUrl ||
        editenvdata?.airflow_url ||
        '',
      airflow_bucket_name: bucketName || '',
      airflow_env_name:
        state.environmentTab.selectedMwaaEnv || editenvdata?.airflow_env_name || '',
      pvt_key:
        state.environmentTab.awsPvtKey || editenvdata?.pvt_key || '',

      tags: tagsPayload,
      id: editenvdata.Environment_Id,
    };

    // Dispatch to redux
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatchApi(editEnvironment(values))
      .then((response: any) => {
        if (response.type === 'environment/edit/fulfilled') {
          toast.success('Environment updated successfully');
          setTimeout(() => {
            navigate('/admin-console/environment');
          }, 1000);
        }
      })
      .catch((error: any) => {
        console.error(error);
        toast.error(
          error.response?.data?.message || 'Error updating environment'
        );
      })
      .finally(() => {
        dispatch({ type: 'SET_LOADING', payload: false });
      });
  };

  // --- Render ---
  return (
    <div className="container p-0 space-y-2">
      {/* Header */}
      <div className="flex justify-end items-center">
        <Button
          variant="default"
          className="bg-gray-800 text-white hover:bg-gray-700"
          onClick={() => navigate('/admin-console/environment')}
        >
          View All Environments
        </Button>
      </div>

      <Card className="w-full mt-2">
        <CardContent className="p-2">
          <div className="max-w-[1050px] mx-auto">
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
              isEditing={state.isEditing}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/admin-console/environment')}
        >
          Cancel
        </Button>
        <Button
          className="bg-gray-900 text-white hover:bg-gray-800"
          onClick={handleUpdate}
          disabled={!canUpdate}
        >
          {state.isLoading && <LoadingState className="w-4 h-4 mr-2" />}
          Update Environment
        </Button>
      </div>
    </div>
  );
}
