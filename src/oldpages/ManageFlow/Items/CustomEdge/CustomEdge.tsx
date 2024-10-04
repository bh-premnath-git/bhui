import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import styles from './CustomEdge.module.css';

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

  return (
    <>
      <path
        id={id}
        style={style}
        className={styles.edgePath}
        d={edgePath}
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