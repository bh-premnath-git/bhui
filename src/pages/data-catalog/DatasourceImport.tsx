import { ImportProvider } from "@/context/datacatalog/ImportContext"
import {ImportWizard} from "@/features/data-catalog/ImportWizard"
import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';

const DatasourceImport = () => {
  return (
    <div className="min-h-screen p-6 bg-background">
      <ImportProvider>
      <ImportWizard />
      </ImportProvider>
    </div>
  )
}

export default withPageErrorBoundary(DatasourceImport, 'DatasourceImport');