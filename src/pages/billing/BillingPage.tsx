import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useInvoices, useRevenueStats } from '@/hooks/useApi';
import { Table, StatusBadge, SearchInput, PageLoader, EmptyState, StatCard } from '@/components/ui';
import { format } from 'date-fns';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n || 0);

export default function BillingPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [patientType, setPatientType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useInvoices({ page, limit: 20, search, status, patientType });
  const { data: revenue } = useRevenueStats();

  const invoices = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Revenue" value={fmt(revenue?.todayRevenue)} icon={DollarSign} color="green" />
        <StatCard label="Month Invoiced" value={fmt(revenue?.totalInvoiced)} icon={TrendingUp} color="blue" />
        <StatCard label="Month Collected" value={fmt(revenue?.totalCollected)} icon={CheckCircle} color="primary" />
        <StatCard label="Outstanding" value={fmt(revenue?.outstandingBalance)} sub="Unpaid balance" icon={Clock} color="amber" />
      </div>

      {/* Invoice List */}
      <div className="card">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h3 className="font-semibold text-slate-800">Invoices</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search invoice, patient..." />
            <select className="input w-36" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              {['draft', 'pending', 'partial', 'paid', 'cancelled', 'waived'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select className="input w-32" value={patientType} onChange={e => { setPatientType(e.target.value); setPage(1); }}>
              <option value="">All Types</option>
              {['private', 'hmo', 'nhia', 'staff'].map(t => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
            <Link to="/billing/new" className="btn-primary flex items-center gap-2">
              <Plus size={16} /> New Invoice
            </Link>
          </div>
        </div>

        {isLoading ? <PageLoader /> : (
          <>
            <Table headers={['Invoice No.', 'Patient', 'Type', 'Total', 'Paid', 'Balance', 'Status', 'Date', '']}>
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => navigate(`/billing/${inv.id}`)}>
                  <td className="table-cell font-mono text-xs text-primary-600 font-semibold">{inv.invoiceNo}</td>
                  <td className="table-cell">
                    <p className="font-medium text-slate-800">{inv.patient?.firstName} {inv.patient?.lastName}</p>
                    <p className="text-xs text-slate-400">{inv.patient?.hospitalId}</p>
                  </td>
                  <td className="table-cell"><StatusBadge status={inv.patientType} /></td>
                  <td className="table-cell font-semibold text-slate-800">{fmt(inv.totalAmount)}</td>
                  <td className="table-cell text-emerald-600 font-medium">{fmt(inv.amountPaid)}</td>
                  <td className="table-cell">
                    <span className={Number(inv.balanceDue) > 0 ? 'text-red-600 font-bold' : 'text-slate-400'}>
                      {fmt(inv.balanceDue)}
                    </span>
                  </td>
                  <td className="table-cell"><StatusBadge status={inv.status} /></td>
                  <td className="table-cell text-xs text-slate-400">{format(new Date(inv.createdAt), 'dd MMM yyyy')}</td>
                  <td className="table-cell">
                    <Eye size={15} className="text-slate-400 hover:text-primary-600 transition-colors" />
                  </td>
                </tr>
              ))}
            </Table>
            {invoices.length === 0 && (
              <EmptyState title="No invoices found"
                action={<Link to="/billing/new" className="btn-primary flex items-center gap-2"><Plus size={15} />Create Invoice</Link>} />
            )}
            {meta?.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">{meta.total} invoices</p>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">← Prev</button>
                  <span className="text-sm text-slate-500 self-center">{page} / {meta.totalPages}</span>
                  <button disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
