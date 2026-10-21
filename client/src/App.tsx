import React from "react";
import { Film, Sparkles, CheckCircle2 } from "lucide-react";
import type { UserRole } from "@watchbox/shared";

export const App: React.FC = () => {
  const defaultRole: UserRole = "user";

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Film className="w-8 h-8 text-amber-400" />
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
            WatchBox
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Role context: {defaultRole}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center my-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm mb-6">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Phase 1 Scaffolding Initialized</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100 max-w-2xl mb-4">
          Next-Gen Movie Discovery & Personal Watchlist
        </h2>
        <p className="text-slate-400 text-lg max-w-xl">
          Powered by React, Tailwind CSS v4, Motion, TanStack Query, Node.js, Express, and
          MongoDB.
        </p>
      </main>

      <footer className="py-4 border-t border-slate-800 text-center text-xs text-slate-500">
        WatchBox Monorepo • Clean Architecture • Approved SDD v0.2
      </footer>
    </div>
  );
};

export default App;
