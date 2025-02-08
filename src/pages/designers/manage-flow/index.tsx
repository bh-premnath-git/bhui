import { FlowTable } from "@/features/designers/flow/FlowTable";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { getDataSources } from "@/api/get-methods";


const ManageFlow = () => {
  const { data: flows, isLoading, error } = getDataSources.flows()

  if (isLoading) return <LoadingState className='w-full min-h-screen' />;
  if (error) return <ErrorState message="Failed to load flows" />;

  return (
    <div className="container mx-auto space-y-6">
      <FlowTable flows={flows || []} />
    </div>
  );
};

export default ManageFlow;