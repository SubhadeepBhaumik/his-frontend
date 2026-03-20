import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Calendar, FileText, Activity, Pill, Receipt } from 'lucide-react';
import { usePatient, usePatientEncounters, useCreateEncounter } from '@/hooks/useApi';
import { StatusBadge, Badge, PageLoader, Modal, Field, Spinner } from '@/components/ui';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/slices/authStore';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'overview'|'encounters'|'vitals'>('overview');
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [encounterType, setEncounterType] = useState('opd');
  const [chiefComplaint, setChiefComplaint] = useState('');

  const { data: patient, isLoading } = usePatient(id!);
  const { data: encountersData } = usePatientEncounters(id!);
  const encounters = encountersData?.data || [];
  const createEncounter = useCreateEncounter();

  const handleOpenEncounter = async () => {
    const res: any = await createEncounter.mutateAsync({ patientId: id, type: encounterType, chiefComplaint });
    if (res?.data?.id) { setShowEncounterModal(false); navigate(`/emr/encounter/${res.data.id}`); }
  };

  if (isLoading) return <PageLoader />;
  if (!patient) return <div className="text-center py-20 text-slate-400">Patient not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700"><ArrowLeft size={20}/></button>
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
            {patient.firstName?.[0]}{patient.lastName?.[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{patient.firstName} {patient.middleName} {patient.lastName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-primary-600 font-semibold">{patient.hospitalId}</span>
              <StatusBadge status={patient.patientType} />
              {patient.knownAllergies?.length > 0 && <Badge color="red">⚠ Allergies</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/appointments/new?patientId=${id}`} className="btn-outline flex items-center gap-2 text-sm">
            <Calendar size={15}/>Book Appointment
          </Link>
          {(user?.role === 'doctor' || user?.role === 'nurse') && (
            <button onClick={() => setShowEncounterModal(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={15}/>Open Encounter
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'Age', value:`${patient.age} years` },
          { label:'Gender', value: patient.gender, capitalize:true },
          { label:'Blood Group', value: patient.bloodGroup },
          { label:'Total Visits', value: encounters.length },
        ].map(s => (
          <div key={s.label} className="card py-3">
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className={`font-bold text-slate-800 mt-0.5 ${s.capitalize ? 'capitalize':''}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex gap-1 mb-5 border-b border-slate-100 pb-3">
          {(['overview','encounters','vitals'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${tab===t ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3">Contact Details</h4>
              <dl className="space-y-2">
                {[
                  ['Phone', patient.phone], ['Alt Phone', patient.altPhone],
                  ['Email', patient.email], ['Address', patient.address],
                  ['State', patient.state], ['LGA', patient.lga],
                  ['Occupation', patient.occupation], ['Marital Status', patient.maritalStatus],
                ].map(([k, v]) => v ? (
                  <div key={k as string} className="flex gap-3 text-sm">
                    <dt className="text-slate-400 w-28 flex-shrink-0">{k}</dt>
                    <dd className="text-slate-700 font-medium capitalize">{v}</dd>
                  </div>
                ) : null)}
              </dl>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-3">Next of Kin</h4>
              <dl className="space-y-2">
                {[['Name', patient.nokName], ['Phone', patient.nokPhone], ['Relationship', patient.nokRelationship]].map(([k,v]) => v ? (
                  <div key={k as string} className="flex gap-3 text-sm">
                    <dt className="text-slate-400 w-28 flex-shrink-0">{k}</dt>
                    <dd className="text-slate-700 font-medium">{v}</dd>
                  </div>
                ) : null)}
              </dl>
              {(patient.hmoName || patient.hmoNumber) && (<>
                <h4 className="text-sm font-semibold text-slate-600 mb-3 mt-5">Insurance</h4>
                <dl className="space-y-2">
                  {[['HMO', patient.hmoName], ['No.', patient.hmoNumber], ['Plan', patient.hmoPlan]].map(([k,v]) => v ? (
                    <div key={k as string} className="flex gap-3 text-sm">
                      <dt className="text-slate-400 w-28 flex-shrink-0">{k}</dt>
                      <dd className="text-slate-700 font-medium">{v}</dd>
                    </div>
                  ) : null)}
                </dl>
              </>)}
              {patient.knownAllergies?.length > 0 && (
                <div className="mt-5 p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-xs font-semibold text-red-700 mb-1">⚠ Known Allergies</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.knownAllergies.map((a: string) => <Badge key={a} color="red">{a}</Badge>)}
                  </div>
                </div>
              )}
              {patient.chronicConditions?.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Chronic Conditions</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.chronicConditions.map((c: string) => <Badge key={c} color="amber">{c}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Encounters */}
        {tab === 'encounters' && (
          <div className="space-y-3">
            {encounters.length === 0 && <p className="text-center text-slate-400 py-10">No encounters recorded</p>}
            {encounters.map((e: any) => (
              <div key={e.id} className="border border-slate-100 rounded-xl p-4 hover:border-primary-200 hover:bg-primary-50/30 cursor-pointer transition-all"
                onClick={() => navigate(`/emr/encounter/${e.id}`)}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-primary-600 font-semibold">{e.encounterNo}</span>
                      <StatusBadge status={e.status} />
                      <Badge color="slate">{e.type?.toUpperCase()}</Badge>
                    </div>
                    <p className="text-sm text-slate-700">{e.chiefComplaint || 'No chief complaint recorded'}</p>
                    <p className="text-xs text-slate-400 mt-1">Dr. {e.doctor?.firstName} {e.doctor?.lastName} · {e.department || 'General'}</p>
                  </div>
                  <p className="text-xs text-slate-400">{format(new Date(e.createdAt), 'dd MMM yyyy HH:mm')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Open Encounter Modal */}
      <Modal open={showEncounterModal} onClose={() => setShowEncounterModal(false)} title="Open New Encounter">
        <div className="space-y-4">
          <Field label="Encounter Type">
            <select className="input" value={encounterType} onChange={e => setEncounterType(e.target.value)}>
              <option value="opd">OPD — Outpatient</option>
              <option value="ipd">IPD — Inpatient</option>
              <option value="emergency">Emergency</option>
              <option value="teleconsult">Teleconsultation</option>
            </select>
          </Field>
          <Field label="Chief Complaint">
            <textarea className="input" rows={3} value={chiefComplaint}
              onChange={e => setChiefComplaint(e.target.value)}
              placeholder="Patient's presenting complaint..." />
          </Field>
          <div className="flex gap-3 justify-end pt-2">
            <button className="btn-secondary" onClick={() => setShowEncounterModal(false)}>Cancel</button>
            <button className="btn-primary flex items-center gap-2" onClick={handleOpenEncounter} disabled={createEncounter.isPending}>
              {createEncounter.isPending ? <Spinner size={15}/> : <Plus size={15}/>}
              Open Encounter
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
