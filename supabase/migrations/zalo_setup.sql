-- ═══════════════════════════════════════════════════════════
--  Migration: Thêm bảng zalo_subscribers + zalo_id vào profiles
--  Chạy trong Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. Thêm cột zalo_id vào profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS zalo_id TEXT;

-- 2. Tạo bảng zalo_subscribers
CREATE TABLE IF NOT EXISTS zalo_subscribers (
  id          BIGSERIAL PRIMARY KEY,
  zalo_id     TEXT UNIQUE NOT NULL,
  bn_code     TEXT REFERENCES patients(bn_code) ON DELETE SET NULL,
  name        TEXT,
  last_event  TEXT,
  last_msg    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tạo bảng log lịch sử gửi reminder
CREATE TABLE IF NOT EXISTS zalo_reminder_logs (
  id           BIGSERIAL PRIMARY KEY,
  run_date     DATE NOT NULL,
  total_users  INT DEFAULT 0,
  sent_count   INT DEFAULT 0,
  skip_count   INT DEFAULT 0,
  error_detail TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Index để query nhanh
CREATE INDEX IF NOT EXISTS idx_zalo_subscribers_bn_code
  ON zalo_subscribers(bn_code);

-- 5. RLS: Chỉ service_role được đọc/ghi (Edge Function dùng service key)
ALTER TABLE zalo_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE zalo_reminder_logs ENABLE ROW LEVEL SECURITY;

-- Service role bypass RLS mặc định → không cần tạo policy thêm

-- ═══════════════════════════════════════════════════════════
--  Cron Job: Chạy mỗi tối 20:00 ICT (= 13:00 UTC)
--  Chạy trong Supabase SQL Editor (cần enable pg_cron)
-- ═══════════════════════════════════════════════════════════
SELECT cron.schedule(
  'zalo-nightly-reminder',        -- Tên job
  '0 13 * * *',                   -- 13:00 UTC = 20:00 ICT mỗi ngày
  $$
  SELECT net.http_post(
    url    := 'https://tnehhratorbrxjwzqnds.supabase.co/functions/v1/zalo-reminder',
    body   := '{}'::jsonb,
    headers := '{"Authorization": "Bearer ' || current_setting('app.cron_secret', true) || '"}'::jsonb
  );
  $$
);
