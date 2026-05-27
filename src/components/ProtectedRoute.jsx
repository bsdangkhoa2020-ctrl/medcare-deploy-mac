import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles, allowedPatientTypes }) {
  const { user, loading, appRole, patientType } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gold-light/40 to-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-gold border-t-transparent animate-spin mb-4"></div>
          <p className="text-gold-dark font-medium">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // 1. Chưa đăng nhập -> Đá về trang chủ (HTML cũ)
  if (!user) {
    window.location.href = '/';
    return null;
  }

  // 2. Kiểm tra quyền Role (Doctor, Receptionist, Patient)
  if (allowedRoles && !allowedRoles.includes(appRole)) {
    // Nếu đi sai phòng, tự động đá về đúng phòng của họ
    if (appRole === 'doctor') return <Navigate to="/bacsi" replace />;
    if (appRole === 'receptionist') return <Navigate to="/letan" replace />;
    if (appRole === 'patient') {
      if (patientType === 'ob') return <Navigate to="/sankhoa" replace />;
      if (patientType === 'gy') return <Navigate to="/phukhoa" replace />;
      return <Navigate to="/" replace />; // Lỗi không xác định được loại bệnh nhân
    }
  }

  // 3. Nếu là Bệnh nhân, kiểm tra tiếp patient_type (Sản hay Phụ khoa)
  if (appRole === 'patient' && allowedPatientTypes) {
    if (!allowedPatientTypes.includes(patientType)) {
      if (patientType === 'ob') return <Navigate to="/sankhoa" replace />;
      if (patientType === 'gy') return <Navigate to="/phukhoa" replace />;
    }
  }

  // 4. Hợp lệ -> Cho phép truy cập component con
  return children;
}
