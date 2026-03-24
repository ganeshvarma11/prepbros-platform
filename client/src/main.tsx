import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const storedTheme = localStorage.getItem("theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const resolvedTheme =
  storedTheme === "light" || storedTheme === "dark"
    ? storedTheme
    : systemPrefersDark
      ? "dark"
      : "light";

document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
document.documentElement.classList.toggle("light", resolvedTheme === "light");
document.documentElement.style.colorScheme = resolvedTheme;

const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
const analyticsWebsiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;

if (analyticsEndpoint && analyticsWebsiteId) {
  const script = document.createElement("script");
  script.defer = true;
  script.src = `${analyticsEndpoint}/umami`;
  script.dataset.websiteId = analyticsWebsiteId;
  document.head.appendChild(script);
}

createRoot(document.getElementById("root")!).render(<App />);
