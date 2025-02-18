import { DataOpsProvider } from "@/context/dataops/DataOpsContext"
import Dashboard from "@/features/dataops/dashboard"

export default function DataOpsHub() {
  return (
    <DataOpsProvider>
      <Dashboard />
    </DataOpsProvider>
  );
}

