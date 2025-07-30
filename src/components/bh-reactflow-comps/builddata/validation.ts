interface ValidationResult {
    isValid: boolean;
    warnings: string[];
    status: 'none' | 'valid' | 'warning' | 'error';
    formOpened?: boolean;
}

export const validateFormData = (
    formData: any, 
    schema: any, 
    isSource: boolean, 
    sourceData: any, 
    formOpened: boolean = false
): ValidationResult => {
    let warnings: string[] = [];
    let isValid = true;
    let status: 'none' | 'valid' | 'warning' | 'error' = 'none';

    // Special validation for target nodes
    if (formData?.transformation?.toLowerCase() === "target") {
        if (!sourceData) {
            return { 
                isValid: false, 
                warnings: ['Target configuration is missing'], 
                status: 'error',
                formOpened 
            };
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
            if (!sourceData.connection) {
                warnings.push('Connection configuration is required');
                isValid = false;
            }
        }

        // Determine status based on validation results and form state
        if (warnings.length === 0) {
            status = 'valid';
        } else if (formOpened && Object.values(mandatoryFields).some(value => value)) {
            status = 'warning';
        } else {
            status = 'error';
        }

        return { isValid, warnings, status, formOpened };
    }

    // Special validation for source nodes
    if (isSource) {
        if (!sourceData) {
            isValid = false;
            warnings.push("Source configuration is missing");
            return { isValid, warnings, status: 'error', formOpened };
        }

        // Source nodes are valid if they have source data
        return { isValid: true, warnings: [], status: 'valid', formOpened };
    }

    // For non-source nodes, check if formData exists
    if (!formData) {
        return { isValid: false, warnings: ['Form not filled'], status: 'error', formOpened };
    }

    // Check schema requirements if they exist
    if (schema?.required) {
        schema.required.forEach((field: string) => {
            const fieldValue = formData[field];
            let isEmpty = false;
            
            if (!fieldValue) {
                isEmpty = true;
            } else if (Array.isArray(fieldValue) && fieldValue.length === 0) {
                isEmpty = true;
            } else if (typeof fieldValue === 'string' && fieldValue.trim() === '') {
                isEmpty = true;
            } else if (typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
                // For objects, check if all required properties are empty
                // Special handling for lookup_conditions
                if (field === 'lookup_conditions') {
                    const hasColumnName = fieldValue.column_name && fieldValue.column_name.trim() !== '';
                    const hasLookupWith = fieldValue.lookup_with && fieldValue.lookup_with.trim() !== '';
                    isEmpty = !hasColumnName || !hasLookupWith;
                } else {
                    // For other objects, check if it's empty or has no meaningful values
                    const values = Object.values(fieldValue);
                    isEmpty = values.length === 0 || values.every(val => 
                        val === null || val === undefined || val === '' || 
                        (Array.isArray(val) && val.length === 0)
                    );
                }
            }
            
            if (isEmpty) {
                // Create more user-friendly field names by replacing underscores with spaces and capitalizing
                const fieldName = field
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                
                warnings.push(`${fieldName} is required`);
                isValid = false;
            }
        });
    }

    // Determine status based on validation results and form state
    if (warnings.length === 0 && Object.keys(formData).length > 0) {
        status = 'valid';
    } else if (formOpened && Object.keys(formData).length > 0) {
        // If form has been opened and some data exists but not all required fields are filled
        status = 'warning';
    } else {
        status = 'error';
    }

    return { isValid, warnings, status, formOpened };
}; 