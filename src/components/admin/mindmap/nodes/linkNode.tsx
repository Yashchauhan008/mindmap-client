/* eslint-disable react-refresh/only-export-components */
import type { NodeProps } from '@xyflow/react';
import { withAllHandles, TextAndNoteFields } from './shared';
import type { AnyNode, NodeDefinition, NodeInspectorContext } from './types';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';

function LinkNodeCard({ data, selected }: NodeProps<AnyNode>) {
  const url = String(data?.url || '').trim();
  const safeUrl = url.startsWith('http') ? url : `https://${url}`;

  return (
    <div
      className={`mind-node-card ${selected ? 'selected' : ''}`}
      style={{
        width: '130px',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#eff6ff',
        borderColor: '#bfdbfe',
        padding: '6px',
      }}
    >
      {withAllHandles()}
      <a
        href={safeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="node-inline-thumb-toggle nodrag nopan active"
        style={{
          textDecoration: 'none',
          width: '100%',
          height: '28px',
          fontSize: '11px',
          gap: '6px',
          margin: 0,
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #dbeafe 0%, #eff6ff 100%)',
          borderColor: '#3b82f6',
          color: '#1d4ed8',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="thumb-icon"
          aria-hidden
          style={{ width: '16px', height: '16px', fontSize: '10px', background: '#3b82f6', color: '#fff' }}
        >
          🔗
        </span>
        <span
          className="thumb-label"
          style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {url ? 'Visit Link' : 'No Link'}
        </span>
      </a>
    </div>
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
