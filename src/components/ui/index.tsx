import clsx from 'clsx';
import { X, Loader2, InboxIcon } from 'lucide-react';
import { ReactNode } from 'react';

// ── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_COLORS: Record<string, string> = {
  green:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  red:    'bg-red-50 text-red-700 ring-1 ring-red-200',
  amber:  'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  blue:   'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  slate:  'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  teal:   'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
};

export function Badge({ color = 'slate', children }: { color?: string; children: ReactNode }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', BADGE_COLORS[color] || BADGE_COLORS.slate)}>
      {children}
    </span>
  );
}

// Status → color mapping
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  // Appointments
  scheduled: { label:'Scheduled', color:'blue' }, confirmed: { label:'Confirmed', color:'teal' },
  checked_in: { label:'Checked In', color:'purple' }, in_progress: { label:'In Progress', color:'amber' },
  completed: { label:'Completed', color:'green' }, cancelled: { label:'Cancelled', color:'red' },
  no_show: { label:'No Show', color:'slate' },
  // Invoices
  pending: { label:'Pending', color:'amber' }, partial: { label:'Partial', color:'purple' },
  paid: { label:'Paid', color:'green' }, draft: { label:'Draft', color:'slate' }, waived: { label:'Waived', color:'teal' },
  // Orders
  resulted: { label:'Resulted', color:'green' }, processing: { label:'Processing', color:'amber' },
  // Claims
  submitted: { label:'Submitted', color:'blue' }, approved: { label:'Approved', color:'green' },
  rejected: { label:'Rejected', color:'red' }, queried: { label:'Queried', color:'amber' },
  // Patient type
  private: { label:'Private', color:'blue' }, hmo: { label:'HMO', color:'teal' },
  nhia: { label:'NHIA', color:'purple' }, staff: { label:'Staff', color:'slate' },
  dispensed: { label:'Dispensed', color:'green' },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, color: 'slate' };
  return <Badge color={s.color}>{s.label}</Badge>;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm'|'md'|'lg'|'xl';
}) {
  if (!open) return null;
  const widths = { sm:'max-w-md', md:'max-w-lg', lg:'max-w-2xl', xl:'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative bg-white rounded-2xl shadow-2xl w-full flex flex-col max-h-[90vh]', widths[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin text-primary-600" />;
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Spinner size={32} />
        <p className="mt-3 text-sm text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ title, description, action }: {
  title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <InboxIcon size={24} className="text-slate-400" />
      </div>
      <p className="font-semibold text-slate-700">{title}</p>
      {description && <p className="text-sm text-slate-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, color = 'primary' }: {
  label: string; value: string | number; sub?: string; icon: any; color?: string;
}) {
  const colors: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    blue: 'bg-blue-50 text-blue-600', amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600', purple: 'bg-purple-50 text-purple-600',
    teal: 'bg-teal-50 text-teal-600', green: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <div className="card flex items-start gap-4">
      <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', colors[color] || colors.primary)}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Simple Table ──────────────────────────────────────────────────────────────
export function Table({ headers, children, className }: {
  headers: string[]; children: ReactNode; className?: string;
}) {
  return (
    <div className={clsx('overflow-x-auto rounded-xl border border-slate-200', className)}>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>{headers.map(h => <th key={h} className="table-head">{h}</th>)}</tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

// ── Search Input ──────────────────────────────────────────────────────────────
import { Search } from 'lucide-react';
export function SearchInput({ value, onChange, placeholder = 'Search...' }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9 w-64" />
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }: {
  open: boolean; onClose: () => void; onConfirm: () => void;
  title: string; message: string; loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner size={16} /> : 'Confirm'}
        </button>
      </div>
    </Modal>
  );
}

// ── Form Field ────────────────────────────────────────────────────────────────
export function Field({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-slate-700">{title}</h3>
      {action}
    </div>
  );
}
