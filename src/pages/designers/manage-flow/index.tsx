import { useEffect } from "react";
import { FlowTable } from "@/features/designers/flow/FlowTable";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { getDataSources } from "@/api/get-methods";
import { Workflow } from "lucide-react";
import { useKeycloakAuth } from "@/provider/KeycloakProvider";
import { useAppDispatch } from "@/hooks/useRedux";
import { setFlows } from "@/store/features/flowSlice";
import { isEmpty } from "@/lib/isObjectEmpty";

const ManageFlow = () => {
  const dispatch = useAppDispatch();

  const { userData } = useKeycloakAuth();
  const { data: flows, isLoading, error } = getDataSources.flows()
  useEffect(() => {
    if (flows) {
      dispatch(setFlows(flows));
    }
  }, [flows, dispatch]);

  if (isLoading) return <LoadingState className='w-full min-h-screen' />;
  if (error) return <ErrorState message="Failed to load flows" />;

  if (flows.length === 0) {
    return (
      <div className="container">
        <EmptyState
          title="Welcome to Your flow operation !"
          description="Ready to manage your flow operation."
          Icon={Workflow}
        />
      </div>
    );
  }

  const mFlows = flows.map((flow: any) => {
    return {
      ...flow,
      user: (!isEmpty(userData)) ? userData?.firstName : ""
    };
  });


  return (
    <div className="container mx-auto space-y-6">
      <FlowTable flows={mFlows || []} />
    </div>
  );
};

export default ManageFlow;