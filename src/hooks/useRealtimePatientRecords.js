import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook lắng nghe thay đổi Hồ sơ y khoa (phiếu kết quả, siêu âm) của một Bệnh nhân.
 * 
 * @param {string} bnCode - Mã bệnh nhân hiện tại đang đăng nhập.
 * @param {function} onNewRecord - Callback function được gọi khi có file kết quả mới được Upload (INSERT).
 */
export function useRealtimePatientRecords(bnCode, onNewRecord) {
  useEffect(() => {
    let filterConfig = {
      event: 'INSERT', 
      schema: 'public', 
      table: 'attachments'
    };

    if (bnCode) {
      filterConfig.filter = `bn_code=eq.${bnCode}`;
    }

    const channel = supabase
      .channel(`public:attachments${bnCode ? `:${bnCode}` : ':global'}`)
      .on(
        'postgres_changes',
        filterConfig,
        (payload) => {
          console.log('Có kết quả xét nghiệm/siêu âm mới!', payload);
          if (onNewRecord) {
            onNewRecord(payload.new);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Đã kết nối Realtime nhận Hồ sơ cho mã: ${bnCode}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bnCode, onNewRecord]);
}
