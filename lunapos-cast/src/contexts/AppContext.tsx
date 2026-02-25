import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { AppState, Table, Visit, OrderItem, Payment, Customer, Room, Cast, MenuItem, ShiftEntry, ShiftStatus, ConfirmedShift } from '../types'
import {
  initialTables,
  initialCasts,
  initialMenuItems,
  initialSetPlans,
  initialCustomers,
  initialRooms,
} from '../data/mockData'
import {
  dummyConfirmedShifts,
  dummyVisits,
  dummyPayments,
  dummyShiftEntries,
} from '../data/dummyData'

export const STORAGE_KEY = 'luna_app_state'

type Action =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'OPEN_TABLE'; payload: { tableId: string; visitData: Omit<Visit, 'id' | 'orderItems' | 'isCheckedOut'> } }
  | { type: 'CLOSE_TABLE'; payload: { tableId: string } }
  | { type: 'ADD_ORDER_ITEM'; payload: { visitId: string; item: Omit<OrderItem, 'id'> } }
  | { type: 'REMOVE_ORDER_ITEM'; payload: { visitId: string; itemId: string } }
  | { type: 'CHECKOUT'; payload: Payment }
  | { type: 'CLOCK_IN'; payload: { castId: string } }
  | { type: 'CLOCK_OUT'; payload: { castId: string } }
  | { type: 'UPDATE_TABLE_STATUS'; payload: { tableId: string; status: Table['status'] } }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_VISIT_SET'; payload: { visitId: string; setMinutes: number } }
  | { type: 'ADD_ROOM'; payload: { name: string } }
  | { type: 'UPDATE_ROOM'; payload: { id: string; name: string } }
  | { type: 'DELETE_ROOM'; payload: { id: string } }
  | { type: 'MOVE_TABLE_ROOM'; payload: { tableId: string; roomId: string } }
  | { type: 'UPDATE_TABLE_POSITION'; payload: { tableId: string; position: { x: number; y: number } } }
  | { type: 'ADD_CAST'; payload: Omit<Cast, 'id' | 'isWorking'> }
  | { type: 'UPDATE_CAST'; payload: { id: string } & Omit<Cast, 'id' | 'isWorking' | 'clockInTime' | 'clockOutTime'> }
  | { type: 'UPDATE_GUEST_COUNT'; payload: { visitId: string; guestCount: number } }
  | { type: 'ADD_MENU_ITEM'; payload: { name: string; price: number; category: MenuItem['category'] } }
  | { type: 'TOGGLE_MENU_ITEM'; payload: { id: string } }
  | { type: 'SUBMIT_SHIFT'; payload: { castId: string; date: string; status: ShiftStatus; startTime?: string; endTime?: string; note?: string } }
  | { type: 'DELETE_SHIFT'; payload: { castId: string; date: string } }
  | { type: 'CONFIRM_SHIFT'; payload: { castId: string; date: string; startTime: string; endTime: string; note?: string } }
  | { type: 'DELETE_CONFIRMED_SHIFT'; payload: { castId: string; date: string } }
  | { type: 'LOAD_STATE'; payload: AppState }

