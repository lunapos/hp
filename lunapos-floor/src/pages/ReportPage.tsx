import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Users, Clock, CreditCard, Star } from 'lucide-react'
import { useApp } from '../contexts/AppContext'

function StatCard({ label, value, sub, icon, gold = false }: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  gold?: boolean
}) {
  return (
    <div className="bg-[#0d0d1a] rounded-xl p-4 border border-[#1c1c2e]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#5a5a7a] text-xs tracking-widest uppercase">{label}</span>
        <span className="text-[#2a2a3e]">{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${gold ? 'text-[#c9a96e]' : 'text-[#f0ebe0]'}`}>{value}</div>
      {sub && <div className="text-xs text-[#5a5a7a] mt-1 tracking-wider">{sub}</div>}
    </div>
  )
}

export default function ReportPage() {
  const navigate = useNavigate()
  const { state } = useApp()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayPayments = state.payments.filter(p => new Date(p.paidAt) >= todayStart)
  const todayVisits = state.visits.filter(v => new Date(v.checkInTime) >= todayStart)
  const totalSales = todayPayments.reduce((s, p) => s + p.total, 0)
  const totalGroups = todayVisits.length
  const totalGuests = todayVisits.reduce((s, v) => s + v.guestCount, 0)
  const avgSpend = totalGroups > 0 ? Math.floor(totalSales / totalGroups) : 0
  const checkedOut = todayVisits.filter(v => v.isCheckedOut && v.checkOutTime)
  const avgStayMin = checkedOut.length > 0 ? Math.floor(checkedOut.reduce((s, v) => { const stay = (new Date(v.checkOutTime!).getTime() - new Date(v.checkInTime).getTime()) / 60000; return s + stay }, 0) / checkedOut.length) : 0

  const methodTotals = todayPayments.reduce<Record<string, number>>((acc, p) => { acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.total; return acc }, {})
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

  const menuRanking = todayVisits.flatMap(v => v.orderItems).reduce<Record<string, { name: string; count: number; revenue: number }>>((acc, item) => {
    if (!acc[item.menuItemId]) acc[item.menuItemId] = { name: item.menuItemName, count: 0, revenue: 0 }
    acc[item.menuItemId].count += item.quantity
    acc[item.menuItemId].revenue += item.price * item.quantity
    return acc
  }, {})
  const topMenus = Object.values(menuRanking).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  return (
    <div className="min-h-screen bg-[#07070e] text-[#f0ebe0]">
      <header className="bg-[#07070e] border-b border-[#1c1c2e] px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/floor')} className="p-1 text-[#5a5a7a]"><ArrowLeft size={22} /></button>
        <div>
          <h1 className="text-base font-bold tracking-[0.2em] text-[#c9a96e] uppercase">Daily Report</h1>
          <p className="text-xs text-[#5a5a7a] tracking-wider">
            {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
          </p>
        </div>
      </header>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="本日売上" value={`¥${totalSales.toLocaleString()}`} icon={<TrendingUp size={16} />} gold />
          <StatCard label="来店組数" value={`${totalGroups}組`} sub={`${totalGuests}名`} icon={<Users size={16} />} />
          <StatCard label="客単価" value={`¥${avgSpend.toLocaleString()}`} sub="1組あたり" icon={<CreditCard size={16} />} />
          <StatCard label="平均滞在" value={avgStayMin > 0 ? `${avgStayMin}分` : '--'} icon={<Clock size={16} />} />
        </div>

        {Object.keys(methodTotals).length > 0 && (
          <div className="bg-[#0d0d1a] rounded-xl p-4 border border-[#1c1c2e]">
            <h2 className="text-xs font-semibold text-[#5a5a7a] tracking-widest uppercase mb-3">支払い方法</h2>
            <div className="space-y-2">
              {Object.entries(methodTotals).map(([method, amount]) => {
                const pct = totalSales > 0 ? Math.round((amount / totalSales) * 100) : 0
                return (
                  <div key={method} className="flex items-center gap-3">
                    <span className="text-xs text-[#f0ebe0] w-20 tracking-wider">{methodLabels[method] || method}</span>
                    <div className="flex-1 h-1 bg-[#1c1c2e] rounded-full overflow-hidden">
                      <div className="h-full bg-[#c9a96e] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-[#5a5a7a] w-28 text-right">¥{amount.toLocaleString()} ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {castPerf.length > 0 && (
          <div className="bg-[#0d0d1a] rounded-xl p-4 border border-[#1c1c2e]">
            <h2 className="text-xs font-semibold text-[#5a5a7a] tracking-widest uppercase mb-3">
              <Star size={12} className="inline mr-1" />Cast Ranking
            </h2>
            <div className="space-y-2">
              {castPerf.map(({ cast, nominations, sales }, idx) => (
                <div key={cast.id} className="flex items-center gap-3">
                  <span className={`text-sm font-bold w-5 ${idx === 0 ? 'text-[#c9a96e]' : 'text-[#3a3a50]'}`}>{idx + 1}</span>
                  {cast.photo ? (
                    <img src={cast.photo} alt={cast.stageName} className="w-7 h-7 rounded-full object-cover border border-[#1c1c2e]" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#14142a] border border-[#1c1c2e] flex items-center justify-center text-xs text-[#5a5a7a]">{cast.stageName.charAt(0)}</div>
                  )}
                  <span className="flex-1 text-sm text-[#f0ebe0]">{cast.stageName}</span>
                  <span className="text-xs text-[#5a5a7a] tracking-wider">指名{nominations}件</span>
                  <span className="text-sm font-bold text-[#c9a96e]">¥{sales.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {topMenus.length > 0 && (
          <div className="bg-[#0d0d1a] rounded-xl p-4 border border-[#1c1c2e]">
            <h2 className="text-xs font-semibold text-[#5a5a7a] tracking-widest uppercase mb-3">Menu Top 5</h2>
            <div className="space-y-2">
              {topMenus.map(({ name, count, revenue }, idx) => (
                <div key={name} className="flex items-center gap-3">
                  <span className={`text-sm font-bold w-5 ${idx === 0 ? 'text-[#c9a96e]' : 'text-[#3a3a50]'}`}>{idx + 1}</span>
                  <span className="flex-1 text-sm text-[#f0ebe0]">{name}</span>
                  <span className="text-xs text-[#5a5a7a]">{count}杯</span>
                  <span className="text-sm font-bold text-[#c9a96e]">¥{revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {todayPayments.length > 0 && (
          <div className="bg-[#0d0d1a] rounded-xl p-4 border border-[#1c1c2e]">
            <h2 className="text-xs font-semibold text-[#5a5a7a] tracking-widest uppercase mb-3">会計履歴</h2>
            <div className="space-y-2">
              {todayPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-[#f0ebe0]">{p.customerName || '—'}</span>
                    <span className="text-[#5a5a7a] text-xs ml-2">{new Date(p.paidAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#c9a96e] font-bold">¥{p.total.toLocaleString()}</span>
                    <span className="text-[#5a5a7a] text-xs ml-2">{methodLabels[p.paymentMethod]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalGroups === 0 && (
          <div className="text-center py-16 text-[#2a2a3e]">
            <p className="text-sm tracking-widest">NO DATA TODAY</p>
          </div>
        )}
      </div>
    </div>
  )
}
