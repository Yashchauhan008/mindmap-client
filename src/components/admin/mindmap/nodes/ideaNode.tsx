/* eslint-disable react-refresh/only-export-components */
import { useStore, type NodeProps } from '@xyflow/react';
import { BaseCustomNode, TextAndNoteFields } from './shared';
import type { AnyNode, NodeDefinition, NodeInspectorContext } from './types';
import { Label } from '../../../ui/label';
import { Select } from '../../../ui/select';

function IdeaNodeCard({ id, data, selected }: NodeProps<AnyNode>) {
  const nodes = useStore((state) => state.nodes as AnyNode[]);
  const edges = useStore((state) => state.edges);
  const nodeMap = new Map(nodes.map((node) => [node.id, node] as const));
  const statusSet = new Set<string>();

  edges.forEach((edge) => {
    const isConnected = edge.source === id || edge.target === id;
    if (!isConnected) return;
    const peerId = edge.source === id ? edge.target : edge.source;
    const peerNode = nodeMap.get(peerId);
    if (!peerNode || peerNode.type !== 'statusNode') return;

    const peerStatuses = Array.isArray(peerNode.data?.statusValues)
      ? (peerNode.data.statusValues as unknown[]).map((item) => String(item).trim()).filter(Boolean)
      : [];
    peerStatuses.forEach((status) => statusSet.add(status));
  });

  const statuses = Array.from(statusSet);
  const selectedStatus = String(data?.selectedStatus || '').trim();

  return (
    <BaseCustomNode
      selected={selected}
      tone="pink"
      title={(data?.label as string) || 'Untitled idea'}
      subtitle="Drag and connect ideas"
      note={(data?.note as string) || ''}
      extraContent={
        statuses.length > 0 ? (
          <div className="status-chip-list">
            <span className={`status-chip idea ${selectedStatus ? 'main' : 'muted'}`}>
              {selectedStatus || 'No status selected'}
            </span>
          </div>
        ) : null
      }
    />
  );
}

function IdeaInspector({ node, updateNodeData }: NodeInspectorContext) {
  const nodes = useStore((state) => state.nodes as AnyNode[]);
  const edges = useStore((state) => state.edges);
  const nodeMap = new Map(nodes.map((current) => [current.id, current] as const));
  const statusSet = new Set<string>();

  edges.forEach((edge) => {
    const isConnected = edge.source === node.id || edge.target === node.id;
    if (!isConnected) return;
    const peerId = edge.source === node.id ? edge.target : edge.source;
    const peerNode = nodeMap.get(peerId);
    if (!peerNode || peerNode.type !== 'statusNode') return;
    const peerStatuses = Array.isArray(peerNode.data?.statusValues)
      ? (peerNode.data.statusValues as unknown[]).map((item) => String(item).trim()).filter(Boolean)
      : [];
    peerStatuses.forEach((status) => statusSet.add(status));
  });

  const statusOptions = Array.from(statusSet);
  const selectedStatus = String(node.data.selectedStatus || '');
  const safeSelected = statusOptions.includes(selectedStatus) ? selectedStatus : '';

  return (
    <TextAndNoteFields
      nodeId={node.id}
      label={(node.data.label as string) || ''}
      note={(node.data.note as string) || ''}
      updateField={updateNodeData}
      extraFields={
        <>
          <Label htmlFor={`node-idea-status-${node.id}`}>Selected status</Label>
          <Select
            id={`node-idea-status-${node.id}`}
            value={safeSelected}
            onChange={(event) => {
              updateNodeData(node.id, { selectedStatus: event.target.value });
            }}
            disabled={statusOptions.length === 0}
          >
            <option value="">{statusOptions.length ? 'Select status' : 'Connect status node'}</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </>
      }
    />
  );
}

function renderInspector(context: NodeInspectorContext) {
  return <IdeaInspector {...context} />;
}

export const ideaNodeDefinition: NodeDefinition = {
  type: 'ideaNode',
  label: 'Idea node',
  Card: IdeaNodeCard,
  createData: (count) => ({
    label: `idea ${count + 1}`,
    completed: false,
    url: '',
    mediaType: 'image',
    mediaUrl: '',
    scale: 1,
    videoMuted: true,
    videoPaused: false,
    selectedStatus: '',
    options: 'yes/no',
    note: '',
  }),
  normalizeData: (data, index) => ({
    ...data,
    label: typeof data.label === 'string' ? data.label : `Idea ${index + 1}`,
    completed: Boolean(data.completed),
    url: typeof data.url === 'string' ? data.url : '',
    mediaType: typeof data.mediaType === 'string' ? data.mediaType : 'image',
    mediaUrl: typeof data.mediaUrl === 'string' ? data.mediaUrl : '',
    scale: Number(data.scale || 1),
    videoMuted: Boolean((data.videoMuted as boolean) ?? true),
    videoPaused: Boolean((data.videoPaused as boolean) ?? false),
    selectedStatus: typeof data.selectedStatus === 'string' ? data.selectedStatus : '',
    options: typeof data.options === 'string' ? data.options : 'yes/no',
    note: typeof data.note === 'string' ? data.note : '',
  }),
  renderInspector,
};
