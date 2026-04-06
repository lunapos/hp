import { useState, useEffect, useMemo } from 'react'
import {
  ChevronLeft, ChevronRight, Calendar, Star, TrendingUp, Download,
} from 'lucide-react'
import { supabase, requireTenantId } from '../lib/supabase'
import { toDateStr, formatYen } from '../lib/dashboard'
import type { PaymentRow, CastRow, NominationRow, VisitRow } from '../types'

type PeriodMode = 'daily' | 'monthly'

interface CastSalesData {
  castId: string
  stageName: string
  photoUrl: string | null
  // 指名
  nominationsMain: number       // 本指名
  nominationsInStore: number    // 場内指名
  nominationsTotal: number      // 合計指名数
  // 同伴
  douhanCount: number
  // 売上（指名した来店の売上合計）
  relatedSales: number
  // 指名料
  nominationFee: number
}

function calcCastSalesData(
  visits: VisitRow[],
  nominations: NominationRow[],
  payments: PaymentRow[],
  casts: CastRow[],
  store: { nomination_fee_main: number; nomination_fee_in_store: number; douhan_fee: number } | null,
): CastSalesData[] {
  const visitMap = new Map(visits.map(v => [v.id, v]))
  const paymentByVisit = new Map(payments.map(p => [p.visit_id, p]))

  const castMap: Record<string, CastSalesData> = {}
  for (const c of casts) {
    castMap[c.id] = {
      castId: c.id,
      stageName: c.stage_name,
      photoUrl: c.photo_url,
      nominationsMain: 0,
      nominationsInStore: 0,
      nominationsTotal: 0,
      douhanCount: 0,
      relatedSales: 0,
      nominationFee: 0,
    }
  }

  // 指名集計
  for (const n of nominations) {
    if (n.nomination_type === 'none') continue
    if (!visitMap.has(n.visit_id)) continue
    const cast = castMap[n.cast_id]
    if (!cast) continue

    if (n.nomination_type === 'main') {
      cast.nominationsMain += n.qty
      // 指名料（fee_override があればそれを使う）
      const fee = n.fee_override !== null ? n.fee_override : (store?.nomination_fee_main ?? 0)
      cast.nominationFee += fee * n.qty
    } else if (n.nomination_type === 'in_store') {
      cast.nominationsInStore += n.qty
      const fee = n.fee_override !== null ? n.fee_override : (store?.nomination_fee_in_store ?? 0)
      cast.nominationFee += fee * n.qty
    }
    cast.nominationsTotal += n.qty

    // 関連売上（指名があった来店の会計合計）
    const payment = paymentByVisit.get(n.visit_id)
    if (payment) {
      cast.relatedSales += payment.total
    }
  }

  // 同伴集計
  for (const v of visits) {
    if (v.douhan_cast_id && castMap[v.douhan_cast_id]) {
      castMap[v.douhan_cast_id].douhanCount += v.douhan_qty || 1
    }
  }

  return Object.values(castMap)
    .filter(c => c.nominationsTotal > 0 || c.douhanCount > 0)
    .sort((a, b) => b.relatedSales - a.relatedSales)
}

