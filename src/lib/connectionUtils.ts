/**
 * Utility functions for handling connection configuration data
 */

export interface ConnectionData {
    connection_config_id?: string | number;
    id?: string | number;
    name?: string;
    connection_name?: string;
    connection_config_name?: string;
    custom_metadata?: any;
    [key: string]: any;
}

export interface ConnectionConfigList {
    id: string | number;
    connection_config_name?: string;
    name?: string;
    custom_metadata?: any;
    [key: string]: any;
}

/**
 * Extracts and normalizes the connection config ID from various possible sources
 * @param connectionData - The connection data object
 * @param connectionConfigList - List of available connections for lookup
 * @param fallbackName - Fallback name to use if no ID is found
 * @returns The normalized connection config ID as a string
 */
export const extractConnectionConfigId = (
    connectionData: ConnectionData | null | undefined,
    connectionConfigList?: ConnectionConfigList[],
    fallbackName?: string
): string => {
    console.log('🔧 extractConnectionConfigId - Input:', {
        connectionData,
        connectionConfigListCount: connectionConfigList?.length || 0,
        fallbackName,
        connectionDataKeys: connectionData ? Object.keys(connectionData) : [],
        connectionConfigIdType: typeof connectionData?.connection_config_id,
        connectionConfigIdValue: connectionData?.connection_config_id
    });

    // Try to extract connection config ID from the connection data itself
    // Handle case where connection_config_id might be an object
    let extractedId = connectionData?.connection_config_id;
    
    // If connection_config_id is an object, try to extract the actual ID from it
    if (extractedId && typeof extractedId === 'object') {
        console.log('🔧 extractConnectionConfigId - connection_config_id is an object:', extractedId);
        extractedId = extractedId.id || extractedId.connection_config_id || extractedId.name;
    }
    
    // If still no ID, try other fields
    if (!extractedId) {
        extractedId = connectionData?.id || 
                     connectionData?.name || 
                     connectionData?.connection_name || 
                     connectionData?.connection_config_name;
    }

    console.log('🔧 extractConnectionConfigId - Extracted from connection data:', {
        extractedId,
        connection_config_id: connectionData?.connection_config_id,
        id: connectionData?.id,
        name: connectionData?.name,
        connection_name: connectionData?.connection_name,
        connection_config_name: connectionData?.connection_config_name
    });

    // If we have a connection config list, try to find the actual database ID
    if (connectionConfigList && Array.isArray(connectionConfigList) && extractedId) {
        console.log('🔧 extractConnectionConfigId - Searching in connection list:', {
            searchingFor: extractedId,
            availableConnections: connectionConfigList.map(conn => ({
                id: conn.id,
                name: conn.connection_config_name || conn.name
            }))
        });

        const foundConnection = connectionConfigList.find(conn => {
            const connId = String(conn.id || '');
            const connName = conn.connection_config_name || conn.name || '';
            const searchId = String(extractedId || '');
            
            // Match by ID or name
            const matchById = connId === searchId;
            const matchByName = connName === searchId;
            
            console.log('🔧 extractConnectionConfigId - Checking connection:', {
                conn: { id: conn.id, name: connName },
                searchId,
                matchById,
                matchByName
            });
            
            return matchById || matchByName;
        });

        if (foundConnection) {
            console.log('🔧 extractConnectionConfigId - Found connection in list:', {
                foundConnection,
                usingId: foundConnection.id
            });
            return String(foundConnection.id || extractedId || fallbackName || '');
        } else {
            console.log('🔧 extractConnectionConfigId - No matching connection found in list');
        }
    }

    // Convert to string and return, with additional safety check
    let result = extractedId || fallbackName || '';
    
    // Ensure result is always a string, never an object
    if (typeof result === 'object') {
        console.warn('🔧 extractConnectionConfigId - Result is still an object, converting to string:', result);
        if (result && typeof result === 'object') {
            result = result.id || result.connection_config_id || result.name || fallbackName || 'unknown';
        } else {
            result = fallbackName || 'unknown';
        }
    }
    
    // Absolutely final conversion to string
    const finalResult = String(result || fallbackName || 'unknown');
    
    // Emergency check - if String() somehow still produces "[object Object]", use fallback
    if (finalResult === '[object Object]') {
        console.error('🔧 EMERGENCY: String conversion produced [object Object]! Using fallback.');
        const emergencyResult = fallbackName || 'connection_' + Date.now();
        console.log('🔧 extractConnectionConfigId - Emergency result:', emergencyResult);
        return emergencyResult;
    }
    
    console.log('🔧 extractConnectionConfigId - Final result:', finalResult);
    
    return finalResult;
};

