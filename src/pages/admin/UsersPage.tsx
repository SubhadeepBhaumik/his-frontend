import { useState } from 'react';
import { Plus, Edit } from 'lucide-react';
import { useUsers, useCreateUser, useUpdateUser } from '@/hooks/useApi';
import { Table, SearchInput, PageLoader, Modal, Field, Spinner, Badge, StatusBadge } from '@/components/ui';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

const ROLES = [
  { value: 'admin', label: 'System Administrator' },
  { value: 'doctor', label: 'Doctor / Physician' },
  { value: 'nurse', label: 'Nurse / Midwife' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'cashier', label: 'Cashier / Billing' },
  { value: 'lab_tech', label: 'Laboratory Technician' },
  { value: 'radiologist', label: 'Radiologist' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'manager', label: 'Hospital Manager' },
];

const ROLE_COLOR: Record<string, string> = {
  admin: 'red', doctor: 'blue', nurse: 'teal', pharmacist: 'green',
  cashier: 'amber', lab_tech: 'purple', radiologist: 'purple',
  receptionist: 'slate', manager: 'primary',
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);

  const { data, isLoading } = useUsers({ page, limit: 20, search });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser(editUser?.id || '');
  const { register: regCreate, handleSubmit: handleCreate, reset: resetCreate, formState: { errors: errC } } = useForm();
  const { register: regEdit, handleSubmit: handleEdit, reset: resetEdit } = useForm();

  const users = data?.data || [];
  const meta = data?.meta;

  const onCreateSubmit = async (dto: any) => {
    await createUser.mutateAsync(dto);
    resetCreate(); setShowCreate(false);
  };

  const onEditSubmit = async (dto: any) => {
    await updateUser.mutateAsync(dto);
    resetEdit(); setEditUser(null);
  };

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-slate-800">Staff Users</h3>
            <p className="text-xs text-slate-400 mt-0.5">Manage staff accounts and access roles</p>
          </div>
          <div className="flex gap-3">
            <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search staff..." />
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Add Staff
            </button>
          </div>
        </div>

        {isLoading ? <PageLoader /> : (
          <>
            <Table headers={['Staff ID', 'Name', 'Role', 'Department', 'Email', 'Phone', 'Status', 'Joined', '']}>
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="table-cell font-mono text-xs text-primary-600">{u.staffId || '—'}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <p className="font-medium text-slate-800">{u.firstName} {u.lastName}</p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <Badge color={ROLE_COLOR[u.role] || 'slate'}>
                      {ROLES.find(r => r.value === u.role)?.label || u.role}
                    </Badge>
                  </td>
                  <td className="table-cell text-slate-500">{u.department || '—'}</td>
                  <td className="table-cell text-slate-500 text-xs">{u.email}</td>
                  <td className="table-cell text-slate-500">{u.phone || '—'}</td>
                  <td className="table-cell">
                    <Badge color={u.isActive ? 'green' : 'red'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="table-cell text-xs text-slate-400">{format(new Date(u.createdAt), 'dd MMM yyyy')}</td>
                  <td className="table-cell">
                    <button onClick={() => { setEditUser(u); resetEdit(u); }}
                      className="text-slate-400 hover:text-primary-600 transition-colors">
                      <Edit size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </Table>

            {users.length === 0 && (
              <div className="text-center py-12 text-slate-400">No staff users found</div>
            )}

            {meta?.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">{meta.total} staff</p>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">← Prev</button>
                  <span className="text-sm text-slate-500 self-center">{page} / {meta.totalPages}</span>
                  <button disabled={!meta.hasNext} onClick={() => setPage(p => p + 1)} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create User Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Staff User" size="lg">
        <form onSubmit={handleCreate(onCreateSubmit)} className="grid grid-cols-2 gap-4">
          <Field label="First Name" required error={errC.firstName?.message as string}>
            <input className="input" {...regCreate('firstName', { required: 'Required' })} />
          </Field>
          <Field label="Last Name" required>
            <input className="input" {...regCreate('lastName', { required: 'Required' })} />
          </Field>
          <Field label="Email Address" required>
            <input type="email" className="input" {...regCreate('email', { required: 'Required' })} />
          </Field>
          <Field label="Password" required>
            <input type="password" className="input" placeholder="Min. 8 characters"
              {...regCreate('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} />
          </Field>
          <Field label="Role" required>
            <select className="input" {...regCreate('role', { required: 'Required' })}>
              <option value="">Select role</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </Field>
          <Field label="Staff ID">
            <input className="input" {...regCreate('staffId')} placeholder="e.g. DOC-001" />
          </Field>
          <Field label="Department">
            <input className="input" {...regCreate('department')} placeholder="e.g. General Practice" />
          </Field>
          <Field label="Specialisation">
            <input className="input" {...regCreate('specialisation')} placeholder="For doctors (optional)" />
          </Field>
          <Field label="Phone">
            <input className="input" {...regCreate('phone')} />
          </Field>
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" disabled={createUser.isPending} className="btn-primary flex items-center gap-2">
              {createUser.isPending ? <Spinner size={15} /> : <Plus size={15} />} Create Staff Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit Staff User" size="lg">
        {editUser && (
          <form onSubmit={handleEdit(onEditSubmit)} className="grid grid-cols-2 gap-4">
            <Field label="First Name"><input className="input" {...regEdit('firstName')} /></Field>
            <Field label="Last Name"><input className="input" {...regEdit('lastName')} /></Field>
            <Field label="Role">
              <select className="input" {...regEdit('role')}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </Field>
            <Field label="Department"><input className="input" {...regEdit('department')} /></Field>
            <Field label="Specialisation"><input className="input" {...regEdit('specialisation')} /></Field>
            <Field label="Phone"><input className="input" {...regEdit('phone')} /></Field>
            <div className="flex items-center gap-2 col-span-2">
              <input type="checkbox" id="isActive" {...regEdit('isActive')} className="rounded" />
              <label htmlFor="isActive" className="text-sm text-slate-700">Account active</label>
            </div>
            <div className="col-span-2 flex gap-3 justify-end pt-2">
              <button type="button" className="btn-secondary" onClick={() => setEditUser(null)}>Cancel</button>
              <button type="submit" disabled={updateUser.isPending} className="btn-primary flex items-center gap-2">
                {updateUser.isPending ? <Spinner size={15} /> : <Edit size={15} />} Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
