import React, { useMemo, useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './Toolbar.module.css';
import flowRegistry from "../../flow_registry.json";

interface NodeType {
  type: string;
  label: string;
  color: string;
  icon: string;
  nodes: any[];
}

interface ToolbarProps {
  onAddNode: (nodeType: NodeType, nodeName: string) => void;
}

interface ToolbarItemProps {
  node: NodeType;
  onClick: (nodeType: NodeType, nodeName: string) => void;
}

interface DropdownProps {
  nodes: any[];
  onItemClick: (nodeName: string) => void;
  onClose: () => void;
  title: string;
  icon: string;
  color: string;
}

const Dropdown: React.FC<DropdownProps> = ({ nodes, onItemClick, onClose, title, icon, color }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredNodes = useMemo(
    () =>
      nodes.filter((node) =>
        node.node_name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [nodes, searchTerm]
  );

  return (
    <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
      <div className={styles.dropdownHeader}>
        <span className={styles.dropdownTitle}>{title}</span>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder={`Search By ${title.replace(/\bselect\s+/i, '')} Name`}
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ul className={styles.dropdownList}>
        {filteredNodes.map((node, index) => (
          <li key={index} className={styles.dropdownItem} onClick={() => onItemClick(node.node_name)}>
            <div className={styles.itemIcon} style={{ backgroundColor: color }}>
              <img src={icon} alt={node.node_name} width="16" height="16" />
            </div>
            <span
              className={styles.itemIndicator}
              style={{ '--indicator-color': color } as React.CSSProperties}
            ></span>
            <span className={styles.itemName}>{node.node_name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ToolbarItem: React.FC<ToolbarItemProps> = ({ node, onClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  const handleItemClick = (nodeName: string) => {
    onClick(node, nodeName);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className={styles.toolbarItemWrapper}>
      <div
        style={{ backgroundColor: node.color }}
        className={`${styles.toolbarItem} ${isOpen ? styles.active : ''} ${isHovered ? styles.hovered : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img src={node.icon} alt={node.label} width="24" height="24" />
        <span className={styles.itemLabel}>{node.label}</span>
      </div>
      {isOpen && (
        <div className={styles.dropdownWrapper}>
          <Dropdown
            nodes={node.nodes}
            onItemClick={handleItemClick}
            onClose={() => setIsOpen(false)}
            title={`Select ${node.label}`}
            icon={node.icon}
            color={node.color}
          />
        </div>
      )}
    </div>
  );
};

const Toolbar: React.FC<ToolbarProps> = ({ onAddNode }) => {
  const modules: NodeType[] = flowRegistry.modules.map((module) => ({
    type: module.module_name,
    label: module.module_name,
    color: module.color,
    icon: module.icon,
    nodes: module.nodes,
  }));

  return (
    <div className={styles.toolbarContainer}>
      <div className={styles.toolbar}>
        {modules.map((module, index) => (
          <ToolbarItem
            key={index}
            node={module}
            onClick={onAddNode}
          />
        ))}
      </div>
    </div>
  );
};

export default Toolbar;
