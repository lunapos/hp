// ========================================
// Luna Cast 型定義（Supabase DB対応）
// ========================================

export type NominationType = 'none' | 'in_store' | 'main'
export type PaymentMethod = 'cash' | 'credit' | 'electronic' | 'tab'

export interface CastRow {
  id: string
  tenant_id: string
  stage_name: string
  real_name: string
  photo_url: string | null
  drop_off_location: string | null
  today_drop_off_location: string | null
  today_drop_off_date: string | null
  is_active: boolean
}

export interface NominationRow {
  id: string
  visit_id: string
  cast_id: string
  nomination_type: NominationType
  qty: number
  fee_override: number | null
  created_at: string
}

export interface VisitRow {
  id: string
  customer_name: string | null
  guest_count: number
  check_in_time: string
  check_out_time: string | null
  is_checked_out: boolean
}

export interface PaymentRow {
  id: string
  visit_id: string
  total: number
  subtotal: number
  payment_method: PaymentMethod
  paid_at: string
  nomination_fee: number
}

export interface OrderItemRow {
  id: string
  visit_id: string
  menu_item_name: string
  price: number
  quantity: number
  cast_id: string | null
}

export interface CastShiftRow {
  id: string
  cast_id: string
  clock_in: string
  clock_out: string | null
}

// 個人メモ（ローカル + Supabase保存）
export interface CustomerMemo {
  id: string
  name: string
  features: string     // 特徴
  favoriteDrink: string // 好みのドリンク
  visitFrequency: string // 来店頻度
  memo: string         // フリーテキスト
  createdAt: string
  updatedAt: string
}

// 日次サマリー
export interface DailySummary {
  date: string
  mainNominations: number
  inStoreNominations: number
  drinkCount: number
  salesContribution: number
}
