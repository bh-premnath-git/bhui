export class NodeTransformer {
    private static readonly NODE_MAPPINGS: { [key: string]: { [key: string]: string } } = {
        'HTTP Sensor': {
            'end_point': 'endpoint',
            'request_parameters': 'request_params',
            'poll_interval': 'poke_interval',
            'request_timeout': 'timeout',
            'validate_response': 'responce_check_code'
        },
        'S3 Sensor': {
            's3_paths': 's3path',
            'sensor_timeout': 'timeout',
            'validate_response1': 'responce_check_code',
            'connection_name1': 'connection_name',
            'bucket_name': 'bucket_name'
        }
    };

    private static readonly NODE_NAME_MAPPINGS: { [key: string]: string } = {
        'S3 Sensor': 'S3Sensor',
        'HTTP Sensor': 'HTTPSensor'
    };

    private static readonly NODE_SPECIFIC_TRANSFORMS: {
        [key: string]: (val: any, uiType: string) => any
    } = {
        'HTTP Sensor': (val: any, uiType: string) => {
            if (uiType === 'json') {
                return typeof val === 'string' ? val : JSON.stringify(val, null, 2);
            }
            return val;
        },
        'S3 Sensor': (val: any, uiType: string) => {
            if (uiType === 'text' && Array.isArray(val)) {
                return val.join(',');
            }
            if (uiType === 'json') {
                return typeof val === 'string' ? val : JSON.stringify(val, null, 2);
            }
            return val;
        }
    };

    private static readonly POST_PROCESSORS: {
        [key: string]: (data: any) => any
    } = {
        'HTTP Sensor': (data: any) => {
            data.timeout = data.timeout;
            data.poke_interval = data.poke_interval;
            return data;
        },
        'S3 Sensor': (data: any) => {
            // Convert array path to single string
            if (Array.isArray(data.s3path)) {
                data.s3path = data.s3path[0];
            }

            // Set default timeout if not provided
            if (!data.timeout) {
                data.timeout = 600;
            }

            // Ensure boolean fields are actually booleans
            data.verify_ssl = Boolean(data.verify_ssl);
            data.wildcard_match = Boolean(data.wildcard_match);

            // Remove bucket if it's empty
            if (!data.bucket_name || data.bucket_name.trim() === '') {
                delete data.bucket_name;
            }

            return data;
        }
    };

    private static getKeyMapping(nodeName: string): { [key: string]: string } {
        return this.NODE_MAPPINGS[nodeName] || {};
    }

    private static transformPropertyValue(value: any, uiType: string, nodeName: string): any {
        // Apply node-specific transformation if it exists
        if (this.NODE_SPECIFIC_TRANSFORMS[nodeName]) {
            value = this.NODE_SPECIFIC_TRANSFORMS[nodeName](value, uiType);
        }

        switch (uiType) {
            case 'number':
                return value ? Number(value) : 0;
            case 'checkbox':
                return Boolean(value);
            case 'drop_down':
                return value || '';
            case 'json':
                if (typeof value === 'string') {
                    try {
                        JSON.parse(value);
                        return value;
                    } catch {
                        return '{}';
                    }
                }
                return JSON.stringify(value || {}, null, 2);
            default:
                return value || '';
        }
    }

    static transform(nodeConfig: any, formValues: { [key: string]: any }): { [key: string]: any } {
        const keyMapping = this.getKeyMapping(nodeConfig.node_name);
        const transformedData: { [key: string]: any } = {
            node_name: this.NODE_NAME_MAPPINGS[nodeConfig.node_name] || nodeConfig.node_name
        };

        nodeConfig.properties.forEach((prop: any) => {
            const originalKey = prop.property_key;
            const transformedKey = keyMapping[originalKey] || originalKey;
            const value = formValues[originalKey];

            transformedData[transformedKey] = this.transformPropertyValue(
                value,
                prop.ui_type,
                nodeConfig.node_name
            );
        });

        // Apply post-processing if available for this node type
        if (this.POST_PROCESSORS[nodeConfig.node_name]) {
            return this.POST_PROCESSORS[nodeConfig.node_name](transformedData);
        }

        return transformedData;
    }
}