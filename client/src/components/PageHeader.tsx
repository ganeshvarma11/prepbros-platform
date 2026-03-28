import { Fragment, type ReactNode } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  className?: string;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-[var(--border)] pb-5 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        {crumbs && crumbs.length > 0 ? (
          <Breadcrumb>
            <BreadcrumbList className="text-[var(--text-muted)]">
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                return (
                  <Fragment key={`${crumb.label}-${index}`}>
                    {index > 0 ? (
                      <BreadcrumbSeparator className="text-[var(--text-faint)]" />
                    ) : null}
                    <BreadcrumbItem>
                      {!isLast && crumb.href ? (
                        <BreadcrumbLink
                          href={crumb.href}
                          className="hover:text-[var(--text-primary)]"
                        >
                          {crumb.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="font-medium text-[var(--text-secondary)]">
                          {crumb.label}
                        </BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        ) : null}
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[2rem] font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-[2.35rem]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-[var(--text-secondary)] md:text-[0.95rem]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
