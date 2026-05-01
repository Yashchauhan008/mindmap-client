/* eslint-disable react-refresh/only-export-components */
import { Handle, Position } from '@xyflow/react';
import type { ReactNode } from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';

export function withAllHandles() {
  return (
    <>
      <Handle id="target-left" type="target" position={Position.Left} />
      <Handle id="source-left" type="source" position={Position.Left} />
      <Handle id="target-top" type="target" position={Position.Top} />
      <Handle id="source-top" type="source" position={Position.Top} />
      <Handle id="target-right" type="target" position={Position.Right} />
      <Handle id="source-right" type="source" position={Position.Right} />
      <Handle id="target-bottom" type="target" position={Position.Bottom} />
      <Handle id="source-bottom" type="source" position={Position.Bottom} />
    </>
  );
}

export function BaseCustomNode({
  selected,
  title,
  subtitle,
  note,
  tone = 'pink',
  imageUrl,
  mediaType,
  videoMuted,
  videoPaused,
  width,
  height,
  extraContent,
  className,
}: {
  selected: boolean;
  title: string;
  subtitle?: string;
  note?: string;
  tone?: 'pink' | 'purple' | 'blue' | 'green' | 'amber';
  imageUrl?: string;
  mediaType?: string;
  videoMuted?: boolean;
  videoPaused?: boolean;
  width?: number;
  height?: number;
  extraContent?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mind-node-card ${tone} ${selected ? 'selected' : ''} ${imageUrl ? 'has-image' : ''} ${className || ''}`}
      style={{
        width: typeof width === 'number' ? `${Math.max(160, width)}px` : undefined,
        minHeight: typeof height === 'number' ? `${Math.max(110, height)}px` : undefined,
      }}
    >
      {withAllHandles()}
      {note?.trim() ? <div className="mind-node-tooltip">{note.trim()}</div> : null}
      <div className="mind-node-title">{title}</div>
      <div className="mind-node-subtitle">{subtitle}</div>
      {extraContent}
      {imageUrl && mediaType === 'video' ? (
        <video
          className="node-video-preview"
          src={imageUrl}
          autoPlay={!videoPaused}
          loop
          muted={videoMuted ?? true}
          playsInline
          controls={false}
        />
      ) : null}
      {imageUrl && mediaType !== 'video' ? <img className="node-image-preview" src={imageUrl} alt={title} /> : null}
    </div>
  );
}

export function TextAndNoteFields({
  nodeId,
  label,
  note,
  updateField,
  extraFields,
}: {
  nodeId: string;
  label: string;
  note: string;
  updateField: (nodeId: string, patch: Record<string, unknown>) => void;
  extraFields?: ReactNode;
}) {
  return (
    <>
      <Label htmlFor={`node-label-${nodeId}`}>Node text</Label>
      <Input
        id={`node-label-${nodeId}`}
        value={label}
        onChange={(event) => {
          updateField(nodeId, { label: event.target.value });
        }}
        placeholder="Write your idea..."
      />

      {extraFields}

      <Label htmlFor={`node-note-${nodeId}`}>Note</Label>
      <Textarea
        id={`node-note-${nodeId}`}
        value={note}
        onChange={(event) => {
          updateField(nodeId, { note: event.target.value });
        }}
        rows={3}
        placeholder="Extra details for this node..."
      />
    </>
  );
}
