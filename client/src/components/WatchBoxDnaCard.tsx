import React from "react";
import { Dna, CheckCircle2, Sparkles, HelpCircle } from "lucide-react";
import type { DnaRecommendation } from "@watchbox/shared";

interface WatchBoxDnaCardProps {
  recommendation: DnaRecommendation;
  onExploreMovie?: () => void;
}

export const WatchBoxDnaCard: React.FC<WatchBoxDnaCardProps> = ({ recommendation }) => {
  const { movie, affinityScore, reasons, dimensions } = recommendation;

  return (
    <div className="neon-layout-border rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-500/20 to-indigo-500/20 border border-rose-500/30 text-rose-400">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>WatchBox DNA</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                Rule-Based
              </span>
            </h4>
            <p className="text-xs text-slate-400">Affinity Analysis for {movie.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-extrabold text-sm shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>{affinityScore}% Match</span>
        </div>
      </div>

      {/* Taste Dimensions Bars */}
      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Taste Vector Dimensions
        </p>
        <div className="space-y-2">
          {dimensions.map((dim) => (
            <div key={dim.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">{dim.label}</span>
                <span className="text-slate-400 font-mono">{dim.score}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 transition-all duration-700"
                  style={{ width: `${dim.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why This Fits You Checkmarks */}
      {reasons && reasons.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-800/60">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Why This Fits You
          </p>
          <ul className="space-y-1.5">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Deterministic Disclaimer */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
        <HelpCircle className="w-3 h-3 text-slate-500 shrink-0" />
        <span>
          Calculated deterministically from genre overlap and historical ratings.
        </span>
      </div>
    </div>
  );
};
