import { useState } from 'react';
import { Plus, Send } from 'lucide-react';
import { useHmoClaims, useHmoClaimsStats, useHmoProviders, useSubmitClaim, useCreateClaim, usePatients } from '@/hooks/useApi';
import { Table, StatusBadge, Modal, Field, Spinner, StatCard, Badge, SearchInput } from '@/components/ui';
import { format } from 'date-fns';
import { Shield, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n || 0);

export default function HmoPage() {
  const [activeTab, setActiveTab] = useState<'claims' | 'providers'>('claims');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');

  const { data: claimsData, isLoading } = useHmoClaims({ page, limit: 20, status });
  const { data: stats } = useHmoClaimsStats();
  const { data: providers } = useHmoProviders();
  const { data: patients } = usePatients({ search: patientSearch, limit: 8, patientType: 'hmo' });
  const submitClaim = useSubmitClaim();
  const createClaim = useCreateClaim();
  const { register, handleSubmit, reset } = useForm();

  const claims = claimsData?.data || [];
  const meta = claimsData?.meta;

  const byStatus = (s: string) => stats?.byStatus?.find((r: any) => r.status === s);

  const onCreateClaim = async (data: any) => {
    await createClaim.mutateAsync(data);
    reset(); setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Draft Claims" value={byStatus('draft')?.count || 0} icon={Shield} color="slate" />
        <StatCard label="Submitted" value={byStatus('submitted')?.count || 0} icon={Clock} color="blue" />
        <StatCard label="Approved" value={byStatus('approved')?.count || 0} icon={CheckCircle} color="green" />
        <StatCard label="Rejected" value={byStatus('rejected')?.count || 0} icon={XCircle} color="red" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        {(['claims', 'providers'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === t ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Claims Tab */}
      {activeTab === 'claims' && (
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-800">HMO Claims</h3>
            <div className="flex gap-3">
              <select className="input w-36" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                <option value="">All Status</option>
                {['draft', 'submitted', 'approved', 'rejected', 'queried', 'paid', 'partial'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
                <Plus size={16} /> New Claim
              </button>
            </div>
          </div>

          <Table headers={['Claim No.', 'Patient', 'HMO', 'Service Date', 'Claimed', 'Paid', 'Status', 'Actions']}>
            {claims.map((c: any) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="table-cell font-mono text-xs text-primary-600 font-semibold">{c.claimNo}</td>
                <td className="table-cell">
                  <p className="font-medium text-slate-800">{c.patient?.firstName} {c.patient?.lastName}</p>
                  <p className="text-xs text-slate-400">{c.hmoMemberNo}</p>
                </td>
                <td className="table-cell text-slate-600">{c.hmo?.name}</td>
                <td className="table-cell text-xs text-slate-400">{format(new Date(c.serviceDate), 'dd MMM yyyy')}</td>
                <td className="table-cell font-semibold text-slate-800">{fmt(c.claimedAmount)}</td>
                <td className="table-cell text-emerald-600">{c.paidAmount ? fmt(c.paidAmount) : '—'}</td>
                <td className="table-cell"><StatusBadge status={c.status} /></td>
                <td className="table-cell">
                  {c.status === 'draft' && (
                    <button onClick={() => submitClaim.mutate(c.id)}
                      disabled={submitClaim.isPending}
                      className="btn-outline text-xs py-1 flex items-center gap-1">
                      <Send size={12} /> Submit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </Table>

          {claims.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p>No claims found</p>
            </div>
          )}

          {meta?.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">{meta.total} claims</p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">← Prev</button>
                <span className="text-sm text-slate-500 self-center">{page} / {meta.totalPages}</span>
                <button disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">Next →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-5">HMO Providers</h3>
          <Table headers={['Name', 'Code', 'Phone', 'Email', 'Claim Window', 'Pre-Auth', 'Status']}>
            {(providers || []).map((p: any) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="table-cell font-semibold text-slate-800">{p.name}</td>
                <td className="table-cell font-mono text-xs text-primary-600">{p.shortCode}</td>
                <td className="table-cell text-slate-500">{p.phone || '—'}</td>
                <td className="table-cell text-slate-500 text-xs">{p.email || '—'}</td>
                <td className="table-cell text-slate-600">{p.claimWindowDays} days</td>
                <td className="table-cell">
                  <Badge color={p.preAuthRequired ? 'amber' : 'green'}>
                    {p.preAuthRequired ? 'Required' : 'Not Required'}
                  </Badge>
                </td>
                <td className="table-cell"><Badge color={p.isActive ? 'green' : 'slate'}>{p.isActive ? 'Active' : 'Inactive'}</Badge></td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {/* Create Claim Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create HMO Claim" size="lg">
        <form onSubmit={handleSubmit(onCreateClaim)} className="space-y-4">
          <Field label="Patient">
            <input className="input mb-1" placeholder="Search HMO patient..." value={patientSearch}
              onChange={e => setPatientSearch(e.target.value)} />
            <select className="input" {...register('patientId', { required: true })}>
              <option value="">Select patient</option>
              {patients?.data?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.hospitalId} — {p.firstName} {p.lastName} ({p.hmoName})</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="HMO Provider">
              <select className="input" {...register('hmoId', { required: true })}>
                <option value="">Select HMO</option>
                {providers?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="HMO Member No.">
              <input className="input" {...register('hmoMemberNo', { required: true })} />
            </Field>
            <Field label="Service Date" required>
              <input type="date" className="input" {...register('serviceDate', { required: true })} />
            </Field>
            <Field label="Claimed Amount (₦)" required>
              <input type="number" className="input" {...register('claimedAmount', { required: true })} />
            </Field>
          </div>
          <Field label="Pre-Auth No.">
            <input className="input" {...register('preAuthNo')} placeholder="If applicable" />
          </Field>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
            <button type="submit" disabled={createClaim.isPending} className="btn-primary flex items-center gap-2">
              {createClaim.isPending ? <Spinner size={15} /> : <Plus size={15} />} Create Claim
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
