import React, { useEffect, useRef, useState } from 'react';
import { Handle, Position, Align, NodeToolbar } from 'reactflow';
import { Copy, Trash, Info, Edit } from 'lucide-react';
import Modal from '../../../../components/ModalWithPortal';
import CustomNodeTap from '../CustomNodeTap/CustomNodeTap';
import styles from './CustomNode.module.css';

interface CustomNodeProps {
  data: {
    type: string;
    label: string;
    color: string;
    icon: string;
    nodes: any[];
    selectedNode: any;
    toolbarPosition?: Position;
    toolbarAlign?: Align;
    onDelete: (nodeId: string) => void;
    onClone: (nodeId: string) => void;
  };
  id: string;
}

const NodeContent: React.FC<{
  label: string;
  color: string;
  icon: string;
  selectedNode: any;
  editedContent: string;
  onContentChange: (newContent: string) => void;
  isEditing: boolean;
  onFinishEditing: () => void;
}> = ({
  label,
  color,
  icon,
  selectedNode,
  editedContent,
  onContentChange,
  isEditing,
  onFinishEditing,
}) => {
  const selectedLabel = selectedNode.node_name;
  const displayLabel = editedContent || selectedLabel;

  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isEditing && spanRef.current) {
      spanRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(spanRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    const newContent = e.currentTarget.textContent || '';
    onContentChange(newContent);
    onFinishEditing();
  };

  return (
    <div className={styles.label} style={{ backgroundColor: color }}>
      <img src={icon} alt={label} width="24" height="24" />
      <span
        ref={spanRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={handleBlur}
        className={`${styles.nodeContent} ${isEditing ? styles.editingContent : ''}`}
      >
        {displayLabel}
      </span>
    </div>
  );
};

const NodeHandles: React.FC<{ backgroundColor: string }> = ({ backgroundColor }) => (
  <>
    <Handle
      type="target"
      style={{ backgroundColor, borderColor: backgroundColor }}
      position={Position.Left}
      className={styles.handle}
    />
    <Handle
      type="source"
      style={{ backgroundColor, borderColor: backgroundColor }}
      position={Position.Right}
      className={styles.handle}
    />
  </>
);

const ToolbarContent: React.FC<{
  onDelete: () => void;
  onEdit: () => void;
  onClone: () => void;
  label: string;
}> = ({ onDelete, onEdit, onClone, label }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleInfoMouseEnter = (event: React.MouseEvent<SVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({ x: rect.left, y: rect.bottom });
    setShowTooltip(true);
  };

  const handleInfoMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <Copy className={styles.toolbarIcon} onClick={onClone} />
      <Trash className={styles.toolbarIcon} onClick={onDelete} />
      <Info
        className={styles.toolbarIcon}
        onMouseEnter={handleInfoMouseEnter}
        onMouseLeave={handleInfoMouseLeave}
      />
      <Edit className={styles.toolbarIcon} onClick={onEdit} />
      {showTooltip && (
        <div
          className={styles.tooltip}
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
        >
          {label}
        </div>
      )}
    </>
  );
};

const CustomNode: React.FC<CustomNodeProps> = ({ data, id }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  const handleDoubleClick = () => {
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    data.onDelete(id);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleClone = () => {
    data.onClone(id);
  };

  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
  };

  const handleFinishEditing = () => {
    setIsEditing(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const displayLabel = editedContent || data.selectedNode.node_name;

  return (
    <>
      <div
        className={styles.customNode}
        style={{ backgroundColor: data.color }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
      >
        {isHovered && (
          <NodeToolbar
            isVisible={true}
            position={data.toolbarPosition}
            align={data.toolbarAlign}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <ToolbarContent
              onDelete={handleDelete}
              onEdit={handleEdit}
              onClone={handleClone}
              label={displayLabel}
            />
          </NodeToolbar>
        )}
        <NodeContent
          label={data.label}
          color={data.color}
          icon={data.icon}
          selectedNode={data.selectedNode}
          editedContent={editedContent}
          onContentChange={handleContentChange}
          isEditing={isEditing}
          onFinishEditing={handleFinishEditing}
        />
        <NodeHandles backgroundColor={data.color} />
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CustomNodeTap nodeData={data} />
      </Modal>
    </>
  );
};

export default CustomNode;
