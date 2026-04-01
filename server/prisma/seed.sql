-- =============================================================
-- SportHub Seed Data
-- Run: psql -U <user> -d sporthub -f prisma/seed.sql
-- Password for all test accounts: password123
-- =============================================================

-- Fix column types: DB may have TIME columns instead of VARCHAR(5)
-- Courts
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courts' AND column_name='peak_start' AND data_type='time without time zone') THEN
    ALTER TABLE courts ALTER COLUMN peak_start TYPE VARCHAR(5) USING TO_CHAR(peak_start, 'HH24:MI');
    ALTER TABLE courts ALTER COLUMN peak_end   TYPE VARCHAR(5) USING TO_CHAR(peak_end,   'HH24:MI');
  END IF;
END $$;
-- Bookings
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='start_time' AND data_type='time without time zone') THEN
    DROP VIEW IF EXISTS v_today_bookings;
    ALTER TABLE bookings ALTER COLUMN start_time TYPE VARCHAR(5) USING TO_CHAR(start_time, 'HH24:MI');
    CREATE VIEW v_today_bookings AS
      SELECT b.id, b.ref, b.court_id, c.name AS court_name, c.sport,
             b.customer_name, b.customer_phone, b.start_time, b.duration_hours,
             b.final_price, b.status, b.source
      FROM bookings b JOIN courts c ON c.id = b.court_id
      WHERE b.booking_date = CURRENT_DATE ORDER BY b.start_time;
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='waitlists' AND column_name='start_time' AND data_type='time without time zone') THEN
    ALTER TABLE waitlists ALTER COLUMN start_time TYPE VARCHAR(5) USING TO_CHAR(start_time, 'HH24:MI');
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='recurring_bookings' AND column_name='start_time' AND data_type='time without time zone') THEN
    ALTER TABLE recurring_bookings ALTER COLUMN start_time TYPE VARCHAR(5) USING TO_CHAR(start_time, 'HH24:MI');
  END IF;
END $$;

-- 1. Membership Plans
INSERT INTO membership_plans (id, display_name, price_vnd, duration_days, court_discount_pct, shop_discount_pct, credit_per_cycle, guest_passes, priority_booking)
VALUES
  ('basic', 'Basic',  500000, 30, 10,  5,  0,      0, false),
  ('prime', 'Prime', 1200000, 30, 20, 10, 100000,  2, false),
  ('vip',   'VIP',  2500000, 30, 35, 20, 300000,  5, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Users (password: password123)
INSERT INTO users (id, name, email, phone, password_hash, role)
VALUES
  (gen_random_uuid(), 'Admin User',     'admin@sporthub.vn',   '0901234567', '$2b$10$jq9Kqms4DQJlVMBXTuDZwOupslFJlA4pBKeYgF9B56/tUOUJ7G91q', 'admin'),
  (gen_random_uuid(), 'Staff User',     'staff@sporthub.vn',   '0901234568', '$2b$10$jq9Kqms4DQJlVMBXTuDZwOupslFJlA4pBKeYgF9B56/tUOUJ7G91q', 'staff'),
  (gen_random_uuid(), 'Nguyễn Văn A',   'member1@example.com', '0901234569', '$2b$10$jq9Kqms4DQJlVMBXTuDZwOupslFJlA4pBKeYgF9B56/tUOUJ7G91q', 'member'),
  (gen_random_uuid(), 'Trần Thị B',     'member2@example.com', '0901234570', '$2b$10$jq9Kqms4DQJlVMBXTuDZwOupslFJlA4pBKeYgF9B56/tUOUJ7G91q', 'member'),
  (gen_random_uuid(), 'Khách Vãng Lai', 'guest@example.com',   '0901234571', NULL, 'guest')
ON CONFLICT (email) DO NOTHING;

-- 3. Memberships
INSERT INTO memberships (id, user_id, plan, status, started_at, expires_at, credit_balance, guest_passes)
SELECT
  gen_random_uuid(),
  u.id,
  'prime',
  'active',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  100000,
  2
FROM users u
WHERE u.email = 'member1@example.com'
  AND NOT EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = u.id);

