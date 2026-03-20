// PrescriptionsPage.tsx
import { usePendingPrescriptions, useDispensePrescription } from '@/hooks/useApi';
import { PageLoader, StatusBadge, Badge } from '@/components/ui';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function PrescriptionsPage() {
  const { data: rxList, isLoading } = usePendingPrescriptions();
  const dispense = useDispensePrescription();

  if (isLoading) return <PageLoader />;
  return (
    <div className="space-y-4">
      <h1 className="page-title">Pending Prescriptions</h1>
      {(!rxList||rxList.length===0)&&<div className="card text-center py-16 text-slate-400">No pending prescriptions ✓</div>}
      <div className="grid gap-3">
        {rxList?.map((rx:any)=>(
          <div key={rx.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-primary-600 font-semibold">{rx.rxNo}</span>
                  <StatusBadge status={rx.status}/>
                </div>
                <p className="font-semibold text-slate-800">{rx.patient?.firstName} {rx.patient?.lastName}</p>
                <p className="text-xs text-slate-400 mb-3">{rx.patient?.hospitalId} · Dr. {rx.doctor?.lastName} · {format(new Date(rx.createdAt),'dd MMM HH:mm')}</p>
                <div className="space-y-2">
                  {rx.items?.map((item:any,i:number)=>(
                    <div key={i} className="bg-slate-50 rounded-lg px-3 py-2 flex items-center gap-4 text-sm">
                      <p className="font-medium text-slate-800 w-40 truncate">{item.drugName}</p>
                      <p className="text-slate-500">{item.strength}</p>
                      <p className="text-slate-500">{item.dose} · {item.frequency}</p>
                      <p className="text-slate-500">{item.duration}</p>
                      <Badge color="slate">Qty: {item.quantity}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={()=>dispense.mutate({id:rx.id})} disabled={dispense.isPending}
                className="btn-primary text-sm ml-4 flex-shrink-0">Dispense</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default PrescriptionsPage;
