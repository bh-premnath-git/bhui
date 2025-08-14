import React, { useState, useEffect } from 'react';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';
import SimpleJSONSchemaForm from './SimpleJSONSchemaForm';
import { convertToRefBasedSchema } from '@/lib/convertToRefBasedSchema';

// Function to enhance schema with better UI labels and descriptions
const enhanceSchema = (schema: any, schemaType: string): any => {
  // Create a deep copy of the schema to avoid modifying the original
  const enhancedSchema = JSON.parse(JSON.stringify(schema));

  // Add title if not present
  if (!enhancedSchema.title) {
    switch (schemaType) {
      case 'Filter':
        enhancedSchema.title = 'Filter Transformation';
        break;
      case 'SchemaTransformation':
        enhancedSchema.title = 'Schema Transformation';
        break;
      case 'Source':
        enhancedSchema.title = 'Data Source';
        break;
      case 'Reader':
        enhancedSchema.title = 'Reader Configuration';
        break;
      case 'Target':
        enhancedSchema.title = 'Target Configuration';
        break;
    }
  }

  // Add description if not present
  if (!enhancedSchema.description) {
    switch (schemaType) {
      case 'Filter':
        enhancedSchema.description = 'Define a condition to filter your data';
        break;
      case 'SchemaTransformation':
        enhancedSchema.description = 'Define derived fields for your data';
        break;
      case 'Source':
        enhancedSchema.description = 'Configure your data source';
        break;
      case 'Reader':
        enhancedSchema.description = 'Configure how to read your data';
        break;
      case 'Target':
        enhancedSchema.description = 'Configure your data target';
        break;
    }
  }

  // Enhance properties with better titles and descriptions
  if (enhancedSchema.properties) {
    // Filter schema enhancements
    if (schemaType === 'Filter' && enhancedSchema.properties.condition) {
      enhancedSchema.properties.condition.title = enhancedSchema.properties.condition.title || 'Filter Condition';
      enhancedSchema.properties.condition.description = enhancedSchema.properties.condition.description ||
        'Enter a condition to filter your data (e.g., \'age >= 18\' or \'sales_amount > 1000\')';
      enhancedSchema.properties.condition.format = 'textarea';
    }

    // Schema Transformation enhancements
    if (schemaType === 'SchemaTransformation' && enhancedSchema.properties.derived_fields) {
      enhancedSchema.properties.derived_fields.title = enhancedSchema.properties.derived_fields.title || 'Derived Fields';
      enhancedSchema.properties.derived_fields.description = enhancedSchema.properties.derived_fields.description ||
        'Define new fields based on expressions';

      if (enhancedSchema.properties.derived_fields.items &&
        enhancedSchema.properties.derived_fields.items.properties) {
        const itemProps = enhancedSchema.properties.derived_fields.items.properties;

        if (itemProps.name) {
          itemProps.name.title = itemProps.name.title || 'Field Name';
          itemProps.name.description = itemProps.name.description || 'Name of the new field';
        }

        if (itemProps.expression) {
          itemProps.expression.title = itemProps.expression.title || 'Expression';
          itemProps.expression.description = itemProps.expression.description ||
            'SQL-like expression to calculate the field value';
          itemProps.expression.format = 'textarea';
        }
      }
    }

    // Source schema enhancements
    if (schemaType === 'Source') {
      if (enhancedSchema.properties.source_name) {
        enhancedSchema.properties.source_name.title = enhancedSchema.properties.source_name.title || 'Source Name';
        enhancedSchema.properties.source_name.description = enhancedSchema.properties.source_name.description ||
          'Name for this data source';
      }

      if (enhancedSchema.properties.type) {
        enhancedSchema.properties.type.title = enhancedSchema.properties.type.title || 'Source Type';
      }

      if (enhancedSchema.properties.connection) {
        enhancedSchema.properties.connection.title = enhancedSchema.properties.connection.title || 'Connection';

        if (enhancedSchema.properties.connection.properties) {
          const connProps = enhancedSchema.properties.connection.properties;

          if (connProps.type) {
            connProps.type.title = connProps.type.title || 'Connection Type';
          }

          if (connProps.database) {
            connProps.database.title = connProps.database.title || 'Database';
          }

          if (connProps.schema) {
            connProps.schema.title = connProps.schema.title || 'Schema';
          }

          if (connProps.table) {
            connProps.table.title = connProps.table.title || 'Table';
          }
        }
      }
    }

    // Reader schema enhancements
    if (schemaType === 'Reader') {
      if (enhancedSchema.properties.reader_name) {
        enhancedSchema.properties.reader_name.title = enhancedSchema.properties.reader_name.title || 'Reader Name';
        enhancedSchema.properties.reader_name.description = enhancedSchema.properties.reader_name.description ||
          'Name for this data reader';
      }

      if (enhancedSchema.properties.source) {
        enhancedSchema.properties.source.title = enhancedSchema.properties.source.title || 'Source';

        if (enhancedSchema.properties.source.properties) {
          const sourceProps = enhancedSchema.properties.source.properties;

          if (sourceProps.type) {
            sourceProps.type.title = sourceProps.type.title || 'Source Type';
          }

          if (sourceProps.file_path) {
            sourceProps.file_path.title = sourceProps.file_path.title || 'File Path';
          }

          if (sourceProps.connection && sourceProps.connection.properties) {
            sourceProps.connection.title = sourceProps.connection.title || 'Connection';
            const connProps = sourceProps.connection.properties;

            if (connProps.type) {
              connProps.type.title = connProps.type.title || 'Connection Type';
            }

            if (connProps.database) {
              connProps.database.title = connProps.database.title || 'Database';
            }

            if (connProps.schema) {
              connProps.schema.title = connProps.schema.title || 'Schema';
            }

            if (connProps.table) {
              connProps.table.title = connProps.table.title || 'Table';
            }
          }
        }
      }

      if (enhancedSchema.properties.file_type) {
        enhancedSchema.properties.file_type.title = enhancedSchema.properties.file_type.title || 'File Type';
      }

      if (enhancedSchema.properties.read_options) {
        enhancedSchema.properties.read_options.title = enhancedSchema.properties.read_options.title || 'Read Options';

        if (enhancedSchema.properties.read_options.properties) {
          const optProps = enhancedSchema.properties.read_options.properties;

          if (optProps.header) {
            optProps.header.title = optProps.header.title || 'Has Header';
          }

          if (optProps.delimiter) {
            optProps.delimiter.title = optProps.delimiter.title || 'Delimiter';
          }

          if (optProps.quote) {
            optProps.quote.title = optProps.quote.title || 'Quote Character';
          }
        }
      }
    }

    // Target schema enhancements
    if (schemaType === 'Target') {
      if (enhancedSchema.properties.target_name) {
        enhancedSchema.properties.target_name.title = enhancedSchema.properties.target_name.title || 'Target Name';
        enhancedSchema.properties.target_name.description = enhancedSchema.properties.target_name.description ||
          'Name for this data target';
      }

      if (enhancedSchema.properties.target_type) {
        enhancedSchema.properties.target_type.title = enhancedSchema.properties.target_type.title || 'Target Type';
      }

      if (enhancedSchema.properties.load_mode) {
        enhancedSchema.properties.load_mode.title = enhancedSchema.properties.load_mode.title || 'Load Mode';
        enhancedSchema.properties.load_mode.description = enhancedSchema.properties.load_mode.description ||
          'How to load data into the target';
      }

      if (enhancedSchema.properties.connection) {
        enhancedSchema.properties.connection.title = enhancedSchema.properties.connection.title || 'Connection';

        if (enhancedSchema.properties.connection.properties) {
          const connProps = enhancedSchema.properties.connection.properties;

          if (connProps.type) {
            connProps.type.title = connProps.type.title || 'Connection Type';
          }

          if (connProps.database) {
            connProps.database.title = connProps.database.title || 'Database';
          }

          if (connProps.schema) {
            connProps.schema.title = connProps.schema.title || 'Schema';
          }

          if (connProps.table) {
            connProps.table.title = connProps.table.title || 'Table';
          }
        }
      }

      if (enhancedSchema.properties.file_name) {
        enhancedSchema.properties.file_name.title = enhancedSchema.properties.file_name.title || 'File Name';
      }

      if (enhancedSchema.properties.merge_keys) {
        enhancedSchema.properties.merge_keys.title = enhancedSchema.properties.merge_keys.title || 'Merge Keys';
        enhancedSchema.properties.merge_keys.description = enhancedSchema.properties.merge_keys.description ||
          'Keys to use for merging data (required when load mode is "merge")';
      }
    }
  }

  return enhancedSchema;
};

