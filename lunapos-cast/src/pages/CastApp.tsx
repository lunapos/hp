import { useState, useEffect, useRef, useCallback } from 'react'
import {
  TrendingUp, Star, ChevronLeft, ChevronRight,
  Calendar, LogOut, Wine,
  MapPin, User, Check,
} from 'lucide-react'
import { supabase, requireTenantId, requireCastId } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import {
  formatYen, toDateStr, nominationLabel,
  calcTodaySummary, calcMonthlyData, calcMonthlyTotals,
} from '../lib/castApp'
import type { NominationRow, PaymentRow, OrderItemRow, DailySummary, CastRow } from '../types'

type Tab = 'today' | 'monthly' | 'nominations' | 'profile'

// ========================================
// ルート
// ========================================
export default function CastApp() {
  const { signOut } = useAuth()
  const [tab, setTab] = useState<Tab>('today')

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'today',       label: '今日',     icon: <TrendingUp size={20} /> },
    { id: 'monthly',     label: '月次',     icon: <Calendar size={20} /> },
    { id: 'nominations', label: '指名',     icon: <Star size={20} /> },
    { id: 'profile',     label: 'マイページ', icon: <User size={20} /> },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a18] text-white flex flex-col">
      <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen">

        {/* ヘッダー */}
        <header className="bg-[#0d0d20] border-b border-[#2e2e50] px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg text-[#d4b870]">&#9789;</span>
            <span className="text-base font-bold tracking-[0.15em] text-[#d4b870] uppercase">Luna Cast</span>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[#9090bb] active:bg-[#1a1a35]"
            aria-label="ログアウト"
          >
            <LogOut size={18} />
            <span className="text-xs">ログアウト</span>
          </button>
        </header>

        {/* コンテンツ */}
        <main className="flex-1 overflow-y-auto pb-24">
          {tab === 'today'       && <TodayTab />}
          {tab === 'monthly'     && <MonthlyTab />}
          {tab === 'nominations' && <NominationsTab />}
          {tab === 'profile'     && <ProfileTab />}
        </main>

        {/* ボトムナビ（親指圏） */}
        <nav className="fixed bottom-0 left-0 right-0 z-20 bg-[#0d0d20] border-t border-[#2e2e50]">
          <div className="w-full max-w-[480px] mx-auto flex">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors active:bg-[#1a1a35] ${
                  tab === t.id ? 'text-[#d4b870]' : 'text-[#555580]'
                }`}
              >
                {t.icon}
                <span className="text-[10px] font-medium">{t.label}</span>
                {tab === t.id && <span className="absolute bottom-0 w-6 h-0.5 bg-[#d4b870] rounded-t-full" />}
              </button>
            ))}
          </div>
        </nav>

      </div>
    </div>
  )
}

// ========================================
// 今日タブ
// ========================================
function TodayTab() {
  const [nominations, setNominations] = useState<NominationRow[]>([])
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [drinkCount, setDrinkCount] = useState(0)
  const [stageName, setStageName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchToday()
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
      const dayEnd   = `${today}T23:59:59+09:00`

      const [nomsRes, paymentsRes, ordersRes, castRes] = await Promise.all([
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
        supabase.from('casts')
          .select('stage_name')
          .eq('tenant_id', tid).eq('id', cid)
          .single(),
      ])

      setNominations((nomsRes.data || []) as NominationRow[])
      setPayments((paymentsRes.data || []) as PaymentRow[])
      setDrinkCount((ordersRes.data || []).reduce((s: number, o: OrderItemRow) => s + o.quantity, 0))
      if (castRes.data) setStageName(castRes.data.stage_name)
    } catch { /* ignore */ }
    setLoading(false)
  }

  const summary = calcTodaySummary(nominations, payments, [])

  if (loading) return <Loading />

  const today = new Date()
  const dateLabel = today.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })

  return (
    <div className="px-4 pt-5 pb-4 space-y-5">
      <div>
        <p className="text-xs text-[#9090bb] mb-0.5">{dateLabel}</p>
        <h2 className="text-lg font-bold text-white">今日のサマリー</h2>
        {stageName && <p className="text-sm text-[#d4b870] mt-0.5">{stageName}</p>}
      </div>

      {/* メイン：売上貢献 */}
      <div className="bg-gradient-to-br from-[#1a1428] to-[#141030] rounded-2xl p-5 border border-[#d4b870]/20">
        <p className="text-sm text-[#9090bb] mb-1">売上貢献</p>
        <p className="text-4xl font-bold text-[#d4b870]">{formatYen(summary.salesContribution)}</p>
      </div>

      {/* サブ3カード */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="本指名" value={`${summary.mainNominations}件`} gold />
        <StatCard label="場内指名" value={`${summary.inStoreNominations}件`} />
        <StatCard
          label="ドリンク"
          value={
            <span className="flex items-center gap-1">
              <Wine size={16} className="text-[#9090bb]" />{drinkCount}杯
            </span>
          }
        />
      </div>

      {nominations.length === 0 && (
        <p className="text-center py-8 text-[#3a3a5e] text-sm">今日のデータはまだありません</p>
      )}
    </div>
  )
}

// ========================================
// 月次タブ
// ========================================
interface ShiftRow { clock_in: string; clock_out: string | null }

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
      const monthEnd   = `${selectedMonth}-${String(daysInMonth).padStart(2, '0')}T23:59:59+09:00`

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

  function changeMonth(offset: number) {
    const [y, m] = selectedMonth.split('-').map(Number)
    const d = new Date(y, m - 1 + offset, 1)
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const { totalMain, totalInStore, activeDays } = calcMonthlyTotals(dailyData)

  const totalWorkMinutes = shifts.reduce((sum, s) => {
    if (!s.clock_out) return sum
    return sum + Math.round((new Date(s.clock_out).getTime() - new Date(s.clock_in).getTime()) / 60000)
  }, 0)
  const workHours   = Math.floor(totalWorkMinutes / 60)
  const workMinutes = totalWorkMinutes % 60
  const workLabel   = workHours > 0
    ? `${workHours}h${workMinutes > 0 ? `${workMinutes}m` : ''}`
    : workMinutes > 0 ? `${workMinutes}m` : '—'

  // 表示用月ラベル
  const [y, m] = selectedMonth.split('-').map(Number)
  const monthLabel = `${y}年${m}月`

  return (
    <div className="px-4 pt-5 pb-4 space-y-5">
      {/* 月選択 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => changeMonth(-1)}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#141430] border border-[#2e2e50] text-[#9090bb] active:bg-[#1e1e45]"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-base font-bold text-white">{monthLabel}</h2>
        <button
          onClick={() => changeMonth(1)}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#141430] border border-[#2e2e50] text-[#9090bb] active:bg-[#1e1e45]"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="本指名" value={`${totalMain}件`} gold />
        <StatCard label="場内指名" value={`${totalInStore}件`} />
        <StatCard label="出勤日数" value={`${activeDays}日`} />
        <StatCard label="出勤時間" value={workLabel} />
      </div>

      {/* 日別リスト */}
      {loading ? <Loading /> : (
        <div className="bg-[#141430] rounded-2xl border border-[#2e2e50] overflow-hidden">
          {dailyData.filter(d => d.mainNominations + d.inStoreNominations > 0).length === 0 ? (
            <p className="text-center py-10 text-[#3a3a5e] text-sm">この月のデータはありません</p>
          ) : dailyData.map(d => {
            if (d.mainNominations + d.inStoreNominations === 0) return null
            const date = new Date(d.date)
            const dayLabel = date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })
            return (
              <div key={d.date} className="flex items-center justify-between px-4 py-3.5 border-b border-[#2e2e50] last:border-0">
                <span className="text-sm text-[#9090bb]">{dayLabel}</span>
                <div className="flex gap-3 text-sm">
                  {d.mainNominations > 0 && (
                    <span className="text-[#d4b870] font-medium">本{d.mainNominations}</span>
                  )}
                  {d.inStoreNominations > 0 && (
                    <span className="text-white">場内{d.inStoreNominations}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ========================================
// 指名履歴タブ（無限スクロール）
// ========================================
function NominationsTab() {
  const [nominations, setNominations] = useState<(NominationRow & { customer_name?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 20
  const offsetRef = useRef(0)
  const observerRef = useRef<HTMLDivElement>(null)

  const fetchNominations = useCallback(async (reset = false) => {
    if (reset) { setLoading(true); offsetRef.current = 0 }
    else setLoadingMore(true)
    try {
      const tid = requireTenantId()
      const cid = requireCastId()
      const offset = offsetRef.current
      const { data } = await supabase.from('nominations')
        .select('id, visit_id, cast_id, nomination_type, qty, fee_override, created_at, visits(customer_name)')
        .eq('tenant_id', tid).eq('cast_id', cid)
        .neq('nomination_type', 'none')
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

      const mapped = (data || []).map((n: unknown) => {
        const row = n as NominationRow & { visits?: { customer_name?: string } }
        return { ...row, customer_name: row.visits?.customer_name }
      })
      if (reset) setNominations(mapped)
      else setNominations(prev => [...prev, ...mapped])
      setHasMore(mapped.length === PAGE_SIZE)
      offsetRef.current = offset + mapped.length
    } catch { /* ignore */ }
    if (reset) setLoading(false)
    else setLoadingMore(false)
  }, [])

  useEffect(() => { fetchNominations(true) }, [fetchNominations])

  // 無限スクロール
  useEffect(() => {
    if (!observerRef.current) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) fetchNominations()
    }, { threshold: 0.1 })
    obs.observe(observerRef.current)
    return () => obs.disconnect()
  }, [hasMore, loadingMore, fetchNominations])

  if (loading) return <Loading />

  return (
    <div className="px-4 pt-5 pb-4 space-y-4">
      <h2 className="text-lg font-bold text-white">指名履歴</h2>

      {nominations.length === 0 ? (
        <p className="text-center py-16 text-[#3a3a5e] text-sm">指名履歴がありません</p>
      ) : (
        <div className="bg-[#141430] rounded-2xl border border-[#2e2e50] overflow-hidden">
          {nominations.map(n => (
            <div key={n.id} className="flex items-center justify-between px-4 py-4 border-b border-[#2e2e50] last:border-0 active:bg-[#1a1a40]">
              <div>
                <p className="text-base text-white font-medium">{n.customer_name || '---'}</p>
                <p className="text-xs text-[#9090bb] mt-0.5">
                  {new Date(n.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                n.nomination_type === 'main'
                  ? 'bg-[#d4b870]/15 text-[#d4b870]'
                  : 'bg-purple-900/30 text-purple-300'
              }`}>
                {nominationLabel(n.nomination_type)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 無限スクロールのトリガー */}
      <div ref={observerRef} className="h-4" />
      {loadingMore && <p className="text-center text-xs text-[#9090bb] py-2">読み込み中...</p>}
      {!hasMore && nominations.length > 0 && (
        <p className="text-center text-xs text-[#3a3a5e] py-2">すべて表示しました</p>
      )}
    </div>
  )
}

