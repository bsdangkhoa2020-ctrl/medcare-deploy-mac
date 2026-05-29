import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

/* ─────────────────────────────────────────────
   Inline styles — no Tailwind dependency
───────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: '100dvh',
    backgroundColor: '#FEFAF5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    padding: '16px',
    boxSizing: 'border-box',
    background: 'linear-gradient(135deg, #FEFAF5 0%, #F7EFE3 100%)',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    padding: '40px 24px',
    boxShadow:
      '0 4px 6px rgba(184,129,74,0.06), 0 20px 60px rgba(184,129,74,0.12)',
    border: '1px solid rgba(184,129,74,0.15)',
    position: 'relative',
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #B8814A 0%, #D4A96A 50%, #B8814A 100%)',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '10px',
  },
  logoCircle: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: '#111111',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
  },
  logoLetter: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: 'italic',
    fontWeight: 700,
    fontSize: '26px',
    color: '#B8814A',
    lineHeight: 1,
    userSelect: 'none',
  },
  brandName: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '22px',
    fontWeight: 700,
    color: '#1A1A1A',
    letterSpacing: '0.01em',
    lineHeight: 1.2,
  },
  brandSub: {
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: '11px',
    fontWeight: 400,
    color: '#B8814A',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginTop: '2px',
  },
  divider: {
    width: '40px',
    height: '1px',
    backgroundColor: 'rgba(184,129,74,0.35)',
    margin: '18px 0 6px',
  },
  tagline: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '13.5px',
    fontStyle: 'italic',
    color: '#7A6A5A',
    letterSpacing: '0.02em',
    marginBottom: '36px',
  },
  heading: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '28px',
    fontWeight: 600,
    color: '#1A1A1A',
    marginBottom: '28px',
    letterSpacing: '-0.01em',
  },
  fieldGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: '12px',
    fontWeight: 600,
    color: '#5A4A3A',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    height: '50px',
    padding: '0 16px',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: '15px',
    color: '#1A1A1A',
    backgroundColor: '#FEFAF5',
    border: '1.5px solid rgba(184,129,74,0.4)',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
  },
  inputFocus: {
    borderColor: '#B8814A',
    boxShadow: '0 0 0 3px rgba(184,129,74,0.12)',
    backgroundColor: '#FFFFFF',
  },
  passwordToggle: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#B8814A',
    display: 'flex',
    alignItems: 'center',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    backgroundColor: 'rgba(220,53,69,0.06)',
    border: '1px solid rgba(220,53,69,0.25)',
    borderRadius: '10px',
    padding: '12px 14px',
    marginBottom: '20px',
  },
  errorText: {
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: '13px',
    color: '#C0392B',
    lineHeight: 1.5,
  },
  submitBtn: {
    width: '100%',
    height: '52px',
    backgroundColor: '#111111',
    color: '#B8814A',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
  },
  submitBtnHover: {
    backgroundColor: '#1E1E1E',
    boxShadow: '0 6px 22px rgba(0,0,0,0.28)',
    transform: 'translateY(-1px)',
  },
  submitBtnDisabled: {
    opacity: 0.65,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2.5px solid rgba(184,129,74,0.3)',
    borderTopColor: '#B8814A',
    borderRadius: '50%',
    animation: 'spin 0.75s linear infinite',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: '12px',
    color: '#A09080',
    letterSpacing: '0.04em',
  },
};

/* ─────────────────────────────────────────────
   Role → route mapping
───────────────────────────────────────────── */
function getRouteForRole(role, patientType) {
  if (role === 'doctor') return '/bacsi';
  if (role === 'receptionist') return '/letan';
  if (role === 'patient') {
    if (patientType === 'ob') return '/sankhoa';
    if (patientType === 'gy') return '/phukhoa';
    return '/sankhoa'; // fallback
  }
  return '/';
}

