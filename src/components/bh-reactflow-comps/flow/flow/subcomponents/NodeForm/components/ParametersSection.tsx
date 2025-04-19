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
}

/**
 * Component to manage and display parameters
 */
export const ParametersSection = React.memo<Props>(
  ({
    parameters,
    onParameterChange,
    onAddParameter,
    onRemoveParameter,
    defaultParameters = [],
  }) => {
    /** Normalise to an array */
    const parametersArray = useMemo<ParameterItem[]>(() => {
      if (Array.isArray(parameters) && parameters.length) return parameters;
      if (typeof parameters === "string" && parameters) {
        try {
          const parsed = JSON.parse(parameters);
          if (Array.isArray(parsed) && parsed.length) return parsed;
        } catch {
          /* ignore */
        }
      }
      if (defaultParameters.length) return defaultParameters;
      return [{ key: "", value: "" }];
    }, [parameters, defaultParameters]);

    /** Helper to know if a param comes from defaults */
    const isDefaultParameter = useCallback(
      (param: ParameterItem) =>
        defaultParameters.some((d) => d.key === param.key),
      [defaultParameters]
    );

    return (
      <div className="space-y-3 px-3 overflow-visible">
        <div className="flex text-sm font-medium text-gray-500 px-3">
          <div className="w-1/2">Key</div>
          <div className="w-1/2">Value</div>
        </div>

        <div className="space-y-2 overflow-visible">
          {parametersArray.map((parameter, index) => {
            const isDefault = isDefaultParameter(parameter);
            return (
              <ParameterRow
                key={index}
                parameter={parameter}
                onDelete={() => onRemoveParameter(index)}
                onChange={(field, value) =>
                  onParameterChange(index, field, value)
                }
                canDelete={!isDefault && parametersArray.length > 1}
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
          <Plus className="h-4 w-4 mr-2" />
          Add Parameter
        </Button>
      </div>
    );
  }
); 