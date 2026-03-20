import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, FlaskConical, Pill, CheckCircle, Stethoscope } from 'lucide-react';
import { useEncounter, useRecordVitals, useSaveSoap, useCreatePrescription, useCreateLabOrder } from '@/hooks/useApi';
import { PageLoader, Badge, StatusBadge, Modal, Field, Spinner } from '@/components/ui';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/slices/authStore';
import api from '@/utils/api';
import toast from 'react-hot-toast';

const ICD10_SAMPLES = [
  {code:'B50.9',desc:'Plasmodium falciparum malaria'},{code:'A09',desc:'Diarrhoea and gastroenteritis'},
  {code:'J18',desc:'Pneumonia'},{code:'I10',desc:'Hypertension'},{code:'E11',desc:'Type 2 diabetes'},
  {code:'R50.9',desc:'Fever of unknown origin'},{code:'R05',desc:'Cough'},{code:'K29',desc:'Gastritis'},
  {code:'J06',desc:'Acute URI'},{code:'N18',desc:'Chronic kidney disease'},{code:'K35',desc:'Appendicitis'},
];

const LAB_TESTS = [
  {name:'Full Blood Count (FBC)',code:'LAB-FBC',category:'Haematology'},
  {name:'Malaria RDT',code:'LAB-MAL-RDT',category:'Parasitology'},
  {name:'Blood Group & Genotype',code:'LAB-BGG',category:'Blood Bank'},
  {name:'Urinalysis',code:'LAB-URI',category:'Urinalysis'},
  {name:'Liver Function Test',code:'LAB-LFT',category:'Chemistry'},
  {name:'Kidney Function Test',code:'LAB-KFT',category:'Chemistry'},
  {name:'HbA1c',code:'LAB-HBA1C',category:'Chemistry'},
  {name:'Blood Culture',code:'LAB-BCA',category:'Microbiology'},
  {name:'Widal Test',code:'LAB-WIDAL',category:'Serology'},
];

