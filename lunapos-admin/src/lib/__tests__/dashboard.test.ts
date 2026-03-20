import { describe, it, expect } from 'vitest'
import {
  toDateStr,
  formatYen,
  calcDailySummary,
  calcCastRankings,
  calcHourlyData,
  calcMonthlyData,
  METHOD_LABELS,
} from '../dashboard'
import type { PaymentRow, VisitRow, NominationRow, CastRow } from '../../types'

// テストデータファクトリ
function makePayment(overrides: Partial<PaymentRow> = {}): PaymentRow {
  return {
    id: 'p1', tenant_id: 't1', visit_id: 'v1', table_id: 'tb1',
    customer_name: 'テスト客', subtotal: 10000, expense_total: 0,
    nomination_fee: 5000, service_fee: 4000, tax: 1400, discount: 0,
    total: 20400, payment_method: 'cash', paid_at: '2026-03-20T21:00:00+09:00',
    created_at: '', updated_at: '',
    ...overrides,
  }
}

function makeVisit(overrides: Partial<VisitRow> = {}): VisitRow {
  return {
    id: 'v1', tenant_id: 't1', table_id: 'tb1', customer_id: null,
    customer_name: 'テスト客', guest_count: 2, douhan_cast_id: null, douhan_qty: 0,
    check_in_time: '2026-03-20T20:00:00+09:00', check_out_time: '2026-03-20T21:00:00+09:00',
    set_minutes: 60, extension_minutes: 0, set_price_override: null,
    douhan_fee_override: null, is_checked_out: true, created_at: '', updated_at: '',
    ...overrides,
  }
}

function makeNomination(overrides: Partial<NominationRow> = {}): NominationRow {
  return {
    id: 'n1', tenant_id: 't1', visit_id: 'v1', cast_id: 'c1',
    nomination_type: 'main', qty: 1, fee_override: null, created_at: '', updated_at: '',
    ...overrides,
  }
}

function makeCast(overrides: Partial<CastRow> = {}): CastRow {
  return {
    id: 'c1', tenant_id: 't1', stage_name: 'あかり', real_name: 'テスト',
    photo_url: null, drop_off_location: null, is_active: true, created_at: '', updated_at: '',
    ...overrides,
  }
}

