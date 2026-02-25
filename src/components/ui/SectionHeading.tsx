interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  description?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  description,
}: SectionHeadingProps) {
  return (
    <div className="text-center mb-12">
      {subtitle && (
        <p className="text-luna-gold text-sm tracking-[0.3em] font-medium mb-2">
          {subtitle}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-luna-text-primary mb-4">
        {title}
      </h2>
      <div className="w-16 h-1 bg-luna-gold mx-auto rounded-full mb-4" />
      {description && (
        <p className="text-luna-text-secondary max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
