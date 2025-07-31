// Temporary file to examine schema structure
const { pipelineSchema } = require('@bh-ai/schemas');

console.log('Pipeline Schema Keys:', Object.keys(pipelineSchema));
console.log('Properties:', Object.keys(pipelineSchema.properties || {}));

if (pipelineSchema.allOf) {
  console.log('AllOf length:', pipelineSchema.allOf.length);
  
  pipelineSchema.allOf.forEach((schema, index) => {
    console.log(`\nSchema ${index}:`);
    if (schema.if && schema.if.properties && schema.if.properties.engine_type) {
      console.log('  Engine type:', schema.if.properties.engine_type.const);
    }
    
    if (schema.then && schema.then.properties) {
      console.log('  Then properties:', Object.keys(schema.then.properties));
      
      if (schema.then.properties.targets) {
        console.log('  Targets structure:', JSON.stringify(schema.then.properties.targets, null, 2));
      }
    }
  });
}