import React, { useState } from "react";
import { FlexibleTable } from "@/components/Tabel";
import { FileQuestion } from "lucide-react";
import { formatedDate } from "@/Utils/dateFormatter";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";

interface BundleRelease {
  id: number;
  name: string;
  environment: string;
  status: string;
  createdBy: string;
  lastUpdatedOn: string | null;
  deployedOn: string | null;
}

interface BundleTableProps {
  bundleList: BundleRelease[];
  loading: boolean;
  error: { message: string } | null;
}

type ColumnConfig = {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'date' | 'badge';
  badgeConfig?: {
    colorMap: Record<string, string>;
  };
  render?: (value: any, rowData: BundleRelease) => React.ReactNode;
};

function BundleTable({
  bundleList,
  loading,
  error,
}: BundleTableProps) {
  const navigate = useNavigate();

  const handleBundleClick = (bundle: BundleRelease) => {
    navigate(`/dataops-hub/release-bundle/${bundle.id}`);
  };

  const columns: ColumnConfig[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      filterable: true,
      type: 'text',
      render: (value: string, rowData: BundleRelease) => (
        <span onClick={() => handleBundleClick(rowData)} className="cursor-pointer">
          {value}
        </span>
      ),
    },
    {
      key: 'environment',
      header: 'Environment',
      sortable: true,
      filterable: true,
      type: 'text',
    },
    {
      key: 'status',
      header: 'Status',
      type: 'badge',
      sortable: true,
      filterable: true,
      badgeConfig: {
        colorMap: {
          Deployed: 'bg-green-500',
          Failed: 'bg-red-500',
          Pending: 'bg-yellow-500',
        },
      },
    },
    {
      key: 'createdBy',
      header: 'Created By',
      sortable: false,
      type: 'text',
    },
    {
      key: 'lastUpdatedOn',
      header: 'Last Updated',
      sortable: true,
      filterable: true,
      type: 'date',
      render: (value: string | null) => formatedDate(value) || 'Never',
    },
    {
      key: 'deployedOn',
      header: 'Deployed On',
      sortable: true,
      filterable: true,
      type: 'date',
      render: (value: string | null) => formatedDate(value) || 'Never',
    },
  ];

  const EmptyComponent: React.FC = () => {
    const navigate = useNavigate();

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FileQuestion size={64} className="text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Bundles Available</h2>
        <button
          onClick={() => navigate("/dataops-hub/release-bundle/new")}
          className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Create Bundle
        </button>
      </div>
    );
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (error) {
    return <ErrorDisplay message={error.message} />;
  }

  const createNewFn = () => {
    navigate("/dataops-hub/release-bundle/new");
  };

  const actionFn = (rowData: BundleRelease, action: string) => {
    if (action === 'edit') {
      navigate(`/dataops-hub/release-bundle/${rowData.id}`);
    }
  };

  if (bundleList.length === 0) {
    return <EmptyComponent />;
  }

  return (
    <div className="container mx-auto p-4">
      <FlexibleTable
        data={bundleList}
        columns={columns}
        itemsPerPageOptions={[5, 10, 20]}
        defaultItemsPerPage={10}
        tableName="Create New Bundle"
        createNewFn={createNewFn}
        actionFn={actionFn}
      />
    </div>
  );
}

const BundleReleases: React.FC = () => {
  const [bundleList, setBundleList] = useState<BundleRelease[]>([
    {
      id: 1,
      name: 'Release 2024.15',
      environment: 'Production',
      status: 'Deployed',
      createdBy: 'John Doe',
      lastUpdatedOn: '2024-03-15T10:30:00',
      deployedOn: '2024-03-15T11:00:00',
    },
    // Add more sample data as needed
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string } | null>(null);

  return (
    <BundleTable
      bundleList={bundleList}
      loading={loading}
      error={error}
    />
  );
};

export default BundleReleases;