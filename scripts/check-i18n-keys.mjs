// 翻訳ファイル（messages/*.json）のキー整合性チェック。
// ja.json を正とし、他ロケールのキー過不足を検出する。
// 例: 機能削除時に ja だけキーを消して en/zh に残る、逆に翻訳追加漏れ、といった事故を防ぐ。
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MESSAGES_DIR = "messages";
const BASE_LOCALE = "ja";

// ネストしたオブジェクトを "a.b.c" 形式のキー集合に潰す
function flattenKeys(obj, prefix = "") {
  const keys = new Set();
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      for (const nested of flattenKeys(v, path)) keys.add(nested);
    } else {
      keys.add(path);
    }
  }
  return keys;
}

const files = readdirSync(MESSAGES_DIR).filter((f) => f.endsWith(".json"));
const locales = Object.fromEntries(
  files.map((f) => [
    f.replace(/\.json$/, ""),
    flattenKeys(JSON.parse(readFileSync(join(MESSAGES_DIR, f), "utf8"))),
  ]),
);

if (!locales[BASE_LOCALE]) {
  console.error(`基準ロケール ${BASE_LOCALE}.json が見つかりません`);
  process.exit(1);
}

const base = locales[BASE_LOCALE];
let failed = false;

for (const [locale, keys] of Object.entries(locales)) {
  if (locale === BASE_LOCALE) continue;

  const missing = [...base].filter((k) => !keys.has(k)).sort();
  const extra = [...keys].filter((k) => !base.has(k)).sort();

  if (missing.length === 0 && extra.length === 0) {
    console.log(`✓ ${locale}: ${keys.size} キー（${BASE_LOCALE} と一致）`);
    continue;
  }

  failed = true;
  if (missing.length) {
    console.error(
      `::error file=${MESSAGES_DIR}/${locale}.json::${BASE_LOCALE} にあって ${locale} にないキー ${missing.length}件: ${missing.join(", ")}`,
    );
  }
  if (extra.length) {
    console.error(
      `::error file=${MESSAGES_DIR}/${locale}.json::${locale} にあって ${BASE_LOCALE} にないキー ${extra.length}件（削除漏れの可能性）: ${extra.join(", ")}`,
    );
  }
}

process.exit(failed ? 1 : 0);
