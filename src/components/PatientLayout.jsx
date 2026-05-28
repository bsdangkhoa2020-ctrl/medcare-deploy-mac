import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut } from 'lucide-react';

export default function PatientLayout() {
  const { profile } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <main className="flex-1 w-full max-w-[480px] mx-auto relative shadow-2xl overflow-hidden bg-bg">
        <Outlet />
      </main>
    </div>
  );
}
