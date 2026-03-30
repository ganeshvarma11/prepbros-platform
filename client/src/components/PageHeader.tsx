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
  align?: "left" | "center";
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
  actions,
  className,
  align = "left",
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "page-header",
        align === "center"
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between",
        className
      )}
      data-align={align}
    >
      <div className="page-header-content">
        {crumbs && crumbs.length > 0 ? (
          <Breadcrumb>
            <BreadcrumbList className="page-crumbs">
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                return (
                  <Fragment key={`${crumb.label}-${index}`}>
                    {index > 0 ? (
                      <BreadcrumbSeparator className="page-crumb-separator" />
                    ) : null}
                    <BreadcrumbItem>
                      {!isLast && crumb.href ? (
                        <BreadcrumbLink
                          href={crumb.href}
                          className="page-crumb is-link"
                        >
                          {crumb.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="page-crumb">
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
          <p className="page-label">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="page-title">
          {title}
        </h1>
        {description ? (
          <p className="page-description">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="page-actions shrink-0">{actions}</div> : null}
    </header>
  );
}