INSERT INTO memberships (id, user_id, plan, status, started_at, expires_at, credit_balance, guest_passes)
SELECT
  gen_random_uuid(),
  u.id,
  'vip',
  'active',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  300000,
  5
FROM users u
WHERE u.email = 'member2@example.com'
  AND NOT EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = u.id);

-- 4. Courts
INSERT INTO courts (name, sport, surface, is_indoor, price_normal, price_peak, peak_start, peak_end, status)
SELECT 'Sân Tennis 1',        'Tennis',     'Cứng',     false, 200000, 300000, '17:00', '21:00', 'active'
WHERE NOT EXISTS (SELECT 1 FROM courts WHERE name = 'Sân Tennis 1');

INSERT INTO courts (name, sport, surface, is_indoor, price_normal, price_peak, peak_start, peak_end, status)
SELECT 'Sân Tennis 2',        'Tennis',     'Cỏ',       false, 250000, 350000, '17:00', '21:00', 'active'
WHERE NOT EXISTS (SELECT 1 FROM courts WHERE name = 'Sân Tennis 2');

INSERT INTO courts (name, sport, surface, is_indoor, price_normal, price_peak, peak_start, peak_end, status)
SELECT 'Sân Pickleball 1',    'Pickleball', 'Cứng',     true,  150000, 200000, '17:00', '21:00', 'active'
WHERE NOT EXISTS (SELECT 1 FROM courts WHERE name = 'Sân Pickleball 1');

INSERT INTO courts (name, sport, surface, is_indoor, price_normal, price_peak, peak_start, peak_end, status)
SELECT 'Sân Badminton 1',     'Badminton',  'Synthetic', true,  100000, 150000, '17:00', '21:00', 'active'
WHERE NOT EXISTS (SELECT 1 FROM courts WHERE name = 'Sân Badminton 1');

INSERT INTO courts (name, sport, surface, is_indoor, price_normal, price_peak, peak_start, peak_end, status)
SELECT 'Sân Tennis 3 (Bảo trì)', 'Tennis', 'Cứng',     false, 200000, 300000, '17:00', '21:00', 'maintenance'
WHERE NOT EXISTS (SELECT 1 FROM courts WHERE name = 'Sân Tennis 3 (Bảo trì)');

-- 5. Products
INSERT INTO products (name, category, price, stock, is_service, status)
SELECT 'Vợt Tennis Wilson Pro Staff',  'Vợt',      2500000, 10, false, 'active'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Vợt Tennis Wilson Pro Staff');

INSERT INTO products (name, category, price, stock, is_service, status)
SELECT 'Vợt Pickleball Paddletek',     'Vợt',      1500000,  5, false, 'active'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Vợt Pickleball Paddletek');

INSERT INTO products (name, category, price, stock, is_service, status)
SELECT 'Thuê Vợt Tennis',              'Dịch vụ',    50000,  0, true,  'active'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Thuê Vợt Tennis');

INSERT INTO products (name, category, price, stock, is_service, status)
SELECT 'Bóng Tennis Wilson (Hộp 3 quả)', 'Bóng',   150000, 20, false, 'active'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bóng Tennis Wilson (Hộp 3 quả)');

INSERT INTO products (name, category, price, stock, is_service, status)
SELECT 'Túi Đựng Vợt',                'Phụ kiện', 300000, 15, false, 'active'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Túi Đựng Vợt');

-- 6. Bookings
INSERT INTO bookings (id, ref, court_id, customer_id, membership_id, customer_name, customer_phone, booking_date, start_time, duration_hours, base_price, discount_amount, credit_used, final_price, status, source)
SELECT
  gen_random_uuid(),
  'SH' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0'),
  c.id,
  u.id,
  m.id,
  u.name,
  u.phone,
  CURRENT_DATE,
  '10:00',
  1.0,
  200000,
  40000,
  0,
  160000,
  'confirmed',
  'online'
