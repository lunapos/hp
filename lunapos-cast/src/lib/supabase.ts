import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mkzhepsntwnbtgfazflw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

let tenantId: string | null = null
let castId: string | null = null

export function setTenantId(id: string) { tenantId = id }
export function getTenantId(): string | null { return tenantId }
export function requireTenantId(): string {
  if (!tenantId) throw new Error('テナントIDが未設定です')
  return tenantId
}

export function setCastId(id: string) { castId = id }
export function getCastId(): string | null { return castId }
export function requireCastId(): string {
  if (!castId) throw new Error('キャストIDが未設定です')
  return castId
}
