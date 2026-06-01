import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Icon, ICONS } from '../Patient/Gynecology/components/shared'; // for icons if needed, or inline SVG

const styles = {
  // Keeping a few essential styles if we need them, but mostly using Tailwind
  page: 'min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 relative overflow-hidden',
  card: 'w-full max-w-md bg-white rounded-[20px] p-6 sm:p-8 shadow-xl shadow-gold/5 border border-gold/15 relative z-10',
  input: 'w-full h-[52px] px-4 bg-[#FEFAF5] border border-gold/30 rounded-xl focus:border-gold-dk focus:ring-4 focus:ring-gold/10 transition-all text-ink placeholder:text-ink-muted/50 font-medium',
  label: 'block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2',
  btnPrimary: 'w-full h-[52px] bg-ink text-gold-lt font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-black hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2',
  btnSecondary: 'w-full h-[52px] bg-transparent text-ink border border-gold/30 font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-gold-lt/30 transition-all flex items-center justify-center gap-2',
};

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function Register() {
  const navigate = useNavigate();
  const { user, appRole, patientType, loading: authLoading } = useAuth();

  // Step state
  const [step, setStep] = useState(1);

  // Form state
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  
  const [department, setDepartment] = useState('');
  const [lmp, setLmp] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /* ── Redirect if already authenticated ── */
  useEffect(() => {
    if (!authLoading && user && appRole) {
      if (appRole === 'patient') {
        // Optimistic redirect based on local state if patientType is lagging
        const targetType = patientType || department;
        if (targetType === 'ob') navigate('/sankhoa', { replace: true });
        else if (targetType === 'gy') navigate('/phukhoa', { replace: true });
        else navigate('/sankhoa', { replace: true });
      } else if (appRole === 'doctor') {
        navigate('/bacsi', { replace: true });
      } else if (appRole === 'receptionist') {
        navigate('/letan', { replace: true });
      }
    }
  }, [user, appRole, patientType, authLoading, navigate, department]);

  /* ── Validation Helpers ── */
  const validateStep1 = () => {
    if (!phone || phone.length < 10) return 'Số điện thoại không hợp lệ.';
    if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
    if (password !== confirmPassword) return 'Mật khẩu nhập lại không khớp.';
    return null;
  };

  const validateStep2 = () => {
    if (!fullName.trim()) return 'Vui lòng nhập họ và tên.';
    if (!dob) return 'Vui lòng nhập ngày sinh.';
    return null;
  };

  const validateStep3 = () => {
    if (!department) return 'Vui lòng chọn chuyên khoa.';
    return null;
  };

  const nextStep = () => {
    setError('');
    if (step === 1) {
      const err = validateStep1();
      if (err) return setError(err);
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) return setError(err);
      setStep(3);
    } else if (step === 3) {
      const err = validateStep3();
      if (err) return setError(err);
      if (department === 'gy') {
        handleSubmit(); // Phụ khoa doesn't need LMP, submit immediately
      } else {
        setStep(4);
      }
    }
  };

  const prevStep = () => {
    setError('');
    setStep(s => Math.max(1, s - 1));
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Final validation
    if (department === 'ob' && step === 4) {
      // LMP is optional, so no strict validation needed
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const authEmail = `${phone.trim()}@bstuan247.com`;

    // Calculate EDD
    let eddValue = '';
    if (department === 'ob' && lmp) {
      const match = lmp.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
      if (match) {
        const d = parseInt(match[1], 10), m = parseInt(match[2], 10) - 1, y = parseInt(match[3], 10);
        const lmpDate = new Date(y, m, d);
        if (!isNaN(lmpDate.getTime())) {
          const eddDate = new Date(lmpDate.getTime() + 280 * 24 * 60 * 60 * 1000);
          eddValue = `${eddDate.getDate().toString().padStart(2, '0')}/${(eddDate.getMonth() + 1).toString().padStart(2, '0')}/${eddDate.getFullYear()}`;
        }
      }
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: authEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            dob: dob,
            department: department,
            lmp: lmp,
            edd: eddValue
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        setLoading(false);
        return;
      }

      setSuccess('Đăng ký thành công! Hệ thống đang chuyển hướng...');
      // Loading state remains true until useEffect redirects
    } catch (err) {
      setError('Đã xảy ra lỗi kết nối.');
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className={styles.page}>
       <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className={styles.page}>
      {/* Decorative BG */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-gold/10 rounded-full blur-[100px]" />
      
      <div className={styles.card}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold to-gold-lt" />
        
        {/* Header */}
        <div className="mb-8 text-center mt-2">
          <h2 className="font-serif text-3xl font-bold text-ink mb-2">Đăng Ký Hồ Sơ</h2>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4].map(i => (
               <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-gold-dk' : i < step ? 'w-4 bg-gold-lt' : 'w-4 bg-gold/20'}`} />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-danger-lt/50 border border-danger/30 text-danger-dk px-4 py-3 rounded-xl text-sm mb-6 flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {success && (
          <div className="bg-ok-lt/30 border border-ok/30 text-ok-dk px-4 py-3 rounded-xl text-sm mb-6">
            {success}
          </div>
        )}

        {/* STEP 1: Tài Khoản */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <label className={styles.label}>Số điện thoại (Dùng để đăng nhập)</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Nhập số điện thoại" className={styles.input} />
            </div>
            <div>
              <label className={styles.label}>Mật khẩu</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" className={styles.input} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-dk hover:text-ink">
                  {showPassword ? <EyeOffIcon/> : <EyeIcon/>}
                </button>
              </div>
            </div>
            <div>
              <label className={styles.label}>Nhập lại mật khẩu</label>
              <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu" className={styles.input} />
            </div>
          </div>
        )}

        {/* STEP 2: Định danh */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <label className={styles.label}>Họ và tên</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="VD: Nguyễn Văn A" className={styles.input} />
            </div>
            <div>
              <label className={styles.label}>Ngày sinh</label>
              <input type="text" value={dob} onChange={e => setDob(e.target.value)} placeholder="DD/MM/YYYY" className={styles.input} />
            </div>
          </div>
        )}

        {/* STEP 3: Nhu cầu */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="font-bold text-ink text-center mb-6">Bạn quan tâm đến dịch vụ nào?</h3>
            <button 
              onClick={() => { setDepartment('ob'); setTimeout(() => document.getElementById('btn-next').click(), 100); }}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${department === 'ob' ? 'border-gold-dk bg-gold-lt/10' : 'border-gold/20 hover:border-gold/50'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${department === 'ob' ? 'bg-gold text-white' : 'bg-surface text-gold-dk'}`}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4z"/><path d="M4 14c0 4.4 3.6 8 8 8s8-3.6 8-8"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-ink text-lg">Sản khoa</h4>
                  <p className="text-xs text-ink-muted mt-1">Theo dõi thai kỳ & chăm sóc mẹ bầu</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${department === 'ob' ? 'border-gold-dk bg-gold-dk' : 'border-gold/30'}`}>
                {department === 'ob' && <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            </button>

            <button 
              onClick={() => { setDepartment('gy'); setTimeout(() => document.getElementById('btn-next').click(), 100); }}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${department === 'gy' ? 'border-gold-dk bg-gold-lt/10' : 'border-gold/20 hover:border-gold/50'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${department === 'gy' ? 'bg-gold text-white' : 'bg-surface text-gold-dk'}`}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-ink text-lg">Phụ khoa</h4>
                  <p className="text-xs text-ink-muted mt-1">Khám phụ khoa, tầm soát định kỳ</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${department === 'gy' ? 'border-gold-dk bg-gold-dk' : 'border-gold/30'}`}>
                {department === 'gy' && <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            </button>
          </div>
        )}

        {/* STEP 4: Sản khoa - Chi tiết */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="text-center mb-4">
               <div className="inline-block px-3 py-1 bg-gold-lt/30 text-gold-dk text-xs font-bold uppercase tracking-wider rounded-full mb-2">Thông tin Thai kỳ</div>
               <p className="text-sm text-ink-muted">Cung cấp ngày kinh cuối để hệ thống tự động tính ngày dự sinh cho bạn.</p>
             </div>
             <div>
              <label className={styles.label}>Ngày đầu kỳ kinh cuối (LMP) <span className="lowercase normal-case font-normal text-ink-muted ml-1">- Không bắt buộc</span></label>
              <input type="text" value={lmp} onChange={e => setLmp(e.target.value)} placeholder="DD/MM/YYYY" className={styles.input} />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <button onClick={prevStep} disabled={loading} className="w-16 h-[52px] shrink-0 border border-gold/30 rounded-xl flex items-center justify-center text-ink hover:bg-gold-lt/30 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
          )}
          
          {(step < 3 || (step === 3 && !department)) ? (
            <button id="btn-next" onClick={nextStep} className={styles.btnPrimary}>
              Tiếp tục
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          ) : (
             <button onClick={department === 'gy' && step === 3 ? nextStep : handleSubmit} disabled={loading} className={styles.btnPrimary}>
              {loading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'Hoàn tất Đăng ký'}
            </button>
          )}
        </div>

        <div className="mt-6 text-center text-sm font-medium text-ink-muted">
          Đã có tài khoản? <a href="/login" className="text-gold-dk hover:text-gold transition-colors underline underline-offset-4">Đăng nhập</a>
        </div>
      </div>
    </div>
  );
}