const defaultState: AppState = {
  isLoggedIn: true,
  rooms: initialRooms,
  tables: initialTables,
  casts: initialCasts,
  customers: initialCustomers,
  menuItems: initialMenuItems,
  visits: dummyVisits,
  payments: dummyPayments,
  setPlans: initialSetPlans,
  shiftEntries: dummyShiftEntries,
  confirmedShifts: dummyConfirmedShifts,
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Partial<AppState>
      const merged = { ...defaultState, ...saved }
      // Always use latest cast master data (loginId, password, hourlyRate, etc.)
      // while preserving runtime fields (isWorking, clockInTime, clockOutTime)
      merged.casts = initialCasts.map(master => {
        const saved_cast = saved.casts?.find(c => c.id === master.id)
        if (saved_cast) {
          return { ...master, isWorking: saved_cast.isWorking, clockInTime: saved_cast.clockInTime, clockOutTime: saved_cast.clockOutTime }
        }
        return master
      })
      if (!merged.shiftEntries) merged.shiftEntries = []
      if (!merged.confirmedShifts) merged.confirmedShifts = []
      return merged
    }
  } catch {}
  return defaultState
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload

    case 'LOGIN':
      return { ...state, isLoggedIn: true }

    case 'LOGOUT':
      return { ...state, isLoggedIn: false }

    case 'OPEN_TABLE': {
      const { tableId, visitData } = action.payload
      const visitId = generateId()
      const newVisit: Visit = { ...visitData, id: visitId, orderItems: [], isCheckedOut: false }
      return {
        ...state,
        tables: state.tables.map(t => t.id === tableId ? { ...t, status: 'occupied', visitId } : t),
        visits: [...state.visits, newVisit],
      }
    }

    case 'ADD_ORDER_ITEM': {
      const { visitId, item } = action.payload
      const newItem: OrderItem = { ...item, id: generateId() }
      return {
        ...state,
        visits: state.visits.map(v => v.id === visitId ? { ...v, orderItems: [...v.orderItems, newItem] } : v),
      }
    }

    case 'REMOVE_ORDER_ITEM': {
      const { visitId, itemId } = action.payload
      return {
        ...state,
        visits: state.visits.map(v =>
          v.id === visitId ? { ...v, orderItems: v.orderItems.filter(i => i.id !== itemId) } : v
        ),
      }
    }

    case 'UPDATE_TABLE_STATUS': {
      return {
        ...state,
        tables: state.tables.map(t =>
          t.id === action.payload.tableId ? { ...t, status: action.payload.status } : t
        ),
      }
    }

    case 'CHECKOUT': {
      const payment = action.payload
      const visit = state.visits.find(v => v.id === payment.visitId)
      const tableId = visit?.tableId
      let customers = state.customers
      if (visit?.customerId) {
        customers = customers.map(c =>
          c.id === visit.customerId
            ? { ...c, visitCount: c.visitCount + 1, totalSpend: c.totalSpend + payment.total, rank: c.visitCount + 1 >= 10 ? 'vip' : c.visitCount + 1 >= 3 ? 'repeat' : c.rank }
            : c
        )
      }
      return {
        ...state,
        tables: state.tables.map(t => t.id === tableId ? { ...t, status: 'empty', visitId: undefined } : t),
        visits: state.visits.map(v => v.id === payment.visitId ? { ...v, isCheckedOut: true, checkOutTime: payment.paidAt } : v),
        payments: [...state.payments, payment],
        customers,
      }
    }

    case 'CLOCK_IN': {
      return {
        ...state,
        casts: state.casts.map(c =>
          c.id === action.payload.castId
            ? { ...c, isWorking: true, clockInTime: new Date().toISOString(), clockOutTime: undefined }
            : c
        ),
      }
    }

    case 'CLOCK_OUT': {
      return {
        ...state,
        casts: state.casts.map(c =>
          c.id === action.payload.castId
            ? { ...c, isWorking: false, clockOutTime: new Date().toISOString() }
            : c
        ),
      }
    }

    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] }

    case 'UPDATE_VISIT_SET': {
      return {
        ...state,
        visits: state.visits.map(v =>
          v.id === action.payload.visitId ? { ...v, setMinutes: action.payload.setMinutes } : v
        ),
      }
    }

    case 'ADD_ROOM': {
      const newRoom: Room = { id: generateId(), name: action.payload.name }
      return { ...state, rooms: [...state.rooms, newRoom] }
    }

    case 'UPDATE_ROOM': {
      return {
        ...state,
        rooms: state.rooms.map(r => r.id === action.payload.id ? { ...r, name: action.payload.name } : r),
      }
    }

    case 'DELETE_ROOM': {
      const { id } = action.payload
      if (state.rooms.length <= 1) return state
      const remaining = state.rooms.filter(r => r.id !== id)
      const fallbackId = remaining[0].id
      return {
        ...state,
        rooms: remaining,
        tables: state.tables.map(t => t.roomId === id ? { ...t, roomId: fallbackId } : t),
      }
    }

    case 'MOVE_TABLE_ROOM': {
      return {
        ...state,
        tables: state.tables.map(t =>
          t.id === action.payload.tableId ? { ...t, roomId: action.payload.roomId } : t
        ),
      }
    }

    case 'UPDATE_TABLE_POSITION': {
      return {
        ...state,
        tables: state.tables.map(t =>
          t.id === action.payload.tableId ? { ...t, position: action.payload.position } : t
        ),
      }
    }

    case 'ADD_CAST': {
      const newCast: Cast = { ...action.payload, id: generateId(), isWorking: false }
      return { ...state, casts: [...state.casts, newCast] }
    }

    case 'UPDATE_CAST': {
      const { id, ...updates } = action.payload
      return {
        ...state,
        casts: state.casts.map(c => c.id === id ? { ...c, ...updates } : c),
      }
    }

    case 'UPDATE_GUEST_COUNT': {
      return {
        ...state,
        visits: state.visits.map(v =>
          v.id === action.payload.visitId ? { ...v, guestCount: action.payload.guestCount } : v
        ),
      }
    }

    case 'ADD_MENU_ITEM': {
      const newItem: MenuItem = {
        id: generateId(),
        name: action.payload.name,
        price: action.payload.price,
        category: action.payload.category,
        isActive: true,
      }
      return { ...state, menuItems: [...state.menuItems, newItem] }
    }

    case 'TOGGLE_MENU_ITEM': {
      return {
        ...state,
        menuItems: state.menuItems.map(m =>
          m.id === action.payload.id ? { ...m, isActive: !m.isActive } : m
        ),
      }
    }

    case 'SUBMIT_SHIFT': {
      const { castId, date, status, startTime, endTime, note } = action.payload
      const existing = state.shiftEntries.find(s => s.castId === castId && s.date === date)
      if (existing) {
        return {
          ...state,
          shiftEntries: state.shiftEntries.map(s =>
            s.id === existing.id ? { ...s, status, startTime, endTime, note } : s
          ),
        }
      }
      const newEntry: ShiftEntry = { id: generateId(), castId, date, status, startTime, endTime, note }
      return { ...state, shiftEntries: [...state.shiftEntries, newEntry] }
    }

    case 'DELETE_SHIFT': {
      const { castId, date } = action.payload
      return {
        ...state,
        shiftEntries: state.shiftEntries.filter(s => !(s.castId === castId && s.date === date)),
      }
    }

    case 'CONFIRM_SHIFT': {
      const { castId, date, startTime, endTime, note } = action.payload
      const existing = state.confirmedShifts.find(s => s.castId === castId && s.date === date)
      if (existing) {
        return {
          ...state,
          confirmedShifts: state.confirmedShifts.map(s =>
            s.id === existing.id ? { ...s, startTime, endTime, note } : s
          ),
        }
      }
      const newEntry: ConfirmedShift = { id: generateId(), castId, date, startTime, endTime, note }
      return { ...state, confirmedShifts: [...state.confirmedShifts, newEntry] }
    }

    case 'DELETE_CONFIRMED_SHIFT': {
      const { castId, date } = action.payload
      return {
        ...state,
        confirmedShifts: state.confirmedShifts.filter(s => !(s.castId === castId && s.date === date)),
      }
    }

    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, loadState())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue) as AppState
          dispatch({ type: 'LOAD_STATE', payload: newState })
        } catch {}
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
