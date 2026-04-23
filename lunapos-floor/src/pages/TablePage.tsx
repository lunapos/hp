import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Minus, Trash2, CreditCard, Clock, Users, Sparkles, Receipt, ArrowRightLeft, X, Timer } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import type { MenuCategory, NominationType, CastNomination, Visit } from '../types'
import { NOMINATION_FEE_MAIN, NOMINATION_FEE_IN_STORE, DOUHAN_FEE, SERVICE_RATE, TAX_RATE } from '../data/constants'

const CATEGORY_LABEL: Record<MenuCategory | 'expense', string> = {
  drink: 'ドリンク',
  bottle: 'ボトル',
  food: 'フード',
  ladies_drink: 'レディース',
  other: 'その他',
  expense: '建て替え',
}

const CATEGORY_COLOR: Record<MenuCategory, string> = {
  drink: 'bg-blue-50 border-blue-200 text-blue-700',
  bottle: 'bg-violet-50 border-violet-200 text-violet-700',
  food: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  ladies_drink: 'bg-rose-50 border-rose-200 text-rose-700',
  other: 'bg-gray-50 border-gray-200 text-gray-600',
}

const CATEGORY_ACTIVE: Record<MenuCategory | 'expense', string> = {
  drink: 'bg-blue-600 text-white border-blue-600',
  bottle: 'bg-violet-600 text-white border-violet-600',
  food: 'bg-emerald-600 text-white border-emerald-600',
  ladies_drink: 'bg-rose-600 text-white border-rose-600',
  other: 'bg-gray-600 text-white border-gray-600',
  expense: 'bg-amber-600 text-white border-amber-600',
}

