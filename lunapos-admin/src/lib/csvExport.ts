// CSVエクスポートユーティリティ（UTF-8 BOM付き、Excel対応）

const BOM = '\uFEFF'

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function buildCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerLine = headers.map(escapeCSV).join(',')
  const dataLines = rows.map(row => row.map(escapeCSV).join(','))
  return BOM + [headerLine, ...dataLines].join('\n')
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const methodLabels: Record<string, string> = {
  cash: '現金', credit: 'カード', electronic: '電子マネー', tab: 'ツケ',
}

import type { PaymentRow, CastRanking } from '../types'

export function exportDailyPaymentsCSV(payments: PaymentRow[]) {
  const headers = ['会計日時', '顧客名', '小計', 'サービス料', '消費税', '割引', '合計', '支払方法']
  const rows = payments.map(p => [
    formatDate(p.paid_at),
    p.customer_name,
    p.subtotal,
    p.service_fee,
    p.tax,
    p.discount,
    p.total,
    methodLabels[p.payment_method] || p.payment_method,
  ])
  downloadCSV(buildCSV(headers, rows), `luna_売上_${todayStr()}_日次.csv`)
}

export function exportMonthlyCSV(data: { date: string; total: number; count: number }[]) {
  const headers = ['日付', '売上合計', '来店組数']
  const rows = data.map(d => [d.date, d.total, d.count])
  downloadCSV(buildCSV(headers, rows), `luna_売上_${todayStr()}_月次.csv`)
}

export function exportCastRankingCSV(rankings: CastRanking[]) {
  const headers = ['キャスト名', '指名数', '売上貢献額', 'ドリンク数']
  const rows = rankings.map(r => [r.stageName, r.nominations, r.sales, r.drinkCount])
  downloadCSV(buildCSV(headers, rows), `luna_売上_${todayStr()}_キャスト別.csv`)
}

export function exportVisitDetailCSV(visits: {
  checkInTime: string
  customerName: string | null
  guestCount: number
  tableName: string
  total: number
  paymentMethod: string
  items: string
}[]) {
  const headers = ['来店日時', '顧客名', '人数', 'テーブル', '合計', '支払方法', '注文内容']
  const rows = visits.map(v => [
    formatDate(v.checkInTime),
    v.customerName,
    v.guestCount,
    v.tableName,
    v.total,
    methodLabels[v.paymentMethod] || v.paymentMethod,
    v.items,
  ])
  downloadCSV(buildCSV(headers, rows), `luna_売上_${todayStr()}_来店明細.csv`)
}
