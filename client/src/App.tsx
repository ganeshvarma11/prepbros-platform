import Profile from "./pages/Profile";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import Contests from "./pages/Contests";
import Leaderboard from "./pages/Leaderboard";
import Resources from "./pages/Resources";
import Premium from "./pages/Premium";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/practice"} component={Practice} />
      <Route path={"/contests"} component={Contests} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/resources"} component={Resources} />
      <Route path={"/premium"} component={Premium} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/explore"} component={Explore} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
