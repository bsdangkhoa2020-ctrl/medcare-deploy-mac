import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ReceptionistDashboard from './pages/Receptionist/Dashboard';
import DoctorDashboard from './pages/Doctor/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/letan" replace />} />
          <Route path="letan" element={<ReceptionistDashboard />} />
          <Route path="bacsi" element={<DoctorDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
