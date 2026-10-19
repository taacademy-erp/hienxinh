-- =============================================================================
-- MIGRATION: Tạo đầy đủ schema cho Hiền Xinh Beauty Center
-- Chạy toàn bộ file này trong Supabase Dashboard → SQL Editor → Run
-- =============================================================================

-- ============================================================
-- 1. BẢNG USERS (Tài khoản đăng nhập)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id         BIGSERIAL PRIMARY KEY,
  username   TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'nhanvien', -- 'chu' | 'ql' | 'nhanvien'
  avatar     TEXT DEFAULT 'U',
  phone      TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thêm cột nếu thiếu (an toàn nếu đã có)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT 'U';
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone  TEXT DEFAULT '';

-- Dữ liệu mẫu tài khoản (bỏ qua nếu đã tồn tại)
INSERT INTO users (username, password, name, role, avatar, phone)
VALUES
  ('chu',       '123456', 'Hiền Xinh (Chủ)',    'chu',      'H', ''),
  ('ql',        '123456', 'Thanh Tú (QL)',       'ql',       'T', ''),
  ('nhanvien',  '123456', 'Nguyễn Thảo (NV)',   'nhanvien', 'N', '')
ON CONFLICT (username) DO NOTHING;


-- ============================================================
-- 2. BẢNG CUSTOMERS (Khách hàng)
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id             BIGSERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  birthdate      TEXT DEFAULT '',
  customer_group TEXT DEFAULT 'Khách mới',
  source         TEXT DEFAULT 'Tại quầy',
  address        TEXT DEFAULT '',
  notes          TEXT DEFAULT '',
  total_spent    NUMERIC DEFAULT 0,
  visit_count    INT DEFAULT 0,
  last_visit     TEXT DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Thêm cột nếu thiếu
ALTER TABLE customers ADD COLUMN IF NOT EXISTS birthdate      TEXT DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_group TEXT DEFAULT 'Khách mới';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS source         TEXT DEFAULT 'Tại quầy';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address        TEXT DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes          TEXT DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_spent    NUMERIC DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS visit_count    INT DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_visit     TEXT DEFAULT '';


-- ============================================================
-- 3. BẢNG INVOICES (Hóa đơn) ← ĐÂY LÀ BẢNG ĐANG BỊ LỖI
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id               BIGSERIAL PRIMARY KEY,
  code             TEXT UNIQUE NOT NULL,
  date             TEXT NOT NULL,
  customer_id      BIGINT,
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT DEFAULT '',
  customer_dob     TEXT DEFAULT '',
  staff_id         TEXT DEFAULT '',
  staff_name       TEXT DEFAULT '',
  services         JSONB DEFAULT '[]',
  service_summary  TEXT DEFAULT '',
  subtotal         NUMERIC DEFAULT 0,
  discount         NUMERIC DEFAULT 0,
  total_amount     NUMERIC DEFAULT 0,
  paid_amount      NUMERIC DEFAULT 0,
  remaining_amount NUMERIC DEFAULT 0,
  payment_method   TEXT DEFAULT 'Chuyển khoản',
  bank_account     TEXT DEFAULT '',
  notes            TEXT DEFAULT '',
  status           TEXT DEFAULT 'Đã thanh toán',
  created_by       TEXT DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Thêm các cột còn thiếu vào bảng invoices hiện có
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_id      BIGINT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_name    TEXT NOT NULL DEFAULT '';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_phone   TEXT DEFAULT '';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_dob     TEXT DEFAULT '';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS staff_id         TEXT DEFAULT '';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS staff_name       TEXT DEFAULT '';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS services         JSONB DEFAULT '[]';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS service_summary  TEXT DEFAULT '';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal         NUMERIC DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount         NUMERIC DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total_amount     NUMERIC DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_amount      NUMERIC DEFAULT 0;  -- ← CỘT ĐANG BỊ THIẾU
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method   TEXT DEFAULT 'Chuyển khoản';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bank_account     TEXT DEFAULT '';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes            TEXT DEFAULT '';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status           TEXT DEFAULT 'Đã thanh toán';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_by       TEXT DEFAULT '';


-- ============================================================
-- 4. BẢNG EXPENSES (Chi phí)
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id         BIGSERIAL PRIMARY KEY,
  code       TEXT DEFAULT '',
  date       TEXT NOT NULL,
  amount     NUMERIC DEFAULT 0,
  category   TEXT DEFAULT 'Khác',
  content    TEXT NOT NULL,
  notes      TEXT DEFAULT '',
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS code       TEXT DEFAULT '';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS category   TEXT DEFAULT 'Khác';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS notes      TEXT DEFAULT '';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT '';


-- ============================================================
-- 5. BẢNG SERVICES (Dịch vụ)
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  price    NUMERIC DEFAULT 0,
  category TEXT DEFAULT 'Dịch vụ làm đẹp'
);

