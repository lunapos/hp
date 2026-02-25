import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Banknote, Smartphone, BookOpen, Check, Receipt } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import type { PaymentMethod } from '../types'
import { SERVICE_RATE, TAX_RATE, DOUHAN_FEE, NOMINATION_FEE_MAIN, NOMINATION_FEE_IN_STORE } from '../data/constants'

const PAYMENT_METHODS: { method: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { method: 'cash', label: '現金', icon: <Banknote size={20} /> },
  { method: 'credit', label: 'カード', icon: <CreditCard size={20} /> },
  { method: 'electronic', label: '電子', icon: <Smartphone size={20} /> },
  { method: 'tab', label: 'ツケ', icon: <BookOpen size={20} /> },
]

export default function CheckoutPage() {
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [discountInput, setDiscountInput] = useState('')
  const [completed, setCompleted] = useState(false)
  const [completedTotal, setCompletedTotal] = useState(0)

  if (completed) {
    return (
      <div className="min-h-screen bg-[#f8f5ff] flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-[#1a1040] border border-[#d4b870]/30 flex items-center justify-center mb-6">
          <Check size={36} className="text-[#d4b870]" />
        </div>
        <h2 className="text-2xl font-bold text-[#1a1040] tracking-widest mb-2">THANK YOU</h2>
        <p className="text-[#c9a456] text-xl font-bold">¥{completedTotal.toLocaleString()}</p>
        <p className="text-[#7c6ea0] text-xs mt-4 tracking-widest">フロアに戻ります...</p>
      </div>
    )
  }

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

  const setPlan = state.setPlans.find(p => p.durationMinutes === visit.setMinutes)
  // セット料金（手動変更があればそれを使用）
  const setPrice = visit.setPriceOverride !== undefined ? visit.setPriceOverride : (setPlan?.price ?? 0) * visit.guestCount
  const totalNominationFee = visit.nominations.reduce((sum, n) => {
    if (n.nominationType === 'none') return sum
    const unitFee = visit.nominationFeeOverrides?.[n.castId] !== undefined
      ? visit.nominationFeeOverrides[n.castId]
      : (n.nominationType === 'main' ? NOMINATION_FEE_MAIN : NOMINATION_FEE_IN_STORE)
    return sum + unitFee * (n.qty ?? 1)
  }, 0)
  const douhanUnitFee = visit.douhanFeeOverride !== undefined ? visit.douhanFeeOverride : (visit.douhanCastId ? DOUHAN_FEE : 0)
  const douhanFee = douhanUnitFee * (visit.douhanQty ?? 1)
  const douhanCast = visit.douhanCastId ? state.casts.find(c => c.id === visit.douhanCastId) : undefined

  const regularItems = visit.orderItems.filter(i => !i.isExpense)
  const expenseItems = visit.orderItems.filter(i => i.isExpense)
  const regularOrderTotal = regularItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const expenseTotal = expenseItems.reduce((s, i) => s + i.price * i.quantity, 0)

  const subtotal = setPrice + totalNominationFee + douhanFee + regularOrderTotal
  const serviceFee = Math.floor(subtotal * SERVICE_RATE)
  const taxFee = Math.floor(subtotal * TAX_RATE)
  const chargedAmount = subtotal + serviceFee + taxFee

  const discount = Math.max(0, parseInt(discountInput) || 0)
  const total = Math.max(0, chargedAmount - discount) + expenseTotal

  const handleCheckout = () => {
    const finalTotal = total
    setCompletedTotal(finalTotal)
    setCompleted(true)
    dispatch({
      type: 'CHECKOUT',
      payload: {
        id: Math.random().toString(36).slice(2),
        visitId: visit.id,
        tableId: table.id,
        customerName: visit.customerName,
        subtotal,
        expenseTotal,
        nominationFee: totalNominationFee,
        serviceFee,
        tax: taxFee,
        discount,
        total: finalTotal,
        paymentMethod,
        paidAt: new Date().toISOString(),
        items: visit.orderItems,
      },
    })
    setTimeout(() => navigate('/floor'), 2000)
  }

  return (
    <div className="min-h-screen bg-[#f8f5ff] text-[#1a1040] flex flex-col">
      <header className="bg-[#1a1040] border-b border-[#2d1f60] px-4 py-3 flex items-center gap-3">
        <div className="flex flex-col items-center shrink-0">
          <button onClick={() => navigate(`/table/${table.id}`)} className="p-1 text-[#9080c0]"><ArrowLeft size={22} /></button>
          <span className="text-[#d4b870]/50 text-[9px] font-bold tracking-wider leading-none">LunaPos</span>
        </div>
        <div>
          <h1 className="text-base font-bold tracking-widest text-[#d4b870] uppercase">Checkout — {table.name}</h1>
          <p className="text-xs text-[#9080c0] tracking-wider">{visit.customerName || ''} · {visit.guestCount}名</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Visit info */}
        <div className="bg-white rounded-xl p-4 border border-[#e2d9f3] shadow-sm">
          <h2 className="text-xs font-semibold text-[#7c6ea0] tracking-widest uppercase mb-3">ご利用内容</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#7c6ea0]">入店</span>
              <span className="text-[#1a1040]">{new Date(visit.checkInTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7c6ea0]">セット</span>
              <span className="text-[#1a1040]">{visit.setMinutes}分 × {visit.guestCount}名</span>
            </div>
            {visit.nominations.map((n, i) => {
              const c = state.casts.find(cast => cast.id === n.castId)
              if (!c) return null
              return (
                <div key={i} className="flex justify-between">
                  <span className="text-[#7c6ea0]">指名{visit.nominations.length > 1 ? ` (${i + 1})` : ''}</span>
                  <span className="text-[#1a1040]">
                    {c.stageName}
                    {n.nominationType !== 'none' && <span className="ml-2 text-xs text-[#c9a456]">({n.nominationType === 'main' ? '本指名' : '場内指名'})</span>}
                  </span>
                </div>
              )
            })}
            {douhanCast && (
              <div className="flex justify-between">
                <span className="text-[#7c6ea0]">同伴</span>
                <span className="text-[#1a1040]">{douhanCast.stageName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order items */}
        <div className="bg-white rounded-xl p-4 border border-[#e2d9f3] shadow-sm">
          <h2 className="text-xs font-semibold text-[#7c6ea0] tracking-widest uppercase mb-3">注文明細</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#1a1040]">{setPlan?.name ?? `セット (${visit.setMinutes}分)`} × {visit.guestCount}名</span>
              <span className="text-[#1a1040]">¥{setPrice.toLocaleString()}</span>
            </div>
            {visit.nominations.map((n, i) => {
              const fee = n.nominationType === 'main' ? 5000 : n.nominationType === 'in_store' ? 2000 : 0
              if (fee === 0) return null
              const c = state.casts.find(cast => cast.id === n.castId)
              return (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-[#1a1040]">{c?.stageName} {n.nominationType === 'main' ? '本指名料' : '場内指名料'}</span>
                  <span className="text-[#1a1040]">¥{fee.toLocaleString()}</span>
                </div>
              )
            })}
            {douhanFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#1a1040]">同伴料 ({douhanCast?.stageName})</span>
                <span className="text-[#1a1040]">¥{douhanFee.toLocaleString()}</span>
              </div>
            )}
            {regularItems.length > 0 && (
              <div className="pt-2 border-t border-[#e2d9f3] space-y-1">
                {regularItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[#7c6ea0]">{item.menuItemName} × {item.quantity}</span>
                    <span className="text-[#1a1040]">¥{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
            {expenseItems.length > 0 && (
              <div className="pt-2 border-t border-amber-200 space-y-1">
                <div className="flex items-center gap-1 text-xs text-amber-600 mb-1">
                  <Receipt size={10} />建て替え（サービス料・消費税なし）
                </div>
                {expenseItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-amber-600">{item.menuItemName} × {item.quantity}</span>
                    <span className="text-[#1a1040]">¥{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fee breakdown */}
        <div className="bg-white rounded-xl p-4 border border-[#e2d9f3] shadow-sm">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[#7c6ea0]">
              <span>小計</span><span>¥{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#7c6ea0]">
              <span>サービス料 (40%)</span>
              <span>+¥{serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#7c6ea0]">
              <span>消費税 (10%)</span>
              <span>+¥{taxFee.toLocaleString()}</span>
            </div>
            {expenseTotal > 0 && (
              <div className="flex justify-between text-amber-600">
                <span>建て替え計</span><span>¥{expenseTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-[#e2d9f3]">
              <span className="text-[#7c6ea0]">割引</span>
              <div className="flex items-center gap-2">
                <span className="text-[#7c6ea0]">¥</span>
                <input
                  type="number"
                  min={0}
                  value={discountInput}
                  onChange={e => setDiscountInput(e.target.value)}
                  placeholder="0"
                  className="w-28 text-right bg-[#f3eeff] text-[#1a1040] rounded-lg px-3 py-1.5 text-sm outline-none border border-[#e2d9f3] focus:border-[#c9a456]/50"
                />
              </div>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>割引額</span><span>− ¥{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-[#c9a456] text-xl pt-2 border-t border-[#e2d9f3]">
              <span className="tracking-wider">合計</span><span>¥{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-xl p-4 border border-[#e2d9f3] shadow-sm">
          <h2 className="text-xs font-semibold text-[#7c6ea0] tracking-widest uppercase mb-3">お支払い方法</h2>
          <div className="grid grid-cols-4 gap-2">
            {PAYMENT_METHODS.map(({ method, label, icon }) => (
              <button key={method} onClick={() => setPaymentMethod(method)} className={`flex flex-col items-center gap-2 py-3 rounded-xl transition-colors border ${paymentMethod === method ? 'bg-[#1a1040] border-[#1a1040] text-[#d4b870]' : 'bg-[#f3eeff] border-[#e2d9f3] text-[#7c6ea0]'}`}>
                {icon}
                <span className="text-xs font-semibold tracking-wider">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-[#e2d9f3]">
        <button onClick={handleCheckout} className="w-full py-4 rounded-xl bg-[#1a1040] text-[#d4b870] font-bold text-lg tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform">
          <CreditCard size={22} />
          ¥{total.toLocaleString()} で会計する
        </button>
      </div>
    </div>
  )
}
