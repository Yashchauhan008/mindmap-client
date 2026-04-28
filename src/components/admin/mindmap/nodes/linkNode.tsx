/* eslint-disable react-refresh/only-export-components */
import type { NodeProps } from '@xyflow/react';
import { BaseCustomNode, TextAndNoteFields } from './shared';
import type { AnyNode, NodeDefinition, NodeInspectorContext } from './types';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';

function LinkNodeCard({ data, selected }: NodeProps<AnyNode>) {
  return (
    <BaseCustomNode
      selected={selected}
      tone="blue"
      title={(data?.label as string) || 'Reference link'}
      subtitle={(data?.url as string) || 'https://example.com'}
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
      extraFields={
        <>
          <Label htmlFor={`node-url-${node.id}`}>URL</Label>
          <Input
            id={`node-url-${node.id}`}
            value={(node.data.url as string) || ''}
            onChange={(event) => {
              updateNodeData(node.id, { url: event.target.value });
            }}
            placeholder="https://example.com"
          />
        </>
      }
    />
  );
}

export const linkNodeDefinition: NodeDefinition = {
  type: 'linkNode',
  label: 'Link node',
  Card: LinkNodeCard,
  createData: (count) => ({
    label: `link ${count + 1}`,
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
    label: typeof data.label === 'string' ? data.label : `Link ${index + 1}`,
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
