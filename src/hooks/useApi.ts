import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import toast from 'react-hot-toast';

const extract = (d: any) => d?.data ?? d;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const useLogin = () => useMutation({
  mutationFn: (dto: { email: string; password: string }) => api.post('/auth/login', dto),
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const useDashboardOverview = () =>
  useQuery({ queryKey:['dashboard'], queryFn:() => api.get('/dashboard/overview'), select: extract, refetchInterval:30_000 });

export const useRevenueTrend = (days = 30) =>
  useQuery({ queryKey:['revenue-trend',days], queryFn:() => api.get(`/dashboard/revenue-trend?days=${days}`), select: extract });

export const useOpdQueue = () =>
  useQuery({ queryKey:['opd-queue'], queryFn:() => api.get('/dashboard/opd-queue'), select: extract, refetchInterval:15_000 });

export const useTopDiagnoses = () =>
  useQuery({ queryKey:['top-diagnoses'], queryFn:() => api.get('/dashboard/top-diagnoses'), select: extract });

export const useInventoryAlerts = () =>
  useQuery({ queryKey:['inventory-alerts'], queryFn:() => api.get('/dashboard/inventory-alerts'), select: extract });

// ── Patients ──────────────────────────────────────────────────────────────────
export const usePatients = (params: any) =>
  useQuery({ queryKey:['patients', params], queryFn:() => api.get('/patients', { params }), select: extract });

export const usePatient = (id: string) =>
  useQuery({ queryKey:['patient', id], queryFn:() => api.get(`/patients/${id}`), select: extract, enabled:!!id });

export const usePatientStats = () =>
  useQuery({ queryKey:['patient-stats'], queryFn:() => api.get('/patients/stats'), select: extract });

export const useCreatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/patients', dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['patients'] }); toast.success('Patient registered successfully'); },
    onError: (e: any) => toast.error(e?.error?.message || 'Registration failed'),
  });
};

export const useUpdatePatient = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.put(`/patients/${id}`, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['patient',id] }); toast.success('Patient updated'); },
    onError: (e: any) => toast.error(e?.error?.message || 'Update failed'),
  });
};

// ── Appointments ──────────────────────────────────────────────────────────────
export const useAppointments = (params: any) =>
  useQuery({ queryKey:['appointments', params], queryFn:() => api.get('/appointments', { params }), select: extract });

export const useAppointment = (id: string) =>
  useQuery({ queryKey:['appointment', id], queryFn:() => api.get(`/appointments/${id}`), select: extract, enabled:!!id });

export const useTodayQueue = (doctorId?: string) =>
  useQuery({ queryKey:['today-queue', doctorId], queryFn:() => api.get('/appointments/today-queue', { params:{ doctorId } }), select: extract, refetchInterval:20_000 });

export const useCreateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/appointments', dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['appointments'] }); toast.success('Appointment booked'); },
    onError: (e: any) => toast.error(e?.error?.message || 'Booking failed'),
  });
};

export const useUpdateAppointmentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: any) => api.patch(`/appointments/${id}/status`, { status, notes }),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['appointments'] }); qc.invalidateQueries({ queryKey:['today-queue'] }); },
  });
};

// ── EMR ───────────────────────────────────────────────────────────────────────
export const usePatientEncounters = (patientId: string) =>
  useQuery({ queryKey:['encounters', patientId], queryFn:() => api.get(`/emr/encounters/patient/${patientId}`), select: extract, enabled:!!patientId });

export const useEncounter = (id: string) =>
  useQuery({ queryKey:['encounter', id], queryFn:() => api.get(`/emr/encounters/${id}`), select: extract, enabled:!!id, refetchInterval:10_000 });

export const useCreateEncounter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/emr/encounters', dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['encounters'] }); toast.success('Encounter opened'); },
    onError: (e: any) => toast.error(e?.error?.message || 'Failed'),
  });
};

export const useRecordVitals = (encounterId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post(`/emr/encounters/${encounterId}/vitals`, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['encounter', encounterId] }); toast.success('Vitals recorded'); },
  });
};

export const useSaveSoap = (encounterId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post(`/emr/encounters/${encounterId}/soap`, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['encounter', encounterId] }); toast.success('SOAP note saved'); },
  });
};

export const useCreatePrescription = (encounterId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post(`/emr/encounters/${encounterId}/prescriptions`, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['encounter', encounterId] }); toast.success('Prescription created'); },
    onError: (e: any) => toast.error(e?.error?.message || 'Failed'),
  });
};

export const useCreateLabOrder = (encounterId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post(`/emr/encounters/${encounterId}/lab-orders`, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['encounter', encounterId] }); toast.success('Lab order created'); },
  });
};

export const usePendingLabOrders = () =>
  useQuery({ queryKey:['pending-lab'], queryFn:() => api.get('/emr/lab-orders/pending'), select: extract, refetchInterval:15_000 });

