import { describe, it, expect, beforeEach } from 'vitest'
import {
  formatYen, toDateStr, nominationLabel, MEMO_STORAGE_KEY,
  loadMemos, saveMemos, calcTodaySummary, calcMonthlyData,
  calcMonthlyTotals, filterMemos,
} from '../castApp'
import type { NominationRow, PaymentRow, OrderItemRow, CustomerMemo, DailySummary } from '../../types'

// テストデータファクトリ
function makeNomination(overrides: Partial<NominationRow> = {}): NominationRow {
  return {
    id: 'n1', visit_id: 'v1', cast_id: 'c1',
    nomination_type: 'main', qty: 1, fee_override: null,
    created_at: '2026-03-20T20:00:00+09:00',
    ...overrides,
  }
}

function makePayment(overrides: Partial<PaymentRow> = {}): PaymentRow {
  return {
    id: 'p1', visit_id: 'v1', total: 20000, subtotal: 20000,
    payment_method: 'cash', paid_at: '2026-03-20T21:00:00+09:00',
    nomination_fee: 5000,
    ...overrides,
  }
}

function makeOrder(overrides: Partial<OrderItemRow> = {}): OrderItemRow {
  return {
    id: 'o1', visit_id: 'v1', menu_item_name: 'カクテル',
    price: 1000, quantity: 1, cast_id: 'c1',
    ...overrides,
  }
}

function makeMemo(overrides: Partial<CustomerMemo> = {}): CustomerMemo {
  return {
    id: 'm1', name: '田中さん', features: '背が高い',
    favoriteDrink: 'ウイスキー', visitFrequency: '週1',
    memo: '話が面白い', createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    ...overrides,
  }
}

// ===========================================
// formatYen
// ===========================================
describe('formatYen', () => {
  it('金額を円記号付きで表示する', () => {
    expect(formatYen(0)).toBe('¥0')
    expect(formatYen(1000)).toBe('¥1,000')
    expect(formatYen(100000)).toBe('¥100,000')
  })
})

