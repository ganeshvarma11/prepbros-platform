import { useState } from "react";
import { X, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    fullName: "", email: "", password: "", targetExam: "UPSC CSE 2026"
  });

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await signIn(loginForm.email, loginForm.password);
    setLoading(false);
    if (error) {
      setError(error.message || "Invalid email or password");
    } else {
      onClose();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (signupForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    const { error } = await signUp(signupForm.email, signupForm.password, signupForm.fullName);
    setLoading(false);
    if (error) {
      setError(error.message || "Something went wrong");
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md shadow-2xl">

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <X size={16}/>
        </button>

        {/* Success state */}
        {success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-green-500"/>
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Check your email 📬</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              We sent a confirmation link to <span className="font-medium text-gray-700 dark:text-gray-300">{signupForm.email}</span>. Click it to activate your account.
            </p>
            <button onClick={onClose} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors">
              Got it
            </button>
          </div>
        ) : (
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">P</span>
              <span className="font-bold text-gray-900 dark:text-white">PrepBros</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
              {(["login", "signup"] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${tab === t ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                  {t === "login" ? "Log in" : "Sign up"}
                </button>
              ))}
            </div>

            {/* Login form */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Email</label>
                  <input type="email" required value={loginForm.email} onChange={e => setLoginForm(f => ({...f, email: e.target.value}))}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={loginForm.password} onChange={e => setLoginForm(f => ({...f, password: e.target.value}))}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </div>

                {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={15} className="animate-spin"/> Logging in...</> : "Log in"}
                </button>

                <p className="text-center text-xs text-gray-400">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => setTab("signup")} className="text-orange-500 hover:underline font-medium">Sign up free</button>
                </p>
              </form>
            )}

            {/* Signup form */}
            {tab === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Full name</label>
                  <input type="text" required value={signupForm.fullName} onChange={e => setSignupForm(f => ({...f, fullName: e.target.value}))}
                    placeholder="Ganesh Meesa"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Email</label>
                  <input type="email" required value={signupForm.email} onChange={e => setSignupForm(f => ({...f, email: e.target.value}))}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={signupForm.password} onChange={e => setSignupForm(f => ({...f, password: e.target.value}))}
                      placeholder="Min. 6 characters"
                      className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Target exam</label>
                  <select value={signupForm.targetExam} onChange={e => setSignupForm(f => ({...f, targetExam: e.target.value}))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all">
                    <option>UPSC CSE 2026</option>
                    <option>UPSC CSE 2027</option>
                    <option>TSPSC Group 1 2025</option>
                    <option>TSPSC Group 2 2025</option>
                    <option>APPSC Group 1 2025</option>
                    <option>SSC CGL 2025</option>
                    <option>SSC CHSL 2025</option>
                    <option>RRB NTPC 2025</option>
                    <option>IBPS PO 2025</option>
                  </select>
                </div>

                {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={15} className="animate-spin"/> Creating account...</> : "Create free account"}
                </button>

                <p className="text-center text-xs text-gray-400">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setTab("login")} className="text-orange-500 hover:underline font-medium">Log in</button>
                </p>

                <p className="text-center text-xs text-gray-300 dark:text-gray-600">
                  By signing up you agree to our Terms of Service
                </p>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}