export default function CastSalesPage() {
  const [periodMode, setPeriodMode] = useState<PeriodMode>('daily')
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()))
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [visits, setVisits] = useState<VisitRow[]>([])
  const [nominations, setNominations] = useState<NominationRow[]>([])
  const [casts, setCasts] = useState<CastRow[]>([])
  const [store, setStore] = useState<{ nomination_fee_main: number; nomination_fee_in_store: number; douhan_fee: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const tid = requireTenantId()
        let rangeStart: string
        let rangeEnd: string

        if (periodMode === 'daily') {
          rangeStart = `${selectedDate}T00:00:00+09:00`
          rangeEnd = `${selectedDate}T23:59:59+09:00`
        } else {
          const [year, month] = selectedMonth.split('-').map(Number)
          const daysInMonth = new Date(year, month, 0).getDate()
          rangeStart = `${selectedMonth}-01T00:00:00+09:00`
          rangeEnd = `${selectedMonth}-${String(daysInMonth).padStart(2, '0')}T23:59:59+09:00`
        }

        const [paymentsRes, visitsRes, nomsRes, castsRes, storeRes] = await Promise.all([
          supabase.from('payments')
            .select('id, tenant_id, visit_id, table_id, customer_name, subtotal, expense_total, nomination_fee, service_fee, tax, discount, total, payment_method, paid_at, created_at, updated_at')
            .eq('tenant_id', tid)
            .gte('paid_at', rangeStart)
            .lte('paid_at', rangeEnd),
          supabase.from('visits')
            .select('id, tenant_id, table_id, customer_id, customer_name, guest_count, douhan_cast_id, douhan_qty, check_in_time, check_out_time, set_minutes, extension_minutes, set_price_override, douhan_fee_override, is_checked_out, created_at, updated_at')
            .eq('tenant_id', tid)
            .gte('check_in_time', rangeStart)
            .lte('check_in_time', rangeEnd),
          supabase.from('nominations')
            .select('id, tenant_id, visit_id, cast_id, nomination_type, qty, fee_override, created_at, updated_at')
            .eq('tenant_id', tid),
          supabase.from('casts')
            .select('id, tenant_id, stage_name, real_name, photo_url, drop_off_location, is_active, created_at, updated_at')
            .eq('tenant_id', tid)
            .eq('is_active', true),
          supabase.from('stores')
            .select('nomination_fee_main, nomination_fee_in_store, douhan_fee')
            .eq('id', tid)
            .single(),
        ])

        setPayments((paymentsRes.data || []) as PaymentRow[])
        setVisits((visitsRes.data || []) as VisitRow[])
        setNominations((nomsRes.data || []) as NominationRow[])
        setCasts((castsRes.data || []) as CastRow[])
        setStore(storeRes.data ?? null)
      } catch {
        // エラー時は空データ
      }
      setLoading(false)
    }
    fetchData()
  }, [periodMode, selectedDate, selectedMonth])

  const castSalesData = useMemo(
    () => calcCastSalesData(visits, nominations, payments, casts, store),
    [visits, nominations, payments, casts, store],
  )

  const totalNominations = castSalesData.reduce((s, c) => s + c.nominationsTotal, 0)
  const totalDouhan = castSalesData.reduce((s, c) => s + c.douhanCount, 0)

  function shiftDate(offset: number) {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + offset)
    setSelectedDate(toDateStr(d))
  }

  function shiftMonth(offset: number) {
    const [y, m] = selectedMonth.split('-').map(Number)
    const d = new Date(y, m - 1 + offset, 1)
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  function exportCSV() {
    const header = 'キャスト名,本指名,場内指名,指名計,同伴,指名料合計,関連売上'
    const rows = castSalesData.map(c =>
      `${c.stageName},${c.nominationsMain},${c.nominationsInStore},${c.nominationsTotal},${c.douhanCount},${c.nominationFee},${c.relatedSales}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const label = periodMode === 'daily' ? selectedDate : selectedMonth
    a.href = url
    a.download = `cast-sales-${label}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー: 日次/月次切り替え + 日付選択 */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex bg-[#141430] rounded-xl border border-[#2e2e50] p-1">
          <button
            onClick={() => setPeriodMode('daily')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodMode === 'daily' ? 'bg-[#d4b870] text-black' : 'text-[#9090bb]'}`}
          >
            日次
          </button>
          <button
            onClick={() => setPeriodMode('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodMode === 'monthly' ? 'bg-[#d4b870] text-black' : 'text-[#9090bb]'}`}
          >
            月次
          </button>
        </div>

        {periodMode === 'daily' ? (
          <div className="flex items-center gap-2">
            <button onClick={() => shiftDate(-1)} className="p-2 rounded-lg bg-[#141430] border border-[#2e2e50] text-[#9090bb]">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2 bg-[#141430] border border-[#2e2e50] rounded-lg px-3 py-2">
              <Calendar size={14} className="text-[#9090bb]" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent text-white text-sm outline-none"
              />
            </div>
            <button onClick={() => shiftDate(1)} className="p-2 rounded-lg bg-[#141430] border border-[#2e2e50] text-[#9090bb]">
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setSelectedDate(toDateStr(new Date()))}
              className="px-3 py-2 rounded-lg text-xs text-[#d4b870] bg-[#d4b870]/10 border border-[#d4b870]/30"
            >
              今日
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => shiftMonth(-1)} className="p-2 rounded-lg bg-[#141430] border border-[#2e2e50] text-[#9090bb]">
              <ChevronLeft size={16} />
            </button>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-[#141430] border border-[#2e2e50] rounded-lg px-3 py-2 text-white text-sm outline-none"
            />
            <button onClick={() => shiftMonth(1)} className="p-2 rounded-lg bg-[#141430] border border-[#2e2e50] text-[#9090bb]">
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {castSalesData.length > 0 && (
          <button
            onClick={exportCSV}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141430] border border-[#2e2e50] text-[#9090bb] text-sm hover:border-[#d4b870]/50"
          >
            <Download size={14} />CSV
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#9090bb]">読み込み中...</div>
      ) : castSalesData.length === 0 ? (
        <div className="text-center py-20 text-[#3a3a5e]">
          <p className="text-sm tracking-widest">この期間のデータはありません</p>
        </div>
      ) : (
        <>
          {/* サマリーカード */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-[#141430] rounded-xl p-5 border border-[#2e2e50]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#9090bb] text-xs tracking-widest uppercase">指名合計</span>
                <Star size={18} className="text-[#2e2e50]" />
              </div>
              <div className="text-2xl font-bold text-white">{totalNominations}件</div>
            </div>
            <div className="bg-[#141430] rounded-xl p-5 border border-[#2e2e50]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#9090bb] text-xs tracking-widest uppercase">同伴合計</span>
                <Star size={18} className="text-[#2e2e50]" />
              </div>
              <div className="text-2xl font-bold text-white">{totalDouhan}件</div>
            </div>
            <div className="bg-[#141430] rounded-xl p-5 border border-[#2e2e50]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#9090bb] text-xs tracking-widest uppercase">指名料合計</span>
                <TrendingUp size={18} className="text-[#2e2e50]" />
              </div>
              <div className="text-2xl font-bold text-[#d4b870]">
                {formatYen(castSalesData.reduce((s, c) => s + c.nominationFee, 0))}
              </div>
            </div>
          </div>

          {/* キャスト別一覧テーブル */}
          <div className="bg-[#141430] rounded-xl border border-[#2e2e50] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#2e2e50]">
              <h2 className="text-xs font-semibold text-[#9090bb] tracking-widest uppercase">
                <Star size={12} className="inline mr-1" />キャスト別実績
              </h2>
            </div>

            {/* ヘッダー行 */}
            <div className="hidden md:grid grid-cols-[auto_1fr_repeat(5,auto)] gap-4 px-5 py-2 text-[10px] text-[#3a3a5e] tracking-widest uppercase border-b border-[#2e2e50]">
              <span className="w-6" />
              <span />
              <span className="text-right w-16">本指名</span>
              <span className="text-right w-16">場内指名</span>
              <span className="text-right w-16">同伴</span>
              <span className="text-right w-24">指名料</span>
              <span className="text-right w-28">関連売上</span>
            </div>

            <div className="divide-y divide-[#2e2e50]">
              {castSalesData.map((c, idx) => (
                <div key={c.castId} className="flex md:grid md:grid-cols-[auto_1fr_repeat(5,auto)] gap-4 px-5 py-4 items-center hover:bg-[#0f0f28] transition-colors">
                  {/* 順位 */}
                  <span className={`text-sm font-bold w-6 shrink-0 ${idx === 0 ? 'text-[#d4b870]' : 'text-[#3a3a5e]'}`}>
                    {idx + 1}
                  </span>

                  {/* キャスト名 */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {c.photoUrl ? (
                      <img src={c.photoUrl} alt={c.stageName} className="w-9 h-9 rounded-full object-cover border border-[#2e2e50] shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#0f0f28] border border-[#2e2e50] flex items-center justify-center text-xs text-[#9090bb] shrink-0">
                        {c.stageName.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm text-white truncate">{c.stageName}</span>
                  </div>

                  {/* 本指名 */}
                  <div className="text-right w-16 shrink-0">
                    <div className="text-sm text-white">{c.nominationsMain}</div>
                    <div className="text-[10px] text-[#3a3a5e] md:hidden">本指名</div>
                  </div>

                  {/* 場内指名 */}
                  <div className="text-right w-16 shrink-0">
                    <div className="text-sm text-white">{c.nominationsInStore}</div>
                    <div className="text-[10px] text-[#3a3a5e] md:hidden">場内</div>
                  </div>

                  {/* 同伴 */}
                  <div className="text-right w-16 shrink-0">
                    <div className="text-sm text-white">{c.douhanCount}</div>
                    <div className="text-[10px] text-[#3a3a5e] md:hidden">同伴</div>
                  </div>

                  {/* 指名料 */}
                  <div className="text-right w-24 shrink-0">
                    <div className="text-sm text-white">{formatYen(c.nominationFee)}</div>
                    <div className="text-[10px] text-[#3a3a5e] md:hidden">指名料</div>
                  </div>

                  {/* 関連売上 */}
                  <div className="text-right w-28 shrink-0">
                    <div className={`text-sm font-bold ${idx === 0 ? 'text-[#d4b870]' : 'text-white'}`}>
                      {formatYen(c.relatedSales)}
                    </div>
                    <div className="text-[10px] text-[#3a3a5e] md:hidden">関連売上</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 凡例 */}
          <div className="text-xs text-[#3a3a5e] px-1 space-y-1">
            <p>※ 関連売上 = そのキャストを指名した来店の会計合計</p>
            <p>※ 指名料 = 本指名・場内指名の料金合計（fee_override が設定されている場合はその値を使用）</p>
          </div>
        </>
      )}
    </div>
  )
}
