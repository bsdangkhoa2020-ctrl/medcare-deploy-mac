# BÀN GIAO CÔNG VIỆC DỰ ÁN MEDCARE (AI Y TẾ)

## 1. Tóm tắt tiến độ đã hoàn thành (Tính đến hiện tại)
- Đã thiết lập thành công hệ thống **Zalo Webhook (v4.0)** chạy trên Supabase Edge Functions.
- Code Webhook nằm ở: `supabase/functions/zalo-webhook/index.ts`.
- Các tính năng đã làm được trong Zalo Bot:
  1. Nhận tin nhắn Text và đóng vai **Bác sĩ AI** (dùng Gemini 2.0 Flash) để tư vấn y khoa (Dưới 150 chữ).
  2. Xử lý sự kiện nhận Ảnh (`message.image.received`) từ nền tảng Zalo Bot Platforms.
  3. Cảnh báo Lễ tân nếu gửi nhầm file PDF/Word (`message.unsupported.received`).
  4. Tự động đẩy file ảnh lên Supabase Storage bucket `records`.
  5. Gọi siêu AI Gemini phân tích kết quả ảnh (Trích xuất tên bệnh nhân, tình trạng bình thường/bất thường).
  6. Lưu kết quả vào bảng `attachments` trong Database.
  7. Liên kết mã bệnh nhân (Ví dụ gõ `OB001` để tự link Zalo_id vào bảng `profiles` và `zalo_subscribers`).
  8. Gửi thông báo Zalo báo cáo kết quả (Cảnh báo đỏ nếu bất thường, Báo bình thường nếu an toàn).

## 2. Thông tin kỹ thuật (Lưu ý quan trọng)
- Zalo Token đã được hardcode (gắn cứng trực tiếp) trong file Edge Function để tránh lỗi 401.
- Payload Zalo Bot API dùng chuẩn giống Telegram (ví dụ: `body.message.chat.id`).
- Hệ thống KHÔNG hỗ trợ gửi file PDF trực tiếp qua Bot Zalo (do Zalo chặn), phải thay thế bằng Cổng Upload Web cho Lễ tân.

## 3. Nhiệm vụ tiếp theo (Cần làm ngay trong Chat mới)
**Lập trình Giao diện Web (React/Vite) trong thư mục `src/`:**

1. **Xây dựng Cổng Upload cho Lễ tân (Receptionist Portal):**
   - URL đề xuất: `/letan` hoặc một tab riêng.
   - Chức năng: Cho phép Lễ tân kéo/thả file PDF và Ảnh kết quả xét nghiệm.
   - Upload file đó lên Supabase Storage, sau đó tự động kích hoạt hàm phân tích AI Gemini để bóc tách dữ liệu giống hệt như cách con Bot Zalo đang làm.

2. **Xây dựng Bảng Điều khiển Bác sĩ (Doctor Dashboard):**
   - URL đề xuất: `/bacsi`
   - Chức năng: Hiển thị danh sách các phiếu kết quả có cờ "CẢNH BÁO ĐỎ" (Bất thường).
   - Xem preview file PDF/Ảnh ngay trên web.
   - Có ô nhập "Lời dặn Bác sĩ" và nút "Gửi thông báo Zalo". Khi bấm, hệ thống sẽ gọi API Zalo Bot nhắn tin trực tiếp cho bệnh nhân đó.

## 4. Lời nhắn cho AI ở phiên làm việc mới
Bạn hãy đọc kỹ file này. Toàn bộ hạ tầng Backend và AI đã được tôi thiết lập hoàn hảo. Nhiệm vụ của bạn bây giờ là tập trung 100% công lực vào việc sử dụng các thư viện UI (Tailwind, Lucide React...) để tạo ra trải nghiệm người dùng (UX) thật lộng lẫy, hiện đại và "Wow" nhất cho Lễ tân và Bác sĩ. Hãy tuân thủ nghiêm ngặt các quy tắc thiết kế Web Application Development!