// ===========================================
// toDateStr
// ===========================================
describe('toDateStr', () => {
  it('日付をYYYY-MM-DD形式に変換する', () => {
    expect(toDateStr(new Date(2026, 2, 20))).toBe('2026-03-20')
    expect(toDateStr(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

// ===========================================
// nominationLabel
// ===========================================
describe('nominationLabel', () => {
  it('本指名を正しく返す', () => {
    expect(nominationLabel('main')).toBe('本指名')
  })

  it('場内指名を正しく返す', () => {
    expect(nominationLabel('in_store')).toBe('場内指名')
  })

  it('noneは空文字を返す', () => {
    expect(nominationLabel('none')).toBe('')
  })

  it('不明な値は空文字を返す', () => {
    expect(nominationLabel('unknown')).toBe('')
  })
})

// ===========================================
// メモ管理（localStorage）
// ===========================================
describe('loadMemos / saveMemos', () => {
  let mockStorage: Storage

  beforeEach(() => {
    const store: Record<string, string> = {}
    mockStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value },
      removeItem: (key: string) => { delete store[key] },
      clear: () => { Object.keys(store).forEach(k => delete store[k]) },
      get length() { return Object.keys(store).length },
      key: (i: number) => Object.keys(store)[i] ?? null,
    }
  })

  it('空のストレージから空配列を返す', () => {
    expect(loadMemos(mockStorage)).toEqual([])
  })

  it('保存したメモを読み込める', () => {
    const memos = [makeMemo()]
    saveMemos(mockStorage, memos)
    expect(loadMemos(mockStorage)).toEqual(memos)
  })

  it('複数メモの保存と読み込み', () => {
    const memos = [
      makeMemo({ id: 'm1', name: '田中さん' }),
      makeMemo({ id: 'm2', name: '佐藤さん' }),
    ]
    saveMemos(mockStorage, memos)
    const loaded = loadMemos(mockStorage)
    expect(loaded).toHaveLength(2)
    expect(loaded[0].name).toBe('田中さん')
    expect(loaded[1].name).toBe('佐藤さん')
  })

  it('不正なJSONの場合は空配列を返す', () => {
    mockStorage.setItem(MEMO_STORAGE_KEY, 'invalid json')
    expect(loadMemos(mockStorage)).toEqual([])
  })

  it('MEMO_STORAGE_KEYが正しい', () => {
    expect(MEMO_STORAGE_KEY).toBe('luna_cast_memos')
  })
})

// ===========================================
// calcTodaySummary
// ===========================================
describe('calcTodaySummary', () => {
  it('空データでゼロを返す', () => {
    const result = calcTodaySummary([], [], [])
    expect(result.mainNominations).toBe(0)
    expect(result.inStoreNominations).toBe(0)
    expect(result.drinkCount).toBe(0)
    expect(result.salesContribution).toBe(0)
  })

  it('本指名と場内指名を分けてカウントする', () => {
    const nominations = [
      makeNomination({ nomination_type: 'main', qty: 2 }),
      makeNomination({ id: 'n2', nomination_type: 'in_store', qty: 3 }),
      makeNomination({ id: 'n3', nomination_type: 'main', qty: 1 }),
    ]
    const result = calcTodaySummary(nominations, [], [])
    expect(result.mainNominations).toBe(3)
    expect(result.inStoreNominations).toBe(3)
  })

  it('noneタイプは指名カウントに含まれない', () => {
    const nominations = [
      makeNomination({ nomination_type: 'none', qty: 5 }),
    ]
    const result = calcTodaySummary(nominations, [], [])
    expect(result.mainNominations).toBe(0)
    expect(result.inStoreNominations).toBe(0)
  })

  it('ドリンク数を集計する', () => {
    const orders = [
      makeOrder({ quantity: 2 }),
      makeOrder({ id: 'o2', quantity: 3 }),
    ]
    const result = calcTodaySummary([], [], orders)
    expect(result.drinkCount).toBe(5)
  })

  it('指名に紐づく来店の売上のみ計上する', () => {
    const nominations = [
      makeNomination({ visit_id: 'v1' }),
    ]
    const payments = [
      makePayment({ visit_id: 'v1', total: 20000 }),
      makePayment({ id: 'p2', visit_id: 'v2', total: 30000 }), // 指名なし
    ]
    const result = calcTodaySummary(nominations, payments, [])
    expect(result.salesContribution).toBe(20000)
  })

  it('複数の指名が同じ来店に紐づく場合は重複計上しない', () => {
    const nominations = [
      makeNomination({ visit_id: 'v1' }),
      makeNomination({ id: 'n2', visit_id: 'v1', nomination_type: 'in_store' }),
    ]
    const payments = [
      makePayment({ visit_id: 'v1', total: 20000 }),
    ]
    const result = calcTodaySummary(nominations, payments, [])
    // visit_id が同じなので1回だけ計上
    expect(result.salesContribution).toBe(20000)
  })
})

// ===========================================
// calcMonthlyData
// ===========================================
describe('calcMonthlyData', () => {
  it('空データで全日ゼロの配列を返す', () => {
    const result = calcMonthlyData([], 2026, 3)
    expect(result).toHaveLength(31) // 3月は31日
    expect(result.every(d => d.mainNominations === 0 && d.inStoreNominations === 0)).toBe(true)
  })

  it('2月の日数が正しい（うるう年考慮）', () => {
    expect(calcMonthlyData([], 2028, 2)).toHaveLength(29) // うるう年
    expect(calcMonthlyData([], 2026, 2)).toHaveLength(28) // 平年
  })

  it('日別に指名を集計する', () => {
    const nominations = [
      makeNomination({ nomination_type: 'main', qty: 2, created_at: '2026-03-15T20:00:00+09:00' }),
      makeNomination({ id: 'n2', nomination_type: 'in_store', qty: 1, created_at: '2026-03-15T21:00:00+09:00' }),
      makeNomination({ id: 'n3', nomination_type: 'main', qty: 1, created_at: '2026-03-16T20:00:00+09:00' }),
    ]
    const result = calcMonthlyData(nominations, 2026, 3)
    const day15 = result.find(d => d.date === '2026-03-15')
    const day16 = result.find(d => d.date === '2026-03-16')
    expect(day15?.mainNominations).toBe(2)
    expect(day15?.inStoreNominations).toBe(1)
    expect(day16?.mainNominations).toBe(1)
  })

  it('日付順にソートされている', () => {
    const result = calcMonthlyData([], 2026, 1)
    for (let i = 1; i < result.length; i++) {
      expect(result[i].date > result[i - 1].date).toBe(true)
    }
  })
})

// ===========================================
// calcMonthlyTotals
// ===========================================
describe('calcMonthlyTotals', () => {
  it('空データでゼロを返す', () => {
    const result = calcMonthlyTotals([])
    expect(result.totalMain).toBe(0)
    expect(result.totalInStore).toBe(0)
    expect(result.activeDays).toBe(0)
  })

  it('合計と出勤日数を正しく計算する', () => {
    const dailyData: DailySummary[] = [
      { date: '2026-03-01', mainNominations: 3, inStoreNominations: 1, drinkCount: 0, salesContribution: 0 },
      { date: '2026-03-02', mainNominations: 0, inStoreNominations: 0, drinkCount: 0, salesContribution: 0 }, // 休み
      { date: '2026-03-03', mainNominations: 2, inStoreNominations: 2, drinkCount: 0, salesContribution: 0 },
    ]
    const result = calcMonthlyTotals(dailyData)
    expect(result.totalMain).toBe(5)
    expect(result.totalInStore).toBe(3)
    expect(result.activeDays).toBe(2)
  })
})

// ===========================================
// filterMemos
// ===========================================
describe('filterMemos', () => {
  const memos: CustomerMemo[] = [
    makeMemo({ id: 'm1', name: '田中太郎', features: '背が高い', memo: 'よく来る' }),
    makeMemo({ id: 'm2', name: '佐藤花子', features: 'メガネ', memo: 'お酒好き' }),
    makeMemo({ id: 'm3', name: '鈴木一郎', features: '背が高い', memo: '' }),
  ]

  it('空検索で全件返す', () => {
    expect(filterMemos(memos, '')).toHaveLength(3)
  })

  it('名前でフィルタ', () => {
    expect(filterMemos(memos, '田中')).toHaveLength(1)
    expect(filterMemos(memos, '田中')[0].name).toBe('田中太郎')
  })

  it('特徴でフィルタ', () => {
    const result = filterMemos(memos, '背が高い')
    expect(result).toHaveLength(2)
  })

  it('メモ内容でフィルタ', () => {
    expect(filterMemos(memos, 'お酒')).toHaveLength(1)
  })

  it('該当なしで空配列', () => {
    expect(filterMemos(memos, '存在しない')).toHaveLength(0)
  })
})
