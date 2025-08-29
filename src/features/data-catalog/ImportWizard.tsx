import { useState } from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { ROUTES } from '@/config/routes';
import { X } from 'lucide-react';
import { useAppSelector } from '@/hooks/useRedux';
import { ProjectSelection } from '@/features/data-catalog/components/steps/ProjectSelection';
import { ConnectionSelection } from '@/features/data-catalog/components/steps/ConnectionSelection';
import { SchemaSelection } from '@/features/data-catalog/components/steps/SchemaSelection';
import { TableSelection } from '@/features/data-catalog/components/steps/TableSelection';
import { ImportSummary } from '@/features/data-catalog/components/steps/ImportSummary';
import { useDatabase } from './hooks/useDatabase';

export function ImportWizard() {
  const { handleNavigation } = useNavigation();
  const { handleCreateImportSource } = useDatabase();
  const [selectedSchema, setSelectedSchema] = useState('');
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const { project, connections } = useAppSelector((state) => state.datasource);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedConnection, setSelectedConnection] = useState('');

  const [schemas, setSchemas] = useState<string[]>([]);
  const [tables, setTables] = useState<string[]>([]);

  const toggleTable = (tableName: string) => {
    setSelectedTables((prev) =>
      prev.includes(tableName)
        ? prev.filter((name) => name !== tableName)
        : [...prev, tableName]
    );
  };

  const toggleAll = () => {
    if (selectedTables.length === tables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables([...tables]);
    }
  };


  const onSubmit = async (tables: string[], createDescription: boolean, identifyPII: boolean) => {
    if (!selectedProject || !selectedConnection || !selectedSchema) {
      throw new Error("Project, connection, and schema must be selected.");
    }

    setIsImporting(true);
    try {
      await handleCreateImportSource(
        selectedConnection,
        selectedProject,
        selectedSchema,
        createDescription,
        identifyPII,
        tables
      );
      handleNavigation(ROUTES.DATA_CATALOG);
    } catch (error) {
      console.error("Error importing tables:", error);
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  const goBack = () => {
    handleNavigation(ROUTES.DATA_CATALOG);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 relative">
        <div className="bg-card rounded-lg shadow-lg p-8 relative">
          <X
            className="absolute top-4 right-4 w-6 h-6 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
            onClick={goBack}
          />
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Import Database Metadata</h1>

            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 space-y-8">
                <ProjectSelection
                  project={project}
                  selectedProject={selectedProject}
                  setSelectedProject={setSelectedProject}
                  setSelectedConnection={setSelectedConnection}
                  setSelectedSchema={setSelectedSchema}
                  setSelectedTables={setSelectedTables}
                />

                {selectedProject && (
                  <ConnectionSelection
                    connections={connections}
                    selectedConnection={selectedConnection}
                    setSelectedConnection={setSelectedConnection}
                    setSelectedSchema={setSelectedSchema}
                    setSelectedTables={setSelectedTables}
                  />
                )}

                {selectedConnection && (
                  <SchemaSelection
                    selectedConnection={selectedConnection}
                    schemas={schemas}
                    setSchemas={setSchemas}
                    selectedSchema={selectedSchema}
                    setSelectedSchema={setSelectedSchema}
                    setSelectedTables={setSelectedTables}
                    handleFetchTable={() => Promise.resolve()}
                  />
                )}

                {selectedSchema && (
                  <TableSelection
                    selectedConnection={selectedConnection}
                    selectedSchema={selectedSchema}
                    tables={tables}
                    setTables={setTables}
                    selectedTables={selectedTables}
                    toggleTable={toggleTable}
                    toggleAll={toggleAll}
                    isImporting={isImporting}
                    onSubmit={onSubmit}
                  />
                )}
              </div>

              <div className="col-span-1">
                <ImportSummary
                  selectedConnection={selectedConnection}
                  connections={connections}
                  selectedSchema={selectedSchema}
                  selectedTables={selectedTables}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}