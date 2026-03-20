import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Printer } from 'lucide-react';
import { useInvoice, useRecordPayment } from '@/hooks/useApi';
import { PageLoader, StatusBadge, Modal, Field, Spinner, Badge } from '@/components/ui';
import { format } from 'date-fns';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n || 0);

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [payRef, setPayRef] = useState('');

  const { data: invoice, isLoading } = useInvoice(id!);
  const recordPayment = useRecordPayment(id!);

  const handlePay = async () => {
    await recordPayment.mutateAsync({
      amount: Number(payAmount), method: payMethod, referenceNo: payRef,
    });
    setShowPayModal(false); setPayAmount(''); setPayRef('');
  };

  if (isLoading) return <PageLoader />;
  if (!invoice) return <div className="text-center py-20 text-slate-400">Invoice not found</div>;

  const p = invoice.patient;
  const isPaid = invoice.status === 'paid';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700"><ArrowLeft size={20} /></button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-800">{invoice.invoiceNo}</h1>
              <StatusBadge status={invoice.status} />
              {invoice.patientType !== 'private' && <StatusBadge status={invoice.patientType} />}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Created {format(new Date(invoice.createdAt), 'dd MMM yyyy HH:mm')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn-outline flex items-center gap-2 text-sm">
            <Printer size={15} /> Print
          </button>
          {!isPaid && Number(invoice.balanceDue) > 0 && (
            <button onClick={() => { setPayAmount(String(invoice.balanceDue)); setShowPayModal(true); }}
              className="btn-primary flex items-center gap-2 text-sm">
              <CreditCard size={15} /> Record Payment
            </button>
          )}
        </div>
      </div>

      {/* Patient Info */}
      <div className="card grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Patient</p>
          <p className="font-semibold text-slate-800">{p?.firstName} {p?.lastName}</p>
          <p className="text-xs text-primary-600 font-mono">{p?.hospitalId}</p>
        </div>
        {invoice.hmoName && (
          <div>
            <p className="text-xs text-slate-400 mb-0.5">HMO</p>
            <p className="font-medium text-slate-700">{invoice.hmoName}</p>
            <p className="text-xs text-slate-400">{invoice.hmoNumber}</p>
          </div>
        )}
        {invoice.preAuthNo && (
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Pre-Auth No.</p>
            <p className="font-mono text-sm text-slate-700">{invoice.preAuthNo}</p>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="card">
        <h3 className="font-semibold text-slate-700 mb-4">Services Rendered</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                {['Service', 'Category', 'Qty', 'Unit Price', 'Total'].map(h => (
                  <th key={h} className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-3 font-medium text-slate-800">{item.serviceName}</td>
                  <td className="py-3 text-slate-500 capitalize">{item.category}</td>
                  <td className="py-3 text-slate-600">{item.quantity}</td>
                  <td className="py-3 text-slate-600">{fmt(item.unitPrice)}</td>
                  <td className="py-3 font-semibold text-slate-800">{fmt(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span><span>{fmt(invoice.subtotal)}</span>
            </div>
            {Number(invoice.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span><span>- {fmt(invoice.discountAmount)}</span>
              </div>
            )}
            {Number(invoice.hmoCoverAmount) > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>HMO Cover</span><span>- {fmt(invoice.hmoCoverAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-800 text-base pt-2 border-t border-slate-200">
              <span>Total</span><span>{fmt(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Amount Paid</span><span>{fmt(invoice.amountPaid)}</span>
            </div>
            <div className={`flex justify-between font-bold text-base ${Number(invoice.balanceDue) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              <span>Balance Due</span><span>{fmt(invoice.balanceDue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {invoice.payments?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-4">Payment History</h3>
          <div className="space-y-2">
            {invoice.payments.map((pay: any) => (
              <div key={pay.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-primary-600 font-semibold">{pay.paymentNo}</span>
                    <Badge color="green">{pay.method?.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {pay.receivedBy?.firstName} {pay.receivedBy?.lastName} · {format(new Date(pay.paidAt), 'dd MMM yyyy HH:mm')}
                    {pay.referenceNo && ` · Ref: ${pay.referenceNo}`}
                  </p>
                </div>
                <p className="font-bold text-emerald-600">{fmt(pay.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {invoice.notes && (
        <div className="card bg-amber-50 border border-amber-100">
          <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
          <p className="text-sm text-slate-700">{invoice.notes}</p>
        </div>
      )}

      {/* Payment Modal */}
      <Modal open={showPayModal} onClose={() => setShowPayModal(false)} title="Record Payment" size="sm">
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-3 text-sm">
            <p className="text-slate-500">Balance Due</p>
            <p className="text-2xl font-bold text-slate-800">{fmt(invoice.balanceDue)}</p>
          </div>
          <Field label="Amount Received (₦)" required>
            <input type="number" className="input text-lg font-semibold" value={payAmount}
              onChange={e => setPayAmount(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Payment Method" required>
            <select className="input" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="pos">POS / Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mobile_money">Mobile Money (Opay, PalmPay)</option>
              <option value="cheque">Cheque</option>
              <option value="hmo">HMO Payment</option>
              <option value="waiver">Waiver</option>
            </select>
          </Field>
          <Field label="Reference No. / Transaction ID">
            <input className="input" value={payRef} onChange={e => setPayRef(e.target.value)}
              placeholder="Bank ref, POS receipt no., etc." />
          </Field>
          {payAmount && Number(payAmount) > Number(invoice.balanceDue) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
              Change to give: <strong>{fmt(Number(payAmount) - Number(invoice.balanceDue))}</strong>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <button className="btn-secondary" onClick={() => setShowPayModal(false)}>Cancel</button>
            <button className="btn-primary flex items-center gap-2" onClick={handlePay}
              disabled={!payAmount || Number(payAmount) <= 0 || recordPayment.isPending}>
              {recordPayment.isPending ? <Spinner size={15} /> : <CreditCard size={15} />}
              Confirm Payment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
