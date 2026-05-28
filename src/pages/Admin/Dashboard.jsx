import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { LogOut, Users, FilePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error('Error fetching patients', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col p-4 md:p-8">
      <div className="max-w-4xl w-full mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif text-ink mb-2">Bảng điều khiển Quản trị</h1>
            <p className="text-muted">Xin chào, {profile?.full_name || 'Admin'}</p>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 px-4 py-2 bg-surface border-[0.5px] border-borderMd rounded-full text-muted hover:bg-gold-lt hover:text-gold-dk transition-colors"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stats Card */}
          <div className="bg-surface border-[0.5px] border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gold-lt rounded-full flex items-center justify-center border-[0.5px] border-gold">
                <Users className="text-gold-dk" />
              </div>
              <div>
                <div className="text-sm font-bold text-muted uppercase tracking-wider">Tổng bệnh nhân</div>
                <div className="text-3xl font-serif text-ink">{patients.length}</div>
              </div>
            </div>
          </div>
          
          {/* Action Card */}
          <button 
            className="bg-gold border-[0.5px] border-gold-dk rounded-2xl p-6 shadow-md hover:bg-gold-dk transition-colors text-left group"
          >
            <div className="flex justify-between items-center mb-2">
              <FilePlus className="text-white w-8 h-8" />
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <span className="text-white text-xl leading-none font-light">+</span>
              </div>
            </div>
            <div className="text-lg font-serif text-white mb-1">Thêm bệnh nhân mới</div>
            <div className="text-xs text-white/70">Tạo hồ sơ cho bệnh nhân Sản/Phụ khoa</div>
          </button>
        </div>

        {/* Bệnh nhân gần đây */}
        <div className="bg-surface border-[0.5px] border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b-[0.5px] border-border bg-bg/50 flex justify-between items-center">
            <h2 className="text-lg font-serif text-ink font-semibold">Bệnh nhân mới nhất</h2>
          </div>
          
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-8 text-center text-muted">Đang tải dữ liệu...</div>
            ) : patients.length === 0 ? (
              <div className="p-8 text-center text-muted">Chưa có bệnh nhân nào.</div>
            ) : (
              patients.map(p => (
                <div key={p.id} className="p-4 px-6 flex justify-between items-center hover:bg-gold-lt/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold-lt border-[0.5px] border-gold text-gold-dk font-serif flex items-center justify-center font-bold">
                      {p.name ? p.name.charAt(0).toUpperCase() : 'BN'}
                    </div>
                    <div>
                      <div className="font-semibold text-ink text-sm">{p.name || 'Bệnh nhân chưa tên'}</div>
                      <div className="text-xs text-muted mt-0.5">{p.bn_code} • {p.phone}</div>
                    </div>
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${p.patient_type === 'ob' ? 'bg-[#E6F4ED] text-[#2E6E4A]' : p.patient_type === 'gy' ? 'bg-gy-lt text-gy-dk border-[0.5px] border-gy-md' : 'bg-gray-100 text-gray-500'}`}>
                      {p.patient_type === 'ob' ? 'Sản khoa' : p.patient_type === 'gy' ? 'Phụ khoa' : 'Khác'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
