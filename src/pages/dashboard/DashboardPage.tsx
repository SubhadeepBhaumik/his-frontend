import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, DollarSign, FlaskConical, Pill, Shield, AlertTriangle, TrendingUp, Clock, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useDashboardOverview, useRevenueTrend, useTopDiagnoses, useInventoryAlerts, useOpdQueue } from '@/hooks/useApi';
import { StatCard, PageLoader, Badge, StatusBadge } from '@/components/ui';
import { format } from 'date-fns';

function fmt(n: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
}

export default function DashboardPage() {
  const { data: overview, isLoading } = useDashboardOverview();
  const { data: trend } = useRevenueTrend(30);
  const { data: diagnoses } = useTopDiagnoses();
  const { data: alerts } = useInventoryAlerts();
  const { data: queue } = useOpdQueue();

  if (isLoading) return <PageLoader />;

  const trendData = (trend || []).map((r: any) => ({
    date: format(new Date(r.date), 'dd MMM'),
    revenue: parseFloat(r.revenue || 0),
    transactions: parseInt(r.transactions || 0),
  }));

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={overview?.patients?.total?.toLocaleString() || 0}
          sub={`+${overview?.patients?.today || 0} today`} icon={Users} color="primary" />
        <StatCard label="Today's Revenue" value={fmt(overview?.revenue?.today || 0)}
          sub="Collected today" icon={DollarSign} color="green" />
        <StatCard label="Today's Appointments" value={overview?.appointments?.today || 0}
          sub="Scheduled" icon={Calendar} color="blue" />
        <StatCard label="Pending Lab Orders" value={overview?.pendingLab || 0}
          sub="Awaiting results" icon={FlaskConical} color="amber" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Prescriptions" value={overview?.pendingPrescriptions || 0}
          sub="Pharmacy queue" icon={Pill} color="purple" />
        <StatCard label="Low Stock Drugs" value={overview?.lowStockDrugs || 0}
          sub="Below reorder level" icon={AlertTriangle} color="red" />
        <StatCard label="Pending HMO Claims" value={overview?.pendingClaims || 0}
          sub="Awaiting submission" icon={Shield} color="teal" />
        <StatCard label="Registered Today" value={overview?.patients?.today || 0}
          sub="New patients" icon={Activity} color="primary" />
      </div>

      {/* Revenue Chart + OPD Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-800">Revenue Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 30 days</p>
            </div>
            <TrendingUp size={18} className="text-primary-500" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0e7f58" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0e7f58" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [fmt(v), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#0e7f58" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Queue */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">OPD Queue Today</h3>
              <p className="text-xs text-slate-400">{queue?.length || 0} appointments</p>
            </div>
            <Link to="/emr/queue" className="text-xs text-primary-600 hover:underline font-medium">View all →</Link>
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {queue?.slice(0, 8).map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                  {a.patient_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{a.patient_name}</p>
                  <p className="text-xs text-slate-400">{a.appointment_time} · {a.doctor_name || 'Unassigned'}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
            {(!queue || queue.length === 0) && (
              <p className="text-sm text-slate-400 text-center py-6">No appointments today</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: Top Diagnoses + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Diagnoses */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Top Diagnoses This Month</h3>
          <div className="space-y-2">
            {diagnoses?.slice(0, 8).map((d: any, i: number) => (
              <div key={d.code} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-medium text-slate-700 truncate">{d.description}</p>
                    <p className="text-xs text-slate-500 ml-2 flex-shrink-0">{d.count}</p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-primary-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, (d.count / (diagnoses[0]?.count || 1)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {(!diagnoses || diagnoses.length === 0) && <p className="text-sm text-slate-400 text-center py-4">No data this month</p>}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Inventory Alerts</h3>
            <Link to="/pharmacy/formulary" className="text-xs text-primary-600 hover:underline font-medium">Manage →</Link>
          </div>
          <div className="space-y-2">
            {alerts?.lowStock?.slice(0, 5).map((d: any) => (
              <div key={d.drug_code} className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
                <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{d.generic_name}</p>
                  <p className="text-xs text-slate-400">{d.current_stock} units · reorder at {d.reorder_level}</p>
                </div>
                <Badge color="amber">Low</Badge>
              </div>
            ))}
            {alerts?.expiring?.slice(0, 3).map((d: any) => (
              <div key={d.batch_number} className="flex items-center gap-3 p-2 bg-red-50 rounded-lg border border-red-100">
                <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{d.generic_name}</p>
                  <p className="text-xs text-slate-400">Expires {format(new Date(d.expiry_date), 'dd MMM yyyy')}</p>
                </div>
                <Badge color="red">Expiring</Badge>
              </div>
            ))}
            {(!alerts?.lowStock?.length && !alerts?.expiring?.length) && (
              <p className="text-sm text-slate-400 text-center py-6">✓ No inventory alerts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
