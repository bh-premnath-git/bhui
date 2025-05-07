import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, AlertTriangle} from "lucide-react";

interface AccordionSectionProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    borderColor: string;
    titleColor: string;
    hasError?: boolean;
  }

export const AccordionSection: React.FC<AccordionSectionProps> = ({
    title,
    isOpen,
    onToggle,
    children,
    borderColor,
    titleColor,
    hasError = false,
  }) => {
    return (
      <Card className={`border-${borderColor} transition-all duration-200`}>
        <CardHeader className="cursor-pointer hover:bg-gray-50" onClick={onToggle}>
          <div className="flex items-center justify-between">
            <CardTitle className={`text-lg font-semibold ${titleColor}`}>
              {title}
              {hasError && <AlertTriangle className="ml-2 h-5 w-5 text-red-500 inline" />}
            </CardTitle>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </CardHeader>
        <div
          className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[500px]' : 'max-h-0'
            }`}
        >
          <CardContent className="space-y-4">{children}</CardContent>
        </div>
      </Card>
    );
  };