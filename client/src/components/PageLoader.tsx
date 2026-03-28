import { PageLoading } from "@/components/PageState";

interface PageLoaderProps {
  label?: string;
}

export default function PageLoader({
  label = "Loading PrepBros...",
}: PageLoaderProps) {
  return (
    <div className="min-h-[50vh] px-4 py-10">
      <div className="container-shell flex min-h-[40vh] items-center justify-center">
        <PageLoading label={label} />
      </div>
    </div>
  );
}
