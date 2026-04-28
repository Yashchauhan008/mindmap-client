/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { useReactFlow, type NodeProps } from '@xyflow/react';
import { BaseCustomNode, TextAndNoteFields } from './shared';
import type { AnyNode, NodeDefinition, NodeInspectorContext } from './types';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';

type MultiTodoItem = {
  id: string;
  text: string;
  done: boolean;
};

function toMultiTodoItems(value: unknown): MultiTodoItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;

      const candidate = item as Record<string, unknown>;
      const text = typeof candidate.text === 'string' ? candidate.text.trim() : '';
      if (!text) return null;

      return {
        id:
          typeof candidate.id === 'string' && candidate.id.trim()
            ? candidate.id
            : `todo-${index}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        done: Boolean(candidate.done),
      } as MultiTodoItem;
    })
    .filter((item): item is MultiTodoItem => Boolean(item));
}

function getOutputMetrics(items: MultiTodoItem[]) {
  const total = items.length;
  const toggled = items.filter((item) => item.done).length;
  const output = total === 0 ? 0 : Math.round((toggled / total) * 100);

  return { total, toggled, output };
}

function MultiTodoNodeCard({ id, data, selected }: NodeProps<AnyNode>) {
  const reactFlow = useReactFlow<AnyNode>();
  const todos = toMultiTodoItems(data?.todos);
  const { total, toggled, output } = getOutputMetrics(todos);

  return (
    <BaseCustomNode
      selected={selected}
      tone="amber"
      width={320}
      title={(data?.label as string) || 'Multi Todo'}
      subtitle={`Toggled ${toggled}/${total} • Output ${output}%`}
      note={(data?.note as string) || ''}
      extraContent={
        <div className="multi-todo-card-list">
          {todos.length === 0 ? <p className="node-helper-text">No todos yet</p> : null}
          {todos.slice(0, 15).map((item) => (
            <button
              key={item.id}
              type="button"
              className={`node-inline-thumb-toggle nodrag nopan multi-todo-badge ${item.done ? 'active' : ''}`}
              aria-pressed={item.done}
              onClick={() => {
                const nextTodos = todos.map((todo) =>
                  todo.id === item.id ? { ...todo, done: !todo.done } : todo,
                );
                reactFlow.setNodes((currentNodes) =>
                  currentNodes.map((node) =>
                    node.id === id
                      ? {
                          ...node,
                          data: {
                            ...node.data,
                            todos: nextTodos,
                          },
                        }
                      : node,
                  ),
                );
              }}
            >
              <span className="thumb-icon" aria-hidden>
                {item.done ? '✓' : '○'}
              </span>
              <span
                className="thumb-label multi-todo-card-text"
                style={{ textDecoration: item.done ? 'line-through' : 'none' }}
              >
                {item.text}
              </span>
            </button>
          ))}
          {todos.length > 15 ? <span className="status-chip muted">+{todos.length - 15} more</span> : null}
        </div>
      }
    />
  );
}

function MultiTodoInspector({ node, updateNodeData }: NodeInspectorContext) {
  const [pendingTodo, setPendingTodo] = useState('');
  const todos = toMultiTodoItems(node.data.todos);
  const { total, toggled, output } = getOutputMetrics(todos);

  return (
    <TextAndNoteFields
      nodeId={node.id}
      label={(node.data.label as string) || ''}
      note={(node.data.note as string) || ''}
      updateField={updateNodeData}
      extraFields={
        <>
          <Label htmlFor={`node-multi-todo-input-${node.id}`}>Todos</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`node-multi-todo-input-${node.id}`}
              value={pendingTodo}
              onChange={(event) => setPendingTodo(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                const text = pendingTodo.trim();
                if (!text) return;

                updateNodeData(node.id, {
                  todos: [...todos, { id: crypto.randomUUID(), text, done: false }],
                });
                setPendingTodo('');
              }}
              placeholder="Type todo and press Enter"
            />
            <Button
              variant="outline"
              onClick={() => {
                const text = pendingTodo.trim();
                if (!text) return;
                updateNodeData(node.id, {
                  todos: [...todos, { id: crypto.randomUUID(), text, done: false }],
                });
                setPendingTodo('');
              }}
            >
              Add
            </Button>
          </div>

          <div className="multi-todo-list space-y-2">
            {todos.length === 0 ? (
              <p className="text-xs text-slate-500">No todos yet.</p>
            ) : (
              todos.map((todo) => (
                <div key={todo.id} className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                  <Label className="checkbox-row" style={{ marginBottom: 0, flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={(event) => {
                        const nextTodos = todos.map((item) =>
                          item.id === todo.id ? { ...item, done: event.target.checked } : item,
                        );
                        updateNodeData(node.id, { todos: nextTodos });
                      }}
                    />
                    <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>{todo.text}</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      updateNodeData(node.id, { todos: todos.filter((item) => item.id !== todo.id) });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Toggled output: {toggled}/{total} ({output}%)
          </div>
        </>
      }
    />
  );
}

function renderInspector(context: NodeInspectorContext) {
  return <MultiTodoInspector {...context} />;
}

export const multiTodoNodeDefinition: NodeDefinition = {
  type: 'multiTodoNode',
  label: 'Multi todo node',
  Card: MultiTodoNodeCard,
  createData: (count) => ({
    label: `multi todo ${count + 1}`,
    todos: [
      { id: crypto.randomUUID(), text: 'Todo 1', done: false },
      { id: crypto.randomUUID(), text: 'Todo 2', done: false },
    ],
    note: '',
  }),
  normalizeData: (data, index) => ({
    ...data,
    label: typeof data.label === 'string' ? data.label : `Multi todo ${index + 1}`,
    todos: toMultiTodoItems(data.todos),
    note: typeof data.note === 'string' ? data.note : '',
  }),
  renderInspector,
};
