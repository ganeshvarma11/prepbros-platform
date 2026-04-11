import { lazy, Suspense, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Route, Switch } from "wouter";
import { useLocation } from "wouter";

import AppShell from "./components/AppShell";
import ErrorBoundary from "./components/ErrorBoundary";
import PageLoader from "./components/PageLoader";
import { PageSkeleton } from "./components/PageState";
import SeoManager from "./components/SeoManager";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  buildPreferredSiteUrl,
  shouldRedirectToConfiguredHost,
} from "@/lib/siteConfig";
import { loadRoute, preloadCoreRoutes } from "@/lib/routePreload";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { setupAnalytics, trackPage } from "./lib/analytics";

const Home = lazy(() => loadRoute("/"));
const Practice = lazy(() => loadRoute("/practice"));
const Aptitude = lazy(() => loadRoute("/aptitude"));
const Contests = lazy(() => loadRoute("/contests"));
const Leaderboard = lazy(() => loadRoute("/leaderboard"));
const Resources = lazy(() => loadRoute("/resources"));
const Updates = lazy(() => loadRoute("/updates"));
const Premium = lazy(() => loadRoute("/premium"));
const Dashboard = lazy(() => loadRoute("/dashboard"));
const Profile = lazy(() => loadRoute("/profile"));
const Explore = lazy(() => loadRoute("/explore"));
const Admin = lazy(() => loadRoute("/admin"));
const Privacy = lazy(() => loadRoute("/privacy"));
const Terms = lazy(() => loadRoute("/terms"));
const Support = lazy(() => loadRoute("/support"));
const Status = lazy(() => loadRoute("/status"));
const ResetPassword = lazy(() => loadRoute("/reset-password"));
const NotFound = lazy(() => loadRoute("/404"));

type AppRouteConfig = {
  path: string;
  contentClassName?: string;
  shellClassName?: string;
  allowDesktopSidebarToggle?: boolean;
};

const APP_ROUTE_CONFIG: AppRouteConfig[] = [
  {
    path: "/practice",
    contentClassName: "max-w-none",
    shellClassName: "practice-shell",
    allowDesktopSidebarToggle: true,
  },
  { path: "/aptitude", contentClassName: "max-w-[1180px]" },
  { path: "/contests" },
  { path: "/leaderboard", contentClassName: "max-w-[960px]" },
  { path: "/resources", contentClassName: "max-w-[1120px]" },
  { path: "/updates", contentClassName: "max-w-[1120px]" },
  { path: "/premium", contentClassName: "max-w-[1120px]" },
  { path: "/dashboard", contentClassName: "max-w-none" },
  { path: "/profile", contentClassName: "max-w-none" },
  { path: "/explore", contentClassName: "max-w-[1040px]" },
  { path: "/support", contentClassName: "max-w-[960px]" },
];

const matchesRoute = (location: string, path: string) =>
  location === path || (path !== "/" && location.startsWith(`${path}/`));

function getAppShellConfig(location: string) {
  return (
    APP_ROUTE_CONFIG.find(route => matchesRoute(location, route.path)) ?? null
  );
}

function RouteTracker() {
  const [location] = useLocation();

  useEffect(() => {
    setupAnalytics();
  }, []);

  useEffect(() => {
    trackPage(location);
  }, [location]);

  return null;
}

function CanonicalDomainRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!shouldRedirectToConfiguredHost()) return;

    const nextUrl = buildPreferredSiteUrl(
      `${window.location.pathname}${window.location.search}${window.location.hash}`
    );

    if (nextUrl !== window.location.href) {
      window.location.replace(nextUrl);
    }
  }, []);

  return null;
}

function AppRouteLoader() {
  return (
    <div className="mx-auto w-full py-4">
      <PageSkeleton rows={6} />
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<AppRouteLoader />}>
      <Switch>
        <Route path="/practice" component={Practice} />
        <Route path="/aptitude" component={Aptitude} />
        <Route path="/contests" component={Contests} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/resources" component={Resources} />
        <Route path="/updates" component={Updates} />
        <Route path="/premium" component={Premium} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/profile" component={Profile} />
        <Route path="/explore" component={Explore} />
        <Route path="/support" component={Support} />
      </Switch>
    </Suspense>
  );
}

function PublicRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/status" component={Status} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function Router() {
  const [location] = useLocation();
  const appShellConfig = getAppShellConfig(location);

  if (appShellConfig) {
    return (
      <AppShell
        contentClassName={appShellConfig.contentClassName}
        shellClassName={appShellConfig.shellClassName}
        allowDesktopSidebarToggle={appShellConfig.allowDesktopSidebarToggle}
      >
        <AppRoutes />
      </AppShell>
    );
  }

  return <PublicRoutes />;
}

function App() {
  useEffect(() => {
    preloadCoreRoutes();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <CanonicalDomainRedirect />
            <RouteTracker />
            <SeoManager />
            <Router />
            <Analytics />
            <SpeedInsights />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
