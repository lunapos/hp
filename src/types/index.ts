import type { LucideIcon } from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  details: string[];
}

export interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  venue: string;
  metric: string;
}

export interface PainPoint {
  icon: LucideIcon;
  text: string;
}

export interface ContactFormData {
  companyName: string;
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
}

export interface CompanyInfo {
  label: string;
  value: string;
}

export interface NavItem {
  label: string;
  href: string;
}
