import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarCheck, CircleX, Plane, CalendarDays } from 'lucide-react';
import { PageHeader, KpiStrip } from '@/shared';
import { Card, Button } from '@ds/primitives';
import { KPICard } from '@ds/data-display';
import { toast } from '@ds/feedback';
import { cn } from '@/lib/cn';

// Deterministic demo statuses for the month grid.
function statusFor(day: number): 'Present' | 'Absent' | 'Leave' | 'Off' {
  const dow = new Date(2026, 5, day).getDay();
  if (dow === 0 || dow === 6) return 'Off';
  if (day % 11 === 0) return 'Absent';
  if (day % 9 === 0) return 'Leave';
  return 'Present';
}
const COLOR = { Present: 'bg-success/15 text-success-strong', Absent: 'bg-danger/15 text-danger', Leave: 'bg-warning/15 text-warning-strong', Off: 'bg-surface-sunken text-content-subtle' };

export function EmployeeAttendance() {
  const [cursor, setCursor] = useState(new Date('2026-06-01'));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();

  return (
    <div>
      <PageHeader title="My Attendance" description="Your attendance history." actions={<Button variant="outline" onClick={() => toast.success('Correction request sent to your supervisor')}>Raise Correction</Button>} />
      <KpiStrip cols={4}>
        <KPICard label="Present" value={22} format={(n) => String(Math.round(n))} icon={CalendarCheck} tone="success" />
        <KPICard label="Absent" value={1} format={(n) => String(Math.round(n))} icon={CircleX} tone="danger" />
        <KPICard label="On Leave" value={2} format={(n) => String(Math.round(n))} icon={Plane} tone="warning" />
        <KPICard label="Working Days" value={25} format={(n) => String(Math.round(n))} icon={CalendarDays} tone="brand" />
      </KpiStrip>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold">{cursor.toLocaleString('en', { month: 'long', year: 'numeric' })}</h3>
          <div className="flex gap-1">
            <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="rounded-md p-1.5 hover:bg-surface-sunken"><ChevronLeft size={16} /></button>
            <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="rounded-md p-1.5 hover:bg-surface-sunken"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-2xs font-semibold uppercase text-content-subtle">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d} className="py-1">{d}</div>)}</div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: startDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const st = statusFor(day);
            return (
              <div key={day} className={cn('flex aspect-square flex-col items-center justify-center rounded-lg text-sm', COLOR[st])}>
                <span className="nums font-medium">{day}</span>
                {st !== 'Off' && <span className="text-2xs">{st[0]}</span>}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-content-muted">
          {(['Present', 'Absent', 'Leave', 'Off'] as const).map((s) => <span key={s} className="flex items-center gap-1.5"><span className={cn('h-3 w-3 rounded', COLOR[s])} />{s}</span>)}
        </div>
      </Card>
    </div>
  );
}
