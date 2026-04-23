// CastApp 計算ロジック（テスト可能な純粋関数）

import type { NominationRow, PaymentRow, OrderItemRow, DailySummary, CustomerMemo } from '../types'

export function formatYen(n: number): string {
  return `¥${n.toLocaleString()}`
}

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * 営業日の開始・終了時刻を返す（ISO8601 JST）
 * 正午〜翌正午を1営業日とする（POS と同じ定義）
 */
export function businessDayRange(dateStr: string): { dayStart: string; dayEnd: string } {
  const dayStart = `${dateStr}T12:00:00+09:00`
  const d = new Date(`${dateStr}T12:00:00+09:00`)
  d.setDate(d.getDate() + 1)
  const nextDate = toDateStr(d)
  const dayEnd = `${nextDate}T11:59:59+09:00`
  return { dayStart, dayEnd }
}

/**
 * offsetが0=今日の営業日, 1=昨日の営業日 の日付文字列を返す
 * 12:00 前なら前日扱い
 */
export function businessDateByOffset(offset: number): string {
  const now = new Date()
  const effectiveNow = now.getHours() < 12
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    : now
  const d = new Date(effectiveNow)
  d.setDate(d.getDate() - offset)
  return toDateStr(d)
}

export function nominationLabel(type: string): string {
  if (type === 'main') return '本指名'
  if (type === 'in_store') return '場内指名'
  return ''
}

export const MEMO_STORAGE_KEY = 'luna_cast_memos'

export function loadMemos(storage: Storage): CustomerMemo[] {
  try {
    const raw = storage.getItem(MEMO_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveMemos(storage: Storage, memos: CustomerMemo[]) {
  storage.setItem(MEMO_STORAGE_KEY, JSON.stringify(memos))
}

// 今日のサマリー計算
export interface TodaySummary {
  mainNominations: number
  inStoreNominations: number
  drinkCount: number
  salesContribution: number
}

export function calcTodaySummary(
  nominations: NominationRow[],
  payments: PaymentRow[],
  orders: OrderItemRow[],
): TodaySummary {
  const mainNominations = nominations
    .filter(n => n.nomination_type === 'main')
    .reduce((s, n) => s + n.qty, 0)
  const inStoreNominations = nominations
    .filter(n => n.nomination_type === 'in_store')
    .reduce((s, n) => s + n.qty, 0)
  const drinkCount = orders.reduce((s, o) => s + o.quantity, 0)

  // 管理画面と同じ計算方式: subtotalを本指名数で按分
  const paymentByVisit = new Map(payments.map(p => [p.visit_id, p]))
  const mainNomTotalByVisit = new Map<string, number>()
  for (const n of nominations) {
    if (n.nomination_type !== 'main') continue
    mainNomTotalByVisit.set(n.visit_id, (mainNomTotalByVisit.get(n.visit_id) ?? 0) + n.qty)
  }
  let salesContribution = 0
  for (const n of nominations) {
    if (n.nomination_type !== 'main') continue
    const payment = paymentByVisit.get(n.visit_id)
    const totalMainNoms = mainNomTotalByVisit.get(n.visit_id) ?? 1
    if (payment) {
      salesContribution += Math.round((payment.subtotal / totalMainNoms) * n.qty)
    }
  }

  return { mainNominations, inStoreNominations, drinkCount, salesContribution }
}

// 月次集計
export function calcMonthlyData(
  nominations: NominationRow[],
  year: number,
  month: number,
): DailySummary[] {
  const daysInMonth = new Date(year, month, 0).getDate()
  const selectedMonth = `${year}-${String(month).padStart(2, '0')}`
  const byDay: Record<string, DailySummary> = {}
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${selectedMonth}-${String(d).padStart(2, '0')}`
    byDay[key] = { date: key, mainNominations: 0, inStoreNominations: 0, drinkCount: 0, salesContribution: 0 }
  }
  for (const n of nominations) {
    const day = toDateStr(new Date(n.created_at))
    if (byDay[day]) {
      if (n.nomination_type === 'main') byDay[day].mainNominations += n.qty
      else if (n.nomination_type === 'in_store') byDay[day].inStoreNominations += n.qty
    }
  }
  return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date))
}

// メモのフィルタリング
export function filterMemos(memos: CustomerMemo[], search: string): CustomerMemo[] {
  if (!search) return memos
  return memos.filter(m =>
    m.name.includes(search) || m.features.includes(search) || m.memo.includes(search)
  )
}

// 月次サマリー集計
export function calcMonthlyTotals(dailyData: DailySummary[]) {
  const totalMain = dailyData.reduce((s, d) => s + d.mainNominations, 0)
  const totalInStore = dailyData.reduce((s, d) => s + d.inStoreNominations, 0)
  const activeDays = dailyData.filter(d => d.mainNominations + d.inStoreNominations > 0).length
  return { totalMain, totalInStore, activeDays }
}
