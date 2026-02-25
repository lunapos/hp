import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Clock, Circle, X as XIcon, TrendingUp, Trophy, Lock, Crown, Medal, Users, FileText, Shield, Trash2, Printer, Check } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import type { Cast, NominationType } from '../types'

const DEFAULT_START = '20:00'
const DEFAULT_END = '01:00'
const LOGIN_STORAGE_KEY = 'luna_cast_login'

function nominationLabel(type: NominationType): string {
  switch (type) {
    case 'main': return '本指名'
    case 'in_store': return '場内'
    default: return ''
  }
}

function nominationColor(type: NominationType): string {
  switch (type) {
    case 'main': return 'bg-[#d4b870]/20 text-[#d4b870]'
    case 'in_store': return 'bg-purple-900/40 text-purple-300'
    default: return ''
  }
}

function CastLoginScreen({ onLogin }: { onLogin: (cast: Cast) => void }) {
  const { state } = useApp()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const cast = state.casts.find(c => c.loginId === loginId && c.password === password)
    if (cast) {
      onLogin(cast)
    } else {
      setError('IDまたはパスワードが違います')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a18] text-white flex flex-col">
      <header className="bg-[#0a0a18] border-b border-[#2e2e50] px-4 py-4">
        <div className="text-center">
          <p className="text-xs text-[#9090bb] tracking-[0.2em] mb-1">☽</p>
          <h1 className="text-2xl font-bold tracking-[0.3em] text-[#d4b870]">LunaPos</h1>
          <p className="text-xs text-[#9090bb] tracking-widest mt-1">CAST</p>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className={`w-full max-w-sm space-y-5 animate-fade-in ${shake ? 'animate-[headShake_0.5s_ease-in-out]' : ''}`}>
          <div className="text-center mb-6">
            <Lock size={32} className="mx-auto text-[#d4b870] mb-3" />
            <p className="text-sm text-[#9090bb]">IDとパスワードを入力してください</p>
          </div>
          <div>
            <label className="block text-xs text-[#9090bb] mb-1.5 tracking-wider">ID</label>
            <input type="text" value={loginId} onChange={e => setLoginId(e.target.value)} autoComplete="username" autoFocus className="w-full bg-[#141430] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] focus:border-[#d4b870] focus:outline-none transition-colors" placeholder="例: airi" />
          </div>
          <div>
            <label className="block text-xs text-[#9090bb] mb-1.5 tracking-wider">パスワード</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" className="w-full bg-[#141430] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] focus:border-[#d4b870] focus:outline-none transition-colors" placeholder="パスワード" />
          </div>
          {error && <p className="text-red-400 text-sm text-center animate-fade-in">{error}</p>}
          <button type="submit" className="w-full bg-[#d4b870] text-[#0a0a18] py-3 rounded-xl font-bold text-lg tracking-wider hover:bg-[#c4a860] active:scale-[0.98] transition-all">ログイン</button>
        </form>
      </div>
    </div>
  )
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) mins += 24 * 60
  return mins / 60
}

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const startDow = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: { date: Date; inMonth: boolean }[] = []
  for (let i = 0; i < startDow; i++) days.push({ date: new Date(year, month, -startDow + i + 1), inMonth: false })
  for (let i = 1; i <= daysInMonth; i++) days.push({ date: new Date(year, month, i), inMonth: true })
  const remaining = 7 - (days.length % 7)
  if (remaining < 7) for (let i = 1; i <= remaining; i++) days.push({ date: new Date(year, month + 1, i), inMonth: false })
  return days
}

type CastTab = 'mypage' | 'shift'

