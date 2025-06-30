import { Connection } from "@/types/admin/connection";
import { Project } from "@/types/admin/project";

export const getProjectOptions = (projects: Project[]) => {
  return projects.map(project => ({
    label: project.bh_project_name,
    value: project.bh_project_id.toString()
  }));
};

export const getConnectionOptions = (connection: Connection[]) => {
  return connection.map(connection => ({
    label: connection.connection_config_name,
    type: connection.connection_type,
    database: connection.connection_name,
    value: connection.id.toString()
  }));
};