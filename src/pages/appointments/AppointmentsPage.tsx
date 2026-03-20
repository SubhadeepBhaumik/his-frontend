// AppointmentsPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useAppointments, useUpdateAppointmentStatus } from '@/hooks/useApi';
import { Table, StatusBadge, SearchInput, PageLoader, EmptyState } from '@/components/ui';

export default function AppointmentsPage() {
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAppointments({ page, limit: 20, search, date, status });
  const updateStatus = useUpdateAppointmentStatus();
  const appts = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-800">Appointments</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <SearchInput value={search} onChange={v=>{setSearch(v);setPage(1);}} placeholder="Search patient..." />
            <input type="date" className="input w-40" value={date} onChange={e=>{setDate(e.target.value);setPage(1);}} />
            <select className="input w-36" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}>
              <option value="">All Status</option>
              {['scheduled','confirmed','checked_in','in_progress','completed','cancelled','no_show'].map(s=>(
                <option key={s} value={s}>{s.replace('_',' ')}</option>
              ))}
            </select>
            <Link to="/appointments/new" className="btn-primary flex items-center gap-2"><Plus size={16}/>Book</Link>
          </div>
        </div>
        {isLoading ? <PageLoader /> : (<>
          <Table headers={['No.','Patient','Date & Time','Doctor','Type','Status','Actions']}>
            {appts.map((a: any) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="table-cell font-mono text-xs text-primary-600 font-semibold">{a.appointmentNo}</td>
                <td className="table-cell">
                  <div>
                    <p className="font-medium text-slate-800">{a.patient?.firstName} {a.patient?.lastName}</p>
                    <p className="text-xs text-slate-400">{a.patient?.hospitalId}</p>
                  </div>
                </td>
                <td className="table-cell">
                  <p className="text-sm">{format(new Date(a.appointmentDate), 'dd MMM yyyy')}</p>
                  <p className="text-xs text-slate-400">{a.appointmentTime}</p>
                </td>
                <td className="table-cell text-sm">{a.doctor ? `Dr. ${a.doctor.lastName}` : '—'}</td>
                <td className="table-cell text-xs capitalize">{a.type?.replace('_',' ')}</td>
                <td className="table-cell"><StatusBadge status={a.status} /></td>
                <td className="table-cell">
                  <select className="input py-1 text-xs w-32" value={a.status}
                    onChange={e => updateStatus.mutate({ id:a.id, status:e.target.value })}>
                    {['scheduled','confirmed','checked_in','in_progress','completed','cancelled','no_show'].map(s=>(
                      <option key={s} value={s}>{s.replace('_',' ')}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </Table>
          {appts.length === 0 && <EmptyState title="No appointments" description="No appointments match your filters"
            action={<Link to="/appointments/new" className="btn-primary flex items-center gap-2"><Plus size={15}/>Book Appointment</Link>} />}
          {meta?.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">{meta.total} appointments</p>
              <div className="flex gap-2">
                <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">← Prev</button>
                <span className="text-sm text-slate-500 self-center">{page}/{meta.totalPages}</span>
                <button disabled={!meta.hasNext} onClick={()=>setPage(p=>p+1)} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">Next →</button>
              </div>
            </div>
          )}
        </>)}
      </div>
    </div>
  );
}
