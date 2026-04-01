-- ============================================================
--  SportHub — Database Schema
--  PostgreSQL 15+
--  Generated: 2026-03-11
-- ============================================================

-- ─────────────────────────────────────────
--  EXTENSIONS
-- ─────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- ─────────────────────────────────────────
--  ENUMS
-- ─────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('guest', 'member', 'staff', 'admin', 'super_admin');

CREATE TYPE membership_plan AS ENUM ('basic', 'prime', 'vip');

CREATE TYPE membership_status AS ENUM ('active', 'expired', 'cancelled');

CREATE TYPE sport_type AS ENUM ('Tennis', 'Pickleball', 'Badminton');

CREATE TYPE court_status AS ENUM ('active', 'maintenance', 'inactive');

CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'rejected', 'cancelled', 'completed');

CREATE TYPE booking_source AS ENUM ('online', 'admin');

CREATE TYPE credit_tx_type AS ENUM ('credit', 'debit');

CREATE TYPE order_status AS ENUM ('pending', 'paid', 'cancelled', 'refunded');

CREATE TYPE product_status AS ENUM ('active', 'inactive');

-- ─────────────────────────────────────────
--  TABLE: users
-- ─────────────────────────────────────────
CREATE TABLE users (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100)    NOT NULL,
    phone           VARCHAR(15)     UNIQUE,
    email           VARCHAR(255)    UNIQUE,
    password_hash   VARCHAR(255),
    role            user_role       NOT NULL DEFAULT 'guest',
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_users_contact CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

COMMENT ON TABLE  users IS 'Platform users — customers, staff, and admins';
COMMENT ON COLUMN users.role IS 'guest | member | staff | admin | super_admin';

