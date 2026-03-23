import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  label?: string;
}

export default function PageLoader({
  label = "Loading PrepBros...",
}: PageLoaderProps) {
  return (
    <div className="min-h-[50vh] px-4 py-10">
      <div className="container-shell flex min-h-[40vh] items-center justify-center">
        <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3 text-sm text-[var(--text-secondary)] shadow-[var(--shadow-sm)]">
          <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
          {label}
        </div>
      </div>
    </div>
  );
}
