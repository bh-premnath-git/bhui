import { useState } from 'react';
import { TransformationForm } from './TransformationForm';
import { useTransformationConfig } from '@/hooks/useTransformationSchema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TransformationFormWrapperProps {
  transformationType: string;
  selectedEngineType?: 'pyspark' | 'flink';
  onBack?: () => void;
  onSave?: (data: any) => void;
  isEdit?: boolean;
  formData?: any;
  mode?: 'edit' | 'new';
}

export function TransformationFormWrapper({
  transformationType,
  selectedEngineType = 'pyspark',
  onBack,
  onSave,
  isEdit = false,
  formData,
  mode = 'new'
}: TransformationFormWrapperProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    schema,
    operator,
    module,
    isValid,
    displayName,
    description,
    moduleInfo
  } = useTransformationConfig(transformationType, selectedEngineType);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Default back behavior - you might want to navigate to a different route
      console.log('Back button clicked - no onBack handler provided');
    }
  };

  const handleSave = async (data: any) => {
    try {
      setIsLoading(true);
      
      if (onSave) {
        await onSave(data);
      } else {
        // Default save behavior - log the data
        console.log('Transformation data saved:', data);
        toast.success(`${displayName} transformation ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
      }
    } catch (error) {
      console.error('Error saving transformation:', error);
      toast.error('Failed to save transformation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show error state if transformation type is not found
  if (!isValid) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Transformation Not Found</h1>
            <p className="text-muted-foreground">
              Could not find configuration for transformation type: {transformationType}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Configuration Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                The transformation type "{transformationType}" is not available for the selected engine type "{selectedEngineType}".
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Requested Type:</span>
                <Badge variant="destructive">{transformationType}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Engine Type:</span>
                <Badge variant="outline">{selectedEngineType}</Badge>
              </div>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TransformationForm
      transformationType={transformationType}
      transformationDisplayName={displayName}
      transformationSchema={schema}
      onBack={handleBack}
      onSave={handleSave}
      isEdit={isEdit}
      formData={formData}
      mode={mode}
    />
  );
}

// Example usage component that shows how to select and configure transformations
export function TransformationSelector({
  selectedEngineType = 'pyspark',
  onTransformationSelect
}: {
  selectedEngineType?: 'pyspark' | 'flink';
  onTransformationSelect?: (transformationType: string) => void;
}) {
  const { modules } = useTransformationConfig('', selectedEngineType);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Transformation</h2>
        <p className="text-muted-foreground">
          Choose a transformation type to configure for your pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <Card key={module.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div 
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: module.color }}
                >
                  {module.icon && (
                    <span className="text-sm">{module.icon}</span>
                  )}
                </div>
                {module.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {module.operators.length} operator{module.operators.length !== 1 ? 's' : ''} available
                </p>
                <div className="space-y-2">
                  {module.operators.map((operator: any) => (
                    <Button
                      key={operator.type}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onTransformationSelect?.(operator.type)}
                    >
                      <Settings className="h-3 w-3 mr-2" />
                      {operator.type}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}