/* ─────────────────────────────────────────────
   SVG icons (inline, no dependency)
───────────────────────────────────────────── */
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const { user, appRole, patientType, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  /* ── Responsive Mobile State ── */
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ── Redirect if already authenticated ── */
  useEffect(() => {
    if (!authLoading && user && appRole) {
      if (appRole === 'patient' && !patientType) return; // Wait for patientType
      navigate(getRouteForRole(appRole, patientType), { replace: true });
    }
  }, [user, appRole, patientType, authLoading, navigate]);

  /* ── Submit handler ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        if (
          signInError.message.toLowerCase().includes('invalid login') ||
          signInError.message.toLowerCase().includes('invalid credentials')
        ) {
          setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
        } else if (signInError.message.toLowerCase().includes('email not confirmed')) {
          setError('Tài khoản chưa được xác nhận. Vui lòng kiểm tra email.');
        } else {
          setError(signInError.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        // AuthContext will update and trigger useEffect redirect
        // Fallback: if role is already known, navigate now
        if (appRole) {
          if (appRole === 'patient' && !patientType) return; // Wait for useEffect
          navigate(getRouteForRole(appRole, patientType), { replace: true });
        }
        // else: useEffect will fire once AuthContext refreshes
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng kiểm tra kết nối và thử lại.');
      setLoading(false);
    }
  };

  /* ── Don't render form while auth is loading (prevents flash) ── */
  if (authLoading) {
    return (
      <div style={{ ...styles.page }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ ...styles.spinner, width: '32px', height: '32px' }} />
          <p style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: '13px', color: '#B8814A', letterSpacing: '0.06em' }}>
            Đang tải…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        ...styles.page, 
        ...(isMobile ? { padding: 0, backgroundColor: '#FFFFFF', backgroundImage: 'none' } : {}) 
      }} 
    >
      <div 
        style={{ 
          ...styles.card, 
          ...(isMobile ? { 
            maxWidth: '100%', 
            minHeight: '100dvh', 
            borderRadius: 0, 
            border: 'none', 
            boxShadow: 'none', 
            padding: '32px 20px', 
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          } : {}) 
        }} 
      >
        {/* Gold accent bar */}
        <div style={styles.cardAccent} />

        {/* Brand */}
        <div style={styles.brandRow}>
          <div style={{ ...styles.logoCircle, ...(isMobile ? { width: '64px', height: '64px' } : {}) }}>
            <span style={{ ...styles.logoLetter, ...(isMobile ? { fontSize: '32px' } : {}) }}>B</span>
          </div>
          <div>
            <div style={{ ...styles.brandName, ...(isMobile ? { fontSize: '26px' } : {}) }}>bstuan247</div>
            <div style={{ ...styles.brandSub, ...(isMobile ? { fontSize: '12.5px' } : {}) }}>Hệ thống quản lý phòng khám</div>
          </div>
        </div>

        <div style={styles.divider} />
        <p style={{ ...styles.tagline, ...(isMobile ? { fontSize: '15px', marginBottom: '44px' } : {}) }}>
          BS. CK1 Hoàng Thanh Tuấn — Sản Phụ khoa
        </p>

        <h1 style={{ ...styles.heading, ...(isMobile ? { fontSize: '32px', marginBottom: '32px' } : {}) }}>Đăng nhập</h1>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={styles.fieldGroup}>
            <label htmlFor="login-email" style={styles.label}>
              Email
            </label>
            <div style={styles.inputWrapper}>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="your@email.com"
                disabled={loading}
                required
                style={{
                  ...styles.input,
                  ...(isMobile ? { height: '56px', fontSize: '16px' } : {}),
                  ...(emailFocused ? styles.inputFocus : {}),
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label htmlFor="login-password" style={styles.label}>
              Mật khẩu
            </label>
            <div style={styles.inputWrapper}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                placeholder="••••••••"
                disabled={loading}
                required
                style={{
                  ...styles.input,
                  paddingRight: '46px',
                  ...(isMobile ? { height: '56px', fontSize: '16px' } : {}),
                  ...(passFocused ? styles.inputFocus : {}),
                }}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                onClick={() => setShowPassword((v) => !v)}
                style={styles.passwordToggle}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={styles.errorBox} role="alert">
              <AlertIcon />
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            style={{
              ...styles.submitBtn,
              ...(isMobile ? { height: '56px', fontSize: '15px' } : {}),
              ...(btnHovered && !loading ? styles.submitBtnHover : {}),
              ...(loading || !email.trim() || !password ? styles.submitBtnDisabled : {}),
            }}
          >
            {loading ? (
              <>
                <div style={styles.spinner} />
                Đang đăng nhập…
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <p style={styles.footer}>
          © {new Date().getFullYear()} bstuan247 · Phòng khám BS. Hoàng Thanh Tuấn
        </p>
      </div>
    </div>
  );
}
