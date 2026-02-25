import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, UserCheck, Banknote,
  Plus, X, Sparkles,
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import type { Table, NominationType, CastNomination } from '../types'
import { NOMINATION_FEE_MAIN, NOMINATION_FEE_IN_STORE, DOUHAN_FEE, SERVICE_RATE, TAX_RATE } from '../data/constants'

const STATUS_COLOR: Record<Table['status'], string> = {
  empty: 'bg-white border-[#e2d9f3] text-[#7c6ea0] shadow-sm',
  occupied: 'bg-[#f0fdf4] border-[#86efac] text-[#15803d]',
  waiting_checkout: 'bg-[#fffbeb] border-[#fcd34d] text-[#92400e]',
}

const STATUS_DOT: Record<Table['status'], string> = {
  empty: 'bg-[#c4b5fd]',
  occupied: 'bg-emerald-500',
  waiting_checkout: 'bg-amber-400',
}

// Card dimensions for absolute positioning
const CARD_W = 220
const CARD_H = 196
const GAP = 12
const PAD = 16

function elapsedMinutes(checkInTime: string): number {
  return Math.floor((Date.now() - new Date(checkInTime).getTime()) / 60000)
}

function formatElapsed(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

function formatHHMM(iso: string): string {
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

function formatExitTime(checkInTime: string, setMinutes: number): string {
  const exitMs = new Date(checkInTime).getTime() + setMinutes * 60000
  return new Date(exitMs).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

function ClockArc({ checkInTime, setMinutes }: { checkInTime: string; setMinutes: number }) {
  const elapsed = elapsedMinutes(checkInTime)
  const remaining = setMinutes - elapsed
  const ratio = Math.min(elapsed / setMinutes, 1)
  const overtime = elapsed > setMinutes
  const warning = !overtime && remaining <= 10
  const R = 22
  const SIZE = 54
  const CX = SIZE / 2
  const CY = SIZE / 2
  const CIRCUM = 2 * Math.PI * R
  const strokeColor = overtime || warning ? '#ef4444' : '#c9a456'
  const trackColor = 'rgba(201,164,86,0.18)'
  return (
    <div className="flex items-center gap-2">
      <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={trackColor} strokeWidth={4} />
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={strokeColor}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={CIRCUM}
          strokeDashoffset={CIRCUM * (1 - ratio)}
        />
      </svg>
      <div className="flex flex-col leading-tight">
        <span className={`font-bold text-base ${overtime || warning ? 'text-red-500' : 'text-[#c9a456]'}`}>
          {formatElapsed(elapsed)}
        </span>
        {warning && !overtime && (
          <span className="text-red-500 text-xs font-bold">残{remaining}分</span>
        )}
      </div>
    </div>
  )
}

interface CastEntry { castId: string; nominationType: NominationType; isDouhan: boolean }

// ---- Open Table Modal ----
function OpenTableModal({ table, onClose, onOpen }: {
  table: Table
  onClose: () => void
  onOpen: (data: { customerName: string; guestCount: number; nominations: CastNomination[]; douhanCastId?: string }) => void
}) {
  const { state } = useApp()
  const [customerName, setCustomerName] = useState('')
  const [guestCount, setGuestCount] = useState(2)
  // Pre-populate one entry so users can start selecting immediately
  const [castEntries, setCastEntries] = useState<CastEntry[]>([{ castId: '', nominationType: 'none', isDouhan: false }])
  const workingCasts = state.casts.filter(c => c.isWorking)

  const addEntry = () => setCastEntries(prev => [...prev, { castId: '', nominationType: 'none', isDouhan: false }])
  const removeEntry = (i: number) => setCastEntries(prev => prev.filter((_, idx) => idx !== i))
  const updateEntry = (i: number, field: 'castId' | 'nominationType', value: string) => {
    setCastEntries(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e))
  }
  const toggleDouhan = (i: number) => {
    setCastEntries(prev => prev.map((e, idx) => ({ ...e, isDouhan: idx === i ? !e.isDouhan : false })))
  }

  const totalFee = castEntries.reduce((sum, e) => {
    let fee = 0
    if (e.nominationType === 'main') fee += NOMINATION_FEE_MAIN
    if (e.nominationType === 'in_store') fee += NOMINATION_FEE_IN_STORE
    if (e.isDouhan) fee += DOUHAN_FEE
    return sum + fee
  }, 0)

  const handleOpen = () => {
    const nominations: CastNomination[] = castEntries
      .filter(e => e.castId && (e.nominationType === 'in_store' || e.nominationType === 'main'))
      .map(e => ({ castId: e.castId, nominationType: e.nominationType }))
    const douhanEntry = castEntries.find(e => e.castId && e.isDouhan)
    onOpen({ customerName, guestCount, nominations, douhanCastId: douhanEntry?.castId })
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white border border-[#e2d9f3] rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-base font-semibold tracking-widest text-[#c9a456] uppercase mb-5">{table.name} — 入店受付</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#7c6ea0] tracking-wider uppercase block mb-1">お客様名</label>
            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="例: 田中様" className="w-full bg-[#f3eeff] text-[#1a1040] rounded-xl px-4 py-3 outline-none border border-[#e2d9f3] focus:border-[#c9a456]/50 placeholder-[#b8acd4]" />
          </div>
          <div>
            <label className="text-xs text-[#7c6ea0] tracking-wider uppercase block mb-1">人数</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setGuestCount(n => Math.max(1, n - 1))} className="w-12 h-12 rounded-xl bg-[#f3eeff] border border-[#e2d9f3] text-[#1a1040] text-xl font-light flex items-center justify-center cursor-pointer active:border-[#c9a456]/50">−</button>
              <input type="number" min={1} value={guestCount} onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1) setGuestCount(v) }} className="flex-1 bg-[#f3eeff] text-[#1a1040] text-center text-xl font-semibold rounded-xl py-2.5 outline-none border border-[#e2d9f3] focus:border-[#c9a456]/50" />
              <button onClick={() => setGuestCount(n => n + 1)} className="w-12 h-12 rounded-xl bg-[#f3eeff] border border-[#e2d9f3] text-[#1a1040] text-xl font-light flex items-center justify-center cursor-pointer active:border-[#c9a456]/50">＋</button>
            </div>
          </div>

          {/* 指名・同伴（統合） */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[#7c6ea0] tracking-wider uppercase">キャスト / 指名 / 同伴</label>
              <button onClick={addEntry} className="flex items-center gap-1 text-xs text-[#c9a456] px-2 py-1 rounded-lg border border-[#c9a456]/30 hover:bg-[#c9a456]/10 cursor-pointer">
                <Plus size={11} />追加
              </button>
            </div>
            <div className="space-y-2">
              {castEntries.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#f3eeff] rounded-xl p-2 border border-[#e2d9f3]">
                  <select
                    value={entry.castId}
                    onChange={e => updateEntry(i, 'castId', e.target.value)}
                    className="flex-1 bg-white text-[#1a1040] rounded-lg px-2 py-1.5 text-sm outline-none border border-[#e2d9f3] focus:border-[#c9a456]/50 cursor-pointer"
                  >
                    <option value="">キャスト選択</option>
                    {workingCasts.map(c => <option key={c.id} value={c.id}>{c.stageName}</option>)}
                  </select>
                  <select
                    value={entry.nominationType}
                    onChange={e => updateEntry(i, 'nominationType', e.target.value)}
                    className="bg-white text-[#1a1040] rounded-lg px-2 py-1.5 text-sm outline-none border border-[#e2d9f3] focus:border-[#c9a456]/50 cursor-pointer"
                  >
                    <option value="none">なし</option>
                    <option value="in_store">場内指名 ¥{NOMINATION_FEE_IN_STORE.toLocaleString()}</option>
                    <option value="main">本指名 ¥{NOMINATION_FEE_MAIN.toLocaleString()}</option>
                  </select>
                  <button
                    onClick={() => toggleDouhan(i)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold border shrink-0 cursor-pointer transition-colors ${entry.isDouhan ? 'bg-[#c9a456] text-[#1a1040] border-[#c9a456]' : 'bg-white text-[#7c6ea0] border-[#e2d9f3]'}`}
                  >
                    同伴{entry.isDouhan ? ` ¥${DOUHAN_FEE.toLocaleString()}` : ''}
                  </button>
                  {castEntries.length > 1 && (
                    <button onClick={() => removeEntry(i)} className="p-1 text-[#7c6ea0] hover:text-red-500 cursor-pointer"><X size={14} /></button>
                  )}
                </div>
              ))}
            </div>
            {totalFee > 0 && (
              <p className="text-xs text-[#c9a456] mt-1 text-right">合計料金: ¥{totalFee.toLocaleString()}</p>
            )}
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={handleOpen}
            className="w-full py-3 rounded-xl bg-[#1a1040] text-[#d4b870] font-bold tracking-wider cursor-pointer"
          >
            入店受付
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Main Floor Page ----
export default function FloorPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchDeltaX, setTouchDeltaX] = useState(0)
  const dragStartX = useRef<number | null>(null)
  const [dragDeltaX, setDragDeltaX] = useState(0)

  const rooms = state.rooms
  const safeIndex = Math.min(currentRoomIndex, rooms.length - 1)

  const getVisit = (visitId?: string) => visitId ? state.visits.find(v => v.id === visitId) : undefined

  const handleTouchStart = (e: React.TouchEvent) => { setTouchStartX(e.touches[0].clientX); setTouchDeltaX(0) }
  const handleTouchMove = (e: React.TouchEvent) => { if (touchStartX === null) return; setTouchDeltaX(e.touches[0].clientX - touchStartX) }
  const handleTouchEnd = () => {
    if (touchDeltaX > 60 && safeIndex > 0) setCurrentRoomIndex(i => i - 1)
    else if (touchDeltaX < -60 && safeIndex < rooms.length - 1) setCurrentRoomIndex(i => i + 1)
    setTouchStartX(null); setTouchDeltaX(0)
  }
  const handleMouseDown = (e: React.MouseEvent) => { dragStartX.current = e.clientX; setDragDeltaX(0) }
  const handleMouseMove = (e: React.MouseEvent) => { if (dragStartX.current === null) return; setDragDeltaX(e.clientX - dragStartX.current) }
  const handleMouseUp = () => {
    if (dragDeltaX > 60 && safeIndex > 0) setCurrentRoomIndex(i => i - 1)
    else if (dragDeltaX < -60 && safeIndex < rooms.length - 1) setCurrentRoomIndex(i => i + 1)
    dragStartX.current = null; setDragDeltaX(0)
  }

  const activeDelta = touchStartX !== null ? touchDeltaX : (dragStartX.current !== null ? dragDeltaX : 0)
  const isAnimating = touchStartX === null && dragStartX.current === null

  const handleTableClick = (table: Table) => {
    if (table.status === 'empty') { setSelectedTable(table); setOpenModal(true) }
    else navigate(`/table/${table.id}`)
  }

  const handleOpen = (data: { customerName: string; guestCount: number; nominations: CastNomination[]; douhanCastId?: string }) => {
    if (!selectedTable) return
    dispatch({
      type: 'OPEN_TABLE',
      payload: {
        tableId: selectedTable.id,
        visitData: {
          tableId: selectedTable.id,
          customerName: data.customerName || undefined,
          guestCount: data.guestCount,
          nominations: data.nominations,
          douhanCastId: data.douhanCastId,
          checkInTime: new Date().toISOString(),
          setMinutes: 60,
        },
      },
    })
    setOpenModal(false)
    setSelectedTable(null)
  }

  const totalSales = state.payments.reduce((sum, p) => sum + p.total, 0)

  return (
    <div className="min-h-screen bg-[#f8f5ff] text-[#1a1040] flex flex-col">
      {/* Header — includes room tabs inline */}
      <header className="bg-[#1a1040] border-b border-[#2d1f60] px-4 py-2.5 flex items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-xs text-[#d4b870]/60">☽</span>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-[0.25em] text-[#d4b870] leading-none">LunaPos</div>
            <div className="text-[9px] font-semibold tracking-widest text-[#d4b870]/50 leading-none">Floor</div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[#9080c0] text-[10px] leading-none">売上</div>
          <div className="text-[#d4b870] font-bold text-sm">¥{totalSales.toLocaleString()}</div>
        </div>
        <div className="w-px h-8 bg-[#2d1f60] shrink-0" />
        <button onClick={() => navigate('/cast')} className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-[#2d1f60] border border-[#3d2f70] text-[#9080c0] cursor-pointer shrink-0">
          <UserCheck size={20} />
          <span className="text-[10px] font-semibold tracking-wider leading-none">キャスト</span>
        </button>
        <button onClick={() => navigate('/admin')} className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-[#2d1f60] border border-[#3d2f70] text-[#9080c0] cursor-pointer shrink-0">
          <Banknote size={20} />
          <span className="text-[10px] font-semibold tracking-wider leading-none">レジ</span>
        </button>
      </header>

      {/* Room tabs — below header */}
      <div className="bg-[#1a1040] border-b border-[#2d1f60] px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 sticky top-[57px] z-10">
        {rooms.map((room, i) => (
          <button
            key={room.id}
            onClick={() => setCurrentRoomIndex(i)}
            className={`shrink-0 flex-1 px-4 py-2 rounded-xl text-sm font-semibold tracking-wider transition-colors border cursor-pointer ${i === safeIndex ? 'bg-[#d4b870]/20 border-[#d4b870]/50 text-[#d4b870]' : 'bg-[#2d1f60] border-[#3d2f70] text-[#9080c0]'}`}
          >
            {room.name}
          </button>
        ))}
      </div>

      {/* Swipeable floor area */}
      <div
        className="flex-1 overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="flex h-full"
          style={{
            transform: `translateX(calc(-${safeIndex * 100}% + ${activeDelta}px))`,
            transition: isAnimating ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
          }}
        >
          {rooms.map(room => {
            const roomTables = state.tables.filter(t => t.roomId === room.id)
            const maxX = roomTables.length > 0 ? Math.max(...roomTables.map(t => t.position.x)) : 1
            const maxY = roomTables.length > 0 ? Math.max(...roomTables.map(t => t.position.y)) : 1
            const containerW = PAD * 2 + maxX * CARD_W + (maxX - 1) * GAP
            const containerH = PAD * 2 + maxY * CARD_H + (maxY - 1) * GAP
            return (
              <div key={room.id} className="min-w-full h-full overflow-auto">
                {roomTables.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-[#b8acd4]">
                    <p className="text-sm tracking-wider">テーブルがありません</p>
                    <p className="text-xs mt-1">管理画面でテーブルを割り当ててください</p>
                  </div>
                ) : (
                  <div style={{ position: 'relative', width: containerW, height: containerH, minWidth: '100%', minHeight: '100%' }}>
                    {roomTables.map(table => {
                      const visit = getVisit(table.visitId)
                      const totalSetMins = visit ? visit.setMinutes + (visit.extensionMinutes ?? 0) : 0
                      const elapsed = visit ? elapsedMinutes(visit.checkInTime) : 0
                      const remaining = visit ? totalSetMins - elapsed : 0
                      const isWarning = visit && !visit.isCheckedOut && remaining <= 10 && remaining >= 0
                      const isOvertime = visit && elapsed > totalSetMins
                      const left = PAD + (table.position.x - 1) * (CARD_W + GAP)
                      const top = PAD + (table.position.y - 1) * (CARD_H + GAP)
                      const cardTotal = (() => {
                        if (!visit) return 0
                        const setP = (state.setPlans.find(p => p.durationMinutes === visit.setMinutes)?.price ?? 0) * visit.guestCount
                        const nomF = visit.nominations.reduce((s, n) => s + (n.nominationType === 'main' ? NOMINATION_FEE_MAIN : n.nominationType === 'in_store' ? NOMINATION_FEE_IN_STORE : 0), 0)
                        const dohF = visit.douhanCastId ? DOUHAN_FEE : 0
                        const regO = visit.orderItems.filter(i => !i.isExpense).reduce((s, i) => s + i.price * i.quantity, 0)
                        const expO = visit.orderItems.filter(i => i.isExpense).reduce((s, i) => s + i.price * i.quantity, 0)
                        const sub = setP + nomF + dohF + regO
                        return sub + Math.floor(sub * SERVICE_RATE) + Math.floor(sub * TAX_RATE) + expO
                      })()
                      return (
                        <button
                          key={table.id}
                          onClick={() => handleTableClick(table)}
                          style={{ position: 'absolute', left, top, width: CARD_W, height: CARD_H }}
                          className={`rounded-xl border p-3 text-left transition-all active:scale-95 overflow-hidden cursor-pointer ${STATUS_COLOR[table.status]} ${(isWarning || isOvertime) ? 'ring-2 ring-red-400/60' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-base tracking-wider truncate mr-1">{table.name}</span>
                            <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[table.status]}`} />
                          </div>
                          {visit ? (
                            <>
                              {/* 入店時刻 + 人数 */}
                              <div className="flex items-center gap-1.5 mb-1 text-xs opacity-70">
                                <span>{formatHHMM(visit.checkInTime)} → {formatExitTime(visit.checkInTime, totalSetMins)}</span>
                                <span>·</span>
                                <span className="flex items-center gap-0.5"><User size={9} />{visit.guestCount}</span>
                                {visit.nominations.length > 0 && (() => {
                                  const firstCast = state.casts.find(c => c.id === visit.nominations[0].castId)
                                  return firstCast ? (
                                    <span className="flex items-center gap-0.5 truncate max-w-[60px]">
                                      <Sparkles size={8} className="shrink-0" /><span className="truncate">{firstCast.stageName}{visit.nominations.length > 1 ? `+${visit.nominations.length - 1}` : ''}</span>
                                    </span>
                                  ) : null
                                })()}
                              </div>
                              <ClockArc checkInTime={visit.checkInTime} setMinutes={totalSetMins} />
                              <div className="text-base font-bold mt-1 text-[#c9a456] truncate">
                                ¥{cardTotal.toLocaleString()}
                              </div>
                            </>
                          ) : (
                            <div className="text-xs text-[#b8acd4] mt-2 tracking-wider">空席</div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {openModal && selectedTable && (
        <OpenTableModal
          table={selectedTable}
          onClose={() => { setOpenModal(false); setSelectedTable(null) }}
          onOpen={handleOpen}
        />
      )}
    </div>
  )
}
