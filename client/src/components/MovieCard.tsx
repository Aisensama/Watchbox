import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Plus, Check, Play, Eye } from "lucide-react";
import type { MovieSummary } from "@watchbox/shared";
import { getPosterUrl, formatReleaseYear } from "../utils/tmdb";
import {
  useWatchlist,
  useAddToWatchlist,
  useRemoveFromWatchlist,
  useHistory,
  useRecordHistory,
} from "../hooks/usePersonal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

interface MovieCardProps {
  movie: MovieSummary;
  onPlayTrailer?: (tmdbId: number, title: string) => void;
  className?: string;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPlayTrailer,
  className = "",
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);

  const { data: watchlistData } = useWatchlist();
  const { data: historyData } = useHistory();

  const addWatchlist = useAddToWatchlist();
  const removeWatchlist = useRemoveFromWatchlist();
  const recordHistory = useRecordHistory();

  const inWatchlist = Boolean(
    watchlistData?.items.some((item) => item.tmdbId === movie.id)
  );
  const isWatched = Boolean(
    historyData?.history.some((item) => item.tmdbId === movie.id)
  );

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast("Sign in to save movies to your watchlist", "info");
      return;
    }
    if (inWatchlist) {
      removeWatchlist.mutate(movie.id);
    } else {
      addWatchlist.mutate(movie.id);
    }
  };

  const handleHistoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast("Sign in to track your watch history", "info");
      return;
    }
    recordHistory.mutate({ tmdbId: movie.id });
  };

  const handleTrailerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPlayTrailer) {
      onPlayTrailer(movie.id, movie.title);
    }
  };

  return (
    <div
      className={`group relative flex flex-col rounded-xl overflow-hidden bg-slate-900/60 border border-slate-800/80 transition-all duration-300 hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-950/20 hover:-translate-y-1 ${className}`}
    >
      <Link
        to={`/movies/${movie.id}`}
        className="block relative aspect-[2/3] w-full overflow-hidden bg-slate-950"
      >
        {/* Skeleton placeholder before image load */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-800/60 animate-pulse flex items-center justify-center text-slate-600 text-xs">
            Loading...
          </div>
        )}

        <img
          src={getPosterUrl(movie.posterPath, "w500")}
          alt={movie.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Rating Badge */}
        {movie.voteAverage > 0 && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-xs font-semibold text-amber-400 shadow-md">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{movie.voteAverage.toFixed(1)}</span>
          </div>
        )}

        {/* Watched Indicator Pill */}
        {isWatched && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
            <Eye className="w-3 h-3 text-emerald-400" />
            <span>WATCHED</span>
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 gap-2">
          <div className="flex items-center justify-between gap-1.5">
            {onPlayTrailer && (
              <button
                onClick={handleTrailerClick}
                title="Watch Trailer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Trailer</span>
              </button>
            )}

            <button
              onClick={handleWatchlistClick}
              title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                inWatchlist
                  ? "bg-rose-950/80 border-rose-500 text-rose-300 hover:bg-rose-900"
                  : "bg-slate-900/90 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {inWatchlist ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={handleHistoryClick}
              title={isWatched ? "Marked as Watched" : "Mark as Watched"}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                isWatched
                  ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                  : "bg-slate-900/90 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Link>

      {/* Card Details */}
      <div className="p-3 flex flex-col gap-1">
        <Link
          to={`/movies/${movie.id}`}
          className="text-xs sm:text-sm font-semibold text-slate-100 hover:text-rose-400 transition-colors line-clamp-1"
          title={movie.title}
        >
          {movie.title}
        </Link>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{formatReleaseYear(movie.releaseDate)}</span>
          {movie.voteCount > 0 && (
            <span className="text-slate-500">
              {movie.voteCount.toLocaleString()} votes
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
