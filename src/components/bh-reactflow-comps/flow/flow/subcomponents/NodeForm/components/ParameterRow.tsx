import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { ParameterItem } from "../types";

interface Props {
  parameter?: ParameterItem | null;
  onDelete: () => void;
  onChange: (field: "key" | "value", value: string) => void;
  canDelete: boolean;
  className?: string;
  readOnly?: boolean;
  readOnlyKey?: boolean;
  readOnlyValue?: boolean;
}

/**
 * Component to render a single parameter row
 */
export const ParameterRow = React.memo<Props>(
  ({ 
    parameter, 
    onDelete, 
    onChange, 
    canDelete, 
    className = "", 
    readOnly = false,
    readOnlyKey,
    readOnlyValue 
  }) => {
    if (!parameter) {
      return null;
    }

    // For backwards compatibility, if readOnlyKey/Value not specified, use readOnly
    const isKeyReadOnly = readOnlyKey !== undefined ? readOnlyKey : (!canDelete || readOnly);
    const isValueReadOnly = readOnlyValue !== undefined ? readOnlyValue : readOnly;

    return (
      <div
        className={`flex gap-2 items-center px-1 overflow-visible ${
          !canDelete ? "bg-gray-50" : ""
        } ${className} ${readOnly ? "opacity-70" : ""}`}
      >
        <div className="w-1/2">
          <Input
            placeholder="Key"
            value={parameter.key ?? ""}
            onChange={(e) => onChange("key", e.target.value)}
            className={`w-full focus:outline-none ${
              isKeyReadOnly ? "border-gray-200" : ""
            }`}
            readOnly={isKeyReadOnly}
          />
        </div>
        <div className="w-1/2">
          <Input
            placeholder="Value"
            value={String(parameter.value ?? "")}
            onChange={(e) => onChange("value", e.target.value)}
            className={`w-full focus:outline-none ${isValueReadOnly ? "border-gray-200" : ""}`}
            readOnly={isValueReadOnly}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className={`text-gray-400 hover:text-red-500 flex-shrink-0 ${
            !canDelete ? "opacity-30" : ""
          }`}
          disabled={!canDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }
); 