import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ReceptionistDashboard from './pages/Receptionist/Dashboard';
import DoctorDashboard from './pages/Doctor/Dashboard';
import AdminIframe from './pages/Doctor/AdminIframe';
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
            <Route path="bacsi/patients" element={<AdminIframe tab="patients" />} />
            <Route path="bacsi/schedule" element={<AdminIframe tab="schedule" />} />
            <Route path="bacsi/articles" element={<AdminIframe tab="articles" />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
