import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, Stethoscope, FileUp, Menu, Bell, LogOut, UserCircle, Calendar, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, loading, appRole } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gold-light/40 to-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-gold border-t-transparent animate-spin mb-4"></div>
          <p className="text-gold-dark font-medium">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to Vanilla app login via window location to ensure full page reload
    window.location.href = '/';
    return null;
  }

  // Chặn Bệnh Nhân khỏi cổng React (chỉ được dùng Vanilla App)
  if (appRole === 'patient') {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gold-light/40 to-white relative">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gold/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-gold-dark/10 blur-[100px] pointer-events-none" />

      {/* Sidebar */}
      <aside className={`absolute z-20 flex flex-col w-64 h-full px-4 py-8 overflow-y-auto border-r rtl:border-r-0 rtl:border-l bg-white/70 backdrop-blur-xl border-gold/20 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-full bg-gold-light border border-gold flex items-center justify-center">
            <span className="font-serif text-gold-dark font-bold text-xl italic">B</span>
          </div>
          <span className="text-xl font-serif text-ink tracking-wide">BaoBei <span className="font-sans text-xs uppercase tracking-widest text-gold-dark font-bold ml-1">Portals</span></span>
        </div>

        <div className="flex flex-col justify-between flex-1 mt-6">
          <nav className="space-y-2">
            <p className="px-2 text-xs font-bold tracking-widest text-ink-muted uppercase mb-4">Các cổng</p>
            {(!appRole || appRole === 'doctor' || appRole === 'receptionist') && (
              <NavLink
                to="/letan"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-ink text-gold shadow-md scale-100'
                      : 'text-ink-muted hover:bg-gold-light/50 hover:text-ink hover:scale-[1.02]'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <FileUp className="w-5 h-5" />
                <span className="mx-4 font-medium">Lễ Tân (Upload)</span>
              </NavLink>
            )}

            {(!appRole || appRole === 'doctor') && (
              <NavLink
                to="/bacsi"
                end
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-ink text-gold shadow-md scale-100'
                      : 'text-ink-muted hover:bg-gold-light/50 hover:text-ink hover:scale-[1.02]'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Stethoscope className="w-5 h-5" />
                <span className="mx-4 font-medium">Kết Quả Xét Nghiệm</span>
              </NavLink>
            )}

            {(!appRole || appRole === 'doctor') && (
              <NavLink
                to="/bacsi/patients"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-ink text-gold shadow-md scale-100'
                      : 'text-ink-muted hover:bg-gold-light/50 hover:text-ink hover:scale-[1.02]'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Users className="w-5 h-5" />
                <span className="mx-4 font-medium">Quản lý Bệnh Nhân</span>
              </NavLink>
            )}

            {(!appRole || appRole === 'doctor') && (
              <NavLink
                to="/bacsi/schedule"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-ink text-gold shadow-md scale-100'
                      : 'text-ink-muted hover:bg-gold-light/50 hover:text-ink hover:scale-[1.02]'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Calendar className="w-5 h-5" />
                <span className="mx-4 font-medium">Lịch & Ca Trực</span>
              </NavLink>
            )}

            {(!appRole || appRole === 'doctor') && (
              <NavLink
                to="/bacsi/articles"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-ink text-gold shadow-md scale-100'
                      : 'text-ink-muted hover:bg-gold-light/50 hover:text-ink hover:scale-[1.02]'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <BookOpen className="w-5 h-5" />
                <span className="mx-4 font-medium">Tạp chí Y khoa</span>
              </NavLink>
            )}
          </nav>

          <div className="flex items-center px-4 py-3 mt-auto rounded-2xl bg-gold-light/50 border border-gold/10 cursor-pointer hover:bg-gold-light transition-colors">
            {profile?.avatar_url ? (
              <img className="object-cover w-9 h-9 rounded-full border border-gold/30" src={profile.avatar_url} alt="Avatar" />
            ) : (
              <UserCircle className="w-9 h-9 text-gold-dark" />
            )}
            <div className="mx-3 truncate">
              <h4 className="text-sm font-semibold text-ink truncate">{profile?.full_name || user.email?.split('@')[0]}</h4>
              <p className="text-xs text-ink-muted capitalize truncate">{appRole || 'User'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full relative z-10">
        <header className="flex items-center justify-between px-6 py-4 bg-white/30 backdrop-blur-md border-b border-white/50 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl text-ink md:hidden hover:bg-white/50 transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 md:hidden"></div>
          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 text-ink-muted bg-white/50 rounded-full hover:text-ink hover:bg-white transition-all shadow-sm">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white"></span>
            </button>
            <button 
              onClick={async () => {
                const { supabase } = await import('../lib/supabase');
                await supabase.auth.signOut();
                window.location.href = '/';
              }} 
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-danger-dark bg-red-50 rounded-xl hover:bg-red-100 transition-colors shadow-sm border border-red-100"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-0 pb-24 md:p-8 relative">
          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-10 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          <Outlet />
        </main>
      </div>
    </div>
  );
}
