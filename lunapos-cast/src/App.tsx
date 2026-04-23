import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import CastApp from './pages/CastApp'

function LoginPage() {
  const { signIn, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true); setError('')
    const { error } = await signIn(email, password)
    if (error) setError(error)
    setLoading(false)
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true); setError('')
    const { error } = await resetPassword(email)
    if (error) setError(error)
    else setResetSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a18] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl text-[#9090bb] mb-2">&#9789;</p>
          <h1 className="text-2xl font-bold tracking-[0.3em] text-[#d4b870] uppercase">LUNA CAST</h1>
          <p className="text-xs text-[#9090bb] mt-2 tracking-wider">キャストログイン</p>
        </div>
        {resetMode ? (
          <form onSubmit={handleReset} className="space-y-4">
            {resetSent ? (
              <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-4 text-sm text-emerald-400">
                パスワードリセット用のメールを送信しました。
              </div>
            ) : (
              <>
                <input type="email" placeholder="メールアドレス" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#141430] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none" autoFocus />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button type="submit" disabled={loading || !email}
                  className="w-full py-3 rounded-xl bg-[#d4b870] text-black font-bold disabled:opacity-30">
                  {loading ? '送信中...' : 'リセットメール送信'}
                </button>
              </>
            )}
            <button type="button" onClick={() => { setResetMode(false); setResetSent(false); setError('') }}
              className="w-full text-sm text-[#9090bb] hover:text-[#d4b870]">ログインに戻る</button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="メールアドレス" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#141430] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none" autoFocus />
            <input type="password" placeholder="パスワード" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#141430] border border-[#2e2e50] rounded-xl px-4 py-3 text-white placeholder-[#3a3a5e] outline-none" />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button type="submit" disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl bg-[#d4b870] text-black font-bold disabled:opacity-30">
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
            <button type="button" onClick={() => { setResetMode(true); setError('') }}
              className="w-full text-sm text-[#9090bb] hover:text-[#d4b870]">パスワードを忘れた場合</button>
          </form>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth()
  if (loading) return <div className="min-h-screen bg-[#0a0a18] flex items-center justify-center"><div className="text-[#9090bb] text-sm">読み込み中...</div></div>
  if (!user) return <Navigate to="/cast/login" replace />
  // cast_id がない = キャストアカウントではない（オーナー等）
  if (!user.user_metadata?.cast_id) {
    return (
      <div className="min-h-screen bg-[#0a0a18] text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-2xl text-[#9090bb]">&#9789;</p>
          <p className="text-[#9090bb] text-sm">このアカウントはキャスト画面にアクセスできません</p>
          <button onClick={signOut} className="px-6 py-3 rounded-xl bg-[#d4b870] text-black font-bold text-sm">
            ログアウト
          </button>
        </div>
      </div>
    )
  }
  return <>{children}</>
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-[#0a0a18] flex items-center justify-center"><div className="text-[#9090bb] text-sm">読み込み中...</div></div>

  return (
    <Routes>
      <Route path="/cast/login" element={user ? <Navigate to="/cast" replace /> : <LoginPage />} />
      <Route path="/cast" element={<ProtectedRoute><CastApp /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/cast" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