/**
 * Creates an enhanced connection object with proper connection config ID
 * @param connectionData - The original connection data
 * @param connectionConfigList - List of available connections for lookup
 * @param fallbackName - Fallback name to use if no ID is found
 * @returns Enhanced connection object with proper connection_config_id
 */
export const enhanceConnectionData = (
    connectionData: ConnectionData | null | undefined,
    connectionConfigList?: ConnectionConfigList[],
    fallbackName?: string
): ConnectionData => {
    console.log('🔧 enhanceConnectionData - Input:', {
        connectionData,
        connectionConfigListCount: connectionConfigList?.length || 0,
        fallbackName,
        connectionDataKeys: connectionData ? Object.keys(connectionData) : []
    });

    if (!connectionData) {
        const fallbackConnection = {
            connection_config_id: fallbackName || ''
        };
        console.log('🔧 enhanceConnectionData - No connection data, returning fallback:', fallbackConnection);
        return fallbackConnection;
    }

    // Extract the proper connection config ID
    const properConnectionConfigId = extractConnectionConfigId(
        connectionData, 
        connectionConfigList, 
        fallbackName
    );

    console.log('🔧 enhanceConnectionData - Extracted connection config ID:', properConnectionConfigId);

    // If we have a connection config list, try to get additional metadata
    let enhancedMetadata = {};
    if (connectionConfigList && Array.isArray(connectionConfigList) && properConnectionConfigId) {
        const foundConnection = connectionConfigList.find(conn => 
            String(conn.id || '') === properConnectionConfigId
        );

        if (foundConnection) {
            // Add metadata from custom_metadata if available
            if (foundConnection.custom_metadata) {
                enhancedMetadata = { ...foundConnection.custom_metadata };
            }
            
            // Also add direct connection properties that might contain connection type
            const directProperties = ['connection_type', 'type', 'database', 'schema', 'host', 'port'];
            directProperties.forEach(prop => {
                if (foundConnection[prop] && !enhancedMetadata[prop]) {
                    enhancedMetadata[prop] = foundConnection[prop];
                }
            });
            
            console.log('🔧 enhanceConnectionData - Adding metadata from connection list:', {
                foundConnection,
                enhancedMetadata,
                hasCustomMetadata: !!foundConnection.custom_metadata,
                directProperties: directProperties.filter(prop => foundConnection[prop])
            });
        } else {
            console.log('🔧 enhanceConnectionData - No connection found for ID:', properConnectionConfigId);
        }
    } else {
        console.log('🔧 enhanceConnectionData - No connection config list provided or no connection config ID');
    }

    // Create enhanced connection object
    const enhancedConnection = {
        ...enhancedMetadata,
        ...connectionData,
        connection_config_id: properConnectionConfigId
    };

    console.log('🔧 enhanceConnectionData - Enhanced connection:', {
        original: connectionData,
        enhanced: enhancedConnection,
        connectionConfigId: properConnectionConfigId,
        hasMetadata: Object.keys(enhancedMetadata).length > 0
    });

    return enhancedConnection;
};

/**
 * Validates that a connection has a proper connection config ID
 * @param connectionData - The connection data to validate
 * @returns True if the connection has a valid connection config ID
 */
export const hasValidConnectionConfigId = (connectionData: ConnectionData | null | undefined): boolean => {
    if (!connectionData) return false;
    
    const id = connectionData.connection_config_id;
    return !!(id && String(id).trim() !== '' && String(id) !== 'undefined' && String(id) !== 'null');
};

/**
 * Finds a connection in the connection config list by various identifiers
 * @param identifier - The identifier to search for (ID, name, etc.)
 * @param connectionConfigList - List of available connections
 * @returns The found connection or null
 */
export const findConnectionById = (
    identifier: string | number | null | undefined,
    connectionConfigList?: ConnectionConfigList[]
): ConnectionConfigList | null => {
    if (!identifier || !connectionConfigList || !Array.isArray(connectionConfigList)) {
        return null;
    }

    const searchId = String(identifier);
    
    return connectionConfigList.find(conn => {
        const connId = String(conn.id || '');
        const connName = conn.connection_config_name || conn.name || '';
        
        return connId === searchId || connName === searchId;
    }) || null;
};