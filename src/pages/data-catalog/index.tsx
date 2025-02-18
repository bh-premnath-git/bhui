import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { DataCatalog } from '@/features/data-catalog/DataCatalog';

function DataCatalogPage() {
    return (
        <DataCatalog />
    );
}

export default withPageErrorBoundary(DataCatalogPage, 'DataCatalog');