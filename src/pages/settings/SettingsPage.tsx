import { useState } from 'react';
import { Save, Building2, Search } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/utils/api';
import { Field, Spinner } from '@/components/ui';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [tab, setTab] = useState<'hospital' | 'icd10'>('hospital');
  const [icdQuery, setIcdQuery] = useState('');
  const [form, setForm] = useState<any>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings/hospital'),
    select: (d: any) => d?.data ?? d,
    onSuccess: (d: any) => setForm(d),
  } as any);

  const { data: icdResults } = useQuery({
    queryKey: ['icd10', icdQuery],
    queryFn: () => api.post('/settings/icd10/search', { query: icdQuery }),
    enabled: icdQuery.length >= 2,
    select: (d: any) => d?.data ?? d,
  });

  const update = useMutation({
    mutationFn: (dto: any) => api.put('/settings/hospital', dto),
    onSuccess: () => toast.success('Settings saved'),
    onError: () => toast.error('Failed to save settings'),
  });

  const handleSave = () => update.mutate(form);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-slate-400">Manage hospital configuration and system settings</p>
      </div>

      <div className="flex gap-2">
        {[{ key: 'hospital', label: 'Hospital Profile' }, { key: 'icd10', label: 'ICD-10 Reference' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'hospital' && (
        <div className="card space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <Building2 size={20} className="text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Hospital Profile</h3>
              <p className="text-xs text-slate-400">This information appears on invoices, receipts, and reports</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Hospital Name">
              <input className="input" value={form?.hospitalName || ''} onChange={e => setForm((f: any) => ({ ...f, hospitalName: e.target.value }))} />
            </Field>
            <Field label="Short Name / Acronym">
              <input className="input" value={form?.hospitalShortName || ''} onChange={e => setForm((f: any) => ({ ...f, hospitalShortName: e.target.value }))} />
            </Field>
            <Field label="Phone Number">
              <input className="input" value={form?.hospitalPhone || ''} onChange={e => setForm((f: any) => ({ ...f, hospitalPhone: e.target.value }))} />
            </Field>
            <Field label="Email Address">
              <input type="email" className="input" value={form?.hospitalEmail || ''} onChange={e => setForm((f: any) => ({ ...f, hospitalEmail: e.target.value }))} />
            </Field>
            <div className="col-span-2">
              <Field label="Address">
                <textarea className="input" rows={2} value={form?.hospitalAddress || ''} onChange={e => setForm((f: any) => ({ ...f, hospitalAddress: e.target.value }))} />
              </Field>
            </div>
            <Field label="NHIA Facility Code">
              <input className="input" value={form?.nhiaCode || ''} onChange={e => setForm((f: any) => ({ ...f, nhiaCode: e.target.value }))} placeholder="Your NHIA-assigned code" />
            </Field>
            <Field label="Currency">
              <select className="input" value={form?.currency || 'NGN'} onChange={e => setForm((f: any) => ({ ...f, currency: e.target.value }))}>
                <option value="NGN">NGN — Nigerian Naira (₦)</option>
                <option value="USD">USD — US Dollar ($)</option>
              </select>
            </Field>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button onClick={handleSave} disabled={update.isPending} className="btn-primary flex items-center gap-2 px-6">
              {update.isPending ? <Spinner size={15} /> : <Save size={15} />} Save Settings
            </button>
          </div>
        </div>
      )}

      {tab === 'icd10' && (
        <div className="card space-y-5">
          <div>
            <h3 className="font-semibold text-slate-800 mb-1">ICD-10 Code Reference</h3>
            <p className="text-xs text-slate-400">Search International Classification of Diseases codes used for diagnosis documentation and HMO billing</p>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search by code (e.g. B50) or description (e.g. malaria)..."
              value={icdQuery} onChange={e => setIcdQuery(e.target.value)} />
          </div>
          {icdQuery.length >= 2 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {(icdResults || []).length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">No results found for "{icdQuery}"</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="table-head w-28">Code</th>
                      <th className="table-head">Description</th>
                      <th className="table-head w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(icdResults || []).map((r: any) => (
                      <tr key={r.code} className="hover:bg-slate-50">
                        <td className="table-cell font-mono font-semibold text-primary-600">{r.code}</td>
                        <td className="table-cell text-slate-700">{r.desc}</td>
                        <td className="table-cell">
                          <button onClick={() => { navigator.clipboard.writeText(r.code); toast.success(`Copied ${r.code}`); }}
                            className="text-xs text-primary-600 hover:underline">Copy</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {icdQuery.length < 2 && (
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              <Search size={24} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Type at least 2 characters to search ICD-10 codes</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
