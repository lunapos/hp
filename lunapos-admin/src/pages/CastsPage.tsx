import { useState, useEffect } from 'react'
import { Plus, Pencil, X, Check, Clock, UserPlus, Mail } from 'lucide-react'
import { supabase, supabaseUrl, supabaseAnonKey, requireTenantId } from '../lib/supabase'
import type { CastRow, CastShiftRow } from '../types'

const EMPTY_FORM = { stage_name: '', real_name: '', photo_url: '', drop_off_location: '', email: '' }

export default function CastsPage() {
  const [casts, setCasts] = useState<CastRow[]>([])
  const [shifts, setShifts] = useState<CastShiftRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [showRetired, setShowRetired] = useState(false)
  const [selectedCastId, setSelectedCastId] = useState<string | null>(null)
  const [accountForm, setAccountForm] = useState<{ castId: string; email: string; password: string } | null>(null)
  const [accountSaving, setAccountSaving] = useState(false)
  const [accountError, setAccountError] = useState('')

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

      // メールアドレスが入力されていれば更新
      if (form.email.trim()) {
        const res = await fetch(`${supabaseUrl}/functions/v1/cast-account?action=update-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey}` },
          body: JSON.stringify({ cast_id: editingId, tenant_id: tid, email: form.email.trim() }),
        })
        const data = await res.json()
        if (!res.ok) {
          showToast(`メール更新失敗: ${data.error}`)
          setSaving(false)
          return
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
    setForm({
      stage_name: cast.stage_name,
      real_name: cast.real_name,
      photo_url: cast.photo_url || '',
      drop_off_location: cast.drop_off_location || '',
      email: '',
    })
    setShowForm(true)

    // 既存のメールアドレスを取得
    setEmailLoading(true)
    try {
      const tid = requireTenantId()
      const res = await fetch(
        `${supabaseUrl}/functions/v1/cast-account?action=get-email&cast_id=${cast.id}&tenant_id=${tid}`,
        { headers: { 'Authorization': `Bearer ${supabaseAnonKey}` } }
      )
      const data = await res.json()
      if (data.email) setForm(f => ({ ...f, email: data.email }))
    } catch { /* ignore */ }
    setEmailLoading(false)
  }

  function openAccountForm(castId: string) {
    setAccountForm({ castId, email: '', password: '' })
    setAccountError('')
  }

  async function handleCreateAccount() {
    if (!accountForm) return
    const { castId, email, password } = accountForm
    if (!email.trim() || !password) return
    if (password.length < 6) {
      setAccountError('パスワードは6文字以上で入力してください')
      return
    }

    setAccountSaving(true)
    setAccountError('')

    try {
      const tid = requireTenantId()
      const res = await fetch(`${supabaseUrl}/functions/v1/cast-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          cast_id: castId,
          email: email.trim(),
          password,
          tenant_id: tid,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setAccountError(data.error || 'アカウント作成に失敗しました')
        setAccountSaving(false)
        return
      }

      showToast(`${data.stage_name}のログインアカウントを作成しました`)
      setAccountForm(null)
    } catch {
      setAccountError('通信エラーが発生しました')
    }
    setAccountSaving(false)
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
            <input type="text" placeholder="プロフィール画像URL" value={form.photo_url} onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))}
              className="bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none focus:border-[#d4b870]/50" />
            <input type="text" placeholder="送り先" value={form.drop_off_location} onChange={e => setForm(f => ({ ...f, drop_off_location: e.target.value }))}
              className="bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none focus:border-[#d4b870]/50" />
            {editingId && (
              <div className="col-span-2 relative">
                <input
                  type="email"
                  placeholder={emailLoading ? 'メールアドレス取得中...' : 'ログイン用メールアドレス（アカウントなしは空欄）'}
                  value={form.email}
                  disabled={emailLoading}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none focus:border-[#d4b870]/50 disabled:opacity-50"
                />
                {emailLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9090bb]">取得中...</span>
                )}
              </div>
            )}
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <button onClick={() => openAccountForm(cast.id)}
                    title="ログインアカウント作成"
                    className="p-2 rounded-lg bg-[#0f0f28] text-[#9090bb] hover:text-emerald-400">
                    <UserPlus size={14} />
                  </button>
                  <button onClick={() => setSelectedCastId(selectedCastId === cast.id ? null : cast.id)}
                    className="p-2 rounded-lg bg-[#0f0f28] text-[#9090bb] hover:text-white">
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
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {selectedCastShifts.slice(0, 20).map(s => (
                        <div key={s.id} className="flex items-center justify-between text-xs">
                          <span className="text-[#9090bb]">
                            {new Date(s.clock_in).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-white">
                            {new Date(s.clock_in).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {s.clock_out ? new Date(s.clock_out).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '勤務中'}
                          </span>
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

      {/* アカウント作成モーダル */}
      {accountForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setAccountForm(null)}>
          <div className="bg-[#141430] border border-[#2e2e50] rounded-xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm text-[#d4b870] tracking-widest uppercase font-semibold flex items-center gap-2">
                <Mail size={16} />キャストアカウント作成
              </h3>
              <button onClick={() => setAccountForm(null)} className="text-[#9090bb]"><X size={18} /></button>
            </div>
            <p className="text-xs text-[#9090bb]">
              {casts.find(c => c.id === accountForm.castId)?.stage_name}のログインアカウントを作成します。
              cast.lunapos.jp でこのメールとパスワードでログインできるようになります。
            </p>
            <input
              type="email"
              placeholder="メールアドレス"
              value={accountForm.email}
              onChange={e => setAccountForm(f => f ? { ...f, email: e.target.value } : f)}
              className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none focus:border-[#d4b870]/50"
              autoFocus
            />
            <input
              type="password"
              placeholder="パスワード（6文字以上）"
              value={accountForm.password}
              onChange={e => setAccountForm(f => f ? { ...f, password: e.target.value } : f)}
              className="w-full bg-[#0f0f28] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none focus:border-[#d4b870]/50"
            />
            {accountError && <p className="text-xs text-red-400">{accountError}</p>}
            <button
              onClick={handleCreateAccount}
              disabled={accountSaving || !accountForm.email.trim() || !accountForm.password}
              className="w-full py-3 rounded-xl bg-[#d4b870] text-black font-bold disabled:opacity-30"
            >
              {accountSaving ? '作成中...' : 'アカウント作成'}
            </button>
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
