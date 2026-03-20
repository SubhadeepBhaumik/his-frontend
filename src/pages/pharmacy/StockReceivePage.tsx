import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { useReceiveStock, useDrugs } from '@/hooks/useApi';
import { Field, Spinner } from '@/components/ui';

export default function StockReceivePage() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<any>({
    defaultValues: { receivedDate: new Date().toISOString().split('T')[0] }
  });
  const receive = useReceiveStock();
  const { data: drugData } = useDrugs({ limit:200 });
  const drugs = drugData?.data || [];

  const onSubmit = async (data: any) => {
    await receive.mutateAsync(data);
    navigate('/pharmacy/formulary');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={()=>navigate(-1)} className="text-slate-500 hover:text-slate-700"><ArrowLeft size={20}/></button>
        <h1 className="page-title">Receive Stock</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
        <Field label="Drug" required>
          <select className="input" {...register('drugId',{required:true})}>
            <option value="">Select drug</option>
            {drugs.map((d:any)=><option key={d.id} value={d.id}>{d.drugCode} — {d.genericName} {d.strength}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Batch Number" required><input className="input" {...register('batchNumber',{required:true})} placeholder="e.g. BCH-2024-001"/></Field>
          <Field label="Quantity Received" required><input type="number" className="input" {...register('quantityReceived',{required:true})} placeholder="100"/></Field>
          <Field label="Expiry Date" required><input type="date" className="input" {...register('expiryDate',{required:true})}/></Field>
          <Field label="Received Date"><input type="date" className="input" {...register('receivedDate')}/></Field>
          <Field label="Purchase Price (₦)"><input type="number" step="0.01" className="input" {...register('purchasePrice')} placeholder="0.00"/></Field>
          <Field label="Selling Price (₦)"><input type="number" step="0.01" className="input" {...register('sellingPrice')} placeholder="0.00"/></Field>
        </div>
        <Field label="Supplier"><input className="input" {...register('supplier')} placeholder="Supplier name (optional)"/></Field>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" className="btn-secondary" onClick={()=>navigate(-1)}>Cancel</button>
          <button type="submit" disabled={receive.isPending} className="btn-primary flex items-center gap-2">
            {receive.isPending?<Spinner size={15}/>:<Save size={15}/>}Receive Stock
          </button>
        </div>
      </form>
    </div>
  );
}