interface SchemaFormLoaderProps {
  schemaType: 'Reader' | 'Filter' | 'SchemaTransformation' | 'Source' | 'Target' | 'Writer';
  initialValues?: any;
  onSubmit: (formData: any) => void;
  submitLabel?: string;
  updatePipelineTemplate?: boolean; // Flag to indicate if pipeline template should be updated
}

const SchemaFormLoader: React.FC<SchemaFormLoaderProps> = ({
  schemaType,
  initialValues = {},
  onSubmit,
  submitLabel,
  updatePipelineTemplate = true // Default to true to update pipeline template
}) => {
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the pipeline context to update the pipeline template
  const { makePipeline, pipelineJson, setPipelineJson } = usePipelineContext();

const fallbackSchemas = {}

  useEffect(() => {
    const loadSchema = async () => {
      try {
        setLoading(true);
        setError(null);

        // Import the schema files directly
        let schemaData;

        try {
          // Import the schema files directly instead of using dynamic imports
          switch (schemaType) {
            case 'Filter':
              schemaData = await import('@/components/bh-reactflow-comps/builddata/json/Filter.json');
              break;

            case 'SchemaTransformation':
              schemaData = await import('@/components/bh-reactflow-comps/builddata/json/SchemaTransformation.json');
              break;

            case 'Source':
              schemaData = await import('@/components/bh-reactflow-comps/builddata/json/Source.json');
              break;

            case 'Reader':
              schemaData = await import('@/components/bh-reactflow-comps/builddata/json/Reader.json');
              break;

            case 'Target':
              schemaData = await import('@/components/bh-reactflow-comps/builddata/json/Target.json');
              break;
              
            case 'Writer':
              schemaData = await import('@/components/bh-reactflow-comps/builddata/json/Writer.json');
              break;

            default:
              throw new Error(`Unknown schema type: ${schemaType}`);
          }

          // Enhance the schema with UI-friendly titles and descriptions
          const enhancedSchema = enhanceSchema(schemaData, schemaType);
          setSchema(enhancedSchema);
        } catch (importError) {
          console.error("Error importing schema file:", importError);

          // Fallback to hardcoded schemas if import fails
          console.log("Using fallback schema for", schemaType);

          // Use the fallback schema defined above
          const fallbackSchema = fallbackSchemas[schemaType];
          if (fallbackSchema) {
            setSchema(fallbackSchema);
          } else {
            setError("Failed to load schema file");
          }
        }
      } catch (err) {
        console.error("Error loading schema:", err);
        setError("Failed to load form schema");

        // Use the fallback schema
        const fallbackSchema = fallbackSchemas[schemaType];
        if (fallbackSchema) {
          setSchema(fallbackSchema);
          setError(null); // Clear error since we're using fallback
        }
      } finally {
        setLoading(false);
      }
    };

    loadSchema();
  }, [schemaType]);

  if (loading) {
    return <div className="p-4 text-center">Loading form...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!schema) {
    return <div className="p-4 text-center">No schema available</div>;
  }

  // Process the initialValues to ensure they match the schema structure
  const processInitialValues = () => {
    // If no schema or initialValues, return as is
    if (!schema || !initialValues) return initialValues;

    // Create a deep copy to avoid modifying the original
    const processedValues = JSON.parse(JSON.stringify(initialValues));

    // Handle specific schema types
    if (schemaType === 'Reader') {
      // Ensure source object exists
      if (!processedValues.source) {
        processedValues.source = { type: 'File' };
      }

      // Ensure read_options exists for CSV files
      if (processedValues.file_type === 'CSV' && !processedValues.read_options) {
        processedValues.read_options = { header: true, delimiter: ',', quote: '"' };
      }
    }

    return processedValues;
  };

  // Function to ensure all sources and connections referenced in transformations exist in their respective sections
  const ensureSourcesAndConnectionsExist = (template: any) => {
    if (!template.transformations) return template;

    // Create sources and connections objects if they don't exist
    if (!template.sources) template.sources = {};
    if (!template.connections) template.connections = {};

    // Scan all transformations for Reader transformations
    template.transformations.forEach((transformation: any) => {
      if (transformation.transformation === 'Reader' && transformation.source) {
        const sourceName = transformation.name.replace('read_', '');
        const sourceId = `source_${sourceName}`;

        // Add source to sources section if it doesn't exist
        if (!template.sources[sourceId] && transformation.source) {
          template.sources[sourceId] = {
            "name": sourceName,
            "source_type": transformation.source.type || "File",
            ...transformation.source
          };

          // Add connection to connections section if it doesn't exist
          if (transformation.source.connection) {
            const connectionId = `connection_${sourceName}`;
            if (!template.connections[connectionId]) {
              template.connections[connectionId] = {
                "name": `${sourceName}_connection`,
                ...transformation.source.connection
              };
            }
          }
        }
      }
    });

    return template;
  };

  // Function to update the pipeline template based on form data
  const updatePipelineTemplateWithFormData = async (formData: any) => {
    console.log('Updating pipeline template with form data:', { formData, pipelineJson, updatePipelineTemplate });
    if (!pipelineJson || !updatePipelineTemplate || !setPipelineJson) {
      console.warn('Cannot update pipeline template:', {
        pipelineJsonAvailable: !!pipelineJson,
        updatePipelineTemplate,
        setPipelineJsonAvailable: !!setPipelineJson
      });
      return;
    }

    // Create a deep copy of the current pipeline template or initialize a new one if it doesn't exist
    const updatedTemplate = pipelineJson ? JSON.parse(JSON.stringify(pipelineJson)) : {
      "$schema": "https://json-schema.org/draft-07/schema#",
      "name": "New Pipeline",
      "description": "",
      "version": "1.0",
      "sources": {},
      "connections": {},
      "transformations": []
    };

    // Ensure all sources and connections referenced in transformations exist
    ensureSourcesAndConnectionsExist(updatedTemplate);

    // Update the template based on the schema type and form data
    switch (schemaType) {
      case 'Filter':
        // Update filter transformation in the pipeline template
        if (!updatedTemplate.transformations) {
          updatedTemplate.transformations = [];
        }
        // Find the filter transformation if it exists
        const filterIndex = updatedTemplate.transformations.findIndex(
          (t: any) => t.transformation === 'Filter'
        );

        if (filterIndex >= 0) {
          // Update existing filter transformation
          updatedTemplate.transformations[filterIndex].condition = formData.condition;
        } else {
          // Find the last transformation to make this dependent on
          const lastTransformation = updatedTemplate.transformations.length > 0
            ? updatedTemplate.transformations[updatedTemplate.transformations.length - 1]
            : null;

          // Create a new filter transformation
          const newFilter = {
            "name": "filter_transformation",
            "dependent_on": lastTransformation ? [lastTransformation.name] : [],
            "transformation": "Filter",
            "condition": formData.condition
          };

          // Add the new filter transformation
          updatedTemplate.transformations.push(newFilter);
        }
        break;

      case 'SchemaTransformation':
        // Update schema transformation in the pipeline template
        if (!updatedTemplate.transformations) {
          updatedTemplate.transformations = [];
        }
        // Find the schema transformation if it exists
        const schemaIndex = updatedTemplate.transformations.findIndex(
          (t: any) => t.transformation === 'SchemaTransformation'
        );

        if (schemaIndex >= 0) {
          // Update existing schema transformation
          updatedTemplate.transformations[schemaIndex].derived_fields = formData.derived_fields;
        } else {
          // Find the last transformation to make this dependent on
          const lastTransformation = updatedTemplate.transformations.length > 0
            ? updatedTemplate.transformations[updatedTemplate.transformations.length - 1]
            : null;

          // Create a new schema transformation
          const newSchemaTransformation = {
            "name": "schema_transformation",
            "dependent_on": lastTransformation ? [lastTransformation.name] : [],
            "transformation": "SchemaTransformation",
            "derived_fields": formData.derived_fields
          };

          // Add the new schema transformation
          updatedTemplate.transformations.push(newSchemaTransformation);
        }
        break;

      case 'Reader':
        // Update reader transformation in the pipeline template
        if (!updatedTemplate.transformations) {
          updatedTemplate.transformations = [];
        }
        if (!updatedTemplate.sources) {
          updatedTemplate.sources = {};
        }
        if (!updatedTemplate.connections) {
          updatedTemplate.connections = {};
        }

        // Find the reader transformation if it exists
        const readerIndex = updatedTemplate.transformations.findIndex(
          (t: any) => t.transformation === 'Reader' && t.name === `read_${formData.reader_name}`
        );

        // Extract source information from the form data
        const readerSourceName = formData.reader_name;
        const readerSourceId = `source_${readerSourceName}`;

        // Create or update the source in the sources section
        if (formData.source) {
          updatedTemplate.sources[readerSourceId] = {
            "name": readerSourceName,
            "source_type": formData.source.type || "File",
            ...formData.source
          };

          // If there's a connection in the source, update the connections section
          if (formData.source.connection) {
            const readerConnectionId = `connection_${readerSourceName}`;
            updatedTemplate.connections[readerConnectionId] = {
              "name": `${readerSourceName}_connection`,
              ...formData.source.connection
            };
          }
        }

        if (readerIndex >= 0) {
          // Update existing reader transformation
          updatedTemplate.transformations[readerIndex].read_options = formData.read_options || {
            header: true
          };

          // Update the source reference
          if (formData.source) {
            updatedTemplate.transformations[readerIndex].source = formData.source;
          }
        } else {
          // Create a new reader transformation
          const newReader = {
            "name": `read_${formData.reader_name}`,
            "dependent_on": [],
            "transformation": "Reader",
            "source": formData.source,
            "read_options": formData.read_options || {
              header: true
            }
          };

          // Add the new reader transformation
          updatedTemplate.transformations.push(newReader);
        }
        break;

      case 'Source':
        // Update source in the pipeline template
        if (!updatedTemplate.sources) {
          updatedTemplate.sources = {};
        }
        if (!updatedTemplate.connections) {
          updatedTemplate.connections = {};
        }
        if (!updatedTemplate.transformations) {
          updatedTemplate.transformations = [];
        }

        // Generate source ID
        const sourceName = formData.source_name;
        const sourceKey = `source_${sourceName}`;

        // Create or update the source
        updatedTemplate.sources[sourceKey] = {
          "name": sourceName,
          "source_type": formData.type,
          ...formData
        };

        // If there's a connection, update it as well
        if (formData.connection) {
          const sourceConnectionId = `connection_${sourceName}`;
          updatedTemplate.connections[sourceConnectionId] = {
            "name": `${sourceName}_connection`,
            ...formData.connection
          };
        }

        // Add a reader transformation for this source
        const sourceReaderName = `read_${sourceName}`;
        const sourceReaderIndex = updatedTemplate.transformations.findIndex(
          (t: any) => t.transformation === 'Reader' && t.name === sourceReaderName
        );

        if (sourceReaderIndex >= 0) {
          // Update existing reader transformation
          updatedTemplate.transformations[sourceReaderIndex].source = updatedTemplate.sources[sourceKey];
        } else {
          // Create a new reader transformation
          const sourceReaderTransformation = {
            "name": sourceReaderName,
            "dependent_on": [],
            "transformation": "Reader",
            "source": updatedTemplate.sources[sourceKey],
            "read_options": {
              "header": true
            }
          };

          // Add the new reader transformation
          updatedTemplate.transformations.push(sourceReaderTransformation);
        }
        break;

      case 'Target':
        // Update target in the pipeline template
        if (!updatedTemplate.targets) {
          updatedTemplate.targets = {};
        }
        if (!updatedTemplate.connections) {
          updatedTemplate.connections = {};
        }

        // Only add target if target_name is provided
        if (formData.target_name) {
          const targetId = `target_${formData.target_name}`;

          // Create or update the target
          const targetData = {
            "name": formData.target_name,
            "target_type": formData.target_type,
            "load_mode": formData.load_mode || "append"
          };

          // Add target-type specific fields
          if (formData.target_type === 'File') {
            targetData.file_name = formData.file_name || formData.target_name;
          } else if (formData.target_type === 'Relational') {
            targetData.table_name = formData.table_name || formData.target_name;
          }

          // If there's a connection, add it to the target and also store it separately
          if (formData.connection) {
            const connectionId = `connection_${formData.target_name}`;
            
            // Add connection reference to target
            targetData.connection = {
              "$ref": `#/connections/${connectionId}`
            };
            
            // Store connection separately
            updatedTemplate.connections[connectionId] = {
              "name": `${formData.target_name}_connection`,
              ...formData.connection
            };
          }

          updatedTemplate.targets[targetId] = targetData;
        }
        break;
        
      case 'Writer':
        // Update target in the pipeline template and add a writer transformation
        if (!updatedTemplate.targets) {
          updatedTemplate.targets = {};
        }
        if (!updatedTemplate.connections) {
          updatedTemplate.connections = {};
        }
        if (!updatedTemplate.transformations) {
          updatedTemplate.transformations = [];
        }

        // Only add target if target information is provided
        if (formData.target && formData.target.target_name) {
          const targetId = `target_output`;
          const targetName = formData.target.target_name;

          // Create or update the target
          const targetData = {
            "name": targetName,
            "target_type": formData.target.target_type,
            "load_mode": formData.target.load_mode || "append"
          };

          // Add target-type specific fields
          if (formData.target.target_type === 'File') {
            targetData.file_name = formData.target.file_name || targetName;
          } else if (formData.target.target_type === 'Relational') {
            targetData.table_name = formData.target.table_name || targetName;
          }

          // If there's a connection, add it to the target and also store it separately
          if (formData.target.connection) {
            const connectionId = `connection_${targetName}`;
            
            // Add connection reference to target
            targetData.connection = {
              "$ref": `#/connections/${connectionId}`
            };
            
            // Store connection separately
            updatedTemplate.connections[connectionId] = {
              "name": `${targetName}_connection`,
              ...formData.target.connection
            };
          }

          updatedTemplate.targets[targetId] = targetData;
          
          // Find the last transformation to make this dependent on
          const lastTransformation = updatedTemplate.transformations.length > 0
            ? updatedTemplate.transformations[updatedTemplate.transformations.length - 1]
            : null;
            
          // Find the writer transformation if it exists
          const writerIndex = updatedTemplate.transformations.findIndex(
            (t: any) => t.transformation === 'Target' && t.name === 'write_output'
          );
          
          if (writerIndex >= 0) {
            // Update existing writer transformation
            updatedTemplate.transformations[writerIndex].target = updatedTemplate.targets[targetId];
            updatedTemplate.transformations[writerIndex].file_type = formData.file_type;
            updatedTemplate.transformations[writerIndex].write_options = formData.write_options;
          } else {
            // Create a new writer transformation
            const writerTransformation = {
              "name": "write_output",
              "dependent_on": lastTransformation ? [lastTransformation.name] : [],
              "transformation": "Target",
              "target": updatedTemplate.targets[targetId],
              "file_type": formData.file_type,
              "write_options": formData.write_options || {
                "header": true,
                "sep": ","
              }
            };
            
            // Add the new writer transformation
            updatedTemplate.transformations.push(writerTransformation);
          }
        }
        break;
    }

    // Ensure all sources and connections referenced in transformations exist
    // This is called again to handle any transformations that might have been added in the switch statement
    const finalTemplate = ensureSourcesAndConnectionsExist(updatedTemplate);

    // Update the pipeline template
    setPipelineJson(finalTemplate);

    // Log the updated template for debugging
    console.log("Updated pipeline template with form data:", finalTemplate);
    let optimised: any = await convertToRefBasedSchema(finalTemplate)
    console.log("Updated optimised with form data:", optimised);
    // console.log("Updated optimised with form data:", typeof optimised);
    makePipeline({ pipeline_definition: optimised });

  };


  // Wrap the onSubmit function to also update the pipeline template
  const handleSubmit = (formData: any) => {
    // Call the original onSubmit function
    onSubmit(formData);

    // Update the pipeline template if pipelineJson is available and updatePipelineTemplate is true
    if (pipelineJson && updatePipelineTemplate) {
      updatePipelineTemplateWithFormData(formData);
    } else {
      console.warn('Pipeline JSON not available or updatePipelineTemplate is false. Pipeline template not updated.');
    }
  };

  return (
    <SimpleJSONSchemaForm
      schema={schema}
      formData={processInitialValues()}
      onSubmit={handleSubmit}
      submitLabel={submitLabel}
    />
  );
};

export default SchemaFormLoader;