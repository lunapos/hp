"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function Section({ children, className = "", id }: SectionProps) {
  const { ref, isVisible, shouldAnimate } = useScrollAnimation();

  return (
    <section
      ref={ref}
      id={id}
      className={`py-20 px-4 ${
        shouldAnimate
          ? `transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`
          : "opacity-100"
      } ${className}`}
    >
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}
