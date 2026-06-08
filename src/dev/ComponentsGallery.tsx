import { useState } from 'react';
import {
  Plus,
  Download,
  Trash2,
  Pencil,
  MoreHorizontal,
  Users,
  Receipt,
  Wallet,
  TrendingUp,
  Search,
  Send,
  Building2,
} from 'lucide-react';
import {
  Button,
  IconButton,
  Input,
  Textarea,
  Select,
  Checkbox,
  Toggle,
  FormField,
  Tabs,
  SegmentedControl,
  Card,
  Chip,
  Spinner,
} from '@ds/primitives';
import {
  Modal,
  ConfirmDialog,
  Skeleton,
  SkeletonTable,
  EmptyState,
  ErrorState,
  toast,
} from '@ds/feedback';
import {
  StatusBadge,
  DateBadge,
  Avatar,
  AvatarStack,
  ProgressBar,
  KPICard,
  DataTable,
  Pagination,
  BulkActionBar,
  InlineEditCell,
  type Column,
} from '@ds/data-display';
import { BarChart, LineChart, DonutChart } from '@ds/charts';
import { DropdownMenu, Popover, CommandMenu } from '@ds/overlays';
import { formatMoney } from '@/lib/format';
import { useUIStore } from '@/app/stores/ui';

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="scroll-mt-20 border-t border-line py-10 first:border-0">
      <div className="mb-5">
        <h2 className="font-display text-lg font-bold text-content">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-content-muted">{subtitle}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="w-40 shrink-0 text-xs font-medium uppercase tracking-wide text-content-subtle">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

interface DemoRow {
  id: string;
  name: string;
  amount: number;
  status: string;
}
const demoRows: DemoRow[] = [
  { id: '1', name: 'Indus Textiles', amount: 450000, status: 'Paid' },
  { id: '2', name: 'Crescent Steel', amount: 230000, status: 'Overdue' },
  { id: '3', name: 'Orient Pharma', amount: 120000, status: 'Partial' },
  { id: '4', name: 'Falcon Tech', amount: 89000, status: 'Draft' },
];

