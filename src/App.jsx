import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ReceptionistDashboard from './pages/Receptionist/Dashboard';
import DoctorDashboard from './pages/Doctor/Dashboard';
import Patients from './pages/Doctor/Patients';
import Schedule from './pages/Doctor/Schedule';
import ComingSoon from './pages/Doctor/ComingSoon';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/letan" replace />} />
            <Route path="letan" element={<ReceptionistDashboard />} />
            <Route path="bacsi" element={<DoctorDashboard />} />
            <Route path="bacsi/patients" element={<Patients />} />
            <Route path="bacsi/schedule" element={<Schedule />} />
            <Route path="bacsi/articles" element={<ComingSoon title="Tạp chí Y khoa" />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
