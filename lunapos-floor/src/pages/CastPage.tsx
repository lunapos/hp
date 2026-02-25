import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogIn, LogOut, TrendingUp, Plus, Camera, X, MapPin, Clock, Calendar } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import type { Cast } from '../types'

function formatTime(iso?: string): string {
  if (!iso) return '--:--'
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

function formatTimeSec(iso?: string): string {
  if (!iso) return '--:--:--'
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const EMPTY_FORM = { stageName: '', realName: '', photo: '', scheduledClockIn: '', scheduledClockOut: '', dropOffLocation: '' }

function AddCastModal({ onClose }: { onClose: () => void }) {
  const { dispatch } = useApp()
  const [form, setForm] = useState(EMPTY_FORM)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(f => ({ ...f, photo: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  function handleSubmit() {
    if (!form.stageName.trim()) return
    dispatch({
      type: 'ADD_CAST',
      payload: {
        stageName: form.stageName.trim(),
        realName: form.realName.trim(),
        photo: form.photo || undefined,
        scheduledClockIn: form.scheduledClockIn || undefined,
        scheduledClockOut: form.scheduledClockOut || undefined,
        dropOffLocation: form.dropOffLocation || undefined,
      },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white border border-[#e2d9f3] rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-widest text-[#c9a456] uppercase">New Cast</h2>
          <button onClick={onClose} className="p-1 text-[#7c6ea0]"><X size={22} /></button>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#e2d9f3] flex items-center justify-center bg-[#f3eeff] active:opacity-70">
            {form.photo ? (
              <img src={form.photo} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-[#7c6ea0]">
                <Camera size={28} />
                <span className="text-xs mt-1 tracking-wider">写真</span>
              </div>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          {form.photo && <button onClick={() => setForm(f => ({ ...f, photo: '' }))} className="text-xs text-red-500 tracking-wider">削除</button>}
        </div>
        <div>
          <label className="block text-xs text-[#7c6ea0] tracking-widest uppercase mb-1">源氏名 <span className="text-red-500">*</span></label>
          <input type="text" value={form.stageName} onChange={e => setForm(f => ({ ...f, stageName: e.target.value }))} placeholder="例: ゆい" className="w-full bg-[#f3eeff] border border-[#e2d9f3] rounded-xl px-4 py-3 text-[#1a1040] placeholder-[#b8acd4] focus:outline-none focus:border-[#c9a456]/50" />
        </div>
        <div>
          <label className="block text-xs text-[#7c6ea0] tracking-widest uppercase mb-1">本名</label>
          <input type="text" value={form.realName} onChange={e => setForm(f => ({ ...f, realName: e.target.value }))} placeholder="例: 山田 花子" className="w-full bg-[#f3eeff] border border-[#e2d9f3] rounded-xl px-4 py-3 text-[#1a1040] placeholder-[#b8acd4] focus:outline-none focus:border-[#c9a456]/50" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#7c6ea0] tracking-widest uppercase mb-1">出勤予定</label>
            <input type="text" value={form.scheduledClockIn} onChange={e => setForm(f => ({ ...f, scheduledClockIn: e.target.value }))} placeholder="19:00" className="w-full bg-[#f3eeff] border border-[#e2d9f3] rounded-xl px-4 py-3 text-[#1a1040] placeholder-[#b8acd4] focus:outline-none focus:border-[#c9a456]/50" />
          </div>
          <div>
            <label className="block text-xs text-[#7c6ea0] tracking-widest uppercase mb-1">退勤予定</label>
            <input type="text" value={form.scheduledClockOut} onChange={e => setForm(f => ({ ...f, scheduledClockOut: e.target.value }))} placeholder="24:00" className="w-full bg-[#f3eeff] border border-[#e2d9f3] rounded-xl px-4 py-3 text-[#1a1040] placeholder-[#b8acd4] focus:outline-none focus:border-[#c9a456]/50" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#7c6ea0] tracking-widest uppercase mb-1">送り先</label>
          <input type="text" value={form.dropOffLocation} onChange={e => setForm(f => ({ ...f, dropOffLocation: e.target.value }))} placeholder="例: 渋谷" className="w-full bg-[#f3eeff] border border-[#e2d9f3] rounded-xl px-4 py-3 text-[#1a1040] placeholder-[#b8acd4] focus:outline-none focus:border-[#c9a456]/50" />
        </div>
        <button onClick={handleSubmit} disabled={!form.stageName.trim()} className="w-full py-3 rounded-xl bg-[#1a1040] text-[#d4b870] font-bold tracking-widest disabled:opacity-30 active:opacity-80">
          追加する
        </button>
      </div>
    </div>
  )
}

function CastDetailPanel({ cast, onClose }: { cast: Cast; onClose: () => void }) {
  const { state, dispatch } = useApp()
  const [enlargePhoto, setEnlargePhoto] = useState(false)

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const nominations = state.visits.filter(v =>
    v.nominations.some(n => n.castId === cast.id && n.nominationType !== 'none') &&
    new Date(v.checkInTime) >= todayStart
  ).length
  const sales = state.payments.filter(p => {
    const visit = state.visits.find(v => v.id === p.visitId)
    return visit?.nominations.some(n => n.castId === cast.id) && new Date(p.paidAt) >= todayStart
  }).reduce((s, p) => s + p.total, 0)

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e2d9f3] rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex items-start gap-4 mb-4">
          <button onClick={() => setEnlargePhoto(true)} className="shrink-0">
            {cast.photo ? (
              <img src={cast.photo} alt={cast.stageName} className="w-20 h-20 rounded-full object-cover border-2 border-[#c9a456]/40 active:opacity-70" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#f3eeff] border-2 border-[#e2d9f3] flex items-center justify-center text-[#7c6ea0] text-2xl font-bold">
                {cast.stageName.charAt(0)}
              </div>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-xl font-bold text-[#1a1040]">{cast.stageName}</h2>
              <div className={`w-2 h-2 rounded-full ${cast.isWorking ? 'bg-emerald-500' : 'bg-[#c4b5fd]'}`} />
            </div>
            {cast.realName && <p className="text-sm text-[#7c6ea0]">{cast.realName}</p>}
            <div className={`text-xs mt-1 font-semibold tracking-wider ${cast.isWorking ? 'text-emerald-600' : 'text-[#7c6ea0]'}`}>
              {cast.isWorking ? '出勤中' : '未出勤'}
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: cast.isWorking ? 'CLOCK_OUT' : 'CLOCK_IN', payload: { castId: cast.id } })}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold tracking-wider border shrink-0 ${cast.isWorking ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}
          >
            {cast.isWorking ? <><LogOut size={14} />退勤</> : <><LogIn size={14} />出勤</>}
          </button>
        </div>

        {/* Shift info */}
        <div className="bg-[#f3eeff] border border-[#e2d9f3] rounded-xl p-3 mb-3 space-y-2">
          {(cast.scheduledClockIn || cast.scheduledClockOut) && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={13} className="text-[#7c6ea0] shrink-0" />
              <span className="text-[#7c6ea0] text-xs tracking-wider">シフト予定</span>
              <span className="text-[#1a1040] font-semibold">{cast.scheduledClockIn || '--:--'} 〜 {cast.scheduledClockOut || '--:--'}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Clock size={13} className="text-[#7c6ea0] shrink-0" />
            <span className="text-[#7c6ea0] text-xs tracking-wider">出勤</span>
            <span className="text-[#1a1040] font-semibold">{formatTime(cast.clockInTime)}</span>
            {cast.clockOutTime && (
              <>
                <span className="text-[#7c6ea0]">〜</span>
                <span className="text-[#1a1040] font-semibold">{formatTime(cast.clockOutTime)}</span>
              </>
            )}
          </div>
          {cast.dropOffLocation && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={13} className="text-[#7c6ea0] shrink-0" />
              <span className="text-[#7c6ea0] text-xs tracking-wider">送り先</span>
              <span className="text-[#1a1040] font-semibold">{cast.dropOffLocation}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#f3eeff] border border-[#e2d9f3] rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-[#1a1040]">{nominations}</div>
            <div className="text-xs text-[#7c6ea0] tracking-wider mt-1">指名</div>
          </div>
          <div className="bg-[#f3eeff] border border-[#e2d9f3] rounded-xl p-3 text-center">
            <div className="text-sm font-bold text-[#c9a456] flex items-center justify-center gap-0.5 mt-1">
              <TrendingUp size={11} />¥{sales.toLocaleString()}
            </div>
            <div className="text-xs text-[#7c6ea0] tracking-wider mt-1">売上</div>
          </div>
        </div>

        <button onClick={onClose} className="mt-4 w-full py-2.5 rounded-xl bg-[#f3eeff] border border-[#e2d9f3] text-[#7c6ea0] text-sm">閉じる</button>
      </div>

      {/* Enlarged photo overlay */}
      {enlargePhoto && cast.photo && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
          onClick={() => setEnlargePhoto(false)}
        >
          <img src={cast.photo} alt={cast.stageName} className="max-w-full max-h-full object-contain rounded-2xl" />
        </div>
      )}
    </>
  )
}

export default function CastPage() {
  const navigate = useNavigate()
  const { state } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [selectedCast, setSelectedCast] = useState<Cast | null>(null)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Sort: working first → scheduled not yet working → rest
  const sortedCasts = [...state.casts].sort((a, b) => {
    if (a.isWorking && !b.isWorking) return -1
    if (!a.isWorking && b.isWorking) return 1
    if (a.isWorking && b.isWorking) {
      return (a.clockInTime || '').localeCompare(b.clockInTime || '')
    }
    if (a.scheduledClockIn && b.scheduledClockIn) return a.scheduledClockIn.localeCompare(b.scheduledClockIn)
    if (a.scheduledClockIn && !b.scheduledClockIn) return -1
    if (!a.scheduledClockIn && b.scheduledClockIn) return 1
    return 0
  })

  const currentSelectedCast = selectedCast ? state.casts.find(c => c.id === selectedCast.id) ?? null : null

  return (
    <div className="min-h-screen bg-[#f8f5ff] text-[#1a1040]">
      <header className="bg-[#1a1040] border-b border-[#2d1f60] px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <div className="flex flex-col items-center shrink-0">
          <button onClick={() => navigate('/floor')} className="p-1 text-[#9080c0]"><ArrowLeft size={22} /></button>
          <span className="text-[#d4b870]/50 text-[9px] font-bold tracking-wider leading-none">LunaPos</span>
        </div>
        <h1 className="text-base font-bold tracking-[0.2em] text-[#d4b870] uppercase">Cast</h1>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-center">
            <div className="text-white font-mono font-bold text-sm tabular-nums tracking-wider">
              {formatTimeSec(now.toISOString())}
            </div>
            <div className="text-[#9080c0] text-xs tracking-wider">
              出勤 <span className="text-[#d4b870] font-semibold">{state.casts.filter(c => c.isWorking).length}</span> 名
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#d4b870] text-[#1a1040] text-sm font-bold tracking-wider active:opacity-80">
            <Plus size={15} />追加
          </button>
        </div>
      </header>

      {/* 5-column cast grid */}
      <div className="p-3 grid grid-cols-5 gap-2">
        {sortedCasts.map(cast => (
          <button
            key={cast.id}
            onClick={() => setSelectedCast(cast)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white border border-[#e2d9f3] active:scale-95 transition-transform shadow-sm"
          >
            <div className="relative">
              {cast.photo ? (
                <img src={cast.photo} alt={cast.stageName} className="w-14 h-14 rounded-full object-cover border border-[#e2d9f3]" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#f3eeff] border border-[#e2d9f3] flex items-center justify-center text-[#7c6ea0] text-xl font-semibold">
                  {cast.stageName.charAt(0)}
                </div>
              )}
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${cast.isWorking ? 'bg-emerald-500' : cast.scheduledClockIn ? 'bg-[#c9a456]/70' : 'bg-[#c4b5fd]'}`} />
            </div>
            <span className="text-xs text-[#1a1040] text-center truncate w-full leading-tight font-medium">{cast.stageName}</span>
            {cast.isWorking && cast.clockInTime && (
              <span className="text-[10px] text-emerald-600 leading-none font-semibold">{formatTime(cast.clockInTime)}〜</span>
            )}
            {!cast.isWorking && cast.scheduledClockIn && (
              <span className="text-[10px] text-[#7c6ea0] leading-none">{cast.scheduledClockIn}</span>
            )}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="px-3 pb-2 flex items-center gap-4 text-xs text-[#7c6ea0]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />出勤中</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#c9a456]/70 inline-block" />出勤予定</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#c4b5fd] inline-block" />休み</span>
      </div>

      {currentSelectedCast && (
        <CastDetailPanel
          cast={currentSelectedCast}
          onClose={() => setSelectedCast(null)}
        />
      )}
      {showAdd && <AddCastModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
