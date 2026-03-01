import {
  FileWarning,
  Users,
  Clock,
  BarChart3,
  WifiOff,
  Crown,
  Tablet,
  ShieldCheck,
  FileText,
  Monitor,
  Heart,
  Calculator,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Testimonial } from "@/types";

export const BRAND = {
  name: "LunaPos",
  symbol: "☭",
  url: "https://lunapos.jp",
  email: "info@lunapos.jp",
} as const;

// key は messages の nav.{key} に対応
export const NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "features", href: "/features" },
  { key: "news", href: "/news" },
  { key: "column", href: "/column" },
  { key: "contact", href: "/contact" },
] as const;

export const FOOTER_NAV_ITEMS = [
  { key: "roadmap", href: "/roadmap" },
  { key: "company", href: "/company" },
  { key: "investor", href: "/investor" },
  { key: "partner", href: "/partner" },
] as const;

// テキストは messages の problems.items.{index}
export const PAIN_POINT_ICONS: LucideIcon[] = [
  FileWarning, Users, Clock, WifiOff, BarChart3,
];

// テキストは messages の featureHighlights.items.{index}
export const FEATURE_HIGHLIGHT_ICONS: LucideIcon[] = [Tablet, WifiOff, Crown];

// テキストは messages の allFeatures.{index}
export const ALL_FEATURE_ICONS: LucideIcon[] = [
  Heart, Clock, BarChart3, ShieldCheck, FileText,
  Calculator, Users, Monitor, Tablet, WifiOff,
];

export const PRICING_PLAN = {
  price: "¥30,000",
  featureCount: 10,
} as const;

export const TESTIMONIALS: Testimonial[] = [];

export const FAQ_COUNT = 6;
