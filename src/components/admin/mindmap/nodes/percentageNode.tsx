/* eslint-disable react-refresh/only-export-components */
import { useStore, type NodeProps } from '@xyflow/react';
import { BaseCustomNode, TextAndNoteFields } from './shared';
import type { AnyNode, NodeDefinition, NodeInspectorContext } from './types';
import { computeNodeOutput, countIncomingFunctionalInputs } from './outputResolver';

function PercentageNodeCard({ id, data, selected }: NodeProps<AnyNode>) {
  const nodes = useStore((state) => state.nodes as AnyNode[]);
  const edges = useStore((state) => state.edges);
  const nodeMap = new Map(nodes.map((node) => [node.id, node] as const));
  const inputCount = countIncomingFunctionalInputs(id, nodeMap, edges);
  const percentage = computeNodeOutput(id, nodeMap, edges) ?? 0;

  return (
    <BaseCustomNode
      selected={selected}
      tone="green"
      title={(data?.label as string) || 'Progress'}
      subtitle={`${percentage}% output (${inputCount} inputs)`}
      note={(data?.note as string) || ''}
      extraContent={
        <div className="percentage-meter">
          <div className="percentage-meter-track">
            <div className="percentage-meter-fill" style={{ width: `${percentage}%` }} />
          </div>
          <div className="percentage-meter-label">{percentage}%</div>
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
          Auto-calculates from connected Todo, Idea, Decision, and Percentage nodes.
        </p>
      }
    />
  );
}

export const percentageNodeDefinition: NodeDefinition = {
  type: 'percentageNode',
  label: 'Percentage node',
  Card: PercentageNodeCard,
  createData: (count) => ({
    label: `progress ${count + 1}`,
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
    label: typeof data.label === 'string' ? data.label : `Progress ${index + 1}`,
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
