import React, { useState, useEffect, useRef } from "react";
import { Play, Plus, Check, Star, Volume2, VolumeX, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { MovieSummary } from "@watchbox/shared";
import { getBackdropUrl, getPosterUrl, formatReleaseYear } from "../utils/tmdb";
import { useWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from "../hooks/usePersonal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiClient } from "../api/client";

interface HeroBannerProps {
  movies?: MovieSummary[];
  onPlayTrailer?: (tmdbId: number, title: string) => void;
}

// 5 Masterpiece Featured movies (Inception, The Dark Knight, Fight Club, Interstellar, Oppenheimer)
const CURATED_FEATURED: MovieSummary[] = [
  {
    id: 27205,
    title: "Inception",
    posterPath: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    backdropPath: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    releaseDate: "2010-07-15",
    voteAverage: 8.4,
    voteCount: 35600,
    genreIds: [28, 878, 12],
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: 'inception'.",
  },
  {
    id: 155,
    title: "The Dark Knight",
    posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdropPath: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    releaseDate: "2008-07-16",
    voteAverage: 8.5,
    voteCount: 32400,
    genreIds: [18, 28, 80, 53],
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. But they soon find themselves prey to a reign of chaos unleashed by the Joker.",
  },
  {
    id: 550,
    title: "Fight Club",
    posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdropPath: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
    releaseDate: "1999-10-15",
    voteAverage: 8.4,
    voteCount: 28900,
    genreIds: [18],
    overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy with underground fight clubs, sparking an out-of-control spiral toward oblivion.",
  },
  {
    id: 157336,
    title: "Interstellar",
    posterPath: "/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
    backdropPath: "/8sNiAPPYU14PUepFNeSNGUTiHW.jpg",
    releaseDate: "2014-11-05",
    voteAverage: 8.6,
    voteCount: 34000,
    genreIds: [878, 18],
    overview: "A team of intrepid explorers travel through a newly discovered wormhole in space to ensure humanity's survival among the stars.",
  },
  {
    id: 872585,
    title: "Oppenheimer",
    posterPath: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdropPath: "/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
    releaseDate: "2023-07-21",
    voteAverage: 8.4,
    voteCount: 8100,
    genreIds: [36, 18],
    overview: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb, reshaping civilization forever.",
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({ movies, onPlayTrailer }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();
  const { showToast } = useToast();

  const { data: watchlistData } = useWatchlist();
  const addWatchlist = useAddToWatchlist();
  const removeWatchlist = useRemoveFromWatchlist();

  // In-panel trailer autoplay state (after hovering on panel for 5s)
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(0); // 0 to 100%
  const [isCountingDown, setIsCountingDown] = useState(false);

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trailerCacheRef = useRef<Record<number, string | null>>({});

  // Blend live movies with curated fallback
  const featuredList = movies && movies.length >= 5 ? movies.slice(0, 5) : CURATED_FEATURED;
  const currentMovie = featuredList[currentIndex] || featuredList[0];

  // Auto cycle through featured movies every 8 seconds (paused if playing trailer or hovering)
  useEffect(() => {
    if (featuredList.length <= 1 || isPlayingTrailer || isCountingDown) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredList.length, isPlayingTrailer, isCountingDown]);

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
    const duration = 5000; // 5 seconds requirement preserved

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
      className="relative w-full min-h-[480px] sm:min-h-[540px] md:min-h-[600px] flex items-end overflow-hidden pb-12 pt-20 bg-[#050707] group/banner"
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
              if (currentMovie.backdropPath && !e.currentTarget.src.includes("image.tmdb.org")) {
                e.currentTarget.src = `https://image.tmdb.org/t/p/original${currentMovie.backdropPath.startsWith("/") ? "" : "/"}${currentMovie.backdropPath}`;
              } else {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&auto=format&fit=crop&q=80";
              }
            }}
            className="w-full h-full object-cover object-center transition-all duration-1000 ease-in-out scale-100 opacity-100"
          />
        )}

        {/* Cinematic Vignette Gradients - Increased Clarity & Opacity of Artwork */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050707] via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050707]/90 via-[#050707]/30 to-transparent max-w-2xl sm:max-w-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-[#050707]/60" />
      </div>

      {/* In-Panel Floating Audio Mute/Close Controls */}
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

      {/* Hero Content Grid: Left Title & Buttons + Right 5-Card Vertical Carousel */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
        {/* Left Hero Content */}
        <div className="max-w-xl space-y-4">
          {/* Trailer Countdown or Loading Status */}
          {(isCountingDown || isLoadingTrailer) && (
            <div className="flex items-center gap-2">
              {isCountingDown && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-[#FFD985] text-[10px] font-semibold animate-pulse">
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Trailer in {Math.max(1, Math.ceil(5 - (hoverProgress / 100) * 5))}s</span>
                </div>
              )}

              {isLoadingTrailer && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#101414] border border-[#E4B85A]/50 text-[#E4B85A] text-[10px]">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>Loading...</span>
                </div>
              )}
            </div>
          )}

          {/* Title in Editorial Serif Display */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#F5F0E6] leading-[1.05] drop-shadow-lg">
            {currentMovie.title}
          </h1>

          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-[#A7A69F] flex-wrap">
            <span className="text-[#F5F0E6] font-semibold">
              {formatReleaseYear(currentMovie.releaseDate) || "2024"}
            </span>
            <span>•</span>
            <span>Sci-Fi</span>
            <span>•</span>
            <span>2h 46m</span>
            <span>•</span>
            <div className="flex items-center gap-1 text-[#E4B85A] font-bold">
              <Star className="w-3.5 h-3.5 fill-[#E4B85A]" />
              <span>{currentMovie.voteAverage.toFixed(1)}</span>
              <span className="text-[#A7A69F] text-xs font-normal">
                ({currentMovie.voteCount ? `${Math.round(currentMovie.voteCount / 1000)}K` : "482K"})
              </span>
            </div>
          </div>

          {/* Synopsis */}
          <p className="text-xs sm:text-sm text-[#A7A69F] leading-relaxed max-w-lg line-clamp-3">
            {currentMovie.overview}
          </p>

          {/* Action Buttons: Watch Trailer & Add to My List */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              onClick={handleTrailerClick}
              className="bg-[#101414] text-[#E4B85A] border border-[#E4B85A] border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <span className="bg-[#E4B85A] shadow-[#E4B85A] absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(228,184,90,0.3)] pointer-events-none" />
              <Play className="w-3.5 h-3.5 fill-current shrink-0" />
              <span className="relative z-10 group-hover:text-[#FFD985]">Watch Trailer</span>
            </button>

            <button
              onClick={handleWatchlistToggle}
              className={`bg-[#101414] border border-[#E4B85A] border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group inline-flex items-center gap-2 text-xs font-semibold tracking-wide cursor-pointer ${
                inWatchlist ? "text-[#FFD985]" : "text-[#E4B85A]"
              }`}
            >
              <span className="bg-[#E4B85A] shadow-[#E4B85A] absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(228,184,90,0.3)] pointer-events-none" />
              {inWatchlist ? <Check className="w-4 h-4 text-[#E4B85A] shrink-0" /> : <Plus className="w-4 h-4 shrink-0" />}
              <span className="relative z-10 group-hover:text-[#FFD985]">{inWatchlist ? "In Watchlist" : "Add to My List"}</span>
            </button>
          </div>
        </div>

        {/* Right Hero Cards Carousel: 5 Numbered Vertical Cards Matching Screenshot */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {featuredList.map((m, idx) => {
            const isSelected = idx === currentIndex;
            const numberStr = `0${idx + 1}`;
            return (
              <div
                key={m.id}
                onClick={() => {
                  resetTrailerState();
                  setCurrentIndex(idx);
                }}
                className={`relative w-24 sm:w-28 aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group ${
                  isSelected
                    ? "border-2 border-[#E4B85A] shadow-[0_0_25px_rgba(228,184,90,0.4)] scale-105 z-10 opacity-100"
                    : "border border-white/20 opacity-90 hover:opacity-100 hover:border-[#E4B85A]/60"
                }`}
              >
                <img
                  src={getPosterUrl(m.posterPath, "w500")}
                  alt={m.title}
                  onError={(e) => {
                    if (m.posterPath && !e.currentTarget.src.includes("image.tmdb.org")) {
                      e.currentTarget.src = `https://image.tmdb.org/t/p/w500${m.posterPath.startsWith("/") ? "" : "/"}${m.posterPath}`;
                    } else {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80";
                    }
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Number Badge at Top */}
                <span
                  className={`absolute top-2 left-2 text-xs font-bold ${
                    isSelected ? "text-[#E4B85A]" : "text-white/80"
                  }`}
                >
                  {numberStr}
                </span>

                {/* Circular Play Button on Active Card */}
                {isSelected && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 border border-[#E4B85A] flex items-center justify-center text-[#E4B85A] shadow-lg backdrop-blur-sm">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                )}

                {/* Movie Title at Bottom */}
                <div className="absolute bottom-2 left-1.5 right-1.5 text-center">
                  <p className="text-[9px] font-bold text-white uppercase tracking-wider truncate">
                    {m.title}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Carousel Next/Prev Controls */}
          <div className="flex flex-col gap-2 pl-1">
            <button
              onClick={() => {
                resetTrailerState();
                setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);
              }}
              aria-label="Previous Featured Movie"
              className="w-7 h-7 rounded-full bg-[#101414]/90 border border-[#282B27] hover:border-[#E4B85A] text-[#E4B85A] flex items-center justify-center shadow-lg transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                resetTrailerState();
                setCurrentIndex((prev) => (prev + 1) % featuredList.length);
              }}
              aria-label="Next Featured Movie"
              className="w-7 h-7 rounded-full bg-[#101414]/90 border border-[#282B27] hover:border-[#E4B85A] text-[#E4B85A] flex items-center justify-center shadow-lg transition-all cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
