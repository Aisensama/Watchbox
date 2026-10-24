import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Trash2, Play, Eye, Compass, Film } from "lucide-react";
import {
  useWatchlist,
  useRemoveFromWatchlist,
  useRecordHistory,
} from "../hooks/usePersonal";
import { useAuth } from "../context/AuthContext";
import { getPosterUrl, formatReleaseYear } from "../utils/tmdb";
import { TrailerModal } from "../components/TrailerModal";
import { apiClient } from "../api/client";

export const WatchlistPage: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading } = useWatchlist();
  const removeWatchlist = useRemoveFromWatchlist();
  const recordHistory = useRecordHistory();

  const [filterQuery, setFilterQuery] = useState("");
  const [selectedTrailer, setSelectedTrailer] = useState<{
    id: number;
    title: string;
    key: string | null;
  } | null>(null);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);

  const handlePlayTrailer = async (tmdbId: number, title: string) => {
    try {
      const vidData = await apiClient<{ primaryTrailer: { key: string } | null }>(
        `/movies/${tmdbId}/videos`
      );
      setSelectedTrailer({ id: tmdbId, title, key: vidData.primaryTrailer?.key || null });
    } catch {
      setSelectedTrailer({ id: tmdbId, title, key: null });
    }
    setTrailerModalOpen(true);
  };

  const items = data?.items || [];
  const filteredItems = filterQuery
    ? items.filter((item) =>
        (item.movie?.title || "").toLowerCase().includes(filterQuery.toLowerCase())
      )
    : items;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6 text-center pt-24">
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <Bookmark className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Your Watchlist</h2>
          <p className="text-xs text-slate-400">
            Sign in to access your personal MongoDB-saved watchlist and sync your favorite
            movies.
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                My Watchlist
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {items.length} titles saved to your personal library
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter saved titles..."
              className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          )}
        </div>

        {/* Watchlist Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-2xl bg-slate-900 animate-pulse border border-slate-800"
              />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:shadow-xl transition-all"
              >
                <div className="relative aspect-[2/3] w-full bg-slate-950 overflow-hidden">
                  <img
                    src={getPosterUrl(item.movie?.posterPath, "w500")}
                    alt={item.movie?.title || `Movie #${item.tmdbId}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <button
                      onClick={() => removeWatchlist.mutate(item.tmdbId)}
                      title="Remove from Watchlist"
                      className="p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors backdrop-blur-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <Link
                      to={`/movies/${item.tmdbId}`}
                      className="text-xs sm:text-sm font-bold text-slate-100 hover:text-rose-400 transition-colors line-clamp-1"
                    >
                      {item.movie?.title || `Movie #${item.tmdbId}`}
                    </Link>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.movie
                        ? formatReleaseYear(item.movie.releaseDate)
                        : "Saved Movie"}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <button
                      onClick={() =>
                        handlePlayTrailer(
                          item.tmdbId,
                          item.movie?.title || "Movie Trailer"
                        )
                      }
                      className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <Play className="w-3 h-3 fill-rose-400" />
                      <span>Trailer</span>
                    </button>

                    <button
                      onClick={() => recordHistory.mutate({ tmdbId: item.tmdbId })}
                      title="Mark as Watched"
                      className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 text-[11px]"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Watched</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4 max-w-lg mx-auto p-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Film className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Your Watchlist is Empty</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore our trending catalogue or top-rated cinema to bookmark films you
              intend to watch next.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        )}
      </div>

      <TrailerModal
        isOpen={trailerModalOpen}
        onClose={() => setTrailerModalOpen(false)}
        trailerKey={selectedTrailer?.key || null}
        title={selectedTrailer?.title || "Movie"}
      />
    </div>
  );
};
