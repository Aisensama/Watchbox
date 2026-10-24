import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Film, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NeonButton } from "../components/NeonButton";
import { LoginInputSchema } from "@watchbox/shared";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parseResult = LoginInputSchema.safeParse({ email, password });
    if (!parseResult.success) {
      setErrorMsg(parseResult.error.errors[0]?.message || "Invalid input");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(parseResult.data);
      navigate("/");
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-4 pt-24 pb-16">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col items-center text-center">
          <Link
            to="/"
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-600/30 mb-3"
          >
            <Film className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Sign In to WatchBox
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your saved watchlist, ratings, and DNA recommendations
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
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
                placeholder="••••••••"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <NeonButton
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </NeonButton>
          </div>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don't have an account yet?{" "}
          <Link to="/register" className="font-bold text-rose-400 hover:text-rose-300">
            Register for Free
          </Link>
        </p>
      </div>
    </div>
  );
};
