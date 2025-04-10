import React, { useEffect, useState } from "react";
import $RefParser from "json-schema-ref-parser";

const pipelineSchema = {
  "$schema": "https://json-schema.org/draft-07/schema#",
  "name": "sample_pipeline",
  "description": "Sample pipeline abiding by the schemas defined",
  "version": "1.0",
  "mode": "ENGINE",
  "parameters": [
    { "key": "landing_folder", "value": "landing"},
    { "key": "output_dataset", "value": "bh_lab_1" },
    { "key": "input_file", "value": "${landing_folder}/input.csv" },
    { "key": "lookup_file", "value": "${landing_folder}/lookup.csv" },
    { "key": "output_table", "value": "output" },
    { "key": "project_id", "value": "platinum-avenue-452300-h8" }
  ],
  "connections": {
    "src_connection": {
      "connection_type": "gcs",
      "file_path_prefix": "",
      "bucket": "bh_lab_1",
      "secret_name": "bh-bigquery-bq"
    },
    "tgt_connection": {
      "connection_type": "bigquery",
      "project_id": "${project_id}",
      "dataset_id": "${output_dataset}",
      "temp_gcs_bucket": "bh_lab_1",
      "secret_name": "bh-bigquery-bq"
    }
  },
  "sources": {
    "input_data": {
      "source_type": "File",
      "file_name": "${input_file}",
      "connection": { "$ref": "#/connections/src_connection" }
    },
    "lookup_data": {
      "source_type": "File",
      "file_name": "${lookup_file}",
      "connection": { "$ref": "#/connections/src_connection" }
    }
  },
  "targets": {
    "output_data": {
      "target_type": "Relational",
      "connection": { "$ref": "#/connections/tgt_connection" },
      "table_name": "${output_table}",
      "load_mode": "append"
    }
  }
};

const ResolveSchema = () => {
  const [resolvedSchema, setResolvedSchema] = useState(null);

  useEffect(() => {
    async function resolveRefs() {
      try {
        const dereferencedSchema = await $RefParser.dereference(pipelineSchema);
        setResolvedSchema(dereferencedSchema);
      } catch (error) {
        console.error("Error resolving $ref:", error);
      }
    }

    resolveRefs();
  }, []);

  return (
    <div>
      <h2>Resolved Pipeline Schema</h2>
      <pre>{JSON.stringify(resolvedSchema, null, 2)}</pre>
    </div>
  );
};

export default ResolveSchema;
