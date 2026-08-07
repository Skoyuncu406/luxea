import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: ReactNode;
};

export default function AdminPageHeader({
  title,
  description,
  eyebrow = "LUXEA ADMIN",
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="w-full border-b border-border pb-10 sm:pb-12">
      <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-[780px]">
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-accent sm:text-[10px]">
            {eyebrow}
          </p>

          <h1 className="mt-4 text-balance font-heading text-[44px] leading-[0.94] text-foreground sm:text-6xl lg:text-7xl">
            {title}
          </h1>

          <p className="mt-6 max-w-[680px] text-sm leading-7 text-foreground-soft sm:text-base sm:leading-8">
            {description}
          </p>
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}