export function ComponentsGallery() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [toggle1, setToggle1] = useState(true);
  const [tab, setTab] = useState('overview');
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rows, setRows] = useState(demoRows);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  const columns: Column<DemoRow>[] = [
    { key: 'name', header: 'Client', sortAccessor: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortAccessor: (r) => r.amount,
      render: (r) => (
        <InlineEditCell
          value={String(r.amount)}
          type="number"
          align="right"
          display={(v) => <span className="nums">{formatMoney(Number(v))}</span>}
          onSave={(v) => {
            setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, amount: Number(v) } : x)));
            toast.success('Amount updated');
          }}
        />
      ),
    },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="min-h-screen bg-app">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-display text-xl font-bold text-content">Design System Gallery</h1>
            <p className="text-sm text-content-muted">/dev/components — every component, every state</p>
          </div>
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {theme === 'light' ? 'Dark' : 'Light'} mode
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 pb-24">
        <Section title="Buttons" subtitle="Variants, sizes, states">
          <Row label="Variants">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="subtle">Subtle</Button>
            <Button variant="danger">Danger</Button>
          </Row>
          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>
          <Row label="With icons">
            <Button icon={Plus}>Add Client</Button>
            <Button variant="outline" icon={Download}>Export</Button>
            <Button variant="ghost" iconRight={Send}>Send</Button>
          </Row>
          <Row label="States">
            <Button loading>Saving</Button>
            <Button disabled>Disabled</Button>
            <IconButton icon={Pencil} label="Edit" />
            <IconButton icon={MoreHorizontal} label="More" variant="outline" />
            <IconButton icon={Trash2} label="Delete" active />
          </Row>
        </Section>

        <Section title="Form controls">
          <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
            <FormField label="Client name" required>
              <Input placeholder="Acme Corp" icon={Building2} />
            </FormField>
            <FormField label="Email" error="Enter a valid email">
              <Input placeholder="you@co.com" invalid />
            </FormField>
            <FormField label="Industry">
              <Select
                placeholder="Select…"
                options={[
                  { value: 'tech', label: 'Technology' },
                  { value: 'retail', label: 'Retail' },
                ]}
              />
            </FormField>
            <FormField label="Search">
              <Input icon={Search} placeholder="Search…" affix={<kbd className="text-2xs">⌘K</kbd>} />
            </FormField>
            <FormField label="Notes" className="sm:col-span-2">
              <Textarea placeholder="Add a note…" />
            </FormField>
          </div>
          <Row label="Toggles">
            <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /> Checkbox</label>
            <label className="flex items-center gap-2 text-sm"><Checkbox indeterminate /> Indeterminate</label>
            <Toggle checked={toggle1} onChange={setToggle1} label="Auto-invoice" />
          </Row>
        </Section>

        <Section title="Tabs & segmented control">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { value: 'overview', label: 'Overview' },
              { value: 'invoices', label: 'Invoices', count: 12 },
              { value: 'statement', label: 'Statement' },
            ]}
          />
          <div className="flex gap-4">
            <Tabs
              variant="pills"
              value={tab}
              onChange={setTab}
              items={[
                { value: 'overview', label: 'All' },
                { value: 'invoices', label: 'Unread' },
              ]}
            />
            <SegmentedControl
              value={view}
              onChange={setView}
              segments={[
                { value: 'list', label: 'List' },
                { value: 'board', label: 'Board' },
                { value: 'cal', label: 'Calendar' },
              ]}
            />
          </div>
        </Section>

        <Section title="Status & badges">
          <Row label="Statuses">
            {['Active', 'Pending', 'Paid', 'Overdue', 'Draft', 'Sent', 'Partial', 'Inactive', 'Cancelled'].map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </Row>
          <Row label="Date badges">
            <DateBadge date={new Date(Date.now() - 5 * 864e5).toISOString()} />
            <DateBadge date={new Date(Date.now() + 3 * 864e5).toISOString()} />
            <DateBadge date={new Date(Date.now() + 40 * 864e5).toISOString()} />
          </Row>
          <Row label="Chips">
            <Chip tone="brand">urgent</Chip>
            <Chip tone="info">design</Chip>
            <Chip tone="success" dot="#22c55e">backend</Chip>
            <Chip onRemove={() => undefined}>removable</Chip>
          </Row>
          <Row label="Avatars">
            <Avatar name="Faisal Malik" size="sm" />
            <Avatar name="Sara Khan" status="online" />
            <Avatar name="Omar Raza" size="lg" />
            <AvatarStack names={['Faisal Malik', 'Sara Khan', 'Omar Raza', 'Nida Sheikh', 'Bilal Iqbal']} />
          </Row>
          <Row label="Progress">
            <div className="w-64 space-y-2">
              <ProgressBar value={35} />
              <ProgressBar value={72} autoTone />
              <ProgressBar value={104} autoTone />
            </div>
          </Row>
        </Section>

        <Section title="KPI cards" subtitle="Numbers count up on mount">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard label="Total Employees" value={24} format={(n) => String(Math.round(n))} icon={Users} delta={{ value: '+3', direction: 'up' }} tone="brand" />
            <KPICard label="Total Invoiced" value={4850000} format={(n) => formatMoney(n)} icon={Receipt} tone="info" delta={{ value: '12%', direction: 'up' }} />
            <KPICard label="Payroll MTD" value={2310000} format={(n) => formatMoney(n)} icon={Wallet} tone="success" />
            <KPICard label="Expenses" value={890000} format={(n) => formatMoney(n)} icon={TrendingUp} tone="warning" delta={{ value: '8%', direction: 'down', positive: true }} />
            <KPICard label="Loading" value="" loading />
            <KPICard label="No data" value="—" empty icon={Users} />
          </div>
        </Section>

        <Section title="Charts" subtitle="Animate on draw & on data change">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <p className="mb-3 text-sm font-semibold">Revenue by client</p>
              <BarChart
                xKey="month"
                valueFormatter={(v) => formatMoney(v, 'PKR', { compact: true })}
                data={[
                  { month: 'Jan', Indus: 320000, Crescent: 210000 },
                  { month: 'Feb', Indus: 280000, Crescent: 190000 },
                  { month: 'Mar', Indus: 410000, Crescent: 240000 },
                  { month: 'Apr', Indus: 360000, Crescent: 300000 },
                ]}
                series={[
                  { key: 'Indus', name: 'Indus Textiles' },
                  { key: 'Crescent', name: 'Crescent Steel' },
                ]}
              />
            </Card>
            <Card>
              <p className="mb-3 text-sm font-semibold">Attendance trend</p>
              <LineChart
                xKey="day"
                data={[
                  { day: 'Mon', Present: 20, Absent: 2, Leave: 1 },
                  { day: 'Tue', Present: 18, Absent: 3, Leave: 2 },
                  { day: 'Wed', Present: 21, Absent: 1, Leave: 1 },
                  { day: 'Thu', Present: 19, Absent: 2, Leave: 2 },
                  { day: 'Fri', Present: 22, Absent: 0, Leave: 1 },
                ]}
                series={[
                  { key: 'Present', name: 'Present', color: '#22c55e' },
                  { key: 'Absent', name: 'Absent', color: '#ef4444' },
                  { key: 'Leave', name: 'Leave', color: '#f59e0b' },
                ]}
              />
            </Card>
            <Card>
              <p className="mb-3 text-sm font-semibold">Expense breakdown</p>
              <DonutChart
                centerLabel={formatMoney(890000, 'PKR', { compact: true })}
                centerSubLabel="Total"
                valueFormatter={(v) => formatMoney(v)}
                data={[
                  { name: 'Rent', value: 300000 },
                  { name: 'Utilities', value: 180000 },
                  { name: 'Marketing', value: 220000 },
                  { name: 'Travel', value: 190000 },
                ]}
              />
            </Card>
          </div>
        </Section>

        <Section title="Data table" subtitle="Sortable, selectable, inline-edit, bulk actions">
          <DataTable
            data={rows}
            columns={columns}
            rowKey={(r) => r.id}
            selectable
            selectedIds={selected}
            onSelectionChange={setSelected}
            sort={{ key: 'name', dir: 'asc' }}
            onSortChange={() => undefined}
          />
          <Pagination page={1} pageSize={25} total={128} onPageChange={() => undefined} onPageSizeChange={() => undefined} />
          <BulkActionBar count={selected.size} onClear={() => setSelected(new Set())}>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 dark:text-content">Mark Paid</Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 dark:text-content">Export</Button>
          </BulkActionBar>
        </Section>

        <Section title="Loading / empty / error states">
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-content-subtle">Skeleton</p>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
            <EmptyState
              size="sm"
              icon={Users}
              title="No clients yet"
              description="Add your first client to start tracking revenue."
              action={<Button size="sm" icon={Plus}>Add Client</Button>}
            />
            <ErrorState size="sm" onRetry={() => toast.info('Retrying…')} />
          </div>
          <SkeletonTable rows={3} cols={4} />
        </Section>

        <Section title="Overlays & feedback">
          <Row label="Triggers">
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>Confirm Dialog</Button>
            <Button variant="outline" onClick={() => setCmdOpen(true)}>Command Menu</Button>
            <DropdownMenu
              trigger={<Button variant="outline" icon={MoreHorizontal}>Menu</Button>}
              items={[
                { label: 'Edit', icon: Pencil },
                { label: 'Export', icon: Download },
                'divider',
                { label: 'Delete', icon: Trash2, danger: true },
              ]}
            />
            <Popover trigger={<Button variant="ghost">Popover</Button>}>
              <div className="w-56 p-3 text-sm text-content-muted">Any content can live in a popover.</div>
            </Popover>
          </Row>
          <Row label="Toasts">
            <Button size="sm" variant="outline" onClick={() => toast.success('Client saved')}>Success</Button>
            <Button size="sm" variant="outline" onClick={() => toast.error('Could not save. Try again.')}>Error</Button>
            <Button size="sm" variant="outline" onClick={() => toast.warning('This exceeds the credit limit')}>Warning</Button>
            <Button size="sm" variant="outline" onClick={() => toast.info('Generating PDF…', { action: { label: 'Undo', onClick: () => undefined } })}>With action</Button>
          </Row>
          <Row label="Inline">
            <Spinner /> <span className="text-sm text-content-muted">Spinner</span>
          </Row>
        </Section>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Client"
        description="Add a new client to your roster"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => { setModalOpen(false); toast.success('Client created'); }}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Client name" required><Input placeholder="Acme Corp" /></FormField>
          <FormField label="Email"><Input placeholder="you@co.com" /></FormField>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          toast.success('Deleted');
        }}
        title="Delete this client?"
        message="This will soft-delete the client and all related records can be restored later."
        confirmLabel="Delete"
      />

      <CommandMenu
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        groups={[
          {
            heading: 'Navigate',
            items: [
              { id: 'd', label: 'Dashboard', icon: TrendingUp, onSelect: () => toast.info('Dashboard') },
              { id: 'c', label: 'Clients', icon: Users, onSelect: () => toast.info('Clients') },
              { id: 'i', label: 'Invoices', icon: Receipt, onSelect: () => toast.info('Invoices') },
            ],
          },
        ]}
      />
    </div>
  );
}
