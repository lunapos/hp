import { useState, useEffect, useMemo } from 'react'
import {
  Wallet, ArrowDownCircle, ArrowUpCircle, ChevronLeft, ChevronRight,
  Plus, Trash2, PiggyBank,
} from 'lucide-react'
import { supabase, requireTenantId } from '../lib/supabase'
import { toDateStr, formatYen, METHOD_LABELS } from '../lib/dashboard'
import type { PaymentRow, CashWithdrawalRow, RegisterSessionRow } from '../types'

export default function RegisterPage() {
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()))
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [withdrawals, setWithdrawals] = useState<CashWithdrawalRow[]>([])
  const [session, setSession] = useState<RegisterSessionRow | null>(null)
  const [loading, setLoading] = useState(true)

  // 開始金額編集
  const [editingStart, setEditingStart] = useState(false)
  const [startAmountInput, setStartAmountInput] = useState('')

  // 出金追加
  const [showAddWithdrawal, setShowAddWithdrawal] = useState(false)
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [withdrawalNote, setWithdrawalNote] = useState('')

  // データ取得
  useEffect(() => {
    fetchData()
  }, [selectedDate])

  async function fetchData() {
    setLoading(true)
    try {
      const tid = requireTenantId()
      const dayStart = `${selectedDate}T00:00:00+09:00`
      const dayEnd = `${selectedDate}T23:59:59+09:00`

      const [paymentsRes, withdrawalsRes, sessionRes] = await Promise.all([
        supabase.from('payments')
          .select('*')
          .eq('tenant_id', tid)
          .gte('paid_at', dayStart)
          .lte('paid_at', dayEnd)
          .order('paid_at', { ascending: true }),
        supabase.from('cash_withdrawals')
          .select('*')
          .eq('tenant_id', tid)
          .gte('created_at', dayStart)
          .lte('created_at', dayEnd)
          .order('created_at', { ascending: true }),
        supabase.from('register_sessions')
          .select('*')
          .eq('tenant_id', tid)
          .eq('business_date', selectedDate)
          .maybeSingle(),
      ])

      setPayments((paymentsRes.data || []) as PaymentRow[])
      setWithdrawals((withdrawalsRes.data || []) as CashWithdrawalRow[])
      setSession(sessionRes.data as RegisterSessionRow | null)
    } catch {
      // エラー時は空データ
    }
    setLoading(false)
  }

  // 計算
  const summary = useMemo(() => {
    const cashSales = payments
      .filter(p => p.payment_method === 'cash')
      .reduce((s, p) => s + p.total, 0)
    const cardSales = payments
      .filter(p => p.payment_method === 'credit')
      .reduce((s, p) => s + p.total, 0)
    const electronicSales = payments
      .filter(p => p.payment_method === 'electronic')
      .reduce((s, p) => s + p.total, 0)
    const tabSales = payments
      .filter(p => p.payment_method === 'tab')
      .reduce((s, p) => s + p.total, 0)
    const totalSales = payments.reduce((s, p) => s + p.total, 0)
    const totalWithdrawals = withdrawals.reduce((s, w) => s + w.amount, 0)
    const startAmount = session?.start_amount || 0
    const expectedCash = startAmount + cashSales - totalWithdrawals

    return {
      cashSales,
      cardSales,
      electronicSales,
      tabSales,
      totalSales,
      totalWithdrawals,
      startAmount,
      expectedCash,
      paymentCount: payments.length,
    }
  }, [payments, withdrawals, session])

  // 日付変更
  function changeDate(offset: number) {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + offset)
    setSelectedDate(toDateStr(d))
  }

  // 開始金額の保存
  async function saveStartAmount() {
    const amount = parseInt(startAmountInput, 10)
    if (isNaN(amount) || amount < 0) return
    const tid = requireTenantId()
    if (session) {
      await supabase.from('register_sessions')
        .update({ start_amount: amount })
        .eq('id', session.id)
    } else {
      await supabase.from('register_sessions')
        .insert({ tenant_id: tid, business_date: selectedDate, start_amount: amount })
    }
    setEditingStart(false)
    fetchData()
  }

  // 出金追加
  async function addWithdrawal() {
    const amount = parseInt(withdrawalAmount, 10)
    if (isNaN(amount) || amount <= 0) return
    const tid = requireTenantId()
    await supabase.from('cash_withdrawals')
      .insert({ tenant_id: tid, amount, note: withdrawalNote || null })
    setWithdrawalAmount('')
    setWithdrawalNote('')
    setShowAddWithdrawal(false)
    fetchData()
  }

  // 出金削除
  async function deleteWithdrawal(id: string) {
    await supabase.from('cash_withdrawals').delete().eq('id', id)
    fetchData()
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Wallet size={22} className="text-[#d4b870]" />
          レジ金管理
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => changeDate(-1)} className="p-2 rounded-lg bg-[#141430] border border-[#2e2e50] text-[#9090bb] hover:text-white">
            <ChevronLeft size={18} />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-[#141430] border border-[#2e2e50] rounded-lg px-3 py-2 text-white text-sm"
          />
          <button onClick={() => changeDate(1)} className="p-2 rounded-lg bg-[#141430] border border-[#2e2e50] text-[#9090bb] hover:text-white">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-[#9090bb] py-16">読み込み中...</div>
      ) : (
        <>
          {/* レジ残高カード（メイン） */}
          <div className="bg-gradient-to-br from-[#1a1040] to-[#0f0f28] border border-[#d4b870]/30 rounded-2xl p-6">
            <div className="text-center">
              <p className="text-[#9090bb] text-sm mb-1">レジ内 現金残高（見込み）</p>
              <p className="text-4xl font-bold text-[#d4b870]">{formatYen(summary.expectedCash)}</p>
              <p className="text-xs text-[#9090bb] mt-2">
                開始 {formatYen(summary.startAmount)} ＋ 現金売上 {formatYen(summary.cashSales)} − 出金 {formatYen(summary.totalWithdrawals)}
              </p>
            </div>
          </div>

          {/* サマリカード */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              icon={<PiggyBank size={18} />}
              label="開始金額"
              value={formatYen(summary.startAmount)}
              color="text-blue-400"
              onClick={() => {
                setStartAmountInput(String(summary.startAmount))
                setEditingStart(true)
              }}
              editable
            />
            <SummaryCard
              icon={<ArrowDownCircle size={18} />}
              label="現金売上"
              value={formatYen(summary.cashSales)}
              sub={`${payments.filter(p => p.payment_method === 'cash').length}件`}
              color="text-green-400"
            />
            <SummaryCard
              icon={<ArrowUpCircle size={18} />}
              label="出金合計"
              value={formatYen(summary.totalWithdrawals)}
              sub={`${withdrawals.length}件`}
              color="text-red-400"
            />
            <SummaryCard
              icon={<Wallet size={18} />}
              label="売上合計"
              value={formatYen(summary.totalSales)}
              sub={`${summary.paymentCount}件`}
              color="text-[#d4b870]"
            />
          </div>

          {/* 決済方法別の内訳 */}
          <div className="bg-[#0f0f28] border border-[#2e2e50] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">決済方法別 内訳</h3>
            <div className="space-y-3">
              <MethodBar label="現金" amount={summary.cashSales} total={summary.totalSales} color="bg-green-500" />
              <MethodBar label="カード" amount={summary.cardSales} total={summary.totalSales} color="bg-blue-500" />
              <MethodBar label="電子マネー" amount={summary.electronicSales} total={summary.totalSales} color="bg-purple-500" />
              <MethodBar label="ツケ" amount={summary.tabSales} total={summary.totalSales} color="bg-orange-500" />
            </div>
          </div>

          {/* 出金一覧 */}
          <div className="bg-[#0f0f28] border border-[#2e2e50] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">出金履歴</h3>
              <button
                onClick={() => setShowAddWithdrawal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4b870]/10 border border-[#d4b870]/30 text-[#d4b870] text-xs hover:bg-[#d4b870]/20 transition-colors"
              >
                <Plus size={14} />
                出金を追加
              </button>
            </div>
            {withdrawals.length === 0 ? (
              <p className="text-[#9090bb] text-sm text-center py-4">出金なし</p>
            ) : (
              <div className="space-y-2">
                {withdrawals.map(w => (
                  <div key={w.id} className="flex items-center justify-between bg-[#141430] rounded-xl px-4 py-3">
                    <div>
                      <span className="text-red-400 font-semibold text-sm">−{formatYen(w.amount)}</span>
                      {w.note && <span className="text-[#9090bb] text-xs ml-3">{w.note}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#9090bb] text-xs">
                        {new Date(w.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => deleteWithdrawal(w.id)}
                        className="p-1 rounded text-[#9090bb] hover:text-red-400 hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 会計履歴（現金のみ） */}
          <div className="bg-[#0f0f28] border border-[#2e2e50] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">
              会計一覧
              <span className="text-[#9090bb] font-normal ml-2 text-xs">全{payments.length}件</span>
            </h3>
            {payments.length === 0 ? (
              <p className="text-[#9090bb] text-sm text-center py-4">会計なし</p>
            ) : (
              <div className="space-y-2">
                {payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-[#141430] rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.payment_method === 'cash' ? 'bg-green-900/30 text-green-400' :
                        p.payment_method === 'credit' ? 'bg-blue-900/30 text-blue-400' :
                        p.payment_method === 'electronic' ? 'bg-purple-900/30 text-purple-400' :
                        'bg-orange-900/30 text-orange-400'
                      }`}>
                        {METHOD_LABELS[p.payment_method] || p.payment_method}
                      </span>
                      <span className="text-white text-sm">{p.customer_name || '---'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold text-sm">{formatYen(p.total)}</span>
                      <span className="text-[#9090bb] text-xs">
                        {new Date(p.paid_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* 開始金額編集モーダル */}
      {editingStart && (
        <Modal onClose={() => setEditingStart(false)}>
          <h3 className="text-lg font-bold text-white mb-4">開始金額を設定</h3>
          <p className="text-[#9090bb] text-sm mb-4">営業開始時のレジ内の現金額を入力してください。</p>
          <input
            type="number"
            min="0"
            step="1000"
            value={startAmountInput}
            onChange={e => setStartAmountInput(e.target.value)}
            className="w-full bg-[#141430] border border-[#2e2e50] rounded-lg px-4 py-3 text-white text-lg focus:border-[#d4b870] focus:outline-none mb-4"
            placeholder="例: 50000"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={() => setEditingStart(false)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#141430] border border-[#2e2e50] text-[#9090bb] text-sm hover:text-white"
            >
              キャンセル
            </button>
            <button
              onClick={saveStartAmount}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#d4b870] text-[#0a0a18] font-semibold text-sm hover:bg-[#c9a456]"
            >
              保存
            </button>
          </div>
        </Modal>
      )}

      {/* 出金追加モーダル */}
      {showAddWithdrawal && (
        <Modal onClose={() => setShowAddWithdrawal(false)}>
          <h3 className="text-lg font-bold text-white mb-4">出金を記録</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[#9090bb] text-xs block mb-1">金額</label>
              <input
                type="number"
                min="1"
                value={withdrawalAmount}
                onChange={e => setWithdrawalAmount(e.target.value)}
                className="w-full bg-[#141430] border border-[#2e2e50] rounded-lg px-4 py-3 text-white text-lg focus:border-[#d4b870] focus:outline-none"
                placeholder="例: 10000"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[#9090bb] text-xs block mb-1">メモ（任意）</label>
              <input
                type="text"
                value={withdrawalNote}
                onChange={e => setWithdrawalNote(e.target.value)}
                className="w-full bg-[#141430] border border-[#2e2e50] rounded-lg px-4 py-3 text-white text-sm focus:border-[#d4b870] focus:outline-none"
                placeholder="例: 両替、買い出し、送迎タクシー代"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAddWithdrawal(false)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#141430] border border-[#2e2e50] text-[#9090bb] text-sm hover:text-white"
            >
              キャンセル
            </button>
            <button
              onClick={addWithdrawal}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#d4b870] text-[#0a0a18] font-semibold text-sm hover:bg-[#c9a456]"
            >
              記録する
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// --- サブコンポーネント ---

function SummaryCard({ icon, label, value, sub, color, onClick, editable }: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  color: string
  onClick?: () => void
  editable?: boolean
}) {
  return (
    <div
      className={`bg-[#0f0f28] border border-[#2e2e50] rounded-2xl p-4 ${editable ? 'cursor-pointer hover:border-[#d4b870]/30' : ''}`}
      onClick={onClick}
    >
      <div className={`flex items-center gap-2 mb-2 ${color}`}>
        {icon}
        <span className="text-xs text-[#9090bb]">{label}</span>
        {editable && <span className="text-[10px] text-[#9090bb] ml-auto">タップで編集</span>}
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-[#9090bb] mt-1">{sub}</p>}
    </div>
  )
}

function MethodBar({ label, amount, total, color }: {
  label: string
  amount: number
  total: number
  color: string
}) {
  const pct = total > 0 ? (amount / total) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-[#9090bb] text-xs w-16 text-right">{label}</span>
      <div className="flex-1 h-6 bg-[#141430] rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-white text-sm font-semibold w-28 text-right">{formatYen(amount)}</span>
      <span className="text-[#9090bb] text-xs w-12 text-right">{pct.toFixed(0)}%</span>
    </div>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#0f0f28] border border-[#2e2e50] rounded-2xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
