import { useEffect, useRef, useState } from 'react';
import { NodeToolBar } from './NodeToolBar';
import { useFlow } from "@/context/designers/FlowContext";
import { NodeToolBarRef } from "@/types/designer/flow";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { flowNodeValidator } from '@/lib/flowNodeValidator';

interface NodeContentProps {
  id: string;
  label: string;
  type: string;
  moduleInfo: {
    color: string;
    icon: string;
  };
  isHovered: boolean;
}

export const NodeContent = ({ id, label, type, moduleInfo, isHovered }: NodeContentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { renameNode, selectedNodeConnection, selectedNodeOptimized } = useFlow();
  const toolbarRef = useRef<NodeToolBarRef>(null);
  const editableRef = useRef<HTMLDivElement>(null);

  // Try placing cursor at end when editing becomes true
  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editableRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  // Validation
  const [isValid, status] = flowNodeValidator(selectedNodeConnection(id));
  useEffect(() => {
    if (isValid) {
      selectedNodeOptimized(id);
    }
  }, [isValid, id, selectedNodeOptimized]);

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newValue = e.target.textContent || '';
    if (newValue !== type) {
      renameNode(id, newValue);
    }
    setIsEditing(false);
    toolbarRef.current?.setEditing(false);
  };

  // End editing on Enter or Escape
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
          <div className="relative w-full flex justify-center items-center">
            <div
              ref={editableRef}
              className="absolute bottom-[-22px] text-[8px] text-gray-500
                         inline-block whitespace-nowrap min-w-[60px] 
                         text-center outline-none cursor-text"
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              data-node-id={id}
            >
              {!isValid && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative inline-flex items-center">
                        <div
                          className={`absolute left-[-10px] bottom-[-4px]
                                      transform -translate-y-1/2 w-2 h-2 rounded-full 
                                      ${isValid ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                        <span>{type ?? "SelectType"}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="center"
                      className="bg-red-50 text-red-800 border border-red-200 
                                 rounded-md shadow-lg p-2 text-xs max-w-xs"
                    >
                      <ul className="leading-tight space-y-1">
                        {Array.isArray(status) && status.length > 0 ? (
                          status.map((item: string, index: number) => (
                            <li key={index}>• {item}</li>
                          ))
                        ) : (
                          <li>No Status Available</li>
                        )}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isValid && (
                <div className="relative inline-flex items-center">
                  <div
                    className={`absolute left-[-10px] bottom-[-4px]
                                transform -translate-y-1/2 w-2 h-2 rounded-full 
                                ${isValid ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                  <span>{type ?? "SelectType"}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
