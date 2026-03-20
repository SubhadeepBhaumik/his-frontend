// PharmacyPage.tsx — Dispense dashboard
import { usePendingPrescriptions, useInventoryStats, useLowStockDrugs, useExpiryAlerts } from '@/hooks/useApi';
import { StatCard, PageLoader, Badge } from '@/components/ui';
import { Link } from 'react-router-dom';
import { Pill, AlertTriangle, Package, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export function PharmacyPage() {
  const { data: stats } = useInventoryStats();
  const { data: lowStock } = useLowStockDrugs();
  const { data: expiring } = useExpiryAlerts();
  const { data: pendingRx } = usePendingPrescriptions();

  const fmt = (n:number) => new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Drugs" value={stats?.totalDrugs||0} icon={Pill} color="primary"/>
        <StatCard label="Low Stock" value={stats?.lowStock||0} sub="Below reorder level" icon={AlertTriangle} color="amber"/>
        <StatCard label="Expiring Soon" value={stats?.expirySoon||0} sub="Within 90 days" icon={AlertTriangle} color="red"/>
        <StatCard label="Inventory Value" value={fmt(stats?.totalInventoryValue||0)} icon={DollarSign} color="green"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Low Stock Alerts</h3>
            <Link to="/pharmacy/formulary?lowStock=true" className="text-xs text-primary-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {lowStock?.slice(0,10).map((d:any)=>(
              <div key={d.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{d.genericName}</p>
                  <p className="text-xs text-slate-400">{d.drugCode} · Reorder at {d.reorderLevel}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-600">{d.currentStock}</p>
                  <p className="text-xs text-slate-400">in stock</p>
                </div>
              </div>
            ))}
            {(!lowStock||lowStock.length===0)&&<p className="text-sm text-slate-400 text-center py-6">✓ All stocks adequate</p>}
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Expiry Alerts</h3>
            <Link to="/pharmacy/receive-stock" className="btn-outline text-xs py-1">+ Receive Stock</Link>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {expiring?.slice(0,10).map((b:any)=>(
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{b.drug?.genericName}</p>
                  <p className="text-xs text-slate-400">Batch: {b.batchNumber} · {b.quantityRemaining} remaining</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-red-600">{format(new Date(b.expiryDate),'dd MMM yyyy')}</p>
                  <p className="text-xs text-slate-400">expiry</p>
                </div>
              </div>
            ))}
            {(!expiring||expiring.length===0)&&<p className="text-sm text-slate-400 text-center py-6">✓ No expiring stock</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
export default PharmacyPage;
