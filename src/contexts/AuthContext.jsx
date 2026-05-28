import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appRole, setAppRole] = useState(null);
  const [patientType, setPatientType] = useState(null);

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
      if (currentUser.email === 'bstuanhoang@gmail.com' || currentUser.email === 'doctor@baobei.app') {
        role = 'doctor';
      } else if (currentUser.email === 'letan@gmail.com' || currentUser.email === 'letan@baobei.app') {
        role = 'receptionist';
      } else if (!role) {
        role = 'patient';
      }
      setAppRole(role);

      // 2. Nếu là Bệnh nhân, xác định patient_type
      if (role === 'patient') {
        const { data: ptData, error: ptError } = await supabase
          .from('patients')
          .select('patient_type')
          .eq('id', currentUser.id)
          .single();

        let pType = (!ptError && ptData?.patient_type) ? ptData.patient_type : null;
        
        // Luôn ghi đè cho tài khoản Test nhanh
        if (currentUser.email === 'obtest2026@gmail.com' || currentUser.email === 'patientob1@baobei.app') {
          pType = 'ob';
        } else if (currentUser.email === 'gytest2026@gmail.com' || currentUser.email === 'patientgy2@baobei.app') {
          pType = 'gy';
        }
        setPatientType(pType);
      }
    } catch (err) {
      console.error("Error fetching auth data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, appRole, patientType }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
