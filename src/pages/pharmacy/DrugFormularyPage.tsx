// DrugFormularyPage.tsx
import { useState } from 'react';
import { useDrugs, useCreateDrug } from '@/hooks/useApi';
import { Table, SearchInput, PageLoader, EmptyState, Modal, Field, Spinner, Badge } from '@/components/ui';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

export function DrugFormularyPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading } = useDrugs({ page, limit:20, search });
  const createDrug = useCreateDrug();
  const { register, handleSubmit, reset } = useForm();
  const drugs = data?.data || [];

  const onSubmit = async (dto:any) => {
    await createDrug.mutateAsync(dto);
    reset(); setShowModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-800">Drug Formulary</h3>
          <div className="flex gap-3">
            <SearchInput value={search} onChange={v=>{setSearch(v);setPage(1);}} placeholder="Search drugs..."/>
            <button onClick={()=>setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16}/>Add Drug</button>
          </div>
        </div>
        {isLoading?<PageLoader/>:(
          <Table headers={['Code','Generic Name','Brand','Strength/Form','Category','Unit Price','Stock','Status','']}>
            {drugs.map((d:any)=>(
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="table-cell font-mono text-xs text-primary-600">{d.drugCode}</td>
                <td className="table-cell font-medium text-slate-800">{d.genericName}</td>
                <td className="table-cell text-slate-500">{d.brandName||'—'}</td>
                <td className="table-cell text-slate-500">{d.strength} {d.form}</td>
                <td className="table-cell text-slate-500">{d.category||'—'}</td>
                <td className="table-cell">₦{Number(d.unitPrice).toLocaleString()}</td>
                <td className="table-cell">
                  <span className={d.currentStock<=d.reorderLevel?'text-red-600 font-bold':'text-slate-700'}>{d.currentStock}</span>
                  {d.currentStock<=d.reorderLevel&&<span className="ml-1 text-xs text-amber-500">⚠</span>}
                </td>
                <td className="table-cell"><Badge color={d.isActive?'green':'slate'}>{d.isActive?'Active':'Inactive'}</Badge></td>
                <td className="table-cell text-xs text-slate-400">{d.requiresPrescription?'Rx':''}</td>
              </tr>
            ))}
          </Table>
        )}
        {drugs.length===0&&!isLoading&&<EmptyState title="No drugs in formulary" action={<button onClick={()=>setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={15}/>Add First Drug</button>}/>}
      </div>

      <Modal open={showModal} onClose={()=>setShowModal(false)} title="Add Drug to Formulary" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <Field label="Generic Name" required><input className="input" {...register('genericName',{required:true})} placeholder="e.g. Amoxicillin"/></Field>
          <Field label="Brand Name"><input className="input" {...register('brandName')} placeholder="Optional"/></Field>
          <Field label="Strength"><input className="input" {...register('strength')} placeholder="e.g. 500mg"/></Field>
          <Field label="Form">
            <select className="input" {...register('form')}>
              {['tablet','capsule','syrup','injection','cream','ointment','eye_drop','ear_drop','inhaler','other'].map(f=><option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Category"><input className="input" {...register('category')} placeholder="e.g. Antibiotic"/></Field>
          <Field label="Manufacturer"><input className="input" {...register('manufacturer')} placeholder="Optional"/></Field>
          <Field label="Unit Price (₦)" required><input type="number" className="input" {...register('unitPrice',{required:true})} placeholder="0"/></Field>
          <Field label="Cost Price (₦)"><input type="number" className="input" {...register('costPrice')} placeholder="0"/></Field>
          <Field label="Reorder Level"><input type="number" className="input" {...register('reorderLevel')} defaultValue={10}/></Field>
          <Field label="Initial Stock"><input type="number" className="input" {...register('currentStock')} defaultValue={0}/></Field>
          <div className="col-span-2 flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('requiresPrescription')} defaultChecked/>Requires prescription</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('isControlled')}/>Controlled substance</label>
          </div>
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
            <button type="submit" disabled={createDrug.isPending} className="btn-primary flex items-center gap-2">
              {createDrug.isPending?<Spinner size={15}/>:<Plus size={15}/>}Add Drug
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
export default DrugFormularyPage;
