import type { Table, Cast, MenuItem, SetPlan, Customer, Room } from '../types'

export const initialRooms: Room[] = [
  { id: 'r1', name: 'Main Room' },
  { id: 'r2', name: 'VIPルーム' },
  { id: 'r3', name: 'カウンター' },
]

export const initialTables: Table[] = [
  { id: 't1', name: '1番', capacity: 4, status: 'empty', position: { x: 1, y: 1 }, roomId: 'r1' },
  { id: 't2', name: '2番', capacity: 4, status: 'empty', position: { x: 2, y: 1 }, roomId: 'r1' },
  { id: 't3', name: '3番', capacity: 6, status: 'empty', position: { x: 3, y: 1 }, roomId: 'r1' },
  { id: 't4', name: '4番', capacity: 4, status: 'empty', position: { x: 1, y: 2 }, roomId: 'r1' },
  { id: 't5', name: '5番', capacity: 4, status: 'empty', position: { x: 2, y: 2 }, roomId: 'r1' },
  { id: 't6', name: 'VIP1', capacity: 8, status: 'empty', position: { x: 3, y: 2 }, roomId: 'r2' },
  { id: 't7', name: 'VIP2', capacity: 6, status: 'empty', position: { x: 1, y: 3 }, roomId: 'r2' },
  { id: 't8', name: 'カウンター', capacity: 4, status: 'empty', position: { x: 2, y: 3 }, roomId: 'r3' },
]

export const initialCasts: Cast[] = [
  { id: 'c1', stageName: 'あいり', realName: '山田愛', isWorking: false, photo: 'https://i.pravatar.cc/150?img=47' },
  { id: 'c2', stageName: 'さくら', realName: '田中咲', isWorking: false, photo: 'https://i.pravatar.cc/150?img=45' },
  { id: 'c3', stageName: 'みく', realName: '鈴木美久', isWorking: false, photo: 'https://i.pravatar.cc/150?img=44' },
  { id: 'c4', stageName: 'れな', realName: '佐藤礼奈', isWorking: false, photo: 'https://i.pravatar.cc/150?img=49' },
  { id: 'c5', stageName: 'ゆい', realName: '伊藤唯', isWorking: false, photo: 'https://i.pravatar.cc/150?img=41' },
  { id: 'c6', stageName: 'なな', realName: '中村奈々', isWorking: false, photo: 'https://i.pravatar.cc/150?img=43' },
]

export const initialMenuItems: MenuItem[] = [
  // ドリンク
  { id: 'm1', name: 'ウイスキー水割り', price: 1200, category: 'drink', isActive: true },
  { id: 'm2', name: 'ビール', price: 1000, category: 'drink', isActive: true },
  { id: 'm3', name: 'カクテル', price: 1200, category: 'drink', isActive: true },
  { id: 'm4', name: 'ソフトドリンク', price: 600, category: 'drink', isActive: true },
  { id: 'm5', name: 'シャンパン（グラス）', price: 3000, category: 'drink', isActive: true },
  // ボトル
  { id: 'm6', name: 'ウイスキーボトル', price: 15000, category: 'bottle', isActive: true },
  { id: 'm7', name: '芋焼酎ボトル', price: 12000, category: 'bottle', isActive: true },
  { id: 'm8', name: 'シャンパンボトル', price: 30000, category: 'bottle', isActive: true },
  // フード
  { id: 'm9', name: 'フルーツ盛り', price: 3000, category: 'food', isActive: true },
  { id: 'm10', name: 'おつまみセット', price: 2000, category: 'food', isActive: true },
  { id: 'm11', name: 'チーズ盛り', price: 2500, category: 'food', isActive: true },
  // レディースドリンク
  { id: 'm12', name: 'レディースドリンク', price: 1500, category: 'ladies_drink', isActive: true },
  // その他
]

export const initialSetPlans: SetPlan[] = [
  { id: 'sp1', name: 'Main Room（60分）', durationMinutes: 60, price: 10000, isActive: true },
  { id: 'sp2', name: 'T.O.C（30分）', durationMinutes: 30, price: 5000, isActive: true },
]

export const initialCustomers: Customer[] = [
  { id: 'cu1', name: '田中様', phone: '090-1234-5678', visitCount: 15, totalSpend: 250000, rank: 'vip', notes: 'ウイスキー好き', favoriteCastId: 'c1' },
  { id: 'cu2', name: '山田様', phone: '080-9876-5432', visitCount: 5, totalSpend: 75000, rank: 'repeat', favoriteCastId: 'c2' },
  { id: 'cu3', name: '佐藤様', visitCount: 1, totalSpend: 15000, rank: 'new' },
]

export const STORE_PIN = '1234'
