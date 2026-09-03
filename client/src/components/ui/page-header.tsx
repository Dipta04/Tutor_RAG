interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">{title}</h1>
      {description ? (
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-muted">{description}</p>
      ) : null}
    </header>
  );
}
