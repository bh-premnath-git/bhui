import React, { useLayoutEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { RootState } from "@/store/store";
import { FlexibleTable } from "@/components/Table";
import { useNavigate } from "react-router-dom";
// import { listConnections, setEditConnectionData } from "@/redux/ConnectionSlice";
import { Spinner } from "@/components/ui/spinner";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Plug, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CATALOG_API_PORT } from "@/configration/environment";
import { ApiService } from "@/services/apiServices";

// Update the Connection interface to match the API response
interface Connection {
  id: number;
  connection_config_name: string;
  connection_name: string;
  connection_type: string;
  connection_status: string;
  custom_metadata: {
    type?: string;
    connection_name?: string;
  };
  data_residency: string;
}

const AllConnections: React.FC = () => {
  const dispatch = useAppDispatch();
  const [connectionList,setConnectionList] = React.useState<Connection[]>([]);
  useLayoutEffect(() => {
    // dispatch(listConnections({ offset: 0, limit: 1000 }));
    let params={offset:0,limit:1000}
    const fetchConnections = async () => {
      const response = await ApiService(CATALOG_API_PORT, 'get', '/connection_registry/connection_config/list/',params);
      console.log(response)
      setConnectionList(response);
    };
    fetchConnections();
  }, [dispatch]);

  // const { connectionList, loading, error } = useAppSelector(
  //   (state: RootState) => state.connectionApi
  // );
  const navigate = useNavigate();

  const handleConnClick = (conn: Connection) => {
    // dispatch(setEditConnectionData(conn));
    navigate(`/admin-console/connection/${conn.id}`);
  };

  // Update the columns configuration
  const columns: any = [
    {
      key: "connection_config_name",
      header: "Connection Name",
      sortable: true,
      filterable: true,
      type: "text",
      render: (value: string, rowData: Connection) => (
        <div className="flex items-center gap-3">
          <span onClick={() => handleConnClick(rowData)} className="cursor-pointer">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "connection_type",
      header: "Connection Type",
      sortable: true,
      type: "text",
    },
    {
      key: "data_residency",
      header: "Data Residency",
      sortable: true,
      type: "text",
    },
    {
      key: "connection_status",
      header: "Status",
      sortable: true,
      type: "badge",
      badgeConfig: {
        colorMap: {
          active: "bg-green-500",
          inactive: "bg-red-500",
        },
      },
    },
  ];

  const EmptyComponent: React.FC = () => {
    return (
      <Card className="relative overflow-hidden w-full max-w-2xl mx-auto mt-20">
        <div className="relative p-8 sm:p-12 text-center">
          <Plug className="w-12 h-12 mx-auto text-primary mb-4" />
          <h2 className="text-3xl font-bold mb-4">No Connections Available</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start by adding a new connection to link your services.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/admin-console/connection/new")}
            className="bg-primary text-white"
          >
            <FolderPlus className="mr-2 h-5 w-5" />
            Add Connection
          </Button>
        </div>
      </Card>
    );
  };

  // if (loading) {
  //   return <Spinner />;
  // }

  // if (error) {
  //   return <ErrorDisplay message={error} />;
  // }

  const createNewFn = () => {
    // dispatch(setEditConnectionData({}));
    navigate("/admin-console/connection/new");
  };

  const actionFn = (rowData: Connection, action: string) => {
    if (action === "edit") {
      // dispatch(setEditConnectionData(rowData));
      navigate(`/admin-console/connection/${rowData.id}`);
    }
  };

  if (connectionList?.length === 0) {
    return <EmptyComponent />;
  }

  return (
    <div className="container mx-auto p-4">
      <FlexibleTable
        data={connectionList}
        columns={columns}
        itemsPerPageOptions={[5, 10, 20]}
        defaultItemsPerPage={10}
        tableName="Connections"
        createNewFn={createNewFn}
        actionFn={actionFn}
        rowColorFn={(row, index) => (index % 2 === 0 ? "bg-white" : "bg-gray-100")}
      />
      {/* {JSON.stringify(connectionList)} */}
    </div>
  );
};

export default AllConnections;
