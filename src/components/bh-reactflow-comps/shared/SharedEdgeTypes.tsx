// src/components/bh-reactflow-comps/shared/SharedEdgeTypes.tsx
import { SharedCustomEdge } from '@/components/shared/SharedCustomEdge';

export const sharedEdgeTypes = {
  custom: SharedCustomEdge,
  default: SharedCustomEdge,
} as const;