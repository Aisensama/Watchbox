import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Plus, Check, Play, Volume2, VolumeX, X, Loader2 } from "lucide-react";
import type { MovieSummary } from "@watchbox/shared";
import { getPosterUrl, formatMovieMetadata } from "../utils/tmdb";
import { useWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from "../hooks/usePersonal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiClient } from "../api/client";
import RandomLetterSwap from "./RandomLetterSwap";

interface MovieCardProps {
  movie: MovieSummary;
  onPlayTrailer?: (tmdbId: number, title: string) => void;
  className?: string;
  useLetterSwap?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPlayTrailer,
  className = "",
  useLetterSwap = false,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);

  // In-card 5-second hover trailer preview state
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewTrailerKey, setPreviewTrailerKey] = useState<string | null>(null);
  const [isPreviewMuted, setIsPreviewMuted] = useState(true);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: watchlistData } = useWatchlist();
  const addWatchlist = useAddToWatchlist();
  const removeWatchlist = useRemoveFromWatchlist();

  const inWatchlist = Boolean(
    watchlistData?.items.some((item) => item.tmdbId === movie.id)
  );

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const resetHoverPreview = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    hoverTimerRef.current = null;
    progressIntervalRef.current = null;
    setIsHovered(false);
    setHoverProgress(0);
    setIsPlayingPreview(false);
    setPreviewTrailerKey(null);
    setIsLoadingTrailer(false);
  };

  const handleMouseEnter = () => {
    if (isPlayingPreview) return;
    setIsHovered(true);
    setHoverProgress(0);

    const startTime = Date.now();
    const duration = 5000; // 5 seconds hover requirement

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setHoverProgress(progress);
      if (progress >= 100 && progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }, 50);

    hoverTimerRef.current = setTimeout(async () => {
      setIsLoadingTrailer(true);
      try {
        const data = await apiClient<{ primaryTrailer: { key: string } | null }>(
          `/movies/${movie.id}/videos`
        );
        if (data.primaryTrailer?.key) {
          setPreviewTrailerKey(data.primaryTrailer.key);
          setIsPlayingPreview(true);
        }
      } catch (err) {
        console.error("Failed to load in-card trailer preview:", err);
      } finally {
        setIsLoadingTrailer(false);
      }
    }, duration);
  };

  const handleMouseLeave = () => {
    resetHoverPreview();
  };

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast("Sign in to save movies to your list", "info");
      return;
    }
    if (inWatchlist) {
      removeWatchlist.mutate(movie.id);
      showToast("Removed from My List", "info");
    } else {
      addWatchlist.mutate(movie.id);
      showToast("Saved to My List", "success");
    }
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ contentVisibility: "auto", containIntrinsicSize: "320px" }}
      className={`neon-layout-border group relative flex flex-col rounded-2xl overflow-hidden bg-[#101414] border border-[#282B27] transition-all duration-300 hover:shadow-xl hover:shadow-black/60 hover:-translate-y-1 ${className}`}
    >
      {/* Poster Image Container */}
      <Link
        to={`/movies/${movie.id}`}
        className="block relative aspect-[2/3] w-full overflow-hidden bg-[#0A0D0D]"
      >
        {/* In-Card Trailer Video Preview (when cursor hovered for 5s) */}
        {isPlayingPreview && previewTrailerKey ? (
          <div className="absolute inset-0 z-20 bg-black overflow-hidden">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${previewTrailerKey}?autoplay=1&mute=${
                isPreviewMuted ? 1 : 0
              }&controls=0&loop=1&playlist=${previewTrailerKey}&modestbranding=1&rel=0`}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="w-full h-full object-cover border-0 scale-105 pointer-events-none"
            />

            {/* In-Card Controls */}
            <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsPreviewMuted((prev) => !prev);
                }}
                title={isPreviewMuted ? "Unmute audio" : "Mute audio"}
                className="p-1 rounded-full bg-black/80 border border-[#E4B85A]/60 text-[#E4B85A] hover:bg-[#E4B85A] hover:text-[#050707] transition-all"
              >
                {isPreviewMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  resetHoverPreview();
                }}
                title="Close preview"
                className="p-1 rounded-full bg-black/80 border border-[#282B27] text-[#A7A69F] hover:text-[#F5F0E6] hover:border-[#E4B85A] transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="absolute bottom-2 left-2 z-30 pointer-events-none">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/85 border border-emerald-500/60 text-emerald-300 text-[9px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Preview
              </span>
            </div>
          </div>
        ) : null}

        {/* 5-second Hover Progress Bar & Indicator */}
        {isHovered && !isPlayingPreview && (
          <>
            <div className="absolute top-2 left-2 z-20 pointer-events-none">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/85 border border-[#E4B85A]/50 text-[#FFD985] text-[10px] font-semibold animate-pulse shadow-md">
                {isLoadingTrailer ? (
                  <>
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Trailer in {Math.max(1, Math.ceil(5 - (hoverProgress / 100) * 5))}s</span>
                )}
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60 z-20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E4B85A] to-[#FFD985] shadow-sm shadow-[#E4B85A]/60 transition-all duration-75"
                style={{ width: `${hoverProgress}%` }}
              />
            </div>
          </>
        )}

        {/* Placeholder skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-[#171B1A] animate-pulse flex items-center justify-center text-[#A7A69F] text-xs">
            Loading...
          </div>
        )}

        <img
          src={getPosterUrl(movie.posterPath, "w500")}
          alt={movie.title}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
            setImageLoaded(true);
          }}
          ref={(img) => {
            if (img?.complete && !imageLoaded) {
              setImageLoaded(true);
            }
          }}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Subtle Trailer Button on Hover */}
        {onPlayTrailer && !isPlayingPreview && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
            <button
              onClick={handleTrailerClick}
              title="Watch Trailer Fullscreen"
              className="pointer-events-auto p-3 rounded-full bg-[#050707]/80 border border-[#E4B85A]/60 text-[#E4B85A] hover:bg-[#E4B85A] hover:text-[#050707] shadow-lg transform transition-all group-hover:scale-110"
            >
              <Play className="w-5 h-5 fill-current" />
            </button>
          </div>
        )}
      </Link>

      {/* Card Info */}
      <div className="p-3.5 flex flex-col gap-1.5 bg-[#101414]">
        {/* Rating Row (Gold Star + Numerical Rating) */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#E4B85A]">
          <Star className="w-3.5 h-3.5 fill-[#E4B85A] text-[#E4B85A]" />
          <span>{movie.voteAverage > 0 ? movie.voteAverage.toFixed(1) : "NR"}</span>
        </div>

        {/* Title, Year, Genre & Add to My List */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link
              to={`/movies/${movie.id}`}
              className="block text-sm font-bold text-[#F5F0E6] truncate group-hover:text-[#FFD985] transition-colors"
              title={movie.title}
            >
              {useLetterSwap ? (
                <RandomLetterSwap
                  label={movie.title}
                  color="inherit"
                  staggerDuration={0.03}
                />
              ) : (
                movie.title
              )}
            </Link>
            <p className="text-xs text-[#A7A69F] truncate mt-0.5">
              {formatMovieMetadata(movie.releaseDate, movie.genreIds)}
            </p>
          </div>

          {/* Circular Add to My List action */}
          <button
            onClick={handleWatchlistClick}
            title={inWatchlist ? "Remove from My List" : "Add to My List"}
            className={`w-7 h-7 shrink-0 rounded-full border flex items-center justify-center transition-all ${
              inWatchlist
                ? "border-[#E4B85A] bg-[#E4B85A]/15 text-[#E4B85A]"
                : "border-[#282B27] text-[#A7A69F] hover:border-[#E4B85A] hover:text-[#E4B85A] hover:bg-[#171B1A]"
            }`}
          >
            {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