INSERT INTO services (id, name, price, category) VALUES
  ('DV01', 'Xóa lá thâm', 2000000, 'Phun xăm thẩm mỹ'),
  ('DV02', 'Phun môi Tế bào gốc', 3300000, 'Phun xăm thẩm mỹ'),
  ('DV03', 'Phun môi NaNoLips', 2800000, 'Phun xăm thẩm mỹ'),
  ('DV04', 'Phun môi PenLips Plus', 3800000, 'Phun xăm thẩm mỹ'),
  ('DV05', 'Chân mày shadding ombre', 2000000, 'Phun xăm thẩm mỹ'),
  ('DV06', 'Chân mày điêu khắc đầu + phun shaddinh đuôi', 2800000, 'Phun xăm thẩm mỹ'),
  ('DV07', 'Chân mày điêu khắc sợi hairtrokes', 3000000, 'Phun xăm thẩm mỹ'),
  ('DV08', 'Chân mày sợi nét siêu thực', 4000000, 'Phun xăm thẩm mỹ'),
  ('DV12', 'Chăm sóc da chuyên sâu', 850000, 'Chăm sóc da'),
  ('DV13', 'Triệt lông nách / Vĩnh viễn', 1300000, 'Triệt lông vĩnh viễn'),
  ('DV14', 'Laser Pico & Điều trị nám', 1500000, 'Laser & Điều trị'),
  ('DV15', 'Tiêm thẩm mỹ Filler môi/Botox', 2800000, 'Tiêm thẩm mỹ (Filler/Botox)')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 6. BẢNG STAFF (Nhân viên)
-- ============================================================
CREATE TABLE IF NOT EXISTS staff (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  initials        TEXT DEFAULT '',
  color           TEXT DEFAULT 'bg-rose-600',
  role            TEXT DEFAULT 'Kỹ thuật viên',
  phone           TEXT DEFAULT '',
  commission_rate NUMERIC DEFAULT 5
);

ALTER TABLE staff ADD COLUMN IF NOT EXISTS initials        TEXT DEFAULT '';
ALTER TABLE staff ADD COLUMN IF NOT EXISTS color           TEXT DEFAULT 'bg-rose-600';
ALTER TABLE staff ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 5;

INSERT INTO staff (id, name, initials, color, role, phone, commission_rate) VALUES
  ('NV01', 'Nguyễn Thảo',    'NT', 'bg-blue-600',   'Tư vấn Online & Trực tiếp',        '0901 111 001', 5),
  ('NV02', 'Trần Minh Anh',  'MA', 'bg-purple-600', 'Tư vấn trực tiếp',                 '0901 111 002', 5),
  ('NV03', 'Lê Thu Hà',      'LH', 'bg-rose-600',   'Kỹ thuật viên chính',              '0901 111 003', 7),
  ('NV04', 'Nguyễn Mai',     'NM', 'bg-indigo-600', 'Chuyên viên chăm sóc da',          '0901 111 004', 5),
  ('NV05', 'Vũ Thị Quỳnh',  'QN', 'bg-sky-600',    'Kỹ thuật viên phun xăm',           '0901 111 005', 6),
  ('NV06', 'Đặng Thảo Vy',   'TV', 'bg-pink-600',   'Kỹ thuật viên',                    '0901 111 006', 5)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 7. BẢNG BANK_ACCOUNTS (Tài khoản ngân hàng)
-- ============================================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  bank_name      TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  balance        NUMERIC DEFAULT 0
);

INSERT INTO bank_accounts (id, name, bank_name, account_number, account_holder, balance) VALUES
  ('acc1', 'Vietcombank Spa',    'Vietcombank (VCB)', '9988776655', 'NGUYEN THI HIEN',  0),
  ('acc2', 'Techcombank Spa',    'Techcombank (TCB)', '1903668899', 'NGUYEN THI HIEN',  0),
  ('acc3', 'Tiền mặt tại quầy', 'Tiền mặt',          'TIENMAT',    'Quầy Thu Ngân',    0)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 8. BẢNG DAILY_TRANSACTIONS (Giao dịch hàng ngày)
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_transactions (
  id             BIGSERIAL PRIMARY KEY,
  date           TEXT NOT NULL,
  type           TEXT DEFAULT 'income',   -- 'income' | 'expense'
  amount         NUMERIC DEFAULT 0,
  content        TEXT DEFAULT '',
  reference_code TEXT DEFAULT '',
  account_name   TEXT DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE daily_transactions ADD COLUMN IF NOT EXISTS type           TEXT DEFAULT 'income';
ALTER TABLE daily_transactions ADD COLUMN IF NOT EXISTS reference_code TEXT DEFAULT '';
ALTER TABLE daily_transactions ADD COLUMN IF NOT EXISTS account_name   TEXT DEFAULT '';


-- ============================================================
-- 9. TẮT RLS (Row Level Security) để anon key có thể đọc/ghi
--    Supabase mặc định bật RLS → anon key bị chặn hoàn toàn
-- ============================================================
ALTER TABLE users              DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers          DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices           DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses           DISABLE ROW LEVEL SECURITY;
ALTER TABLE services           DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff              DISABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts      DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_transactions DISABLE ROW LEVEL SECURITY;


-- ============================================================
-- ✅ XONG! Refresh lại schema cache của PostgREST
-- ============================================================
NOTIFY pgrst, 'reload schema';
