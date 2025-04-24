type JSONObject = { [key: string]: any };

interface Pipeline {
  $schema: string;
  name: string;
  description: string;
  version: string;
  mode: string;
  parameters?: any[];
  connections: Record<string, JSONObject>;
  sources: Record<string, JSONObject>;
  targets?: Record<string, JSONObject>;
  transformations: JSONObject[];
}

// Utility to deep compare two JSON objects
function deepEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Normalize a source for comparison (only relevant fields)
function normalizeSource(source: JSONObject): JSONObject {
  const { type, file_path, connection } = source;
  return { type, file_path, connection };
}

export function convertToRefBasedSchema(pipeline: Pipeline): Pipeline {
  const connectionMap = new Map<string, string>();
  const newConnections: Record<string, JSONObject> = {};

  const newSources: Record<string, JSONObject> = {};
  const normalizedSources: JSONObject[] = [];
  const sourceIdMap = new Map<string, string>(); // key: normalized string -> id

  // Step 1: Normalize and deduplicate connections
  for (const [sourceId, source] of Object.entries(pipeline.sources)) {
    const connKey = JSON.stringify(source.connection);
    let connId = connectionMap.get(connKey);
    if (!connId) {
      connId = `connection_${Object.keys(newConnections).length}`;
      connectionMap.set(connKey, connId);
      newConnections[connId] = source.connection;
    }

    const newSource = {
      ...source,
      connection: { $ref: `#/connections/${connId}` },
    };

    const normalized = normalizeSource(newSource);
    normalizedSources.push(normalized);
    sourceIdMap.set(JSON.stringify(normalized), sourceId);
    newSources[sourceId] = newSource;
  }

  // Step 2: Handle transformation source references
  const newTransformations = pipeline.transformations.map((trans) => {
    const newTrans = { ...trans };

    if (trans.source) {
      const connKey = JSON.stringify(trans.source.connection);
      let connId = connectionMap.get(connKey);
      if (!connId) {
        connId = `connection_${Object.keys(newConnections).length}`;
        connectionMap.set(connKey, connId);
        newConnections[connId] = trans.source.connection;
      }

      const candidateSource = {
        type: trans.source.type,
        file_path: trans.source.file_path,
        connection: { $ref: `#/connections/${connId}` },
      };

      const normalizedCandidate = normalizeSource(candidateSource);
      const matchedKey = JSON.stringify(normalizedCandidate);
      let matchedSourceId = sourceIdMap.get(matchedKey);

      // If no match found, create a new source
      if (!matchedSourceId) {
        matchedSourceId = `source_${Object.keys(newSources).length}`;
        sourceIdMap.set(matchedKey, matchedSourceId);
        newSources[matchedSourceId] = candidateSource;
      }

      newTrans.source = { $ref: `#/sources/${matchedSourceId}` };
    }

    return newTrans;
  });

  return {
    ...pipeline,
    connections: newConnections,
    sources: newSources,
    transformations: newTransformations,
  };
}
