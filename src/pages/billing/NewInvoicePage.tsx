import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useCreateInvoice, usePatients, useTariffs, useDoctors } from '@/hooks/useApi';
import { Field, Spinner, SearchInput } from '@/components/ui';
import toast from 'react-hot-toast';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n || 0);

interface LineItem {
  category: string; serviceName: string; serviceCode: string;
  quantity: number; unitPrice: number; discount: number; total: number;
}

export default function NewInvoicePage() {
  const navigate = useNavigate();
  const [patientSearch, setPatientSearch] = useState('');
  const [patientId, setPatientId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientType, setPatientType] = useState('private');
  const [hmoName, setHmoName] = useState('');
  const [hmoNumber, setHmoNumber] = useState('');
  const [hmoPlan, setHmoPlan] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [hmoCoverAmount, setHmoCoverAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);
  const [tariffSearch, setTariffSearch] = useState('');
  const [tariffCategory, setTariffCategory] = useState('');

  const createInvoice = useCreateInvoice();
  const { data: patients } = usePatients({ search: patientSearch, limit: 8 });
  const { data: tariffs } = useTariffs(tariffSearch, tariffCategory || undefined);

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const total = Math.max(0, subtotal - discountAmount - hmoCoverAmount);

  const addFromTariff = (t: any) => {
    const price = patientType === 'hmo' ? t.hmoPrice || t.privatePrice
      : patientType === 'nhia' ? t.nhiaPrice || t.privatePrice
      : patientType === 'staff' ? t.staffPrice || t.privatePrice
      : t.privatePrice;
    setItems(prev => [...prev, {
      category: t.category, serviceName: t.serviceName,
      serviceCode: t.serviceCode, quantity: 1,
      unitPrice: price, discount: 0, total: price,
    }]);
  };

  const addCustomItem = () => {
    setItems(prev => [...prev, {
      category: 'other', serviceName: '', serviceCode: '',
      quantity: 1, unitPrice: 0, discount: 0, total: 0,
    }]);
  };

  const updateItem = (i: number, key: string, value: any) => {
    setItems(prev => prev.map((item, idx) => {
      if (idx !== i) return item;
      const updated = { ...item, [key]: value };
      updated.total = (updated.unitPrice * updated.quantity) - updated.discount;
      return updated;
    }));
  };

  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!patientId) { toast.error('Please select a patient'); return; }
    if (items.length === 0) { toast.error('Add at least one item'); return; }
    const res: any = await createInvoice.mutateAsync({
      patientId, patientType, hmoName, hmoNumber, hmoPlan,
      items, discountAmount, hmoCoverAmount, notes,
    });
    if (res?.data?.id) navigate(`/billing/${res.data.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="page-title">New Invoice</h1>
          <p className="text-sm text-slate-400">Build an itemised bill for a patient</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Patient + Settings */}
        <div className="space-y-5">
          {/* Patient */}
          <div className="card">
            <h3 className="font-semibold text-slate-700 mb-4">Patient</h3>
            <input className="input mb-2" placeholder="Search patient..."
              value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
            {patientSearch && patients?.data?.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden mb-3">
                {patients.data.map((p: any) => (
                  <button key={p.id} onClick={() => {
                    setPatientId(p.id); setSelectedPatient(p);
                    setPatientType(p.patientType || 'private');
                    setHmoName(p.hmoName || ''); setHmoNumber(p.hmoNumber || '');
                    setHmoPlan(p.hmoPlan || ''); setPatientSearch('');
                  }} className="w-full text-left px-3 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0">
                    <p className="text-sm font-medium text-slate-800">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-slate-400">{p.hospitalId} · {p.phone}</p>
                  </button>
                ))}
              </div>
            )}
            {selectedPatient && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                <p className="font-semibold text-primary-800">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                <p className="text-xs text-primary-600">{selectedPatient.hospitalId}</p>
                <button onClick={() => { setSelectedPatient(null); setPatientId(''); }}
                  className="text-xs text-red-500 hover:underline mt-1">Change patient</button>
              </div>
            )}
          </div>

          {/* Billing Type */}
          <div className="card space-y-3">
            <h3 className="font-semibold text-slate-700">Billing Type</h3>
            <Field label="Patient Type">
              <select className="input" value={patientType} onChange={e => setPatientType(e.target.value)}>
                <option value="private">Private</option>
                <option value="hmo">HMO</option>
                <option value="nhia">NHIA</option>
                <option value="staff">Staff</option>
              </select>
            </Field>
            {(patientType === 'hmo' || patientType === 'nhia') && (
              <>
                <Field label="HMO Name">
                  <input className="input" value={hmoName} onChange={e => setHmoName(e.target.value)} placeholder="e.g. Hygeia HMO" />
                </Field>
                <Field label="HMO Member No.">
                  <input className="input" value={hmoNumber} onChange={e => setHmoNumber(e.target.value)} />
                </Field>
                <Field label="Plan">
                  <input className="input" value={hmoPlan} onChange={e => setHmoPlan(e.target.value)} />
                </Field>
                <Field label="HMO Cover Amount (₦)">
                  <input type="number" className="input" value={hmoCoverAmount}
                    onChange={e => setHmoCoverAmount(Number(e.target.value))} />
                </Field>
              </>
            )}
          </div>

          {/* Summary */}
          <div className="card space-y-3">
            <h3 className="font-semibold text-slate-700">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span><span>-{fmt(discountAmount)}</span>
                </div>
              )}
              {hmoCoverAmount > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>HMO Cover</span><span>-{fmt(hmoCoverAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-800 text-base pt-2 border-t border-slate-100">
                <span>Total Due</span><span>{fmt(total)}</span>
              </div>
            </div>
            <Field label="Discount (₦)">
              <input type="number" className="input" value={discountAmount}
                onChange={e => setDiscountAmount(Number(e.target.value))} />
            </Field>
            <Field label="Notes">
              <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
            </Field>
            <button onClick={handleSubmit} disabled={createInvoice.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {createInvoice.isPending ? <Spinner size={16} /> : <Save size={16} />}
              Create Invoice
            </button>
          </div>
        </div>

        {/* Right: Items */}
        <div className="lg:col-span-2 space-y-5">
          {/* Tariff picker */}
          <div className="card">
            <h3 className="font-semibold text-slate-700 mb-4">Add from Service Tariff</h3>
            <div className="flex gap-3 mb-3">
              <SearchInput value={tariffSearch} onChange={setTariffSearch} placeholder="Search service..." />
              <select className="input w-40" value={tariffCategory} onChange={e => setTariffCategory(e.target.value)}>
                <option value="">All Categories</option>
                {['consultation', 'laboratory', 'radiology', 'pharmacy', 'ward', 'procedure', 'theatre', 'other'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {tariffs?.map((t: any) => (
                <button key={t.id} onClick={() => addFromTariff(t)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg text-left text-sm border border-transparent hover:border-slate-200 transition-all">
                  <div>
                    <span className="font-medium text-slate-700">{t.serviceName}</span>
                    <span className="ml-2 text-xs text-slate-400">{t.serviceCode}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <span className="font-semibold text-primary-600">
                      {fmt(patientType === 'hmo' ? t.hmoPrice || t.privatePrice
                        : patientType === 'nhia' ? t.nhiaPrice || t.privatePrice
                        : t.privatePrice)}
                    </span>
                    <span className="ml-2 text-xs text-primary-400 font-medium">+ Add</span>
                  </div>
                </button>
              ))}
              {(!tariffs || tariffs.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">No tariffs found</p>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Invoice Items ({items.length})</h3>
              <button onClick={addCustomItem} className="btn-outline text-xs flex items-center gap-1">
                <Plus size={13} /> Custom Item
              </button>
            </div>
            {items.length === 0 && (
              <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-sm">No items yet. Add from the tariff list or create a custom item.</p>
              </div>
            )}
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3 grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-4">
                    <label className="label text-xs">Service</label>
                    <input className="input text-sm" value={item.serviceName}
                      onChange={e => updateItem(i, 'serviceName', e.target.value)} placeholder="Service name" />
                  </div>
                  <div className="col-span-2">
                    <label className="label text-xs">Category</label>
                    <select className="input text-sm" value={item.category} onChange={e => updateItem(i, 'category', e.target.value)}>
                      {['consultation','laboratory','radiology','pharmacy','ward','procedure','theatre','nursing','other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="label text-xs">Qty</label>
                    <input type="number" min={1} className="input text-sm" value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', Number(e.target.value))} />
                  </div>
                  <div className="col-span-2">
                    <label className="label text-xs">Unit Price</label>
                    <input type="number" className="input text-sm" value={item.unitPrice}
                      onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))} />
                  </div>
                  <div className="col-span-2">
                    <label className="label text-xs">Total</label>
                    <p className="input bg-white font-semibold text-slate-700 flex items-center">{fmt(item.total)}</p>
                  </div>
                  <div className="col-span-1 pt-5">
                    <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
