// ========================================
// Luna Admin 型定義（Supabase DB対応）
// ========================================

export type TableStatus = 'empty' | 'occupied' | 'waiting_checkout'
export type MenuCategory = 'drink' | 'bottle' | 'food' | 'ladies_drink' | 'other'
export type NominationType = 'none' | 'in_store' | 'main'
export type PaymentMethod = 'cash' | 'credit' | 'electronic' | 'tab'
export type CustomerRank = 'new' | 'repeat' | 'vip'
export type RoundingType = 'none' | 'floor' | 'ceil' | 'round'

// --- Supabase Row型 ---

export interface StoreRow {
  id: string
  name: string
  service_rate: number
  tax_rate: number
  douhan_fee: number
  nomination_fee_main: number
  nomination_fee_in_store: number
  invoice_registration_number: string | null
  enable_drop_off: boolean
  rounding_unit: number
  rounding_type: RoundingType
  created_at: string
  updated_at: string
}

export interface RoomRow {
  id: string
  tenant_id: string
  name: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CastRow {
  id: string
  tenant_id: string
  stage_name: string
  real_name: string
  photo_url: string | null
  drop_off_location: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MenuItemRow {
  id: string
  tenant_id: string
  name: string
  price: number
  category: MenuCategory
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SetPlanRow {
  id: string
  tenant_id: string
  name: string
  duration_minutes: number
  price: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FloorTableRow {
  id: string
  tenant_id: string
  room_id: string
  name: string
  capacity: number
  status: TableStatus
  position_x: number
  position_y: number
  visit_id: string | null
  created_at: string
  updated_at: string
}

export interface VisitRow {
  id: string
  tenant_id: string
  table_id: string
  customer_id: string | null
  customer_name: string | null
  guest_count: number
  douhan_cast_id: string | null
  douhan_qty: number
  check_in_time: string
  check_out_time: string | null
  set_minutes: number
  extension_minutes: number
  set_price_override: number | null
  douhan_fee_override: number | null
  is_checked_out: boolean
  created_at: string
  updated_at: string
}

export interface NominationRow {
  id: string
  tenant_id: string
  visit_id: string
  cast_id: string
  nomination_type: NominationType
  qty: number
  fee_override: number | null
  created_at: string
  updated_at: string
}

export interface PaymentRow {
  id: string
  tenant_id: string
  visit_id: string
  table_id: string
  customer_name: string | null
  subtotal: number
  expense_total: number
  nomination_fee: number
  service_fee: number
  tax: number
  discount: number
  total: number
  payment_method: PaymentMethod
  paid_at: string
  created_at: string
  updated_at: string
}

export interface CastShiftRow {
  id: string
  tenant_id: string
  cast_id: string
  clock_in: string
  clock_out: string | null
  scheduled_clock_in: string | null
  scheduled_clock_out: string | null
  created_at: string
  updated_at: string
}

export interface CustomerRow {
  id: string
  tenant_id: string
  name: string
  phone: string | null
  visit_count: number
  total_spend: number
  notes: string | null
  rank: CustomerRank
  favorite_cast_id: string | null
  created_at: string
  updated_at: string
}

export interface OrderItemRow {
  id: string
  tenant_id: string
  visit_id: string
  menu_item_id: string
  menu_item_name: string
  price: number
  quantity: number
  is_expense: boolean
  cast_id: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export interface CashWithdrawalRow {
  id: string
  tenant_id: string
  amount: number
  note: string | null
  created_at: string
  updated_at: string
}

export interface RegisterSessionRow {
  id: string
  tenant_id: string
  business_date: string
  start_amount: number
  created_at: string
  updated_at: string
}

// --- UI表示用型 ---

export interface DailySummary {
  date: string
  totalSales: number
  visitCount: number
  guestCount: number
  avgSpend: number
  cashTotal: number
  cardTotal: number
  electronicTotal: number
  tabTotal: number
  nominationCount: number
}

export interface CastRanking {
  castId: string
  stageName: string
  photoUrl: string | null
  nominations: number
  sales: number
  drinkCount: number
}

export interface HourlyData {
  hour: number
  count: number
}
