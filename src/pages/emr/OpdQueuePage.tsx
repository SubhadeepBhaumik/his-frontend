// OpdQueuePage.tsx
import { Link } from 'react-router-dom';
import { useOpdQueue, useUpdateAppointmentStatus } from '@/hooks/useApi';
import { PageLoader, StatusBadge, Badge } from '@/components/ui';

export function OpdQueuePage() {
  const { data: queue, isLoading } = useOpdQueue();
  const updateStatus = useUpdateAppointmentStatus();

  if (isLoading) return <PageLoader />;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">OPD Queue</h1><p className="text-sm text-slate-400">Today's outpatient appointments</p></div>
        <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">{queue?.length||0} patients</span>
      </div>
      <div className="grid gap-3">
        {queue?.map((a:any, idx:number) => (
          <div key={a.id} className="card flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm flex-shrink-0">{idx+1}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><p className="font-semibold text-slate-800">{a.patient_name}</p>
                {a.is_urgent && <Badge color="red">Urgent</Badge>}
              </div>
              <p className="text-xs text-slate-400">{a.hospital_id} · {a.appointment_time} · {a.doctor_name||'Unassigned'}</p>
              {a.chief_complaint && <p className="text-sm text-slate-600 mt-1 truncate">{a.chief_complaint}</p>}
            </div>
            <StatusBadge status={a.status} />
            <div className="flex gap-2 flex-shrink-0">
              {a.status==='scheduled'&&<button onClick={()=>updateStatus.mutate({id:a.id,status:'checked_in'})} className="btn-outline text-xs py-1.5">Check In</button>}
              {(a.status==='checked_in'||a.status==='confirmed')&&(
                <Link to={`/emr/queue`} className="btn-primary text-xs py-1.5 px-3">See Patient</Link>
              )}
            </div>
          </div>
        ))}
        {(!queue||queue.length===0)&&<div className="card text-center py-16 text-slate-400">No patients in queue today</div>}
      </div>
    </div>
  );
}
export default OpdQueuePage;
