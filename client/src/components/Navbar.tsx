import { useState } from "react";
import { Link } from "wouter";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/practice", label: "Practice" },
    { href: "/contests", label: "Contests" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/resources", label: "Resources" },
    { href: "/premium", label: "Premium" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-110">
                P
              </div>
              <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white hidden sm:inline tracking-tight">
                PrepBros
              </span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors duration-200 relative group">
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
                </a>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 transform hover:scale-110"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/dashboard">
                <a>
                  <Button
                    variant="outline"
                    className="border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium transition-all duration-200"
                  >
                    Login
                  </Button>
                </a>
              </Link>
              <Link href="/practice">
                <a>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                    Start Free
                  </Button>
                </a>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 dark:border-slate-800 animate-fade-in-up">
            <div className="space-y-2 pt-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg font-medium transition-all duration-200"
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
              <div className="pt-2 space-y-2">
                <Link href="/dashboard">
                  <a onClick={() => setIsOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      Login
                    </Button>
                  </a>
                </Link>
                <Link href="/practice">
                  <a onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                      Start Free
                    </Button>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
