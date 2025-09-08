import { apiService } from '@/lib/api/api-service';
import { CATALOG_REMOTE_API_URL, AGENT_REMOTE_URL } from '@/config/platformenv';

export interface PipelineApi {
  listProjects: () => Promise<Array<{ id: number; name: string }>>;
  resolveProjectIdByName: (name: string) => Promise<number | null>;
  listEngineTypes: () => Promise<string[]>;
  createPipeline: (p: {
    name: string;
    projectId: number;
    type: 'design' | 'requirement';
    engine: string;
  }) => Promise<any>;
  generateSchema: (p: {
    pipelineId: string | number;
    expectationOrJson: string;
    availableColumns?: { columns: any[] };
  }) => Promise<any>;
}

export function usePipelineApi(): PipelineApi {
  return {
    async listProjects() {
      const data: any = await apiService.get({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: '/bh_project/list/',
        method: 'GET',
        usePrefix: true,
        params: { limit: 1000, offset: 0 },
      });
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      return list.map((p: any) => ({ id: p.bh_project_id, name: p.bh_project_name }));
    },
    async resolveProjectIdByName(name) {
      const list = await this.listProjects();
      const hit = list.find((p) => p.name.trim() === name.trim());
      return hit?.id ?? null;
    },
    async listEngineTypes() {
      return ['pyspark', 'pyflink'];
    },
    async createPipeline({ name, projectId, type, engine }) {
      return apiService.post({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: '/api/v1/pipeline/',
        method: 'POST',
        usePrefix: false,
        data: {
          pipeline_name: name,
          bh_project_id: Number(projectId),
          notes: '',
          tags: {},
          pipeline_json: {},
          pipeline_type: type,
          engine_type: engine,
        },
      });
    },
    async generateSchema({ pipelineId, expectationOrJson, availableColumns }) {
      let data: any = {
        pipeline_id: pipelineId,
        user_request: expectationOrJson,
        available_columns: availableColumns ?? { columns: [] },
      };
      try {
        const parsed = JSON.parse(expectationOrJson);
        if (parsed && typeof parsed === 'object') {
          data = { pipeline_id: pipelineId, pipeline_json: parsed, available_columns: availableColumns ?? { columns: [] } };
        }
      } catch {}

      return apiService.post({
        url: '/api/v1/pipeline_schema/pipeline',
        baseUrl: AGENT_REMOTE_URL,
        method: 'POST',
        usePrefix: false,
        data,
      });
    },
  };
}
