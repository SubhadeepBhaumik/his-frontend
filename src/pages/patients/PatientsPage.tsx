import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, UserPlus, Eye } from 'lucide-react';
import { usePatients, usePatientStats } from '@/hooks/useApi';
import { Table, StatusBadge, SearchInput, StatCard, PageLoader, EmptyState, Badge } from '@/components/ui';
import { format } from 'date-fns';
import { Users, Heart, Shield } from 'lucide-react';

export default function PatientsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [patientType, setPatientType] = useState('');

  const { data, isLoading } = usePatients({ page, limit: 20, search, patientType });
  const { data: stats } = usePatientStats();

  const patients = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={stats?.total?.toLocaleString() || 0} icon={Users} color="primary" />
        <StatCard label="HMO Patients" value={stats?.hmo?.toLocaleString() || 0} icon={Shield} color="teal" />
        <StatCard label="NHIA Patients" value={stats?.nhia?.toLocaleString() || 0} icon={Shield} color="purple" />
        <StatCard label="Registered Today" value={stats?.registeredToday || 0} icon={UserPlus} color="green" />
      </div>

      {/* List */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-800">Patient Registry</h3>
          <div className="flex items-center gap-3">
            <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search name, ID, phone..." />
            <select value={patientType} onChange={e => { setPatientType(e.target.value); setPage(1); }}
              className="input w-36">
              <option value="">All Types</option>
              <option value="private">Private</option>
              <option value="hmo">HMO</option>
              <option value="nhia">NHIA</option>
              <option value="staff">Staff</option>
            </select>
            <Link to="/patients/new" className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Register
            </Link>
          </div>
        </div>

        {isLoading ? <PageLoader /> : (
          <>
            <Table headers={['Patient ID', 'Name', 'Age/Gender', 'Phone', 'Type', 'HMO', 'Registered', '']}>
              {patients.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/patients/${p.id}`)}>
                  <td className="table-cell font-mono text-xs text-primary-600 font-semibold">{p.hospitalId}</td>
                  <td className="table-cell">
                    <div>
                      <p className="font-medium text-slate-800">{p.firstName} {p.lastName}</p>
                      {p.knownAllergies?.length > 0 && (
                        <span className="text-xs text-red-500">⚠ Allergies on file</span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">{p.age}y · <span className="capitalize">{p.gender}</span></td>
                  <td className="table-cell text-slate-500">{p.phone || '—'}</td>
                  <td className="table-cell"><StatusBadge status={p.patientType} /></td>
                  <td className="table-cell text-slate-500 text-xs">{p.hmoName || '—'}</td>
                  <td className="table-cell text-slate-400 text-xs">{format(new Date(p.createdAt), 'dd MMM yyyy')}</td>
                  <td className="table-cell">
                    <button className="text-slate-400 hover:text-primary-600 transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </Table>

            {patients.length === 0 && (
              <EmptyState title="No patients found"
                description={search ? `No results for "${search}"` : 'Register your first patient to get started'}
                action={<Link to="/patients/new" className="btn-primary flex items-center gap-2"><Plus size={16}/>Register Patient</Link>} />
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">Showing {patients.length} of {meta.total} patients</p>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">← Prev</button>
                  <span className="text-sm text-slate-500 self-center">Page {page} of {meta.totalPages}</span>
                  <button disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
