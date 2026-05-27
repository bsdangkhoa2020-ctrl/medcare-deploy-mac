# Bstuan247.com - System Architecture & User Flows

## 1. Công Nghệ Sự Dụng (Tech Stack)
- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM, Framer Motion, Lucide React.
- **Backend & API**: Supabase Edge Functions (Deno/TypeScript) - Xử lý Webhook Zalo và gọi AI.
- **Database & Storage**: Supabase PostgreSQL (có Row Level Security) & Supabase Storage (lưu trữ file PDF/Ảnh).
- **AI Integration**: Gemini 2.0 Flash (Trích xuất dữ liệu y khoa từ file và tư vấn tự động qua Zalo).

## 2. Các Phân Quyền (Roles)
Hệ thống được chia thành 4 loại người dùng chuyên biệt, kiểm soát bằng Supabase RLS và React Router:

1. **Admin & Bác sĩ (Doctor)**
   - Toàn quyền hệ thống. Quản lý bệnh nhân, duyệt kết quả có cảnh báo đỏ từ AI. Quản lý lịch làm việc đa cơ sở.
   - Endpoint: `/bacsi` (Thư mục: `src/pages/Doctor/`)

2. **Lễ tân (Receptionist)**
   - Cổng điều phối và nhập liệu. Tải file kết quả lên hệ thống để AI tự động đọc và phân loại.
   - Endpoint: `/letan` (Thư mục: `src/pages/Receptionist/`)

3. **Bệnh nhân Sản khoa (OB Patient)**
   - *Định danh*: `patient_type = 'ob'` (Mã: OB...)
   - Quyền lợi: Xem lộ trình thai kỳ, kết quả siêu âm thai, quản lý tuần thai.
   - Endpoint: `/sankhoa` (Thư mục: `src/pages/Patient/Obstetrics/`)

4. **Bệnh nhân Phụ khoa (GY Patient)**
   - *Định danh*: `patient_type = 'gy'` (Mã: GY...)
   - Quyền lợi: Xem lịch sử khám bệnh lý phụ khoa, kết quả xét nghiệm liên quan.
   - Endpoint: `/phukhoa` (Thư mục: `src/pages/Patient/Gynecology/`)

## 3. Sơ Đồ Luồng Routing (Mermaid)
```mermaid
flowchart TD
    A[Truy cập App] --> B{AuthContext: Đã đăng nhập?}
    B -- Chưa --> C[Redirect: /login]
    B -- Rồi --> D{Kiểm tra Role (appRole)}
    
    D -- "doctor" --> E[Dashboard Bác Sĩ]
    D -- "receptionist" --> F[Dashboard Lễ Tân]
    D -- "patient" --> G{Kiểm tra patient_type}
    D -- "Khác" --> H[Unauthorized]
    
    G -- "ob (Sản khoa)" --> I[Giao diện Theo dõi Thai kỳ]
    G -- "gy (Phụ khoa)" --> J[Giao diện Bệnh lý Phụ khoa]

    E -. "/bacsi" .-> K((Doctor Routing))
    F -. "/letan" .-> L((Receptionist Routing))
    I -. "/sankhoa" .-> M((OB Patient Routing))
    J -. "/phukhoa" .-> N((GY Patient Routing))
```

## 4. Chiến Lược Cấu Trúc Thư Mục (Folder Structure)
- `src/components/`: Chứa các thành phần dùng chung (Layout, Navigation, FileUploader, Toast).
- `src/contexts/AuthContext.jsx`: Nơi quản lý State đăng nhập và Logic kiểm tra/rẽ nhánh Role, patient_type.
- `src/pages/`:
  - `Doctor/`: (Dashboard, Patients, Schedule)
  - `Receptionist/`: (Dashboard/Uploader)
  - `Patient/`: 
    - `Obstetrics/`: (Dashboard thai kỳ, Roadmap)
    - `Gynecology/`: (Dashboard bệnh lý)
- `src/lib/supabase.js`: Khởi tạo Supabase Client.

## 5. Chính Sách Bảo Mật Dữ Liệu (Supabase RLS)
- Bảng `patients` phải chứa cột `patient_type` (Enum: `ob`, `gy`, `both`).
- Bệnh nhân chỉ được quyền `SELECT` dữ liệu bảng `patients` và `attachments` nếu `patient_id = auth.uid()`.
- Các Module liên quan đến Thai kỳ chỉ lấy được dữ liệu nếu tài khoản có `patient_type` là `ob`. Ngăn chặn việc Bệnh nhân Phụ khoa thấy giao diện Sản khoa.
