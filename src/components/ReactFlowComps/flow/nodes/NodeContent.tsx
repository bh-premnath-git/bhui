import { useEffect, useRef, useState } from 'react';
import { NodeToolBar } from './NodeToolBar';
import { useFlow } from "@/contexts/FlowContext";
import { NodeToolBarRef } from "@/types/flow";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { flowNodeValidator } from '@/Utils/flowNodeValidator';

interface NodeContentProps {
  id: string;
  label: string;
  type: string;
  moduleInfo: {
    color: string;
    icon: string;
  };
  isHovered: React.SetStateAction<boolean>;
}

export const NodeContent = ({ id, label, type, moduleInfo, isHovered }: NodeContentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { renameNode, selectedNodeConnection } = useFlow();
  const toolbarRef = useRef<NodeToolBarRef>(null);
  const editableRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
    }
  }, [isEditing]);

  const [isValid, status] = flowNodeValidator(selectedNodeConnection(id));

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newValue = e.target.textContent || '';
    if (newValue !== type) {
      renameNode(id, newValue);
    }
    setIsEditing(false);
    toolbarRef.current?.setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <>
      <NodeToolBar
        ref={toolbarRef}
        id={id}
        isHovered={isHovered}
        onStartEdit={() => setIsEditing(true)}
      />
      <div className="flex flex-col items-center gap-1 px-0">
        {/* Icon Section */}
        <div
          className="rounded-xl w-15 h-15 flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: moduleInfo.color }}
        >
          <img src={moduleInfo.icon} alt="" className="w-8 h-8" />
        </div>
        <div className="relative flex flex-col items-center gap-0.5 mt-1">
          <div className="absolute bottom-[-10px] text-[10px] font-medium text-gray-700">
            {label}
          </div>
          {/* Container for the type with tooltip */}
          <div className="relative w-full flex justify-center items-center">
            <div
              ref={editableRef}
              className="absolute w-17 bottom-[-22px] text-[8px] text-gray-500 text-center"
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              data-node-id={id}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <div
                        className={`absolute left-[-10px] bottom-[-4px] transform -translate-y-1/2 w-2 h-2 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'
                          }`}
                      ></div>
                      <span>{type ?? "SelectType"}</span>
                    </div>
                  </TooltipTrigger>
                  {/* Tooltip Content with Reddish Background */}
                  <TooltipContent
                    side="top"
                    align="center"
                    className="bg-red-100 text-red-700 border border-red-200 rounded-md shadow-lg p-2"
                  >
                    <ul className="text-xs">
                      {Array.isArray(status) && status.length > 0 ? (
                        status.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))
                      ) : (
                        <li>No Status Available</li>
                      )}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
