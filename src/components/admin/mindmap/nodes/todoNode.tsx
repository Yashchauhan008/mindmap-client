/* eslint-disable react-refresh/only-export-components */
import type { NodeProps } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { BaseCustomNode, TextAndNoteFields } from './shared';
import type { AnyNode, NodeDefinition, NodeInspectorContext } from './types';
import { Label } from '../../../ui/label';

function TodoNodeCard({ id, data, selected }: NodeProps<AnyNode>) {
  const reactFlow = useReactFlow<AnyNode>();
  const completed = Boolean(data?.completed);

  const toggleCompleted = (nextValue: boolean) => {
    reactFlow.setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                completed: nextValue,
              },
            }
          : node,
      ),
    );
  };

  return (
    <BaseCustomNode
      selected={selected}
      tone="amber"
      title={`${completed ? 'Done' : 'Todo'}: ${(data?.label as string) || 'Task'}`}
      subtitle="Checklist node"
      note={(data?.note as string) || ''}
      extraContent={
        <button
          type="button"
          className={`node-inline-thumb-toggle nodrag nopan ${completed ? 'active' : ''}`}
          aria-pressed={completed}
          onClick={() => {
            toggleCompleted(!completed);
          }}
        >
          <span className="thumb-icon" aria-hidden>
            👍
          </span>
          <span className="thumb-label">{completed ? 'Completed' : 'Mark complete'}</span>
        </button>
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
        <>
          <Label className="checkbox-row">
            <input
              type="checkbox"
              checked={Boolean(node.data.completed)}
              onChange={(event) => {
                updateNodeData(node.id, { completed: event.target.checked });
              }}
            />
            Mark todo as completed
          </Label>
        </>
      }
    />
  );
}

export const todoNodeDefinition: NodeDefinition = {
  type: 'todoNode',
  label: 'Todo node',
  Card: TodoNodeCard,
  createData: (count) => ({
    label: `todo ${count + 1}`,
    completed: false,
    url: '',
    mediaType: 'image',
    mediaUrl: '',
    scale: 1,
    videoMuted: true,
    videoPaused: false,
    options: 'yes/no',
    note: '',
  }),
  normalizeData: (data, index) => ({
    ...data,
    label: typeof data.label === 'string' ? data.label : `Todo ${index + 1}`,
    completed: Boolean(data.completed),
    url: typeof data.url === 'string' ? data.url : '',
    mediaType: typeof data.mediaType === 'string' ? data.mediaType : 'image',
    mediaUrl: typeof data.mediaUrl === 'string' ? data.mediaUrl : '',
    scale: Number(data.scale || 1),
    videoMuted: Boolean((data.videoMuted as boolean) ?? true),
    videoPaused: Boolean((data.videoPaused as boolean) ?? false),
    options: typeof data.options === 'string' ? data.options : 'yes/no',
    note: typeof data.note === 'string' ? data.note : '',
  }),
  renderInspector,
};