-- ─────────────────────────────────────────
--  TABLE: membership_plans  (lookup / config)
-- ─────────────────────────────────────────
CREATE TABLE membership_plans (
    id                  membership_plan PRIMARY KEY,
    display_name        VARCHAR(50)     NOT NULL,
    price_vnd           INTEGER         NOT NULL,               -- monthly price in VND
    duration_days       INTEGER         NOT NULL DEFAULT 30,
    court_discount_pct  SMALLINT        NOT NULL DEFAULT 0,     -- % off court price
    shop_discount_pct   SMALLINT        NOT NULL DEFAULT 0,     -- % off shop price
    credit_per_cycle    INTEGER         NOT NULL DEFAULT 0,     -- VND credit added on renewal
    guest_passes        SMALLINT        NOT NULL DEFAULT 0,     -- guest passes per cycle
    priority_booking    BOOLEAN         NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE membership_plans IS 'Static plan definitions — Basic / Prime / VIP';

INSERT INTO membership_plans (id, display_name, price_vnd, court_discount_pct, shop_discount_pct, credit_per_cycle, guest_passes, priority_booking)
VALUES
    ('basic', 'Basic',   500000,  10,  5,       0, 0, FALSE),
    ('prime', 'Prime',  1200000,  20, 10, 100000, 2, FALSE),
    ('vip',   'VIP',    2500000,  35, 20, 300000, 5, TRUE);

-- ─────────────────────────────────────────
--  TABLE: memberships
-- ─────────────────────────────────────────
CREATE TABLE memberships (
    id              UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan            membership_plan     NOT NULL,
    status          membership_status   NOT NULL DEFAULT 'active',
    started_at      DATE                NOT NULL,
    expires_at      DATE                NOT NULL,
    credit_balance  INTEGER             NOT NULL DEFAULT 0 CHECK (credit_balance >= 0),
    guest_passes    SMALLINT            NOT NULL DEFAULT 0 CHECK (guest_passes >= 0),
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_memberships_dates CHECK (expires_at > started_at)
);

COMMENT ON TABLE  memberships IS 'Active/past membership subscriptions per user';
COMMENT ON COLUMN memberships.credit_balance IS 'Remaining credit in VND — cannot go negative';

-- ─────────────────────────────────────────
--  TABLE: courts
-- ─────────────────────────────────────────
CREATE TABLE courts (
    id              SERIAL          PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    sport           sport_type      NOT NULL,
    surface         VARCHAR(50),
    is_indoor       BOOLEAN         NOT NULL DEFAULT FALSE,
    price_normal    INTEGER         NOT NULL CHECK (price_normal > 0),  -- VND per hour
    price_peak      INTEGER         NOT NULL CHECK (price_peak > 0),    -- VND per hour
    peak_start      TIME            NOT NULL DEFAULT '17:00',
    peak_end        TIME            NOT NULL DEFAULT '21:00',
    status          court_status    NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_courts_peak_price CHECK (price_peak >= price_normal)
);

COMMENT ON TABLE  courts IS 'Physical courts available for booking';
COMMENT ON COLUMN courts.price_normal IS 'Normal-hour price in VND per hour';
COMMENT ON COLUMN courts.price_peak   IS 'Peak-hour price in VND per hour';

-- ─────────────────────────────────────────
--  TABLE: bookings
-- ─────────────────────────────────────────
CREATE TABLE bookings (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    ref             VARCHAR(10)     NOT NULL UNIQUE,          -- e.g. SH823741
    court_id        INTEGER         NOT NULL REFERENCES courts(id),
    customer_id     UUID            REFERENCES users(id),    -- NULL if guest booking
    membership_id   UUID            REFERENCES memberships(id) ON DELETE SET NULL,
    customer_name   VARCHAR(100)    NOT NULL,
    customer_phone  VARCHAR(15)     NOT NULL,
    booking_date    DATE            NOT NULL,
    start_time      TIME            NOT NULL,
    duration_hours  DECIMAL(3,1)    NOT NULL CHECK (duration_hours > 0 AND duration_hours <= 8),
    base_price      INTEGER         NOT NULL CHECK (base_price >= 0),
    discount_amount INTEGER         NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    credit_used     INTEGER         NOT NULL DEFAULT 0 CHECK (credit_used >= 0),
    final_price     INTEGER         NOT NULL CHECK (final_price >= 0),
    pay_method      VARCHAR(50),
    status          booking_status  NOT NULL DEFAULT 'pending',
    source          booking_source  NOT NULL DEFAULT 'online',
    note            TEXT,
    cancelled_at    TIMESTAMPTZ,
    cancel_reason   TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_bookings_price  CHECK (final_price = base_price - discount_amount - credit_used),
    CONSTRAINT chk_bookings_ref    CHECK (ref ~ '^SH[0-9]{6}$')
);

COMMENT ON TABLE  bookings IS 'Court booking records — online (pending→confirmed) and admin (confirmed)';
COMMENT ON COLUMN bookings.ref         IS 'Human-readable booking reference: SH + 6 digits';
COMMENT ON COLUMN bookings.customer_id IS 'NULL for anonymous guest bookings';

-- ─────────────────────────────────────────
--  TABLE: products
-- ─────────────────────────────────────────
CREATE TABLE products (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(200)    NOT NULL,
    category    VARCHAR(100),
    price       INTEGER         NOT NULL CHECK (price >= 0),
    stock       INTEGER         NOT NULL DEFAULT 0 CHECK (stock >= 0),
    is_service  BOOLEAN         NOT NULL DEFAULT FALSE,     -- services have no stock limit
    status      product_status  NOT NULL DEFAULT 'active',
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  products IS 'Shop products and rentable services (e.g. racket rental)';
COMMENT ON COLUMN products.is_service IS 'If TRUE, stock constraint is not enforced';

-- ─────────────────────────────────────────
--  TABLE: orders
-- ─────────────────────────────────────────
CREATE TABLE orders (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID            REFERENCES users(id),
    membership_id   UUID            REFERENCES memberships(id) ON DELETE SET NULL,
    subtotal        INTEGER         NOT NULL CHECK (subtotal >= 0),
    discount_amount INTEGER         NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    credit_used     INTEGER         NOT NULL DEFAULT 0 CHECK (credit_used >= 0),
    total           INTEGER         NOT NULL CHECK (total >= 0),
    pay_method      VARCHAR(50),
    status          order_status    NOT NULL DEFAULT 'paid',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_orders_total CHECK (total = subtotal - discount_amount - credit_used)
);

COMMENT ON TABLE orders IS 'Shop purchase orders';

-- ─────────────────────────────────────────
--  TABLE: order_items
-- ─────────────────────────────────────────
CREATE TABLE order_items (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  INTEGER     NOT NULL REFERENCES products(id),
    quantity    INTEGER     NOT NULL CHECK (quantity > 0),
    unit_price  INTEGER     NOT NULL CHECK (unit_price >= 0),
    subtotal    INTEGER     NOT NULL CHECK (subtotal >= 0),

    CONSTRAINT chk_order_items_subtotal CHECK (subtotal = quantity * unit_price)
);

COMMENT ON TABLE order_items IS 'Line items for each shop order';

-- ─────────────────────────────────────────
--  TABLE: credit_transactions
-- ─────────────────────────────────────────
CREATE TABLE credit_transactions (
    id              UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id   UUID                NOT NULL REFERENCES memberships(id) ON DELETE RESTRICT,
    amount          INTEGER             NOT NULL,   -- positive = credit, negative = debit
    type            credit_tx_type      NOT NULL,
    reference_type  VARCHAR(50),        -- 'booking' | 'order' | 'manual' | 'renewal'
    reference_id    UUID,               -- FK to bookings.id or orders.id (polymorphic)
    note            TEXT,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  credit_transactions IS 'Ledger of all credit additions and deductions per membership';
COMMENT ON COLUMN credit_transactions.amount IS 'Positive = credited, Negative = debited';

-- ─────────────────────────────────────────
--  TABLE: otp_codes  (FR-AUTH-04, FR-AUTH-05)  — password reset & admin 2FA
-- ─────────────────────────────────────────
CREATE TYPE otp_purpose AS ENUM ('password_reset', 'admin_2fa', 'phone_verify');

CREATE TABLE otp_codes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose     otp_purpose NOT NULL,
    code_hash   TEXT        NOT NULL,          -- bcrypt hash of 6-digit OTP
    channel     VARCHAR(10) NOT NULL DEFAULT 'sms',  -- 'sms' | 'email'
    attempts    SMALLINT    NOT NULL DEFAULT 0,
    expires_at  TIMESTAMPTZ NOT NULL,          -- 5 minutes from issue
    used_at     TIMESTAMPTZ,                   -- NULL = not yet consumed
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_otp_attempts CHECK (attempts <= 5)
);

COMMENT ON TABLE  otp_codes IS 'One-time passwords for password reset and admin 2FA';
COMMENT ON COLUMN otp_codes.code_hash IS 'bcrypt hash — raw OTP never stored';
COMMENT ON COLUMN otp_codes.attempts  IS 'Max 5 failed attempts before code is invalidated';

CREATE INDEX idx_otp_codes_user_purpose ON otp_codes (user_id, purpose)
    WHERE used_at IS NULL;

-- ─────────────────────────────────────────
--  TABLE: oauth_accounts  (FR-AUTH-03)
-- ─────────────────────────────────────────
CREATE TABLE oauth_accounts (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider        VARCHAR(30) NOT NULL,      -- 'google'
    provider_uid    TEXT        NOT NULL,      -- Google sub / unique ID
    email           VARCHAR(255),
    access_token    TEXT,                      -- encrypted at rest (AES-256)
    refresh_token   TEXT,                      -- encrypted at rest
    token_expires_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_oauth_provider_uid UNIQUE (provider, provider_uid)
);

COMMENT ON TABLE  oauth_accounts IS 'Linked OAuth provider accounts per user (Google OAuth 2.0)';
COMMENT ON COLUMN oauth_accounts.access_token  IS 'Stored AES-256 encrypted (NFR-SEC-06)';
COMMENT ON COLUMN oauth_accounts.refresh_token IS 'Stored AES-256 encrypted (NFR-SEC-06)';

CREATE INDEX idx_oauth_accounts_user ON oauth_accounts (user_id);

-- ─────────────────────────────────────────
--  TABLE: role_permissions  (FR-AUTH-06)
--  Explicit permission map — checked by middleware
-- ─────────────────────────────────────────
CREATE TABLE role_permissions (
    id          SERIAL      PRIMARY KEY,
    role        user_role   NOT NULL,
    resource    VARCHAR(50) NOT NULL,   -- e.g. 'bookings', 'courts', 'members', 'reports'
    action      VARCHAR(20) NOT NULL,   -- 'read' | 'create' | 'update' | 'delete' | 'approve'

    CONSTRAINT uq_role_resource_action UNIQUE (role, resource, action)
);

COMMENT ON TABLE role_permissions IS 'RBAC permission matrix — maps roles to allowed resource+action pairs';

-- Guest
INSERT INTO role_permissions (role, resource, action) VALUES
    ('guest', 'courts',   'read'),
    ('guest', 'bookings', 'create'),
    ('guest', 'bookings', 'read'),    -- own booking only (enforced in API)
    ('guest', 'products', 'read'),
    ('guest', 'plans',    'read');

-- Member (inherits guest + member-specific)
INSERT INTO role_permissions (role, resource, action) VALUES
    ('member', 'courts',       'read'),
    ('member', 'bookings',     'create'),
    ('member', 'bookings',     'read'),
    ('member', 'bookings',     'delete'),   -- cancel own booking (≥2h before)
    ('member', 'products',     'read'),
    ('member', 'orders',       'create'),
    ('member', 'orders',       'read'),
    ('member', 'memberships',  'read'),
    ('member', 'plans',        'read');

-- Staff (front-desk: can manage bookings and shop, no system config)
INSERT INTO role_permissions (role, resource, action) VALUES
    ('staff', 'courts',      'read'),
    ('staff', 'bookings',    'create'),
    ('staff', 'bookings',    'read'),
    ('staff', 'bookings',    'update'),
    ('staff', 'bookings',    'approve'),
    ('staff', 'bookings',    'delete'),
    ('staff', 'products',    'read'),
    ('staff', 'orders',      'create'),
    ('staff', 'orders',      'read'),
    ('staff', 'members',     'read'),
    ('staff', 'plans',       'read');

-- Admin (full business management, no super-admin functions)
INSERT INTO role_permissions (role, resource, action) VALUES
    ('admin', 'courts',      'read'),
    ('admin', 'courts',      'create'),
    ('admin', 'courts',      'update'),
    ('admin', 'courts',      'delete'),
    ('admin', 'bookings',    'create'),
    ('admin', 'bookings',    'read'),
    ('admin', 'bookings',    'update'),
    ('admin', 'bookings',    'approve'),
    ('admin', 'bookings',    'delete'),
    ('admin', 'products',    'read'),
    ('admin', 'products',    'create'),
    ('admin', 'products',    'update'),
    ('admin', 'products',    'delete'),
    ('admin', 'orders',      'create'),
    ('admin', 'orders',      'read'),
    ('admin', 'orders',      'update'),
    ('admin', 'members',     'read'),
    ('admin', 'members',     'create'),
    ('admin', 'members',     'update'),
    ('admin', 'memberships', 'read'),
    ('admin', 'memberships', 'update'),
    ('admin', 'credits',     'update'),    -- manual credit adjustment
    ('admin', 'reports',     'read'),
    ('admin', 'plans',       'read');

-- Super Admin (everything + user/role management)
INSERT INTO role_permissions (role, resource, action) VALUES
    ('super_admin', 'courts',      'read'),
    ('super_admin', 'courts',      'create'),
    ('super_admin', 'courts',      'update'),
    ('super_admin', 'courts',      'delete'),
    ('super_admin', 'bookings',    'create'),
    ('super_admin', 'bookings',    'read'),
    ('super_admin', 'bookings',    'update'),
    ('super_admin', 'bookings',    'approve'),
    ('super_admin', 'bookings',    'delete'),
    ('super_admin', 'products',    'read'),
    ('super_admin', 'products',    'create'),
    ('super_admin', 'products',    'update'),
    ('super_admin', 'products',    'delete'),
    ('super_admin', 'orders',      'create'),
    ('super_admin', 'orders',      'read'),
    ('super_admin', 'orders',      'update'),
    ('super_admin', 'orders',      'delete'),
    ('super_admin', 'members',     'read'),
    ('super_admin', 'members',     'create'),
    ('super_admin', 'members',     'update'),
    ('super_admin', 'members',     'delete'),
    ('super_admin', 'memberships', 'read'),
    ('super_admin', 'memberships', 'update'),
    ('super_admin', 'credits',     'update'),
    ('super_admin', 'reports',     'read'),
    ('super_admin', 'users',       'read'),
    ('super_admin', 'users',       'create'),
    ('super_admin', 'users',       'update'),
    ('super_admin', 'users',       'delete'),
    ('super_admin', 'plans',       'read'),
    ('super_admin', 'plans',       'update'),
    ('super_admin', 'audit_logs',  'read');

-- ─────────────────────────────────────────
--  TABLE: audit_logs  (admin action log)
-- ─────────────────────────────────────────
CREATE TABLE audit_logs (
    id          BIGSERIAL       PRIMARY KEY,
    actor_id    UUID            REFERENCES users(id),
    action      VARCHAR(100)    NOT NULL,   -- e.g. 'booking.confirm', 'court.update'
    target_type VARCHAR(50),               -- 'booking' | 'user' | 'court' ...
    target_id   TEXT,
    payload     JSONB,
    ip_address  INET,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE audit_logs IS 'Immutable audit trail for all admin/staff actions (NFR-SEC-08)';

-- ─────────────────────────────────────────
--  TABLE: guest_pass_transactions  (FR-MEM-07)
-- ─────────────────────────────────────────
CREATE TABLE guest_pass_transactions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id   UUID        NOT NULL REFERENCES memberships(id) ON DELETE RESTRICT,
    amount          SMALLINT    NOT NULL,   -- negative = used, positive = added/expired
    type            VARCHAR(10) NOT NULL CHECK (type IN ('used', 'added', 'expired')),
    booking_id      UUID        REFERENCES bookings(id) ON DELETE SET NULL,
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  guest_pass_transactions IS 'Ledger of all guest pass additions and usages per membership (FR-MEM-07)';

-- ─────────────────────────────────────────
--  TABLE: waitlists  (FR-BOOK-08)
-- ─────────────────────────────────────────
CREATE TYPE waitlist_status AS ENUM ('waiting', 'notified', 'converted', 'expired');

CREATE TABLE waitlists (
    id                   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    court_id             INTEGER         NOT NULL REFERENCES courts(id),
    customer_id          UUID            REFERENCES users(id) ON DELETE SET NULL,
    membership_id        UUID            REFERENCES memberships(id) ON DELETE SET NULL,
    customer_name        VARCHAR(100)    NOT NULL,
    customer_phone       VARCHAR(15)     NOT NULL,
    booking_date         DATE            NOT NULL,
    start_time           TIME            NOT NULL,
    duration_hours       DECIMAL(3,1)    NOT NULL CHECK (duration_hours > 0 AND duration_hours <= 8),
    status               waitlist_status NOT NULL DEFAULT 'waiting',
    notified_at          TIMESTAMPTZ,
    converted_booking_id UUID            REFERENCES bookings(id) ON DELETE SET NULL,
    created_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE waitlists IS 'Customers waiting for a slot when a court is fully booked (FR-BOOK-08)';

-- ─────────────────────────────────────────
--  TABLE: recurring_bookings  (FR-BOOK-09)
-- ─────────────────────────────────────────
CREATE TYPE recurrence_status AS ENUM ('active', 'paused', 'cancelled');

CREATE TABLE recurring_bookings (
    id              UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    court_id        INTEGER             NOT NULL REFERENCES courts(id),
    customer_id     UUID                REFERENCES users(id) ON DELETE SET NULL,
    membership_id   UUID                REFERENCES memberships(id) ON DELETE SET NULL,
    customer_name   VARCHAR(100)        NOT NULL,
    customer_phone  VARCHAR(15)         NOT NULL,
    day_of_week     SMALLINT            NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sunday
    start_time      TIME                NOT NULL,
    duration_hours  DECIMAL(3,1)        NOT NULL CHECK (duration_hours > 0 AND duration_hours <= 8),
    starts_on       DATE                NOT NULL,
    ends_on         DATE,
    status          recurrence_status   NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_recurring_dates CHECK (ends_on IS NULL OR ends_on > starts_on)
);

COMMENT ON TABLE  recurring_bookings IS 'Weekly recurring booking schedules (FR-BOOK-09)';
COMMENT ON COLUMN recurring_bookings.day_of_week IS '0=Sunday, 1=Monday, ..., 6=Saturday';

-- ─────────────────────────────────────────
--  TABLE: notifications  (FR-MEM-06, FR-BOOK-06)
-- ─────────────────────────────────────────
CREATE TYPE notification_channel AS ENUM ('email', 'sms');
CREATE TYPE notification_status  AS ENUM ('pending', 'sent', 'failed');

CREATE TABLE notifications (
    id              UUID                    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID                    REFERENCES users(id) ON DELETE SET NULL,
    channel         notification_channel    NOT NULL,
    type            VARCHAR(50)             NOT NULL,   -- 'membership_expiry' | 'booking_confirmed' | 'booking_rejected' | 'otp'
    recipient       VARCHAR(255)            NOT NULL,   -- email address or phone number
    subject         VARCHAR(255),
    body            TEXT                    NOT NULL,
    status          notification_status     NOT NULL DEFAULT 'pending',
    sent_at         TIMESTAMPTZ,
    error_message   TEXT,
    reference_type  VARCHAR(50),
    reference_id    UUID,
    created_at      TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  notifications IS 'Outbound notification log for email and SMS messages (FR-MEM-06, FR-BOOK-06)';
COMMENT ON COLUMN notifications.type IS 'membership_expiry | booking_confirmed | booking_rejected | otp';

-- ─────────────────────────────────────────
--  TABLE: chat_sessions + chat_messages  (FR-AI-04)
-- ─────────────────────────────────────────
CREATE TABLE chat_sessions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        REFERENCES users(id) ON DELETE SET NULL,
    session_key     VARCHAR(100) UNIQUE,   -- anonymous visitor session token
    last_message_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  chat_sessions IS 'AI assistant chat sessions — authenticated or anonymous (FR-AI-04)';
COMMENT ON COLUMN chat_sessions.session_key IS 'Cookie/localStorage key for anonymous visitors';

CREATE TABLE chat_messages (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID        NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role        VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content     TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE chat_messages IS 'Individual messages within an AI chat session';

-- ─────────────────────────────────────────
--  INDEXES
-- ─────────────────────────────────────────

-- users
CREATE INDEX idx_users_phone  ON users (phone);
CREATE INDEX idx_users_email  ON users (email);
CREATE INDEX idx_users_role   ON users (role);

-- memberships
CREATE INDEX idx_memberships_user_status ON memberships (user_id, status);
CREATE INDEX idx_memberships_expires_at  ON memberships (expires_at)
    WHERE status = 'active';   -- partial index for expiry alerts

-- courts
CREATE INDEX idx_courts_sport_status ON courts (sport, status);

-- bookings
CREATE INDEX idx_bookings_court_date   ON bookings (court_id, booking_date);
CREATE INDEX idx_bookings_status_date  ON bookings (status, created_at DESC);
CREATE INDEX idx_bookings_customer     ON bookings (customer_id)
    WHERE customer_id IS NOT NULL;
CREATE INDEX idx_bookings_date_status  ON bookings (booking_date, status);

-- orders
CREATE INDEX idx_orders_customer ON orders (customer_id)
    WHERE customer_id IS NOT NULL;

-- credit_transactions
CREATE INDEX idx_credit_tx_membership ON credit_transactions (membership_id, created_at DESC);

-- audit_logs
CREATE INDEX idx_audit_logs_actor    ON audit_logs (actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_target   ON audit_logs (target_type, target_id);

-- bookings — missing membership index
CREATE INDEX idx_bookings_membership ON bookings (membership_id)
    WHERE membership_id IS NOT NULL;

-- guest_pass_transactions
CREATE INDEX idx_guest_pass_tx_membership ON guest_pass_transactions (membership_id, created_at DESC);

-- waitlists
CREATE INDEX idx_waitlists_court_date ON waitlists (court_id, booking_date, status);

-- recurring_bookings
CREATE INDEX idx_recurring_active ON recurring_bookings (court_id, day_of_week)
    WHERE status = 'active';

-- notifications
CREATE INDEX idx_notifications_user    ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_pending ON notifications (status, created_at)
    WHERE status = 'pending';

-- chat
CREATE INDEX idx_chat_sessions_user    ON chat_sessions (user_id);
CREATE INDEX idx_chat_messages_session ON chat_messages (session_id, created_at ASC);

-- ─────────────────────────────────────────
--  FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_memberships_updated_at
    BEFORE UPDATE ON memberships
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_courts_updated_at
    BEFORE UPDATE ON courts
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_oauth_accounts_updated_at
    BEFORE UPDATE ON oauth_accounts
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_waitlists_updated_at
    BEFORE UPDATE ON waitlists
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_recurring_bookings_updated_at
    BEFORE UPDATE ON recurring_bookings
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Generate booking ref: SH + 6 random digits
CREATE OR REPLACE FUNCTION generate_booking_ref()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    new_ref VARCHAR(10);
    attempts INT := 0;
BEGIN
    IF NEW.ref IS NOT NULL AND NEW.ref <> '' THEN
        RETURN NEW;
    END IF;
    LOOP
        new_ref := 'SH' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM bookings WHERE ref = new_ref);
        attempts := attempts + 1;
        IF attempts > 20 THEN
            RAISE EXCEPTION 'Could not generate unique booking ref after 20 attempts';
        END IF;
    END LOOP;
    NEW.ref := new_ref;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bookings_generate_ref
    BEFORE INSERT ON bookings
    FOR EACH ROW EXECUTE FUNCTION generate_booking_ref();

-- Prevent double-booking: no two confirmed/pending bookings for same court+date+overlapping time
CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.status IN ('cancelled', 'rejected') THEN
        RETURN NEW;
    END IF;

    IF EXISTS (
        SELECT 1 FROM bookings
        WHERE court_id    = NEW.court_id
          AND booking_date = NEW.booking_date
          AND status       NOT IN ('cancelled', 'rejected')
          AND id           <> NEW.id
          AND (
              -- overlap: new starts before existing ends AND new ends after existing starts
              NEW.start_time < (start_time + (duration_hours || ' hours')::INTERVAL)
              AND
              (NEW.start_time + (NEW.duration_hours || ' hours')::INTERVAL) > start_time
          )
    ) THEN
        RAISE EXCEPTION 'SLOT_NOT_AVAILABLE: Court % is already booked on % at %',
            NEW.court_id, NEW.booking_date, NEW.start_time
            USING ERRCODE = '23505';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bookings_no_overlap
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION check_booking_overlap();

-- ─────────────────────────────────────────
--  SEED DATA — Membership Plans already inserted above.
--  Below: sample courts, one admin user, and plan config.
-- ─────────────────────────────────────────

-- Sample admin user (password_hash is a placeholder — replace with real bcrypt hash)
INSERT INTO users (name, email, role)
VALUES ('Super Admin', 'admin@sporthub.vn', 'super_admin');

-- Sample courts
INSERT INTO courts (name, sport, surface, is_indoor, price_normal, price_peak)
VALUES
    ('Tennis Court A',      'Tennis',     'Hard Court',    FALSE, 150000, 220000),
    ('Tennis Court B',      'Tennis',     'Hard Court',    FALSE, 150000, 220000),
    ('Tennis Court C',      'Tennis',     'Clay Court',    TRUE,  160000, 230000),
    ('Pickleball Court 1',  'Pickleball', 'Synthetic',     TRUE,  120000, 180000),
    ('Pickleball Court 2',  'Pickleball', 'Synthetic',     TRUE,  120000, 180000),
    ('Badminton Court 1',   'Badminton',  'Wood',          TRUE,  100000, 150000),
    ('Badminton Court 2',   'Badminton',  'Wood',          TRUE,  100000, 150000),
    ('Badminton Court 3',   'Badminton',  'PVC',           TRUE,   90000, 140000);

-- Sample products
INSERT INTO products (name, category, price, stock, is_service)
VALUES
    ('Vợt Tennis Wilson Pro',   'Equipment',  1800000, 10,  FALSE),
    ('Vợt Pickleball Selkirk',  'Equipment',  2200000,  8,  FALSE),
    ('Vợt Cầu Lông Yonex',      'Equipment',  1500000, 15,  FALSE),
    ('Cầu lông thường (hộp)',    'Consumable',  85000, 100, FALSE),
    ('Nước uống thể thao',       'Beverage',    25000, 200, FALSE),
    ('Thuê vợt Tennis',          'Rental',      50000,   0,  TRUE),
    ('Thuê vợt Cầu Lông',        'Rental',      30000,   0,  TRUE),
    ('Giày thể thao Nike',       'Apparel',   1200000,  20,  FALSE),
    ('Khăn tập thể thao',        'Apparel',    120000,  50,  FALSE),
    ('Túi đựng vợt',             'Accessories', 350000, 30,  FALSE);

-- ─────────────────────────────────────────
--  VIEWS — Convenience query helpers
-- ─────────────────────────────────────────

-- Active memberships with plan benefits joined
CREATE VIEW v_active_memberships AS
SELECT
    m.id,
    m.user_id,
    u.name          AS user_name,
    u.phone         AS user_phone,
    u.email         AS user_email,
    m.plan,
    p.display_name  AS plan_name,
    m.status,
    m.started_at,
    m.expires_at,
    m.credit_balance,
    m.guest_passes,
    p.court_discount_pct,
    p.shop_discount_pct,
    p.priority_booking,
    (m.expires_at - CURRENT_DATE) AS days_until_expiry
FROM memberships m
JOIN users            u ON u.id = m.user_id
JOIN membership_plans p ON p.id = m.plan
WHERE m.status = 'active';

COMMENT ON VIEW v_active_memberships IS 'Active memberships enriched with user info and plan benefits';

-- Today bookings summary for dashboard
CREATE VIEW v_today_bookings AS
SELECT
    b.id,
    b.ref,
    b.court_id,
    c.name          AS court_name,
    c.sport,
    b.customer_name,
    b.customer_phone,
    b.start_time,
    b.duration_hours,
    b.final_price,
    b.status,
    b.source
FROM bookings b
JOIN courts c ON c.id = b.court_id
WHERE b.booking_date = CURRENT_DATE
ORDER BY b.start_time;

COMMENT ON VIEW v_today_bookings IS 'All bookings for today — used by admin dashboard';

-- ─────────────────────────────────────────
--  END OF SCHEMA
-- ─────────────────────────────────────────
