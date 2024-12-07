import { useEffect, useRef, useState } from 'react';
import { NodeToolBar } from './NodeToolBar';
import { useFlow } from "@/contexts/FlowContext";
import {NodeToolBarRef} from "@/types/flow"

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
  const { renameNode } = useFlow();
  const toolbarRef = useRef<NodeToolBarRef>(null);
  const editableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && editableRef.current) {
      editableRef.current.focus();
    }
  }, [isEditing]);

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
      <div className="flex flex-col items-center gap-1 px-1">
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
          <div
            ref={editableRef}
            className="absolute w-17 bottom-[-26px] text-[8px] text-gray-500"
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            data-node-id={id}
          >
            {type ?? "SelectType"}
          </div>
        </div>
      </div>
    </>
  );
};