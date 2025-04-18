import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGroupedProperties } from "@/hooks/useGroupedProperties";
import { useFlow } from "@/context/designers/FlowContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FormLayout } from "./Form/FormLayout";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createShortUUID } from "@/lib/utils";
import { Save, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useOtherTypes } from "@/hooks/useOtherTypes";
import { useNodeFormInput } from "@/hooks/useNodeFormInput";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { updateFlowDefinition } from "@/store/slices/designer/flowSlice";
import schema from "@bh-ai/flow-schema";
import { RootState } from "@/store";
import { Input } from "@/components/ui/input";

interface NodeFormProps {
  id: string;
  closeTap: () => void;
}

type TabType = "property" | "settings" | "parameters";

interface ParameterItem {
  key: string;
  value: string | number;
}

const ParameterRow = React.memo<{
  parameter: ParameterItem;
  onDelete: () => void;
  onChange: (field: "key" | "value", value: string) => void;
  canDelete: boolean;
}>(({ parameter, onDelete, onChange, canDelete }) => (
  <div className={`flex gap-2 items-center px-1 overflow-visible ${!canDelete ? 'bg-gray-50' : ''}`}>
    <div className="w-1/2">
      <Input
        placeholder="Key"
        value={parameter.key}
        onChange={(e) => onChange("key", e.target.value)}
        className={`w-full focus:outline-none ${!canDelete ? 'border-gray-200' : ''}`}
        readOnly={!canDelete}
      />
    </div>
    <div className="w-1/2">
      <Input
        placeholder="Value"
        value={String(parameter.value)}
        onChange={(e) => onChange("value", e.target.value)}
        className="w-full focus:outline-none"
      />
    </div>
    <Button
      variant="ghost"
      size="icon"
      onClick={onDelete}
      className={`text-gray-400 hover:text-red-500 flex-shrink-0 ${!canDelete ? 'opacity-30' : ''}`}
      disabled={!canDelete}
    >
      <X className="h-4 w-4" />
    </Button>
  </div>
));

const ParametersSection = React.memo<{
  parameters: ParameterItem[] | string;
  onParameterChange: (
    index: number,
    field: "key" | "value",
    value: string
  ) => void;
  onAddParameter: () => void;
  onRemoveParameter: (index: number) => void;
  defaultParameters?: ParameterItem[];
}>(({ parameters, onParameterChange, onAddParameter, onRemoveParameter, defaultParameters = [] }) => {
  // Ensure we have an array of parameters
  const parametersArray = useMemo<ParameterItem[]>(() => {
    // If parameters is already an array, use it
    if (Array.isArray(parameters) && parameters.length > 0) {
      return parameters;
    }

    // Try to parse parameters if it's a string
    if (typeof parameters === 'string' && parameters) {
      try {
        const parsed = JSON.parse(parameters);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // Parsing failed, fall back to defaults or empty
      }
    }

    // If we have defaults, use them
    if (Array.isArray(defaultParameters) && defaultParameters.length > 0) {
      return defaultParameters;
    }

    // Last resort - empty parameter
    return [{ key: "", value: "" }];
  }, [parameters, defaultParameters]);

  // Determine if a parameter is a default one by matching keys
  const isDefaultParameter = useCallback((param: ParameterItem) => {
    if (!Array.isArray(defaultParameters) || defaultParameters.length === 0) {
      return false;
    }

    return defaultParameters.some(defaultParam =>
      defaultParam.key === param.key
    );
  }, [defaultParameters]);

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
              onChange={(field, value) => onParameterChange(index, field, value)}
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
});

const isFieldEmpty = (value: any): boolean => {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.trim() === "";
  return false;
};

/** Convert literal strings to booleans or numbers (deep). */
const convertLiteralStrings = (obj: any): any => {
  if (typeof obj === "string") {
    if (obj === "true") return true;
    if (obj === "false") return false;
    const n = Number(obj);
    return isNaN(n) || obj === "" ? obj : n;
  }
  if (Array.isArray(obj)) return obj.map(convertLiteralStrings);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, convertLiteralStrings(v)])
    );
  }
  return obj;
};

