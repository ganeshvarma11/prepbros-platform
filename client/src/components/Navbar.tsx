import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Moon, Sun, User, LogOut, ChevronDown } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";

const NAV_LINKS = [
  { href: "/practice",    label: "Practice" },
  { href: "/aptitude",    label: "Aptitude" },
  { href: "/explore",     label: "Explore" },
  { href: "/contests",    label: "Contests" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/resources",   label: "Resources" },
];

export default function Navbar() {
  const [isOpen, setIsOpen]     = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab]   = useState<"login"|"signup">("login");
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme }  = useTheme();
  const { user, signOut }       = useAuth();
  const [location]              = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openLogin  = () => { setAuthTab("login");  setShowAuth(true); setIsOpen(false); };
  const openSignup = () => { setAuthTab("signup"); setShowAuth(true); setIsOpen(false); };

  const isActive = (href: string) => location === href;

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        height: 60,
        background: scrolled
          ? theme === "dark" ? "rgba(10,10,15,0.92)" : "rgba(255,255,255,0.92)"
          : theme === "dark" ? "rgba(10,10,15,0.75)" : "rgba(255,255,255,0.75)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
        transition: "all 0.2s ease",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>

          {/* Logo */}
          <Link href="/">
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0 }}>
              <div style={{
                width: 34, height: 34,
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
                fontFamily: "var(--font-sans)",
                fontWeight: 800, fontSize: 16, color: "#fff",
                letterSpacing: "-0.02em",
              }}>P</div>
              <span style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 800, fontSize: 17,
                color: "var(--text-primary)",
                letterSpacing: "-0.03em",
              }}>PrepBros</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, justifyContent: "center" }} className="hidden md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href}>
                <div style={{
                  padding: "6px 13px",
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: isActive(href) ? 600 : 500,
                  fontFamily: "var(--font-sans)",
                  color: isActive(href) ? "var(--brand)" : "var(--text-secondary)",
                  background: isActive(href) ? "var(--brand-subtle)" : "transparent",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
                  onMouseEnter={e => { if (!isActive(href)) { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)"; }}}
                  onMouseLeave={e => { if (!isActive(href)) { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}}
                >{label}</div>
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                width: 34, height: 34, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "1px solid var(--border)",
                color: "var(--text-secondary)", cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
            >
              {theme === "dark" ? <Sun size={15}/> : <Moon size={15}/>}
            </button>

            {/* Auth */}
            <div className="hidden md:flex" style={{ alignItems: "center", gap: 8 }}>
              {user ? (
                <>
                  <Link href="/profile">
                    <div style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      fontSize: 13, fontWeight: 500,
                      fontFamily: "var(--font-sans)",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      maxWidth: 140,
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                    >
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--brand)", flexShrink: 0 }}>
                        {(user.user_metadata?.full_name || user.email || "U")[0].toUpperCase()}
                      </div>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0]}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer", transition: "all 0.15s ease" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--red-bg)"; (e.currentTarget as HTMLElement).style.color = "var(--red)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--red)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                  >
                    <LogOut size={14}/>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={openLogin} style={{
                    padding: "7px 16px", borderRadius: 8,
                    background: "transparent", border: "1px solid var(--border)",
                    fontSize: 13, fontWeight: 500, fontFamily: "var(--font-sans)",
                    color: "var(--text-primary)", cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                  >Log in</button>
                  <button onClick={openSignup} style={{
                    padding: "7px 16px", borderRadius: 8,
                    background: "var(--brand)", border: "none",
                    fontSize: 13, fontWeight: 600, fontFamily: "var(--font-sans)",
                    color: "#fff", cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: "0 1px 3px rgba(99,102,241,0.3)",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand-dark)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(99,102,241,0.4)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--brand)"; (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(99,102,241,0.3)"; }}
                  >Start free</button>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden"
              style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              {isOpen ? <X size={16}/> : <Menu size={16}/>}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {isOpen && (
          <div className="md:hidden" style={{
            borderTop: "1px solid var(--border)",
            background: theme === "dark" ? "var(--bg-base)" : "#fff",
            padding: "12px 16px 20px",
            animation: "fadeIn 0.15s ease",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[{ href: "/", label: "Home" }, ...NAV_LINKS].map(({ href, label }) => (
                <Link key={href} href={href}>
                  <div onClick={() => setIsOpen(false)} style={{
                    padding: "10px 14px", borderRadius: 8,
                    fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)",
                    color: isActive(href) ? "var(--brand)" : "var(--text-primary)",
                    background: isActive(href) ? "var(--brand-subtle)" : "transparent",
                    cursor: "pointer",
                  }}>{label}</div>
                </Link>
              ))}
              <div style={{ borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {user ? (
                  <>
                    <Link href="/profile"><div onClick={() => setIsOpen(false)} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)", color: "var(--text-primary)", cursor: "pointer", textAlign: "center" }}>My Profile</div></Link>
                    <div onClick={() => { signOut(); setIsOpen(false); }} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--red)", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)", color: "var(--red)", cursor: "pointer", textAlign: "center" }}>Sign out</div>
                  </>
                ) : (
                  <>
                    <div onClick={openLogin} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-sans)", color: "var(--text-primary)", cursor: "pointer", textAlign: "center" }}>Log in</div>
                    <div onClick={openSignup} style={{ padding: "10px 14px", borderRadius: 8, background: "var(--brand)", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-sans)", color: "#fff", cursor: "pointer", textAlign: "center" }}>Start free</div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} defaultTab={authTab}/>
    </>
  );
}