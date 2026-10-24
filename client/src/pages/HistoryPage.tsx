import React, { useState } from "react";
import { Link } from "react-router-dom";
import { History, Trash2, Star, Calendar, Film, Compass } from "lucide-react";
import { useHistory, useRemoveHistory } from "../hooks/usePersonal";
import { useAuth } from "../context/AuthContext";
import { getPosterUrl, formatReleaseYear } from "../utils/tmdb";
import { RatingModal } from "../components/RatingModal";

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading } = useHistory();
  const removeHistory = useRemoveHistory();

  const [ratingTarget, setRatingTarget] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const history = data?.history || [];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6 text-center pt-24">
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <History className="w-10 h-10 text-emerald-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Watch History</h2>
          <p className="text-xs text-slate-400">
            Sign in to review and manage movies you have manually recorded as watched.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 pt-24 pb-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-6">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Watch History
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {history.length} films recorded in your viewing log
            </p>
          </div>
        </div>

        {/* History List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-slate-900 animate-pulse border border-slate-800"
              />
            ))}
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 sm:w-16 aspect-[2/3] rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                    <img
                      src={getPosterUrl(item.movie?.posterPath, "w342")}
                      alt={item.movie?.title || "Movie"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <Link
                      to={`/movies/${item.tmdbId}`}
                      className="text-sm sm:text-base font-bold text-white hover:text-rose-400 transition-colors truncate block"
                    >
                      {item.movie?.title || `Movie #${item.tmdbId}`}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      {item.movie && (
                        <span>{formatReleaseYear(item.movie.releaseDate)}</span>
                      )}
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          Watched on {new Date(item.watchedAt).toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      setRatingTarget({
                        id: item.tmdbId,
                        title: item.movie?.title || "Movie",
                      })
                    }
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="hidden sm:inline">Rate</span>
                  </button>

                  <button
                    onClick={() => removeHistory.mutate(item.tmdbId)}
                    title="Remove from history"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4 max-w-lg mx-auto p-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Film className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No Watch History Recorded</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When you watch a film, mark it as watched to track your personal movie
              milestones and improve your WatchBox DNA recommendations.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Movies</span>
            </Link>
          </div>
        )}
      </div>

      {ratingTarget && (
        <RatingModal
          isOpen={Boolean(ratingTarget)}
          onClose={() => setRatingTarget(null)}
          tmdbId={ratingTarget.id}
          title={ratingTarget.title}
        />
      )}
    </div>
  );
};
