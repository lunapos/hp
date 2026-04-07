import { useState, useEffect } from 'react'
import { Plus, Pencil, X, Check, Clock, Trash2 } from 'lucide-react'
import { supabase, supabaseUrl, supabaseAnonKey, requireTenantId } from '../lib/supabase'
import type { CastRow, CastShiftRow } from '../types'

const EMPTY_FORM = { stage_name: '', real_name: '', photo_url: '', drop_off_location: '', email: '' }

// Date → datetime-local の value 形式（ローカル時刻）
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function CastsPage() {
  const [casts, setCasts] = useState<CastRow[]>([])
  const [shifts, setShifts] = useState<CastShiftRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [hasAccount, setHasAccount] = useState(false)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState('')
  const [showRetired, setShowRetired] = useState(false)
  const [selectedCastId, setSelectedCastId] = useState<string | null>(null)

  // シフト編集
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null)
  const [shiftForm, setShiftForm] = useState({ clock_in: '', clock_out: '' })
  const [shiftSaving, setShiftSaving] = useState(false)

  useEffect(() => { fetchCasts(); fetchShifts() }, [])

  async function fetchCasts() {
    setLoading(true)
    const tid = requireTenantId()
    const { data } = await supabase.from('casts')
      .select('id, tenant_id, stage_name, real_name, photo_url, drop_off_location, is_active, created_at, updated_at')
      .eq('tenant_id', tid)
      .order('stage_name', { ascending: true })
    setCasts((data || []) as CastRow[])
    setLoading(false)
  }

  async function fetchShifts() {
    const tid = requireTenantId()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { data } = await supabase.from('cast_shifts')
      .select('id, tenant_id, cast_id, clock_in, clock_out, scheduled_clock_in, scheduled_clock_out, created_at, updated_at')
      .eq('tenant_id', tid)
      .gte('clock_in', thirtyDaysAgo.toISOString())
      .order('clock_in', { ascending: false })
    setShifts((data || []) as CastShiftRow[])
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  const filtered = casts.filter(c => showRetired || c.is_active)

  async function handleSave() {
    if (!form.stage_name.trim()) return
    setFormError('')
    setSaving(true)
    const tid = requireTenantId()

    if (editingId) {
      await supabase.from('casts').update({
        stage_name: form.stage_name.trim(),
        real_name: form.real_name.trim(),
        photo_url: form.photo_url || null,
        drop_off_location: form.drop_off_location || null,
        updated_at: new Date().toISOString(),
      }).eq('id', editingId).eq('tenant_id', tid)

      const emailTrimmed = form.email.trim()
      if (emailTrimmed) {
        if (hasAccount) {
          const res = await fetch(`${supabaseUrl}/functions/v1/cast-account?action=update-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey}` },
            body: JSON.stringify({ cast_id: editingId, tenant_id: tid, email: emailTrimmed }),
          })
          const data = await res.json()
          if (!res.ok) {
            setFormError(`メール更新失敗: ${data.error}`)
            setSaving(false)
            return
          }
        } else {
          const res = await fetch(`${supabaseUrl}/functions/v1/cast-signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey}` },
            body: JSON.stringify({ cast_id: editingId, email: emailTrimmed, password: 'luna1234', tenant_id: tid }),
          })
          const data = await res.json()
          if (!res.ok) {
            setFormError(data.error || 'アカウント作成に失敗しました')
            setSaving(false)
            return
          }
        }
      }

      showToast('キャスト情報を更新しました')
    } else {
      await supabase.from('casts').insert({
        tenant_id: tid,
        stage_name: form.stage_name.trim(),
        real_name: form.real_name.trim(),
        photo_url: form.photo_url || null,
        drop_off_location: form.drop_off_location || null,
        is_active: true,
      })
      showToast('キャストを追加しました')
    }

    setForm(EMPTY_FORM)
    setShowForm(false)
    setEditingId(null)
    setSaving(false)
    fetchCasts()
  }

  async function toggleRetire(cast: CastRow) {
    const tid = requireTenantId()
    const newActive = !cast.is_active
    await supabase.from('casts').update({
      is_active: newActive,
      updated_at: new Date().toISOString(),
    }).eq('id', cast.id).eq('tenant_id', tid)
    showToast(newActive ? '在籍に復帰しました' : '退職処理しました')
    fetchCasts()
  }

  async function startEdit(cast: CastRow) {
    setEditingId(cast.id)
    setHasAccount(false)
    setFormError('')
    setForm({
      stage_name: cast.stage_name,
      real_name: cast.real_name,
      photo_url: cast.photo_url || '',
      drop_off_location: cast.drop_off_location || '',
      email: '',
    })
    setShowForm(true)

    setEmailLoading(true)
    try {
      const tid = requireTenantId()
      const res = await fetch(
        `${supabaseUrl}/functions/v1/cast-account?action=get-email&cast_id=${cast.id}&tenant_id=${tid}`,
        { headers: { 'Authorization': `Bearer ${supabaseAnonKey}` } }
      )
      const data = await res.json()
      if (data.email) {
        setForm(f => ({ ...f, email: data.email }))
        setHasAccount(true)
      }
    } catch { /* ignore */ }
    setEmailLoading(false)
  }

  function startEditShift(shift: CastShiftRow) {
    setEditingShiftId(shift.id)
    setShiftForm({
      clock_in: toDatetimeLocal(shift.clock_in),
      clock_out: shift.clock_out ? toDatetimeLocal(shift.clock_out) : '',
    })
  }

  async function saveShift(shiftId: string) {
    if (!shiftForm.clock_in) return
    setShiftSaving(true)
    const tid = requireTenantId()
    const clockIn = new Date(shiftForm.clock_in).toISOString()
    const clockOut = shiftForm.clock_out ? new Date(shiftForm.clock_out).toISOString() : null
    await supabase.from('cast_shifts').update({
      clock_in: clockIn,
      clock_out: clockOut,
      updated_at: new Date().toISOString(),
    }).eq('id', shiftId).eq('tenant_id', tid)
    setEditingShiftId(null)
    setShiftSaving(false)
    showToast('シフトを更新しました')
    fetchShifts()
  }

  async function deleteShift(shiftId: string) {
    if (!confirm('このシフト記録を削除しますか？')) return
    const tid = requireTenantId()
    await supabase.from('cast_shifts').delete().eq('id', shiftId).eq('tenant_id', tid)
    showToast('シフトを削除しました')
    fetchShifts()
  }

  const selectedCastShifts = shifts.filter(s => s.cast_id === selectedCastId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">キャスト管理</h1>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d4b870] text-black font-bold text-sm"
        >
          <Plus size={16} />キャスト追加
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-[#9090bb] cursor-pointer">
        <input type="checkbox" checked={showRetired} onChange={e => setShowRetired(e.target.checked)} className="rounded" />
        退職者も表示
      </label>

      {/* 追加/編集フォーム */}
      {showForm && (
        <div className="bg-[#141430] border border-[#2e2e50] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-[#d4b870] tracking-widest uppercase font-semibold">
              {editingId ? 'キャスト編集' : '新規キャスト'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingId(null) }} className="text-[#9090bb]"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="源氏名 *" value={form.stage_name} onChange={e => setForm(f => ({ ...f, stage_name: e.target.value }))}
              className="bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none focus:border-[#d4b870]/50" />
            <input type="text" placeholder="本名" value={form.real_name} onChange={e => setForm(f => ({ ...f, real_name: e.target.value }))}
              className="bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none focus:border-[#d4b870]/50" />
            <input type="text" placeholder="送り先" value={form.drop_off_location} onChange={e => setForm(f => ({ ...f, drop_off_location: e.target.value }))}
              className="col-span-2 bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none focus:border-[#d4b870]/50" />
            {editingId && (
              <>
                <div className="col-span-2 relative">
                  <input
                    type="email"
                    placeholder={emailLoading ? 'メールアドレス取得中...' : 'ログイン用メールアドレス（任意）'}
                    value={form.email}
                    disabled={emailLoading}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none focus:border-[#d4b870]/50 disabled:opacity-50"
                  />
                  {emailLoading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9090bb]">取得中...</span>
                  )}
                </div>
                {!hasAccount && form.email.trim() && (
                  <p className="col-span-2 text-xs text-[#9090bb] bg-[#0f0f28] rounded-xl px-4 py-3 border border-[#2e2e50]">
                    初期パスワード <span className="text-[#d4b870] font-mono">luna1234</span> でアカウントを作成します。キャスト本人がログイン後に変更できます。
                  </p>
                )}
              </>
            )}
          </div>
          {formError && <p className="text-xs text-red-400">{formError}</p>}
          <button onClick={handleSave} disabled={saving || !form.stage_name.trim()}
            className="px-6 py-3 rounded-xl bg-[#d4b870] text-black font-bold disabled:opacity-30">
            {saving ? '保存中...' : editingId ? '更新' : '追加'}
          </button>
        </div>
      )}

      {/* キャスト一覧 */}
      {loading ? (
        <div className="text-center py-10 text-[#9090bb]">読み込み中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {filtered.map(cast => (
            <div key={cast.id} className="bg-[#141430] border border-[#2e2e50] rounded-xl p-4">
              <div className="flex items-center gap-4">
                {cast.photo_url ? (
                  <img src={cast.photo_url} alt={cast.stage_name} className="w-14 h-14 rounded-full object-cover border border-[#2e2e50]" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#0f0f28] border border-[#2e2e50] flex items-center justify-center text-lg text-[#9090bb] font-semibold">
                    {cast.stage_name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className={`text-base font-semibold ${cast.is_active ? 'text-white' : 'text-[#9090bb] line-through'}`}>
                    {cast.stage_name}
                  </div>
                  {cast.real_name && <div className="text-xs text-[#9090bb]">{cast.real_name}</div>}
                  <div className={`text-xs mt-1 px-2 py-0.5 rounded inline-block ${
                    cast.is_active ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'
                  }`}>
                    {cast.is_active ? '在籍' : '退職'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedCastId(selectedCastId === cast.id ? null : cast.id); setEditingShiftId(null) }}
                    className={`p-2 rounded-lg bg-[#0f0f28] ${selectedCastId === cast.id ? 'text-[#d4b870]' : 'text-[#9090bb] hover:text-white'}`}
                  >
                    <Clock size={14} />
                  </button>
                  <button onClick={() => startEdit(cast)} className="p-2 rounded-lg bg-[#0f0f28] text-[#9090bb] hover:text-[#d4b870]">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => { if (confirm(cast.is_active ? 'このキャストを退職処理しますか？' : '在籍に復帰しますか？')) toggleRetire(cast) }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium ${cast.is_active ? 'bg-red-900/20 text-red-400' : 'bg-emerald-900/20 text-emerald-400'}`}>
                    {cast.is_active ? '退職' : '復帰'}
                  </button>
                </div>
              </div>

              {/* 出退勤履歴（展開） */}
              {selectedCastId === cast.id && (
                <div className="mt-4 pt-4 border-t border-[#2e2e50]">
                  <h4 className="text-xs text-[#9090bb] tracking-widest uppercase mb-3">直近30日の出退勤履歴</h4>
                  {selectedCastShifts.length === 0 ? (
                    <p className="text-xs text-[#3a3a5e]">記録なし</p>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {selectedCastShifts.slice(0, 20).map(s => (
                        <div key={s.id}>
                          {editingShiftId === s.id ? (
                            /* 編集フォーム */
                            <div className="bg-[#0f0f28] border border-[#d4b870]/30 rounded-lg p-3 space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-[#9090bb] mb-1 block">出勤</label>
                                  <input
                                    type="datetime-local"
                                    value={shiftForm.clock_in}
                                    onChange={e => setShiftForm(f => ({ ...f, clock_in: e.target.value }))}
                                    className="w-full bg-[#141430] border border-[#2e2e50] rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-[#d4b870]/50"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-[#9090bb] mb-1 block">退勤（空欄 = 勤務中）</label>
                                  <input
                                    type="datetime-local"
                                    value={shiftForm.clock_out}
                                    onChange={e => setShiftForm(f => ({ ...f, clock_out: e.target.value }))}
                                    className="w-full bg-[#141430] border border-[#2e2e50] rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-[#d4b870]/50"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => setEditingShiftId(null)}
                                  className="px-3 py-1.5 rounded-lg text-xs text-[#9090bb] hover:text-white"
                                >
                                  キャンセル
                                </button>
                                <button
                                  onClick={() => saveShift(s.id)}
                                  disabled={shiftSaving || !shiftForm.clock_in}
                                  className="px-3 py-1.5 rounded-lg bg-[#d4b870] text-black text-xs font-bold disabled:opacity-30"
                                >
                                  {shiftSaving ? '保存中...' : '保存'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* 表示行 */
                            <div className="flex items-center justify-between text-xs group">
                              <span className="text-[#9090bb] w-12 shrink-0">
                                {new Date(s.clock_in).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                              </span>
                              <span className="text-white flex-1">
                                {new Date(s.clock_in).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                {' - '}
                                {s.clock_out
                                  ? new Date(s.clock_out).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                                  : <span className="text-emerald-400">勤務中</span>
                                }
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditShift(s)}
                                  className="p-1 rounded text-[#9090bb] hover:text-[#d4b870]"
                                >
                                  <Pencil size={11} />
                                </button>
                                <button
                                  onClick={() => deleteShift(s.id)}
                                  className="p-1 rounded text-[#9090bb] hover:text-red-400"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
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
