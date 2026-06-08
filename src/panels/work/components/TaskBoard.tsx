import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AvatarStack, StatusBadge } from '@ds/data-display';
import { Chip } from '@ds/primitives';
import { DateBadge } from '@ds/data-display';
import type { Task, TaskStatus } from '@/types';

const COLUMNS: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done'];

/** Basic kanban (P0): native drag-and-drop between status columns with a card lift. */
export function TaskBoard({
  tasks,
  onOpen,
  onStatusChange,
}: {
  tasks: Task[];
  onOpen: (t: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<TaskStatus | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col || (col === 'To Do' && t.status === 'Backlog'));
        const hours = items.reduce((s, t) => s + t.hoursLogged, 0);
        return (
          <div
            key={col}
            onDragOver={(e) => { e.preventDefault(); setOverCol(col); }}
            onDragLeave={() => setOverCol((c) => (c === col ? null : c))}
            onDrop={() => { if (dragId) onStatusChange(dragId, col); setDragId(null); setOverCol(null); }}
            className={cn(
              'flex flex-col rounded-xl border bg-surface-sunken/40 p-2 transition-colors',
              overCol === col ? 'border-brand-400 bg-brand-50/40' : 'border-line',
            )}
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="flex items-center gap-2 text-sm font-semibold text-content">
                {col}
                <span className="nums rounded-full bg-surface px-1.5 text-2xs text-content-muted">{items.length}</span>
              </span>
              <span className="nums text-2xs text-content-subtle">{hours}h</span>
            </div>

            <div className="flex min-h-[80px] flex-col gap-2 p-1">
              {items.map((t) => (
                <motion.div
                  layout
                  key={t.id}
                  draggable
                  onDragStart={() => setDragId(t.id)}
                  onDragEnd={() => { setDragId(null); setOverCol(null); }}
                  onClick={() => onOpen(t)}
                  whileHover={{ y: -2 }}
                  className={cn(
                    'cursor-grab rounded-lg border border-line bg-surface p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing',
                    dragId === t.id && 'rotate-2 opacity-60 shadow-lg',
                  )}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug text-content">{t.title}</p>
                  </div>
                  {t.labels.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">{t.labels.map((l) => <Chip key={l} tone="brand" className="text-2xs">{l}</Chip>)}</div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={t.priority} dot size="sm" tone={t.priority === 'Urgent' ? 'danger' : t.priority === 'High' ? 'warning' : 'neutral'} />
                      {t.dueDate && <DateBadge date={t.dueDate} />}
                    </div>
                    <div className="flex items-center gap-2 text-2xs text-content-subtle">
                      {t.comments.length > 0 && <span className="flex items-center gap-0.5"><MessageSquare size={11} />{t.comments.length}</span>}
                      <AvatarStack names={t.assignees} max={3} size="xs" />
                    </div>
                  </div>
                </motion.div>
              ))}
              {items.length === 0 && (
                <div className="flex items-center justify-center gap-1.5 py-6 text-2xs text-content-subtle">
                  <Calendar size={12} /> No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
