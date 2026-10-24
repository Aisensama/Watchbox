import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, Plus, Check, Star, Info } from "lucide-react";
import type { MovieSummary } from "@watchbox/shared";
import { getBackdropUrl, formatReleaseYear } from "../utils/tmdb";
import {
  useWatchlist,
  useAddToWatchlist,
  useRemoveFromWatchlist,
} from "../hooks/usePersonal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { SurfButton } from "./SurfButton";

interface HeroBannerProps {
  movies: MovieSummary[];
  onPlayTrailer?: (tmdbId: number, title: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movies, onPlayTrailer }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();
  const { showToast } = useToast();

  const { data: watchlistData } = useWatchlist();
  const addWatchlist = useAddToWatchlist();
  const removeWatchlist = useRemoveFromWatchlist();

  // Auto cycle through featured movies every 9 seconds
  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(movies.length, 5));
    }, 9000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex] || movies[0];
  const inWatchlist = Boolean(
    watchlistData?.items.some((item) => item.tmdbId === currentMovie.id)
  );

  const handleWatchlistToggle = () => {
    if (!user) {
      showToast("Sign in to save movies to your watchlist", "info");
      return;
    }
    if (inWatchlist) {
      removeWatchlist.mutate(currentMovie.id);
    } else {
      addWatchlist.mutate(currentMovie.id);
    }
  };

  const handleTrailerClick = () => {
    if (onPlayTrailer) {
      onPlayTrailer(currentMovie.id, currentMovie.title);
    }
  };

  return (
    <div className="relative w-full min-h-[500px] md:min-h-[640px] flex items-end overflow-hidden pb-12 pt-28">
      {/* Background Image with Cinematic Vignette & Gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src={getBackdropUrl(currentMovie.backdropPath, "original")}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center transition-all duration-1000 ease-in-out scale-105"
        />
        {/* Layered gradients for cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10] via-[#0A0C10]/70 to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#0A0C10]/80" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8">
        <div className="max-w-2xl space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold tracking-widest uppercase">
            <span>NOW FEATURED</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase drop-shadow-md">
            {currentMovie.title}
          </h1>

          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-300 flex-wrap">
            <span className="text-slate-200 font-semibold">
              {formatReleaseYear(currentMovie.releaseDate)}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-500" />
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{currentMovie.voteAverage.toFixed(1)}</span>
              <span className="text-slate-400 text-xs font-normal">
                ({currentMovie.voteCount.toLocaleString()})
              </span>
            </div>
            <span className="w-1 h-1 rounded-full bg-slate-500" />
            <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs">
              HD
            </span>
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-slate-300/90 line-clamp-3 leading-relaxed max-w-xl font-normal drop-shadow">
            {currentMovie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-2 flex-wrap">
            <SurfButton
              onClick={handleTrailerClick}
              icon={<Play className="w-4 h-4 fill-current" />}
              hoverText="PLAY TRAILER"
              size="lg"
            >
              Watch Trailer
            </SurfButton>

            <SurfButton
              onClick={handleWatchlistToggle}
              icon={
                inWatchlist ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Plus className="w-4 h-4" />
                )
              }
              hoverText={inWatchlist ? "SAVED TO LIST" : "SAVE TO LIST"}
              size="lg"
              gradientVariant="orange-red"
            >
              {inWatchlist ? "In Watchlist" : "Add to My List"}
            </SurfButton>

            <Link
              to={`/movies/${currentMovie.id}`}
              className="p-3 rounded-full bg-slate-900/70 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="More Details"
            >
              <Info className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Carousel Slide Indicators */}
        <div className="flex items-center gap-2 mt-8">
          {movies.slice(0, 5).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-8 bg-rose-500"
                  : "w-2 bg-slate-600 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
