import React, { useMemo } from 'react';
import { DynamicTransformationForm } from './DynamicTransformationForm';
import { usePipelineModules } from '@/hooks/usePipelineModules';

interface DynamicPipelineFormWrapperProps {
  schema: any;
  sourceColumns: any[];
  onClose: () => void;
  currentNodeId: string;
  initialValues?: any;
  nodes: any[];
  edges: any[];
  pipelineDtl?: any;
  onSubmit: (values: any) => void;
  selectedEngineType: 'pyspark' | 'flink';
}

export function DynamicPipelineFormWrapper({
  schema,
  sourceColumns,
  onClose,
  currentNodeId,
  initialValues,
  nodes,
  edges,
  pipelineDtl,
  onSubmit,
  selectedEngineType
}: DynamicPipelineFormWrapperProps) {
  
  // Extract transformation type and display name from schema
  const transformationType = useMemo(() => {
    if (schema?.nodeId) {
      // Try to get from node data
      const node = nodes.find(n => n.id === schema.nodeId);
      if (node?.data?.ui_properties?.meta?.type) {
        return node.data.ui_properties.meta.type;
      }
    }
    
    // Fallback to schema title or type
    return schema?.type || schema?.title || 'unknown';
  }, [schema, nodes]);

  const transformationDisplayName = useMemo(() => {
    if (schema?.nodeId) {
      // Try to get from node data
      const node = nodes.find(n => n.id === schema.nodeId);
      if (node?.data?.ui_properties?.module_name) {
        return node.data.ui_properties.module_name;
      }
    }
    
    // Fallback to schema title
    return schema?.title || transformationType;
  }, [schema, nodes, transformationType]);

  const handleSave = async (data: any) => {
    try {
      // Call the original onSubmit with the transformed data
      await onSubmit(data);
    } catch (error) {
      console.error('Error saving transformation:', error);
      throw error;
    }
  };

  const handleBack = () => {
    onClose();
  };

  return (
    <DynamicTransformationForm
      transformationType={transformationType}
      transformationDisplayName={transformationDisplayName}
      selectedEngineType={selectedEngineType}
      onBack={handleBack}
      onSave={handleSave}
      isEdit={!!initialValues}
      formData={initialValues}
      mode={initialValues ? 'edit' : 'new'}
      currentNodeId={currentNodeId}
      nodes={nodes}
      edges={edges}
      sourceColumns={sourceColumns}
    />
  );
}