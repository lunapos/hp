import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
    channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })),
    removeChannel: vi.fn(),
  }),
}))

describe('テナントID管理', () => {
  beforeEach(async () => {
    vi.resetModules()
  })

  it('setTenantIdで設定した値を取得できる', async () => {
    const { setTenantId, getTenantId } = await import('../supabase')
    setTenantId('test-id')
    expect(getTenantId()).toBe('test-id')
  })

  it('requireTenantIdが設定済みの値を返す', async () => {
    const { setTenantId, requireTenantId } = await import('../supabase')
    setTenantId('t-123')
    expect(requireTenantId()).toBe('t-123')
  })
})

describe('キャストID管理', () => {
  beforeEach(async () => {
    vi.resetModules()
  })

  it('setCastIdで設定した値を取得できる', async () => {
    const { setCastId, getCastId } = await import('../supabase')
    setCastId('cast-123')
    expect(getCastId()).toBe('cast-123')
  })

  it('requireCastIdが設定済みの値を返す', async () => {
    const { setCastId, requireCastId } = await import('../supabase')
    setCastId('c-456')
    expect(requireCastId()).toBe('c-456')
  })
})
