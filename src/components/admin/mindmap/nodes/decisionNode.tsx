/* eslint-disable react-refresh/only-export-components */
import { useReactFlow, useStore, type NodeProps } from '@xyflow/react';
import { withAllHandles } from './shared';
import type { AnyNode, NodeDefinition, NodeInspectorContext } from './types';
import { Switch } from '../../../ui/switch';
import { computeNodeOutput, countIncomingFunctionalInputs } from './outputResolver';

function DecisionNodeCard({ id, data, selected }: NodeProps<AnyNode>) {
  const reactFlow = useReactFlow<AnyNode>();
  const nodes = useStore((state) => state.nodes as AnyNode[]);
  const edges = useStore((state) => state.edges);
  const nodeMap = new Map(nodes.map((node) => [node.id, node] as const));
  const decisionValue = String(data?.decisionValue || 'yes');
  const outputValue = computeNodeOutput(id, nodeMap, edges) ?? 0;
  const inputCount = countIncomingFunctionalInputs(id, nodeMap, edges);

  const setDecisionValue = (nextValue: 'yes' | 'no') => {
    reactFlow.setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                decisionValue: nextValue,
              },
            }
          : node,
      ),
    );
  };

  return (
    <div
      className={`mind-node-card ${selected ? 'selected' : ''}`}
      style={{
        width: '130px',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: decisionValue === 'yes' ? '#ecfdf5' : '#fff1f2',
        borderColor: decisionValue === 'yes' ? '#86efac' : '#fecdd3',
      }}
    >
      {withAllHandles()}
      <div className="row" style={{ gap: 10 }}>
        <Switch
          checked={decisionValue === 'yes'}
          onCheckedChange={(checked) => {
            setDecisionValue(checked ? 'yes' : 'no');
          }}
        />
        <span className="text-xs text-slate-500">{outputValue}% ({inputCount})</span>
      </div>
    </div>
  );
}

function renderInspector({ node, updateNodeData }: NodeInspectorContext) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">Decision output</p>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        {/* <span className="text-sm text-slate-700">{(node.data.decisionValue as string) === 'yes' ? 'Yes' : 'No'}</span> */}
        <Switch
          checked={(node.data.decisionValue as string) !== 'no'}
          onCheckedChange={(checked) => {
            updateNodeData(node.id, { decisionValue: checked ? 'yes' : 'no' });
          }}
        />
      </div>
    </div>
  );
}

export const decisionNodeDefinition: NodeDefinition = {
  type: 'decisionNode',
  label: 'Decision node',
  Card: DecisionNodeCard,
  createData: (count) => ({
    label: `decision ${count + 1}`,
    completed: false,
    url: '',
    mediaType: 'image',
    mediaUrl: '',
    scale: 1,
    videoMuted: true,
    videoPaused: false,
    decisionValue: 'yes',
    options: 'yes/no',
    note: '',
  }),
  normalizeData: (data, index) => ({
    ...data,
    label: typeof data.label === 'string' ? data.label : `Decision ${index + 1}`,
    completed: Boolean(data.completed),
    url: typeof data.url === 'string' ? data.url : '',
    mediaType: typeof data.mediaType === 'string' ? data.mediaType : 'image',
    mediaUrl: typeof data.mediaUrl === 'string' ? data.mediaUrl : '',
    scale: Number(data.scale || 1),
    videoMuted: Boolean((data.videoMuted as boolean) ?? true),
    videoPaused: Boolean((data.videoPaused as boolean) ?? false),
    decisionValue: typeof data.decisionValue === 'string' ? data.decisionValue : 'yes',
    options: typeof data.options === 'string' ? data.options : 'yes/no',
    note: typeof data.note === 'string' ? data.note : '',
  }),
  renderInspector,
};
