// LabOrdersPage.tsx
import { useState } from 'react';
import { usePendingLabOrders, useResultLabOrder } from '@/hooks/useApi';
import { PageLoader, StatusBadge, Badge, Modal, Spinner } from '@/components/ui';
import { FlaskConical } from 'lucide-react';
import { format } from 'date-fns';

export function LabOrdersPage() {
  const { data: orders, isLoading } = usePendingLabOrders();
  const resultOrder = useResultLabOrder();
  const [selected, setSelected] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);

  const handleOpenResult = (o:any) => {
    setSelected(o);
    setResults(o.tests.map((t:any)=>({testName:t.testName,result:'',unit:'',referenceRange:'',flag:'',note:''})));
  };

  const handleSubmit = async () => {
    await resultOrder.mutateAsync({id:selected.id, results});
    setSelected(null);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <h1 className="page-title">Pending Lab Orders</h1>
      {(!orders||orders.length===0)&&<div className="card text-center py-16 text-slate-400">No pending lab orders ✓</div>}
      <div className="grid gap-3">
        {orders?.map((o:any)=>(
          <div key={o.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-primary-600 font-semibold">{o.orderNo}</span>
                  {o.urgent&&<Badge color="red">Urgent</Badge>}
                  <StatusBadge status={o.status}/>
                </div>
                <p className="font-semibold text-slate-800">{o.patient?.firstName} {o.patient?.lastName}</p>
                <p className="text-xs text-slate-400">{o.patient?.hospitalId} · Requested by Dr. {o.requestedBy?.lastName}</p>
                <p className="text-xs text-slate-400">{format(new Date(o.createdAt),'dd MMM yyyy HH:mm')}</p>
                <div className="flex flex-wrap gap-1 mt-2">{o.tests?.map((t:any)=><Badge key={t.testCode} color="blue">{t.testName}</Badge>)}</div>
              </div>
              <button onClick={()=>handleOpenResult(o)} className="btn-primary text-sm">Enter Results</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!selected} onClose={()=>setSelected(null)} title="Enter Lab Results" size="lg">
        {selected&&(
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">{selected.patient?.firstName} {selected.patient?.lastName} — {selected.orderNo}</p>
            <div className="space-y-3">
              {results.map((r,i)=>(
                <div key={i} className="border border-slate-100 rounded-lg p-3">
                  <p className="text-sm font-semibold text-slate-700 mb-2">{r.testName}</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div><label className="label text-xs">Result</label><input className="input text-sm" value={r.result} onChange={e=>setResults(rs=>rs.map((x,j)=>j===i?{...x,result:e.target.value}:x))}/></div>
                    <div><label className="label text-xs">Unit</label><input className="input text-sm" value={r.unit} onChange={e=>setResults(rs=>rs.map((x,j)=>j===i?{...x,unit:e.target.value}:x))}/></div>
                    <div><label className="label text-xs">Ref. Range</label><input className="input text-sm" value={r.referenceRange} onChange={e=>setResults(rs=>rs.map((x,j)=>j===i?{...x,referenceRange:e.target.value}:x))}/></div>
                    <div><label className="label text-xs">Flag</label>
                      <select className="input text-sm" value={r.flag} onChange={e=>setResults(rs=>rs.map((x,j)=>j===i?{...x,flag:e.target.value}:x))}>
                        <option value="">Normal</option><option value="HIGH">HIGH</option><option value="LOW">LOW</option><option value="CRITICAL">CRITICAL</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button className="btn-secondary" onClick={()=>setSelected(null)}>Cancel</button>
              <button className="btn-primary flex items-center gap-2" onClick={handleSubmit} disabled={resultOrder.isPending}>
                {resultOrder.isPending?<Spinner size={15}/>:<FlaskConical size={15}/>} Submit Results
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
export default LabOrdersPage;
