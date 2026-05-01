/* eslint-disable react-refresh/only-export-components */
import type { NodeProps } from '@xyflow/react';
import { BaseCustomNode, TextAndNoteFields } from './shared';
import type { AnyNode, NodeDefinition, NodeInspectorContext } from './types';

function CategoryNodeCard({ data, selected }: NodeProps<AnyNode>) {
  return (
    <BaseCustomNode
      selected={selected}
      tone="purple"
      title={(data?.label as string) || ''}
      subtitle="Section header / cluster"
      note={(data?.note as string) || ''}
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
    />
  );
}

export const categoryNodeDefinition: NodeDefinition = {
  type: 'categoryNode',
  label: 'Category node',
  Card: CategoryNodeCard,
  createData: (count) => ({
    label: `category ${count + 1}`,
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
    label: typeof data.label === 'string' ? data.label : `Category ${index + 1}`,
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
