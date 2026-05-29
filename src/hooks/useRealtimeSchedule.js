import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook lắng nghe thay đổi lịch làm việc của Bác sĩ theo thời gian thực.
 * Dùng cho màn hình Bệnh nhân để tự động cập nhật lịch khám mà không cần F5.
 * 
 * @param {function} onScheduleChange - Callback function được gọi khi có thay đổi (INSERT, UPDATE, DELETE).
 */
export function useRealtimeSchedule(onScheduleChange) {
  useEffect(() => {
    const channel = supabase
      .channel('public:doctor_schedule')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'doctor_schedule' },
        (payload) => {
          console.log('Tự động cập nhật Lịch Bác Sĩ:', payload);
          if (onScheduleChange) {
            onScheduleChange(payload);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Đã kết nối Realtime kênh Lịch Khám');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onScheduleChange]);
}
