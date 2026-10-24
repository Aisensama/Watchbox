import React, { useState } from "react";
import { X, Film, Mail, Lock, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SurfButton } from "./SurfButton";
import { RegisterInputSchema, LoginInputSchema } from "@watchbox/shared";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "register";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = "login",
}) => {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === "login") {
      const parseResult = LoginInputSchema.safeParse({ email, password });
      if (!parseResult.success) {
        setErrorMsg(parseResult.error.errors[0]?.message || "Invalid input");
        return;
      }

      setIsSubmitting(true);
      try {
        await login(parseResult.data);
        onClose();
      } catch (err) {
        setErrorMsg((err as Error).message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const parseResult = RegisterInputSchema.safeParse({
        email,
        password,
        displayName,
      });
      if (!parseResult.success) {
        setErrorMsg(parseResult.error.errors[0]?.message || "Invalid input");
        return;
      }

      setIsSubmitting(true);
      try {
        await register(parseResult.data);
        onClose();
      } catch (err) {
        setErrorMsg((err as Error).message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-600/30 mb-3">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {mode === "login"
              ? "Welcome Back to WatchBox"
              : "Create Your WatchBox Account"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === "login"
              ? "Access your personal watchlist, ratings, and DNA profile"
              : "Save movies, rate films, and discover personalized recommendations"}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "login"
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "register"
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. CinemaLover"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === "register" ? "Minimum 8 characters" : "Enter password"
                }
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <SurfButton
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
              hoverText={mode === "login" ? "WELCOME BACK" : "JOIN WATCHBOX"}
            >
              {isSubmitting
                ? "Processing..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </SurfButton>
          </div>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          Protected by server sessions & bcrypt encryption. No password hashes exposed.
        </p>
      </div>
    </div>
  );
};
