import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Consent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleConsent = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from('consents').upsert({
        user_id: user.id,
        agreed_at: new Date().toISOString(),
        version: '1.0'
      });
      if (error) throw error;
      
      // Successfully consented, navigate home
      window.location.href = '/';
    } catch (err) {
      alert('Lỗi lưu cam kết: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-bg py-8 px-6">
        
        {/* Header */}
        <div className="mb-10">
          <div className="w-12 h-[1px] bg-gold mb-5"></div>
          <h1 className="font-serif text-[30px] font-light text-ink leading-[1.15] mb-1.5">Điều khoản</h1>
          <p className="font-serif italic text-[15px] text-muted">Vui lòng đọc kỹ trước khi tiếp tục</p>
        </div>

        {/* Nội dung */}
        <div className="mb-8 space-y-6">
          <div>
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-gold-dk mb-2">Phạm vi ứng dụng</div>
            <div className="text-[14px] text-ink-2 leading-[1.8]">
              Hỗ trợ theo dõi thai kỳ, quản lý hồ sơ sức khỏe và liên lạc với phòng khám BS. Hoàng Thanh Tuấn.
            </div>
          </div>
          
          <div className="h-[0.5px] bg-border"></div>
          
          <div>
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-gold-dk mb-2">Bảo mật dữ liệu</div>
            <div className="text-[14px] text-ink-2 leading-[1.8]">
              Dữ liệu được mã hóa và bảo mật. Chỉ BS. Tuấn và nhân viên phòng khám được phép truy cập hồ sơ của bạn.
            </div>
          </div>
          
          <div className="h-[0.5px] bg-border"></div>
          
          <div className="border-l-2 border-danger pl-4 py-3">
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-danger-dk mb-2">Lưu ý quan trọng</div>
            <div className="text-[14px] text-ink-2 leading-[1.8]">
              Thông tin từ AI <strong>chỉ mang tính tham khảo</strong>, không thay thế chỉ định của bác sĩ. Trường hợp khẩn cấp, vui lòng đến cơ sở y tế gần nhất hoặc gọi <strong className="text-danger-dk">115</strong>.
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleConsent}
            className="w-full bg-gold text-white font-sans text-[14px] font-semibold py-[14px] px-[20px] rounded-lg transition-colors hover:bg-gold-dk active:bg-gold-dk"
          >
            Tôi đã đọc và đồng ý
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full bg-transparent text-muted font-sans text-[14px] font-semibold py-[14px] px-[20px] rounded-lg transition-colors border-[0.5px] border-borderMd hover:bg-white active:bg-white"
          >
            Đăng xuất
          </button>
        </div>

      </div>
    </div>
  );
}
