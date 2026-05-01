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
import { todoListSummaryNodeDefinition } from './todoListSummaryNode';
import { calendarNodeDefinition } from './calendarNode';
import type { NodeDefinition, NodeInspectorContext, SupportedNodeType } from './types';

const NODE_INFO_MAP: Record<SupportedNodeType, NodeInfo> = {
  ideaNode: {
    inputs: 'None (Self-contained)',
    outputs: 'Binary (0% or 100%)',
    passThrough: 'Percentage, Decision, Summary nodes',
  },
  categoryNode: {
    inputs: 'None',
    outputs: 'None',
    passThrough: 'Visual grouping only',
  },
  statusNode: {
    inputs: 'None',
    outputs: 'Defines status options for Idea nodes',
    passThrough: 'None',
  },
  todoNode: {
    inputs: 'Manual toggle',
    outputs: 'Binary (0% or 100%)',
    passThrough: 'Percentage, Decision, Summary nodes',
  },
  multiTodoNode: {
    inputs: 'List of checklist items',
    outputs: 'Percentage (0-100% average)',
    passThrough: 'Percentage, Decision, Summary nodes',
  },
  percentageNode: {
    inputs: 'Todo, Multi-Todo, Idea, Percentage, Decision',
    outputs: 'Weighted Average (0-100%)',
    passThrough: 'Percentage, Decision, Summary nodes',
  },
  linkNode: {
    inputs: 'URL string',
    outputs: 'None',
    passThrough: 'Navigation button',
  },
  mediaNode: {
    inputs: 'Image/Video URL',
    outputs: 'None',
    passThrough: 'Visual display',
  },
  decisionNode: {
    inputs: 'Any functional node + Toggle',
    outputs: 'Pass-through average (if Yes) or Null (if No)',
    passThrough: 'Acts as a logic gate for averages',
  },
  todoListSummaryNode: {
    inputs: 'Recursive incoming functional nodes',
    outputs: 'Aggregated list of all sub-tasks',
    passThrough: 'Collects todos from entire branch',
  },
  calendarNode: {
    inputs: 'None',
    outputs: 'Percentage of days tracked',
    passThrough: 'None',
  },
};

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
  todoListSummaryNodeDefinition,
  calendarNodeDefinition,
].map((def) => ({
  ...def,
  info: NODE_INFO_MAP[def.type],
}));

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

export function getPreviewData(type: SupportedNodeType): Record<string, unknown> {
  const baseData = NODE_DEF_MAP[type].createData(0);
  const previews: Partial<Record<SupportedNodeType, Record<string, unknown>>> = {
    ideaNode: {
      label: 'New Product Concept',
      note: 'Initial brainstorming session for the Q3 product roadmap',
    },
    categoryNode: { label: 'Marketing Strategy' },
    statusNode: { label: 'Project Status', options: 'backlog/doing/review/done' },
    todoNode: { label: 'Finalize UI Design', completed: false },
    multiTodoNode: {
      label: 'Launch Checklist',
      todos: [
        { id: '1', text: 'UX Research', done: true },
        { id: '2', text: 'Visual Design', done: true },
        { id: '3', text: 'Frontend Dev', done: false },
      ],
    },
    percentageNode: { label: 'Project Completion' },
    linkNode: { label: 'Product Specs', url: 'https://docs.example.com' },
    mediaNode: { label: 'Branding Assets' },
    decisionNode: { label: 'Approve Budget?', options: 'yes/no' },
    todoListSummaryNode: { label: 'Team Tasks Summary' },
    calendarNode: {
      label: 'Daily Yoga Habit',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      trackedDates: { '1': true, '2': true, '3': true, '5': true, '8': true, '12': true },
    },
  };
  return { ...baseData, ...previews[type] };
}
