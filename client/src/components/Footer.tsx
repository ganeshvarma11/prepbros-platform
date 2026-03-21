import { Link } from "wouter";
import { Mail, Linkedin, Twitter, Github } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/">
              <a className="flex items-center gap-2.5 mb-4 group">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-all duration-300">
                  P
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  PrepBros
                </span>
              </a>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
              Master UPSC preparation with our comprehensive platform featuring daily practice, contests, and expert resources.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Github, href: "#", label: "GitHub" },
                { icon: Mail, href: "mailto:hello@prepbros.com", label: "Email" },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 transform hover:scale-110"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 tracking-wide uppercase">
              Product
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Practice", href: "/practice" },
                { label: "Contests", href: "/contests" },
                { label: "Leaderboard", href: "/leaderboard" },
                { label: "Premium", href: "/premium" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <a className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors duration-200">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 tracking-wide uppercase">
              Resources
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Study Materials", href: "/resources" },
                { label: "Blog", href: "#" },
                { label: "FAQ", href: "#" },
                { label: "Contact", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <a className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors duration-200">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 tracking-wide uppercase">
              Legal
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Cookie Policy", href: "#" },
                { label: "Disclaimer", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <a className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors duration-200">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-700 to-transparent mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center md:text-left mb-4 md:mb-0">
            © {currentYear} PrepBros. All rights reserved. Built with passion for UPSC aspirants.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#">
              <a className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors duration-200">
                Status
              </a>
            </Link>
            <Link href="#">
              <a className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors duration-200">
                Support
              </a>
            </Link>
            <Link href="#">
              <a className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors duration-200">
                Feedback
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
