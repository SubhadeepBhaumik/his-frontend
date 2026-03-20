import { useLocation } from 'react-router-dom';
import { Bell, Search, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/slices/authStore';
import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import { useState } from 'react';
import clsx from 'clsx';

const CRUMBS: Record<string, string> = {
  '/dashboard': 'Dashboard', '/patients': 'Patients', '/patients/new': 'New Patient',
  '/appointments': 'Appointments', '/appointments/new': 'New Appointment',
  '/emr/queue': 'OPD Queue', '/emr/lab-orders': 'Lab Orders', '/emr/prescriptions': 'Prescriptions',
  '/pharmacy': 'Dispense Queue', '/pharmacy/formulary': 'Drug Formulary', '/pharmacy/receive-stock': 'Receive Stock',
  '/billing': 'Billing', '/billing/new': 'New Invoice', '/billing/tariffs': 'Service Tariffs', '/billing/hmo': 'HMO & Claims',
  '/admin/users': 'Staff Users', '/settings': 'Settings',
};

export default function TopBar() {
  const loc = useLocation();
  const { user } = useAuthStore();
  const [showAlerts, setShowAlerts] = useState(false);
  const title = CRUMBS[loc.pathname] ?? 'HIS';

  const { data: alerts } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: () => api.get('/dashboard/inventory-alerts'),
    refetchInterval: 60_000,
    select: (d: any) => d?.data,
  });

  const alertCount = (alerts?.lowStock?.length || 0) + (alerts?.expiring?.length || 0);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
        <p className="text-xs text-slate-400">
          {new Date().toLocaleDateString('en-NG', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      <div className="relative">
        <button onClick={() => setShowAlerts(!showAlerts)}
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={20} />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>
        {showAlerts && (
          <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="font-semibold text-slate-800 text-sm">Alerts</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {alerts?.lowStock?.slice(0,5).map((d: any) => (
                <div key={d.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-50">
                  <AlertTriangle size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700 font-medium">{d.generic_name}</p>
                    <p className="text-xs text-slate-400">Low stock: {d.current_stock} units remaining</p>
                  </div>
                </div>
              ))}
              {alerts?.expiring?.slice(0,5).map((d: any) => (
                <div key={d.batch_number} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-50">
                  <AlertTriangle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700 font-medium">{d.generic_name}</p>
                    <p className="text-xs text-slate-400">Expires: {new Date(d.expiry_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {alertCount === 0 && <p className="px-4 py-6 text-sm text-slate-400 text-center">No alerts</p>}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-slate-700 leading-tight">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-slate-400 capitalize">{user?.role?.replace('_',' ')}</p>
        </div>
      </div>
    </header>
  );
}
