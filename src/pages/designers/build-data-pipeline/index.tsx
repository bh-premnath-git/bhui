import { PipelineTable } from "@/features/designers/pipeline/PipelineTable";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { getDataSources } from "@/api/get-methods";

const BuildDataPipeline = () => {
  const { data: pipelines, isLoading, error } = getDataSources.dataPipeline();

  if (isLoading) return <LoadingState className='w-full min-h-screen' />;
  if (error) return <ErrorState message="Failed to load pipelines" />;

  return (
    <div className="container mx-auto space-y-6">
      <PipelineTable pipelines={pipelines || []} />
    </div>
  );
};

export default BuildDataPipeline;