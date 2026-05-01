/* eslint-disable react-refresh/only-export-components */
import type { NodeProps } from '@xyflow/react';
import { BaseCustomNode, TextAndNoteFields } from './shared';
import type { AnyNode, NodeDefinition, NodeInspectorContext } from './types';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';

function MediaNodeCard({ data, selected }: NodeProps<AnyNode>) {
  const mediaUrl = ((data?.mediaUrl as string) || (data?.imageUrl as string) || '').trim();
  const mediaType = (data?.mediaType as string) || 'image';
  const videoMuted = (data?.videoMuted as boolean) ?? true;
  const videoPaused = (data?.videoPaused as boolean) ?? false;
  const scale = Number((data?.scale as number) || 1);
  const width = Math.round(260 * Math.max(0.6, Math.min(2, scale)));
  const height = Math.round(180 * Math.max(0.6, Math.min(2, scale)));

  return (
    <BaseCustomNode
      selected={selected}
      tone="purple"
      title={(data?.label as string) || ''}
      subtitle={mediaUrl ? `Uploaded ${mediaType}` : 'Upload media from inspector'}
      imageUrl={mediaUrl}
      mediaType={mediaType}
      videoMuted={videoMuted}
      videoPaused={videoPaused}
      width={width}
      height={height}
      note={(data?.note as string) || ''}
    />
  );
}

function renderInspector({
  node,
  updateNodeData,
  mediaUploadPending,
  mediaUploadError,
  uploadMedia,
}: NodeInspectorContext) {
  const isVideo = (node.data.mediaType as string) === 'video';
  const isMuted = (node.data.videoMuted as boolean) ?? true;
  const isPaused = (node.data.videoPaused as boolean) ?? false;

  return (
    <TextAndNoteFields
      nodeId={node.id}
      label={(node.data.label as string) || ''}
      note={(node.data.note as string) || ''}
      updateField={updateNodeData}
      extraFields={
        <>
          <Label htmlFor={`node-image-file-${node.id}`}>Upload image/video</Label>
          <Input
            id={`node-image-file-${node.id}`}
            type="file"
            accept="image/*,video/*"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              await uploadMedia(node.id, file);
              event.target.value = '';
            }}
          />

          {mediaUploadPending ? <p>Uploading image...</p> : null}
          {mediaUploadError ? <p>{mediaUploadError}</p> : null}

          {isVideo ? (
            <div className="row">
              <button
                className="ghost"
                onClick={() => {
                  updateNodeData(node.id, { videoMuted: !isMuted });
                }}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button
                className="ghost"
                onClick={() => {
                  updateNodeData(node.id, { videoPaused: !isPaused });
                }}
              >
                {isPaused ? 'Play' : 'Pause'}
              </button>
            </div>
          ) : null}

          <Label htmlFor={`node-image-scale-${node.id}`}>
            Scale ({Number((node.data.scale as number) || 1).toFixed(1)}x)
          </Label>
          <Input
            id={`node-image-scale-${node.id}`}
            type="range"
            min={0.6}
            max={2}
            step={0.1}
            value={Number((node.data.scale as number) || 1)}
            onChange={(event) => {
              updateNodeData(node.id, { scale: Number(event.target.value || 1) });
            }}
          />
        </>
      }
    />
  );
}

export const mediaNodeDefinition: NodeDefinition = {
  type: 'mediaNode',
  label: 'Media node',
  Card: MediaNodeCard,
  createData: (count) => ({
    label: `media ${count + 1}`,
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
    label: typeof data.label === 'string' ? data.label : `Media ${index + 1}`,
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
