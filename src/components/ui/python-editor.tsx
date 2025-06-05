import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface PythonEditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  containerClassName?: string;
  minHeight?: string;
}

export const PythonEditor = React.forwardRef<HTMLTextAreaElement, PythonEditorProps>(
  ({ 
    label, 
    description, 
    error, 
    value, 
    onChange, 
    className, 
    containerClassName,
    minHeight = "300px",
    ...props 
  }, ref) => {
    const [editorValue, setEditorValue] = useState(value || '');

    useEffect(() => {
      setEditorValue(value || '');
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setEditorValue(newValue);
      onChange(newValue);
    };

    // Sample Python code template
    const sampleCode = `# Example PySpark transformation
from pyspark.sql import functions as F

def transform(df):
    """
    Custom PySpark transformation function.
    
    Args:
        df: Input DataFrame
        
    Returns:
        Transformed DataFrame
    """
    # Your transformation code here
    # Example: Add a new column
    result_df = df.withColumn("new_column", F.lit("example"))
    
    return result_df
`;

    const insertSampleCode = () => {
      setEditorValue(sampleCode);
      onChange(sampleCode);
    };

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <div className="flex items-center gap-2">
            <Label htmlFor={props.id}>{label}</Label>
            {description && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">{description}</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
        
        <div className="relative">
          <Textarea
            ref={ref}
            value={editorValue}
            onChange={handleChange}
            className={cn(
              "font-mono text-sm p-4 resize-y",
              "bg-slate-950 text-slate-50 dark:bg-slate-950 dark:text-slate-50",
              "border-slate-700 focus:border-slate-500",
              "placeholder:text-slate-400",
              { "border-red-500 focus:border-red-500": error },
              className
            )}
            style={{ minHeight }}
            {...props}
          />
          
          <div className="absolute top-2 right-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={insertSampleCode}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            >
              Insert Sample Code
            </Button>
          </div>
        </div>
        
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

PythonEditor.displayName = "PythonEditor";