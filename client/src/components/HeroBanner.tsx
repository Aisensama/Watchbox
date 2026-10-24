import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Play, Plus, Check, Star, Info, Volume2, VolumeX, X, Loader2 } from "lucide-react";
import type { MovieSummary } from "@watchbox/shared";
import { getBackdropUrl, formatReleaseYear } from "../utils/tmdb";
import {
  useWatchlist,
  useAddToWatchlist,
  useRemoveFromWatchlist,
} from "../hooks/usePersonal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiClient } from "../api/client";
import RandomLetterSwap from "./RandomLetterSwap";

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

  // In-panel trailer autoplay state (after staying on panel for 5s)
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(0); // 0 to 100%
  const [isCountingDown, setIsCountingDown] = useState(false);

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trailerCacheRef = useRef<Record<number, string | null>>({});

  const currentMovie = movies[currentIndex] || movies[0];

  // Auto cycle through featured movies every 8 seconds (paused if playing trailer or hovering)
  useEffect(() => {
    if (movies.length <= 1 || isPlayingTrailer || isCountingDown) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(movies.length, 5));
    }, 8000);
    return () => clearInterval(interval);
  }, [movies.length, isPlayingTrailer, isCountingDown]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // When changing slides, reset in-panel trailer state
  const resetTrailerState = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    hoverTimeoutRef.current = null;
    progressIntervalRef.current = null;
    setIsPlayingTrailer(false);
    setTrailerKey(null);
    setIsLoadingTrailer(false);
    setIsCountingDown(false);
    setHoverProgress(0);
  };

  const startHoverCountdown = () => {
    if (isPlayingTrailer || !currentMovie) return;
    resetTrailerState();
    setIsCountingDown(true);

    const startTime = Date.now();
    const duration = 5000; // 5 seconds

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setHoverProgress(progress);
      if (progress >= 100) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }
    }, 50);

    hoverTimeoutRef.current = setTimeout(async () => {
      setIsCountingDown(false);
      setIsLoadingTrailer(true);

      try {
        let key = trailerCacheRef.current[currentMovie.id];
        if (key === undefined) {
          const res = await apiClient<{ primaryTrailer: { key: string } | null }>(
            `/movies/${currentMovie.id}/videos`
          );
          key = res.primaryTrailer?.key || null;
          trailerCacheRef.current[currentMovie.id] = key;
        }

        if (key) {
          setTrailerKey(key);
          setIsPlayingTrailer(true);
        } else {
          showToast("No official trailer available for this title", "info");
        }
      } catch (err) {
        console.error("Failed to load in-panel trailer preview:", err);
      } finally {
        setIsLoadingTrailer(false);
      }
    }, duration);
  };

  const cancelHoverCountdown = () => {
    resetTrailerState();
  };

  if (!movies || movies.length === 0) return null;

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
      showToast("Removed from My List", "info");
    } else {
      addWatchlist.mutate(currentMovie.id);
      showToast("Saved to My List", "success");
    }
  };

  const handleTrailerClick = () => {
    if (onPlayTrailer) {
      onPlayTrailer(currentMovie.id, currentMovie.title);
    }
  };

  return (
    <div
      onMouseEnter={startHoverCountdown}
      onMouseLeave={cancelHoverCountdown}
      className="relative w-full min-h-[500px] md:min-h-[620px] flex items-end overflow-hidden pb-12 pt-24 bg-[#050707] group/banner"
    >
      {/* 5-second Hover Countdown Progress Bar (Top of Panel) */}
      {isCountingDown && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/40 z-30 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#E4B85A] to-[#FFD985] shadow-sm shadow-[#E4B85A]/60 transition-all duration-75"
            style={{ width: `${hoverProgress}%` }}
          />
        </div>
      )}

      {/* Background Layer: Either Live Trailer Video or High-Res Backdrop Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {isPlayingTrailer && trailerKey ? (
          <div className="relative w-full h-full overflow-hidden">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=${
                isMuted ? 1 : 0
              }&controls=0&loop=1&playlist=${trailerKey}&modestbranding=1&rel=0`}
              title={`${currentMovie.title} In-Panel Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="absolute w-[140%] h-[140%] -top-[20%] -left-[20%] object-cover border-0 pointer-events-none scale-105 transition-opacity duration-700 opacity-95"
            />
          </div>
        ) : (
          <img
            src={getBackdropUrl(currentMovie.backdropPath, "original")}
            alt={currentMovie.title}
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&auto=format&fit=crop&q=80";
            }}
            className="w-full h-full object-cover object-center transition-all duration-1000 ease-in-out scale-100"
          />
        )}

        {/* Cinematic gradient overlays with high contrast for legible typography */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050707] via-transparent to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050707]/90 via-[#050707]/40 to-transparent max-w-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#050707]/80" />
      </div>

      {/* In-Panel Floating Controls (Audio Mute/Unmute & Close Trailer) */}
      {isPlayingTrailer && (
        <div className="absolute top-20 right-4 sm:right-8 z-30 flex items-center gap-2 animate-in fade-in duration-300">
          <button
            onClick={() => setIsMuted((prev) => !prev)}
            title={isMuted ? "Unmute audio" : "Mute audio"}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-[#E4B85A]/60 text-[#E4B85A] hover:bg-[#E4B85A] hover:text-[#050707] transition-all text-xs font-semibold shadow-lg"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isMuted ? "Unmute" : "Muted"}</span>
          </button>
          <button
            onClick={resetTrailerState}
            title="Exit trailer preview"
            className="p-1.5 rounded-full bg-black/70 backdrop-blur-md border border-[#282B27] text-[#A7A69F] hover:text-[#F5F0E6] hover:border-[#E4B85A] transition-all shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8">
        <div className="max-w-2xl space-y-4">
          {/* Eyebrow Badges with Hover Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101414]/90 border border-[#E4B85A]/50 text-[#E4B85A] text-[11px] font-bold tracking-widest uppercase">
              <span>NOW FEATURED</span>
            </div>

            {isCountingDown && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-[#FFD985] text-[11px] font-semibold animate-pulse">
                <Play className="w-3 h-3 fill-current" />
                <span>Trailer starting in {Math.max(1, Math.ceil(5 - (hoverProgress / 100) * 5))}s...</span>
              </div>
            )}

            {isLoadingTrailer && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101414]/90 border border-[#E4B85A]/50 text-[#E4B85A] text-[11px] font-semibold">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Loading Trailer...</span>
              </div>
            )}

            {isPlayingTrailer && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Playing in Panel</span>
              </div>
            )}
          </div>

          {/* Title in Editorial Serif with RandomLetterSwap */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#F5F0E6] drop-shadow-md">
            <RandomLetterSwap
              key={currentMovie.id}
              label={currentMovie.title}
              color="inherit"
              mode="pingpong"
              staggerDuration={0.03}
            />
          </h1>

          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-[#A7A69F] flex-wrap">
            <span className="text-[#F5F0E6] font-semibold">
              {formatReleaseYear(currentMovie.releaseDate)}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#282B27]" />
            <div className="flex items-center gap-1 text-[#E4B85A] font-bold">
              <Star className="w-4 h-4 fill-[#E4B85A]" />
              <span>{currentMovie.voteAverage.toFixed(1)}</span>
              <span className="text-[#A7A69F] text-xs font-normal">
                ({currentMovie.voteCount.toLocaleString()})
              </span>
            </div>
            <span className="w-1 h-1 rounded-full bg-[#282B27]" />
            <span className="px-2 py-0.5 rounded bg-[#101414] border border-[#282B27] text-[#A7A69F] text-xs">
              4K CINEMA
            </span>
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-[#F5F0E6]/90 line-clamp-3 leading-relaxed max-w-xl font-normal drop-shadow">
            {currentMovie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              onClick={handleTrailerClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E4B85A] hover:bg-[#FFD985] text-[#050707] text-xs font-bold uppercase tracking-wider transition-all shadow-lg"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Trailer Fullscreen</span>
            </button>

            <button
              onClick={handleWatchlistToggle}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all ${
                inWatchlist
                  ? "bg-[#171B1A] border-[#E4B85A] text-[#E4B85A]"
                  : "bg-[#101414]/80 border-[#282B27] text-[#F5F0E6] hover:border-[#E4B85A] hover:text-[#E4B85A]"
              }`}
            >
              {inWatchlist ? (
                <>
                  <Check className="w-4 h-4 text-[#E4B85A]" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to My List</span>
                </>
              )}
            </button>

            <Link
              to={`/movies/${currentMovie.id}`}
              className="p-2.5 rounded-xl bg-[#101414] border border-[#282B27] text-[#A7A69F] hover:text-[#F5F0E6] hover:border-[#E4B85A] transition-colors"
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
              onClick={() => {
                resetTrailerState();
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-8 bg-[#E4B85A]"
                  : "w-2 bg-[#282B27] hover:bg-[#927442]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
