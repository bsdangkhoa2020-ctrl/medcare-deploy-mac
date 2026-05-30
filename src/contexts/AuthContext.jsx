import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appRole, setAppRole] = useState(null);
  const [patientType, setPatientType] = useState(null);
  const [patientLmp, setPatientLmp] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setAppRole(null);
        setPatientType(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (currentUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
        
      if (!error && data) {
        setProfile(data);
      }

      // 1. Xác định appRole (Ghi đè cho tài khoản test, dự phòng từ DB)
      let role = data?.role;
      let pType = null;

      // Chuẩn hóa role nếu trong DB lỡ lưu là patient_ob hoặc patient_gy
      if (role === 'patient_ob') { role = 'patient'; pType = 'ob'; }
      if (role === 'patient_gy') { role = 'patient'; pType = 'gy'; }

      if (currentUser.email === 'bstuanhoang@gmail.com' || currentUser.email === 'doctor@bstuan247.com' || currentUser.email === '0938559098@bstuan247.com') {
        role = 'doctor';
      } else if (currentUser.email === 'letan@gmail.com' || currentUser.email === 'letan@bstuan247.com') {
        role = 'receptionist';
      } else if (currentUser.email === 'obtest2026@gmail.com' || currentUser.email === 'patientob1@bstuan247.com') {
        role = 'patient';
        pType = 'ob';
        const fallbackLmp = new Date();
        fallbackLmp.setDate(fallbackLmp.getDate() - 199); // ~28 tuần 3 ngày
        setPatientLmp(fallbackLmp.toISOString().split('T')[0]);
      } else if (currentUser.email === 'gytest2026@gmail.com' || currentUser.email === 'patientgy2@bstuan247.com') {
        role = 'patient';
        pType = 'gy';
      } else if (!role) {
        role = currentUser?.user_metadata?.role || 'patient';
      }

      // Fallback từ metadata lúc đăng ký nếu chưa có
      if (!pType && currentUser?.user_metadata?.department) {
        pType = currentUser.user_metadata.department;
      }
      if (!patientLmp && currentUser?.user_metadata?.lmp) {
        setPatientLmp(currentUser.user_metadata.lmp);
      }

      // 2. Nếu là Bệnh nhân, thử fetch thêm thông tin chuyên sâu
      if (role === 'patient') {
        const { data: ptData, error: ptError } = await supabase
          .from('patients')
          .select('patient_type, lmp')
          .eq('id', currentUser.id)
          .single();

        if (!ptError && ptData) {
          if (ptData.patient_type) pType = ptData.patient_type;
          if (ptData.lmp) setPatientLmp(ptData.lmp);
        }
      }
      
      setPatientType(pType);
      
      // Update both roles simultaneously to prevent race conditions in useEffects
      setAppRole(role);

    } catch (err) {
      console.error("Error fetching auth data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, appRole, patientType, patientLmp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
