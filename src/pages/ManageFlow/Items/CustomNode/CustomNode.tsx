import React, { useEffect, useRef, useState } from 'react';
import { Handle, Position, Align, NodeToolbar } from 'reactflow';
import { Copy, Trash, Info, Edit } from 'lucide-react';
import styles from './CustomNode.module.css';
import Modal from '../../../../components/ModalWithPortal';
import CustomNodeTap from '../CustomNodeTap/CustomNodeTap';

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
  };
  id: string;
}

const NodeContent: React.FC<{ label: string; color: string; icon: string; selectedNode: any }> = ({ label, color, icon, selectedNode }) => {
  const selectedLabel = selectedNode.node_name;
  return (
    <>
      <div className={styles.label} style={{ backgroundColor: color, position: 'relative' }}>
        <img src={icon} alt={label} width="24" height="24" />
        <span style={{ width: '250px', fontSize: '0.55rem', position: 'absolute', top: '150%', left: '-20%' }}>{selectedLabel}</span>
      </div>
    </>
  )
};

const NodeHandles: React.FC<{ backgroundColor: string }> = ({ backgroundColor }) => (
  <React.Fragment>
    <Handle type="target" style={{ backgroundColor, borderColor: backgroundColor }} position={Position.Left} className={styles.handle} />
    <Handle type="source" style={{ backgroundColor, borderColor: backgroundColor }} position={Position.Right} className={styles.handle} />
  </React.Fragment>
);

const ToolbarContent: React.FC<{ onDelete: () => void }> = ({ onDelete }) => (
  <>
    <Copy className={styles.toolbarIcon} />
    <Trash className={styles.toolbarIcon} onClick={onDelete} />
    <Info className={styles.toolbarIcon} />
    <Edit className={styles.toolbarIcon} />
  </>
);

const CustomNode: React.FC<CustomNodeProps> = ({ data, id }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
            <ToolbarContent onDelete={handleDelete} />
          </NodeToolbar>
        )}
        <NodeContent label={data.label} color={data.color} icon={data.icon} selectedNode={data.selectedNode} />
        <NodeHandles backgroundColor={data.color} />
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CustomNodeTap nodeData={data} />
      </Modal>
    </>
  );
};

export default CustomNode;
