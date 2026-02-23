"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({
  children,
  className = "",
  hover = false,
}: CardProps) {
  return (
    <div
      className={`bg-luna-surface border border-luna-border rounded-xl p-6 transition-all duration-300 ${
        hover
          ? "hover:border-luna-gold hover:shadow-[0_0_30px_rgba(212,184,112,0.15)] hover:-translate-y-1"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
