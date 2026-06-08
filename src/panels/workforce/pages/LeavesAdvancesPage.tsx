import { useState } from 'react';
import { Plane, HandCoins, Check, X } from 'lucide-react';
import { PageHeader, KpiStrip, useFormatMoney } from '@/shared';
import { Button, Tabs } from '@ds/primitives';
import { KPICard, DataTable, StatusBadge, Avatar, type Column } from '@ds/data-display';
import { EmptyState, toast } from '@ds/feedback';
import { formatDate } from '@/lib/format';
import { useLeaves, useAdvances, useLeaveMutations } from '../hooks';
import type { Advance, Leave } from '@/types';

export function LeavesAdvancesPage() {
  const money = useFormatMoney();
  const [tab, setTab] = useState('leaves');
  const { data: leaves = [], isLoading: loadingLeaves } = useLeaves();
  const { data: advances = [], isLoading: loadingAdvances } = useAdvances();
  const { setStatus } = useLeaveMutations();

  const pendingLeaves = leaves.filter((l) => l.status === 'Pending').length;
  const pendingAdvances = advances.filter((a) => a.status === 'Pending').length;
  const totalAdvance = advances.reduce((s, a) => s + a.amount, 0);

  const leaveCols: Column<Leave>[] = [
    { key: 'employee', header: 'Employee', render: (l) => <div className="flex items-center gap-2.5"><Avatar name={l.employeeName} size="sm" /><span className="font-medium">{l.employeeName}</span></div> },
    { key: 'type', header: 'Type', render: (l) => <StatusBadge status={l.type} dot={false} size="sm" tone="neutral" /> },
    { key: 'from', header: 'From', render: (l) => formatDate(l.from) },
    { key: 'to', header: 'To', render: (l) => formatDate(l.to) },
    { key: 'days', header: 'Days', align: 'center', render: (l) => <span className="nums">{l.days}</span> },
    { key: 'reason', header: 'Reason', render: (l) => <span className="text-content-muted">{l.reason}</span> },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.status} /> },
    {
      key: 'actions', header: '', align: 'right',
      render: (l) =>
        l.status === 'Pending' ? (
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="ghost" icon={Check} onClick={async () => { await setStatus.mutateAsync({ id: l.id, status: 'Approved' }); toast.success('Leave approved'); }}>Approve</Button>
            <Button size="sm" variant="ghost" icon={X} onClick={async () => { await setStatus.mutateAsync({ id: l.id, status: 'Rejected' }); toast.info('Leave rejected'); }}>Reject</Button>
          </div>
        ) : (
          <span className="text-2xs text-content-subtle">{l.approver}</span>
        ),
    },
  ];

  const advanceCols: Column<Advance>[] = [
    { key: 'employee', header: 'Employee', render: (a) => <div className="flex items-center gap-2.5"><Avatar name={a.employeeName} size="sm" /><span className="font-medium">{a.employeeName}</span></div> },
    { key: 'date', header: 'Date', render: (a) => formatDate(a.date) },
    { key: 'amount', header: 'Amount', align: 'right', render: (a) => <span className="nums font-medium">{money(a.amount)}</span> },
    { key: 'reason', header: 'Reason', render: (a) => <span className="text-content-muted">{a.reason}</span> },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Leaves & Advances" description="Approve leave requests and track salary advances." />

      <KpiStrip cols={3}>
        <KPICard label="Pending Leaves" value={pendingLeaves} format={(n) => String(Math.round(n))} icon={Plane} tone="warning" />
        <KPICard label="Pending Advances" value={pendingAdvances} format={(n) => String(Math.round(n))} icon={HandCoins} tone="info" />
        <KPICard label="Total Advance" value={totalAdvance} format={(n) => money(n, { compact: true })} icon={HandCoins} tone="brand" />
      </KpiStrip>

      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'leaves', label: 'Leaves', count: leaves.length },
          { value: 'advances', label: 'Advances', count: advances.length },
        ]}
      />

      {tab === 'leaves' ? (
        <DataTable data={leaves} columns={leaveCols} rowKey={(l) => l.id} loading={loadingLeaves} empty={<EmptyState icon={Plane} title="No leave requests" description="Leave applications will appear here." />} />
      ) : (
        <DataTable data={advances} columns={advanceCols} rowKey={(a) => a.id} loading={loadingAdvances} empty={<EmptyState icon={HandCoins} title="No advances" description="Salary advances will appear here." />} />
      )}
    </div>
  );
}
