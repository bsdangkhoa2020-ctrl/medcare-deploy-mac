import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 z-0" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold-lt/30 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 z-0" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        
        {/* Header / Logo Area */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-gold-lt to-gold rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink mb-4 tracking-tight">
            BSTUAN<span className="text-gold">247</span>
          </h1>
          <p className="text-ink-muted text-lg sm:text-xl font-medium max-w-md mx-auto">
            Hệ sinh thái Chăm sóc sức khỏe Phụ nữ hiện đại, tận tâm & chuyên nghiệp.
          </p>
        </div>

        {/* Action Cards */}
        <div className="w-full max-w-md flex flex-col gap-4">
          
          {/* Patient Card (Primary) */}
          <button 
            onClick={() => navigate('/register')}
            className="group bg-white p-5 sm:p-6 rounded-2xl border border-gold/30 shadow-lg shadow-gold/5 hover:shadow-xl hover:border-gold hover:-translate-y-1 transition-all duration-300 text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gold-lt/30 rounded-full flex items-center justify-center shrink-0 group-hover:bg-gold group-hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6 text-gold-dk group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-xl text-ink group-hover:text-gold-dk transition-colors">Bệnh nhân mới</h3>
                <p className="text-sm text-ink-muted mt-1">Đăng ký hồ sơ & Bắt đầu trải nghiệm</p>
              </div>
            </div>
            <svg className="w-6 h-6 text-gold/50 group-hover:text-gold-dk transform group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>

          {/* Login Card (Secondary) */}
          <button 
            onClick={() => navigate('/login')}
            className="group bg-surface/50 backdrop-blur-sm p-5 sm:p-6 rounded-2xl border border-ink/10 hover:border-gold/30 hover:bg-white transition-all duration-300 text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-ink/5 rounded-full flex items-center justify-center shrink-0 group-hover:bg-gold-lt/20 transition-colors duration-300">
                <svg className="w-6 h-6 text-ink-muted group-hover:text-gold-dk transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-xl text-ink group-hover:text-gold-dk transition-colors">Đăng nhập</h3>
                <p className="text-sm text-ink-muted mt-1">Dành cho bệnh nhân đã có tài khoản</p>
              </div>
            </div>
          </button>

        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-xs text-ink-muted/70 font-medium flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Bảo mật thông tin y tế theo tiêu chuẩn quốc tế
          </p>
        </div>
      </div>
    </div>
  );
}
