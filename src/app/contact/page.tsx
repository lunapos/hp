import type { Metadata } from "next";
import { Suspense } from "react";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "LunaPosへのお問い合わせ・導入のご相談はこちらから。",
};

export default function ContactPage() {
  return (
    <Suspense>
      <ContactContent />
    </Suspense>
  );
}
