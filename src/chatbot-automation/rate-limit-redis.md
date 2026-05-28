# Hướng dẫn thiết lập Rate Limit (Gom Nhóm) & Fallback cho Zalo Bot

## 1. Cơ chế chống Spam bằng Gom Nhóm (Batching)
Dựa trên trải nghiệm thực tế (UX y tế), bệnh nhân thường có thói quen gửi liên tục nhiều phiếu xét nghiệm (4-5 ảnh) cùng lúc. Nếu chặn đứng (Rate limit), luồng giao tiếp sẽ bị đứt gãy. Do đó, chúng ta sẽ áp dụng cơ chế **Gom nhóm (Batching)** trên n8n.

**Quy trình Batching bằng n8n (Wait Node + Merge Node):**
- Khi Zalo truyền Webhook có ảnh, kích hoạt một bộ đếm thời gian nhỏ (10 giây) qua `Wait Node`.
- Kiểm tra cùng một `zalo_user_id`: Nếu trong khoảng thời gian chờ này hệ thống nhận thêm các Webhook ảnh khác từ cùng ID, chúng sẽ được gom lại qua `Merge Node` (chế độ append mảng dữ liệu).
- Sau 10 giây im lặng, hệ thống sẽ gộp tất cả các URL ảnh đó vào thành 1 mảng JSON và đẩy gọi API Gemini Vision **Đúng 1 lần duy nhất**.
- **Lợi ích:** Tiết kiệm tối đa Request API cho Gemini, đồng thời bot có thể đọc và tổng hợp nguyên một xấp hồ sơ 5 trang của bệnh nhân, mang lại cảm giác cực kỳ "Wow" và thông minh.

## 2. Kịch bản Fallback (OCR Thất bại)

Luồng Fallback được thiết kế tại **IF OCR Success Node** (trong file JSON n8n mẫu).

- Khi ảnh quá mờ hoặc người dùng chụp sai (ví dụ chụp cái bàn thay vì tờ giấy khám): Gemini 1.5 Pro sẽ trả về lỗi hoặc một JSON rỗng.
- Lúc này, n8n rẽ sang nhánh False và thực thi 2 hành động đồng thời:
  1. **Zalo Send Node**: Trả lời khách *"Dạ ảnh hơi khó đọc, chị đợi em chút để Lễ tân hỗ trợ nhé!"*
  2. **Supabase Insert Node**: Bắn ngầm dữ liệu ảnh (`image_url`) và ID của Zalo (`zalo_user_id`) vào bảng `receptionist_pending_tasks` trên cơ sở dữ liệu Supabase.
- Ở phía đầu cầu Website bstuan247 (Trạm Lễ Tân `/letan`), sẽ có cơ chế lắng nghe Real-time (Supabase Subscribe). Lễ tân sẽ thấy ngay lập tức thông báo có bệnh nhân cần hỗ trợ đọc file ảnh mờ. Họ sẽ tự nhìn bằng mắt thường, gõ tay dữ liệu và bấm nút gửi Magic Link cho bệnh nhân đó. Luồng được tiếp diễn!
