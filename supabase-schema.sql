-- ============================================================
-- LunaPos Affiliate System - Supabase Schema
-- Supabase SQL Editor で実行してください
-- ============================================================

-- TABLE: partners
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  partner_type TEXT NOT NULL DEFAULT 'individual'
    CHECK (partner_type IN ('individual', 'corporation', 'owner', 'other')),
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_partners_referral_code ON partners(referral_code);

-- TABLE: referral_clicks
CREATE TABLE referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_referral_clicks_partner ON referral_clicks(partner_id);
CREATE INDEX idx_referral_clicks_created ON referral_clicks(created_at);

-- TABLE: conversions
CREATE TABLE conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);

CREATE INDEX idx_conversions_partner ON conversions(partner_id);

-- TABLE: commissions
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  conversion_id UUID REFERENCES conversions(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX idx_commissions_partner ON commissions(partner_id);
CREATE INDEX idx_commissions_status ON commissions(status);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Partners
CREATE POLICY "partners_select_own" ON partners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "partners_update_own" ON partners
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "partners_insert_own" ON partners
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referral clicks
CREATE POLICY "referral_clicks_select_own" ON referral_clicks
  FOR SELECT USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

CREATE POLICY "referral_clicks_insert_anon" ON referral_clicks
  FOR INSERT WITH CHECK (true);

-- Conversions
CREATE POLICY "conversions_select_own" ON conversions
  FOR SELECT USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

CREATE POLICY "conversions_insert_anon" ON conversions
  FOR INSERT WITH CHECK (true);

-- Commissions
CREATE POLICY "commissions_select_own" ON commissions
  FOR SELECT USING (
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Generate unique 8-char referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substr(md5(random()::text), 1, 8));
    SELECT EXISTS(SELECT 1 FROM partners WHERE referral_code = code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Track referral click (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION track_referral_click(
  p_referral_code TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_page_url TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_partner_id UUID;
BEGIN
  SELECT id INTO v_partner_id
  FROM partners
  WHERE referral_code = p_referral_code AND status = 'active';

  IF v_partner_id IS NOT NULL THEN
    INSERT INTO referral_clicks (partner_id, referral_code, ip_address, user_agent, page_url)
    VALUES (v_partner_id, p_referral_code, p_ip_address, p_user_agent, p_page_url);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Track conversion (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION track_conversion(
  p_referral_code TEXT,
  p_store_name TEXT,
  p_store_email TEXT
) RETURNS VOID AS $$
DECLARE
  v_partner_id UUID;
BEGIN
  SELECT id INTO v_partner_id
  FROM partners
  WHERE referral_code = p_referral_code AND status = 'active';

  IF v_partner_id IS NOT NULL THEN
    INSERT INTO conversions (partner_id, referral_code, store_name, store_email)
    VALUES (v_partner_id, p_referral_code, p_store_name, p_store_email);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VIEW: partner_stats
-- ============================================================

CREATE OR REPLACE VIEW partner_stats AS
SELECT
  p.id AS partner_id,
  p.user_id,
  p.referral_code,
  (SELECT COUNT(*) FROM referral_clicks rc WHERE rc.partner_id = p.id) AS total_clicks,
  (SELECT COUNT(*) FROM conversions c WHERE c.partner_id = p.id) AS total_conversions,
  (SELECT COUNT(*) FROM conversions c WHERE c.partner_id = p.id AND c.status = 'confirmed') AS confirmed_conversions,
  (SELECT COALESCE(SUM(cm.amount), 0) FROM commissions cm WHERE cm.partner_id = p.id) AS total_commission,
  (SELECT COALESCE(SUM(cm.amount), 0) FROM commissions cm WHERE cm.partner_id = p.id AND cm.status = 'pending') AS pending_commission,
  (SELECT COALESCE(SUM(cm.amount), 0) FROM commissions cm WHERE cm.partner_id = p.id AND cm.status = 'approved') AS approved_commission,
  (SELECT COALESCE(SUM(cm.amount), 0) FROM commissions cm WHERE cm.partner_id = p.id AND cm.status = 'paid') AS paid_commission
FROM partners p;
