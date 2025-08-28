import { UINode } from "./pipelineJsonConverter";
import { Node, Edge } from '@xyflow/react';

interface ValidationResult {
    isValid: boolean;
    errors: string[];
    logs: PipelineLog[];
}

interface PipelineLog {
    timestamp: string;
    message: string;
    level: 'info' | 'error' | 'warning';
}


export const validatePipelineConnections = (nodes: UINode[], edges: Edge[]): ValidationResult => {
    const errors: string[] = [];
    const logs: PipelineLog[] = [];
    const timestamp = new Date().toISOString();

    // Add initial validation log
    logs.push({
        timestamp,
        message: 'Starting pipeline validation...',
        level: 'info'
    });

    // Validate overall pipeline structure
    if (nodes.length === 0) {
        logs.push({
            timestamp,
            message: 'Pipeline is empty - no nodes found',
            level: 'error'
        });
        errors.push('Pipeline is empty - no nodes found');
        return { isValid: false, errors, logs };
    }

    // Check for at least one reader and one target
    const hasReader = nodes.some(node => node.id.startsWith('Reader_'));
    const hasTarget = nodes.some(node => node.id.startsWith('Target_'));

    if (!hasReader) {
        logs.push({
            timestamp,
            message: 'Pipeline must contain at least one Reader node',
            level: 'error'
        });
        errors.push('Pipeline must contain at least one Reader node');
    } else {
        logs.push({
            timestamp,
            message: 'Reader node(s) found in pipeline',
            level: 'info'
        });
    }

    if (!hasTarget) {
        logs.push({
            timestamp,
            message: 'Pipeline must contain at least one Target node',
            level: 'error'
        });
        errors.push('Pipeline must contain at least one Target node');
    } else {
        logs.push({
            timestamp,
            message: 'Target node(s) found in pipeline',
            level: 'info'
        });
    }

    nodes.forEach(node => {
        // Node validation start log
        logs.push({
            timestamp,
            message: `Validating node: ${node.data.title || node.data.label}`,
            level: 'info'
        });

        // Reader node validation
        if (node.id.startsWith('Reader_')) {
            const hasOutput = edges.some(edge => edge.source === node.id);
            if (!hasOutput) {
                const error = `Reader node "${node.data.title || node.data.label}" is not connected to any transformation`;
                errors.push(error);
                logs.push({
                    timestamp,
                    message: error,
                    level: 'error'
                });
            } else {
                logs.push({
                    timestamp,
                    message: `Reader node "${node.data.title || node.data.label}" is properly connected`,
                    level: 'info'
                });
            }
            return;
        }

        // Target node validation
        if (node.id.startsWith('Target_')) {
            const hasInput = edges.some(edge => edge.target === node.id);
            if (!hasInput) {
                const error = `Target node "${node.data.title || node.data.label}" is not connected to any transformation`;
                errors.push(error);
                logs.push({
                    timestamp,
                    message: error,
                    level: 'error'
                });
            } else {
                logs.push({
                    timestamp,
                    message: `Target node "${node.data.title || node.data.label}" is properly connected`,
                    level: 'info'
                });
            }
            return;
        }

        // Transformation node validation
        const incomingEdges = edges.filter(edge => edge.target === node.id);
        const outgoingEdges = edges.filter(edge => edge.source === node.id);
        const requiredInputs = node.data.ports.inputs;
        const maxInputs = node.data.ports.maxInputs;

        // Input validation
        if (incomingEdges.length === 0) {
            const error = `Node "${node.data.title || node.data.label}" has no input connections`;
            errors.push(error);
            logs.push({
                timestamp,
                message: error,
                level: 'error'
            });
        } else if (incomingEdges.length < requiredInputs) {
            const warning = `Node "${node.data.title || node.data.label}" requires ${requiredInputs} inputs but has only ${incomingEdges.length}`;
            errors.push(warning);
            logs.push({
                timestamp,
                message: warning,
                level: 'warning'
            });
        } else if (maxInputs && incomingEdges.length > maxInputs) {
            const error = `Node "${node.data.title || node.data.label}" exceeds maximum allowed inputs (${maxInputs})`;
            errors.push(error);
            logs.push({
                timestamp,
                message: error,
                level: 'error'
            });
        } else {
            logs.push({
                timestamp,
                message: `Node "${node.data.title || node.data.label}" has valid input connections (${incomingEdges.length}/${requiredInputs})`,
                level: 'info'
            });
        }

        // Output validation
        if (outgoingEdges.length === 0) {
            const error = `Node "${node.data.title || node.data.label}" has no output connections`;
            errors.push(error);
            logs.push({
                timestamp,
                message: error,
                level: 'error'
            });
        } else {
            logs.push({
                timestamp,
                message: `Node "${node.data.title || node.data.label}" has valid output connections`,
                level: 'info'
            });
        }
    });

    // Add final validation summary
    const successCount = logs.filter(log => log.level === 'info').length;
    const warningCount = logs.filter(log => log.level === 'warning').length;
    const errorCount = logs.filter(log => log.level === 'error').length;

    logs.push({
        timestamp,
        message: `Validation complete: ${successCount} successes, ${warningCount} warnings, ${errorCount} errors`,
        level: errors.length === 0 ? 'info' : 'error'
    });

    return {
        isValid: errors.length === 0,
        errors,
        logs
    };
};