export default function EncounterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'vitals'|'soap'|'orders'|'prescriptions'>('vitals');
  const [showLabModal, setShowLabModal] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [selectedTests, setSelectedTests] = useState<any[]>([]);
  const [rxItems, setRxItems] = useState([{drugName:'',strength:'',dose:'',frequency:'',duration:'',quantity:1,instructions:''}]);
  const [icdSearch, setIcdSearch] = useState('');
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [completing, setCompleting] = useState(false);
  const [dischargeSummary, setDischargeSummary] = useState('');

  const { data: encounter, isLoading } = useEncounter(id!);
  const recordVitals = useRecordVitals(id!);
  const saveSoap = useSaveSoap(id!);
  const createRx = useCreatePrescription(id!);
  const createLab = useCreateLabOrder(id!);

  const [vitalsForm, setVitalsForm] = useState({ bpSystolic:'', bpDiastolic:'', temperature:'', pulseRate:'', respiratoryRate:'', oxygenSaturation:'', weight:'', height:'', bloodGlucose:'', painScore:'', notes:'' });
  const [soapForm, setSoapForm] = useState({ subjective:'', objective:'', assessment:'', plan:'' });

  const handleVitalsSave = async () => {
    const payload: any = {};
    Object.entries(vitalsForm).forEach(([k,v]) => { if(v !== '') payload[k] = isNaN(Number(v)) ? v : Number(v); });
    await recordVitals.mutateAsync(payload);
  };

  const handleSoapSave = async () => {
    await saveSoap.mutateAsync({ ...soapForm, diagnoses });
  };

  const handleLabOrder = async () => {
    if (!selectedTests.length) return;
    await createLab.mutateAsync({ tests: selectedTests, urgent: false });
    setShowLabModal(false); setSelectedTests([]);
  };

  const handlePrescription = async () => {
    const valid = rxItems.filter(i => i.drugName.trim());
    if (!valid.length) return;
    await createRx.mutateAsync({ items: valid });
    setShowRxModal(false); setRxItems([{drugName:'',strength:'',dose:'',frequency:'',duration:'',quantity:1,instructions:''}]);
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await api.patch(`/emr/encounters/${id}/complete`, { dischargeSummary });
      toast.success('Encounter completed'); navigate(-1);
    } catch(e:any) { toast.error(e?.error?.message||'Failed'); }
    setCompleting(false);
  };

  const filteredIcd = ICD10_SAMPLES.filter(i => i.code.toLowerCase().includes(icdSearch.toLowerCase()) || i.desc.toLowerCase().includes(icdSearch.toLowerCase()));

  if (isLoading) return <PageLoader />;
  if (!encounter) return <div className="text-center py-20 text-slate-400">Encounter not found</div>;

  const p = encounter.patient;
  const vitalsRecorded = encounter.vitals?.length > 0;
  const soapSaved = encounter.notes?.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700"><ArrowLeft size={20}/></button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-800">{p?.firstName} {p?.lastName}</h1>
              <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-primary-600">{p?.hospitalId}</span>
              <StatusBadge status={encounter.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Encounter: <span className="font-mono text-primary-600">{encounter.encounterNo}</span> ·
              {encounter.type?.toUpperCase()} · {format(new Date(encounter.createdAt), 'dd MMM yyyy HH:mm')}
              {p?.knownAllergies?.length > 0 && <span className="ml-2 text-red-500">⚠ Allergies: {p.knownAllergies.join(', ')}</span>}
            </p>
          </div>
        </div>
        {encounter.status === 'open' && (
          <button onClick={handleComplete} disabled={completing} className="btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700">
            {completing ? <Spinner size={15}/> : <CheckCircle size={15}/>} Complete Encounter
          </button>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1">
        {[
          {key:'vitals', label:`Vitals ${vitalsRecorded?`(${encounter.vitals.length})`:''}`, icon:Stethoscope},
          {key:'soap', label:`SOAP ${soapSaved?'✓':''}`, icon:Stethoscope},
          {key:'orders', label:`Lab Orders (${encounter.labOrders?.length||0})`, icon:FlaskConical},
          {key:'prescriptions', label:`Prescriptions (${encounter.prescriptions?.length||0})`, icon:Pill},
        ].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${tab===t.key?'bg-primary-600 text-white':'text-slate-500 hover:bg-slate-100'}`}>
            <t.icon size={15}/>{t.label}
          </button>
        ))}
      </div>

      {/* Vitals Tab */}
      {tab === 'vitals' && (
        <div className="card space-y-5">
          <h3 className="font-semibold text-slate-700">Record Vitals</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {key:'bpSystolic',label:'BP Systolic',unit:'mmHg',placeholder:'120'},
              {key:'bpDiastolic',label:'BP Diastolic',unit:'mmHg',placeholder:'80'},
              {key:'temperature',label:'Temperature',unit:'°C',placeholder:'36.6'},
              {key:'pulseRate',label:'Pulse Rate',unit:'bpm',placeholder:'72'},
              {key:'respiratoryRate',label:'Resp. Rate',unit:'/min',placeholder:'16'},
              {key:'oxygenSaturation',label:'O₂ Saturation',unit:'%',placeholder:'98'},
              {key:'weight',label:'Weight',unit:'kg',placeholder:'70'},
              {key:'height',label:'Height',unit:'cm',placeholder:'170'},
              {key:'bloodGlucose',label:'Blood Glucose',unit:'mmol/L',placeholder:'5.4'},
              {key:'painScore',label:'Pain Score',unit:'/10',placeholder:'0-10'},
            ].map(f=>(
              <div key={f.key}>
                <label className="label">{f.label} <span className="text-slate-400 font-normal">({f.unit})</span></label>
                <input type="number" className="input" placeholder={f.placeholder}
                  value={(vitalsForm as any)[f.key]} onChange={e=>setVitalsForm(v=>({...v,[f.key]:e.target.value}))} />
              </div>
            ))}
          </div>
          <Field label="Nursing Notes">
            <textarea className="input" rows={2} value={vitalsForm.notes} onChange={e=>setVitalsForm(v=>({...v,notes:e.target.value}))} placeholder="Any additional nursing observations..." />
          </Field>
          <button onClick={handleVitalsSave} disabled={recordVitals.isPending} className="btn-primary flex items-center gap-2">
            {recordVitals.isPending?<Spinner size={15}/>:<Save size={15}/>} Save Vitals
          </button>
          {/* Previous vitals */}
          {encounter.vitals?.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-600 mb-3">Previous Vitals</p>
              <div className="overflow-x-auto"><table className="text-xs w-full">
                <thead><tr className="border-b border-slate-100">
                  {['Time','BP','Temp','Pulse','O₂','Weight','BMI'].map(h=><th key={h} className="pb-2 text-left text-slate-400 pr-4">{h}</th>)}
                </tr></thead>
                <tbody>{encounter.vitals.map((v:any)=>(
                  <tr key={v.id} className="border-b border-slate-50">
                    <td className="py-2 pr-4 text-slate-500">{format(new Date(v.recordedAt),'HH:mm')}</td>
                    <td className="py-2 pr-4">{v.bpSystolic&&v.bpDiastolic?`${v.bpSystolic}/${v.bpDiastolic}`:'—'}</td>
                    <td className="py-2 pr-4">{v.temperature?`${v.temperature}°C`:'—'}</td>
                    <td className="py-2 pr-4">{v.pulseRate||'—'}</td>
                    <td className="py-2 pr-4">{v.oxygenSaturation?`${v.oxygenSaturation}%`:'—'}</td>
                    <td className="py-2 pr-4">{v.weight?`${v.weight}kg`:'—'}</td>
                    <td className="py-2 pr-4">{v.bmi||'—'}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>
          )}
        </div>
      )}

      {/* SOAP Tab */}
      {tab === 'soap' && (
        <div className="card space-y-5">
          <h3 className="font-semibold text-slate-700">Clinical Notes (SOAP)</h3>
          {[
            {key:'subjective',label:'S — Subjective',placeholder:"Patient's complaints, history, symptoms..."},
            {key:'objective',label:'O — Objective',placeholder:'Physical examination findings, relevant vitals...'},
            {key:'assessment',label:'A — Assessment',placeholder:'Clinical impression, differential diagnoses...'},
            {key:'plan',label:'P — Plan',placeholder:'Treatment plan, investigations, referrals, follow-up...'},
          ].map(f=>(
            <div key={f.key}>
              <label className="label font-semibold">{f.label}</label>
              <textarea className="input font-mono text-sm" rows={4}
                value={(soapForm as any)[f.key]}
                onChange={e=>setSoapForm(s=>({...s,[f.key]:e.target.value}))}
                placeholder={f.placeholder} />
            </div>
          ))}

          {/* ICD-10 Diagnoses */}
          <div>
            <label className="label font-semibold">ICD-10 Diagnoses</label>
            <div className="flex gap-2 mb-2">
              <input className="input flex-1" placeholder="Search ICD-10 code or description..." value={icdSearch} onChange={e=>setIcdSearch(e.target.value)} />
            </div>
            {icdSearch && (
              <div className="border border-slate-200 rounded-lg overflow-hidden mb-3 max-h-48 overflow-y-auto">
                {filteredIcd.map(i=>(
                  <button key={i.code} onClick={()=>{ if(!diagnoses.find(d=>d.code===i.code)) setDiagnoses(d=>[...d,{...i,type:'primary'}]); setIcdSearch(''); }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm border-b border-slate-100 last:border-0 flex items-center gap-3">
                    <span className="font-mono text-xs text-primary-600 w-16">{i.code}</span>
                    <span>{i.desc}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {diagnoses.map(d=>(
                <div key={d.code} className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
                  <span className="font-mono text-xs text-blue-700">{d.code}</span>
                  <span className="text-sm text-slate-700">{d.desc}</span>
                  <select className="text-xs border-0 bg-transparent text-blue-600 font-medium" value={d.type} onChange={e=>setDiagnoses(ds=>ds.map(x=>x.code===d.code?{...x,type:e.target.value}:x))}>
                    <option value="primary">Primary</option><option value="secondary">Secondary</option>
                  </select>
                  <button onClick={()=>setDiagnoses(ds=>ds.filter(x=>x.code!==d.code))} className="text-red-400 hover:text-red-600 text-xs ml-1">×</button>
                </div>
              ))}
            </div>
          </div>

          {encounter.status === 'open' && (
            <div className="flex gap-3">
              <button onClick={handleSoapSave} disabled={saveSoap.isPending} className="btn-primary flex items-center gap-2">
                {saveSoap.isPending?<Spinner size={15}/>:<Save size={15}/>} Save SOAP Note
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lab Orders Tab */}
      {tab === 'orders' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">Lab & Radiology Orders</h3>
            {encounter.status === 'open' && (
              <button onClick={()=>setShowLabModal(true)} className="btn-primary flex items-center gap-2"><Plus size={15}/>Request Test</button>
            )}
          </div>
          {encounter.labOrders?.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No lab orders yet</p>}
          {encounter.labOrders?.map((o:any)=>(
            <div key={o.id} className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-primary-600 font-semibold">{o.orderNo}</span>
                <StatusBadge status={o.status} />
              </div>
              <div className="flex flex-wrap gap-2">
                {o.tests?.map((t:any)=><Badge key={t.testCode} color="blue">{t.testName}</Badge>)}
              </div>
              {o.results && (
                <div className="mt-3 bg-emerald-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-emerald-700 mb-2">Results</p>
                  {o.results.map((r:any,i:number)=>(
                    <div key={i} className="grid grid-cols-4 gap-2 text-xs py-1 border-b border-emerald-100 last:border-0">
                      <span className="font-medium text-slate-700">{r.testName}</span>
                      <span className={r.flag?'text-red-600 font-bold':'text-slate-700'}>{r.result} {r.unit}</span>
                      <span className="text-slate-400">{r.referenceRange}</span>
                      <span className={`font-medium ${r.flag==='HIGH'?'text-red-600':r.flag==='LOW'?'text-blue-600':'text-emerald-600'}`}>{r.flag||'Normal'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Prescriptions Tab */}
      {tab === 'prescriptions' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">Prescriptions</h3>
            {encounter.status === 'open' && (
              <button onClick={()=>setShowRxModal(true)} className="btn-primary flex items-center gap-2"><Plus size={15}/>New Prescription</button>
            )}
          </div>
          {encounter.prescriptions?.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No prescriptions yet</p>}
          {encounter.prescriptions?.map((rx:any)=>(
            <div key={rx.id} className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-primary-600 font-semibold">{rx.rxNo}</span>
                <StatusBadge status={rx.status} />
              </div>
              <div className="space-y-2">
                {rx.items?.map((item:any,i:number)=>(
                  <div key={i} className="bg-slate-50 rounded-lg p-3 text-sm grid grid-cols-4 gap-2">
                    <div><p className="font-semibold text-slate-800">{item.drugName}</p><p className="text-xs text-slate-400">{item.strength} {item.form}</p></div>
                    <div><p className="text-xs text-slate-400">Dose</p><p>{item.dose}</p></div>
                    <div><p className="text-xs text-slate-400">Frequency</p><p>{item.frequency}</p></div>
                    <div><p className="text-xs text-slate-400">Duration · Qty</p><p>{item.duration} · {item.quantity}</p></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lab Order Modal */}
      <Modal open={showLabModal} onClose={()=>setShowLabModal(false)} title="Request Laboratory Tests" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Select tests to request:</p>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {LAB_TESTS.map(t=>(
              <label key={t.code} className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" checked={selectedTests.some(s=>s.testCode===t.code)}
                  onChange={e=>setSelectedTests(sel=>e.target.checked?[...sel,{testName:t.name,testCode:t.code,category:t.category,urgent:false}]:sel.filter(s=>s.testCode!==t.code))} />
                <div>
                  <p className="text-sm font-medium text-slate-700">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.category}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button className="btn-secondary" onClick={()=>setShowLabModal(false)}>Cancel</button>
            <button className="btn-primary flex items-center gap-2" onClick={handleLabOrder} disabled={!selectedTests.length||createLab.isPending}>
              {createLab.isPending?<Spinner size={15}/>:<Plus size={15}/>} Request {selectedTests.length} Test{selectedTests.length!==1?'s':''}
            </button>
          </div>
        </div>
      </Modal>

      {/* Prescription Modal */}
      <Modal open={showRxModal} onClose={()=>setShowRxModal(false)} title="New Prescription" size="xl">
        <div className="space-y-3">
          {rxItems.map((item,i)=>(
            <div key={i} className="grid grid-cols-7 gap-2 p-3 bg-slate-50 rounded-lg">
              <div className="col-span-2">
                {i===0&&<label className="label text-xs">Drug Name</label>}
                <input className="input text-sm" placeholder="Generic name" value={item.drugName} onChange={e=>setRxItems(r=>r.map((x,j)=>j===i?{...x,drugName:e.target.value}:x))} />
              </div>
              <div>
                {i===0&&<label className="label text-xs">Strength</label>}
                <input className="input text-sm" placeholder="500mg" value={item.strength} onChange={e=>setRxItems(r=>r.map((x,j)=>j===i?{...x,strength:e.target.value}:x))} />
              </div>
              <div>
                {i===0&&<label className="label text-xs">Dose</label>}
                <input className="input text-sm" placeholder="1 tablet" value={item.dose} onChange={e=>setRxItems(r=>r.map((x,j)=>j===i?{...x,dose:e.target.value}:x))} />
              </div>
              <div>
                {i===0&&<label className="label text-xs">Frequency</label>}
                <select className="input text-sm" value={item.frequency} onChange={e=>setRxItems(r=>r.map((x,j)=>j===i?{...x,frequency:e.target.value}:x))}>
                  <option value="">Select</option>
                  {['Once daily','Twice daily','Three times daily','Four times daily','Every 8hrs','Every 12hrs','At night','As needed'].map(f=><option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                {i===0&&<label className="label text-xs">Duration</label>}
                <input className="input text-sm" placeholder="5 days" value={item.duration} onChange={e=>setRxItems(r=>r.map((x,j)=>j===i?{...x,duration:e.target.value}:x))} />
              </div>
              <div>
                {i===0&&<label className="label text-xs">Qty</label>}
                <div className="flex gap-1">
                  <input type="number" className="input text-sm" min={1} value={item.quantity} onChange={e=>setRxItems(r=>r.map((x,j)=>j===i?{...x,quantity:Number(e.target.value)}:x))} />
                  {rxItems.length>1&&<button onClick={()=>setRxItems(r=>r.filter((_,j)=>j!==i))} className="text-red-400 hover:text-red-600 px-1">×</button>}
                </div>
              </div>
            </div>
          ))}
          <button onClick={()=>setRxItems(r=>[...r,{drugName:'',strength:'',dose:'',frequency:'',duration:'',quantity:1,instructions:''}])}
            className="btn-outline text-sm flex items-center gap-2"><Plus size={14}/>Add Another Drug</button>
          <div className="flex gap-3 justify-end pt-2">
            <button className="btn-secondary" onClick={()=>setShowRxModal(false)}>Cancel</button>
            <button className="btn-primary flex items-center gap-2" onClick={handlePrescription} disabled={createRx.isPending}>
              {createRx.isPending?<Spinner size={15}/>:<Pill size={15}/>} Create Prescription
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
