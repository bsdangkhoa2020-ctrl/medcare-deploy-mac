import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut } from 'lucide-react';

export default function PatientLayout() {
  const { profile } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-[#F5EFE6]">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b border-[#E0D0B0] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E8A93C]/20 border border-[#E8A93C] flex items-center justify-center">
            <span className="font-serif text-[#1F1A0F] font-bold text-xl italic">B</span>
          </div>
          <span className="text-xl font-serif text-[#1F1A0F] tracking-wide">BaoBei</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-[#7A6F5C]">
            {profile?.full_name || 'Bệnh nhân'}
          </span>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }} 
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>
      <main className="flex-1 w-full max-w-lg mx-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
