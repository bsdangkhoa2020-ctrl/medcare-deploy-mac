import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import OBLayout from './components/OBLayout';
import GYLayout from './components/GYLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

// ─── Staff Pages ───────────────────────────────────────────────
import ReceptionistDashboard from './pages/Receptionist/Dashboard';
import DoctorDashboard from './pages/Doctor/Dashboard';
import Patients from './pages/Doctor/Patients';
import Schedule from './pages/Doctor/Schedule';
import ComingSoon from './pages/Doctor/ComingSoon';

// ─── Sản Khoa (OB) ─────────────────────────────────────────────
import OBDashboard    from './pages/Patient/Obstetrics/Dashboard';
import OBAppointments from './pages/Patient/Obstetrics/Appointments';
import OBRecords      from './pages/Patient/Obstetrics/Records';
import OBCheckin      from './pages/Patient/Obstetrics/Checkin';
import KickCounter    from './pages/Patient/Obstetrics/KickCounter';
import OBKnowledge    from './pages/Patient/Obstetrics/Knowledge';

// ─── Phụ Khoa (GY) ─────────────────────────────────────────────
import GYDashboard    from './pages/Patient/Gynecology/Dashboard';
import GYAppointments from './pages/Patient/Gynecology/Appointments';
import GYRecords      from './pages/Patient/Gynecology/Records';
import GYKnowledge    from './pages/Patient/Gynecology/Knowledge';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* ── Default: redirect dựa vào role ─────────────────── */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/letan" replace />
            </ProtectedRoute>
          } />

          {/* ── DOCTOR ─────────────────────────────────────────── */}
          <Route element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="bacsi"           element={<DoctorDashboard />} />
            <Route path="bacsi/patients"  element={<Patients />} />
            <Route path="bacsi/schedule"  element={<Schedule />} />
            <Route path="bacsi/articles"  element={<ComingSoon title="Tạp chí Y khoa" />} />
          </Route>

          {/* ── RECEPTIONIST ───────────────────────────────────── */}
          <Route element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="letan" element={<ReceptionistDashboard />} />
          </Route>

          {/* ══════════════════════════════════════════════════════
              PHÒNG SẢN KHOA — màu vàng gold / nền ink đen
              Tất cả routes /sankhoa/* đều dùng OBLayout
          ══════════════════════════════════════════════════════ */}
          <Route element={
            <ProtectedRoute allowedRoles={['patient']} allowedPatientTypes={['ob']}>
              <OBLayout />
            </ProtectedRoute>
          }>
            <Route path="sankhoa"             element={<OBDashboard />} />
            <Route path="sankhoa/lich-hen"    element={<OBAppointments />} />
            <Route path="sankhoa/ho-so"       element={<OBRecords />} />
            <Route path="sankhoa/check-in"    element={<OBCheckin />} />
            <Route path="sankhoa/cu-dong"     element={<KickCounter />} />
            <Route path="sankhoa/kien-thuc"   element={<OBKnowledge />} />
          </Route>

          {/* ══════════════════════════════════════════════════════
              PHÒNG PHỤ KHOA — màu hồng / nền trắng
              Tất cả routes /phukhoa/* đều dùng GYLayout
          ══════════════════════════════════════════════════════ */}
          <Route element={
            <ProtectedRoute allowedRoles={['patient']} allowedPatientTypes={['gy']}>
              <GYLayout />
            </ProtectedRoute>
          }>
            <Route path="phukhoa"             element={<GYDashboard />} />
            <Route path="phukhoa/lich-hen"    element={<GYAppointments />} />
            <Route path="phukhoa/ho-so"       element={<GYRecords />} />
            <Route path="phukhoa/kien-thuc"   element={<GYKnowledge />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
