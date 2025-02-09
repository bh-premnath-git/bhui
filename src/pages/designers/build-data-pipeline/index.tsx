import { PipelineTable } from "@/features/designers/pipeline/PipelineTable";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { getDataSources } from "@/api/get-methods";
import { Workflow } from "lucide-react";

const BuildDataPipeline = () => {
  const { data: pipelines, isLoading, error } = getDataSources.dataPipeline();

  if (isLoading) return <LoadingState className='w-full min-h-screen' />;
  if (error) return <ErrorState message="Failed to load pipelines" />;
  if (pipelines.length === 0) {
    return (
      <div className="container">
        <EmptyState
          title="Welcome to Your Data Pipeline !"
          description="Ready to manage your data pipelines."
          Icon={Workflow}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <PipelineTable pipelines={pipelines || []} />
    </div>
  );
};

export default BuildDataPipeline;