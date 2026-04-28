import type { Edge } from '@xyflow/react';
import type { AnyNode } from './types';

function getIncomingNodeIds(nodeId: string, edges: Edge[]) {
  return edges.filter((edge) => edge.target === nodeId).map((edge) => edge.source);
}

function getIdeaOutput(nodeId: string, nodeMap: Map<string, AnyNode>, edges: Edge[]) {
  const ideaNode = nodeMap.get(nodeId);
  if (!ideaNode) return null;
  const selectedStatus = String(ideaNode.data?.selectedStatus || '').trim();
  if (!selectedStatus) return 0;

  const mainStatuses = new Set<string>();
  edges.forEach((edge) => {
    const connected = edge.source === nodeId || edge.target === nodeId;
    if (!connected) return;
    const peerId = edge.source === nodeId ? edge.target : edge.source;
    const peerNode = nodeMap.get(peerId);
    if (!peerNode || peerNode.type !== 'statusNode') return;
    const mainStatus = String(peerNode.data?.mainStatus || '').trim();
    if (mainStatus) mainStatuses.add(mainStatus);
  });

  if (mainStatuses.size === 0) return 0;
  return mainStatuses.has(selectedStatus) ? 100 : 0;
}

function getMultiTodoOutput(nodeId: string, nodeMap: Map<string, AnyNode>) {
  const node = nodeMap.get(nodeId);
  if (!node) return null;

  const todos = Array.isArray(node.data?.todos) ? node.data.todos : [];
  const normalized = todos
    .map((item) => (item && typeof item === 'object' ? (item as Record<string, unknown>) : null))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item) => ({
      text: typeof item.text === 'string' ? item.text.trim() : '',
      done: Boolean(item.done),
    }))
    .filter((item) => item.text.length > 0);

  if (normalized.length === 0) return 0;

  const toggledCount = normalized.filter((item) => item.done).length;
  return Math.round((toggledCount / normalized.length) * 100);
}

export function computeNodeOutput(
  nodeId: string,
  nodeMap: Map<string, AnyNode>,
  edges: Edge[],
  trail: Set<string> = new Set<string>(),
): number | null {
  if (trail.has(nodeId)) return null;
  trail.add(nodeId);

  const node = nodeMap.get(nodeId);
  if (!node) return null;

  if (node.type === 'todoNode') {
    return node.data?.completed ? 100 : 0;
  }

  if (node.type === 'multiTodoNode') {
    return getMultiTodoOutput(nodeId, nodeMap);
  }

  if (node.type === 'ideaNode') {
    return getIdeaOutput(nodeId, nodeMap, edges);
  }

  if (node.type === 'percentageNode' || node.type === 'decisionNode') {
    const incomingNodeIds = getIncomingNodeIds(nodeId, edges);
    const incomingOutputs = incomingNodeIds
      .map((inputId) => computeNodeOutput(inputId, nodeMap, edges, new Set(trail)))
      .filter((value): value is number => value !== null);

    const baseOutput =
      incomingOutputs.length > 0
        ? Math.round(incomingOutputs.reduce((sum, value) => sum + value, 0) / incomingOutputs.length)
        : 0;

    if (node.type === 'decisionNode') {
      const decisionValue = String(node.data?.decisionValue || 'yes');
      // Decision node is an on/off gate:
      // - yes: pass incoming value through
      // - no: block output (exclude from downstream averages)
      return decisionValue === 'yes' ? baseOutput : null;
    }

    return baseOutput;
  }

  return null;
}

export function countIncomingFunctionalInputs(nodeId: string, nodeMap: Map<string, AnyNode>, edges: Edge[]) {
  const inputIds = getIncomingNodeIds(nodeId, edges);
  return inputIds.filter((inputId) => {
    const inputNode = nodeMap.get(inputId);
    const isFunctionalInput =
      inputNode?.type === 'todoNode' ||
      inputNode?.type === 'multiTodoNode' ||
      inputNode?.type === 'ideaNode' ||
      inputNode?.type === 'percentageNode' ||
      inputNode?.type === 'decisionNode';

    if (!isFunctionalInput) return false;

    // Count only active inputs that currently produce an output.
    return computeNodeOutput(inputId, nodeMap, edges) !== null;
  }).length;
}
