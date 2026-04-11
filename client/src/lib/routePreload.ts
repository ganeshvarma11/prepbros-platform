const routeLoaders = {
  "/": () => import("@/pages/Home"),
  "/practice": () => import("@/pages/Practice"),
  "/aptitude": () => import("@/pages/Aptitude"),
  "/contests": () => import("@/pages/Contests"),
  "/leaderboard": () => import("@/pages/Leaderboard"),
  "/resources": () => import("@/pages/Resources"),
  "/updates": () => import("@/pages/Updates"),
  "/premium": () => import("@/pages/Premium"),
  "/dashboard": () => import("@/pages/Dashboard"),
  "/profile": () => import("@/pages/Profile"),
  "/explore": () => import("@/pages/Explore"),
  "/admin": () => import("@/pages/Admin"),
  "/privacy": () => import("@/pages/Privacy"),
  "/terms": () => import("@/pages/Terms"),
  "/support": () => import("@/pages/Support"),
  "/status": () => import("@/pages/Status"),
  "/reset-password": () => import("@/pages/ResetPassword"),
  "/404": () => import("@/pages/NotFound"),
} as const;

type RoutePath = keyof typeof routeLoaders;
type RouteLoader = (typeof routeLoaders)[RoutePath];

const preloadedRoutes = new Set<RoutePath>();

const normalizeRoutePath = (href: string): RoutePath | null => {
  if (!href) return null;
  if (href === "/") return "/";
  if (href.startsWith("/#")) return "/";

  const [path] = href.split(/[?#]/, 1);
  if (!path) return null;

  return path in routeLoaders ? (path as RoutePath) : null;
};

const shouldSkipAggressivePreload = () => {
  if (typeof navigator === "undefined") {
    return false;
  }

  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;

  return Boolean(
    connection?.saveData ||
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "2g"
  );
};

const preloadRoutePath = (path: RoutePath) => {
  if (preloadedRoutes.has(path)) {
    return;
  }

  preloadedRoutes.add(path);
  void routeLoaders[path]();
};

export const loadRoute = (path: RoutePath): ReturnType<RouteLoader> =>
  routeLoaders[path]();

export const preloadRoute = (href: string) => {
  const path = normalizeRoutePath(href);
  if (!path) {
    return;
  }

  preloadRoutePath(path);
};

export const preloadCoreRoutes = () => {
  if (typeof window === "undefined" || shouldSkipAggressivePreload()) {
    return;
  }

  const warm = () => {
    const coreRoutes: RoutePath[] = [
      "/practice",
      "/updates",
      "/dashboard",
      "/profile",
      "/explore",
      "/resources",
      "/premium",
      "/support",
      "/leaderboard",
    ];

    coreRoutes.forEach(path => preloadRoutePath(path));
  };

  if ("requestIdleCallback" in window) {
    const requestIdleCallback = window.requestIdleCallback as (
      callback: IdleRequestCallback
    ) => number;
    requestIdleCallback(() => warm());
    return;
  }

  globalThis.setTimeout(warm, 250);
};
