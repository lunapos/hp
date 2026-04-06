import { useState, useEffect } from 'react'
import {
  TrendingUp, Star, ChevronLeft, ChevronRight,
  Calendar, Plus, Pencil, Trash2, X, FileText, LogOut, Wine,
  MapPin, User,
} from 'lucide-react'
import { supabase, requireTenantId, requireCastId } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import {
  formatYen, toDateStr, nominationLabel,
  loadMemos as loadMemosFromStorage, saveMemos as saveMemosToStorage,
  calcTodaySummary, calcMonthlyData, calcMonthlyTotals, filterMemos,
} from '../lib/castApp'
import type { NominationRow, PaymentRow, OrderItemRow, CustomerMemo, DailySummary, CastRow } from '../types'

type Tab = 'today' | 'monthly' | 'nominations' | 'memos' | 'profile'

function loadMemos(): CustomerMemo[] { return loadMemosFromStorage(localStorage) }
function saveMemos(memos: CustomerMemo[]) { saveMemosToStorage(localStorage, memos) }

export default function CastApp() {
  const { user, signOut } = useAuth()
  const [tab, setTab] = useState<Tab>('today')

  // ヘッダー
  return (
    <div className="min-h-screen bg-[#0a0a18] text-white flex flex-col">
      <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen relative">
      <header className="bg-[#0a0a18] border-b border-[#2e2e50] px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-[10px] text-[#9090bb] tracking-[0.2em]">&#9789;</p>
          <h1 className="text-sm font-bold tracking-[0.2em] text-[#d4b870] uppercase">LUNA CAST</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#9090bb]">{user?.email}</span>
          <button onClick={signOut} className="p-2 rounded-lg text-[#9090bb] hover:text-red-400">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="flex border-b border-[#2e2e50] bg-[#0a0a18] sticky top-[57px] z-10">
        {([
          { id: 'today' as Tab, label: '今日', icon: <TrendingUp size={14} /> },
          { id: 'monthly' as Tab, label: '月次', icon: <Calendar size={14} /> },
          { id: 'nominations' as Tab, label: '指名履歴', icon: <Star size={14} /> },
          { id: 'memos' as Tab, label: 'メモ', icon: <FileText size={14} /> },
          { id: 'profile' as Tab, label: 'マイページ', icon: <User size={14} /> },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold tracking-wider border-b-2 transition-colors ${
              tab === t.id ? 'border-[#d4b870] text-[#d4b870]' : 'border-transparent text-[#9090bb]'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'today' && <TodayTab />}
        {tab === 'monthly' && <MonthlyTab />}
        {tab === 'nominations' && <NominationsTab />}
        {tab === 'memos' && <MemosTab />}
        {tab === 'profile' && <ProfileTab />}
      </div>
      </div>
    </div>
  )
}

// ========================================
// 今日の売上サマリー（2.4.2）
// ========================================
function TodayTab() {
  const [nominations, setNominations] = useState<NominationRow[]>([])
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [drinkCount, setDrinkCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchToday()
    // Realtime購読
    const channel = supabase.channel('cast-today')
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'nominations' }, () => fetchToday())
    channel.subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchToday() {
    setLoading(true)
    try {
      const tid = requireTenantId()
      const cid = requireCastId()
      const today = toDateStr(new Date())
      const dayStart = `${today}T00:00:00+09:00`
      const dayEnd = `${today}T23:59:59+09:00`

      const [nomsRes, paymentsRes, ordersRes] = await Promise.all([
        supabase.from('nominations')
          .select('id, visit_id, cast_id, nomination_type, qty, fee_override, created_at')
          .eq('tenant_id', tid).eq('cast_id', cid)
          .gte('created_at', dayStart).lte('created_at', dayEnd),
        supabase.from('payments')
          .select('id, visit_id, total, subtotal, payment_method, paid_at, nomination_fee')
          .eq('tenant_id', tid)
          .gte('paid_at', dayStart).lte('paid_at', dayEnd),
        supabase.from('order_items')
          .select('id, visit_id, menu_item_name, price, quantity, cast_id')
          .eq('tenant_id', tid).eq('cast_id', cid)
          .gte('created_at', dayStart).lte('created_at', dayEnd),
      ])

      setNominations((nomsRes.data || []) as NominationRow[])
      setPayments((paymentsRes.data || []) as PaymentRow[])
      setDrinkCount((ordersRes.data || []).reduce((s: number, o: OrderItemRow) => s + o.quantity, 0))
    } catch { /* ignore */ }
    setLoading(false)
  }

  const summary = calcTodaySummary(nominations, payments, [])
  const mainNoms = summary.mainNominations
  const inStoreNoms = summary.inStoreNominations
  const salesContribution = summary.salesContribution

  if (loading) return <div className="text-center py-20 text-[#9090bb]">読み込み中...</div>

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xs text-[#9090bb] tracking-widest uppercase">今日のサマリー</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#141430] rounded-xl p-4 border border-[#2e2e50]">
          <div className="text-xs text-[#9090bb] mb-1">本指名</div>
          <div className="text-2xl font-bold text-[#d4b870]">{mainNoms}件</div>
        </div>
        <div className="bg-[#141430] rounded-xl p-4 border border-[#2e2e50]">
          <div className="text-xs text-[#9090bb] mb-1">場内指名</div>
          <div className="text-2xl font-bold text-white">{inStoreNoms}件</div>
        </div>
        <div className="bg-[#141430] rounded-xl p-4 border border-[#2e2e50]">
          <div className="text-xs text-[#9090bb] mb-1">ドリンク数</div>
          <div className="text-2xl font-bold text-white flex items-center gap-1">
            <Wine size={18} className="text-[#9090bb]" />{drinkCount}杯
          </div>
        </div>
        <div className="bg-[#141430] rounded-xl p-4 border border-[#2e2e50]">
          <div className="text-xs text-[#9090bb] mb-1">売上貢献</div>
          <div className="text-2xl font-bold text-[#d4b870]">{formatYen(salesContribution)}</div>
        </div>
      </div>

      {nominations.length === 0 && (
        <div className="text-center py-10 text-[#3a3a5e] text-sm">今日のデータはまだありません</div>
      )}
    </div>
  )
}

// ========================================
// 月次売上推移（2.4.3）
// ========================================
interface ShiftRow {
  clock_in: string
  clock_out: string | null
}

function MonthlyTab() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [dailyData, setDailyData] = useState<DailySummary[]>([])
  const [shifts, setShifts] = useState<ShiftRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMonthly() }, [selectedMonth])

  async function fetchMonthly() {
    setLoading(true)
    try {
      const tid = requireTenantId()
      const cid = requireCastId()
      const [year, month] = selectedMonth.split('-').map(Number)
      const daysInMonth = new Date(year, month, 0).getDate()
      const monthStart = `${selectedMonth}-01T00:00:00+09:00`
      const monthEnd = `${selectedMonth}-${String(daysInMonth).padStart(2, '0')}T23:59:59+09:00`

      const [nomsRes, shiftsRes] = await Promise.all([
        supabase.from('nominations')
          .select('id, visit_id, cast_id, nomination_type, qty, fee_override, created_at')
          .eq('tenant_id', tid).eq('cast_id', cid)
          .gte('created_at', monthStart).lte('created_at', monthEnd),
        supabase.from('cast_shifts')
          .select('clock_in, clock_out')
          .eq('tenant_id', tid).eq('cast_id', cid)
          .gte('clock_in', monthStart).lte('clock_in', monthEnd),
      ])

      setDailyData(calcMonthlyData((nomsRes.data || []) as NominationRow[], year, month))
      setShifts((shiftsRes.data || []) as ShiftRow[])
    } catch { /* ignore */ }
    setLoading(false)
  }

  function shiftMonth(offset: number) {
    const [y, m] = selectedMonth.split('-').map(Number)
    const d = new Date(y, m - 1 + offset, 1)
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const { totalMain, totalInStore, activeDays } = calcMonthlyTotals(dailyData)

  // 出勤時間合計（clock_outがあるシフトのみ）
  const totalWorkMinutes = shifts.reduce((sum, s) => {
    if (!s.clock_out) return sum
    return sum + Math.round((new Date(s.clock_out).getTime() - new Date(s.clock_in).getTime()) / 60000)
  }, 0)
  const workHours = Math.floor(totalWorkMinutes / 60)
  const workMinutes = totalWorkMinutes % 60

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => shiftMonth(-1)} className="p-2 rounded-lg bg-[#141430] border border-[#2e2e50] text-[#9090bb]">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold text-white">{selectedMonth}</span>
        <button onClick={() => shiftMonth(1)} className="p-2 rounded-lg bg-[#141430] border border-[#2e2e50] text-[#9090bb]">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 月間サマリー */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#141430] rounded-xl p-4 border border-[#2e2e50]">
          <div className="text-xs text-[#9090bb] mb-1">本指名</div>
          <div className="text-xl font-bold text-[#d4b870]">{totalMain}件</div>
        </div>
        <div className="bg-[#141430] rounded-xl p-4 border border-[#2e2e50]">
          <div className="text-xs text-[#9090bb] mb-1">場内</div>
          <div className="text-xl font-bold text-white">{totalInStore}件</div>
        </div>
        <div className="bg-[#141430] rounded-xl p-4 border border-[#2e2e50]">
          <div className="text-xs text-[#9090bb] mb-1">出勤日数</div>
          <div className="text-xl font-bold text-white">{activeDays}日</div>
        </div>
        <div className="bg-[#141430] rounded-xl p-4 border border-[#2e2e50]">
          <div className="text-xs text-[#9090bb] mb-1">出勤時間</div>
          <div className="text-xl font-bold text-white">
            {workHours}時間{workMinutes > 0 ? `${workMinutes}分` : ''}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-[#9090bb]">読み込み中...</div>
      ) : (
        <div className="bg-[#141430] rounded-xl border border-[#2e2e50] divide-y divide-[#2e2e50]">
          {dailyData.map(d => {
            const total = d.mainNominations + d.inStoreNominations
            if (total === 0) return null
            return (
              <div key={d.date} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-[#9090bb] w-28">{d.date}</span>
                <span className="text-white">本指名{d.mainNominations} / 場内{d.inStoreNominations}</span>
              </div>
            )
          })}
          {dailyData.every(d => d.mainNominations + d.inStoreNominations === 0) && (
            <div className="text-center py-10 text-[#3a3a5e] text-sm">この月のデータはありません</div>
          )}
        </div>
      )}
    </div>
  )
}

