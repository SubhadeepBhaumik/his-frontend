import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/slices/authStore';
import AppLayout from '@/components/layout/AppLayout';

// Auth
import LoginPage from '@/pages/auth/LoginPage';

// Dashboard
import DashboardPage from '@/pages/dashboard/DashboardPage';

// Patients
import PatientsPage from '@/pages/patients/PatientsPage';
import PatientDetailPage from '@/pages/patients/PatientDetailPage';
import NewPatientPage from '@/pages/patients/NewPatientPage';

// Appointments
import AppointmentsPage from '@/pages/appointments/AppointmentsPage';
import NewAppointmentPage from '@/pages/appointments/NewAppointmentPage';

// EMR
import OpdQueuePage from '@/pages/emr/OpdQueuePage';
import EncounterPage from '@/pages/emr/EncounterPage';
import LabOrdersPage from '@/pages/emr/LabOrdersPage';
import PrescriptionsPage from '@/pages/emr/PrescriptionsPage';

// Pharmacy
import PharmacyPage from '@/pages/pharmacy/PharmacyPage';
import DrugFormularyPage from '@/pages/pharmacy/DrugFormularyPage';
import StockReceivePage from '@/pages/pharmacy/StockReceivePage';

// Billing
import BillingPage from '@/pages/billing/BillingPage';
import InvoiceDetailPage from '@/pages/billing/InvoiceDetailPage';
import NewInvoicePage from '@/pages/billing/NewInvoicePage';
import TariffsPage from '@/pages/billing/TariffsPage';

// HMO
import HmoPage from '@/pages/billing/HmoPage';

// Admin
import UsersPage from '@/pages/admin/UsersPage';
import SettingsPage from '@/pages/settings/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Patients */}
          <Route path="patients" element={<PatientsPage />} />
          <Route path="patients/new" element={<NewPatientPage />} />
          <Route path="patients/:id" element={<PatientDetailPage />} />

          {/* Appointments */}
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="appointments/new" element={<NewAppointmentPage />} />

          {/* EMR / Clinical */}
          <Route path="emr/queue" element={<OpdQueuePage />} />
          <Route path="emr/encounter/:id" element={<EncounterPage />} />
          <Route path="emr/lab-orders" element={<LabOrdersPage />} />
          <Route path="emr/prescriptions" element={<PrescriptionsPage />} />

          {/* Pharmacy */}
          <Route path="pharmacy" element={<PharmacyPage />} />
          <Route path="pharmacy/formulary" element={<DrugFormularyPage />} />
          <Route path="pharmacy/receive-stock" element={<StockReceivePage />} />

          {/* Billing */}
          <Route path="billing" element={<BillingPage />} />
          <Route path="billing/new" element={<NewInvoicePage />} />
          <Route path="billing/:id" element={<InvoiceDetailPage />} />
          <Route path="billing/tariffs" element={<TariffsPage />} />
          <Route path="billing/hmo" element={<HmoPage />} />

          {/* Admin */}
          <Route path="admin/users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
