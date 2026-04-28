import type { Node, NodeProps } from '@xyflow/react';
import type { ReactNode } from 'react';

export type SupportedNodeType =
  | 'ideaNode'
  | 'categoryNode'
  | 'statusNode'
  | 'todoNode'
  | 'percentageNode'
  | 'linkNode'
  | 'mediaNode'
  | 'decisionNode';

export type AnyNode = Node<Record<string, unknown>, string>;
export type NodeCardComponent = (props: NodeProps<AnyNode>) => ReactNode;
export type UpdateNodeData = (nodeId: string, patch: Record<string, unknown>) => void;

export interface NodeInspectorContext {
  node: AnyNode;
  updateNodeData: UpdateNodeData;
  mediaUploadPending: boolean;
  mediaUploadError: string;
  uploadMedia: (nodeId: string, file: File) => Promise<void>;
}

export interface NodeDefinition {
  type: SupportedNodeType;
  label: string;
  Card: NodeCardComponent;
  createData: (count: number) => Record<string, unknown>;
  normalizeData: (data: Record<string, unknown>, index: number) => Record<string, unknown>;
  renderInspector: (context: NodeInspectorContext) => ReactNode;
}
