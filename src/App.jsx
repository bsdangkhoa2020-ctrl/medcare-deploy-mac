import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PatientLayout from './components/PatientLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import ReceptionistDashboard from './pages/Receptionist/Dashboard';
import DoctorDashboard from './pages/Doctor/Dashboard';
import Patients from './pages/Doctor/Patients';
import Schedule from './pages/Doctor/Schedule';
import ComingSoon from './pages/Doctor/ComingSoon';
import OBDashboard from './pages/Patient/Obstetrics/Dashboard';
import GYDashboard from './pages/Patient/Gynecology/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default Route: Tự động rẽ nhánh dựa vào appRole thay vì mặc định vào /letan */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/letan" replace />
            </ProtectedRoute>
          } />

          {/* DOCTOR ROUTES (Chỉ Bác sĩ) */}
          <Route element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="bacsi" element={<DoctorDashboard />} />
            <Route path="bacsi/patients" element={<Patients />} />
            <Route path="bacsi/schedule" element={<Schedule />} />
            <Route path="bacsi/articles" element={<ComingSoon title="Tạp chí Y khoa" />} />
          </Route>

          {/* RECEPTIONIST ROUTES (Chỉ Lễ tân) */}
          <Route element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="letan" element={<ReceptionistDashboard />} />
          </Route>

          {/* PATIENT ROUTES (Bệnh nhân) */}
          <Route element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientLayout />
            </ProtectedRoute>
          }>
            <Route path="sankhoa" element={
              <ProtectedRoute allowedRoles={['patient']} allowedPatientTypes={['ob']}>
                <OBDashboard />
              </ProtectedRoute>
            } />
            <Route path="phukhoa" element={
              <ProtectedRoute allowedRoles={['patient']} allowedPatientTypes={['gy']}>
                <GYDashboard />
              </ProtectedRoute>
            } />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