FROM users u
JOIN courts c ON c.name = 'Sân Tennis 1'
LEFT JOIN memberships m ON m.user_id = u.id
WHERE u.email = 'member1@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.customer_id = u.id AND b.court_id = c.id AND b.booking_date = CURRENT_DATE AND b.start_time = '10:00'
  );

INSERT INTO bookings (id, ref, court_id, customer_id, membership_id, customer_name, customer_phone, booking_date, start_time, duration_hours, base_price, discount_amount, credit_used, final_price, status, source)
SELECT
  gen_random_uuid(),
  'SH' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0'),
  c.id,
  u.id,
  m.id,
  u.name,
  u.phone,
  CURRENT_DATE,
  '14:00',
  2.0,
  500000,
  175000,
  0,
  325000,
  'confirmed',
  'online'
FROM users u
JOIN courts c ON c.name = 'Sân Tennis 2'
LEFT JOIN memberships m ON m.user_id = u.id
WHERE u.email = 'member2@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.customer_id = u.id AND b.court_id = c.id AND b.booking_date = CURRENT_DATE AND b.start_time = '14:00'
  );

INSERT INTO bookings (id, ref, court_id, customer_id, customer_name, customer_phone, booking_date, start_time, duration_hours, base_price, discount_amount, credit_used, final_price, status, source)
SELECT
  gen_random_uuid(),
  'SH' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0'),
  c.id,
  u.id,
  u.name,
  u.phone,
  CURRENT_DATE + 1,
  '18:00',
  1.0,
  150000,
  0,
  0,
  150000,
  'pending',
  'online'
FROM users u
JOIN courts c ON c.name = 'Sân Pickleball 1'
WHERE u.email = 'guest@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.customer_id = u.id AND b.court_id = c.id AND b.booking_date = CURRENT_DATE + 1
  );

-- 7. Orders
WITH new_order AS (
  INSERT INTO orders (id, customer_id, membership_id, subtotal, discount_amount, credit_used, total, pay_method, status)
  SELECT
    gen_random_uuid(),
    u.id,
    m.id,
    2650000,
    132500,
    0,
    2517500,
    'vnpay',
    'paid'
  FROM users u
  LEFT JOIN memberships m ON m.user_id = u.id
  WHERE u.email = 'member1@example.com'
    AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = u.id)
  RETURNING id
)
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal)
SELECT gen_random_uuid(), new_order.id, p.id, 1, 2500000, 2500000
FROM new_order, products p WHERE p.name = 'Vợt Tennis Wilson Pro Staff'
UNION ALL
SELECT gen_random_uuid(), new_order.id, p.id, 1, 150000, 150000
FROM new_order, products p WHERE p.name = 'Bóng Tennis Wilson (Hộp 3 quả)';

WITH new_order AS (
  INSERT INTO orders (id, customer_id, membership_id, subtotal, discount_amount, credit_used, total, pay_method, status)
  SELECT
    gen_random_uuid(),
    u.id,
    m.id,
    1500000,
    300000,
    0,
    1200000,
    'momo',
    'paid'
  FROM users u
  LEFT JOIN memberships m ON m.user_id = u.id
  WHERE u.email = 'member2@example.com'
    AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = u.id)
  RETURNING id
)
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal)
SELECT gen_random_uuid(), new_order.id, p.id, 1, 1500000, 1500000
FROM new_order, products p WHERE p.name = 'Vợt Pickleball Paddletek';

-- Summary
SELECT 'Seed completed!' AS status;
SELECT 'membership_plans' AS "table", COUNT(*) AS rows FROM membership_plans
UNION ALL SELECT 'users',       COUNT(*) FROM users
UNION ALL SELECT 'memberships', COUNT(*) FROM memberships
UNION ALL SELECT 'courts',      COUNT(*) FROM courts
UNION ALL SELECT 'products',    COUNT(*) FROM products
UNION ALL SELECT 'bookings',    COUNT(*) FROM bookings
UNION ALL SELECT 'orders',      COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items;