function formatElapsed(checkInTime: string): string {
  const elapsed = Math.floor((Date.now() - new Date(checkInTime).getTime()) / 60000)
  const h = Math.floor(elapsed / 60)
  const m = elapsed % 60
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}` : `${m}分`
}

type ActiveCategory = MenuCategory | 'expense'

// ---- Move Table Modal ----
function MoveTableModal({ currentTableId, onMove, onClose }: {
  currentTableId: string
  onMove: (toTableId: string) => void
  onClose: () => void
}) {
  const { state } = useApp()
  const emptyTables = state.tables.filter(t => t.id !== currentTableId && t.status === 'empty')
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white border border-[#e2d9f3] rounded-2xl w-full max-w-sm p-5 shadow-xl">
        <h2 className="text-sm font-semibold tracking-widest text-[#c9a456] uppercase mb-4">卓移動先を選択</h2>
        {emptyTables.length === 0 ? (
          <p className="text-sm text-[#7c6ea0] text-center py-4">空きテーブルがありません</p>
        ) : (
          <div className="space-y-2">
            {emptyTables.map(t => {
              const room = state.rooms.find(r => r.id === t.roomId)
              return (
                <button
                  key={t.id}
                  onClick={() => onMove(t.id)}
                  className="w-full flex items-center justify-between bg-[#f3eeff] border border-[#e2d9f3] rounded-xl px-4 py-3 hover:bg-[#e8e0f5] hover:border-[#c9a456]/40 active:border-[#c9a456]/50 transition-colors"
                >
                  <span className="text-[#1a1040] font-semibold">{t.name}</span>
                  <span className="text-xs text-[#7c6ea0]">{room?.name}</span>
                </button>
              )
            })}
          </div>
        )}
        <button onClick={onClose} className="mt-4 w-full py-2.5 rounded-xl bg-[#f3eeff] border border-[#e2d9f3] text-[#7c6ea0] text-sm hover:bg-[#e8e0f5] active:bg-[#d4c8f0] transition-colors">キャンセル</button>
      </div>
    </div>
  )
}

interface CastEntry { castId: string; nominationType: NominationType; isDouhan: boolean }

// ---- Nomination Edit Modal ----
function NominationModal({ visitId, currentNominations, currentDouhanCastId, onClose }: {
  visitId: string
  currentNominations: CastNomination[]
  currentDouhanCastId?: string
  onClose: () => void
}) {
  const { state, dispatch } = useApp()
  const workingCasts = state.casts.filter(c => c.isWorking)

  const buildInitialEntries = (): CastEntry[] => {
    const allCastIds = new Set<string>()
    currentNominations.forEach(n => allCastIds.add(n.castId))
    if (currentDouhanCastId) allCastIds.add(currentDouhanCastId)
    if (allCastIds.size === 0) return [{ castId: '', nominationType: 'none', isDouhan: false }]
    return Array.from(allCastIds).map(castId => {
      const nom = currentNominations.find(n => n.castId === castId)
      return { castId, nominationType: nom?.nominationType ?? 'none', isDouhan: castId === currentDouhanCastId }
    })
  }

  const [entries, setEntries] = useState<CastEntry[]>(buildInitialEntries)

  const addEntry = () => setEntries(prev => [...prev, { castId: '', nominationType: 'none', isDouhan: false }])
  const removeEntry = (i: number) => setEntries(prev => prev.filter((_, idx) => idx !== i))
  const updateEntry = (i: number, field: 'castId' | 'nominationType', value: string) => {
    setEntries(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e))
  }
  const toggleDouhan = (i: number) => {
    setEntries(prev => prev.map((e, idx) => ({ ...e, isDouhan: idx === i ? !e.isDouhan : false })))
  }

  const handleSave = () => {
    const nominations: CastNomination[] = entries
      .filter(e => e.castId && (e.nominationType === 'in_store' || e.nominationType === 'main'))
      .map(e => ({ castId: e.castId, nominationType: e.nominationType }))
    const douhanEntry = entries.find(e => e.castId && e.isDouhan)
    dispatch({
      type: 'UPDATE_VISIT_NOMINATIONS',
      payload: { visitId, nominations, douhanCastId: douhanEntry?.castId },
    })
    onClose()
  }

  const totalFee = entries.reduce((sum, e) => {
    let fee = 0
    if (e.nominationType === 'main') fee += NOMINATION_FEE_MAIN
    if (e.nominationType === 'in_store') fee += NOMINATION_FEE_IN_STORE
    if (e.isDouhan) fee += DOUHAN_FEE
    return sum + fee
  }, 0)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white border border-[#e2d9f3] rounded-2xl w-full max-w-md p-5 shadow-xl">
        <h2 className="text-sm font-semibold tracking-widest text-[#c9a456] uppercase mb-4">指名・同伴 編集</h2>
        <div className="space-y-2 mb-3">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-center gap-2 bg-[#f3eeff] rounded-xl p-2 border border-[#e2d9f3]">
              <select
                value={entry.castId}
                onChange={e => updateEntry(i, 'castId', e.target.value)}
                className="flex-1 bg-white text-[#1a1040] rounded-lg px-2 py-1.5 text-sm outline-none border border-[#e2d9f3]"
              >
                <option value="">キャスト選択</option>
                {workingCasts.map(c => <option key={c.id} value={c.id}>{c.stageName}</option>)}
              </select>
              <select
                value={entry.nominationType}
                onChange={e => updateEntry(i, 'nominationType', e.target.value)}
                className="bg-white text-[#1a1040] rounded-lg px-2 py-1.5 text-sm outline-none border border-[#e2d9f3]"
              >
                <option value="none">なし</option>
                <option value="in_store">場内指名 ¥{NOMINATION_FEE_IN_STORE.toLocaleString()}</option>
                <option value="main">本指名 ¥{NOMINATION_FEE_MAIN.toLocaleString()}</option>
              </select>
              <button
                onClick={() => toggleDouhan(i)}
                className={`px-2 py-1.5 rounded-lg text-xs font-semibold border shrink-0 cursor-pointer transition-colors ${entry.isDouhan ? 'bg-[#c9a456] text-[#1a1040] border-[#c9a456] hover:bg-[#b8923e] active:opacity-80' : 'bg-white text-[#7c6ea0] border-[#e2d9f3] hover:bg-[#f0ebff] hover:border-[#c9a456]/40'}`}
              >
                同伴{entry.isDouhan ? ` ¥${DOUHAN_FEE.toLocaleString()}` : ''}
              </button>
              <button onClick={() => removeEntry(i)} className="p-1 text-[#7c6ea0] hover:text-red-500 active:text-red-600 transition-colors"><X size={14} /></button>
            </div>
          ))}
        </div>
        <button onClick={addEntry} className="w-full py-2 rounded-xl border border-dashed border-[#e2d9f3] text-[#7c6ea0] text-sm flex items-center justify-center gap-2 mb-3 hover:bg-[#f0ebff] hover:border-[#c9a456]/40 active:bg-[#e8e0f5] transition-colors">
          <Plus size={14} />キャストを追加
        </button>
        {totalFee > 0 && <p className="text-xs text-[#c9a456] text-right mb-3">指名・同伴料計: ¥{totalFee.toLocaleString()}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-[#f3eeff] border border-[#e2d9f3] text-[#7c6ea0] text-sm hover:bg-[#e8e0f5] active:bg-[#d4c8f0] transition-colors">キャンセル</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-[#1a1040] text-[#d4b870] font-bold text-sm hover:opacity-90 active:opacity-80 transition-opacity">保存</button>
        </div>
      </div>
    </div>
  )
}

// ---- Extension Modal ----
function ExtensionModal({ visit, onClose }: { visit: Visit; onClose: () => void }) {
  const { state, dispatch } = useApp()
  const [perPersonInput, setPerPersonInput] = useState('5000')
  const minutes = 30
  const guestCount = visit.guestCount
  const perPerson = Math.max(0, parseInt(perPersonInput) || 0)
  const totalPrice = perPerson * guestCount

  const handleConfirm = () => {
    dispatch({ type: 'ADD_EXTENSION', payload: { visitId: visit.id, minutes, price: totalPrice } })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white border border-[#e2d9f3] rounded-2xl w-full max-w-sm p-5 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-[#1a1040] rounded-xl px-4 py-2">
            <span className="text-[#d4b870] font-bold text-xl tracking-wide">30分延長</span>
          </div>
          <div className="text-[#7c6ea0] text-sm">{guestCount}名</div>
        </div>
        <div className="mb-4">
          <label className="text-xs text-[#7c6ea0] tracking-wider block mb-1.5">1名あたりの料金</label>
          <div className="flex items-center gap-2 bg-[#f3eeff] rounded-xl border border-[#e2d9f3] px-3 py-2.5">
            <span className="text-[#7c6ea0] font-semibold">¥</span>
            <input
              type="number"
              min={0}
              value={perPersonInput}
              onChange={e => setPerPersonInput(e.target.value)}
              className="flex-1 bg-transparent text-[#1a1040] text-2xl font-bold outline-none"
            />
            <span className="text-[#7c6ea0] text-sm shrink-0">/ 名</span>
          </div>
        </div>
        <div className="flex items-center justify-between bg-[#1a1040]/5 rounded-xl px-4 py-3 mb-4">
          <span className="text-sm text-[#7c6ea0]">¥{perPerson.toLocaleString()} × {guestCount}名</span>
          <span className="text-2xl font-bold text-[#c9a456]">¥{totalPrice.toLocaleString()}</span>
        </div>
        <button onClick={handleConfirm} className="w-full py-3 rounded-xl bg-[#1a1040] text-[#d4b870] font-bold text-base tracking-wide hover:opacity-90 active:opacity-80 transition-opacity">延長する</button>
      </div>
    </div>
  )
}

export default function TablePage() {
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>('drink')
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showNomModal, setShowNomModal] = useState(false)
  const [showExtModal, setShowExtModal] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [editingPrice, setEditingPrice] = useState<{ key: string; value: string; itemIds?: string[] } | null>(null)

  const table = state.tables.find(t => t.id === tableId)
  const visit = table?.visitId ? state.visits.find(v => v.id === table.visitId) : undefined

  if (!table || !visit) {
    return (
      <div className="min-h-screen bg-[#f8f5ff] flex items-center justify-center">
        <div className="text-center text-[#7c6ea0]">
          <p>テーブルが見つかりません</p>
          <button onClick={() => navigate('/floor')} className="mt-4 text-[#c9a456]">フロアへ戻る</button>
        </div>
      </div>
    )
  }

  const totalSetMinutes = visit.setMinutes + (visit.extensionMinutes ?? 0)
  const elapsedMins = Math.floor((Date.now() - new Date(visit.checkInTime).getTime()) / 60000)
  const isOvertime = elapsedMins >= totalSetMinutes

  const menuByCategory = activeCategory !== 'expense'
    ? state.menuItems.filter(m => m.isActive && m.category === activeCategory)
    : []

  const regularOrderTotal = visit.orderItems.filter(i => !i.isExpense).reduce((s, i) => s + i.price * i.quantity, 0)
  const expenseTotal = visit.orderItems.filter(i => i.isExpense).reduce((s, i) => s + i.price * i.quantity, 0)
  // セット料金 = 単価 × 人数（手動変更があればそれを使用）
  const setPlanUnitPrice = state.setPlans.find(p => p.durationMinutes === visit.setMinutes)?.price ?? 0
  const setPrice = visit.setPriceOverride !== undefined ? visit.setPriceOverride : setPlanUnitPrice * visit.guestCount
  const getNominationFee = (castId: string, nomType: NominationType): number => {
    if (visit.nominationFeeOverrides?.[castId] !== undefined) return visit.nominationFeeOverrides[castId]
    return nomType === 'main' ? NOMINATION_FEE_MAIN : nomType === 'in_store' ? NOMINATION_FEE_IN_STORE : 0
  }
  const nominationFees = visit.nominations.reduce((sum, n) =>
    sum + (n.nominationType !== 'none' ? getNominationFee(n.castId, n.nominationType) * (n.qty ?? 1) : 0), 0)
  const douhanUnitFee = visit.douhanFeeOverride !== undefined ? visit.douhanFeeOverride : (visit.douhanCastId ? DOUHAN_FEE : 0)
  const douhanQty = visit.douhanQty ?? 1
  const douhanFee = douhanUnitFee * douhanQty

  const handleAddItem = (menuItemId: string) => {
    const menuItem = state.menuItems.find(m => m.id === menuItemId)
    if (!menuItem) return
    dispatch({ type: 'ADD_ORDER_ITEM', payload: { visitId: visit.id, item: { menuItemId: menuItem.id, menuItemName: menuItem.name, price: menuItem.price, quantity: 1 } } })
  }

  const handleAddCustom = (name: string, price: number, isExpense = false) => {
    if (!name.trim() || isNaN(price) || price <= 0) return
    dispatch({
      type: 'ADD_ORDER_ITEM',
      payload: {
        visitId: visit.id,
        item: { menuItemId: `custom_${Date.now()}`, menuItemName: name, price, quantity: 1, isExpense },
      },
    })
    setCustomName('')
    setCustomPrice('')
  }

  const handleRemoveItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ORDER_ITEM', payload: { visitId: visit.id, itemId } })
  }

  const handleAddOrderSlipItem = (item: { menuItemId: string; name: string; price: number; isExpense?: boolean }) => {
    if (item.menuItemId.startsWith('custom_')) {
      dispatch({ type: 'ADD_ORDER_ITEM', payload: { visitId: visit.id, item: { menuItemId: `custom_${Date.now()}`, menuItemName: item.name, price: item.price, quantity: 1, isExpense: item.isExpense } } })
    } else {
      handleAddItem(item.menuItemId)
    }
  }

  const handleMove = (toTableId: string) => {
    dispatch({ type: 'MOVE_VISIT', payload: { fromTableId: table.id, toTableId } })
    navigate(`/table/${toTableId}`)
  }

  const handlePriceConfirm = () => {
    if (!editingPrice) return
    const price = Math.max(0, parseInt(editingPrice.value) || 0)
    const { key } = editingPrice
    if (key === 'set') {
      dispatch({ type: 'UPDATE_VISIT_SET_PRICE', payload: { visitId: visit.id, price } })
    } else if (key.startsWith('nom_')) {
      dispatch({ type: 'UPDATE_NOMINATION_FEE', payload: { visitId: visit.id, castId: key.slice(4), fee: price } })
    } else if (key === 'douhan') {
      dispatch({ type: 'UPDATE_DOUHAN_FEE', payload: { visitId: visit.id, fee: price } })
    } else if (editingPrice.itemIds) {
      editingPrice.itemIds.forEach(id => {
        dispatch({ type: 'UPDATE_ORDER_ITEM_PRICE', payload: { visitId: visit.id, itemId: id, price } })
      })
    }
    setEditingPrice(null)
  }

  const renderPriceCell = (key: string, price: number, itemIds?: string[]) => {
    if (editingPrice?.key === key) {
      return (
        <div className="flex items-center gap-1 w-24 shrink-0 justify-end">
          <span className="text-[#7c6ea0] text-[10px]">¥</span>
          <input
            type="number"
            value={editingPrice.value}
            onChange={e => setEditingPrice({ ...editingPrice, value: e.target.value })}
            className="w-14 text-right text-[#1a1040] font-bold bg-white border border-[#c9a456] rounded-md px-1 outline-none text-xs"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handlePriceConfirm() }}
          />
          <button
            onClick={handlePriceConfirm}
            className="w-5 h-5 rounded-full bg-[#c9a456] text-white text-[10px] flex items-center justify-center font-bold shrink-0"
          >✓</button>
        </div>
      )
    }
    return (
      <div className="w-24 shrink-0 flex justify-end">
        <button
          onClick={() => setEditingPrice({ key, value: String(price), itemIds })}
          className="text-[#1a1040] text-xs font-semibold hover:text-[#c9a456] active:text-[#c9a456] transition-colors"
        >¥{price.toLocaleString()}</button>
      </div>
    )
  }

  const aggregatedItems = visit.orderItems.reduce<{ id: string; name: string; price: number; quantity: number; itemIds: string[]; isExpense?: boolean; menuItemId: string }[]>(
    (acc, item) => {
      const existing = acc.find(a => a.name === item.menuItemName && a.price === item.price && !!a.isExpense === !!item.isExpense)
      if (existing) { existing.quantity += item.quantity; existing.itemIds.push(item.id) }
      else acc.push({ id: item.id, name: item.menuItemName, price: item.price, quantity: item.quantity, itemIds: [item.id], isExpense: item.isExpense, menuItemId: item.menuItemId })
      return acc
    }, []
  )

  const regularItems = aggregatedItems.filter(i => !i.isExpense)
  const expenseItems = aggregatedItems.filter(i => i.isExpense)

  const goToCheckout = () => {
    dispatch({ type: 'UPDATE_TABLE_STATUS', payload: { tableId: table.id, status: 'waiting_checkout' } })
    navigate(`/checkout/${table.id}`)
  }

  const allCategories: ActiveCategory[] = ['drink', 'bottle', 'food', 'ladies_drink', 'other', 'expense']

  return (
    <div className="min-h-screen bg-[#f8f5ff] text-[#1a1040] flex flex-col">
      <header className="bg-[#1a1040] border-b border-[#2d1f60] px-4 py-2.5 flex items-center gap-3 sticky top-0 z-10">
        <div className="flex flex-col items-center shrink-0">
          <button onClick={() => navigate('/floor')} className="p-1 text-[#9080c0] hover:text-[#d4b870] active:opacity-70 transition-colors"><ArrowLeft size={20} /></button>
          <span className="text-[#d4b870]/50 text-[9px] font-bold tracking-wider leading-none">LunaPos</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-bold tracking-widest text-[#d4b870]">{table.name}</h1>
            <span className="text-[#2d1f60]">·</span>
            <span className="text-sm text-white truncate">{visit.customerName || ''}</span>
            {/* 人数 — always-visible +/- (大きめ) */}
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-[#9080c0]" />
              <button
                onClick={() => dispatch({ type: 'UPDATE_GUEST_COUNT', payload: { visitId: visit.id, guestCount: Math.max(1, visit.guestCount - 1) } })}
                className="w-8 h-8 rounded-lg bg-[#2d1f60] border border-[#3d2f70] text-white flex items-center justify-center font-bold text-base leading-none cursor-pointer hover:bg-[#3d2f70] active:bg-[#4d3f80] transition-colors"
              >−</button>
              <span className="text-sm text-white font-bold w-7 text-center">{visit.guestCount}</span>
              <button
                onClick={() => dispatch({ type: 'UPDATE_GUEST_COUNT', payload: { visitId: visit.id, guestCount: visit.guestCount + 1 } })}
                className="w-8 h-8 rounded-lg bg-[#2d1f60] border border-[#3d2f70] text-white flex items-center justify-center font-bold text-base leading-none cursor-pointer hover:bg-[#3d2f70] active:bg-[#4d3f80] transition-colors"
              >＋</button>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#9080c0] mt-0.5">
            <Clock size={11} />
            <span>{formatElapsed(visit.checkInTime)}</span>
            {visit.nominations.length > 0 && (
              <span className="flex items-center gap-1 text-[#d4b870]/70">
                <Sparkles size={10} />
                {visit.nominations.map(n => {
                  const c = state.casts.find(c => c.id === n.castId)
                  return c ? `${c.stageName}${n.nominationType === 'main' ? '(本)' : n.nominationType === 'in_store' ? '(場)' : ''}` : ''
                }).filter(Boolean).join(' / ')}
                <span className="text-[#9080c0]">指名</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowNomModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2d1f60] border border-[#3d2f70] text-[#9080c0] text-xs font-semibold hover:bg-[#3d2f70] hover:text-white active:opacity-80 transition-colors"
          >
            <Sparkles size={13} />指名
          </button>
          <button
            onClick={() => setShowMoveModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2d1f60] border border-[#3d2f70] text-[#9080c0] text-xs font-semibold hover:bg-[#3d2f70] hover:text-white active:opacity-80 transition-colors"
          >
            <ArrowRightLeft size={13} />卓移動
          </button>
          {isOvertime && (
            <button
              onClick={() => setShowExtModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500 text-white text-xs font-bold border border-red-600/50 hover:bg-red-600 active:opacity-80 transition-colors"
            >
              <Timer size={13} />延長
            </button>
          )}
          <button onClick={goToCheckout} className="flex items-center gap-2 bg-[#d4b870] text-[#1a1040] px-4 py-2 rounded-xl font-bold text-sm tracking-wider hover:bg-[#c9a456] active:opacity-80 transition-colors">
            <CreditCard size={16} />会計
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Menu */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex gap-2 p-3 bg-[#f8f5ff] overflow-x-auto border-b border-[#e2d9f3]">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${activeCategory === cat ? CATEGORY_ACTIVE[cat] : 'bg-white border-[#e2d9f3] text-[#7c6ea0] hover:bg-[#f0ebff] hover:border-[#c9a456]/30'}`}
              >
                {CATEGORY_LABEL[cat]}
              </button>
            ))}
          </div>

          {/* Menu grid + custom form */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            {activeCategory === 'expense' ? (
              <p className="text-xs text-[#7c6ea0] tracking-wider">サービス料・消費税なし（立替）</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {menuByCategory.map(item => (
                  <button key={item.id} onClick={() => handleAddItem(item.id)} className={`rounded-xl p-4 text-left hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all border ${CATEGORY_COLOR[item.category as MenuCategory]}`}>
                    <div className="font-semibold text-sm mb-1">{item.name}</div>
                    <div className="text-[#c9a456] font-bold">¥{item.price.toLocaleString()}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Custom / expense form — always visible */}
            <div className="bg-[#fef9ec] border border-[#c9a456]/25 rounded-xl p-3">
              <p className="text-xs text-[#c9a456]/80 mb-2 tracking-wider">{activeCategory === 'expense' ? '建て替え追加' : 'カスタム追加'}</p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="商品名・内容"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full bg-white border border-[#e2d9f3] rounded-lg px-3 py-2 text-sm text-[#1a1040] placeholder-[#b8acd4] outline-none focus:border-[#c9a456]/50"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="金額"
                    value={customPrice}
                    onChange={e => setCustomPrice(e.target.value)}
                    className="flex-1 bg-white border border-[#e2d9f3] rounded-lg px-3 py-2 text-sm text-[#1a1040] placeholder-[#b8acd4] outline-none focus:border-[#c9a456]/50"
                  />
                  <button
                    onClick={() => handleAddCustom(customName, parseInt(customPrice), activeCategory === 'expense')}
                    disabled={!customName.trim() || !customPrice || parseInt(customPrice) <= 0}
                    className="px-4 py-2 rounded-lg bg-[#1a1040] text-[#d4b870] text-sm font-bold disabled:opacity-30 hover:opacity-90 active:opacity-80 transition-opacity shrink-0 cursor-pointer"
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order slip */}
        <div className="w-80 bg-white border-l border-[#e2d9f3] flex flex-col">
          <div className="p-3 border-b border-[#e2d9f3]">
            <h2 className="font-semibold text-xs text-[#7c6ea0] tracking-widest uppercase">Order</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Set row */}
            <div className="flex items-center gap-1 px-2 py-2 rounded-lg bg-[#f3eeff] border border-[#e2d9f3]">
              <span className="flex-1 text-xs text-[#1a1040] truncate min-w-0">セット ({visit.setMinutes}分)</span>
              <div className="flex items-center gap-1 shrink-0 w-16 justify-center">
                <button onClick={() => dispatch({ type: 'UPDATE_GUEST_COUNT', payload: { visitId: visit.id, guestCount: Math.max(1, visit.guestCount - 1) } })} className="w-5 h-5 rounded-full bg-white border border-[#e2d9f3] flex items-center justify-center text-[#7c6ea0] hover:bg-[#e2d9f3] active:bg-[#d4c8f0] transition-colors">
                  <Minus size={9} />
                </button>
                <span className="text-[#1a1040] w-4 text-center text-xs font-bold">{visit.guestCount}</span>
                <button onClick={() => dispatch({ type: 'UPDATE_GUEST_COUNT', payload: { visitId: visit.id, guestCount: visit.guestCount + 1 } })} className="w-5 h-5 rounded-full bg-white border border-[#e2d9f3] flex items-center justify-center text-[#7c6ea0] hover:bg-[#e2d9f3] active:bg-[#d4c8f0] transition-colors">
                  <Plus size={9} />
                </button>
              </div>
              {renderPriceCell('set', setPrice)}
            </div>
            {/* Nomination rows */}
            {visit.nominations.map((n, i) => {
              if (n.nominationType === 'none') return null
              const unitFee = getNominationFee(n.castId, n.nominationType)
              const qty = n.qty ?? 1
              const cast = state.casts.find(c => c.id === n.castId)
              return (
                <div key={i} className="flex items-center gap-1 px-2 py-2 rounded-lg bg-[#f3eeff] border border-[#e2d9f3]">
                  <span className="flex-1 text-xs text-[#1a1040] truncate min-w-0">{cast?.stageName} {n.nominationType === 'main' ? '本指名' : '場内'}</span>
                  <div className="flex items-center gap-1 shrink-0 w-16 justify-center">
                    <button onClick={() => dispatch({ type: 'UPDATE_NOMINATION_QTY', payload: { visitId: visit.id, castId: n.castId, qty: Math.max(1, qty - 1) } })} className="w-5 h-5 rounded-full bg-white border border-[#e2d9f3] flex items-center justify-center text-[#7c6ea0] hover:bg-[#e2d9f3] active:bg-[#d4c8f0] transition-colors">
                      <Minus size={9} />
                    </button>
                    <span className="text-[#1a1040] w-4 text-center text-xs font-bold">{qty}</span>
                    <button onClick={() => dispatch({ type: 'UPDATE_NOMINATION_QTY', payload: { visitId: visit.id, castId: n.castId, qty: qty + 1 } })} className="w-5 h-5 rounded-full bg-white border border-[#e2d9f3] flex items-center justify-center text-[#7c6ea0] hover:bg-[#e2d9f3] active:bg-[#d4c8f0] transition-colors">
                      <Plus size={9} />
                    </button>
                  </div>
                  {renderPriceCell(`nom_${n.castId}`, unitFee * qty)}
                </div>
              )
            })}
            {/* Douhan row */}
            {visit.douhanCastId && (() => {
              const dc = state.casts.find(c => c.id === visit.douhanCastId)
              return (
                <div className="flex items-center gap-1 px-2 py-2 rounded-lg bg-[#f3eeff] border border-[#e2d9f3]">
                  <span className="flex-1 text-xs text-[#1a1040] truncate min-w-0">同伴 ({dc?.stageName})</span>
                  <div className="flex items-center gap-1 shrink-0 w-16 justify-center">
                    <button onClick={() => dispatch({ type: 'UPDATE_DOUHAN_QTY', payload: { visitId: visit.id, qty: Math.max(1, douhanQty - 1) } })} className="w-5 h-5 rounded-full bg-white border border-[#e2d9f3] flex items-center justify-center text-[#7c6ea0] hover:bg-[#e2d9f3] active:bg-[#d4c8f0] transition-colors">
                      <Minus size={9} />
                    </button>
                    <span className="text-[#1a1040] w-4 text-center text-xs font-bold">{douhanQty}</span>
                    <button onClick={() => dispatch({ type: 'UPDATE_DOUHAN_QTY', payload: { visitId: visit.id, qty: douhanQty + 1 } })} className="w-5 h-5 rounded-full bg-white border border-[#e2d9f3] flex items-center justify-center text-[#7c6ea0] hover:bg-[#e2d9f3] active:bg-[#d4c8f0] transition-colors">
                      <Plus size={9} />
                    </button>
                  </div>
                  {renderPriceCell('douhan', douhanFee)}
                </div>
              )
            })()}
            {/* Regular order items */}
            {regularItems.map(item => (
              <div key={item.id} className="flex items-center gap-1 px-2 py-2 rounded-lg bg-[#f3eeff] border border-[#e2d9f3]">
                <span className="flex-1 text-xs text-[#1a1040] truncate min-w-0">{item.name}</span>
                <div className="flex items-center gap-1 shrink-0 w-16 justify-center">
                  <button onClick={() => handleRemoveItem(item.itemIds[item.itemIds.length - 1])} className="w-5 h-5 rounded-full bg-white border border-[#e2d9f3] flex items-center justify-center text-[#7c6ea0] hover:bg-[#e2d9f3] active:bg-[#d4c8f0] transition-colors">
                    {item.quantity === 1 ? <Trash2 size={9} /> : <Minus size={9} />}
                  </button>
                  <span className="text-[#1a1040] w-4 text-center text-xs font-bold">{item.quantity}</span>
                  <button onClick={() => handleAddOrderSlipItem(item)} className="w-5 h-5 rounded-full bg-white border border-[#e2d9f3] flex items-center justify-center text-[#7c6ea0] hover:bg-[#e2d9f3] active:bg-[#d4c8f0] transition-colors">
                    <Plus size={9} />
                  </button>
                </div>
                {renderPriceCell(item.id, item.price, item.itemIds)}
              </div>
            ))}
            {/* Expense section */}
            {expenseItems.length > 0 && (
              <>
                <div className="px-2 pt-1">
                  <span className="text-xs text-amber-600/70 flex items-center gap-1"><Receipt size={9} />建て替え</span>
                </div>
                {expenseItems.map(item => (
                  <div key={item.id} className="flex items-center gap-1 px-2 py-2 rounded-lg bg-amber-50 border border-amber-200">
                    <span className="flex-1 text-xs text-[#1a1040] truncate min-w-0">{item.name}</span>
                    <div className="flex items-center gap-1 shrink-0 w-16 justify-center">
                      <button onClick={() => handleRemoveItem(item.itemIds[item.itemIds.length - 1])} className="w-5 h-5 rounded-full bg-white border border-amber-200 flex items-center justify-center text-amber-600 hover:bg-amber-50 active:bg-amber-100 transition-colors">
                        {item.quantity === 1 ? <Trash2 size={9} /> : <Minus size={9} />}
                      </button>
                      <span className="text-[#1a1040] w-4 text-center text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => handleAddOrderSlipItem(item)} className="w-5 h-5 rounded-full bg-white border border-amber-200 flex items-center justify-center text-amber-600 hover:bg-amber-50 active:bg-amber-100 transition-colors">
                        <Plus size={9} />
                      </button>
                    </div>
                    {renderPriceCell(item.id, item.price, item.itemIds)}
                  </div>
                ))}
              </>
            )}
            {regularItems.length === 0 && expenseItems.length === 0 && (
              <p className="text-center text-[#b8acd4] text-xs py-4 tracking-wider">まだオーダーなし</p>
            )}
          </div>
          {(() => {
            const sub = setPrice + nominationFees + douhanFee + regularOrderTotal
            const service = Math.floor(sub * SERVICE_RATE)
            const tax = Math.floor(sub * TAX_RATE)
            const total = sub + service + tax + expenseTotal
            return (
              <div className="border-t border-[#e2d9f3] p-3 space-y-1">
                <div className="flex justify-between text-xs text-[#7c6ea0]">
                  <span>小計</span><span>¥{sub.toLocaleString()}</span>
                </div>
                {expenseTotal > 0 && (
                  <div className="flex justify-between text-xs text-amber-600/70">
                    <span>建て替え</span><span>¥{expenseTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-[#7c6ea0]">
                  <span>サービス料 (40%)</span><span>¥{service.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-[#7c6ea0]">
                  <span>消費税 (10%)</span><span>¥{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-[#c9a456] text-base pt-2 border-t border-[#e2d9f3] mt-1">
                  <span className="tracking-wider">合計</span>
                  <span>¥{total.toLocaleString()}</span>
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {showMoveModal && (
        <MoveTableModal
          currentTableId={table.id}
          onMove={handleMove}
          onClose={() => setShowMoveModal(false)}
        />
      )}
      {showNomModal && (
        <NominationModal
          visitId={visit.id}
          currentNominations={visit.nominations}
          currentDouhanCastId={visit.douhanCastId}
          onClose={() => setShowNomModal(false)}
        />
      )}
      {showExtModal && (
        <ExtensionModal
          visit={visit}
          onClose={() => setShowExtModal(false)}
        />
      )}
    </div>
  )
}
