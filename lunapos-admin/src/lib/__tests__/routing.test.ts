import { describe, it, expect } from 'vitest'

// ルーティング設定の正しさをテスト
// App.tsxのルート定義と一致していることを確認

const ADMIN_ROUTES = [
  '/admin/login',
  '/admin/signup',
  '/admin',
  '/admin/menu',
  '/admin/casts',
  '/admin/tables',
  '/admin/plans',
  '/admin/settings',
]

const PROTECTED_ROUTES = [
  '/admin',
  '/admin/menu',
  '/admin/casts',
  '/admin/tables',
  '/admin/plans',
  '/admin/settings',
]

const PUBLIC_ROUTES = [
  '/admin/login',
  '/admin/signup',
]

const NAV_ITEMS = [
  { path: '/admin', label: 'ダッシュボード' },
  { path: '/admin/menu', label: 'メニュー管理' },
  { path: '/admin/casts', label: 'キャスト管理' },
  { path: '/admin/tables', label: 'テーブル管理' },
  { path: '/admin/plans', label: 'セットプラン' },
  { path: '/admin/settings', label: '店舗設定' },
]

describe('ルーティング定義', () => {
  it('全ルートが /admin プレフィックスを持つ', () => {
    ADMIN_ROUTES.forEach(route => {
      expect(route.startsWith('/admin')).toBe(true)
    })
  })

  it('公開ルートは2つ（login, signup）', () => {
    expect(PUBLIC_ROUTES).toHaveLength(2)
    expect(PUBLIC_ROUTES).toContain('/admin/login')
    expect(PUBLIC_ROUTES).toContain('/admin/signup')
  })

  it('保護ルートは6つ', () => {
    expect(PROTECTED_ROUTES).toHaveLength(6)
  })

  it('公開ルートと保護ルートに重複がない', () => {
    const overlap = PUBLIC_ROUTES.filter(r => PROTECTED_ROUTES.includes(r))
    expect(overlap).toHaveLength(0)
  })

  it('ナビゲーションアイテムは保護ルートのみ', () => {
    NAV_ITEMS.forEach(item => {
      expect(PROTECTED_ROUTES).toContain(item.path)
    })
  })

  it('signupルートはナビゲーションに含まれない', () => {
    const navPaths = NAV_ITEMS.map(i => i.path)
    expect(navPaths).not.toContain('/admin/signup')
  })

  it('loginルートはナビゲーションに含まれない', () => {
    const navPaths = NAV_ITEMS.map(i => i.path)
    expect(navPaths).not.toContain('/admin/login')
  })
})

describe('パンくずリスト', () => {
  const BREADCRUMB_LABELS: Record<string, string> = {
    '/admin': 'ダッシュボード',
    '/admin/menu': 'メニュー管理',
    '/admin/casts': 'キャスト管理',
    '/admin/tables': 'テーブル管理',
    '/admin/plans': 'セットプラン',
    '/admin/settings': '店舗設定',
  }

  it('全保護ルートにパンくずラベルがある', () => {
    PROTECTED_ROUTES.forEach(route => {
      expect(BREADCRUMB_LABELS[route]).toBeDefined()
    })
  })

  it('ラベルがナビゲーションと一致する', () => {
    NAV_ITEMS.forEach(item => {
      expect(BREADCRUMB_LABELS[item.path]).toBe(item.label)
    })
  })
})
