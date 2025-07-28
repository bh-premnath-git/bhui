import { pipelineSchema } from "@bh-ai/schemas";
import { extractConditionalFields, SchemaProperty } from '@/features/designers/pipeline/components/schemaUtils';

// Debug function to examine the pipeline schema structure
export function debugPipelineSchema() {
  console.log('=== PIPELINE SCHEMA DEBUG ===');
  console.log('Full schema:', JSON.stringify(pipelineSchema, null, 2));
  
  if (pipelineSchema?.allOf) {
    console.log('\n=== ENGINE SCHEMAS ===');
    pipelineSchema.allOf.forEach((engineSchema: any, index: number) => {
      console.log(`Engine ${index}:`, engineSchema.if?.properties?.engine_type?.const);
      
      if (engineSchema.then?.properties?.transformations?.items?.items?.allOf) {
        console.log(`Transformations for engine ${engineSchema.if?.properties?.engine_type?.const}:`);
        
        engineSchema.then.properties.transformations.items.allOf.forEach((transformation: any, tIndex: number) => {
          const transformationType = transformation?.if?.properties?.transformation?.const;
          console.log(`  Transformation ${tIndex}: ${transformationType}`);
          
          if (transformation.then) {
            console.log(`    Schema:`, JSON.stringify(transformation.then, null, 4));
          }
        });
      }
    });
  }
}

// Function to debug a specific transformation schema
export function debugTransformationSchema(transformationName: string, engineType: 'pyspark' | 'pyflink' = 'pyspark') {
  console.log(`=== DEBUGGING TRANSFORMATION: ${transformationName} (${engineType}) ===`);
  
  if (!pipelineSchema?.allOf) {
    console.log('No allOf found in pipeline schema');
    return null;
  }
  
  const engineSchema = pipelineSchema.allOf.find((schema: any) => 
    schema.if?.properties?.engine_type?.const === engineType
  );
  
  if (!engineSchema) {
    console.log(`No engine schema found for ${engineType}`);
    return null;
  }
  
  if (!engineSchema.then?.properties?.transformations?.items?.items?.allOf) {
    console.log('No transformations found in engine schema');
    return null;
  }
  
  const transformation = engineSchema.then.properties.transformations.items.allOf.find((t: any) => 
    t.if?.properties?.transformation?.const === transformationName
  );
  
  if (!transformation) {
    console.log(`Transformation ${transformationName} not found`);
    return null;
  }
  
  console.log('Found transformation:', JSON.stringify(transformation, null, 2));
  console.log('Transformation schema (then):', JSON.stringify(transformation.then, null, 2));
  
  // Test conditional field extraction
  if (transformation.then) {
    const conditionalResult = extractConditionalFields(transformation.then);
    console.log('Conditional fields extraction result:');
    console.log('  Base fields:', Object.keys(conditionalResult.baseFields));
    console.log('  Conditional fields:', conditionalResult.conditionalFields.map(cf => ({
      condition: cf.condition,
      fields: Object.keys(cf.schema.properties || {})
    })));
    console.log('  Base required:', conditionalResult.baseRequired);
  }
  
  return transformation.then;
}