import React, { useCallback } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import styles from '@/components/ReactFlowComps/Items/CustomEdge/CustomEdge.module.css';

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onDoubleClick = useCallback(() => {
    data.deleteEdge(id); // Calls the delete function when double-clicked
  }, [id, data]);

  return (
    <>
      <path
        id={id}
        style={style}
        className={styles.edgePath}
        d={edgePath}
        onDoubleClick={onDoubleClick}
      />
      <text>
        <textPath
          href={`#${id}`}
          className={styles.edgeLabel}
          startOffset="50%"
          textAnchor="middle"
        >
          {data.label}
        </textPath>
      </text>
    </>
  );
};

export default CustomEdge;