function CastDashboard({ cast, onLogout }: { cast: Cast; onLogout: () => void }) {
  const { state } = useApp()
  const currentCast = state.casts.find(c => c.id === cast.id) ?? cast
  const [activeTab, setActiveTab] = useState<CastTab>('mypage')

  const today = useMemo(() => new Date(), [])
  const todayKey = useMemo(() => toDateKey(today), [today])
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth()

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }, [viewMonth])

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }, [viewMonth])

  const goToday = useCallback(() => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
  }, [today])

  return (
    <div className="min-h-screen bg-[#0a0a18] text-white flex flex-col">
      <header className="bg-[#0a0a18] border-b border-[#2e2e50] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[#9090bb] text-xs">☽</span>
            <span className="text-sm font-bold tracking-[0.15em] text-[#d4b870]">LunaPos</span>
            <span className="text-[10px] text-[#9090bb] tracking-wider">CAST</span>
          </div>
          <button onClick={onLogout} className="px-3 py-1.5 rounded-lg bg-[#141430] border border-[#2e2e50] text-[#9090bb] text-xs hover:bg-[#1e1e40] active:scale-95 transition-all">ログアウト</button>
        </div>
        <div className="flex items-center gap-3">
          {currentCast.photo ? (
            <img src={currentCast.photo} alt={currentCast.stageName} className="w-10 h-10 rounded-full object-cover border border-[#2e2e50]" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#141430] border border-[#2e2e50] flex items-center justify-center text-[#9090bb] font-semibold">{currentCast.stageName.charAt(0)}</div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wider">{currentCast.stageName}</span>
              {currentCast.isWorking && (
                <span className="text-[10px] bg-emerald-900/50 text-emerald-400 px-1.5 py-0.5 rounded-full font-medium">出勤中</span>
              )}
            </div>
            {currentCast.hourlyRate != null && (
              <div className="text-xs text-[#9090bb]">時給 ¥{currentCast.hourlyRate.toLocaleString()}</div>
            )}
          </div>
        </div>
      </header>

      <div className="bg-[#0a0a18] border-b border-[#2e2e50] flex">
        {(['mypage', 'shift'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-bold tracking-wider text-center transition-colors relative ${
              activeTab === tab ? 'text-[#d4b870]' : 'text-[#9090bb]'
            }`}
          >
            {tab === 'mypage' ? 'マイページ' : 'シフト提出'}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#d4b870] rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'mypage' && (
          <MyPageTab
            castId={currentCast.id}
            viewYear={viewYear}
            viewMonth={viewMonth}
            monthPrefix={monthPrefix}
            todayKey={todayKey}
            isCurrentMonth={isCurrentMonth}
            prevMonth={prevMonth}
            nextMonth={nextMonth}
            goToday={goToday}
          />
        )}
        {activeTab === 'shift' && (
          <ShiftSubmitTab
            castId={currentCast.id}
            viewYear={viewYear}
            viewMonth={viewMonth}
            monthPrefix={monthPrefix}
            todayKey={todayKey}
            isCurrentMonth={isCurrentMonth}
            prevMonth={prevMonth}
            nextMonth={nextMonth}
            goToday={goToday}
          />
        )}
      </div>
    </div>
  )
}

interface TabProps {
  castId: string
  viewYear: number
  viewMonth: number
  monthPrefix: string
  todayKey: string
  isCurrentMonth: boolean
  prevMonth: () => void
  nextMonth: () => void
  goToday: () => void
}

function RankingSection({ castId }: { castId: string }) {
  const { state } = useApp()

  const todayKey = useMemo(() => toDateKey(new Date()), [])

  const ranking = useMemo(() => {
    const todayStart = new Date(todayKey + 'T00:00:00')
    const salesByCast = new Map<string, number>()
    state.casts.forEach(c => salesByCast.set(c.id, 0))

    state.visits.forEach(visit => {
      if (new Date(visit.checkInTime) < todayStart) return
      const payment = state.payments.find(p => p.visitId === visit.id)
      const amount = payment ? payment.total : visit.orderItems.reduce((s, i) => s + i.price * i.quantity, 0)
      visit.nominations.forEach(n => {
        salesByCast.set(n.castId, (salesByCast.get(n.castId) ?? 0) + amount)
      })
    })

    return state.casts
      .map(c => ({ id: c.id, name: c.stageName, photo: c.photo, total: salesByCast.get(c.id) ?? 0 }))
      .sort((a, b) => b.total - a.total)
  }, [state.visits, state.payments, state.casts, todayKey])

  const myRank = ranking.findIndex(r => r.id === castId) + 1

  const maxSales = ranking.length > 0 ? ranking[0].total : 1
  const barColors = ['bg-[#d4b870]', 'bg-[#a0a0b0]', 'bg-[#b07040]']

  function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) return <Crown size={14} className="text-[#d4b870]" />
    if (rank === 2) return <Medal size={14} className="text-[#a0a0b0]" />
    if (rank === 3) return <Medal size={14} className="text-[#b07040]" />
    return <span className="w-3.5 text-center font-bold text-xs text-[#9090bb]">{rank}</span>
  }

  return (
    <div className="bg-[#141430] border border-[#2e2e50] rounded-xl p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-[#9090bb] tracking-widest uppercase flex items-center gap-1">
          <Trophy size={11} className="text-[#d4b870]" />本日ランキング
        </h2>
        <span className="text-[#d4b870] font-bold text-sm">あなたは {myRank}位</span>
      </div>
      <div className="space-y-3">
        {ranking.map((r, i) => {
          const isMe = r.id === castId
          const pct = maxSales > 0 ? (r.total / maxSales) * 100 : 0
          const barColor = isMe ? 'bg-[#d4b870]' : barColors[i] ?? 'bg-[#3a3a5e]'

          return (
            <div key={r.id} className={`${isMe ? 'bg-[#d4b870]/5 rounded-lg p-2 -mx-2' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 flex justify-center"><RankBadge rank={i + 1} /></div>
                {r.photo ? (
                  <img src={r.photo} alt="" className="w-6 h-6 rounded-full object-cover border border-[#2e2e50]" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#0f0f28] border border-[#2e2e50] flex items-center justify-center text-[#9090bb] text-[10px] font-semibold">{r.name.charAt(0)}</div>
                )}
                <span className={`flex-1 text-sm ${isMe ? 'text-[#d4b870] font-bold' : 'text-white'}`}>{r.name}</span>
                <span className={`text-sm font-bold shrink-0 ${isMe ? 'text-[#d4b870]' : 'text-white'}`}>¥{r.total.toLocaleString()}</span>
              </div>
              <div className="ml-7 h-3 bg-[#0a0a18] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${barColor} ${isMe ? 'opacity-100' : 'opacity-60'}`}
                  style={{ width: `${Math.max(pct, r.total > 0 ? 2 : 0)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MonthNav({ viewYear, viewMonth, isCurrentMonth, prevMonth, nextMonth, goToday }: {
  viewYear: number; viewMonth: number; isCurrentMonth: boolean; prevMonth: () => void; nextMonth: () => void; goToday: () => void
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <button onClick={prevMonth} className="p-2 hover:bg-[#1e1e40] rounded-lg transition-colors active:scale-90"><ChevronLeft size={18} className="text-[#9090bb]" /></button>
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold tracking-wider">{viewYear}年 {viewMonth + 1}月</h2>
        {!isCurrentMonth && (
          <button onClick={goToday} className="text-[10px] text-[#d4b870] border border-[#d4b870]/30 rounded-full px-2 py-0.5 hover:bg-[#d4b870]/10 transition-colors">
            今月
          </button>
        )}
      </div>
      <button onClick={nextMonth} className="p-2 hover:bg-[#1e1e40] rounded-lg transition-colors active:scale-90"><ChevronRight size={18} className="text-[#9090bb]" /></button>
    </div>
  )
}

function MyPageTab({ castId, viewYear, viewMonth, monthPrefix, todayKey, isCurrentMonth, prevMonth, nextMonth, goToday }: TabProps) {
  const { state } = useApp()

  const myVisitsToday = useMemo(() => {
    const todayStart = new Date(todayKey + 'T00:00:00')
    return state.visits.filter(v => v.nominations.some(n => n.castId === castId) && new Date(v.checkInTime) >= todayStart)
  }, [state.visits, castId, todayKey])

  const mainNominations = useMemo(() =>
    myVisitsToday.filter(v => v.nominations.some(n => n.castId === castId && n.nominationType === 'main')).length,
    [myVisitsToday, castId],
  )

  const inStoreNominations = useMemo(() =>
    myVisitsToday.filter(v => v.nominations.some(n => n.castId === castId && n.nominationType === 'in_store')).length,
    [myVisitsToday, castId],
  )

  const douhan = useMemo(() =>
    state.visits.filter(v => v.douhanCastId === castId && new Date(v.checkInTime) >= new Date(todayKey + 'T00:00:00')).length,
    [state.visits, castId, todayKey],
  )

  const tableSales = useMemo(() =>
    myVisitsToday.map(visit => {
      const table = state.tables.find(t => t.id === visit.tableId)
      const payment = state.payments.find(p => p.visitId === visit.id)
      const amount = payment ? payment.total : visit.orderItems.reduce((s, i) => s + i.price * i.quantity, 0)
      const nomination = visit.nominations.find(n => n.castId === castId)
      return {
        visitId: visit.id,
        customerName: visit.customerName || 'お客様',
        tableName: table?.name ?? '',
        amount,
        isCheckedOut: visit.isCheckedOut,
        nominationType: nomination?.nominationType ?? 'none',
      }
    }).sort((a, b) => b.amount - a.amount),
    [myVisitsToday, state.tables, state.payments, castId],
  )

  const totalSales = tableSales.reduce((s, t) => s + t.amount, 0)

  const myConfirmed = useMemo(() =>
    state.confirmedShifts.filter(s => s.castId === castId && s.date.startsWith(monthPrefix)).sort((a, b) => a.date.localeCompare(b.date)),
    [state.confirmedShifts, castId, monthPrefix],
  )

  const cast = state.casts.find(c => c.id === castId)

  return (
    <>
      {/* Today's stats */}
      <div className="bg-[#141430] border border-[#2e2e50] rounded-xl p-4 space-y-4 animate-slide-up">
        <h2 className="text-xs font-semibold text-[#9090bb] tracking-widest uppercase">本日の実績</h2>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#0f0f28] rounded-lg p-2.5 text-center">
            <div className="text-[10px] text-[#9090bb] mb-0.5">本指名</div>
            <div className="text-lg font-bold text-[#d4b870]">{mainNominations}</div>
          </div>
          <div className="bg-[#0f0f28] rounded-lg p-2.5 text-center">
            <div className="text-[10px] text-[#9090bb] mb-0.5">場内</div>
            <div className="text-lg font-bold text-purple-300">{inStoreNominations}</div>
          </div>
          <div className="bg-[#0f0f28] rounded-lg p-2.5 text-center">
            <div className="text-[10px] text-[#9090bb] mb-0.5">同伴</div>
            <div className="text-lg font-bold text-emerald-400">{douhan}</div>
          </div>
        </div>

        {cast?.isWorking && cast.clockInTime && (
          <div className="flex items-center justify-between pt-2 border-t border-[#2e2e50]">
            <div className="flex items-center gap-2"><Clock size={14} className="text-emerald-400" /><span className="text-sm text-[#9090bb]">出勤</span></div>
            <span className="text-white font-bold text-sm">{new Date(cast.clockInTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} 〜</span>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-2 pt-2 border-t border-[#2e2e50]">
            <TrendingUp size={14} className="text-emerald-400" /><span className="text-sm text-[#9090bb]">売上内訳</span>
          </div>
          {tableSales.length === 0 ? (
            <div className="text-center py-6">
              <Users size={24} className="mx-auto text-[#2e2e50] mb-2" />
              <p className="text-xs text-[#3a3a5e]">本日の接客記録はまだありません</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {tableSales.map(t => (
                <div key={t.visitId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-white truncate">{t.customerName}</span>
                    <span className="text-[#3a3a5e] text-xs shrink-0">({t.tableName})</span>
                    {t.nominationType !== 'none' && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${nominationColor(t.nominationType)}`}>
                        {nominationLabel(t.nominationType)}
                      </span>
                    )}
                    {t.isCheckedOut && <span className="text-[10px] bg-emerald-900/50 text-emerald-400 px-1.5 py-0.5 rounded shrink-0">済</span>}
                  </div>
                  <span className="text-white font-bold shrink-0 ml-2">¥{t.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-[#2e2e50]">
                <span className="text-sm text-[#9090bb]">合計</span>
                <span className="text-[#d4b870] font-bold text-lg">¥{totalSales.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ranking */}
      <RankingSection castId={castId} />

      {/* Schedule calendar */}
      <div className="bg-[#141430] border border-[#2e2e50] rounded-xl p-4 animate-slide-up">
        <MonthNav viewYear={viewYear} viewMonth={viewMonth} isCurrentMonth={isCurrentMonth} prevMonth={prevMonth} nextMonth={nextMonth} goToday={goToday} />

        <ScheduleCalendar
          confirmedShifts={myConfirmed}
          viewYear={viewYear}
          viewMonth={viewMonth}
          todayKey={todayKey}
          hourlyRate={cast?.hourlyRate}
        />
      </div>

      {/* Portfolio & Certificate section */}
      <CastPortfolioSection castId={castId} />
    </>
  )
}

const PORTFOLIO_CONSENT_KEY = 'luna_portfolio_consent'

function CastPortfolioSection({ castId }: { castId: string }) {
  const { state } = useApp()
  const [showCertificate, setShowCertificate] = useState(false)
  const [showConsent, setShowConsent] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteRequested, setDeleteRequested] = useState(false)

  const [portfolioEnabled, setPortfolioEnabled] = useState(() => {
    try {
      return localStorage.getItem(`${PORTFOLIO_CONSENT_KEY}_${castId}`) === 'true'
    } catch { return false }
  })

  function handleConsentAccept() {
    setPortfolioEnabled(true)
    try { localStorage.setItem(`${PORTFOLIO_CONSENT_KEY}_${castId}`, 'true') } catch {}
    setShowConsent(false)
  }

  function handleConsentRevoke() {
    setPortfolioEnabled(false)
    try { localStorage.removeItem(`${PORTFOLIO_CONSENT_KEY}_${castId}`) } catch {}
  }

  return (
    <>
      <div className="bg-[#141430] border border-[#2e2e50] rounded-xl p-4 animate-slide-up space-y-3">
        <h2 className="text-xs font-semibold text-[#9090bb] tracking-widest uppercase flex items-center gap-1">
          <FileText size={11} className="text-[#d4b870]" />ポートフォリオ・証明書
        </h2>

        {/* Portfolio toggle */}
        <div className="bg-[#0f0f28] rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={16} className={portfolioEnabled ? 'text-emerald-400' : 'text-[#3a3a5e]'} />
            <div>
              <div className="text-sm text-white">ポートフォリオ機能</div>
              <div className="text-[10px] text-[#9090bb]">{portfolioEnabled ? '有効 — 実績データが共有可能' : '無効 — データは非公開'}</div>
            </div>
          </div>
          <button
            onClick={() => portfolioEnabled ? handleConsentRevoke() : setShowConsent(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
              portfolioEnabled
                ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800/50'
                : 'bg-[#d4b870] text-[#0a0a18]'
            }`}
          >
            {portfolioEnabled ? '無効にする' : '有効にする'}
          </button>
        </div>

        {/* Certificate button */}
        <button
          onClick={() => setShowCertificate(true)}
          className="w-full bg-[#0f0f28] rounded-lg p-3 flex items-center justify-between hover:bg-[#1e1e40] active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[#d4b870]" />
            <span className="text-sm text-white">実績証明書を発行</span>
          </div>
          <ChevronRight size={16} className="text-[#3a3a5e]" />
        </button>

        {/* Data deletion request */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full rounded-lg p-3 flex items-center gap-2 text-[#3a3a5e] hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
          <span className="text-xs">データ削除リクエスト</span>
        </button>
      </div>

      {showConsent && <PortfolioConsentModal onAccept={handleConsentAccept} onClose={() => setShowConsent(false)} />}
      {showCertificate && <CertificateModal castId={castId} onClose={() => setShowCertificate(false)} />}
      {showDeleteConfirm && (
        <DataDeletionModal
          onConfirm={() => { setDeleteRequested(true); setShowDeleteConfirm(false) }}
          onClose={() => setShowDeleteConfirm(false)}
          requested={deleteRequested}
        />
      )}
    </>
  )
}

function PortfolioConsentModal({ onAccept, onClose }: { onAccept: () => void; onClose: () => void }) {
  const [checked, setChecked] = useState(false)

  const dataItems = [
    '売上貢献額（月間・累計）',
    '指名本数（本指名・場内指名）',
    '同伴回数',
    '顧客リピート率',
    '出勤日数・出勤率',
    '在籍期間',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 animate-overlay" onClick={onClose} />
      <div className="relative bg-[#141430] border border-[#2e2e50] rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 space-y-4 shadow-xl animate-slide-in-bottom sm:animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2"><Shield size={18} className="text-[#d4b870]" />ポートフォリオ有効化</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#1e1e40] rounded transition-colors"><XIcon size={18} className="text-[#9090bb]" /></button>
        </div>

        <p className="text-sm text-[#9090bb] leading-relaxed">
          ポートフォリオ機能を有効にすると、あなたの実績データを移籍先店舗やマッチング参加店舗に共有できるようになります。
        </p>

        <div className="bg-[#0f0f28] rounded-lg p-3 space-y-2">
          <div className="text-xs text-[#d4b870] font-bold tracking-wider mb-2">共有されるデータ</div>
          {dataItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-white">
              <span className="text-[#d4b870] text-xs">●</span>{item}
            </div>
          ))}
        </div>

        <div className="bg-[#0f0f28] rounded-lg p-3 space-y-2">
          <div className="text-xs text-[#d4b870] font-bold tracking-wider mb-2">共有範囲</div>
          <p className="text-sm text-[#9090bb]">共有リンクを知っている人、またはLuna Posマッチングプラットフォーム参加店舗が閲覧できます。</p>
        </div>

        <div className="bg-[#0f0f28] rounded-lg p-3 space-y-2">
          <div className="text-xs text-emerald-400 font-bold tracking-wider mb-2">あなたの権利</div>
          <div className="flex items-start gap-2 text-sm text-[#9090bb]">
            <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>いつでもポートフォリオを無効化・データ削除できます</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-[#9090bb]">
            <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>データ保持期間: 無効化後30日以内に完全削除</span>
          </div>
        </div>

        <label className="flex items-start gap-3 p-3 bg-[#0f0f28] rounded-lg cursor-pointer">
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} className="mt-1 accent-[#d4b870]" />
          <span className="text-sm text-white">上記の内容を確認し、ポートフォリオ機能の有効化に同意します</span>
        </label>

        <button
          onClick={onAccept}
          disabled={!checked}
          className={`w-full py-3 rounded-xl font-bold tracking-wider transition-all active:scale-[0.98] ${
            checked ? 'bg-[#d4b870] text-[#0a0a18] hover:bg-[#c4a860]' : 'bg-[#2e2e50] text-[#3a3a5e] cursor-not-allowed'
          }`}
        >
          同意して有効化する
        </button>
      </div>
    </div>
  )
}

function DataDeletionModal({ onConfirm, onClose, requested }: { onConfirm: () => void; onClose: () => void; requested: boolean }) {
  if (requested) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/60 animate-overlay" onClick={onClose} />
        <div className="relative bg-[#141430] border border-[#2e2e50] rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 space-y-4 shadow-xl animate-slide-in-bottom sm:animate-slide-up text-center">
          <Check size={40} className="mx-auto text-emerald-400" />
          <h3 className="font-bold text-lg">削除リクエストを受け付けました</h3>
          <p className="text-sm text-[#9090bb]">30日以内にすべてのポートフォリオデータが完全に削除されます。</p>
          <button onClick={onClose} className="w-full bg-[#2e2e50] text-white py-3 rounded-xl font-bold tracking-wider hover:bg-[#3a3a5e] active:scale-[0.98] transition-all">
            閉じる
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 animate-overlay" onClick={onClose} />
      <div className="relative bg-[#141430] border border-[#2e2e50] rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 space-y-4 shadow-xl animate-slide-in-bottom sm:animate-slide-up">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2"><Trash2 size={18} className="text-red-400" />データ削除リクエスト</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#1e1e40] rounded transition-colors"><XIcon size={18} className="text-[#9090bb]" /></button>
        </div>

        <p className="text-sm text-[#9090bb] leading-relaxed">
          ポートフォリオに関連するすべてのデータ（売上実績・指名本数・リピート率など）の削除をリクエストします。
        </p>

        <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-3">
          <p className="text-sm text-red-300">この操作を行うと、ポートフォリオで共有されたデータは30日以内に完全に削除されます。この操作は取り消せません。</p>
        </div>

        <button onClick={onConfirm} className="w-full bg-red-900/60 text-red-300 border border-red-800/50 py-3 rounded-xl font-bold tracking-wider hover:bg-red-900/80 active:scale-[0.98] transition-all">
          データ削除をリクエスト
        </button>
        <button onClick={onClose} className="w-full text-[#9090bb] text-sm py-2 hover:text-white transition-colors">
          キャンセル
        </button>
      </div>
    </div>
  )
}

function CertificateModal({ castId, onClose }: { castId: string; onClose: () => void }) {
  const { state } = useApp()
  const printRef = useRef<HTMLDivElement>(null)
  const cast = state.casts.find(c => c.id === castId)

  const stats = useMemo(() => {
    const allMyVisits = state.visits.filter(v => v.nominations.some(n => n.castId === castId))
    const allMyShifts = state.confirmedShifts.filter(s => s.castId === castId)

    // Period
    const shiftDates = allMyShifts.map(s => s.date).sort()
    const firstDate = shiftDates[0] ?? ''
    const lastDate = shiftDates[shiftDates.length - 1] ?? ''

    // Months active
    const months = new Set(shiftDates.map(d => d.substring(0, 7)))
    const monthCount = Math.max(months.size, 1)

    // Total sales
    let totalSales = 0
    allMyVisits.forEach(visit => {
      const payment = state.payments.find(p => p.visitId === visit.id)
      totalSales += payment ? payment.total : visit.orderItems.reduce((s, i) => s + i.price * i.quantity, 0)
    })

    // Nominations
    const totalNominations = allMyVisits.length
    const mainNominations = allMyVisits.filter(v => v.nominations.some(n => n.castId === castId && n.nominationType === 'main')).length
    const inStoreNominations = allMyVisits.filter(v => v.nominations.some(n => n.castId === castId && n.nominationType === 'in_store')).length

    // Douhan
    const totalDouhan = state.visits.filter(v => v.douhanCastId === castId).length

    // Unique customers
    const customerIds = new Set<string>()
    allMyVisits.forEach(v => {
      if (v.customerId) customerIds.add(v.customerId)
      else if (v.customerName) customerIds.add(v.customerName)
    })

    // Repeat rate (customers who visited 2+ times within 90 days)
    const customerVisitCounts = new Map<string, number>()
    allMyVisits.forEach(v => {
      const key = v.customerId || v.customerName || ''
      if (key) customerVisitCounts.set(key, (customerVisitCounts.get(key) ?? 0) + 1)
    })
    const totalCustomers = customerVisitCounts.size
    const repeatCustomers = [...customerVisitCounts.values()].filter(c => c >= 2).length
    const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0

    // Attendance
    const avgAttendanceDays = Math.round((allMyShifts.length / monthCount) * 10) / 10

    // Period display
    function formatPeriod(first: string, last: string) {
      if (!first || !last) return '-'
      const [fy, fm] = first.split('-').map(Number)
      const [ly, lm] = last.split('-').map(Number)
      const totalMonths = (ly - fy) * 12 + (lm - fm) + 1
      return `${fy}年${fm}月〜${ly}年${lm}月（${totalMonths}ヶ月）`
    }

    return {
      period: formatPeriod(firstDate, lastDate),
      monthlyAvgSales: Math.round(totalSales / monthCount),
      totalNominations,
      mainNominations,
      inStoreNominations,
      monthlyAvgDouhan: Math.round((totalDouhan / monthCount) * 10) / 10,
      customerCount: totalCustomers,
      repeatRate,
      avgAttendanceDays,
      totalShifts: allMyShifts.length,
    }
  }, [state.visits, state.payments, state.confirmedShifts, castId])

  function handlePrint() {
    window.print()
  }

  if (!cast) return null

  const STORE_NAME = 'Club LunaPos'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a18]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2e2e50] print:hidden">
        <button onClick={onClose} className="flex items-center gap-1 text-[#9090bb] text-sm hover:text-white transition-colors">
          <ChevronLeft size={18} />戻る
        </button>
        <span className="text-sm font-bold text-white">実績証明書</span>
        <button onClick={handlePrint} className="flex items-center gap-1 bg-[#d4b870] text-[#0a0a18] px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-[#c4a860] active:scale-95 transition-all">
          <Printer size={14} />印刷
        </button>
      </div>

      {/* Certificate content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div ref={printRef} className="max-w-md mx-auto bg-[#141430] border border-[#2e2e50] rounded-xl p-6 space-y-5 print:bg-white print:text-black print:border-gray-300 print:max-w-none">
          {/* Title */}
          <div className="text-center border-b border-[#2e2e50] pb-4 print:border-gray-300">
            <p className="text-[10px] text-[#9090bb] tracking-[0.3em] mb-1 print:text-gray-500">☽</p>
            <h1 className="text-xl font-bold tracking-[0.2em] text-[#d4b870] print:text-black">Luna Pos キャスト実績証明書</h1>
          </div>

          {/* Basic info */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#9090bb] print:text-gray-500">氏名（源氏名）</span>
              <span className="text-white font-bold print:text-black">{cast.stageName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#9090bb] print:text-gray-500">在籍店舗</span>
              <span className="text-white font-bold print:text-black">{STORE_NAME}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#9090bb] print:text-gray-500">在籍期間</span>
              <span className="text-white font-bold text-right print:text-black">{stats.period}</span>
            </div>
          </div>

          {/* Sales */}
          <div className="space-y-2">
            <h3 className="text-xs text-[#d4b870] font-bold tracking-widest border-b border-[#2e2e50] pb-1 print:text-black print:border-gray-300">売上実績</h3>
            <div className="flex justify-between text-sm">
              <span className="text-[#9090bb] print:text-gray-500">月間平均売上貢献額</span>
              <span className="text-white font-bold print:text-black">¥{stats.monthlyAvgSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#9090bb] print:text-gray-500">累計指名本数</span>
              <span className="text-white font-bold print:text-black">{stats.totalNominations}本</span>
            </div>
            <div className="flex justify-between text-sm pl-4">
              <span className="text-[#3a3a5e] print:text-gray-400">本指名</span>
              <span className="text-[#9090bb] print:text-gray-500">{stats.mainNominations}本</span>
            </div>
            <div className="flex justify-between text-sm pl-4">
              <span className="text-[#3a3a5e] print:text-gray-400">場内指名</span>
              <span className="text-[#9090bb] print:text-gray-500">{stats.inStoreNominations}本</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#9090bb] print:text-gray-500">月間平均同伴回数</span>
              <span className="text-white font-bold print:text-black">{stats.monthlyAvgDouhan}回</span>
            </div>
          </div>

          {/* Customers */}
          <div className="space-y-2">
            <h3 className="text-xs text-[#d4b870] font-bold tracking-widest border-b border-[#2e2e50] pb-1 print:text-black print:border-gray-300">顧客関係</h3>
            <div className="flex justify-between text-sm">
              <span className="text-[#9090bb] print:text-gray-500">担当顧客数</span>
              <span className="text-white font-bold print:text-black">{stats.customerCount}名</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#9090bb] print:text-gray-500">顧客リピート率</span>
              <span className="text-white font-bold print:text-black">{stats.repeatRate}%</span>
            </div>
          </div>

          {/* Attendance */}
          <div className="space-y-2">
            <h3 className="text-xs text-[#d4b870] font-bold tracking-widest border-b border-[#2e2e50] pb-1 print:text-black print:border-gray-300">勤務実績</h3>
            <div className="flex justify-between text-sm">
              <span className="text-[#9090bb] print:text-gray-500">平均出勤日数</span>
              <span className="text-white font-bold print:text-black">{stats.avgAttendanceDays}日/月</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-[#2e2e50] pt-3 print:border-gray-300">
            <p className="text-[10px] text-[#3a3a5e] leading-relaxed print:text-gray-400">
              ※ 本データはLuna Pos POSシステムの取引記録に基づき自動算出されています。
            </p>
            <p className="text-[10px] text-[#3a3a5e] mt-1 print:text-gray-400">
              発行日: {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScheduleCalendar({ confirmedShifts, viewYear, viewMonth, todayKey, hourlyRate }: { confirmedShifts: { id: string; date: string; startTime: string; endTime: string; note?: string }[]; viewYear: number; viewMonth: number; todayKey: string; hourlyRate?: number }) {
  const calDays = useMemo(() => buildCalendarDays(viewYear, viewMonth), [viewYear, viewMonth])

  const shiftByDate = useMemo(() => {
    const m = new Map<string, (typeof confirmedShifts)[number]>()
    confirmedShifts.forEach(s => m.set(s.date, s))
    return m
  }, [confirmedShifts])

  const totalHours = useMemo(
    () => confirmedShifts.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime), 0),
    [confirmedShifts],
  )

  return (
    <>
      <div className="grid grid-cols-7 gap-0">
        {WEEKDAY_LABELS.map((w, i) => (
          <div key={w} className={`text-center text-xs font-medium py-2 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-[#9090bb]'}`}>{w}</div>
        ))}

        {calDays.map(({ date, inMonth }, idx) => {
          const key = toDateKey(date)
          const shift = shiftByDate.get(key)
          const isToday = key === todayKey
          const isPast = key < todayKey
          const dow = date.getDay()

          return (
            <div key={idx} className="flex flex-col items-center py-0.5">
              <div
                className={`w-full py-1.5 rounded-lg flex flex-col items-center transition-colors ${
                  !inMonth ? 'text-[#2e2e50]' :
                  isToday ? 'bg-[#d4b870]/20 text-[#d4b870] font-bold' :
                  isPast ? 'text-[#3a3a5e]' :
                  dow === 0 ? 'text-red-300' : dow === 6 ? 'text-blue-300' : 'text-white'
                }`}
              >
                <span className="text-sm font-bold leading-none">{date.getDate()}</span>
                {shift && inMonth ? (
                  <>
                    <span className={`text-[10px] leading-snug mt-1 ${isPast ? 'text-[#3a3a5e]' : 'text-[#9090bb]'}`}>
                      {shift.startTime}
                    </span>
                    <span className={`text-[10px] leading-snug ${isPast ? 'text-[#3a3a5e]' : 'text-[#9090bb]'}`}>
                      {shift.endTime}
                    </span>
                    <span className={`text-[10px] leading-snug font-bold ${isPast ? 'text-[#3a3a5e]' : 'text-emerald-400'}`}>
                      {calcHours(shift.startTime, shift.endTime)}h
                    </span>
                  </>
                ) : inMonth ? (
                  <span className="text-[10px] leading-snug mt-1 text-[#1e1e40]">-</span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-[#2e2e50] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#9090bb]">{viewMonth + 1}月 出勤</span>
          <span className="text-white font-bold text-sm">{confirmedShifts.length}日 / {totalHours.toFixed(1)}h</span>
        </div>
        {hourlyRate != null && (
          <div className="bg-[#0f0f28] rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#9090bb]">時給</span>
              <span className="text-white">¥{hourlyRate.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-[#9090bb]">時間数</span>
              <span className="text-white">{totalHours.toFixed(1)}h</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2e2e50]">
              <span className="text-sm text-[#9090bb]">見込み給料</span>
              <span className="text-[#d4b870] font-bold text-lg">¥{Math.floor(hourlyRate * totalHours).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Day-by-day list */}
      {confirmedShifts.length > 0 && (
        <div className="mt-3 space-y-1">
          {confirmedShifts.map(shift => {
            const d = new Date(shift.date + 'T00:00:00')
            const dow = WEEKDAY_LABELS[d.getDay()]
            const hours = calcHours(shift.startTime, shift.endTime)
            const isPast = shift.date < todayKey
            const isToday = shift.date === todayKey

            return (
              <div
                key={shift.id}
                className={`flex items-center rounded-lg px-3 py-2 transition-colors ${
                  isToday ? 'bg-[#d4b870]/15 border border-[#d4b870]/30' :
                  isPast ? 'opacity-40' : 'bg-[#0f0f28]'
                }`}
              >
                <div className={`w-14 shrink-0 text-sm font-bold ${
                  isToday ? 'text-[#d4b870]' :
                  d.getDay() === 0 ? 'text-red-400' :
                  d.getDay() === 6 ? 'text-blue-400' : 'text-white'
                }`}>
                  {d.getDate()}日 <span className="text-[10px] font-normal">{dow}</span>
                </div>
                <div className="flex-1 text-sm text-white">
                  {shift.startTime}〜{shift.endTime}
                </div>
                <div className="shrink-0 text-sm text-emerald-400 font-bold">{hours}h</div>
                {shift.note && <div className="shrink-0 ml-2 text-[10px] text-[#d4b870] max-w-[60px] truncate">{shift.note}</div>}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

function ShiftSubmitTab({ castId, viewYear, viewMonth, monthPrefix, todayKey, isCurrentMonth, prevMonth, nextMonth, goToday }: TabProps) {
  const { state, dispatch } = useApp()
  const [editingDate, setEditingDate] = useState<string | null>(null)
  const [editStart, setEditStart] = useState(DEFAULT_START)
  const [editEnd, setEditEnd] = useState(DEFAULT_END)
  const [editNote, setEditNote] = useState('')

  const myShifts = useMemo(() => state.shiftEntries.filter(s => s.castId === castId), [state.shiftEntries, castId])

  const shiftMap = useMemo(() => {
    const m = new Map<string, (typeof myShifts)[number]>()
    myShifts.forEach(s => m.set(s.date, s))
    return m
  }, [myShifts])

  const calendarDays = useMemo(() => buildCalendarDays(viewYear, viewMonth), [viewYear, viewMonth])

  const monthShifts = useMemo(
    () => myShifts.filter(s => s.date.startsWith(monthPrefix)).sort((a, b) => a.date.localeCompare(b.date)),
    [myShifts, monthPrefix],
  )

  function openEdit(dateKey: string) {
    const entry = shiftMap.get(dateKey)
    setEditingDate(dateKey)
    setEditStart(entry?.startTime ?? DEFAULT_START)
    setEditEnd(entry?.endTime ?? DEFAULT_END)
    setEditNote(entry?.note ?? '')
  }

  function saveAsAvailable() {
    if (!editingDate) return
    dispatch({
      type: 'SUBMIT_SHIFT',
      payload: { castId, date: editingDate, status: 'available', startTime: editStart, endTime: editEnd, note: editNote || undefined },
    })
    setEditingDate(null)
  }

  function saveAsUnavailable() {
    if (!editingDate) return
    dispatch({
      type: 'SUBMIT_SHIFT',
      payload: { castId, date: editingDate, status: 'unavailable' },
    })
    setEditingDate(null)
  }

  function clearShift() {
    if (!editingDate) return
    dispatch({ type: 'DELETE_SHIFT', payload: { castId, date: editingDate } })
    setEditingDate(null)
  }

  return (
    <>
      <div className="flex items-center justify-center gap-6 text-xs text-[#9090bb]">
        <span className="flex items-center gap-1"><Circle size={12} className="text-emerald-400 fill-emerald-400" /> 出勤可</span>
        <span className="flex items-center gap-1"><XIcon size={12} className="text-red-400" /> 出勤不可</span>
      </div>

      {/* Calendar */}
      <div className="bg-[#141430] border border-[#2e2e50] rounded-xl p-4 animate-slide-up">
        <MonthNav viewYear={viewYear} viewMonth={viewMonth} isCurrentMonth={isCurrentMonth} prevMonth={prevMonth} nextMonth={nextMonth} goToday={goToday} />

        <div className="grid grid-cols-7 gap-0">
          {WEEKDAY_LABELS.map((w, i) => (
            <div key={w} className={`text-center text-xs font-medium py-2 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-[#9090bb]'}`}>{w}</div>
          ))}

          {calendarDays.map(({ date, inMonth }, idx) => {
            const key = toDateKey(date)
            const entry = shiftMap.get(key)
            const isToday = key === todayKey
            const isPast = key < todayKey
            const dow = date.getDay()
            const isAvail = entry?.status === 'available'
            const st = entry?.startTime ?? DEFAULT_START
            const en = entry?.endTime ?? DEFAULT_END

            return (
              <div key={idx} className="flex flex-col items-center py-0.5">
                <button
                  onClick={() => !isPast && inMonth && openEdit(key)}
                  disabled={isPast || !inMonth}
                  className={`w-full py-1.5 rounded-lg flex flex-col items-center transition-all ${
                    !inMonth ? 'text-[#2e2e50]' :
                    isPast ? 'text-[#3a3a5e]' :
                    isToday ? 'bg-[#d4b870]/20 text-[#d4b870] font-bold' :
                    dow === 0 ? 'text-red-300' : dow === 6 ? 'text-blue-300' : 'text-white'
                  } ${!isPast && inMonth ? 'hover:bg-[#1e1e40] active:scale-95' : ''}`}
                >
                  <span className="text-sm font-bold leading-none">{date.getDate()}</span>
                  {entry && inMonth ? (
                    isAvail ? (
                      <>
                        <span className={`text-[10px] leading-snug mt-1 ${isPast ? 'text-[#3a3a5e]' : 'text-[#9090bb]'}`}>
                          {st}
                        </span>
                        <span className={`text-[10px] leading-snug ${isPast ? 'text-[#3a3a5e]' : 'text-[#9090bb]'}`}>
                          {en}
                        </span>
                        <span className={`text-[10px] leading-snug font-bold ${isPast ? 'text-[#3a3a5e]' : 'text-emerald-400'}`}>
                          {calcHours(st, en)}h
                        </span>
                      </>
                    ) : (
                      <XIcon size={14} className="text-red-400 mt-1" />
                    )
                  ) : inMonth ? (
                    <span className="text-[10px] leading-snug mt-1 text-[#1e1e40]">-</span>
                  ) : null}
                </button>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-[#3a3a5e] text-center mt-3">日付をタップして入力</p>
      </div>

      {/* Shift list */}
      <div className="bg-[#141430] border border-[#2e2e50] rounded-xl p-4 animate-slide-up">
        <h2 className="text-xs font-semibold text-[#9090bb] tracking-widest uppercase mb-3">
          <CalendarDays size={11} className="inline mr-1 text-[#d4b870]" />{viewMonth + 1}月 提出内容
        </h2>
        {monthShifts.length === 0 ? (
          <div className="text-center py-6">
            <CalendarDays size={24} className="mx-auto text-[#2e2e50] mb-2" />
            <p className="text-xs text-[#3a3a5e]">シフト未提出</p>
            <p className="text-[10px] text-[#2e2e50] mt-1">カレンダーから日付をタップして提出</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {monthShifts.map(shift => {
              const d = new Date(shift.date + 'T00:00:00')
              const dow = WEEKDAY_LABELS[d.getDay()]
              const isPast = shift.date < todayKey
              const isAvail = shift.status === 'available'

              return (
                <button
                  key={shift.id}
                  onClick={() => !isPast && openEdit(shift.date)}
                  disabled={isPast}
                  className={`w-full border rounded-lg p-2.5 flex items-center justify-between text-left transition-all ${
                    isAvail ? 'border-emerald-800/50 bg-emerald-950/30' : 'border-red-800/50 bg-red-950/30'
                  } ${isPast ? 'opacity-40' : 'hover:bg-white/5 active:scale-[0.99]'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 w-16">
                      <div className="font-bold text-white text-sm">{d.getMonth() + 1}/{d.getDate()}</div>
                      <div className={`text-[10px] ${d.getDay() === 0 ? 'text-red-400' : d.getDay() === 6 ? 'text-blue-400' : 'text-[#9090bb]'}`}>{dow}曜日</div>
                    </div>
                    <div className="min-w-0">
                      {isAvail ? (
                        <div className="text-sm text-white">{shift.startTime ?? DEFAULT_START} 〜 {shift.endTime ?? DEFAULT_END}</div>
                      ) : (
                        <div className="text-sm text-red-400">出勤不可</div>
                      )}
                      {shift.note && <div className="text-[11px] text-[#d4b870] truncate">{shift.note}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isAvail ? <Circle size={16} className="text-emerald-400 fill-emerald-400" /> : <XIcon size={16} className="text-red-400" />}
                    {!isPast && (
                      <button
                        onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_SHIFT', payload: { castId, date: shift.date } }) }}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <XIcon size={12} className="text-[#3a3a5e]" />
                      </button>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Submitted summary */}
        {(() => {
          const availShifts = monthShifts.filter(s => s.status === 'available')
          const totalH = availShifts.reduce((sum, s) => sum + calcHours(s.startTime ?? DEFAULT_START, s.endTime ?? DEFAULT_END), 0)
          return (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2e2e50]">
              <span className="text-xs text-[#9090bb]">{viewMonth + 1}月 出勤可</span>
              <div className="flex items-center gap-3">
                <span className="text-white font-bold text-sm">{availShifts.length}日</span>
                <span className="text-emerald-400 font-bold">{totalH.toFixed(1)}h</span>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Edit modal */}
      {editingDate && (() => {
        const d = new Date(editingDate + 'T00:00:00')
        const dow = WEEKDAY_LABELS[d.getDay()]
        const existing = shiftMap.get(editingDate)
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 animate-overlay" onClick={() => setEditingDate(null)} />
            <div className="relative bg-[#141430] border border-[#2e2e50] rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 space-y-4 shadow-xl animate-slide-in-bottom sm:animate-slide-up">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{d.getMonth() + 1}/{d.getDate()} ({dow})</h3>
                <button onClick={() => setEditingDate(null)} className="p-1 hover:bg-[#1e1e40] rounded transition-colors"><XIcon size={18} className="text-[#9090bb]" /></button>
              </div>

              <div>
                <label className="block text-xs text-[#9090bb] mb-1">勤務時間</label>
                <div className="flex items-center gap-2">
                  <input type="time" value={editStart} onChange={e => setEditStart(e.target.value)} className="flex-1 bg-[#0a0a18] border border-[#2e2e50] rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4b870] focus:outline-none transition-colors" />
                  <span className="text-[#9090bb]">〜</span>
                  <input type="time" value={editEnd} onChange={e => setEditEnd(e.target.value)} className="flex-1 bg-[#0a0a18] border border-[#2e2e50] rounded-lg px-3 py-2 text-sm text-white focus:border-[#d4b870] focus:outline-none transition-colors" />
                </div>
                {editStart && editEnd && (
                  <p className="text-[10px] text-[#9090bb] mt-1 text-right">{calcHours(editStart, editEnd).toFixed(1)}h</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-[#9090bb] mb-1">メモ</label>
                <input type="text" value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="早上がり希望 など" className="w-full bg-[#0a0a18] border border-[#2e2e50] rounded-lg px-3 py-2 text-sm text-white placeholder-[#3a3a5e] focus:border-[#d4b870] focus:outline-none transition-colors" />
              </div>

              <button onClick={saveAsAvailable} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold tracking-wider hover:bg-emerald-700 active:scale-[0.98] transition-all">
                出勤可で提出
              </button>

              <button onClick={saveAsUnavailable} className="w-full bg-red-900/60 text-red-300 border border-red-800/50 py-3 rounded-xl font-bold tracking-wider hover:bg-red-900/80 active:scale-[0.98] transition-all">
                出勤不可
              </button>

              {existing && (
                <button onClick={clearShift} className="w-full text-[#9090bb] text-sm py-2 hover:text-white transition-colors">
                  この日の提出を取り消す
                </button>
              )}
            </div>
          </div>
        )
      })()}
    </>
  )
}

export default function CastApp() {
  const { state } = useApp()
  const [loggedInCastId, setLoggedInCastId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOGIN_STORAGE_KEY)
    } catch {
      return null
    }
  })

  const loggedInCast = loggedInCastId ? state.casts.find(c => c.id === loggedInCastId) : null

  useEffect(() => {
    try {
      if (loggedInCastId) {
        localStorage.setItem(LOGIN_STORAGE_KEY, loggedInCastId)
      } else {
        localStorage.removeItem(LOGIN_STORAGE_KEY)
      }
    } catch {}
  }, [loggedInCastId])

  function handleLogin(cast: Cast) {
    setLoggedInCastId(cast.id)
  }

  function handleLogout() {
    setLoggedInCastId(null)
  }

  if (!loggedInCast) {
    return <CastLoginScreen onLogin={handleLogin} />
  }

  return <CastDashboard cast={loggedInCast} onLogout={handleLogout} />
}
