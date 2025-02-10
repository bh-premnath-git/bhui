import { FlowTable } from "@/features/designers/flow/FlowTable";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { getDataSources } from "@/api/get-methods";
import { Workflow } from "lucide-react";
import { useKeycloakAuth } from "@/provider/KeycloakProvider";

const ManageFlow = () => {
  const { userData } = useKeycloakAuth();
  const { data: flows, isLoading, error } = getDataSources.flows()
  
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
      user: userData.firstName
    };
  });
  

  return (
    <div className="container mx-auto space-y-6">
      <FlowTable flows={mFlows || []} />
    </div>
  );
};

export default ManageFlow;