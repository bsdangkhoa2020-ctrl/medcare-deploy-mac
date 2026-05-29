-- Cho phép TẤT CẢ user đã đăng nhập được ĐỌC dữ liệu từ bảng patients
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.patients;
CREATE POLICY "Enable read access for all authenticated users" 
ON public.patients 
FOR SELECT 
TO authenticated 
USING (true);

-- Cấp quyền tương tự cho bảng attachments
DROP POLICY IF EXISTS "Enable read access for all authenticated users on attachments" ON public.attachments;
CREATE POLICY "Enable read access for all authenticated users on attachments" 
ON public.attachments 
FOR SELECT 
TO authenticated 
USING (true);
