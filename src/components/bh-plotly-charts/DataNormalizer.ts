
import { IDataNormalizer, IFieldTypeDetector, NormalizedData, TableContent } from "@/types/plotly/systemtype";

export class DataNormalizer implements IDataNormalizer {
    constructor(private fieldDetector: IFieldTypeDetector) { }

    normalize(data: TableContent): NormalizedData {
        if (!data?.column_names?.length || !data?.column_values?.length) {
            return { rows: [], fieldTypes: {}, numericFields: [], stringFields: [] };
        }

        const rows = data.column_values.map(row => {
            const obj: any = {};
            data.column_names.forEach((colName, idx) => {
                obj[colName] = row[idx];
            });
            return obj;
        });

        const fieldTypes = this.fieldDetector.detectTypes(rows);
        const numericFields = Object.keys(fieldTypes).filter(k => fieldTypes[k] === 'number');
        const stringFields = Object.keys(fieldTypes).filter(k => fieldTypes[k] === 'string');

        return { rows, fieldTypes, numericFields, stringFields };
    }
}