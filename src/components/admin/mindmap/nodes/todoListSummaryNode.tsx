/* eslint-disable react-refresh/only-export-components */
import { useStore, type NodeProps } from '@xyflow/react';
import { BaseCustomNode, TextAndNoteFields } from './shared';
import type { AnyNode, NodeDefinition, NodeInspectorContext } from './types';

function findTodosRecursively(
  nodeId: string,
  nodeMap: Map<string, AnyNode>,
  edges: any[],
  visited = new Set<string>()
): AnyNode[] {
  if (visited.has(nodeId)) return [];
  visited.add(nodeId);

  const incomingNodeIds = edges
    .filter((edge) => edge.target === nodeId)
    .map((edge) => edge.source);

  let results: AnyNode[] = [];

  for (const sourceId of incomingNodeIds) {
    const sourceNode = nodeMap.get(sourceId);
    if (!sourceNode) continue;

    if (sourceNode.type === 'todoNode') {
      results.push(sourceNode);
    } else if (sourceNode.type === 'percentageNode' || sourceNode.type === 'decisionNode') {
      // Pass through functional nodes
      results = results.concat(findTodosRecursively(sourceId, nodeMap, edges, visited));
    }
  }

  return results;
}

function TodoListSummaryNodeCard({ id, data, selected }: NodeProps<AnyNode>) {
  const nodes = useStore((state) => state.nodes as AnyNode[]);
  const edges = useStore((state) => state.edges);

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const connectedTodos = findTodosRecursively(id, nodeMap, edges);

  // Deduplicate in case of multiple paths to the same todo
  const uniqueTodos = Array.from(new Map(connectedTodos.map((todo) => [todo.id, todo])).values());

  return (
    <BaseCustomNode
      selected={selected}
      tone="green"
      width={320}
      title={(data?.label as string) || 'Todo Summary'}
      subtitle={`${uniqueTodos.length} connected todos`}
      note={(data?.note as string) || ''}
      extraContent={
        <div className="multi-todo-card-list">
          {uniqueTodos.length === 0 ? (
            <p className="node-helper-text">Connect Todo nodes to see a summary.</p>
          ) : (
            uniqueTodos.map((todo) => {
              const completed = Boolean(todo.data?.completed);
              return (
                <div
                  key={todo.id}
                  className={`node-inline-thumb-toggle multi-todo-badge ${completed ? 'active' : ''}`}
                  style={{ cursor: 'default' }}
                >
                  <span className="thumb-icon" aria-hidden>
                    {completed ? '👍' : '○'}
                  </span>
                  <span
                    className="thumb-label multi-todo-card-text"
                    style={{ textDecoration: completed ? 'line-through' : 'none' }}
                  >
                    {String(todo.data?.label || 'Untitled')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      }
    />
  );
}

function renderInspector({ node, updateNodeData }: NodeInspectorContext) {
  return (
    <TextAndNoteFields
      nodeId={node.id}
      label={(node.data.label as string) || ''}
      note={(node.data.note as string) || ''}
      updateField={updateNodeData}
      extraFields={
        <p className="node-helper-text">
          Displays a list of all connected Todo nodes and their status.
        </p>
      }
    />
  );
}

export const todoListSummaryNodeDefinition: NodeDefinition = {
  type: 'todoListSummaryNode',
  label: 'Todo List Summary',
  Card: TodoListSummaryNodeCard,
  createData: (count) => ({
    label: `Summary ${count + 1}`,
    note: '',
  }),
  normalizeData: (data, index) => ({
    ...data,
    label: typeof data.label === 'string' ? data.label : `Summary ${index + 1}`,
    note: typeof data.note === 'string' ? data.note : '',
  }),
  renderInspector,
};
