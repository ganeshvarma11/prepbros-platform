import { lazy, Suspense, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Route, Switch } from "wouter";
import { useLocation } from "wouter";

import ErrorBoundary from "./components/ErrorBoundary";
import PageLoader from "./components/PageLoader";
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

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
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
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/support" component={Support} />
        <Route path="/status" component={Status} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
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
