import React, { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ParameterRow } from "./ParameterRow";
import { ParameterItem } from "../types";

interface Props {
  parameters: ParameterItem[] | string;
  onParameterChange: (
    index: number,
    field: "key" | "value",
    value: string
  ) => void;
  onAddParameter: () => void;
  onRemoveParameter: (index: number) => void;
  defaultParameters?: ParameterItem[];
  pipeline_parameters?: ParameterItem[];
}

/**
 * Component to manage and display parameters.
 * Pipeline parameters are automatically included and treated like defaults.
 */
export const ParametersSection = React.memo<Props>(
  ({
    parameters,
    onParameterChange,
    onAddParameter,
    onRemoveParameter,
    defaultParameters = [],
    pipeline_parameters = [],
  }) => {
    // Normalize parameters: Start with base (prop or defaults), then layer pipeline params
    const parametersArray = useMemo<ParameterItem[]>(() => {
      let baseParams: ParameterItem[] = [];

      // 1. Determine base parameters
      let providedParamsUsed = false;
      if (Array.isArray(parameters) && parameters.length) {
        baseParams = parameters as ParameterItem[];
        providedParamsUsed = true;
      } else if (typeof parameters === "string" && parameters) {
        try {
          const parsed = JSON.parse(parameters);
          if (Array.isArray(parsed) && parsed.length) {
            baseParams = parsed;
            providedParamsUsed = true;
          }
        } catch {
          /* ignore */
        }
      }
      // If prop wasn't valid/used, fall back to defaults
      if (!providedParamsUsed) {
        baseParams = defaultParameters || [];
      }

      // 2. Create a Map, seeding with base params
      const combined = new Map<string, ParameterItem>();
      baseParams.forEach(p => {
        if (p && typeof p.key !== 'undefined') combined.set(p.key, p);
      });

      // 3. Layer pipeline parameters on top (add new or overwrite existing by key)
      (pipeline_parameters || []).forEach(p => {
        if (p && typeof p.key !== 'undefined') {
            // If the key already exists from base/defaults, update its value
            // Otherwise, just add the new pipeline parameter
            combined.set(p.key, { ...combined.get(p.key), ...p });
        }
      });

      // 4. Convert back to array
      let finalParams = Array.from(combined.values());

      // 5. Ensure at least one row if the list is empty
      if (finalParams.length === 0) {
        finalParams = [{ key: "", value: "" }];
      }

      return finalParams;
    }, [parameters, defaultParameters, pipeline_parameters]);

    // Helper to check if a parameter is read-only (from defaults or pipeline)
    const isReadOnlyParameter = useCallback(
      (param: ParameterItem) => {
        if (!param || typeof param.key === 'undefined') return false;
        const key = param.key;
        // Check origin solely based on the *initial* lists passed as props
        const isDefault = (defaultParameters || []).some(d => d?.key === key);
        const isPipeline = (pipeline_parameters || []).some(p => p?.key === key);
        return isDefault || isPipeline;
      },
      [defaultParameters, pipeline_parameters]
    );
    
    // Helper specifically to identify pipeline params for styling
    const isPipelineOrigin = useCallback(
      (param: ParameterItem) => {
         if (!param || typeof param.key === 'undefined') return false;
         // Check origin based on the *initial* pipeline list passed as prop
         return (pipeline_parameters || []).some(p => p?.key === param.key);
      },
      [pipeline_parameters]
    );

    return (
      <div className="space-y-3 px-3 overflow-visible">
        <div className="flex text-sm font-medium text-gray-500 px-3">
          <div className="w-1/2">Key</div>
          <div className="w-1/2">Value</div>
        </div>

        <div className="space-y-2 overflow-visible">
          {parametersArray.map((parameter, index) => {
            if (!parameter) return null;
            const isReadOnly = isReadOnlyParameter(parameter);
            const isFromPipeline = isPipelineOrigin(parameter);

            return (
              <ParameterRow
                key={`${parameter.key || 'empty'}-${index}`}
                parameter={parameter}
                onDelete={() => onRemoveParameter(index)}
                onChange={(field, value) =>
                  onParameterChange(index, field, value)
                }
                canDelete={!isReadOnly && parametersArray.length > 1}
                className={isFromPipeline ? 'bg-blue-50 border-blue-200' : undefined}
                readOnlyKey={isReadOnly}
                readOnlyValue={false}
              />
            );
          })}
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={onAddParameter}
          className="w-full mt-4 border border-dashed border-gray-200 hover:border-gray-300 text-gray-600 h-9 px-4 focus:outline-none focus:ring-0"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Parameter
        </Button>
      </div>
    );
  }
); 