const updateFlowDefinitionOnServer = (
  selectedFlowId: string | null,
  selectedFlow: any,
  dispatch: any,
  flowConfigMap: Record<string, any>,
  nodeFormData: any[]
) => {
  if (!selectedFlowId || !selectedFlow?.flow_id) return;

  const raw = localStorage.getItem(`flow-${selectedFlowId}`);
  if (!raw) return;

  const flowStructure = JSON.parse(raw);
  const formData = nodeFormData.length ? nodeFormData : flowStructure.nodeFormData;
  if (!formData?.length) return;

  const tasks = formData.map((item: any) => {
    const copy = JSON.parse(JSON.stringify(item.formData));
    if (!Array.isArray(copy.parameters)) copy.parameters = [];
    return convertLiteralStrings(copy);
  });

  const flowJson = {
    $schema: schema["$schema"],
    description: `Flow for ${selectedFlow?.flow_name || "Unnamed Flow"}`,
    name: selectedFlow?.flow_name || "Unnamed Flow",
    version: schema.version,
    parameters: flowConfigMap?.flowconfig?.flow_config || [],
    tasks,
  };

  dispatch(
    updateFlowDefinition({
      flow_id: String(selectedFlow.flow_id),
      flow_json: {
        flow_deployment_id: selectedFlow.flow_deployment?.[0]?.flow_deployment_id,
        flow_id: String(selectedFlow.flow_id),
        flow_json: { flowJson, flowStructure },
      },
    })
  );
};

const useFormValidation = (
  selectedNodeId: string,
  requiredFields: string[],
  getNodeFormData: any
) => {
  const isSaveDisabled = useMemo(() => {
    const data = getNodeFormData(selectedNodeId) || {};
    return requiredFields.some((f) => isFieldEmpty(data[f]));
  }, [getNodeFormData, requiredFields, selectedNodeId]);

  const validateForm = useCallback(() => {
    const data = getNodeFormData(selectedNodeId);
    if (!data) {
      toast("Missing required fields", {
        style: { backgroundColor: "#f44336", color: "#fff" },
      });
      return false;
    }
    const missing = requiredFields.filter((f) => isFieldEmpty(data[f]));
    if (missing.length) {
      toast(`Missing required fields: ${missing.join(", ")}`, {
        style: { backgroundColor: "#f44336", color: "#fff" },
      });
      return false;
    }
    return true;
  }, [getNodeFormData, requiredFields, selectedNodeId]);

  return { isSaveDisabled, validateForm };
};

