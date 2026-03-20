import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/slices/authStore';
import {
  LayoutDashboard, Users, Calendar, FileText, Pill, Receipt,
  Shield, Settings, LogOut, Activity, FlaskConical, ClipboardList,
  Stethoscope, TrendingUp, Building2, ChevronDown, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface NavItem {
  label: string; href?: string; icon: any;
  children?: { label: string; href: string }[];
  roles?: string[];
}

const NAV: NavItem[] = [
  { label: 'Dashboard',     href: '/dashboard',       icon: LayoutDashboard },
  { label: 'Patients',      href: '/patients',         icon: Users },
  { label: 'Appointments',  href: '/appointments',     icon: Calendar },
  {
    label: 'Clinical',      icon: Stethoscope,
    children: [
      { label: 'OPD Queue',       href: '/emr/queue' },
      { label: 'Lab Orders',      href: '/emr/lab-orders' },
      { label: 'Prescriptions',   href: '/emr/prescriptions' },
    ],
  },
  {
    label: 'Pharmacy',      icon: Pill,
    children: [
      { label: 'Dispense Queue',  href: '/pharmacy' },
      { label: 'Drug Formulary',  href: '/pharmacy/formulary' },
      { label: 'Receive Stock',   href: '/pharmacy/receive-stock' },
    ],
  },
  {
    label: 'Billing',       icon: Receipt,
    children: [
      { label: 'Invoices',        href: '/billing' },
      { label: 'New Invoice',     href: '/billing/new' },
      { label: 'Service Tariffs', href: '/billing/tariffs' },
      { label: 'HMO & Claims',    href: '/billing/hmo' },
    ],
  },
  {
    label: 'Admin',         icon: Shield, roles: ['admin','manager'],
    children: [
      { label: 'Staff Users',     href: '/admin/users' },
      { label: 'Settings',        href: '/settings' },
    ],
  },
];

function NavGroup({ item }: { item: NavItem }) {
  const loc = useLocation();
  const isActive = item.children?.some(c => loc.pathname.startsWith(c.href));
  const [open, setOpen] = useState(!!isActive);
  const Icon = item.icon;

  return (
    <div>
      <button onClick={() => setOpen(!open)}
        className={clsx('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive ? 'bg-primary-600/15 text-primary-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        )}>
        <Icon size={18} />
        <span className="flex-1 text-left">{item.label}</span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && (
        <div className="ml-7 mt-1 flex flex-col gap-0.5">
          {item.children!.map(c => (
            <NavLink key={c.href} to={c.href}
              className={({ isActive }) => clsx('px-3 py-2 rounded-lg text-sm transition-colors',
                isActive ? 'bg-primary-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}>
              {c.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 flex flex-col z-50">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <Activity size={16} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">HIS Portal</p>
          <p className="text-slate-500 text-xs">Hospital Information System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {NAV.map(item => {
          if (item.roles && !item.roles.includes(user?.role || '')) return null;
          if (item.href) {
            const Icon = item.icon;
            return (
              <NavLink key={item.href} to={item.href}
                className={({ isActive }) => clsx('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                )}>
                <Icon size={18} />{item.label}
              </NavLink>
            );
          }
          return <NavGroup key={item.label} item={item} />;
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-slate-500 text-xs capitalize truncate">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
