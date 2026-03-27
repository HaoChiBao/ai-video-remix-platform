import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <header className={cn("mb-8 space-y-2", className)}>
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-white md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-[var(--muted-foreground)]">{description}</p>
      ) : null}
    </header>
  );
}
