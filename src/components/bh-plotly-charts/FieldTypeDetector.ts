import { IFieldTypeDetector, FieldTypes } from "@/types/plotly/systemtype";

export class FieldTypeDetector implements IFieldTypeDetector {
    detectTypes(data: any[]): FieldTypes {
      if (!data.length) return {};
      
      const types: FieldTypes = {};
      const sampleSize = Math.min(10, data.length);
      
      Object.keys(data[0] || {}).forEach(field => {
        const samples = data.slice(0, sampleSize)
          .map(row => row[field])
          .filter(val => val !== null && val !== undefined);
        
        if (samples.length === 0) {
          types[field] = 'string';
          return;
        }
        
        const isNumeric = samples.every(val => 
          typeof val === 'number' || (!isNaN(Number(val)) && val !== '')
        );
        
        types[field] = isNumeric ? 'number' : 'string';
      });
      
      return types;
    }
  }