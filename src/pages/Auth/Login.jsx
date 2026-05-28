import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (err) {
        setError(err.message.includes('Invalid') ? 'Email hoặc mật khẩu không đúng' : err.message);
        setLoading(false);
        return;
      }
      
      // auth context will automatically detect the session and ProtectedRoute will handle redirect
      // but to be safe, we can force a reload or let context react.
      window.location.href = '/';

    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const quickLogin = (testEmail, testPass) => {
    setEmail(testEmail);
    setPassword(testPass);
    // wait for state to update, then login
    setTimeout(() => {
      document.getElementById('login-btn').click();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-bg py-8 px-6 relative">
        
        {/* Monogram + Title */}
        <div className="mb-10">
          <div className="w-12 h-12 border-[0.5px] border-gold rounded-full flex items-center justify-center mb-5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gold-dk stroke-[1.4px]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="font-serif text-[30px] font-light text-ink leading-[1.15] mb-1.5">Đăng nhập</h1>
          <p className="font-serif italic text-[15px] text-muted">Chào mừng bạn trở lại</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-[10.5px] font-bold tracking-[0.08em] uppercase text-muted mb-1.5">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@gmail.com" 
              className="w-full p-[12px_14px] bg-surface border-[0.5px] border-borderMd rounded-lg text-[14px] text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              required
            />
          </div>

          <div className="mb-2 relative">
            <label className="block text-[10.5px] font-bold tracking-[0.08em] uppercase text-muted mb-1.5">Mật khẩu</label>
            <div className="relative">
              <input 
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full p-[12px_14px] pr-11 bg-surface border-[0.5px] border-borderMd rounded-lg text-[14px] text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-hint hover:text-muted"
              >
                {showPwd ? <EyeOff size={17} strokeWidth={1.5} /> : <Eye size={17} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          <div className="text-right mb-8">
            <span className="text-[12px] text-gold-dk cursor-pointer font-serif italic tracking-[0.01em] hover:underline">Quên mật khẩu?</span>
          </div>

          {error && <div className="text-[12px] text-danger text-center mb-4 font-medium">{error}</div>}

          <button 
            id="login-btn"
            type="submit" 
            disabled={loading}
            className="w-full bg-gold text-white font-sans text-[14px] font-semibold py-[14px] px-[20px] rounded-lg transition-colors hover:bg-gold-dk active:bg-gold-dk disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Panel Test Nhanh */}
        <div className="mt-8 border border-dashed border-gold rounded-[14px] p-4 bg-gold-lt">
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-gold-dk mb-2.5">🧪 Tài khoản test nhanh</div>
          <div className="flex flex-col gap-2">
            {[
              { email: 'letan@gmail.com', pass: 'Test@2026', icon: '💁‍♀️', title: 'Lễ Tân — Upload Kết Quả', desc: 'letan@gmail.com' },
              { email: 'bstuanhoang@gmail.com', pass: '28072020', icon: '👨‍⚕️', title: 'Admin — BS. Tuấn', desc: 'bstuanhoang@gmail.com' },
              { email: 'obtest2026@gmail.com', pass: 'Test@2026', icon: '🤰', title: 'Sản khoa — Nguyễn Thị Hoa', desc: 'Thai 28 tuần · obtest2026@gmail.com' },
              { email: 'gytest2026@gmail.com', pass: 'Test@2026', icon: '🌸', title: 'Phụ khoa — Lê Thị Hương', desc: 'Chu kỳ D10 · gytest2026@gmail.com' }
            ].map((acc, idx) => (
              <button 
                key={idx}
                onClick={() => quickLogin(acc.email, acc.pass)}
                type="button"
                className="flex items-center gap-2.5 bg-white border-[0.5px] border-gold rounded-[10px] p-[10px_14px] text-left hover:bg-gold-lt transition-colors"
              >
                <span className="text-[18px]">{acc.icon}</span>
                <div>
                  <div className="text-[13px] font-bold text-ink">{acc.title}</div>
                  <div className="text-[11px] text-muted">{acc.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
