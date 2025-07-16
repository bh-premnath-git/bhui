// Test utility to demonstrate error handling
export const testErrorExtraction = () => {
    const mockError = {
        response: {
            data: {
                detail: "<_InactiveRpcError of RPC that terminated with:\n\tstatus = StatusCode.INTERNAL\n\tdetails = \"'connection' is a required property\n\nFailed validating 'required' in schema['allOf'][0]['then']['properties']['targets']['patternProperties']['^[a-zA-Z0-9_]+$']:\n    {'$schema': 'http://json-schema.org/draft-07/schema#',\n     'description': 'Schema for Target',\n     'type': 'object',\n     'title': 'Target',\n     'properties': {'name': {'type': 'string',\n                             'description': 'Target Name',\n                             'minLength': 1},\n                    'target_type': {'type': 'string',\n                                    'enum': ['File', 'Relational']},\n                    'connection': {'type': 'object',\n                                   'items': {'$ref': 'Connection.json'}},\n                    'load_mode': {'type': 'string',\n                                  'enum': ['append',\n                                           'merge',\n                                           'overwrite',\n                                           'ignore',\n                                           'error'],\n                                  'default': 'append'},\n                    'merge_keys': {'type': 'array',\n                                   'items': {'type': 'string'},\n                                   'minItems': 1}},\n     'required': ['name', 'target_type', 'connection', 'load_mode'],\n     'allOf': [{'if': {'properties': {'load_mode': {'const': 'merge'}}},\n                'then': {'required': ['merge_keys']}},\n               {'if': {'properties': {'target_type': {'const': 'File'}}},\n                'then': {'properties': {'file_name': {'type': 'string',\n                                                      'minLength': 1}},\n                         'required': ['file_name']}},\n               {'if': {'properties': {'target_type': {'const': 'Relational'}}},\n                'then': {'properties': {'table_name': {'type': 'string',\n                                                       'minLength': 1}},\n                         'required': ['table_name']}}]}\n\nOn instance['targets']['target0']:\n    {'name': 'target0',\n     'target_type': 'Relational',\n     'table_name': 'target0',\n     'load_mode': 'append'}\"\n\tdebug_error_string = \"UNKNOWN:Error received from peer ipv4:192.168.65.254:15003 {grpc_status:13, grpc_message:\"\\'connection\\' is a required property\\n\\nFailed validating \\'required\\' in schema[\\'allOf\\'][0][\\'then\\'][\\'properties\\'][\\'targets\\'][\\'patternProperties\\'][\\'^[a-zA-Z0-9_]+$\\']:\\n    {\\'$schema\\': \\'http://json-schema.org/draft-07/schema#\\',\\n     \\'description\\': \\'Schema for Target\\',\\n     \\'type\\': \\'object\\',\\n     \\'title\\': \\'Target\\',\\n     \\'properties\\': {\\'name\\': {\\'type\\': \\'string\\',\\n                             \\'description\\': \\'Target Name\\',\\n                             \\'minLength\\': 1},\\n                    \\'target_type\\': {\\'type\\': \\'string\\',\\n                                    \\'enum\\': [\\'File\\', \\'Relational\\']},\\n                    \\'connection\\': {\\'type\\': \\'object\\',\\n                                   \\'items\\': {\\'$ref\\': \\'Connection.json\\'}},\\n                    \\'load_mode\\': {\\'type\\': \\'string\\',\\n                                  \\'enum\\': [\\'append\\',\\n                                           \\'merge\\',\\n                                           \\'overwrite\\',\\n                                           \\'ignore\\',\\n                                           \\'error\\'],\\n                                  \\'default\\': \\'append\\'},\\n                    \\'merge_keys\\': {\\'type\\': \\'array\\',\\n                                   \\'items\\': {\\'type\\': \\'string\\'},\\n                                   \\'minItems\\': 1}},\\n     \\'required\\': [\\'name\\', \\'target_type\\', \\'connection\\', \\'load_mode\\'],\\n     \\'allOf\\': [{\\'if\\': {\\'properties\\': {\\'load_mode\\': {\\'const\\': \\'merge\\'}}},\\n                \\'then\\': {\\'required\\': [\\'merge_keys\\']}},\\n               {\\'if\\': {\\'properties\\': {\\'target_type\\': {\\'const\\': \\'File\\'}}},\\n                \\'then\\': {\\'properties\\': {\\'file_name\\': {\\'type\\': \\'string\\',\\n                                                      \\'minLength\\': 1}},\\n                         \\'required\\': [\\'file_name\\']}},\\n               {\\'if\\': {\\'properties\\': {\\'target_type\\': {\\'const\\': \\'Relational\\'}}},\\n                \\'then\\': {\\'properties\\': {\\'table_name\\': {\\'type\\': \\'string\\',\\n                                                       \\'minLength\\': 1}},\\n                         \\'required\\': [\\'table_name\\']}}]}\\n\\nOn instance[\\'targets\\'][\\'target0\\']:\\n    {\\'name\\': \\'target0\\',\\n     \\'target_type\\': \\'Relational\\',\\n     \\'table_name\\': \\'target0\\',\\n     \\'load_mode\\': \\'append\\'}\"}\"\n>"
            }
        },
        message: "Request failed with status code 500"
    };

    // Test the error extraction logic
    const errorDetail = mockError.response?.data?.detail || '';
    const errorMessage = mockError.message || '';
    
    let detailedErrorInfo = '';
    let formattedErrorInfo = '';
    
    if (errorDetail) {
        try {
            // Try to extract the meaningful error from the detail field
            if (errorDetail.includes('_InactiveRpcError')) {
                // Extract the actual error message from the RPC error
                const detailsMatch = errorDetail.match(/details = "([^"]+)"/);
                if (detailsMatch && detailsMatch[1]) {
                    const cleanedDetails = detailsMatch[1]
                        .replace(/\\n/g, '\n')
                        .replace(/\\'/g, "'")
                        .replace(/\\"/g, '"');
                    detailedErrorInfo = cleanedDetails;
                    
                    // Format the error for better readability
                    if (cleanedDetails.includes('Failed validating')) {
                        const lines = cleanedDetails.split('\n');
                        const mainError = lines[0];
                        const instanceMatch = cleanedDetails.match(/On instance\['[^']+'\]\['([^']+)'\]:/);
                        const instanceName = instanceMatch ? instanceMatch[1] : 'unknown';
                        
                        formattedErrorInfo = `Validation Error on '${instanceName}': ${mainError}`;
                        
                        // Add more details if available
                        if (lines.length > 1) {
                            formattedErrorInfo += `\n\nAdditional Details:\n${lines.slice(1).join('\n')}`;
                        }
                    } else {
                        formattedErrorInfo = cleanedDetails;
                    }
                }
            }
        } catch (parseError) {
            console.error('Error parsing error details:', parseError);
        }
    }

    console.log('Original error:', mockError);
    console.log('Formatted error info:', formattedErrorInfo);
    
    return {
        errorMessage,
        detailedErrorInfo,
        formattedErrorInfo
    };
};

// Test function to verify error extraction
export const runErrorTest = () => {
    const result = testErrorExtraction();
    console.log('Test Results:');
    console.log('Error Message:', result.errorMessage);
    console.log('Detailed Error Info:', result.detailedErrorInfo);
    console.log('Formatted Error Info:', result.formattedErrorInfo);
    return result;
};