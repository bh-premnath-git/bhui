import { Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModuleType, SelectedOperator } from "@/types/flow";

interface OperatorListProps {
  module: ModuleType;
  searchTerm: string;
  selectedOperator: SelectedOperator | null;
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onOperatorSelect: (operator: ModuleType["operators"][number]) => void;
}

export function OperatorList({
  module,
  searchTerm,
  selectedOperator,
  onSearchChange,
  onClose,
  onOperatorSelect,
}: OperatorListProps) {
  const filteredOperators = module.operators.filter((operator) =>
    operator.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="w-[400px] p-4 mt-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">{module.label}</h2>
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors p-1 rounded-md hover:bg-gray-100"
          aria-label="Close operator selection"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search By Operator Type"
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-2">
          {filteredOperators.map((operator) => (
            <div
              key={operator.type}
              className={`group flex items-center space-x-3 rounded-lg border border-transparent p-3 hover:bg-accent hover:border-border transition-colors cursor-pointer ${
                selectedOperator?.type === operator.type
                  ? "bg-accent border-border"
                  : ""
              }`}
              onClick={() => onOperatorSelect(operator)}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: module.color }}
              >
                <img
                  src={module.icon}
                  alt={module.label}
                  className="h-6 w-6 text-white"
                />
              </div>
              <div className="relative flex-1">
                <div
                  className="absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ backgroundColor: module.color }}
                />
                <span className="block text-sm font-medium pl-2">
                  {operator.type}
                </span>
                <span className="block text-xs text-muted-foreground pl-2">
                  {operator.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}