// ========================================
// マイページタブ
// ========================================
function ProfileTab() {
  const [cast, setCast] = useState<CastRow | null>(null)
  const [enableDropOff, setEnableDropOff] = useState(true)
  const [dropOff, setDropOff] = useState('')
  const [todayDropOff, setTodayDropOff] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingDefault, setSavingDefault] = useState(false)
  const [savedDefault, setSavedDefault] = useState(false)
  const [savingToday, setSavingToday] = useState(false)
  const [savedToday, setSavedToday] = useState(false)
  // パスワード変更
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  const [savedPw, setSavedPw] = useState(false)
  const [pwError, setPwError] = useState('')

  useEffect(() => { fetchProfile() }, [])

  const todayStr = toDateStr(new Date())

  async function fetchProfile() {
    setLoading(true)
    try {
      const tid = requireTenantId()
      const cid = requireCastId()
      const [castRes, storeRes] = await Promise.all([
        supabase.from('casts')
          .select('id, tenant_id, stage_name, real_name, photo_url, drop_off_location, today_drop_off_location, today_drop_off_date, is_active')
          .eq('tenant_id', tid).eq('id', cid)
          .single(),
        supabase.from('stores')
          .select('enable_drop_off')
          .eq('id', tid)
          .single(),
      ])
      if (castRes.data) {
        const row = castRes.data as CastRow
        setCast(row)
        setDropOff(row.drop_off_location || '')
        if (row.today_drop_off_date === todayStr) {
          setTodayDropOff(row.today_drop_off_location || '')
        }
      }
      if (storeRes.data) {
        setEnableDropOff(storeRes.data.enable_drop_off ?? true)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  async function saveDropOff() {
    if (!cast) return
    setSavingDefault(true); setSavedDefault(false)
    try {
      const tid = requireTenantId()
      await supabase.from('casts')
        .update({ drop_off_location: dropOff.trim() || null, updated_at: new Date().toISOString() })
        .eq('id', cast.id).eq('tenant_id', tid)
      setSavedDefault(true)
      setTimeout(() => setSavedDefault(false), 2000)
    } catch { /* ignore */ }
    setSavingDefault(false)
  }

  async function saveTodayDropOff() {
    if (!cast) return
    setSavingToday(true); setSavedToday(false)
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

  async function savePassword() {
    setPwError('')
    if (newPassword.length < 6) { setPwError('6文字以上で入力してください'); return }
    if (newPassword !== confirmPassword) { setPwError('パスワードが一致しません'); return }
    setSavingPw(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setPwError(error.message); setSavingPw(false); return }
    setSavedPw(true)
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setSavedPw(false), 2000)
    setSavingPw(false)
  }

  if (loading) return <Loading />
  if (!cast) return <p className="text-center py-20 text-[#9090bb]">プロフィールの取得に失敗しました</p>

  return (
    <div className="px-4 pt-5 pb-4 space-y-5">
      {/* プロフィールカード */}
      <div className="bg-[#141430] rounded-2xl p-5 border border-[#2e2e50] flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#2e2e50] flex items-center justify-center shrink-0">
          <User size={24} className="text-[#9090bb]" />
        </div>
        <div>
          <p className="text-xl font-bold text-white">{cast.stage_name}</p>
          {cast.real_name && <p className="text-sm text-[#9090bb] mt-0.5">{cast.real_name}</p>}
        </div>
      </div>

      {/* 今日の送り先 */}
      {enableDropOff && (
        <div className="bg-[#141430] rounded-2xl p-5 border border-[#d4b870]/25 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#d4b870]" />
            <span className="text-sm font-semibold text-[#d4b870]">今日の送り先</span>
          </div>
          <p className="text-xs text-[#9090bb] leading-relaxed">
            いつもと違う場所のときだけ入力。空欄ならデフォルトが使われます
          </p>
          <input
            type="text"
            inputMode="text"
            placeholder={dropOff ? `空欄 → ${dropOff}` : '最寄り駅や住所'}
            value={todayDropOff}
            onChange={e => { setTodayDropOff(e.target.value); setSavedToday(false) }}
            onKeyDown={e => { if (e.key === 'Enter') saveTodayDropOff() }}
            className="w-full bg-[#0f0f28] border border-[#d4b870]/25 rounded-xl px-4 py-3.5 text-white placeholder-[#3a3a5e] outline-none text-base"
          />
          <SaveButton loading={savingToday} saved={savedToday} onClick={saveTodayDropOff} />
        </div>
      )}

      {/* デフォルト送り先 */}
      {enableDropOff && (
        <div className="bg-[#141430] rounded-2xl p-5 border border-[#2e2e50] space-y-4">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#9090bb]" />
            <span className="text-sm font-semibold text-[#9090bb]">デフォルト送り先</span>
          </div>
          <p className="text-xs text-[#9090bb] leading-relaxed">
            毎回使う送り先。POS に自動で表示されます
          </p>
          <input
            type="text"
            inputMode="text"
            placeholder="最寄り駅や住所（例: 渋谷駅）"
            value={dropOff}
            onChange={e => { setDropOff(e.target.value); setSavedDefault(false) }}
            onKeyDown={e => { if (e.key === 'Enter') saveDropOff() }}
            className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3.5 text-white placeholder-[#3a3a5e] outline-none text-base"
          />
          <SaveButton loading={savingDefault} saved={savedDefault} onClick={saveDropOff} />
        </div>
      )}

      {/* パスワード変更 */}
      <div className="bg-[#141430] rounded-2xl p-5 border border-[#2e2e50] space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#9090bb]">パスワード変更</span>
        </div>
        <input
          type="password"
          inputMode="text"
          placeholder="新しいパスワード（6文字以上）"
          value={newPassword}
          onChange={e => { setNewPassword(e.target.value); setSavedPw(false); setPwError('') }}
          className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3.5 text-white placeholder-[#3a3a5e] outline-none text-base"
        />
        <input
          type="password"
          inputMode="text"
          placeholder="もう一度入力"
          value={confirmPassword}
          onChange={e => { setConfirmPassword(e.target.value); setSavedPw(false); setPwError('') }}
          onKeyDown={e => { if (e.key === 'Enter') savePassword() }}
          className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3.5 text-white placeholder-[#3a3a5e] outline-none text-base"
        />
        {pwError && <p className="text-xs text-red-400">{pwError}</p>}
        <SaveButton loading={savingPw} saved={savedPw} onClick={savePassword} />
      </div>
    </div>
  )
}


// ========================================
// 共通コンポーネント
// ========================================

function StatCard({ label, value, gold = false }: {
  label: string
  value: React.ReactNode
  gold?: boolean
}) {
  return (
    <div className="bg-[#141430] rounded-2xl p-4 border border-[#2e2e50]">
      <p className="text-xs text-[#9090bb] mb-1.5">{label}</p>
      <div className={`text-xl font-bold ${gold ? 'text-[#d4b870]' : 'text-white'}`}>{value}</div>
    </div>
  )
}

function SaveButton({ loading, saved, onClick }: { loading: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full py-4 rounded-2xl font-bold text-base transition-colors active:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2 ${
        saved ? 'bg-green-700 text-white' : 'bg-[#d4b870] text-black'
      }`}
    >
      {loading ? '保存中...' : saved ? <><Check size={18} />保存しました</> : '保存する'}
    </button>
  )
}


function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-[#9090bb] text-sm">読み込み中...</p>
    </div>
  )
}
