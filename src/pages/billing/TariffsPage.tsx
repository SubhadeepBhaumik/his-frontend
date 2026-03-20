// TariffsPage.tsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTariffs } from '@/hooks/useApi';
import { Table, SearchInput, Modal, Field, Spinner } from '@/components/ui';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const fmt = (n: number) => n ? `₦${Number(n).toLocaleString()}` : '—';
const CATS = ['consultation','laboratory','radiology','pharmacy','ward','procedure','theatre','nursing','ambulance','other'];

export function TariffsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { data: tariffs, isLoading } = useTariffs(search, category || undefined);
  const { register, handleSubmit, reset } = useForm();
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (dto: any) => api.post('/billing/tariffs', dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tariffs'] }); toast.success('Tariff created'); reset(); setShowModal(false); },
  });

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-800">Service Tariffs</h3>
          <div className="flex gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search service..." />
            <select className="input w-40" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Add Tariff
            </button>
          </div>
        </div>
        <Table headers={['Code', 'Service', 'Category', 'Private', 'HMO', 'NHIA', 'Staff']}>
          {(tariffs || []).map((t: any) => (
            <tr key={t.id} className="hover:bg-slate-50">
              <td className="table-cell font-mono text-xs text-primary-600">{t.serviceCode}</td>
              <td className="table-cell font-medium text-slate-800">{t.serviceName}</td>
              <td className="table-cell capitalize text-slate-500">{t.category}</td>
              <td className="table-cell font-semibold">{fmt(t.privatePrice)}</td>
              <td className="table-cell text-teal-600">{fmt(t.hmoPrice)}</td>
              <td className="table-cell text-purple-600">{fmt(t.nhiaPrice)}</td>
              <td className="table-cell text-slate-500">{fmt(t.staffPrice)}</td>
            </tr>
          ))}
        </Table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Service Tariff" size="lg">
        <form onSubmit={handleSubmit(d => create.mutate(d))} className="grid grid-cols-2 gap-4">
          <Field label="Service Name" required>
            <input className="input" {...register('serviceName', { required: true })} placeholder="e.g. General Consultation" />
          </Field>
          <Field label="Service Code" required>
            <input className="input" {...register('serviceCode', { required: true })} placeholder="e.g. CONS-OPD" />
          </Field>
          <Field label="Category" required>
            <select className="input" {...register('category', { required: true })}>
              {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </Field>
          <Field label="Private Price (₦)" required>
            <input type="number" className="input" {...register('privatePrice', { required: true })} />
          </Field>
          <Field label="HMO Price (₦)">
            <input type="number" className="input" {...register('hmoPrice')} defaultValue={0} />
          </Field>
          <Field label="NHIA Price (₦)">
            <input type="number" className="input" {...register('nhiaPrice')} defaultValue={0} />
          </Field>
          <Field label="Staff Price (₦)">
            <input type="number" className="input" {...register('staffPrice')} defaultValue={0} />
          </Field>
          <Field label="Description">
            <input className="input" {...register('description')} placeholder="Optional" />
          </Field>
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" disabled={create.isPending} className="btn-primary flex items-center gap-2">
              {create.isPending ? <Spinner size={15} /> : <Plus size={15} />} Create Tariff
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
export default TariffsPage;
