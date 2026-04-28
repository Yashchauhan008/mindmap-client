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
      return decisionValue === 'yes' ? baseOutput : 0;
    }

    return baseOutput;
  }

  return null;
}

export function countIncomingFunctionalInputs(nodeId: string, nodeMap: Map<string, AnyNode>, edges: Edge[]) {
  const inputIds = getIncomingNodeIds(nodeId, edges);
  return inputIds.filter((inputId) => {
    const inputNode = nodeMap.get(inputId);
    return (
      inputNode?.type === 'todoNode' ||
      inputNode?.type === 'ideaNode' ||
      inputNode?.type === 'percentageNode' ||
      inputNode?.type === 'decisionNode'
    );
  }).length;
}