export const useResultLabOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, results }: any) => api.patch(`/emr/lab-orders/${id}/result`, { results }),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['pending-lab'] }); toast.success('Results uploaded'); },
  });
};

export const usePendingPrescriptions = () =>
  useQuery({ queryKey:['pending-rx'], queryFn:() => api.get('/emr/prescriptions/pending'), select: extract, refetchInterval:15_000 });

export const useDispensePrescription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, items }: any) => api.patch(`/emr/prescriptions/${id}/dispense`, { items }),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['pending-rx'] }); toast.success('Prescription dispensed'); },
  });
};

// ── Pharmacy ──────────────────────────────────────────────────────────────────
export const useDrugs = (params: any) =>
  useQuery({ queryKey:['drugs', params], queryFn:() => api.get('/pharmacy/drugs', { params }), select: extract });

export const useDrug = (id: string) =>
  useQuery({ queryKey:['drug', id], queryFn:() => api.get(`/pharmacy/drugs/${id}`), select: extract, enabled:!!id });

export const useInventoryStats = () =>
  useQuery({ queryKey:['inventory-stats'], queryFn:() => api.get('/pharmacy/stock/stats'), select: extract });

export const useLowStockDrugs = () =>
  useQuery({ queryKey:['low-stock'], queryFn:() => api.get('/pharmacy/drugs/low-stock'), select: extract });

export const useExpiryAlerts = () =>
  useQuery({ queryKey:['expiry-alerts'], queryFn:() => api.get('/pharmacy/drugs/expiry-alerts'), select: extract });

export const useCreateDrug = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/pharmacy/drugs', dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['drugs'] }); toast.success('Drug added to formulary'); },
    onError: (e: any) => toast.error(e?.error?.message || 'Failed'),
  });
};

export const useReceiveStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/pharmacy/stock/receive', dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['drugs'] }); qc.invalidateQueries({ queryKey:['inventory-stats'] }); toast.success('Stock received'); },
  });
};

// ── Billing ───────────────────────────────────────────────────────────────────
export const useInvoices = (params: any) =>
  useQuery({ queryKey:['invoices', params], queryFn:() => api.get('/billing/invoices', { params }), select: extract });

export const useInvoice = (id: string) =>
  useQuery({ queryKey:['invoice', id], queryFn:() => api.get(`/billing/invoices/${id}`), select: extract, enabled:!!id });

export const useRevenueStats = (dateFrom?: string, dateTo?: string) =>
  useQuery({ queryKey:['revenue', dateFrom, dateTo], queryFn:() => api.get('/billing/analytics/revenue', { params:{ dateFrom, dateTo } }), select: extract });

export const useDailyTrend = (days = 30) =>
  useQuery({ queryKey:['daily-trend', days], queryFn:() => api.get(`/billing/analytics/trend?days=${days}`), select: extract });

export const useCreateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/billing/invoices', dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['invoices'] }); toast.success('Invoice created'); },
    onError: (e: any) => toast.error(e?.error?.message || 'Failed'),
  });
};

export const useRecordPayment = (invoiceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post(`/billing/invoices/${invoiceId}/payments`, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['invoice', invoiceId] }); qc.invalidateQueries({ queryKey:['invoices'] }); toast.success('Payment recorded'); },
    onError: (e: any) => toast.error(e?.error?.message || 'Payment failed'),
  });
};

export const useTariffs = (search?: string, category?: string) =>
  useQuery({ queryKey:['tariffs', search, category], queryFn:() => api.get('/billing/tariffs', { params:{ search, category } }), select: extract });

// ── HMO ───────────────────────────────────────────────────────────────────────
export const useHmoProviders = () =>
  useQuery({ queryKey:['hmo-providers'], queryFn:() => api.get('/hmo/providers'), select: extract });

export const useHmoClaims = (params: any) =>
  useQuery({ queryKey:['hmo-claims', params], queryFn:() => api.get('/hmo/claims', { params }), select: extract });

export const useHmoClaimsStats = () =>
  useQuery({ queryKey:['hmo-claims-stats'], queryFn:() => api.get('/hmo/claims/stats'), select: extract });

export const useCreateClaim = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/hmo/claims', dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['hmo-claims'] }); toast.success('Claim created'); },
  });
};

export const useSubmitClaim = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/hmo/claims/${id}/submit`),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['hmo-claims'] }); toast.success('Claim submitted to HMO'); },
  });
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const useUsers = (params: any) =>
  useQuery({ queryKey:['users', params], queryFn:() => api.get('/users', { params }), select: extract });

export const useDoctors = () =>
  useQuery({ queryKey:['doctors'], queryFn:() => api.get('/users/doctors'), select: extract });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/users', dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['users'] }); toast.success('Staff user created'); },
    onError: (e: any) => toast.error(e?.error?.message || 'Failed'),
  });
};

export const useUpdateUser = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.put(`/users/${id}`, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['users'] }); toast.success('User updated'); },
  });
};
