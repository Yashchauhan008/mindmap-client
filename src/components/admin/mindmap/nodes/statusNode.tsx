/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseCustomNode, TextAndNoteFields } from './shared';
import type { AnyNode, NodeDefinition, NodeInspectorContext } from './types';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select } from '../../../ui/select';
import { Switch } from '../../../ui/switch';

function parseStatuses(raw: string) {
  return raw
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function StatusNodeCard({ data, selected }: NodeProps<AnyNode>) {
  const statuses = Array.isArray(data?.statusValues)
    ? (data.statusValues as unknown[]).map((item) => String(item).trim()).filter(Boolean)
    : parseStatuses(String(data?.statusText || ''));
  const mainStatus = String(data?.mainStatus || statuses[0] || '').trim();

  return (
    <BaseCustomNode
      selected={selected}
      tone="purple"
      title={(data?.label as string) || 'Status'}
      subtitle={`${statuses.length} statuses available`}
      note={(data?.note as string) || ''}
      extraContent={
        statuses.length > 0 ? (
          <div className="status-chip-list">
            {statuses.slice(0, 4).map((status) => (
              <span key={status} className={`status-chip ${status === mainStatus ? 'main' : ''}`}>
                {status}
              </span>
            ))}
            {statuses.length > 4 ? <span className="status-chip muted">+{statuses.length - 4}</span> : null}
          </div>
        ) : (
          <p className="node-helper-text">Add statuses in inspector</p>
        )
      }
    />
  );
}

function StatusInspector({ node, updateNodeData }: NodeInspectorContext) {
  const statuses = Array.isArray(node.data.statusValues)
    ? (node.data.statusValues as unknown[]).map((item) => String(item).trim()).filter(Boolean)
    : parseStatuses(String(node.data.statusText || ''));
  const mainStatus = String(node.data.mainStatus || statuses[0] || '');
  const [pendingStatus, setPendingStatus] = useState('');

  return (
    <TextAndNoteFields
      nodeId={node.id}
      label={(node.data.label as string) || ''}
      note={(node.data.note as string) || ''}
      updateField={updateNodeData}
      extraFields={
        <>
          <Label htmlFor={`node-status-input-${node.id}`}>Add status</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`node-status-input-${node.id}`}
              value={pendingStatus}
              onChange={(event) => setPendingStatus(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                const next = pendingStatus.trim();
                if (!next) return;
                if (statuses.includes(next)) {
                  setPendingStatus('');
                  return;
                }
                const nextStatuses = [...statuses, next];
                updateNodeData(node.id, {
                  statusValues: nextStatuses,
                  statusText: nextStatuses.join(', '),
                  mainStatus: mainStatus || next,
                });
                setPendingStatus('');
              }}
              placeholder="Type status and press Enter"
            />
            <Button
              variant="outline"
              onClick={() => {
                const next = pendingStatus.trim();
                if (!next || statuses.includes(next)) return;
                const nextStatuses = [...statuses, next];
                updateNodeData(node.id, {
                  statusValues: nextStatuses,
                  statusText: nextStatuses.join(', '),
                  mainStatus: mainStatus || next,
                });
                setPendingStatus('');
              }}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.length === 0 ? (
              <p className="text-xs text-slate-500">No statuses yet.</p>
            ) : (
              statuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    const nextStatuses = statuses.filter((current) => current !== status);
                    const nextMain = status === mainStatus ? nextStatuses[0] || '' : mainStatus;
                    updateNodeData(node.id, {
                      statusValues: nextStatuses,
                      statusText: nextStatuses.join(', '),
                      mainStatus: nextMain,
                    });
                  }}
                  className={`rounded-full border px-2 py-1 text-xs ${
                    status === mainStatus
                      ? 'border-pink-300 bg-pink-50 text-pink-700'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {status} ×
                </button>
              ))
            )}
          </div>
          <Label htmlFor={`node-main-status-${node.id}`}>Main status</Label>
          <Select
            id={`node-main-status-${node.id}`}
            value={mainStatus}
            onChange={(event) => {
              updateNodeData(node.id, { mainStatus: event.target.value });
            }}
            disabled={statuses.length === 0}
          >
            {statuses.length === 0 ? <option value="">No statuses</option> : null}
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
          <div className="flex items-center justify-between">
            <Label htmlFor={`node-status-edge-visibility-${node.id}`}>Connection strings visible</Label>
            <Switch
              checked={(node.data.showConnections as boolean) !== false}
              onCheckedChange={(checked) => {
                updateNodeData(node.id, { showConnections: checked });
              }}
            />
          </div>
        </>
      }
    />
  );
}

function renderInspector(context: NodeInspectorContext) {
  return <StatusInspector {...context} />;
}

export const statusNodeDefinition: NodeDefinition = {
  type: 'statusNode',
  label: 'Status node',
  Card: StatusNodeCard,
  createData: (count) => ({
    label: `status ${count + 1}`,
    statusText: 'todo, in progress, done',
    statusValues: ['todo', 'in progress', 'done'],
    mainStatus: 'done',
    showConnections: true,
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
  normalizeData: (data, index) => {
    const raw = typeof data.statusText === 'string' ? data.statusText : '';
    const fromArray = Array.isArray(data.statusValues)
      ? (data.statusValues as unknown[]).map((item) => String(item).trim()).filter(Boolean)
      : [];
    const statusValues = fromArray.length > 0 ? fromArray : parseStatuses(raw);
    const fallbackMain = statusValues[0] || '';
    const rawMain = typeof data.mainStatus === 'string' ? data.mainStatus.trim() : '';
    const mainStatus = statusValues.includes(rawMain) ? rawMain : fallbackMain;

    return {
      ...data,
      label: typeof data.label === 'string' ? data.label : `Status ${index + 1}`,
      statusText: raw || statusValues.join(', '),
      statusValues,
      mainStatus,
      showConnections: (data.showConnections as boolean) ?? true,
      completed: Boolean(data.completed),
      url: typeof data.url === 'string' ? data.url : '',
      mediaType: typeof data.mediaType === 'string' ? data.mediaType : 'image',
      mediaUrl: typeof data.mediaUrl === 'string' ? data.mediaUrl : '',
      scale: Number(data.scale || 1),
      videoMuted: Boolean((data.videoMuted as boolean) ?? true),
      videoPaused: Boolean((data.videoPaused as boolean) ?? false),
      options: typeof data.options === 'string' ? data.options : 'yes/no',
      note: typeof data.note === 'string' ? data.note : '',
    };
  },
  renderInspector,
};
