import React, { useState } from "react";
import { X, Mail, Lock, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="neon-layout-border relative w-full max-w-md bg-[#0A0D0D] border border-[#282B27] rounded-3xl p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#A7A69F] hover:text-[#F5F0E6] hover:bg-[#171B1A] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <span className="font-serif text-3xl font-bold tracking-tight text-[#F5F0E6] mb-2">
            Watch<span className="text-[#E4B85A]">Box</span>
          </span>
          <h2 className="text-xl font-bold text-[#F5F0E6] tracking-tight">
            {mode === "login"
              ? "Welcome Back to WatchBox"
              : "Create Your WatchBox Account"}
          </h2>
          <p className="text-xs text-[#A7A69F] mt-1">
            {mode === "login"
              ? "Access your personal watchlist, ratings, and DNA profile"
              : "Save movies, rate films, and discover personalized recommendations"}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex p-1 rounded-xl bg-[#101414] border border-[#282B27] mb-5">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "login"
                ? "bg-[#E4B85A] text-[#050707] shadow-sm"
                : "text-[#A7A69F] hover:text-[#F5F0E6]"
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
                ? "bg-[#E4B85A] text-[#050707] shadow-sm"
                : "text-[#A7A69F] hover:text-[#F5F0E6]"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium text-[#A7A69F] mb-1">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7A69F]" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. CinemaLover"
                  required
                  className="w-full bg-[#101414] border border-[#282B27] rounded-xl pl-10 pr-3 py-2.5 text-sm text-[#F5F0E6] placeholder-[#A7A69F]/60 focus:outline-none focus:border-[#E4B85A] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#A7A69F] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7A69F]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-[#101414] border border-[#282B27] rounded-xl pl-10 pr-3 py-2.5 text-sm text-[#F5F0E6] placeholder-[#A7A69F]/60 focus:outline-none focus:border-[#E4B85A] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A7A69F] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7A69F]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === "register" ? "Minimum 8 characters" : "Enter password"
                }
                required
                className="w-full bg-[#101414] border border-[#282B27] rounded-xl pl-10 pr-3 py-2.5 text-sm text-[#F5F0E6] placeholder-[#A7A69F]/60 focus:outline-none focus:border-[#E4B85A] transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-[#E4B85A] hover:bg-[#FFD985] text-[#050707] font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {isSubmitting
                ? "Processing..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-xs text-[#A7A69F]">
          Protected by server sessions & bcrypt encryption.
        </p>
      </div>
    </div>
  );
};
