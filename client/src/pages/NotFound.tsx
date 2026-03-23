import { ArrowRight, Compass, Home } from "lucide-react";
import { useLocation } from "wouter";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="px-4 py-10">
        <div className="container-shell">
          <div className="glass-panel rounded-[32px] p-8 text-center md:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand-subtle)] text-[var(--brand)]">
              <Compass size={34} />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">404</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
              This page took a wrong turn.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] md:text-base">
              The route you opened doesn’t exist right now, or the URL may be incorrect. Use one
              of the main product surfaces below to get back on track.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={handleGoHome} className="btn-primary rounded-[12px] px-6 py-3">
                <Home size={16} />
                Go home
              </button>
              <button
                type="button"
                onClick={() => setLocation("/practice")}
                className="btn-secondary rounded-[12px] px-6 py-3"
              >
                Start practice
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
