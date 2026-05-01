/* eslint-disable react-refresh/only-export-components */
import { useReactFlow, type NodeProps } from '@xyflow/react';
import { BaseCustomNode, TextAndNoteFields } from './shared';
import type { AnyNode, NodeDefinition, NodeInspectorContext } from './types';
import { Label } from '../../../ui/label';
import { Select } from '../../../ui/select';

function getDaysInMonth(month: number, year: number) {
  // new Date(year, month, 0) returns the last day of the previous month.
  // So if month is 1-indexed, this works perfectly.
  return new Date(year, month, 0).getDate();
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function CalendarNodeCard({ id, data, selected }: NodeProps<AnyNode>) {
  const reactFlow = useReactFlow<AnyNode>();
  const month = Number(data?.month || new Date().getMonth() + 1);
  const year = Number(data?.year || new Date().getFullYear());
  const trackedDates = (data?.trackedDates as Record<string, boolean>) || {};

  const daysCount = getDaysInMonth(month, year);
  const days = Array.from({ length: daysCount }, (_, i) => i + 1);

  const toggleDate = (day: number) => {
    const nextTracked = { ...trackedDates };
    if (nextTracked[day]) {
      delete nextTracked[day];
    } else {
      nextTracked[day] = true;
    }

    reactFlow.setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? {
              ...n,
              data: {
                ...n.data,
                trackedDates: nextTracked,
              },
            }
          : n
      )
    );
  };

  const completedCount = Object.keys(trackedDates).length;
  const progress = Math.round((completedCount / daysCount) * 100);

  return (
    <BaseCustomNode
      selected={selected}
      tone="blue"
      width={280}
      title={(data?.label as string) || `${MONTHS[month - 1]} ${year}`}
      subtitle={`${completedCount}/${daysCount} days tracked (${progress}%)`}
      note={(data?.note as string) || ''}
      extraContent={
        <div className="calendar-grid-container">
          <div className="calendar-grid">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                className={`calendar-day-btn nodrag nopan ${trackedDates[day] ? 'active' : ''}`}
                onClick={() => toggleDate(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      }
    />
  );
}

function CalendarInspector({ node, updateNodeData }: NodeInspectorContext) {
  const month = Number(node.data.month || new Date().getMonth() + 1);
  const year = Number(node.data.year || new Date().getFullYear());

  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);

  return (
    <TextAndNoteFields
      nodeId={node.id}
      label={(node.data.label as string) || ''}
      note={(node.data.note as string) || ''}
      updateField={updateNodeData}
      extraFields={
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor={`month-select-${node.id}`}>Month</Label>
              <Select
                id={`month-select-${node.id}`}
                value={month}
                onChange={(e) => updateNodeData(node.id, { month: Number(e.target.value) })}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor={`year-select-${node.id}`}>Year</Label>
              <Select
                id={`year-select-${node.id}`}
                value={year}
                onChange={(e) => updateNodeData(node.id, { year: Number(e.target.value) })}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
            </div>
          </div>
          <p className="node-helper-text">
            Changing month/year will reset tracked days for this node.
          </p>
          <button
            className="w-full text-xs text-red-500 hover:text-red-700 py-1 border border-red-100 rounded bg-red-50"
            onClick={() => updateNodeData(node.id, { trackedDates: {} })}
          >
            Clear all tracked days
          </button>
        </div>
      }
    />
  );
}

export const calendarNodeDefinition: NodeDefinition = {
  type: 'calendarNode',
  label: 'Habit Tracker',
  Card: CalendarNodeCard,
  createData: (count) => ({
    label: `Habit ${count + 1}`,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    trackedDates: {},
    note: '',
  }),
  normalizeData: (data, index) => ({
    ...data,
    label: typeof data.label === 'string' ? data.label : `Habit ${index + 1}`,
    month: Number(data.month || new Date().getMonth() + 1),
    year: Number(data.year || new Date().getFullYear()),
    trackedDates: (data.trackedDates as Record<string, boolean>) || {},
    note: typeof data.note === 'string' ? data.note : '',
  }),
  renderInspector: (context) => <CalendarInspector {...context} />,
};
