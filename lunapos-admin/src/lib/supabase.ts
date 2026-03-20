import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mkzhepsntwnbtgfazflw.supabase.co'
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// テナントID（認証後にユーザーメタデータから取得）
let tenantId: string | null = null

export function setTenantId(id: string) {
  tenantId = id
}

export function getTenantId(): string | null {
  return tenantId
}

// テナントID必須の関数（未設定時はthrow）
export function requireTenantId(): string {
  if (!tenantId) throw new Error('テナントIDが未設定です')
  return tenantId
}
