/**
 * Business constants for LunaPos
 * --------------------------------
 * These values are currently hardcoded but should be loaded from
 * a backend API / DB config when integrating a server.
 *
 * Replace this file's exports with API fetch calls, e.g.:
 *   export async function fetchStoreConfig(): Promise<StoreConfig> { ... }
 */

// 料率
export const SERVICE_RATE = 0.4   // サービス料 40%
export const TAX_RATE = 0.1       // 消費税 10%

// 固定料金
export const DOUHAN_FEE = 3000          // 同伴料
export const NOMINATION_FEE_MAIN = 5000     // 本指名料
export const NOMINATION_FEE_IN_STORE = 2000 // 場内指名料

// 指名+同伴 複合料金
export const COMBINED_FEES = {
  none:            0,
  in_store:        NOMINATION_FEE_IN_STORE,
  main:            NOMINATION_FEE_MAIN,
  douhan:          DOUHAN_FEE,
  douhan_in_store: DOUHAN_FEE + NOMINATION_FEE_IN_STORE,
  douhan_main:     DOUHAN_FEE + NOMINATION_FEE_MAIN,
} as const
