import Link from "next/link";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
} as const;

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  onClick,
  href,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 cursor-pointer";

  const variantClasses = (() => {
    switch (variant) {
      case "primary":
        return "bg-luna-gold text-white shadow-[0_0_20px_rgba(var(--luna-accent-rgb),0.3)] hover:brightness-110 hover:scale-105 active:scale-95";
      case "secondary":
        return "bg-transparent text-luna-gold-light border border-luna-gold hover:bg-luna-border/20 active:scale-95";
      case "ghost":
        return "bg-transparent text-luna-gold-light hover:bg-luna-border/20 active:scale-95";
    }
  })();

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
