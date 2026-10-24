import React, { useState } from "react";
import { Star, X, Trash2 } from "lucide-react";
import { useSaveRating, useRemoveRating } from "../hooks/usePersonal";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tmdbId: number;
  title: string;
  initialScore?: number;
  initialNote?: string;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  tmdbId,
  title,
  initialScore = 0,
  initialNote = "",
}) => {
  const [score, setScore] = useState<number>(initialScore || 8);
  const [hoverScore, setHoverScore] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState<string>(initialNote);

  const saveMutation = useSaveRating();
  const removeMutation = useRemoveRating();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (score < 1 || score > 10) return;

    saveMutation.mutate(
      { tmdbId, input: { score, reviewNote: reviewNote.trim() || undefined } },
      { onSuccess: () => onClose() }
    );
  };

  const handleRemove = () => {
    removeMutation.mutate(tmdbId, { onSuccess: () => onClose() });
  };

  const activeScore = hoverScore !== null ? hoverScore : score;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100">Rate this Movie</h3>
            <p className="text-xs text-slate-400 truncate max-w-[280px]">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* 1-10 Star / Number Rating */}
          <div className="text-center">
            <div className="text-4xl font-extrabold text-amber-400 mb-2">
              {activeScore > 0 ? `${activeScore}/10` : "Select Score"}
            </div>
            <div className="flex items-center justify-center gap-1.5 flex-wrap py-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setScore(num)}
                  onMouseEnter={() => setHoverScore(num)}
                  onMouseLeave={() => setHoverScore(null)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    num <= activeScore
                      ? "bg-amber-400 text-slate-950 scale-105 shadow-md shadow-amber-400/20"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mt-2">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>
                {activeScore >= 9
                  ? "Masterpiece"
                  : activeScore >= 7
                    ? "Great Watch"
                    : activeScore >= 5
                      ? "Average"
                      : "Disappointing"}
              </span>
            </div>
          </div>

          {/* Optional Review Note */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Short Review Note (Optional)
            </label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="What made this memorable? e.g. Outstanding cinematography and pacing."
              maxLength={500}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/80 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            {initialScore > 0 ? (
              <button
                type="button"
                onClick={handleRemove}
                disabled={removeMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 transition-all"
              >
                {saveMutation.isPending ? "Saving..." : "Save Rating"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
