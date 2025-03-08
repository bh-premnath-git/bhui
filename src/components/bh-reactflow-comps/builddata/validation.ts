interface ValidationResult {
    isValid: boolean;
    warnings: string[];
}

export const validateFormData = (formData: any, schema: any, isSource: boolean, sourceData: any): ValidationResult => {
    let warnings: string[] = [];
    let isValid = true;

    // Special validation for target nodes
    if (formData?.transformation?.toLowerCase() === "target") {
        if (!sourceData) {
            return { isValid: false, warnings: ['Target configuration is missing'] };
        }

        // Check mandatory fields for target
        const mandatoryFields = {
            'name': sourceData.name,
            'target_type': sourceData.target_type,
            'connection': sourceData.connection,
            'load_mode': sourceData.load_mode
        };

        // Validate mandatory fields
        Object.entries(mandatoryFields).forEach(([field, value]) => {
            if (!value) {
                warnings.push(`${field} is required`);
                isValid = false;
            }
        });

        // Additional validation for connection
        if (sourceData.connection) {
            if (!sourceData.connection.connection_config_id) {
                warnings.push('Connection configuration is required');
                isValid = false;
            }
        }

        // If there are warnings but some fields are filled
        if (warnings.length > 0 && Object.values(mandatoryFields).some(value => value)) {
            return { isValid: false, warnings };
        }

        // If all mandatory fields are filled
        if (warnings.length === 0) {
            return { isValid: true, warnings: [] };
        }

        return { isValid: false, warnings };
    }

    // Special validation for source nodes
    if (isSource) {
        if (!sourceData) {
            isValid = false;
            warnings.push("Source configuration is missing");
            return { isValid, warnings };
        }

        // Source nodes are valid if they have source data
        return { isValid: true, warnings: [] };
    }

    // For non-source nodes, check if formData exists and has required fields
    if (!formData) {
        return { isValid: false, warnings: ['Form not filled'] };
    }

    // Check schema requirements if they exist
    if (schema?.required) {
        schema.required.forEach((field: string) => {
            if (!formData[field] ||
                (Array.isArray(formData[field]) && formData[field].length === 0)) {
                warnings.push(`Required field "${field}" is missing`);
                isValid = false;
            }
        });
    }

    // If formData exists and has values, consider it valid even without schema
    if (Object.keys(formData).length > 0) {
        isValid = true;
        warnings = [];
    }

    return { isValid, warnings };
}; 