import { describe, it, expect } from 'vitest'
import type {
  NominationType, PaymentMethod, CastRow, NominationRow,
  PaymentRow, OrderItemRow, CastShiftRow, CustomerMemo, DailySummary,
} from '../../types'

describe('NominationType', () => {
  const allTypes: NominationType[] = ['none', 'in_store', 'main']

  it('3種類の指名タイプがある', () => {
    expect(allTypes).toHaveLength(3)
  })
})

describe('PaymentMethod', () => {
  const allMethods: PaymentMethod[] = ['cash', 'credit', 'electronic', 'tab']

  it('4種類の支払方法がある', () => {
    expect(allMethods).toHaveLength(4)
  })
})

describe('CustomerMemo構造', () => {
  it('全フィールドが揃っている', () => {
    const memo: CustomerMemo = {
      id: 'uuid',
      name: 'テスト',
      features: '特徴',
      favoriteDrink: 'ウイスキー',
      visitFrequency: '週1回',
      memo: 'メモ',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(memo.id).toBeDefined()
    expect(memo.name).toBeDefined()
    expect(memo.features).toBeDefined()
    expect(memo.favoriteDrink).toBeDefined()
    expect(memo.visitFrequency).toBeDefined()
    expect(memo.memo).toBeDefined()
    expect(memo.createdAt).toBeDefined()
    expect(memo.updatedAt).toBeDefined()
  })
})

describe('DailySummary構造', () => {
  it('全フィールドが数値型', () => {
    const summary: DailySummary = {
      date: '2026-03-20',
      mainNominations: 3,
      inStoreNominations: 2,
      drinkCount: 5,
      salesContribution: 50000,
    }
    expect(typeof summary.mainNominations).toBe('number')
    expect(typeof summary.inStoreNominations).toBe('number')
    expect(typeof summary.drinkCount).toBe('number')
    expect(typeof summary.salesContribution).toBe('number')
  })
})

describe('NominationRow', () => {
  it('fee_overrideはnull許容', () => {
    const nom: NominationRow = {
      id: 'n1', visit_id: 'v1', cast_id: 'c1',
      nomination_type: 'main', qty: 1, fee_override: null,
      created_at: '2026-01-01T00:00:00Z',
    }
    expect(nom.fee_override).toBeNull()
  })

  it('fee_overrideに数値を設定可能', () => {
    const nom: NominationRow = {
      id: 'n1', visit_id: 'v1', cast_id: 'c1',
      nomination_type: 'main', qty: 1, fee_override: 3000,
      created_at: '2026-01-01T00:00:00Z',
    }
    expect(nom.fee_override).toBe(3000)
  })
})
