import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "LunaPosへのお問い合わせ・資料請求・導入のご相談。通常2営業日以内にご返信いたします。",
};

export default function ContactPage() {
  return <ContactContent />;
}