// ===========================================
// toDateStr
// ===========================================
describe('toDateStr', () => {
  it('日付をYYYY-MM-DD形式に変換する', () => {
    expect(toDateStr(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(toDateStr(new Date(2026, 11, 25))).toBe('2026-12-25')
  })

  it('月・日が1桁の場合にゼロ埋めする', () => {
    expect(toDateStr(new Date(2026, 2, 1))).toBe('2026-03-01')
  })
})

// ===========================================
// formatYen
// ===========================================
describe('formatYen', () => {
  it('金額を円記号付きで表示する', () => {
    expect(formatYen(0)).toBe('¥0')
    expect(formatYen(1000)).toBe('¥1,000')
    expect(formatYen(123456)).toBe('¥123,456')
  })

  it('大きな金額にカンマを入れる', () => {
    expect(formatYen(1000000)).toBe('¥1,000,000')
  })

  it('負の金額も処理する', () => {
    expect(formatYen(-500)).toBe('¥-500')
  })
})

// ===========================================
// METHOD_LABELS
// ===========================================
describe('METHOD_LABELS', () => {
  it('全支払方法のラベルが定義されている', () => {
    expect(METHOD_LABELS['cash']).toBe('現金')
    expect(METHOD_LABELS['credit']).toBe('カード')
    expect(METHOD_LABELS['electronic']).toBe('電子マネー')
    expect(METHOD_LABELS['tab']).toBe('ツケ')
  })
})

// ===========================================
// calcDailySummary
// ===========================================
describe('calcDailySummary', () => {
  it('空データでゼロを返す', () => {
    const result = calcDailySummary([], [])
    expect(result.totalSales).toBe(0)
    expect(result.visitCount).toBe(0)
    expect(result.guestCount).toBe(0)
    expect(result.avgSpend).toBe(0)
    expect(result.methodTotals).toEqual({})
  })

  it('売上合計を正しく計算する', () => {
    const payments = [
      makePayment({ total: 20000 }),
      makePayment({ id: 'p2', total: 30000 }),
    ]
    const visits = [makeVisit(), makeVisit({ id: 'v2' })]
    const result = calcDailySummary(payments, visits)
    expect(result.totalSales).toBe(50000)
  })

  it('来店組数とゲスト数を正しく集計する', () => {
    const visits = [
      makeVisit({ guest_count: 2 }),
      makeVisit({ id: 'v2', guest_count: 5 }),
      makeVisit({ id: 'v3', guest_count: 1 }),
    ]
    const result = calcDailySummary([], visits)
    expect(result.visitCount).toBe(3)
    expect(result.guestCount).toBe(8)
  })

  it('客単価を組単位で計算する（小数切り捨て）', () => {
    const payments = [
      makePayment({ total: 10000 }),
      makePayment({ id: 'p2', total: 15000 }),
      makePayment({ id: 'p3', total: 8000 }),
    ]
    const visits = [makeVisit(), makeVisit({ id: 'v2' }), makeVisit({ id: 'v3' })]
    const result = calcDailySummary(payments, visits)
    expect(result.avgSpend).toBe(11000) // Math.floor(33000/3)
  })

  it('支払方法別に合計を集計する', () => {
    const payments = [
      makePayment({ total: 20000, payment_method: 'cash' }),
      makePayment({ id: 'p2', total: 30000, payment_method: 'credit' }),
      makePayment({ id: 'p3', total: 15000, payment_method: 'cash' }),
    ]
    const result = calcDailySummary(payments, [])
    expect(result.methodTotals).toEqual({ cash: 35000, credit: 30000 })
  })

  it('来店0件の時に客単価がゼロ（ゼロ除算しない）', () => {
    const payments = [makePayment({ total: 10000 })]
    const result = calcDailySummary(payments, [])
    expect(result.avgSpend).toBe(0)
  })
})

// ===========================================
// calcCastRankings
// ===========================================
describe('calcCastRankings', () => {
  it('空データで空配列を返す', () => {
    expect(calcCastRankings([], [], [], [])).toEqual([])
  })

  it('指名のないキャストはランキングに含まれない', () => {
    const casts = [makeCast()]
    const result = calcCastRankings([], [], [], casts)
    expect(result).toHaveLength(0)
  })

  it('指名数を正しくカウントする', () => {
    const visits = [makeVisit()]
    const casts = [makeCast()]
    const nominations = [
      makeNomination({ qty: 1 }),
      makeNomination({ id: 'n2', qty: 2 }),
    ]
    const result = calcCastRankings(visits, nominations, [], casts)
    expect(result[0].nominations).toBe(3)
  })

  it('売上降順でソートする', () => {
    const visits = [makeVisit(), makeVisit({ id: 'v2' })]
    const casts = [
      makeCast({ id: 'c1', stage_name: 'あかり' }),
      makeCast({ id: 'c2', stage_name: 'みお' }),
    ]
    const nominations = [
      makeNomination({ visit_id: 'v1', cast_id: 'c1' }),
      makeNomination({ id: 'n2', visit_id: 'v2', cast_id: 'c2' }),
    ]
    const payments = [
      makePayment({ visit_id: 'v1', total: 10000 }),
      makePayment({ id: 'p2', visit_id: 'v2', total: 30000 }),
    ]
    const result = calcCastRankings(visits, nominations, payments, casts)
    expect(result[0].stageName).toBe('みお')
    expect(result[1].stageName).toBe('あかり')
  })

  it('nomination_type=noneは除外する', () => {
    const visits = [makeVisit()]
    const casts = [makeCast()]
    const nominations = [makeNomination({ nomination_type: 'none' })]
    const result = calcCastRankings(visits, nominations, [], casts)
    expect(result).toHaveLength(0)
  })

  it('最大10件に制限する', () => {
    const visits = Array.from({ length: 12 }, (_, i) => makeVisit({ id: `v${i}` }))
    const casts = Array.from({ length: 12 }, (_, i) => makeCast({ id: `c${i}`, stage_name: `キャスト${i}` }))
    const nominations = Array.from({ length: 12 }, (_, i) =>
      makeNomination({ id: `n${i}`, visit_id: `v${i}`, cast_id: `c${i}` })
    )
    const payments = Array.from({ length: 12 }, (_, i) =>
      makePayment({ id: `p${i}`, visit_id: `v${i}`, total: (12 - i) * 1000 })
    )
    const result = calcCastRankings(visits, nominations, payments, casts)
    expect(result).toHaveLength(10)
  })
})

// ===========================================
// calcHourlyData
// ===========================================
describe('calcHourlyData', () => {
  it('空データで全時間帯0を返す', () => {
    const result = calcHourlyData([])
    expect(result).toHaveLength(24)
    expect(result.every(h => h.count === 0)).toBe(true)
  })

  it('来店を正しい時間帯にカウントする', () => {
    const visits = [
      makeVisit({ check_in_time: '2026-03-20T20:00:00+09:00' }),
      makeVisit({ id: 'v2', check_in_time: '2026-03-20T20:30:00+09:00' }),
      makeVisit({ id: 'v3', check_in_time: '2026-03-20T22:00:00+09:00' }),
    ]
    const result = calcHourlyData(visits)
    const h20 = result.find(h => h.hour === 20)
    const h22 = result.find(h => h.hour === 22)
    expect(h20?.count).toBe(2)
    expect(h22?.count).toBe(1)
  })
})

// ===========================================
// calcMonthlyData
// ===========================================
describe('calcMonthlyData', () => {
  it('空データで全日ゼロの配列を返す', () => {
    const result = calcMonthlyData([], 2026, 3)
    expect(result).toHaveLength(31) // 3月は31日
    expect(result.every(d => d.total === 0 && d.count === 0)).toBe(true)
  })

  it('2月の日数が正しい（うるう年考慮）', () => {
    const result = calcMonthlyData([], 2028, 2) // うるう年
    expect(result).toHaveLength(29)

    const result2 = calcMonthlyData([], 2026, 2) // 平年
    expect(result2).toHaveLength(28)
  })

  it('日別に売上を集計する', () => {
    const payments = [
      { total: 10000, paid_at: '2026-03-15T21:00:00+09:00' },
      { total: 20000, paid_at: '2026-03-15T22:00:00+09:00' },
      { total: 5000, paid_at: '2026-03-16T21:00:00+09:00' },
    ]
    const result = calcMonthlyData(payments, 2026, 3)
    const day15 = result.find(d => d.date === '2026-03-15')
    const day16 = result.find(d => d.date === '2026-03-16')
    expect(day15?.total).toBe(30000)
    expect(day15?.count).toBe(2)
    expect(day16?.total).toBe(5000)
    expect(day16?.count).toBe(1)
  })

  it('日付順にソートされている', () => {
    const result = calcMonthlyData([], 2026, 1)
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date > result[i - 1].date).toBe(true)
    }
  })
})
