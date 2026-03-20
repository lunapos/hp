import { useState, useEffect } from 'react'
import { Check, AlertTriangle, Copy, Plus } from 'lucide-react'
import { supabase, requireTenantId } from '../lib/supabase'
import type { StoreRow } from '../types'

interface DeviceRow {
  id: string
  device_name: string
  device_token: string
  role: string
  is_active: boolean
}

export default function SettingsPage() {
  const [store, setStore] = useState<StoreRow | null>(null)
  const [devices, setDevices] = useState<DeviceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [addingDevice, setAddingDevice] = useState(false)

  // フォーム状態
  const [form, setForm] = useState({
    name: '',
    service_rate: '',
    tax_rate: '',
    douhan_fee: '',
    nomination_fee_main: '',
    nomination_fee_in_store: '',
    invoice_registration_number: '',
  })

  useEffect(() => { fetchStore(); fetchDevices() }, [])

  async function fetchStore() {
    setLoading(true)
    const tid = requireTenantId()
    const { data } = await supabase.from('stores')
      .select('id, name, service_rate, tax_rate, douhan_fee, nomination_fee_main, nomination_fee_in_store, invoice_registration_number, created_at, updated_at')
      .eq('id', tid)
      .single()
    if (data) {
      const s = data as StoreRow
      setStore(s)
      setForm({
        name: s.name,
        service_rate: String(Math.round(s.service_rate * 100)),
        tax_rate: String(Math.round(s.tax_rate * 100)),
        douhan_fee: String(s.douhan_fee),
        nomination_fee_main: String(s.nomination_fee_main),
        nomination_fee_in_store: String(s.nomination_fee_in_store),
        invoice_registration_number: s.invoice_registration_number || '',
      })
    }
    setLoading(false)
  }

  async function fetchDevices() {
    const tid = requireTenantId()
    const { data } = await supabase.from('devices')
      .select('id, device_name, device_token, role, is_active')
      .eq('tenant_id', tid)
      .order('created_at')
    if (data) setDevices(data as DeviceRow[])
  }

  async function addDevice() {
    setAddingDevice(true)
    const tid = requireTenantId()
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const rand = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    const token = `luna-${rand(4)}-${rand(4)}`
    const name = `iPad ${devices.length + 1}`

    await supabase.from('devices').insert({
      tenant_id: tid,
      device_name: name,
      device_token: token,
      role: 'floor',
    })
    await fetchDevices()
    setAddingDevice(false)
    showToast('デバイスを追加しました')
  }

  function copyToken(token: string) {
    navigator.clipboard.writeText(token)
    showToast('コピーしました')
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2000) }

  // インボイス番号バリデーション（T + 13桁数字）
  function validateInvoiceNumber(num: string): boolean {
    if (!num) return true // 空はOK
    return /^T\d{13}$/.test(num)
  }

  async function handleSave() {
    if (!form.name.trim()) return

    // インボイス番号チェック
    if (form.invoice_registration_number && !validateInvoiceNumber(form.invoice_registration_number)) {
      showToast('インボイス番号はT+13桁数字の形式で入力してください')
      return
    }

    setConfirmOpen(false)
    setSaving(true)
    const tid = requireTenantId()

    await supabase.from('stores').update({
      name: form.name.trim(),
      service_rate: (parseFloat(form.service_rate) || 0) / 100,
      tax_rate: (parseFloat(form.tax_rate) || 0) / 100,
      douhan_fee: parseInt(form.douhan_fee) || 0,
      nomination_fee_main: parseInt(form.nomination_fee_main) || 0,
      nomination_fee_in_store: parseInt(form.nomination_fee_in_store) || 0,
      invoice_registration_number: form.invoice_registration_number || null,
      updated_at: new Date().toISOString(),
    }).eq('id', tid)

    setSaving(false)
    showToast('店舗設定を保存しました')
    fetchStore()
  }

  if (loading) return <div className="text-center py-10 text-[#9090bb]">読み込み中...</div>
  if (!store) return <div className="text-center py-10 text-[#9090bb]">店舗データが見つかりません</div>

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-white">店舗設定</h1>

      <div className="bg-[#141430] rounded-xl border border-[#2e2e50] p-6 space-y-5">
        {/* 店舗名 */}
        <div>
          <label className="text-xs text-[#9090bb] tracking-widest uppercase block mb-2">店舗名</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4b870]/50" />
        </div>

        {/* 料率 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#9090bb] tracking-widest uppercase block mb-2">消費税率 (%)</label>
            <input type="number" value={form.tax_rate} onChange={e => setForm(f => ({ ...f, tax_rate: e.target.value }))}
              className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4b870]/50" min="0" max="100" />
          </div>
          <div>
            <label className="text-xs text-[#9090bb] tracking-widest uppercase block mb-2">サービス料率 (%)</label>
            <input type="number" value={form.service_rate} onChange={e => setForm(f => ({ ...f, service_rate: e.target.value }))}
              className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4b870]/50" min="0" max="100" />
          </div>
        </div>

        {/* 指名料・同伴料 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-[#9090bb] tracking-widest uppercase block mb-2">本指名料（税込）</label>
            <input type="number" value={form.nomination_fee_main} onChange={e => setForm(f => ({ ...f, nomination_fee_main: e.target.value }))}
              className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4b870]/50" min="0" />
          </div>
          <div>
            <label className="text-xs text-[#9090bb] tracking-widest uppercase block mb-2">場内指名料（税込）</label>
            <input type="number" value={form.nomination_fee_in_store} onChange={e => setForm(f => ({ ...f, nomination_fee_in_store: e.target.value }))}
              className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4b870]/50" min="0" />
          </div>
          <div>
            <label className="text-xs text-[#9090bb] tracking-widest uppercase block mb-2">同伴料（税込）</label>
            <input type="number" value={form.douhan_fee} onChange={e => setForm(f => ({ ...f, douhan_fee: e.target.value }))}
              className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4b870]/50" min="0" />
          </div>
        </div>

        {/* インボイス */}
        <div>
          <label className="text-xs text-[#9090bb] tracking-widest uppercase block mb-2">インボイス登録番号</label>
          <input type="text" value={form.invoice_registration_number} onChange={e => setForm(f => ({ ...f, invoice_registration_number: e.target.value }))}
            placeholder="T1234567890123"
            className={`w-full bg-[#0f0f28] border rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none focus:border-[#d4b870]/50 ${
              form.invoice_registration_number && !validateInvoiceNumber(form.invoice_registration_number)
                ? 'border-red-500' : 'border-[#2e2e50]'
            }`} />
          <p className="text-xs text-[#9090bb] mt-1">T + 13桁数字。未設定の場合はレシートにインボイス情報を印字しません。</p>
        </div>

        {/* 保存ボタン */}
        <div className="flex items-center gap-4 pt-4 border-t border-[#2e2e50]">
          <button onClick={() => setConfirmOpen(true)} disabled={saving || !form.name.trim()}
            className="px-6 py-3 rounded-xl bg-[#d4b870] text-black font-bold disabled:opacity-30">
            {saving ? '保存中...' : '設定を保存'}
          </button>
        </div>
      </div>

      {/* デバイストークン */}
      <div className="bg-[#141430] rounded-xl border border-[#2e2e50] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">iPadデバイストークン</h2>
          <button
            onClick={addDevice}
            disabled={addingDevice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#d4b870] text-black disabled:opacity-30"
          >
            <Plus size={14} />追加
          </button>
        </div>
        <p className="text-xs text-[#9090bb]">
          iPadのLunaPOSアプリでこのトークンを入力するとPOSが使えるようになります。
        </p>
        {devices.length === 0 ? (
          <p className="text-sm text-[#9090bb]">デバイスがありません</p>
        ) : (
          <div className="space-y-2">
            {devices.map(d => (
              <div key={d.id} className="flex items-center gap-3 bg-[#0f0f28] border border-[#2e2e50] rounded-lg px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#9090bb]">{d.device_name}</p>
                  <p className="font-mono text-[#d4b870] tracking-wider">{d.device_token}</p>
                </div>
                <button
                  onClick={() => copyToken(d.device_token)}
                  className="p-2 rounded-lg hover:bg-[#2e2e50] text-[#9090bb] hover:text-white shrink-0"
                  title="コピー"
                >
                  <Copy size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 確認ダイアログ */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setConfirmOpen(false)}>
          <div className="bg-[#141430] border border-[#2e2e50] rounded-xl p-6 max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={20} className="text-amber-400" />
              <h3 className="text-white font-semibold">設定を変更しますか？</h3>
            </div>
            <p className="text-sm text-[#9090bb] mb-6">
              料金設定の変更は、今後の新規来店に適用されます。既存の来店・会計データには影響しません。
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 rounded-lg text-sm text-[#9090bb] bg-[#0f0f28]">キャンセル</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-bold bg-[#d4b870] text-black">保存する</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-emerald-900/90 border border-emerald-700 text-emerald-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg z-50">
          <Check size={16} />{toast}
        </div>
      )}
    </div>
  )
}
