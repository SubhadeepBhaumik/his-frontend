import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { useCreateAppointment, useDoctors, usePatients } from '@/hooks/useApi';
import { Field, Spinner } from '@/components/ui';
import { useState } from 'react';

export default function NewAppointmentPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register, handleSubmit, formState:{errors} } = useForm<any>({
    defaultValues: { patientId: params.get('patientId') || '', type:'opd', appointmentDate: new Date().toISOString().split('T')[0] }
  });
  const create = useCreateAppointment();
  const { data: doctors } = useDoctors();
  const [patientSearch, setPatientSearch] = useState('');
  const { data: patients } = usePatients({ search: patientSearch, limit:10 });

  const onSubmit = async (data: any) => {
    const res: any = await create.mutateAsync(data);
    if (res?.data) navigate('/appointments');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700"><ArrowLeft size={20}/></button>
        <div>
          <h1 className="page-title">Book Appointment</h1>
          <p className="text-sm text-slate-400">Schedule a new patient appointment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <Field label="Patient" required>
          <input className="input mb-2" placeholder="Search patient name..." value={patientSearch} onChange={e=>setPatientSearch(e.target.value)} />
          <select className="input" {...register('patientId', {required:'Select a patient'})}>
            <option value="">Select patient</option>
            {patients?.data?.map((p:any)=>(
              <option key={p.id} value={p.id}>{p.hospitalId} — {p.firstName} {p.lastName}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Appointment Date" required>
            <input type="date" className="input" {...register('appointmentDate',{required:'Required'})} />
          </Field>
          <Field label="Time" required>
            <input type="time" className="input" {...register('appointmentTime',{required:'Required'})} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Type">
            <select className="input" {...register('type')}>
              {['opd','follow_up','specialist','procedure','lab','radiology','teleconsult','antenatal'].map(t=>(
                <option key={t} value={t}>{t.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>
              ))}
            </select>
          </Field>
          <Field label="Doctor">
            <select className="input" {...register('doctorId')}>
              <option value="">Unassigned</option>
              {doctors?.map((d:any)=>(
                <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}{d.specialisation ? ` (${d.specialisation})`:''}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Department">
          <input className="input" {...register('department')} placeholder="e.g. General Practice, Paediatrics..." />
        </Field>

        <Field label="Chief Complaint / Reason for Visit">
          <textarea className="input" rows={3} {...register('chiefComplaint')} placeholder="Reason for the appointment..." />
        </Field>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="urgent" {...register('isUrgent')} className="rounded" />
          <label htmlFor="urgent" className="text-sm text-slate-700">Mark as urgent</label>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={()=>navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={create.isPending} className="btn-primary flex items-center gap-2">
            {create.isPending ? <Spinner size={15}/> : <Save size={15}/>}
            Book Appointment
          </button>
        </div>
      </form>
    </div>
  );
}
