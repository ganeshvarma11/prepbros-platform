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
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { setupAnalytics, trackPage } from "./lib/analytics";

const Home = lazy(() => import("./pages/Home"));
const Practice = lazy(() => import("./pages/Practice"));
const Aptitude = lazy(() => import("./pages/Aptitude"));
const Contests = lazy(() => import("./pages/Contests"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Resources = lazy(() => import("./pages/Resources"));
const Updates = lazy(() => import("./pages/Updates"));
const Premium = lazy(() => import("./pages/Premium"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Explore = lazy(() => import("./pages/Explore"));
const Admin = lazy(() => import("./pages/Admin"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Support = lazy(() => import("./pages/Support"));
const Status = lazy(() => import("./pages/Status"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
