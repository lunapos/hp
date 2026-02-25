import type { ConfirmedShift, Visit, Payment, OrderItem, ShiftEntry } from '../types'

function pad2(n: number) { return String(n).padStart(2, '0') }
function dateKey(d: Date) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` }

const _today = new Date()
const _todayKey = dateKey(_today)

function daysAgo(n: number): Date {
  const d = new Date(_today)
  d.setDate(d.getDate() - n)
  return d
}
function daysLater(n: number): Date {
  const d = new Date(_today)
  d.setDate(d.getDate() + n)
  return d
}

// ─── 出勤スケジュール（全キャスト） ───

export const dummyConfirmedShifts: ConfirmedShift[] = [
  // あいり c1 (エース。週5〜6出勤)
  { id: 'cs01', castId: 'c1', date: dateKey(daysAgo(6)), startTime: '20:00', endTime: '01:00' },
  { id: 'cs02', castId: 'c1', date: dateKey(daysAgo(5)), startTime: '20:00', endTime: '00:00' },
  { id: 'cs03', castId: 'c1', date: dateKey(daysAgo(3)), startTime: '21:00', endTime: '02:00' },
  { id: 'cs04', castId: 'c1', date: dateKey(daysAgo(2)), startTime: '20:00', endTime: '01:00' },
  { id: 'cs05', castId: 'c1', date: dateKey(daysAgo(1)), startTime: '20:00', endTime: '02:00', note: '延長あり' },
  { id: 'cs06', castId: 'c1', date: _todayKey,             startTime: '20:00', endTime: '01:00' },
  { id: 'cs07', castId: 'c1', date: dateKey(daysLater(1)), startTime: '20:00', endTime: '01:00' },
  { id: 'cs08', castId: 'c1', date: dateKey(daysLater(2)), startTime: '20:00', endTime: '00:00' },
  { id: 'cs09', castId: 'c1', date: dateKey(daysLater(3)), startTime: '21:00', endTime: '02:00' },
  { id: 'cs10', castId: 'c1', date: dateKey(daysLater(5)), startTime: '20:00', endTime: '01:00' },
  { id: 'cs11', castId: 'c1', date: dateKey(daysLater(6)), startTime: '20:00', endTime: '01:00' },
  { id: 'cs12', castId: 'c1', date: dateKey(daysLater(8)), startTime: '19:00', endTime: '00:00', note: '早出' },
  { id: 'cs13', castId: 'c1', date: dateKey(daysLater(10)), startTime: '20:00', endTime: '01:00' },

  // さくら c2 (週4出勤)
  { id: 'cs14', castId: 'c2', date: dateKey(daysAgo(6)), startTime: '20:00', endTime: '00:00' },
  { id: 'cs15', castId: 'c2', date: dateKey(daysAgo(4)), startTime: '20:00', endTime: '01:00' },
  { id: 'cs16', castId: 'c2', date: dateKey(daysAgo(2)), startTime: '21:00', endTime: '01:00' },
  { id: 'cs17', castId: 'c2', date: dateKey(daysAgo(1)), startTime: '20:00', endTime: '00:00' },
  { id: 'cs18', castId: 'c2', date: _todayKey,              startTime: '20:00', endTime: '01:00' },
  { id: 'cs19', castId: 'c2', date: dateKey(daysLater(1)),  startTime: '20:00', endTime: '00:00' },
  { id: 'cs20', castId: 'c2', date: dateKey(daysLater(3)),  startTime: '20:00', endTime: '01:00' },
  { id: 'cs21', castId: 'c2', date: dateKey(daysLater(5)),  startTime: '20:00', endTime: '01:00' },
  { id: 'cs22', castId: 'c2', date: dateKey(daysLater(7)),  startTime: '20:00', endTime: '00:00' },
  { id: 'cs23', castId: 'c2', date: dateKey(daysLater(9)),  startTime: '21:00', endTime: '02:00' },

  // みく c3 (週3〜4出勤)
  { id: 'cs24', castId: 'c3', date: dateKey(daysAgo(5)), startTime: '20:00', endTime: '01:00' },
  { id: 'cs25', castId: 'c3', date: dateKey(daysAgo(3)), startTime: '20:00', endTime: '00:00' },
  { id: 'cs26', castId: 'c3', date: dateKey(daysAgo(1)), startTime: '21:00', endTime: '01:00' },
  { id: 'cs27', castId: 'c3', date: _todayKey,              startTime: '20:00', endTime: '01:00' },
  { id: 'cs28', castId: 'c3', date: dateKey(daysLater(2)),  startTime: '20:00', endTime: '01:00' },
  { id: 'cs29', castId: 'c3', date: dateKey(daysLater(4)),  startTime: '20:00', endTime: '00:00' },
  { id: 'cs30', castId: 'c3', date: dateKey(daysLater(6)),  startTime: '21:00', endTime: '02:00' },
  { id: 'cs31', castId: 'c3', date: dateKey(daysLater(8)),  startTime: '20:00', endTime: '01:00' },

  // れな c4 (週3出勤)
  { id: 'cs32', castId: 'c4', date: dateKey(daysAgo(6)), startTime: '20:00', endTime: '00:00' },
  { id: 'cs33', castId: 'c4', date: dateKey(daysAgo(3)), startTime: '20:00', endTime: '01:00' },
  { id: 'cs34', castId: 'c4', date: dateKey(daysAgo(1)), startTime: '20:00', endTime: '00:00' },
  { id: 'cs35', castId: 'c4', date: _todayKey,              startTime: '20:00', endTime: '01:00' },
  { id: 'cs36', castId: 'c4', date: dateKey(daysLater(2)),  startTime: '20:00', endTime: '00:00' },
  { id: 'cs37', castId: 'c4', date: dateKey(daysLater(5)),  startTime: '20:00', endTime: '01:00' },
  { id: 'cs38', castId: 'c4', date: dateKey(daysLater(7)),  startTime: '21:00', endTime: '01:00' },
  { id: 'cs39', castId: 'c4', date: dateKey(daysLater(9)),  startTime: '20:00', endTime: '00:00' },

  // ゆい c5 (週3出勤)
  { id: 'cs40', castId: 'c5', date: dateKey(daysAgo(5)), startTime: '21:00', endTime: '01:00' },
  { id: 'cs41', castId: 'c5', date: dateKey(daysAgo(2)), startTime: '20:00', endTime: '01:00' },
  { id: 'cs42', castId: 'c5', date: dateKey(daysAgo(1)), startTime: '20:00', endTime: '00:00' },
  { id: 'cs43', castId: 'c5', date: _todayKey,              startTime: '20:00', endTime: '01:00' },
  { id: 'cs44', castId: 'c5', date: dateKey(daysLater(1)),  startTime: '20:00', endTime: '00:00' },
  { id: 'cs45', castId: 'c5', date: dateKey(daysLater(4)),  startTime: '20:00', endTime: '01:00' },
  { id: 'cs46', castId: 'c5', date: dateKey(daysLater(6)),  startTime: '21:00', endTime: '01:00' },

  // なな c6 (新人。週2〜3出勤)
  { id: 'cs47', castId: 'c6', date: dateKey(daysAgo(4)), startTime: '20:00', endTime: '00:00' },
  { id: 'cs48', castId: 'c6', date: dateKey(daysAgo(1)), startTime: '20:00', endTime: '00:00' },
  { id: 'cs49', castId: 'c6', date: _todayKey,              startTime: '20:00', endTime: '00:00' },
  { id: 'cs50', castId: 'c6', date: dateKey(daysLater(2)),  startTime: '20:00', endTime: '00:00' },
  { id: 'cs51', castId: 'c6', date: dateKey(daysLater(5)),  startTime: '20:00', endTime: '00:00' },
  { id: 'cs52', castId: 'c6', date: dateKey(daysLater(8)),  startTime: '20:00', endTime: '00:00' },
]

// ─── シフト希望データ ───

export const dummyShiftEntries: ShiftEntry[] = [
  // さくら c2: 来週の希望
  { id: 'se01', castId: 'c2', date: dateKey(daysLater(1)), status: 'available', startTime: '20:00', endTime: '00:00' },
  { id: 'se02', castId: 'c2', date: dateKey(daysLater(2)), status: 'unavailable' },
  { id: 'se03', castId: 'c2', date: dateKey(daysLater(3)), status: 'available', startTime: '20:00', endTime: '01:00' },
  { id: 'se04', castId: 'c2', date: dateKey(daysLater(4)), status: 'unavailable', note: '予定あり' },
  { id: 'se05', castId: 'c2', date: dateKey(daysLater(5)), status: 'available', startTime: '20:00', endTime: '01:00' },

  // みく c3: 来週の希望
  { id: 'se06', castId: 'c3', date: dateKey(daysLater(1)), status: 'unavailable', note: '学校' },
  { id: 'se07', castId: 'c3', date: dateKey(daysLater(2)), status: 'available', startTime: '20:00', endTime: '01:00' },
  { id: 'se08', castId: 'c3', date: dateKey(daysLater(3)), status: 'unavailable' },
  { id: 'se09', castId: 'c3', date: dateKey(daysLater(4)), status: 'available', startTime: '20:00', endTime: '00:00' },
  { id: 'se10', castId: 'c3', date: dateKey(daysLater(5)), status: 'unavailable' },
  { id: 'se11', castId: 'c3', date: dateKey(daysLater(6)), status: 'available', startTime: '21:00', endTime: '02:00' },

  // れな c4
  { id: 'se12', castId: 'c4', date: dateKey(daysLater(1)), status: 'unavailable' },
  { id: 'se13', castId: 'c4', date: dateKey(daysLater(2)), status: 'available', startTime: '20:00', endTime: '00:00' },
  { id: 'se14', castId: 'c4', date: dateKey(daysLater(3)), status: 'available', startTime: '20:00', endTime: '01:00' },
  { id: 'se15', castId: 'c4', date: dateKey(daysLater(4)), status: 'unavailable', note: '体調不良' },
  { id: 'se16', castId: 'c4', date: dateKey(daysLater(5)), status: 'available', startTime: '20:00', endTime: '01:00' },

  // ゆい c5
  { id: 'se17', castId: 'c5', date: dateKey(daysLater(1)), status: 'available', startTime: '20:00', endTime: '00:00' },
  { id: 'se18', castId: 'c5', date: dateKey(daysLater(2)), status: 'unavailable' },
  { id: 'se19', castId: 'c5', date: dateKey(daysLater(3)), status: 'available', startTime: '21:00', endTime: '01:00', note: '遅出希望' },
  { id: 'se20', castId: 'c5', date: dateKey(daysLater(4)), status: 'available', startTime: '20:00', endTime: '01:00' },

  // なな c6 (新人)
  { id: 'se21', castId: 'c6', date: dateKey(daysLater(1)), status: 'unavailable', note: 'バイト' },
  { id: 'se22', castId: 'c6', date: dateKey(daysLater(2)), status: 'available', startTime: '20:00', endTime: '00:00' },
  { id: 'se23', castId: 'c6', date: dateKey(daysLater(3)), status: 'unavailable' },
  { id: 'se24', castId: 'c6', date: dateKey(daysLater(4)), status: 'available', startTime: '20:00', endTime: '00:00' },
  { id: 'se25', castId: 'c6', date: dateKey(daysLater(5)), status: 'available', startTime: '20:00', endTime: '00:00' },
]

// ─── 売上ダミー ───

// === 今日の来店 ===

// 今日・卓1: 田中様（VIP・会計済み・本指名あいり）
const items_tanaka: OrderItem[] = [
  { id: 'doi01', menuItemId: 'm1', menuItemName: 'ウイスキー水割り', price: 1200, quantity: 2 },
  { id: 'doi02', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 3 },
  { id: 'doi03', menuItemId: 'm9', menuItemName: 'フルーツ盛り', price: 3000, quantity: 1 },
]

// 今日・VIP1: 山田様（会計済み・場内あいり）
const items_yamada: OrderItem[] = [
  { id: 'doi04', menuItemId: 'm3', menuItemName: 'カクテル', price: 1200, quantity: 1 },
  { id: 'doi05', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 2 },
  { id: 'doi06', menuItemId: 'm5', menuItemName: 'シャンパン（グラス）', price: 3000, quantity: 1 },
]

// 今日・卓2: 鈴木様（進行中・本指名あいり）
const items_suzuki: OrderItem[] = [
  { id: 'doi07', menuItemId: 'm2', menuItemName: 'ビール', price: 1000, quantity: 2 },
  { id: 'doi08', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 1 },
  { id: 'doi09', menuItemId: 'm10', menuItemName: 'おつまみセット', price: 2000, quantity: 1 },
]

// === 昨日の来店 ===

const items_sato_d1: OrderItem[] = [
  { id: 'doi10', menuItemId: 'm2', menuItemName: 'ビール', price: 1000, quantity: 3 },
  { id: 'doi11', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 1 },
]

const items_watanabe_d1: OrderItem[] = [
  { id: 'doi40', menuItemId: 'm14', menuItemName: 'ハイボール', price: 900, quantity: 3 },
  { id: 'doi41', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 2 },
  { id: 'doi42', menuItemId: 'm20', menuItemName: '枝豆', price: 800, quantity: 1 },
]

const items_kobayashi_d1: OrderItem[] = [
  { id: 'doi43', menuItemId: 'm8', menuItemName: 'シャンパンボトル', price: 30000, quantity: 1 },
  { id: 'doi44', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 5 },
  { id: 'doi45', menuItemId: 'm9', menuItemName: 'フルーツ盛り', price: 3000, quantity: 2 },
  { id: 'doi46', menuItemId: 'm11', menuItemName: 'チーズ盛り', price: 2500, quantity: 1 },
]

// === 一昨日の来店 ===

const items_ito_d2: OrderItem[] = [
  { id: 'doi12', menuItemId: 'm8', menuItemName: 'シャンパンボトル', price: 30000, quantity: 1 },
  { id: 'doi13', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 4 },
  { id: 'doi14', menuItemId: 'm9', menuItemName: 'フルーツ盛り', price: 3000, quantity: 1 },
]

const items_matsumoto_d2: OrderItem[] = [
  { id: 'doi50', menuItemId: 'm6', menuItemName: 'ウイスキーボトル', price: 15000, quantity: 1 },
  { id: 'doi51', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 3 },
  { id: 'doi52', menuItemId: 'm10', menuItemName: 'おつまみセット', price: 2000, quantity: 1 },
]

// === 3日前の来店 ===

const items_takahashi_d3: OrderItem[] = [
  { id: 'doi55', menuItemId: 'm5', menuItemName: 'シャンパン（グラス）', price: 3000, quantity: 2 },
  { id: 'doi56', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 3 },
  { id: 'doi57', menuItemId: 'm9', menuItemName: 'フルーツ盛り', price: 3000, quantity: 1 },
  { id: 'doi58', menuItemId: 'm19', menuItemName: 'ピザ', price: 1800, quantity: 1 },
]

const items_nakamura_d3: OrderItem[] = [
  { id: 'doi59', menuItemId: 'm7', menuItemName: '芋焼酎ボトル', price: 12000, quantity: 1 },
  { id: 'doi60', menuItemId: 'm16', menuItemName: '焼酎水割り', price: 800, quantity: 2 },
  { id: 'doi61', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 2 },
]

const items_yoshida_d3: OrderItem[] = [
  { id: 'doi62', menuItemId: 'm3', menuItemName: 'カクテル', price: 1200, quantity: 3 },
  { id: 'doi63', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 2 },
  { id: 'doi64', menuItemId: 'm11', menuItemName: 'チーズ盛り', price: 2500, quantity: 1 },
]

// === 4日前の来店 ===

const items_kato_d4: OrderItem[] = [
  { id: 'doi65', menuItemId: 'm14', menuItemName: 'ハイボール', price: 900, quantity: 2 },
  { id: 'doi66', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 1 },
]

// === 5日前の来店 ===

const items_tanaka_d5: OrderItem[] = [
  { id: 'doi70', menuItemId: 'm1', menuItemName: 'ウイスキー水割り', price: 1200, quantity: 3 },
  { id: 'doi71', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 4 },
  { id: 'doi72', menuItemId: 'm9', menuItemName: 'フルーツ盛り', price: 3000, quantity: 1 },
  { id: 'doi73', menuItemId: 'm10', menuItemName: 'おつまみセット', price: 2000, quantity: 1 },
]

const items_watanabe_d5: OrderItem[] = [
  { id: 'doi74', menuItemId: 'm15', menuItemName: 'ワイン（グラス）', price: 1500, quantity: 2 },
  { id: 'doi75', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 2 },
]

// === 6日前の来店 ===

const items_kobayashi_d6: OrderItem[] = [
  { id: 'doi80', menuItemId: 'm18', menuItemName: 'ドンペリ', price: 80000, quantity: 1 },
  { id: 'doi81', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 6 },
  { id: 'doi82', menuItemId: 'm9', menuItemName: 'フルーツ盛り', price: 3000, quantity: 2 },
  { id: 'doi83', menuItemId: 'm11', menuItemName: 'チーズ盛り', price: 2500, quantity: 1 },
]

const items_matsumoto_d6: OrderItem[] = [
  { id: 'doi84', menuItemId: 'm2', menuItemName: 'ビール', price: 1000, quantity: 2 },
  { id: 'doi85', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 1 },
  { id: 'doi86', menuItemId: 'm20', menuItemName: '枝豆', price: 800, quantity: 1 },
]

export const dummyVisits: Visit[] = [
  // ─── 今日（8卓） ───

  // 卓1: 田中様 → 本指名あいり（会計済み）
  {
    id: 'dv1', tableId: 't1', customerId: 'cu1', customerName: '田中様', guestCount: 2,
    nominations: [{ castId: 'c1', nominationType: 'main' }],
    checkInTime: _todayKey + 'T20:00:00', checkOutTime: _todayKey + 'T22:30:00',
    orderItems: items_tanaka, setMinutes: 60, isCheckedOut: true,
  },
  // VIP1: 山田様 → 場内あいり（会計済み）
  {
    id: 'dv2', tableId: 't6', customerId: 'cu2', customerName: '山田様', guestCount: 3,
    nominations: [{ castId: 'c1', nominationType: 'in_store' }],
    checkInTime: _todayKey + 'T21:00:00', checkOutTime: _todayKey + 'T23:00:00',
    orderItems: items_yamada, setMinutes: 60, isCheckedOut: true,
  },
  // 卓2: 鈴木様 → 本指名あいり（進行中）
  {
    id: 'dv3', tableId: 't2', customerName: '鈴木様', guestCount: 2,
    nominations: [{ castId: 'c1', nominationType: 'main' }],
    checkInTime: _todayKey + 'T22:00:00',
    orderItems: items_suzuki, setMinutes: 60, isCheckedOut: false,
  },
  // 卓4: 高橋様 → 本指名さくら（会計済み）
  {
    id: 'dv6', tableId: 't4', customerId: 'cu4', customerName: '高橋様', guestCount: 2,
    nominations: [{ castId: 'c2', nominationType: 'main' }],
    checkInTime: _todayKey + 'T20:00:00', checkOutTime: _todayKey + 'T23:00:00',
    orderItems: [
      { id: 'doi20', menuItemId: 'm8', menuItemName: 'シャンパンボトル', price: 30000, quantity: 1 },
      { id: 'doi21', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 4 },
      { id: 'doi22', menuItemId: 'm9', menuItemName: 'フルーツ盛り', price: 3000, quantity: 1 },
    ],
    setMinutes: 60, isCheckedOut: true,
  },
  // 卓5: 渡辺様 → 場内さくら（会計済み）
  {
    id: 'dv7', tableId: 't5', customerId: 'cu5', customerName: '渡辺様', guestCount: 1,
    nominations: [{ castId: 'c2', nominationType: 'in_store' }],
    checkInTime: _todayKey + 'T21:30:00', checkOutTime: _todayKey + 'T23:30:00',
    orderItems: [
      { id: 'doi23', menuItemId: 'm1', menuItemName: 'ウイスキー水割り', price: 1200, quantity: 3 },
      { id: 'doi24', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 2 },
    ],
    setMinutes: 60, isCheckedOut: true,
  },
  // VIP2: 中村様 → 本指名みく（会計済み）
  {
    id: 'dv8', tableId: 't7', customerId: 'cu6', customerName: '中村様', guestCount: 3,
    nominations: [{ castId: 'c3', nominationType: 'main' }],
    checkInTime: _todayKey + 'T20:30:00', checkOutTime: _todayKey + 'T22:30:00',
    orderItems: [
      { id: 'doi25', menuItemId: 'm3', menuItemName: 'カクテル', price: 1200, quantity: 2 },
      { id: 'doi26', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 1 },
      { id: 'doi27', menuItemId: 'm10', menuItemName: 'おつまみセット', price: 2000, quantity: 1 },
    ],
    setMinutes: 60, isCheckedOut: true,
  },
  // 卓3: 木村様 → 場内みく（会計済み）
  {
    id: 'dv9', tableId: 't3', customerName: '木村様', guestCount: 2,
    nominations: [{ castId: 'c3', nominationType: 'in_store' }],
    checkInTime: _todayKey + 'T21:30:00', checkOutTime: _todayKey + 'T23:30:00',
    orderItems: [
      { id: 'doi28', menuItemId: 'm6', menuItemName: 'ウイスキーボトル', price: 15000, quantity: 1 },
      { id: 'doi29', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 2 },
    ],
    setMinutes: 60, isCheckedOut: true,
  },
  // カウンター: 松本様 → 本指名れな（会計済み）
  {
    id: 'dv10', tableId: 't8', customerId: 'cu10', customerName: '松本様', guestCount: 2,
    nominations: [{ castId: 'c4', nominationType: 'main' }],
    checkInTime: _todayKey + 'T20:00:00', checkOutTime: _todayKey + 'T22:00:00',
    orderItems: [
      { id: 'doi30', menuItemId: 'm2', menuItemName: 'ビール', price: 1000, quantity: 3 },
      { id: 'doi31', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 1 },
      { id: 'doi32', menuItemId: 'm11', menuItemName: 'チーズ盛り', price: 2500, quantity: 1 },
    ],
    setMinutes: 60, isCheckedOut: true,
  },
  // 卓4(2回転目): 井上様 → 場内ゆい（会計済み）
  {
    id: 'dv11', tableId: 't4', customerName: '井上様', guestCount: 1,
    nominations: [{ castId: 'c5', nominationType: 'in_store' }],
    checkInTime: _todayKey + 'T21:00:00', checkOutTime: _todayKey + 'T23:00:00',
    orderItems: [
      { id: 'doi33', menuItemId: 'm3', menuItemName: 'カクテル', price: 1200, quantity: 2 },
      { id: 'doi34', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 1 },
    ],
    setMinutes: 60, isCheckedOut: true,
  },

  // ─── 昨日（4卓） ───

  // 佐藤様 → 本指名あいり
  {
    id: 'dv4', tableId: 't3', customerId: 'cu3', customerName: '佐藤様', guestCount: 1,
    nominations: [{ castId: 'c1', nominationType: 'main' }],
    checkInTime: dateKey(daysAgo(1)) + 'T20:30:00', checkOutTime: dateKey(daysAgo(1)) + 'T23:30:00',
    orderItems: items_sato_d1, setMinutes: 60, isCheckedOut: true,
  },
  // 渡辺様 → 場内さくら
  {
    id: 'dv12', tableId: 't1', customerId: 'cu5', customerName: '渡辺様', guestCount: 2,
    nominations: [{ castId: 'c2', nominationType: 'in_store' }],
    checkInTime: dateKey(daysAgo(1)) + 'T20:00:00', checkOutTime: dateKey(daysAgo(1)) + 'T22:00:00',
    orderItems: items_watanabe_d1, setMinutes: 60, isCheckedOut: true,
  },
  // 小林様（太客）→ 本指名さくら
  {
    id: 'dv13', tableId: 't6', customerId: 'cu7', customerName: '小林様', guestCount: 4,
    nominations: [{ castId: 'c2', nominationType: 'main' }],
    checkInTime: dateKey(daysAgo(1)) + 'T20:00:00', checkOutTime: dateKey(daysAgo(1)) + 'T01:00:00',
    orderItems: items_kobayashi_d1, setMinutes: 60, isCheckedOut: true,
  },
  // 吉田様 → 本指名れな
  {
    id: 'dv14', tableId: 't4', customerId: 'cu9', customerName: '吉田様', guestCount: 2,
    nominations: [{ castId: 'c4', nominationType: 'main' }],
    checkInTime: dateKey(daysAgo(1)) + 'T21:00:00', checkOutTime: dateKey(daysAgo(1)) + 'T23:00:00',
    orderItems: [
      { id: 'doi47', menuItemId: 'm14', menuItemName: 'ハイボール', price: 900, quantity: 3 },
      { id: 'doi48', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 2 },
      { id: 'doi49', menuItemId: 'm19', menuItemName: 'ピザ', price: 1800, quantity: 1 },
    ],
    setMinutes: 60, isCheckedOut: true,
  },

  // ─── 一昨日（3卓） ───

  // 伊藤様 → 本指名あいり
  {
    id: 'dv5', tableId: 't6', customerName: '伊藤様', guestCount: 4,
    nominations: [{ castId: 'c1', nominationType: 'main' }],
    checkInTime: dateKey(daysAgo(2)) + 'T20:00:00', checkOutTime: dateKey(daysAgo(2)) + 'T01:00:00',
    orderItems: items_ito_d2, setMinutes: 60, isCheckedOut: true,
  },
  // 松本様 → 本指名ゆい
  {
    id: 'dv15', tableId: 't2', customerId: 'cu10', customerName: '松本様', guestCount: 2,
    nominations: [{ castId: 'c5', nominationType: 'main' }],
    checkInTime: dateKey(daysAgo(2)) + 'T20:30:00', checkOutTime: dateKey(daysAgo(2)) + 'T23:00:00',
    orderItems: items_matsumoto_d2, setMinutes: 60, isCheckedOut: true,
  },
  // 加藤様 → 場内みく
  {
    id: 'dv16', tableId: 't5', customerId: 'cu8', customerName: '加藤様', guestCount: 1,
    nominations: [{ castId: 'c3', nominationType: 'in_store' }],
    checkInTime: dateKey(daysAgo(2)) + 'T21:00:00', checkOutTime: dateKey(daysAgo(2)) + 'T23:00:00',
    orderItems: [
      { id: 'doi53', menuItemId: 'm3', menuItemName: 'カクテル', price: 1200, quantity: 2 },
      { id: 'doi54', menuItemId: 'm12', menuItemName: 'レディースドリンク', price: 1500, quantity: 1 },
    ],
    setMinutes: 60, isCheckedOut: true,
  },

  // ─── 3日前（3卓） ───

  // 高橋様 → 本指名みく
  {
    id: 'dv17', tableId: 't7', customerId: 'cu4', customerName: '高橋様', guestCount: 3,
    nominations: [{ castId: 'c3', nominationType: 'main' }],
    checkInTime: dateKey(daysAgo(3)) + 'T20:00:00', checkOutTime: dateKey(daysAgo(3)) + 'T23:00:00',
    orderItems: items_takahashi_d3, setMinutes: 60, isCheckedOut: true,
  },
  // 中村様 → 場内あいり
  {
    id: 'dv18', tableId: 't1', customerId: 'cu6', customerName: '中村様', guestCount: 2,
    nominations: [{ castId: 'c1', nominationType: 'in_store' }],
    checkInTime: dateKey(daysAgo(3)) + 'T21:00:00', checkOutTime: dateKey(daysAgo(3)) + 'T23:00:00',
    orderItems: items_nakamura_d3, setMinutes: 60, isCheckedOut: true,
  },
  // 吉田様 → 本指名れな
  {
    id: 'dv19', tableId: 't4', customerId: 'cu9', customerName: '吉田様', guestCount: 2,
    nominations: [{ castId: 'c4', nominationType: 'main' }],
    checkInTime: dateKey(daysAgo(3)) + 'T20:30:00', checkOutTime: dateKey(daysAgo(3)) + 'T22:30:00',
    orderItems: items_yoshida_d3, setMinutes: 60, isCheckedOut: true,
  },

  // ─── 4日前（1卓） ───

  // 加藤様 → 場内なな (新人ヘルプ)
  {
    id: 'dv20', tableId: 't8', customerId: 'cu8', customerName: '加藤様', guestCount: 1,
    nominations: [{ castId: 'c6', nominationType: 'in_store' }],
    checkInTime: dateKey(daysAgo(4)) + 'T20:00:00', checkOutTime: dateKey(daysAgo(4)) + 'T22:00:00',
    orderItems: items_kato_d4, setMinutes: 60, isCheckedOut: true,
  },

  // ─── 5日前（2卓） ───

  // 田中様 → 本指名あいり
  {
    id: 'dv21', tableId: 't1', customerId: 'cu1', customerName: '田中様', guestCount: 2,
    nominations: [{ castId: 'c1', nominationType: 'main' }],
    checkInTime: dateKey(daysAgo(5)) + 'T20:00:00', checkOutTime: dateKey(daysAgo(5)) + 'T23:00:00',
    orderItems: items_tanaka_d5, setMinutes: 60, isCheckedOut: true,
  },
  // 渡辺様 → 場内ゆい
  {
    id: 'dv22', tableId: 't5', customerId: 'cu5', customerName: '渡辺様', guestCount: 1,
    nominations: [{ castId: 'c5', nominationType: 'in_store' }],
    checkInTime: dateKey(daysAgo(5)) + 'T21:00:00', checkOutTime: dateKey(daysAgo(5)) + 'T23:00:00',
    orderItems: items_watanabe_d5, setMinutes: 60, isCheckedOut: true,
  },

  // ─── 6日前（2卓） ───

  // 小林様（太客）→ 本指名あいり
  {
    id: 'dv23', tableId: 't6', customerId: 'cu7', customerName: '小林様', guestCount: 3,
    nominations: [{ castId: 'c1', nominationType: 'main' }],
    checkInTime: dateKey(daysAgo(6)) + 'T20:00:00', checkOutTime: dateKey(daysAgo(6)) + 'T01:00:00',
    orderItems: items_kobayashi_d6, setMinutes: 60, isCheckedOut: true,
  },
  // 松本様 → 本指名れな
  {
    id: 'dv24', tableId: 't8', customerId: 'cu10', customerName: '松本様', guestCount: 2,
    nominations: [{ castId: 'c4', nominationType: 'main' }],
    checkInTime: dateKey(daysAgo(6)) + 'T20:00:00', checkOutTime: dateKey(daysAgo(6)) + 'T22:00:00',
    orderItems: items_matsumoto_d6, setMinutes: 60, isCheckedOut: true,
  },
]

export const dummyPayments: Payment[] = [
  // ─── 今日 ───
  {
    id: 'dp1', visitId: 'dv1', tableId: 't1', customerName: '田中様',
    subtotal: 29400, expenseTotal: 0, nominationFee: 3000, serviceFee: 6480, tax: 3888, discount: 0,
    total: 42768, paymentMethod: 'credit',
    paidAt: _todayKey + 'T22:30:00', items: items_tanaka,
  },
  {
    id: 'dp2', visitId: 'dv2', tableId: 't6', customerName: '山田様',
    subtotal: 37200, expenseTotal: 0, nominationFee: 2000, serviceFee: 7840, tax: 4704, discount: 0,
    total: 51744, paymentMethod: 'cash',
    paidAt: _todayKey + 'T23:00:00', items: items_yamada,
  },
  {
    id: 'dp5', visitId: 'dv6', tableId: 't4', customerName: '高橋様',
    subtotal: 49000, expenseTotal: 0, nominationFee: 3000, serviceFee: 10400, tax: 6240, discount: 0,
    total: 68640, paymentMethod: 'cash',
    paidAt: _todayKey + 'T23:00:00', items: [],
  },
  {
    id: 'dp6', visitId: 'dv7', tableId: 't5', customerName: '渡辺様',
    subtotal: 16600, expenseTotal: 0, nominationFee: 2000, serviceFee: 3720, tax: 2232, discount: 0,
    total: 24552, paymentMethod: 'credit',
    paidAt: _todayKey + 'T23:30:00', items: [],
  },
  {
    id: 'dp7', visitId: 'dv8', tableId: 't7', customerName: '中村様',
    subtotal: 35900, expenseTotal: 0, nominationFee: 3000, serviceFee: 7780, tax: 4668, discount: 0,
    total: 51348, paymentMethod: 'cash',
    paidAt: _todayKey + 'T22:30:00', items: [],
  },
  {
    id: 'dp8', visitId: 'dv9', tableId: 't3', customerName: '木村様',
    subtotal: 28000, expenseTotal: 0, nominationFee: 2000, serviceFee: 6000, tax: 3600, discount: 0,
    total: 39600, paymentMethod: 'cash',
    paidAt: _todayKey + 'T23:30:00', items: [],
  },
  {
    id: 'dp9', visitId: 'dv10', tableId: 't8', customerName: '松本様',
    subtotal: 16000, expenseTotal: 0, nominationFee: 3000, serviceFee: 3800, tax: 2280, discount: 0,
    total: 25080, paymentMethod: 'cash',
    paidAt: _todayKey + 'T22:00:00', items: [],
  },
  {
    id: 'dp10', visitId: 'dv11', tableId: 't4', customerName: '井上様',
    subtotal: 13900, expenseTotal: 0, nominationFee: 2000, serviceFee: 3180, tax: 1908, discount: 0,
    total: 20988, paymentMethod: 'credit',
    paidAt: _todayKey + 'T23:00:00', items: [],
  },

  // ─── 昨日 ───
  {
    id: 'dp3', visitId: 'dv4', tableId: 't3', customerName: '佐藤様',
    subtotal: 14500, expenseTotal: 0, nominationFee: 3000, serviceFee: 3500, tax: 2100, discount: 0,
    total: 23100, paymentMethod: 'cash',
    paidAt: dateKey(daysAgo(1)) + 'T23:30:00', items: items_sato_d1,
  },
  {
    id: 'dp11', visitId: 'dv12', tableId: 't1', customerName: '渡辺様',
    subtotal: 16500, expenseTotal: 0, nominationFee: 2000, serviceFee: 3700, tax: 2220, discount: 0,
    total: 24420, paymentMethod: 'cash',
    paidAt: dateKey(daysAgo(1)) + 'T22:00:00', items: items_watanabe_d1,
  },
  {
    id: 'dp12', visitId: 'dv13', tableId: 't6', customerName: '小林様',
    subtotal: 52000, expenseTotal: 0, nominationFee: 3000, serviceFee: 11000, tax: 6600, discount: 0,
    total: 72600, paymentMethod: 'credit',
    paidAt: dateKey(daysAgo(1)) + 'T01:00:00', items: items_kobayashi_d1,
  },
  {
    id: 'dp13', visitId: 'dv14', tableId: 't4', customerName: '吉田様',
    subtotal: 16500, expenseTotal: 0, nominationFee: 3000, serviceFee: 3900, tax: 2340, discount: 0,
    total: 25740, paymentMethod: 'cash',
    paidAt: dateKey(daysAgo(1)) + 'T23:00:00', items: [],
  },

  // ─── 一昨日 ───
  {
    id: 'dp4', visitId: 'dv5', tableId: 't6', customerName: '伊藤様',
    subtotal: 69000, expenseTotal: 0, nominationFee: 3000, serviceFee: 14400, tax: 8640, discount: 0,
    total: 95040, paymentMethod: 'credit',
    paidAt: dateKey(daysAgo(2)) + 'T01:00:00', items: items_ito_d2,
  },
  {
    id: 'dp14', visitId: 'dv15', tableId: 't2', customerName: '松本様',
    subtotal: 31000, expenseTotal: 0, nominationFee: 3000, serviceFee: 6800, tax: 4080, discount: 0,
    total: 44880, paymentMethod: 'cash',
    paidAt: dateKey(daysAgo(2)) + 'T23:00:00', items: items_matsumoto_d2,
  },
  {
    id: 'dp15', visitId: 'dv16', tableId: 't5', customerName: '加藤様',
    subtotal: 13900, expenseTotal: 0, nominationFee: 2000, serviceFee: 3180, tax: 1908, discount: 0,
    total: 20988, paymentMethod: 'cash',
    paidAt: dateKey(daysAgo(2)) + 'T23:00:00', items: [],
  },

  // ─── 3日前 ───
  {
    id: 'dp16', visitId: 'dv17', tableId: 't7', customerName: '高橋様',
    subtotal: 43300, expenseTotal: 0, nominationFee: 3000, serviceFee: 9260, tax: 5556, discount: 0,
    total: 61116, paymentMethod: 'cash',
    paidAt: dateKey(daysAgo(3)) + 'T23:00:00', items: items_takahashi_d3,
  },
  {
    id: 'dp17', visitId: 'dv18', tableId: 't1', customerName: '中村様',
    subtotal: 26600, expenseTotal: 0, nominationFee: 2000, serviceFee: 5720, tax: 3432, discount: 0,
    total: 37752, paymentMethod: 'cash',
    paidAt: dateKey(daysAgo(3)) + 'T23:00:00', items: items_nakamura_d3,
  },
  {
    id: 'dp18', visitId: 'dv19', tableId: 't4', customerName: '吉田様',
    subtotal: 19100, expenseTotal: 0, nominationFee: 3000, serviceFee: 4420, tax: 2652, discount: 0,
    total: 29172, paymentMethod: 'credit',
    paidAt: dateKey(daysAgo(3)) + 'T22:30:00', items: items_yoshida_d3,
  },

  // ─── 4日前 ───
  {
    id: 'dp19', visitId: 'dv20', tableId: 't8', customerName: '加藤様',
    subtotal: 13300, expenseTotal: 0, nominationFee: 2000, serviceFee: 3060, tax: 1836, discount: 0,
    total: 20196, paymentMethod: 'cash',
    paidAt: dateKey(daysAgo(4)) + 'T22:00:00', items: items_kato_d4,
  },

  // ─── 5日前 ───
  {
    id: 'dp20', visitId: 'dv21', tableId: 't1', customerName: '田中様',
    subtotal: 22600, expenseTotal: 0, nominationFee: 3000, serviceFee: 5120, tax: 3072, discount: 0,
    total: 33792, paymentMethod: 'credit',
    paidAt: dateKey(daysAgo(5)) + 'T23:00:00', items: items_tanaka_d5,
  },
  {
    id: 'dp21', visitId: 'dv22', tableId: 't5', customerName: '渡辺様',
    subtotal: 16000, expenseTotal: 0, nominationFee: 2000, serviceFee: 3600, tax: 2160, discount: 0,
    total: 23760, paymentMethod: 'cash',
    paidAt: dateKey(daysAgo(5)) + 'T23:00:00', items: items_watanabe_d5,
  },

  // ─── 6日前 ───
  {
    id: 'dp22', visitId: 'dv23', tableId: 't6', customerName: '小林様',
    subtotal: 107500, expenseTotal: 0, nominationFee: 3000, serviceFee: 22100, tax: 13260, discount: 0,
    total: 145860, paymentMethod: 'credit',
    paidAt: dateKey(daysAgo(6)) + 'T01:00:00', items: items_kobayashi_d6,
  },
  {
    id: 'dp23', visitId: 'dv24', tableId: 't8', customerName: '松本様',
    subtotal: 14300, expenseTotal: 0, nominationFee: 3000, serviceFee: 3460, tax: 2076, discount: 0,
    total: 22836, paymentMethod: 'cash',
    paidAt: dateKey(daysAgo(6)) + 'T22:00:00', items: items_matsumoto_d6,
  },
]
