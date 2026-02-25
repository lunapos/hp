import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Delete } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { STORE_PIN } from '../data/mockData'

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const { dispatch } = useApp()
  const navigate = useNavigate()

  const handleKey = (key: string) => {
    if (pin.length >= 4) return
    const next = pin + key
    setPin(next)
    setError(false)
    if (next.length === 4) {
      setTimeout(() => {
        if (next === STORE_PIN) {
          dispatch({ type: 'LOGIN' })
          navigate('/floor')
        } else {
          setError(true)
          setPin('')
        }
      }, 200)
    }
  }

  const handleDelete = () => {
    setPin(p => p.slice(0, -1))
    setError(false)
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-amber-400 tracking-widest">LUNA</h1>
        <p className="text-gray-400 mt-2 text-sm">PINコードを入力してください</p>
      </div>

      {/* PIN dots */}
      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
              i < pin.length
                ? error
                  ? 'bg-red-500 border-red-500'
                  : 'bg-amber-400 border-amber-400'
                : 'border-gray-600'
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4 animate-pulse">PINコードが違います</p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-64">
        {keys.map((key, idx) => {
          if (key === '') return <div key={idx} />
          if (key === 'del') {
            return (
              <button
                key={idx}
                onClick={handleDelete}
                className="h-16 rounded-2xl bg-gray-800 flex items-center justify-center text-gray-300 text-xl active:bg-gray-700 transition-colors"
              >
                <Delete size={22} />
              </button>
            )
          }
          return (
            <button
              key={idx}
              onClick={() => handleKey(key)}
              className="h-16 rounded-2xl bg-gray-800 text-white text-2xl font-semibold active:bg-amber-500 active:text-black transition-colors"
            >
              {key}
            </button>
          )
        })}
      </div>

      <p className="mt-10 text-gray-700 text-xs opacity-0 select-none">.</p>
    </div>
  )
}
