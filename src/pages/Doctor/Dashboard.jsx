import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Icon, ICONS } from './components/shared';
import TabPatients from './components/TabPatients';
import TabSchedule from './components/TabSchedule';
import TabJournal from './components/TabJournal';
import TabAIScan from './components/TabAIScan';

const TABS = [
  { id: 'patients', label: 'Bệnh nhân', icon: ICONS.patients },
  { id: 'schedule', label: 'Lịch & Ca', icon: ICONS.calendar },
  { id: 'journal', label: 'Tạp chí', icon: ICONS.journal },
  { id: 'scan', label: 'AI Scan', icon: ICONS.scan },
];

export default function DoctorDashboard() {
  const { profile, appRole, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('patients');
  const [patientCount, setPatientCount] = useState(null);

  // Block receptionist
  if (appRole === 'receptionist') return <Navigate to="/letan" replace />;

  useEffect(() => {
    supabase.from('patients').select('id', { count: 'exact', head: true })
      .then(({ count }) => setPatientCount(count ?? 0));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const doctorName = profile?.full_name || profile?.display_name || user?.email?.split('@')[0] || 'Bác sĩ';

  return (
    <div className="min-h-screen bg-bg">
      {/* Top header - Deep Plum & Gold Theme */}
      <header className="sticky top-0 z-40 bg-ink border-b border-gold-dk/30 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-11 rounded-full bg-gold-lt border border-gold-dk flex items-center justify-center shrink-0 shadow-sm">
              <span className="font-serif text-gold-dk font-bold text-xl">{doctorName[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-serif font-bold text-gold-lt text-lg sm:text-xl truncate tracking-wide">
                BS. {doctorName}
              </h1>
              {patientCount !== null && (
                <p className="text-xs text-gold-md font-medium">{patientCount} hồ sơ bệnh nhân</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/doctor/chat')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gold-dk text-white rounded-xl text-sm font-bold hover:bg-gold transition-all shadow-sm">
              <Icon d={ICONS.chat} className="w-4 h-4" /> Trợ lý AI
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-gold-md/50 text-gold-md rounded-xl text-sm font-bold hover:bg-gold-lt hover:text-ink transition-all">
              <Icon d={ICONS.logout} className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto hide-scrollbar pt-2 pb-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-4 transition-all whitespace-nowrap rounded-t-xl ${
                activeTab === tab.id
                  ? 'border-gold-lt text-gold-lt bg-ink-2'
                  : 'border-transparent text-gold-md hover:text-gold-lt hover:bg-ink-2/50'
              }`}>
              <Icon d={Array.isArray(tab.icon) ? tab.icon[0] : tab.icon} className="w-4.5 h-4.5 hidden sm:block" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Tab content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'patients' && <TabPatients />}
          {activeTab === 'schedule' && <TabSchedule />}
          {activeTab === 'journal' && <TabJournal />}
          {activeTab === 'scan' && <TabAIScan />}
        </div>
      </main>
    </div>
  );
}
