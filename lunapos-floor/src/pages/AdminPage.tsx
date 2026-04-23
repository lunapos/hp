import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, BarChart3, Users, ShoppingBag, Settings,
  TrendingUp, Clock, CreditCard, Star, Plus, Pencil, Trash2,
  Check, X, Camera, ChevronDown, ChevronUp, Banknote,
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import type { MenuCategory, Cast } from '../types'

type AdminTab = 'report' | 'cast' | 'menu' | 'settings'

const TAB_CONFIG: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'report', label: 'レポート', icon: <BarChart3 size={16} /> },
  { id: 'cast', label: 'キャスト', icon: <Users size={16} /> },
  { id: 'menu', label: 'メニュー', icon: <ShoppingBag size={16} /> },
  { id: 'settings', label: '設定', icon: <Settings size={16} /> },
]

// ---- Report Tab ----
function ReportTab() {
  const { state, dispatch } = useApp()
  const [registerInput, setRegisterInput] = useState(String(state.registerStartAmount ?? 0))
  const [withdrawalInput, setWithdrawalInput] = useState('')
  const [withdrawalNote, setWithdrawalNote] = useState('')

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayPayments = state.payments.filter(p => new Date(p.paidAt) >= todayStart)
  const todayVisits = state.visits.filter(v => new Date(v.checkInTime) >= todayStart)
  const totalSales = todayPayments.reduce((s, p) => s + p.total, 0)
  const totalGroups = todayVisits.length
  const totalGuests = todayVisits.reduce((s, v) => s + v.guestCount, 0)
  const avgSpend = totalGroups > 0 ? Math.floor(totalSales / totalGroups) : 0
  const checkedOut = todayVisits.filter(v => v.isCheckedOut && v.checkOutTime)
  const avgStayMin = checkedOut.length > 0 ? Math.floor(checkedOut.reduce((s, v) => {
    const stay = (new Date(v.checkOutTime!).getTime() - new Date(v.checkInTime).getTime()) / 60000
    return s + stay
  }, 0) / checkedOut.length) : 0

  const methodTotals = todayPayments.reduce<Record<string, number>>((acc, p) => {
    acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.total; return acc
  }, {})
  const methodLabels: Record<string, string> = { cash: '現金', credit: 'カード', electronic: '電子マネー', tab: 'ツケ' }

  const castPerf = state.casts.map(cast => {
    const nominations = todayVisits.filter(v =>
      v.nominations.some(n => n.castId === cast.id && n.nominationType !== 'none')
    ).length
    const sales = todayPayments.filter(p => {
      const visit = state.visits.find(v => v.id === p.visitId)
      return visit?.nominations.some(n => n.castId === cast.id)
    }).reduce((s, p) => s + p.total, 0)
    return { cast, nominations, sales }
  }).filter(c => c.nominations > 0 || c.sales > 0).sort((a, b) => b.sales - a.sales)

  const cashReceived = todayPayments.filter(p => p.paymentMethod === 'cash').reduce((s, p) => s + p.total, 0)
  const todayWithdrawals = (state.cashWithdrawals ?? []).filter(w => new Date(w.createdAt) >= todayStart)
  const totalWithdrawn = todayWithdrawals.reduce((s, w) => s + w.amount, 0)
  const expectedCash = (state.registerStartAmount ?? 0) + cashReceived - totalWithdrawn

  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '本日売上', value: `¥${totalSales.toLocaleString()}`, icon: <TrendingUp size={16} />, gold: true },
          { label: '来店組数', value: `${totalGroups}組`, sub: `${totalGuests}名`, icon: <Users size={16} /> },
          { label: '客単価', value: `¥${avgSpend.toLocaleString()}`, sub: '1組あたり', icon: <CreditCard size={16} /> },
          { label: '平均滞在', value: avgStayMin > 0 ? `${avgStayMin}分` : '--', icon: <Clock size={16} /> },
        ].map(({ label, value, sub, icon, gold }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-[#e2d9f3] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#7c6ea0] text-xs tracking-widest uppercase">{label}</span>
              <span className="text-[#c4b5fd]">{icon}</span>
            </div>
            <div className={`text-2xl font-bold ${gold ? 'text-[#c9a456]' : 'text-[#1a1040]'}`}>{value}</div>
            {sub && <div className="text-xs text-[#7c6ea0] mt-1 tracking-wider">{sub}</div>}
          </div>
        ))}
      </div>

      {/* 支払い方法 */}
      {Object.keys(methodTotals).length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-[#e2d9f3] shadow-sm">
          <h2 className="text-xs font-semibold text-[#7c6ea0] tracking-widest uppercase mb-3">支払い方法</h2>
          <div className="space-y-2">
            {Object.entries(methodTotals).map(([method, amount]) => (
              <div key={method} className="flex items-center justify-between">
                <span className="text-sm text-[#1a1040] tracking-wider">{methodLabels[method] || method}</span>
                <span className="text-[#c9a456] font-bold">¥{amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* レジ締め */}
      <div className="bg-white rounded-xl p-4 border border-[#e2d9f3] shadow-sm">
        <h2 className="text-xs font-semibold text-[#7c6ea0] tracking-widest uppercase mb-3">
          <Banknote size={12} className="inline mr-1.5" />レジ締め
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#7c6ea0] w-24 shrink-0">スタート金</span>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[#7c6ea0] text-sm">¥</span>
              <input
                type="number"
                value={registerInput}
                onChange={e => setRegisterInput(e.target.value)}
                className="flex-1 bg-[#f3eeff] border border-[#e2d9f3] rounded-lg px-3 py-1.5 text-sm text-[#1a1040] outline-none focus:border-[#c9a456]/50"
              />
              <button
                onClick={() => {
                  const v = parseInt(registerInput)
                  if (!isNaN(v)) dispatch({ type: 'SET_REGISTER_START', payload: { amount: v } })
                }}
                className="px-3 py-1.5 rounded-lg bg-[#1a1040] text-[#d4b870] text-xs font-bold"
              >SET</button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-[#e2d9f3]">
            <span className="text-sm text-[#7c6ea0] w-24 shrink-0">出金記録</span>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="number"
                placeholder="金額"
                value={withdrawalInput}
                onChange={e => setWithdrawalInput(e.target.value)}
                className="w-24 bg-[#f3eeff] border border-[#e2d9f3] rounded-lg px-3 py-1.5 text-sm text-[#1a1040] outline-none focus:border-[#c9a456]/50"
              />
              <input
                type="text"
                placeholder="メモ"
                value={withdrawalNote}
                onChange={e => setWithdrawalNote(e.target.value)}
                className="flex-1 bg-[#f3eeff] border border-[#e2d9f3] rounded-lg px-3 py-1.5 text-sm text-[#1a1040] outline-none focus:border-[#c9a456]/50"
              />
              <button
                onClick={() => {
                  const v = parseInt(withdrawalInput)
                  if (!isNaN(v) && v > 0) {
                    dispatch({ type: 'ADD_CASH_WITHDRAWAL', payload: { amount: v, note: withdrawalNote || undefined } })
                    setWithdrawalInput('')
                    setWithdrawalNote('')
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-bold shrink-0"
              >出金</button>
            </div>
          </div>

          {todayWithdrawals.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-[#e2d9f3]">
              {todayWithdrawals.map((w, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-[#7c6ea0]">{w.note || '出金'} <span className="text-[#b8acd4]">{new Date(w.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span></span>
                  <span className="text-red-500">−¥{w.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-[#e2d9f3] space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-[#7c6ea0]">スタート金</span>
              <span className="text-[#1a1040]">¥{(state.registerStartAmount ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#7c6ea0]">現金入金計</span>
              <span className="text-[#1a1040]">+¥{cashReceived.toLocaleString()}</span>
            </div>
            {totalWithdrawn > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#7c6ea0]">出金計</span>
                <span className="text-red-500">−¥{totalWithdrawn.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-[#c9a456] text-base pt-1 border-t border-[#e2d9f3]">
              <span>予測現金残高</span>
              <span>¥{expectedCash.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {castPerf.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-[#e2d9f3] shadow-sm">
          <h2 className="text-xs font-semibold text-[#7c6ea0] tracking-widest uppercase mb-3">
            <Star size={12} className="inline mr-1" />Cast Ranking
          </h2>
          <div className="space-y-2">
            {castPerf.map(({ cast, nominations, sales }, idx) => (
              <div key={cast.id} className="flex items-center gap-3">
                <span className={`text-sm font-bold w-5 ${idx === 0 ? 'text-[#c9a456]' : 'text-[#b8acd4]'}`}>{idx + 1}</span>
                {cast.photo ? (
                  <img src={cast.photo} alt={cast.stageName} className="w-7 h-7 rounded-full object-cover border border-[#e2d9f3]" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#f3eeff] border border-[#e2d9f3] flex items-center justify-center text-xs text-[#7c6ea0]">{cast.stageName.charAt(0)}</div>
                )}
                <span className="flex-1 text-sm text-[#1a1040]">{cast.stageName}</span>
                <span className="text-xs text-[#7c6ea0] tracking-wider">指名{nominations}件</span>
                <span className="text-sm font-bold text-[#c9a456]">¥{sales.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {todayPayments.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-[#e2d9f3] shadow-sm">
          <h2 className="text-xs font-semibold text-[#7c6ea0] tracking-widest uppercase mb-3">会計履歴</h2>
          <div className="space-y-2">
            {todayPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-[#1a1040]">{p.customerName || '—'}</span>
                  <span className="text-[#7c6ea0] text-xs ml-2">{new Date(p.paidAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#c9a456] font-bold">¥{p.total.toLocaleString()}</span>
                  <span className="text-[#7c6ea0] text-xs ml-2">{methodLabels[p.paymentMethod]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {totalGroups === 0 && (
        <div className="text-center py-16 text-[#b8acd4]">
          <p className="text-sm tracking-widest">NO DATA TODAY</p>
        </div>
      )}
    </div>
  )
}

// ---- Cast Management Tab ----
const EMPTY_CAST_FORM = { stageName: '', realName: '', photo: '', scheduledClockIn: '', scheduledClockOut: '', dropOffLocation: '' }

function CastManagementTab() {
  const { state, dispatch } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_CAST_FORM)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileRef = useRef<HTMLInputElement>(null)

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayPayments = state.payments.filter(p => new Date(p.paidAt) >= todayStart)
  const todayVisits = state.visits.filter(v => new Date(v.checkInTime) >= todayStart)

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(f => ({ ...f, photo: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  function handleAdd() {
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
    setForm(EMPTY_CAST_FORM)
    setShowAdd(false)
  }

  function startEdit(cast: Cast) {
    setEditingId(cast.id)
    setForm({
      stageName: cast.stageName,
      realName: cast.realName || '',
      photo: cast.photo || '',
      scheduledClockIn: cast.scheduledClockIn || '',
      scheduledClockOut: cast.scheduledClockOut || '',
      dropOffLocation: cast.dropOffLocation || '',
    })
  }

  function saveEdit() {
    if (!editingId || !form.stageName.trim()) return
    dispatch({
      type: 'UPDATE_CAST',
      payload: {
        id: editingId,
        stageName: form.stageName.trim(),
        realName: form.realName.trim(),
        photo: form.photo || undefined,
        scheduledClockIn: form.scheduledClockIn || undefined,
        scheduledClockOut: form.scheduledClockOut || undefined,
        dropOffLocation: form.dropOffLocation || undefined,
      },
    })
    setEditingId(null)
  }

  return (
    <div className="p-4 space-y-3">
      <button onClick={() => { setShowAdd(true); setForm(EMPTY_CAST_FORM) }} className="w-full py-3 rounded-xl bg-[#1a1040] text-[#d4b870] font-bold tracking-wider flex items-center justify-center gap-2">
        <Plus size={16} />キャストを追加
      </button>

      {(showAdd || editingId) && (
        <div className="bg-white border border-[#e2d9f3] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs text-[#c9a456] tracking-widest uppercase">{editingId ? 'Edit Cast' : 'New Cast'}</h3>
            <button onClick={() => { setShowAdd(false); setEditingId(null) }} className="text-[#7c6ea0]"><X size={16} /></button>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button onClick={() => (editingId ? editFileRef : fileInputRef).current?.click()} className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#e2d9f3] flex items-center justify-center bg-[#f3eeff]">
              {form.photo ? <img src={form.photo} alt="" className="w-full h-full object-cover" /> : (
                <div className="flex flex-col items-center text-[#7c6ea0]"><Camera size={24} /><span className="text-xs mt-1">写真</span></div>
              )}
            </button>
            <input ref={editingId ? editFileRef : fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhoto(e)} />
            {form.photo && <button onClick={() => setForm(f => ({ ...f, photo: '' }))} className="text-xs text-red-500">削除</button>}
          </div>
          <input type="text" placeholder="源氏名 *" value={form.stageName} onChange={e => setForm(f => ({ ...f, stageName: e.target.value }))} className="w-full bg-[#f3eeff] border border-[#e2d9f3] rounded-xl px-4 py-3 text-[#1a1040] placeholder-[#b8acd4] outline-none focus:border-[#c9a456]/50" />
          <input type="text" placeholder="本名" value={form.realName} onChange={e => setForm(f => ({ ...f, realName: e.target.value }))} className="w-full bg-[#f3eeff] border border-[#e2d9f3] rounded-xl px-4 py-3 text-[#1a1040] placeholder-[#b8acd4] outline-none focus:border-[#c9a456]/50" />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="出勤予定 19:00" value={form.scheduledClockIn} onChange={e => setForm(f => ({ ...f, scheduledClockIn: e.target.value }))} className="bg-[#f3eeff] border border-[#e2d9f3] rounded-xl px-4 py-3 text-[#1a1040] placeholder-[#b8acd4] outline-none focus:border-[#c9a456]/50 text-sm" />
            <input type="text" placeholder="退勤予定 24:00" value={form.scheduledClockOut} onChange={e => setForm(f => ({ ...f, scheduledClockOut: e.target.value }))} className="bg-[#f3eeff] border border-[#e2d9f3] rounded-xl px-4 py-3 text-[#1a1040] placeholder-[#b8acd4] outline-none focus:border-[#c9a456]/50 text-sm" />
          </div>
          <input type="text" placeholder="送り先" value={form.dropOffLocation} onChange={e => setForm(f => ({ ...f, dropOffLocation: e.target.value }))} className="w-full bg-[#f3eeff] border border-[#e2d9f3] rounded-xl px-4 py-3 text-[#1a1040] placeholder-[#b8acd4] outline-none focus:border-[#c9a456]/50" />
          <button onClick={editingId ? saveEdit : handleAdd} disabled={!form.stageName.trim()} className="w-full py-3 rounded-xl bg-[#1a1040] text-[#d4b870] font-bold disabled:opacity-30">
            {editingId ? '保存' : '追加する'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {state.casts.map(cast => {
          const noms = todayVisits.filter(v => v.nominations.some(n => n.castId === cast.id && n.nominationType !== 'none')).length
          const sales = todayPayments.filter(p => {
            const v = state.visits.find(vv => vv.id === p.visitId)
            return v?.nominations.some(n => n.castId === cast.id)
          }).reduce((s, p) => s + p.total, 0)
          return (
            <div key={cast.id} className="bg-white border border-[#e2d9f3] rounded-xl p-3 flex items-center gap-3 shadow-sm">
              {cast.photo ? (
                <img src={cast.photo} alt={cast.stageName} className="w-10 h-10 rounded-full object-cover border border-[#e2d9f3]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#f3eeff] border border-[#e2d9f3] flex items-center justify-center text-[#7c6ea0] font-semibold">{cast.stageName.charAt(0)}</div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[#1a1040] font-semibold text-sm">{cast.stageName}</span>
                {cast.realName && <p className="text-xs text-[#7c6ea0]">{cast.realName}</p>}
                <div className="flex items-center gap-3 mt-0.5">
                  {cast.scheduledClockIn && (
                    <span className="text-xs text-[#7c6ea0]">{cast.scheduledClockIn}〜{cast.scheduledClockOut || ''}</span>
                  )}
                  {noms > 0 && <span className="text-xs text-[#7c6ea0]">指名 <span className="text-[#1a1040]">{noms}</span></span>}
                  {sales > 0 && <span className="text-xs text-[#c9a456] font-semibold">¥{sales.toLocaleString()}</span>}
                </div>
              </div>
              <button onClick={() => startEdit(cast)} className="p-1.5 rounded-lg bg-[#f3eeff] text-[#7c6ea0] hover:text-[#c9a456]"><Pencil size={14} /></button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---- Menu Management Tab ----
const MENU_CATEGORY_LABEL: Record<MenuCategory, string> = {
  drink: 'ドリンク', bottle: 'ボトル', food: 'フード', ladies_drink: 'レディース', other: 'その他',
}

function MenuManagementTab() {
  const { state, dispatch } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', price: '', category: 'drink' as MenuCategory })
  const [expandedCat, setExpandedCat] = useState<MenuCategory | null>('drink')

  const categories = Object.keys(MENU_CATEGORY_LABEL) as MenuCategory[]
  const itemsByCategory = (cat: MenuCategory) => state.menuItems.filter(m => m.category === cat)

  return (
    <div className="p-4 space-y-3">
      <button onClick={() => setShowAdd(v => !v)} className="w-full py-3 rounded-xl bg-[#1a1040] text-[#d4b870] font-bold tracking-wider flex items-center justify-center gap-2">
        <Plus size={16} />メニューを追加
      </button>

      {showAdd && (
        <div className="bg-white border border-[#e2d9f3] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs text-[#c9a456] tracking-widest uppercase">New Menu Item</h3>
            <button onClick={() => setShowAdd(false)} className="text-[#7c6ea0]"><X size={16} /></button>
          </div>
          <select value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value as MenuCategory }))} className="w-full bg-[#f3eeff] border border-[#e2d9f3] rounded-xl px-4 py-3 text-[#1a1040] outline-none focus:border-[#c9a456]/50">
            {categories.map(c => <option key={c} value={c}>{MENU_CATEGORY_LABEL[c]}</option>)}
          </select>
          <input type="text" placeholder="商品名" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-[#f3eeff] border border-[#e2d9f3] rounded-xl px-4 py-3 text-[#1a1040] placeholder-[#b8acd4] outline-none focus:border-[#c9a456]/50" />
          <input type="number" placeholder="価格" value={addForm.price} onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))} className="w-full bg-[#f3eeff] border border-[#e2d9f3] rounded-xl px-4 py-3 text-[#1a1040] placeholder-[#b8acd4] outline-none focus:border-[#c9a456]/50" />
          <button
            onClick={() => {
              const p = parseInt(addForm.price)
              if (!addForm.name.trim() || isNaN(p) || p <= 0) return
              dispatch({ type: 'ADD_MENU_ITEM', payload: { name: addForm.name.trim(), price: p, category: addForm.category } })
              setAddForm({ name: '', price: '', category: 'drink' })
              setShowAdd(false)
            }}
            disabled={!addForm.name.trim() || !addForm.price}
            className="w-full py-3 rounded-xl bg-[#1a1040] text-[#d4b870] font-bold disabled:opacity-30"
          >
            追加する
          </button>
        </div>
      )}

      {categories.map(cat => (
        <div key={cat} className="bg-white border border-[#e2d9f3] rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => setExpandedCat(expandedCat === cat ? null : cat)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-sm font-semibold text-[#1a1040] tracking-wider">{MENU_CATEGORY_LABEL[cat]}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7c6ea0]">{itemsByCategory(cat).length}件</span>
              {expandedCat === cat ? <ChevronUp size={16} className="text-[#7c6ea0]" /> : <ChevronDown size={16} className="text-[#7c6ea0]" />}
            </div>
          </button>
          {expandedCat === cat && (
            <div className="border-t border-[#e2d9f3] divide-y divide-[#e2d9f3]">
              {itemsByCategory(cat).map(item => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#1a1040]">{item.name}</div>
                    <div className="text-xs text-[#c9a456]">¥{item.price.toLocaleString()}</div>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_MENU_ITEM', payload: { id: item.id } })}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${item.isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-[#f3eeff] border-[#e2d9f3] text-[#7c6ea0]'}`}
                  >
                    {item.isActive ? '提供中' : '停止中'}
                  </button>
                </div>
              ))}
              {itemsByCategory(cat).length === 0 && (
                <p className="text-center text-xs text-[#b8acd4] py-4">メニューなし</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ---- Visual Table Position Editor ----
const GRID_COLS = 8
const GRID_ROWS = 5

function TablePositionEditor() {
  const { state, dispatch } = useApp()
  const [activeRoomId, setActiveRoomId] = useState(state.rooms[0]?.id ?? '')
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null)

  const roomTables = state.tables.filter(t => t.roomId === activeRoomId)
  const cellMap: Record<string, string> = {}
  roomTables.forEach(t => { cellMap[`${t.position.x},${t.position.y}`] = t.id })

  const handleDrop = (x: number, y: number) => {
    if (!draggingTableId) return
    const targetKey = `${x},${y}`
    const targetTableId = cellMap[targetKey]
    const draggingTable = state.tables.find(t => t.id === draggingTableId)
    if (!draggingTable) return

    if (targetTableId && targetTableId !== draggingTableId) {
      dispatch({ type: 'UPDATE_TABLE_POSITION', payload: { tableId: draggingTableId, position: { x, y } } })
      dispatch({ type: 'UPDATE_TABLE_POSITION', payload: { tableId: targetTableId, position: { x: draggingTable.position.x, y: draggingTable.position.y } } })
    } else if (!targetTableId) {
      dispatch({ type: 'UPDATE_TABLE_POSITION', payload: { tableId: draggingTableId, position: { x, y } } })
    }
    setDraggingTableId(null)
  }

  return (
    <div>
      {/* Room tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {state.rooms.map(room => (
          <button
            key={room.id}
            onClick={() => setActiveRoomId(room.id)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${activeRoomId === room.id ? 'bg-[#1a1040] border-[#1a1040] text-[#d4b870]' : 'bg-[#f3eeff] border-[#e2d9f3] text-[#7c6ea0]'}`}
          >
            {room.name}
          </button>
        ))}
      </div>

      <p className="text-xs text-[#7c6ea0] mb-3">テーブルをドラッグして配置を変更できます</p>

      {/* Grid */}
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
        onDragOver={e => e.preventDefault()}
      >
        {Array.from({ length: GRID_ROWS }, (_, row) =>
          Array.from({ length: GRID_COLS }, (_, col) => {
            const x = col + 1
            const y = row + 1
            const key = `${x},${y}`
            const tableId = cellMap[key]
            const table = tableId ? state.tables.find(t => t.id === tableId) : null
            const isDragging = table?.id === draggingTableId

            return (
              <div
                key={key}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(x, y)}
                className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center transition-colors
                  ${table ? 'border-[#e2d9f3]' : 'border-[#ede8ff] hover:border-[#c4b5fd]'}`}
              >
                {table && (
                  <div
                    draggable
                    onDragStart={() => setDraggingTableId(table.id)}
                    onDragEnd={() => setDraggingTableId(null)}
                    className={`w-full h-full flex flex-col items-center justify-center rounded-md cursor-grab active:cursor-grabbing select-none transition-opacity
                      ${table.status === 'occupied' ? 'bg-[#f0fdf4] border border-[#86efac]' : 'bg-white border border-[#e2d9f3]'}
                      ${isDragging ? 'opacity-40' : ''}`}
                  >
                    <span className="text-[#1a1040] text-xs font-bold leading-tight text-center px-0.5 truncate w-full">{table.name}</span>
                    {table.status === 'occupied' && <span className="text-emerald-500 text-[8px]">●</span>}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <p className="text-xs text-[#b8acd4] mt-2 text-center">{GRID_COLS}列 × {GRID_ROWS}行</p>
    </div>
  )
}

// ---- Settings Tab ----
function SettingsTab() {
  const { state, dispatch } = useApp()
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null)
  const [editRoomName, setEditRoomName] = useState('')
  const [addingRoom, setAddingRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')

  return (
    <div className="p-4 space-y-4">
      {/* Room management */}
      <div className="bg-white border border-[#e2d9f3] rounded-xl p-4 shadow-sm">
        <h2 className="text-xs font-semibold text-[#7c6ea0] tracking-widest uppercase mb-3">部屋管理</h2>
        <div className="space-y-2">
          {state.rooms.map(room => (
            <div key={room.id} className="flex items-center gap-2 bg-[#f3eeff] border border-[#e2d9f3] rounded-xl px-4 py-3">
              {editingRoomId === room.id ? (
                <>
                  <input className="flex-1 bg-white text-[#1a1040] rounded-lg px-3 py-1.5 text-sm outline-none border border-[#c9a456]/50" value={editRoomName} onChange={e => setEditRoomName(e.target.value)} autoFocus />
                  <button onClick={() => { if (editRoomName.trim()) { dispatch({ type: 'UPDATE_ROOM', payload: { id: room.id, name: editRoomName.trim() } }); setEditingRoomId(null) } }} className="p-1.5 rounded-lg bg-[#1a1040] text-[#d4b870]"><Check size={14} /></button>
                  <button onClick={() => setEditingRoomId(null)} className="p-1.5 rounded-lg bg-white text-[#7c6ea0]"><X size={14} /></button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-[#1a1040] text-sm">{room.name}</span>
                  <span className="text-xs text-[#7c6ea0] mr-2">{state.tables.filter(t => t.roomId === room.id).length} tables</span>
                  <button onClick={() => { setEditingRoomId(room.id); setEditRoomName(room.name) }} className="p-1.5 rounded-lg bg-white text-[#7c6ea0]"><Pencil size={14} /></button>
                  <button onClick={() => state.rooms.length > 1 && dispatch({ type: 'DELETE_ROOM', payload: { id: room.id } })} disabled={state.rooms.length <= 1} className={`p-1.5 rounded-lg ${state.rooms.length <= 1 ? 'bg-white text-[#b8acd4] cursor-not-allowed' : 'bg-white text-red-500'}`}><Trash2 size={14} /></button>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3">
          {addingRoom ? (
            <div className="flex items-center gap-2">
              <input className="flex-1 bg-[#f3eeff] text-[#1a1040] rounded-xl px-4 py-3 text-sm outline-none border border-[#c9a456]/50" placeholder="部屋名を入力" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} autoFocus />
              <button onClick={() => { if (newRoomName.trim()) { dispatch({ type: 'ADD_ROOM', payload: { name: newRoomName.trim() } }); setNewRoomName(''); setAddingRoom(false) } }} className="px-4 py-3 rounded-xl bg-[#1a1040] text-[#d4b870] font-semibold text-sm">追加</button>
              <button onClick={() => { setAddingRoom(false); setNewRoomName('') }} className="px-3 py-3 rounded-xl bg-[#f3eeff] text-[#7c6ea0]"><X size={16} /></button>
            </div>
          ) : (
            <button onClick={() => setAddingRoom(true)} className="w-full py-3 rounded-xl border border-dashed border-[#c4b5fd] text-[#7c6ea0] text-sm flex items-center justify-center gap-2">
              <Plus size={16} />部屋を追加
            </button>
          )}
        </div>
      </div>

      {/* Table room assignment */}
      <div className="bg-white border border-[#e2d9f3] rounded-xl p-4 shadow-sm">
        <h2 className="text-xs font-semibold text-[#7c6ea0] tracking-widest uppercase mb-3">テーブル割り当て</h2>
        <div className="space-y-2">
          {state.tables.map(table => (
            <div key={table.id} className="flex items-center gap-3 bg-[#f3eeff] border border-[#e2d9f3] rounded-xl px-4 py-3">
              <span className="text-[#1a1040] text-sm w-20 shrink-0">{table.name}</span>
              <select value={table.roomId} onChange={e => dispatch({ type: 'MOVE_TABLE_ROOM', payload: { tableId: table.id, roomId: e.target.value } })} className="flex-1 bg-white text-[#1a1040] rounded-lg px-3 py-1.5 text-sm outline-none border border-[#e2d9f3] focus:border-[#c9a456]/50">
                {state.rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Visual table position editor */}
      <div className="bg-white border border-[#e2d9f3] rounded-xl p-4 shadow-sm">
        <h2 className="text-xs font-semibold text-[#7c6ea0] tracking-widest uppercase mb-3">テーブル配置（ドラッグ）</h2>
        <TablePositionEditor />
      </div>
    </div>
  )
}

// ---- Admin Page ----
export default function AdminPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<AdminTab>('report')

  return (
    <div className="min-h-screen bg-[#f8f5ff] text-[#1a1040] flex flex-col">
      <header className="bg-[#1a1040] border-b border-[#2d1f60] px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <div className="flex flex-col items-center shrink-0">
          <button onClick={() => navigate('/floor')} className="p-1 text-[#9080c0]"><ArrowLeft size={22} /></button>
          <span className="text-[#d4b870]/50 text-[9px] font-bold tracking-wider leading-none">LunaPos</span>
        </div>
        <div>
          <h1 className="text-base font-bold tracking-[0.2em] text-[#d4b870]">レジ</h1>
        </div>
      </header>

      <div className="flex border-b border-[#e2d9f3] bg-white sticky top-[57px] z-10">
        {TAB_CONFIG.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold tracking-wider border-b-2 transition-colors ${tab === t.id ? 'border-[#c9a456] text-[#c9a456]' : 'border-transparent text-[#7c6ea0]'}`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'report' && <ReportTab />}
        {tab === 'cast' && <CastManagementTab />}
        {tab === 'menu' && <MenuManagementTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}
