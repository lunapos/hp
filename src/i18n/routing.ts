import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['ja', 'en', 'zh'],
  defaultLocale: 'ja',
  localePrefix: 'as-needed', // ja はプレフィックスなし、en/zh のみ /en/, /zh/
  localeDetection: false, // Accept-Language による自動リダイレクトを無効化
})