// ========================================
// 指名履歴一覧（2.4.4）
// ========================================
function NominationsTab() {
  const [nominations, setNominations] = useState<(NominationRow & { customer_name?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  useEffect(() => { fetchNominations() }, [page])

  async function fetchNominations() {
    setLoading(true)
    try {
      const tid = requireTenantId()
      const cid = requireCastId()
      const { data } = await supabase.from('nominations')
        .select('id, visit_id, cast_id, nomination_type, qty, fee_override, created_at, visits(customer_name)')
        .eq('tenant_id', tid).eq('cast_id', cid)
        .neq('nomination_type', 'none')
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      const mapped = (data || []).map((n: unknown) => {
        const row = n as NominationRow & { visits?: { customer_name?: string } }
        return {
          ...row,
          customer_name: row.visits?.customer_name,
        }
      })
      setNominations(mapped)
    } catch { /* ignore */ }
    setLoading(false)
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xs text-[#9090bb] tracking-widest uppercase">指名履歴</h2>

      {loading ? (
        <div className="text-center py-10 text-[#9090bb]">読み込み中...</div>
      ) : (
        <>
          <div className="bg-[#141430] rounded-xl border border-[#2e2e50] divide-y divide-[#2e2e50]">
            {nominations.length === 0 ? (
              <div className="text-center py-10 text-[#3a3a5e] text-sm">指名履歴がありません</div>
            ) : nominations.map(n => (
              <div key={n.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm text-white">{n.customer_name || '---'}</div>
                  <div className="text-xs text-[#9090bb]">
                    {new Date(n.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg ${
                  n.nomination_type === 'main' ? 'bg-[#d4b870]/20 text-[#d4b870]' : 'bg-purple-900/40 text-purple-300'
                }`}>
                  {nominationLabel(n.nomination_type)}
                </span>
              </div>
            ))}
          </div>

          {/* ページネーション */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-2 rounded-lg bg-[#141430] border border-[#2e2e50] text-[#9090bb] disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm text-[#9090bb]">{page + 1}ページ</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={nominations.length < PAGE_SIZE}
              className="px-3 py-2 rounded-lg bg-[#141430] border border-[#2e2e50] text-[#9090bb] disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ========================================
// マイページ（プロフィール・送り先登録）
// ========================================
function ProfileTab() {
  const [cast, setCast] = useState<CastRow | null>(null)
  const [dropOff, setDropOff] = useState('')
  const [todayDropOff, setTodayDropOff] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingDefault, setSavingDefault] = useState(false)
  const [savedDefault, setSavedDefault] = useState(false)
  const [savingToday, setSavingToday] = useState(false)
  const [savedToday, setSavedToday] = useState(false)

  useEffect(() => { fetchProfile() }, [])

  const todayStr = toDateStr(new Date())

  async function fetchProfile() {
    setLoading(true)
    try {
      const tid = requireTenantId()
      const cid = requireCastId()
      const { data } = await supabase.from('casts')
        .select('id, tenant_id, stage_name, real_name, photo_url, drop_off_location, today_drop_off_location, today_drop_off_date, is_active')
        .eq('tenant_id', tid).eq('id', cid)
        .single()
      if (data) {
        const row = data as CastRow
        setCast(row)
        setDropOff(row.drop_off_location || '')
        // 今日の日付と一致する場合のみ表示
        if (row.today_drop_off_date === todayStr) {
          setTodayDropOff(row.today_drop_off_location || '')
        }
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  async function saveDropOff() {
    if (!cast) return
    setSavingDefault(true)
    setSavedDefault(false)
    try {
      const tid = requireTenantId()
      const value = dropOff.trim()
      await supabase.from('casts')
        .update({
          drop_off_location: value || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cast.id).eq('tenant_id', tid)
      setSavedDefault(true)
      setTimeout(() => setSavedDefault(false), 2000)
    } catch { /* ignore */ }
    setSavingDefault(false)
  }

  async function saveTodayDropOff() {
    if (!cast) return
    setSavingToday(true)
    setSavedToday(false)
    try {
      const tid = requireTenantId()
      const value = todayDropOff.trim()
      await supabase.from('casts')
        .update({
          today_drop_off_location: value || null,
          today_drop_off_date: value ? todayStr : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cast.id).eq('tenant_id', tid)
      setSavedToday(true)
      setTimeout(() => setSavedToday(false), 2000)
    } catch { /* ignore */ }
    setSavingToday(false)
  }

  if (loading) return <div className="text-center py-20 text-[#9090bb]">読み込み中...</div>
  if (!cast) return <div className="text-center py-20 text-[#9090bb]">プロフィールの取得に失敗しました</div>

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xs text-[#9090bb] tracking-widest uppercase">マイページ</h2>

      {/* 基本情報 */}
      <div className="bg-[#141430] rounded-xl p-4 border border-[#2e2e50] space-y-3">
        <div className="text-xs text-[#9090bb] tracking-widest uppercase font-semibold">基本情報</div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#2e2e50] flex items-center justify-center">
            <User size={20} className="text-[#9090bb]" />
          </div>
          <div>
            <div className="text-white font-semibold">{cast.stage_name}</div>
            {cast.real_name && <div className="text-xs text-[#9090bb]">{cast.real_name}</div>}
          </div>
        </div>
      </div>

      {/* 今日の送り先 */}
      <div className="bg-[#141430] rounded-xl p-4 border border-[#d4b870]/30 space-y-3">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-[#d4b870]" />
          <span className="text-xs text-[#d4b870] tracking-widest uppercase font-semibold">今日の送り先</span>
        </div>
        <p className="text-xs text-[#9090bb]">
          いつもと違う場所に送ってほしいときだけ入力。空欄ならデフォルトが使われます
        </p>
        <input
          type="text"
          placeholder={dropOff ? `未入力 → ${dropOff}` : '最寄り駅や住所'}
          value={todayDropOff}
          onChange={e => { setTodayDropOff(e.target.value); setSavedToday(false) }}
          onKeyDown={e => { if (e.key === 'Enter') saveTodayDropOff() }}
          className="w-full bg-[#0f0f28] border border-[#d4b870]/30 rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none text-sm"
        />
        <button
          onClick={saveTodayDropOff}
          disabled={savingToday}
          className="w-full py-3 rounded-xl bg-[#d4b870] text-black font-bold disabled:opacity-50"
        >
          {savingToday ? '保存中...' : savedToday ? '✓ 保存しました' : '保存'}
        </button>
      </div>

      {/* デフォルト送り先 */}
      <div className="bg-[#141430] rounded-xl p-4 border border-[#2e2e50] space-y-3">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-[#9090bb]" />
          <span className="text-xs text-[#9090bb] tracking-widest uppercase font-semibold">デフォルト送り先</span>
        </div>
        <p className="text-xs text-[#9090bb]">
          毎回使う送り先。POS に自動で表示されます
        </p>
        <input
          type="text"
          placeholder="最寄り駅や住所（例: 渋谷駅）"
          value={dropOff}
          onChange={e => { setDropOff(e.target.value); setSavedDefault(false) }}
          onKeyDown={e => { if (e.key === 'Enter') saveDropOff() }}
          className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none text-sm"
        />
        <button
          onClick={saveDropOff}
          disabled={savingDefault}
          className="w-full py-3 rounded-xl bg-[#d4b870] text-black font-bold disabled:opacity-50"
        >
          {savingDefault ? '保存中...' : savedDefault ? '✓ 保存しました' : '保存'}
        </button>
      </div>
    </div>
  )
}

// ========================================
// 個人メモモード（2.4.5）
// ========================================
function MemosTab() {
  const [memos, setMemos] = useState<CustomerMemo[]>(loadMemos)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', features: '', favoriteDrink: '', visitFrequency: '', memo: '' })
  const [search, setSearch] = useState('')

  function save() {
    if (!form.name.trim()) return
    const now = new Date().toISOString()
    let updated: CustomerMemo[]
    if (editingId) {
      updated = memos.map(m => m.id === editingId ? {
        ...m, ...form, name: form.name.trim(), updatedAt: now,
      } : m)
    } else {
      const newMemo: CustomerMemo = {
        id: crypto.randomUUID(),
        ...form,
        name: form.name.trim(),
        createdAt: now,
        updatedAt: now,
      }
      updated = [newMemo, ...memos]
    }
    setMemos(updated)
    saveMemos(updated)
    setShowForm(false)
    setEditingId(null)
    setForm({ name: '', features: '', favoriteDrink: '', visitFrequency: '', memo: '' })
  }

  function deleteMemo(id: string) {
    if (!confirm('このメモを削除しますか？')) return
    const updated = memos.filter(m => m.id !== id)
    setMemos(updated)
    saveMemos(updated)
  }

  const filtered = filterMemos(memos, search)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs text-[#9090bb] tracking-widest uppercase">顧客メモ</h2>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', features: '', favoriteDrink: '', visitFrequency: '', memo: '' }) }}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#d4b870] text-black text-xs font-bold">
          <Plus size={14} />追加
        </button>
      </div>

      {/* 検索 */}
      <input
        type="text"
        placeholder="名前・特徴で検索"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-[#141430] border border-[#2e2e50] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#3a3a5e] outline-none"
      />

      {/* フォーム */}
      {showForm && (
        <div className="bg-[#141430] border border-[#2e2e50] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#d4b870] tracking-widest uppercase font-semibold">
              {editingId ? 'メモ編集' : '新規メモ'}
            </span>
            <button onClick={() => { setShowForm(false); setEditingId(null) }} className="text-[#9090bb]"><X size={16} /></button>
          </div>
          <input type="text" placeholder="お名前 *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none text-sm" />
          <input type="text" placeholder="特徴（見た目・性格など）" value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
            className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none text-sm" />
          <input type="text" placeholder="好みのドリンク" value={form.favoriteDrink} onChange={e => setForm(f => ({ ...f, favoriteDrink: e.target.value }))}
            className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none text-sm" />
          <input type="text" placeholder="来店頻度（例: 週1回）" value={form.visitFrequency} onChange={e => setForm(f => ({ ...f, visitFrequency: e.target.value }))}
            className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none text-sm" />
          <textarea placeholder="メモ（自由記述）" value={form.memo} onChange={e => setForm(f => ({ ...f, memo: e.target.value }))} rows={3}
            className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none text-sm resize-none" />
          <button onClick={save} disabled={!form.name.trim()}
            className="w-full py-3 rounded-xl bg-[#d4b870] text-black font-bold disabled:opacity-30">
            {editingId ? '更新' : '保存'}
          </button>
        </div>
      )}

      {/* メモ一覧 */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-[#3a3a5e] text-sm">
            {memos.length === 0 ? 'メモを追加してお客様の情報を記録しましょう' : '該当するメモがありません'}
          </div>
        ) : filtered.map(m => (
          <div key={m.id} className="bg-[#141430] border border-[#2e2e50] rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-white font-semibold">{m.name}</div>
                <div className="text-[10px] text-[#9090bb] mt-0.5">
                  {new Date(m.updatedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })} 更新
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => {
                  setEditingId(m.id)
                  setForm({ name: m.name, features: m.features, favoriteDrink: m.favoriteDrink, visitFrequency: m.visitFrequency, memo: m.memo })
                  setShowForm(true)
                }} className="p-1.5 rounded-lg text-[#9090bb] hover:text-[#d4b870]"><Pencil size={14} /></button>
                <button onClick={() => deleteMemo(m.id)} className="p-1.5 rounded-lg text-[#9090bb] hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
            {m.features && <div className="text-xs text-[#9090bb] mb-1">特徴: {m.features}</div>}
            {m.favoriteDrink && <div className="text-xs text-[#9090bb] mb-1">好みのドリンク: {m.favoriteDrink}</div>}
            {m.visitFrequency && <div className="text-xs text-[#9090bb] mb-1">来店頻度: {m.visitFrequency}</div>}
            {m.memo && <div className="text-xs text-white mt-2 bg-[#0f0f28] rounded-lg p-3">{m.memo}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
