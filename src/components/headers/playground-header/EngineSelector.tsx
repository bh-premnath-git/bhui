import React from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import { setSelectedEngineType } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { Zap, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface EngineSelectorProps {
  className?: string;
}

const engineOptions = [
  {
    id: 'pyspark' as const,
    label: 'PySpark',
    description: 'Apache Spark with Python API',
    icon: Zap,
    color: 'text-orange-600'
  },
  {
    id: 'flink' as const,
    label: 'Apache Flink',
    description: 'Stream processing framework',
    icon: Activity,
    color: 'text-blue-600'
  }
];

export function EngineSelector({ className }: EngineSelectorProps) {
  const dispatch = useAppDispatch();
  const { selectedEngineType } = useAppSelector((state: RootState) => state.buildPipeline);

  const handleEngineSelect = (engineType: 'pyspark' | 'pyflink') => {
    dispatch(setSelectedEngineType(engineType));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-900">Engine Type</h4>
        <p className="text-xs text-gray-500">Choose your processing engine</p>
      </div>
      
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {engineOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = selectedEngineType === option.id;
          
          return (
            <label
              key={option.id}
              className={cn(
                "relative flex cursor-pointer rounded-lg border p-4 transition-all duration-200",
                "hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
                isSelected 
                  ? "border-blue-200 bg-blue-50 shadow-sm" 
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <input
                type="radio"
                name="engine-type"
                value={option.id}
                checked={isSelected}
                onChange={() => handleEngineSelect(option.id)}
                className="sr-only"
                aria-describedby={`${option.id}-description`}
              />
              
              <div className="flex items-start gap-3 w-full">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0",
                  isSelected ? "bg-blue-100" : "bg-gray-100"
                )}>
                  <IconComponent className={cn(
                    "h-5 w-5",
                    isSelected ? option.color : "text-gray-600"
                  )} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-blue-900" : "text-gray-900"
                    )}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <p 
                    id={`${option.id}-description`}
                    className={cn(
                      "text-xs mt-1",
                      isSelected ? "text-blue-700" : "text-gray-500"
                    )}
                  >
                    {option.description}
                  </p>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}