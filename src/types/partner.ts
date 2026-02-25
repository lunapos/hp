export interface Partner {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  partner_type: "individual" | "corporation" | "owner" | "other";
  referral_code: string;
  status: "active" | "suspended";
  created_at: string;
  updated_at: string;
}

export interface ReferralClick {
  id: string;
  partner_id: string;
  referral_code: string;
  ip_address: string | null;
  user_agent: string | null;
  page_url: string | null;
  created_at: string;
}

export interface Conversion {
  id: string;
  partner_id: string;
  referral_code: string;
  store_name: string;
  store_email: string;
  status: "pending" | "confirmed" | "rejected";
  created_at: string;
  confirmed_at: string | null;
}

export interface Commission {
  id: string;
  partner_id: string;
  conversion_id: string | null;
  amount: number;
  status: "pending" | "approved" | "paid";
  note: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface ClickBreakdown {
  page_url: string;
  click_count: number;
}

export interface DailyStats {
  date: string;
  clicks: number;
  conversions: number;
}

export interface PartnerStats {
  partner_id: string;
  user_id: string;
  referral_code: string;
  total_clicks: number;
  total_conversions: number;
  confirmed_conversions: number;
  total_commission: number;
  pending_commission: number;
  approved_commission: number;
  paid_commission: number;
}
