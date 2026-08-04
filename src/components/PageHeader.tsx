import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {eyebrow && (
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary/80">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
