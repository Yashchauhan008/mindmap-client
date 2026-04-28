import type { NodeTypes } from '@xyflow/react';
import { categoryNodeDefinition } from './categoryNode';
import { decisionNodeDefinition } from './decisionNode';
import { ideaNodeDefinition } from './ideaNode';
import { linkNodeDefinition } from './linkNode';
import { mediaNodeDefinition } from './mediaNode';
import { multiTodoNodeDefinition } from './multiTodoNode';
import { percentageNodeDefinition } from './percentageNode';
import { statusNodeDefinition } from './statusNode';
import { todoNodeDefinition } from './todoNode';
import type { NodeDefinition, NodeInspectorContext, SupportedNodeType } from './types';

export const NODE_DEFINITIONS: NodeDefinition[] = [
  ideaNodeDefinition,
  categoryNodeDefinition,
  statusNodeDefinition,
  todoNodeDefinition,
  multiTodoNodeDefinition,
  percentageNodeDefinition,
  linkNodeDefinition,
  mediaNodeDefinition,
  decisionNodeDefinition,
];

export const NODE_DEF_MAP = NODE_DEFINITIONS.reduce(
  (acc, definition) => {
    acc[definition.type] = definition;
    return acc;
  },
  {} as Record<SupportedNodeType, NodeDefinition>,
);

export const nodeTypeOptions = NODE_DEFINITIONS.map((definition) => ({
  type: definition.type,
  label: definition.label,
}));

export const nodeTypes: NodeTypes = NODE_DEFINITIONS.reduce(
  (acc, definition) => {
    acc[definition.type] = definition.Card;
    return acc;
  },
  {} as NodeTypes,
);

export function createNodeDataByType(type: SupportedNodeType, count: number) {
  return NODE_DEF_MAP[type].createData(count);
}

export function normalizeNodeDataByType(
  type: SupportedNodeType,
  data: Record<string, unknown>,
  index: number,
) {
  return NODE_DEF_MAP[type].normalizeData(data, index);
}

export function renderNodeInspector(type: SupportedNodeType, context: NodeInspectorContext) {
  return NODE_DEF_MAP[type].renderInspector(context);
}
