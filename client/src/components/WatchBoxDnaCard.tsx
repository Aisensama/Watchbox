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
    <div className="neon-layout-border rounded-2xl bg-[#101414] border border-[#282B27] p-5 space-y-4 shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#282B27] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-[#927442]/30 via-[#E4B85A]/20 to-[#FFD985]/10 border border-[#E4B85A]/40 text-[#FFD985]">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#F5F0E6] flex items-center gap-1.5">
              <span>WatchBox DNA</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E4B85A]/15 border border-[#E4B85A]/30 text-[#FFD985]">
                Rule-Based
              </span>
            </h4>
            <p className="text-xs text-[#A7A69F]">Affinity Analysis for {movie.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4B85A]/15 border border-[#E4B85A]/40 text-[#FFD985] font-extrabold text-sm shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#E4B85A]" />
          <span>{affinityScore}% Match</span>
        </div>
      </div>

      {/* Taste Dimensions Bars */}
      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold text-[#A7A69F] uppercase tracking-wider">
          Taste Vector Dimensions
        </p>
        <div className="space-y-2">
          {dimensions.map((dim) => (
            <div key={dim.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#F5F0E6] font-medium">{dim.label}</span>
                <span className="text-[#E4B85A] font-mono font-semibold">{dim.score}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#050707] overflow-hidden border border-[#282B27]/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#927442] via-[#E4B85A] to-[#FFD985] shadow-sm shadow-[#E4B85A]/40 transition-all duration-700"
                  style={{ width: `${dim.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why This Fits You Checkmarks */}
      {reasons && reasons.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-[#282B27]">
          <p className="text-[11px] font-semibold text-[#A7A69F] uppercase tracking-wider">
            Why This Fits You
          </p>
          <ul className="space-y-1.5">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-[#F5F0E6]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E4B85A] shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Deterministic Disclaimer */}
      <div className="flex items-center gap-1.5 text-[11px] text-[#A7A69F]/80 pt-1">
        <HelpCircle className="w-3 h-3 text-[#E4B85A]/70 shrink-0" />
        <span>
          Calculated deterministically from genre overlap and historical ratings.
        </span>
      </div>
    </div>
  );
};