export const NodeForm: React.FC<NodeFormProps> = ({ closeTap, id }) => {
  const {
    saveFlow,
    selectedNode,
    setFormDataNum,
    nodeFormData,
    prevNodeFn,
    updateNodeFormData,
    updateNodeMeta,
    updatedSelectedNodeId,
    getNodeFormData,
    revertOrSaveData,
    updateNodeDependencies,
    selectedFlowId,
    flowConfigMap,
  } = useFlow();

  const dispatch = useAppDispatch();
  const { selectedFlow } = useAppSelector((state: RootState) => state.flow);

  const [activeTab, setActiveTab] = useState<TabType>("property");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [requiredFieldsState, setRequiredFieldsState] = useState<string[]>([]);
  const paramsInitRef = useRef(false);

  if (!selectedNode) return null;

  const typesMatched = useOtherTypes(selectedNode.data.selectedData);

  const selectedProperties = useMemo(() => {
    if (Array.isArray(selectedNode.data.meta.properties) && selectedValue) {
      return selectedNode.data.meta.properties.find(
        (p: any) => p.type === selectedValue || p.type === selectedNode.data.selectedData
      );
    }
    return selectedNode.data.meta.properties;
  }, [selectedNode.data.meta.properties, selectedValue]);

  const defaultParameters = useMemo<ParameterItem[]>(() => {
    // Try all possible paths to find default parameters
    const defaultsPath1 = selectedProperties?.parameters?.ui_properties?.default;
    const defaultsPath2 = selectedProperties?.properties?.parameters?.ui_properties?.default;

    // Use first available path
    return defaultsPath1 || defaultsPath2 || [];
  }, [selectedProperties]);

  const groupedProperties =
    useGroupedProperties({ properties: selectedProperties }) ?? {
      property: [],
      settings: [],
      parameters: [],
    };

  const hasParameters = useMemo(
    () => groupedProperties.parameters.length > 0 && !!selectedValue,
    [groupedProperties, selectedValue]
  );

  const currentFormData = useMemo(
    () => nodeFormData.find((i) => i.nodeId === selectedNode.id)?.formData || {},
    [nodeFormData, selectedNode.id]
  );

  const dependsOn = useMemo(() => prevNodeFn(selectedNode.id) ?? [], [prevNodeFn, selectedNode.id]);

  const taskID = useMemo(
    () => `${selectedNode.data.label}-${selectedValue}-${createShortUUID()}`,
    [selectedNode.data.label, selectedValue]
  );

  /** handlers */
  const handleInputChange = useNodeFormInput({
    selectedNode,
    currentFormData,
    dependsOn,
    updateNodeFormData,
    saveFlow,
    taskID,
  });

  // Reset parameters initialization flag when node or node type changes
  useEffect(() => {
    // Only reset if we don't already have parameters
    const hasExistingParams = Array.isArray(currentFormData.parameters) && currentFormData.parameters.length > 0;

    if (!hasExistingParams) {
      paramsInitRef.current = false;

      // When node type changes, reset parameters to defaults if defaults are available
      if (hasParameters && defaultParameters && defaultParameters.length > 0) {
        updateNodeFormData(selectedNode.id, {
          ...currentFormData,
          parameters: defaultParameters
        });
        paramsInitRef.current = true;
      }
    }
  }, [selectedNode.id, selectedValue, hasParameters, defaultParameters, updateNodeFormData, currentFormData]);

  // Initialize parameters with default values - only if they don't exist already
  useEffect(() => {
    // Only set parameters if they don't exist and we have defaults
    const hasNoParameters = !currentFormData.parameters ||
      !Array.isArray(currentFormData.parameters) ||
      currentFormData.parameters.length === 0;

    if (hasParameters && defaultParameters.length > 0 && hasNoParameters && !paramsInitRef.current) {
      updateNodeFormData(selectedNode.id, {
        ...currentFormData,
        parameters: defaultParameters,
      });
      paramsInitRef.current = true;
    }
  }, [hasParameters, defaultParameters, updateNodeFormData, currentFormData, selectedNode.id, paramsInitRef]);

  /** save */
  const { isSaveDisabled, validateForm } = useFormValidation(
    selectedNode.id,
    requiredFieldsState,
    getNodeFormData
  );

  const handleSave = useCallback(() => {
    if (!selectedNode || !validateForm()) return;

    // First, ensure form data is updated
    const newFormData = [...nodeFormData];
    const existingNodeIndex = newFormData.findIndex(item => item.nodeId === selectedNode.id);

    // Always ensure parameters is an array
    let parameters = [];

    // If we have parameters in current form data, use them
    if (Array.isArray(currentFormData.parameters)) {
      parameters = [...currentFormData.parameters];
    }
    // Otherwise, use defaults if available
    else if (defaultParameters.length > 0) {
      parameters = [...defaultParameters];
    }
    // Last resort - empty parameter
    else {
      parameters = [{ key: "", value: "" }];
    }

    const updatedFormData = {
      nodeId: selectedNode.id,
      formData: {
        ...currentFormData,
        task_id: currentFormData.task_id || taskID,
        type: selectedValue,
        dependsOn: prevNodeFn(selectedNode.id) || [],
        parameters: parameters
      }
    };

    if (existingNodeIndex >= 0) {
      newFormData[existingNodeIndex] = updatedFormData;
    } else {
      newFormData.push(updatedFormData);
    }

    // Update the form data state first
    updateNodeFormData(selectedNode.id, updatedFormData.formData);

    // Wait a moment for state to update before saving
    setTimeout(() => {
      // Update node dependencies based on current edges
      updateNodeDependencies();

      // Save the flow to local storage
      setFormDataNum((prev) => prev + 1);

      // Update flow definition on the server with the updated form data
      updateFlowDefinitionOnServer(
        selectedFlowId,
        selectedFlow,
        dispatch,
        flowConfigMap,
        newFormData // Pass the updated form data
      );

      // Close the form
      closeTap();
      revertOrSaveData(id, true);
    }, 100);
  }, [
    closeTap,
    id,
    validateForm,
    revertOrSaveData,
    updateNodeDependencies,
    selectedNode,
    selectedFlowId,
    selectedFlow,
    dispatch,
    setFormDataNum,
    flowConfigMap,
    nodeFormData,
    currentFormData,
    selectedValue,
    taskID,
    prevNodeFn,
    updateNodeFormData,
    defaultParameters
  ]);

  const handleParameterChange = useCallback(
    (index: number, field: "key" | "value", value: string) => {
      const list = Array.isArray(currentFormData.parameters)
        ? currentFormData.parameters
        : defaultParameters;
      const updatedList = [...list];
      if (!updatedList[index]) updatedList[index] = { key: "", value: "" };
      (updatedList[index] as any)[field] = value;
      updateNodeFormData(selectedNode.id, {
        ...currentFormData,
        parameters: updatedList,
      });
    },
    [currentFormData, defaultParameters, selectedNode.id, updateNodeFormData]
  );

  // Improved and unified add parameter function
  const addParameterRow = useCallback(() => {
    // Get current parameters - ensure we're working with a proper array
    let currentParams = [];

    // Use existing parameters if available
    if (Array.isArray(currentFormData.parameters) && currentFormData.parameters.length > 0) {
      currentParams = [...currentFormData.parameters];
    }
    // Otherwise start with defaults if available
    else if (Array.isArray(defaultParameters) && defaultParameters.length > 0) {
      currentParams = [...defaultParameters];
    }

    // Add a new empty parameter
    currentParams.push({ key: "", value: "" });

    // Update the form data with all important fields
    updateNodeFormData(selectedNode.id, {
      ...currentFormData,
      parameters: currentParams,
      // Make sure to include these essential fields
      type: selectedValue || selectedNode.data.selectedData,
      task_id: currentFormData.task_id || `task-${selectedNode.id}`
    });
  }, [currentFormData, defaultParameters, selectedNode, selectedValue, updateNodeFormData]);

  const removeParameterRow = useCallback(
    (index: number) => {
      // Get current parameters
      let currentParams = [];
      if (Array.isArray(currentFormData.parameters)) {
        currentParams = [...currentFormData.parameters];
      } else if (Array.isArray(defaultParameters) && defaultParameters.length > 0) {
        currentParams = [...defaultParameters];
        return; // Don't allow removing if we're using defaults
      } else {
        return; // Nothing to remove
      }

      // Skip removal for default parameters
      if (defaultParameters && defaultParameters.length > 0) {
        // Check if the parameter we're trying to remove matches a default parameter by key
        const paramToRemove = currentParams[index];
        const isDefault = defaultParameters.some(
          defaultParam => defaultParam.key === paramToRemove.key
        );

        if (isDefault) {
          // Don't remove default parameters
          return;
        }
      }

      // Only allow removal if we have more than one parameter
      if (currentParams.length > 1) {
        const newParams = currentParams.filter((_, i) => i !== index);

        updateNodeFormData(selectedNode.id, {
          ...currentFormData,
          parameters: newParams,
        });
      }
    },
    [currentFormData, defaultParameters, selectedNode.id, updateNodeFormData]
  );

  /** other handlers */
  const handleTabChange = useCallback((t: TabType) => setActiveTab(t), []);

  const handleValueChange = useCallback(
    (val: string) => {
      setSelectedValue(val);
      const req = selectedNode.data.requiredFields.find((i: any) => Object.keys(i)[0] === val);
      const fields = req?.[val] || [];
      setRequiredFieldsState(fields);
      updateNodeMeta(selectedNode.id, { type: val }, { type: val, requiredFields: fields });
      updatedSelectedNodeId(selectedNode.id, val);
    },
    [selectedNode, updateNodeMeta, updatedSelectedNodeId]
  );

  useEffect(() => {
    if (selectedNode.data.selectedData) setSelectedValue(selectedNode.data.selectedData);
  }, [selectedNode.data.selectedData]);

  useEffect(() => {
    setRequiredFieldsState(selectedNode.data.requiredFields);
  }, [selectedNode.data.requiredFields]);

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg overflow-visible">
      <CardContent className="p-6 space-y-6 overflow-visible">
        {/* Node type selector */}
        <div className="grid grid-cols-2 gap-4 items-center">
          <Label htmlFor="type-select" className="text-sm font-medium text-gray-700">
            Select Node Type
          </Label>
          <Select value={selectedValue} onValueChange={handleValueChange}>
            <SelectTrigger
              id="type-select"
              className="bg-white border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-0"
            >
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(selectedNode.data.meta.properties)
                ? selectedNode.data.meta.properties.map((p: any) => (
                  <SelectItem key={p.type} value={p.type}>
                    {p.type}
                  </SelectItem>
                ))
                : typesMatched.map((t: string) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full overflow-visible">
          <TabsList className={`grid w-full ${hasParameters ? "grid-cols-3" : "grid-cols-2"} mb-3 overflow-visible`}>
            <TabsTrigger
              value="property"
              className="data-[state=active]:bg-black data-[state=active]:text-white focus:outline-none focus:ring-0"
            >
              Properties
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-black data-[state=active]:text-white focus:outline-none focus:ring-0"
              disabled={!groupedProperties["settings"]?.length}
            >
              Settings
            </TabsTrigger>
            {hasParameters && (
              <TabsTrigger
                value="parameters"
                className="data-[state=active]:bg-black data-[state=active]:text-white focus:outline-none focus:ring-0"
              >
                Parameters
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="property">
            <ScrollArea className="h-[400px] p-2 bg-white">
              <FormLayout properties={groupedProperties.property} formValues={currentFormData} onInputChange={handleInputChange} dependsOn={dependsOn} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings">
            <ScrollArea className="h-[400px] p-2 bg-white">
              <FormLayout properties={groupedProperties.settings} formValues={currentFormData} onInputChange={handleInputChange} dependsOn={dependsOn} />
            </ScrollArea>
          </TabsContent>

          {hasParameters && (
            <TabsContent value="parameters">
              <ScrollArea className="h-[400px] p-2 bg-white">
                <ParametersSection
                  parameters={currentFormData.parameters || defaultParameters}
                  onParameterChange={handleParameterChange}
                  onAddParameter={addParameterRow}
                  onRemoveParameter={removeParameterRow}
                  defaultParameters={defaultParameters}
                />
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>

        {/* Save button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className={`bg-black hover:bg-black/90 text-white px-8 focus:outline-none focus:ring-0 ${isSaveDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
