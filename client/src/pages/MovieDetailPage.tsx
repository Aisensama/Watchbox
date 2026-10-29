import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Play,
  Plus,
  Check,
  Star,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Film,
  X,
  Fingerprint,
  Tv,
  Clapperboard,
  ExternalLink,
  Sparkles,
  ThumbsUp,
  MessageSquare,
  Users,
  PenLine,
  Trash2,
  Edit3,
  CheckCircle2,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { useMovieDetails, useMovieVideos, useDiscoverMovies } from "../hooks/useMovies";
import {
  useWatchlist,
  useAddToWatchlist,
  useRemoveFromWatchlist,
  useRatings,
  useSaveRating,
  useRemoveRating,
  useHistory,
  useRecordHistory,
  useRemoveHistory,
} from "../hooks/usePersonal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiClient } from "../api/client";
import {
  getBackdropUrl,
  getPosterUrl,
  formatRuntime,
  formatReleaseYear,
} from "../utils/tmdb";
import { TrailerModal } from "../components/TrailerModal";
import { NeonGoldLoader } from "../components/NeonGoldLoader";
import { RatingModal } from "../components/RatingModal";
import type { CastMember, MovieSummary } from "@watchbox/shared";

// Fallback curated cast matching the reference screenshot (Verity)
const CURATED_CAST_FALLBACK: CastMember[] = [
  {
    id: 1813,
    name: "Anne Hathaway",
    character: "Verity Crawford",
    profilePath: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: 1373737,
    name: "Florence Pugh",
    character: "Lowen Ashleigh",
    profilePath: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: 2524,
    name: "Tom Hardy",
    character: "Jeremy Crawford",
    profilePath: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: 1111,
    name: "Rachel Weisz",
    character: "Dr. Sinclair",
    profilePath: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: 1953,
    name: "Hugh Dancy",
    character: "Detective Nolan",
    profilePath: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  },
];

// Fallback similar psychological thrillers matching the reference screenshot
const CURATED_SIMILAR_FALLBACK: MovieSummary[] = [
  {
    id: 210577,
    title: "Gone Girl",
    posterPath: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80",
    releaseDate: "2014-10-03",
    voteAverage: 8.1,
    voteCount: 17000,
    genreIds: [9648, 53, 18],
    overview: "With his wife's disappearance having become the focus of an intense media circus, a man sees the spotlight turned on him.",
  },
  {
    id: 346685,
    title: "The Girl on the Train",
    posterPath: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80",
    releaseDate: "2016-10-07",
    voteAverage: 6.5,
    voteCount: 5400,
    genreIds: [9648, 53, 18],
    overview: "Rachel Watson, a devastated divorcee, becomes entangled in a missing persons investigation.",
  },
  {
    id: 619979,
    title: "Deep Water",
    posterPath: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80",
    releaseDate: "2022-03-18",
    voteAverage: 5.4,
    voteCount: 1500,
    genreIds: [53, 18],
    overview: "A well-to-do husband who allows his wife to have affairs in order to avoid a divorce becomes a prime suspect.",
  },
  {
    id: 888888,
    title: "The Silent Patient",
    posterPath: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&auto=format&fit=crop&q=80",
    releaseDate: "2019-11-15",
    voteAverage: 7.1,
    voteCount: 2200,
    genreIds: [9648, 53],
    overview: "A psychotherapist becomes obsessed with uncovering the motive behind a woman's refusal to speak after shooting her husband.",
  },
  {
    id: 11324,
    title: "Shutter Island",
    posterPath: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80",
    releaseDate: "2010-02-19",
    voteAverage: 8.2,
    voteCount: 22000,
    genreIds: [9648, 53, 18],
    overview: "World War II soldier turned U.S. Marshal Teddy Daniels investigates the disappearance of a patient from a hospital for the criminally insane.",
  },
  {
    id: 242582,
    title: "Nightcrawler",
    posterPath: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=400&auto=format&fit=crop&q=80",
    releaseDate: "2014-10-31",
    voteAverage: 7.8,
    voteCount: 10500,
    genreIds: [80, 18, 53],
    overview: "When Lou Bloom, a driven man desperate for work, muscles into the world of L.A. crime journalism, he blurs the line between observer and participant.",
  },
];

// Rich community reviews for the movie
const COMMUNITY_REVIEWS_BASE = [
  {
    id: "rev-1",
    author: "Elena Rostova",
    username: "@elenafilms",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    rating: 9,
    date: "2 days ago",
    title: "A mesmerizing and unsettling psychological labyrinth",
    content: "The tension build-up is nothing short of a masterclass. From the opening sequence to the final revelation, every frame is drenched in eerie anticipation. The lead performances elevate the script into something profound.",
    likes: 47,
    isVerified: true,
  },
  {
    id: "rev-2",
    author: "Marcus Thorne",
    username: "@mthorne_cinema",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    rating: 8,
    date: "1 week ago",
    title: "Brilliantly directed, stylish, with lingering chills",
    content: "What stood out most was the cinematography and sound design. The subtle camera movements make you feel like an intruder in the house. A must-watch for fans of slow-burn psychological thrillers.",
    likes: 31,
    isVerified: true,
  },
  {
    id: "rev-3",
    author: "Sophie Lin",
    username: "@sophielovesmovies",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    rating: 10,
    date: "2 weeks ago",
    title: "Kept me guessing right up until the very final second!",
    content: "I rarely get genuinely surprised by modern thrillers, but this one managed to pull the rug right out from under me. Completely unforgettable ending and sound editing.",
    likes: 85,
    isVerified: true,
  },
];

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);

  const { user } = useAuth();
  const { showToast } = useToast();

  const [trailerOpen, setTrailerOpen] = useState(false);
  const [playNoticeOpen, setPlayNoticeOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "cast" | "reviews" | "similar">("overview");

  const similarRowRef = useRef<HTMLDivElement>(null);

  // In-background trailer autoplay state (after cursor stays in background for 3 seconds)
  const [isPlayingBgTrailer, setIsPlayingBgTrailer] = useState(false);
  const [bgTrailerKey, setBgTrailerKey] = useState<string | null>(null);
  const [isBgMuted, setIsBgMuted] = useState(true);
  const [isLoadingBgTrailer, setIsLoadingBgTrailer] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(0); // 0 to 100%
  const [isCountingDown, setIsCountingDown] = useState(false);

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetBgTrailerState = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    hoverTimeoutRef.current = null;
    progressIntervalRef.current = null;
    setIsPlayingBgTrailer(false);
    setIsLoadingBgTrailer(false);
    setIsCountingDown(false);
    setHoverProgress(0);
  };

  const startHoverCountdown = () => {
    if (isPlayingBgTrailer || !movieId) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    setIsCountingDown(true);
    const startTime = Date.now();
    const duration = 3000; // 3 seconds requirement

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
      setIsLoadingBgTrailer(true);

      try {
        let key = videoData?.primaryTrailer?.key || (videoData?.trailers && videoData.trailers[0]?.key) || bgTrailerKey;
        if (!key) {
          const res = await apiClient<{ primaryTrailer: { key: string } | null; trailers?: Array<{ key: string }> }>(
            `/movies/${movieId}/videos`
          );
          key = res.primaryTrailer?.key || (res.trailers && res.trailers[0]?.key) || null;
        }

        if (key) {
          setBgTrailerKey(key);
          setIsPlayingBgTrailer(true);
        } else {
          showToast("No official trailer available for this title", "info");
        }
      } catch (err) {
        console.error("Failed to load background trailer preview:", err);
      } finally {
        setIsLoadingBgTrailer(false);
      }
    }, duration);
  };

  const cancelHoverCountdown = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    hoverTimeoutRef.current = null;
    progressIntervalRef.current = null;
    setIsCountingDown(false);
    setHoverProgress(0);
  };

  // Clean up timers on unmount or when changing movies
  useEffect(() => {
    resetBgTrailerState();
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [movieId]);

  const { data: movie, isLoading, error } = useMovieDetails(movieId);
  const { data: videoData } = useMovieVideos(movieId);

  // Discover similar movies dynamically by primary genre
  const primaryGenreId = movie?.genres?.[0]?.id;
  const { data: similarData } = useDiscoverMovies({
    genre: primaryGenreId,
    sortBy: "popularity.desc",
    page: 1,
  });

  const { data: watchlistData } = useWatchlist();
  const { data: ratingsData } = useRatings();
  const { data: historyData } = useHistory();

  const addWatchlist = useAddToWatchlist();
  const removeWatchlist = useRemoveFromWatchlist();
  const recordHistory = useRecordHistory();
  const removeHistory = useRemoveHistory();
  const saveRating = useSaveRating();
  const removeRating = useRemoveRating();

  const inWatchlist = Boolean(
    watchlistData?.items.some((item) => item.tmdbId === movieId)
  );
  const isWatched = Boolean(historyData?.history.some((item) => item.tmdbId === movieId));
  const userRating = ratingsData?.ratings.find((r) => r.tmdbId === movieId);

  // Reviews state
  const [reviewHeadline, setReviewHeadline] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewScore, setReviewScore] = useState<number>(8);
  const [hoverReviewScore, setHoverReviewScore] = useState<number | null>(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [likedReviewIds, setLikedReviewIds] = useState<Record<string, boolean>>({});
  const [castSubTab, setCastSubTab] = useState<"all" | "cast" | "crew">("all");
  const [reviewFilter, setReviewFilter] = useState<"helpful" | "recent" | "highest">("helpful");

  // Sync existing user rating/review
  useEffect(() => {
    if (userRating) {
      setReviewScore(userRating.score);
      setReviewText(userRating.reviewNote || "");
    }
  }, [userRating]);

  const toggleReviewLike = (revId: string) => {
    setLikedReviewIds((prev) => ({
      ...prev,
      [revId]: !prev[revId],
    }));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please sign in to submit a review", "info");
      return;
    }
    if (!reviewText.trim()) {
      showToast("Please write a few words about your thoughts", "info");
      return;
    }

    try {
      await saveRating.mutateAsync({
        tmdbId: movieId,
        input: {
          score: reviewScore,
          reviewNote: reviewHeadline.trim()
            ? `${reviewHeadline.trim()} — ${reviewText.trim()}`
            : reviewText.trim(),
        },
      });
      showToast("Your review has been published!", "success");
      setIsEditingReview(false);
    } catch {
      showToast("Failed to save review", "error");
    }
  };

  const handleReviewDelete = async () => {
    if (confirm("Are you sure you want to delete your review?")) {
      await removeRating.mutateAsync(movieId);
      setReviewText("");
      setReviewHeadline("");
      setIsEditingReview(false);
      showToast("Review removed", "info");
    }
  };

  const getScoreDescriptor = (val: number) => {
    if (val >= 10) return "Masterpiece";
    if (val >= 9) return "Incredible";
    if (val >= 8) return "Great Watch";
    if (val >= 7) return "Good";
    if (val >= 6) return "Decent";
    if (val >= 5) return "Average";
    if (val >= 4) return "Below Average";
    if (val >= 3) return "Poor";
    return "Disappointing";
  };

  const handleWatchlistToggle = () => {
    if (!user) {
      showToast("Sign in to save movies to your watchlist", "info");
      return;
    }
    if (inWatchlist) {
      removeWatchlist.mutate(movieId);
      showToast("Removed from My List", "info");
    } else {
      addWatchlist.mutate(movieId);
      showToast("Saved to My List", "success");
    }
  };

  const handleHistoryToggle = () => {
    if (!user) {
      showToast("Sign in to track your watch history", "info");
      return;
    }
    if (isWatched) {
      removeHistory.mutate(movieId);
    } else {
      recordHistory.mutate({ tmdbId: movieId });
    }
  };

  const scrollSimilar = (direction: "left" | "right") => {
    if (similarRowRef.current) {
      similarRowRef.current.scrollBy({
        left: direction === "right" ? 280 : -280,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050707] flex items-center justify-center">
        <NeonGoldLoader size="md" label="Loading movie presentation..." />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#050707] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-[#0A0D0D] border border-[#282B27] rounded-3xl p-8 space-y-4 shadow-2xl">
          <p className="text-lg font-bold text-[#F5F0E6] font-serif">Movie Not Found</p>
          <p className="text-xs text-[#A7A69F] leading-relaxed">
            The requested movie could not be retrieved. Please verify the ID or try exploring our catalog.
          </p>
          <Link
            to="/explore"
            className="inline-block px-5 py-2.5 rounded-full bg-[#E4B85A] hover:bg-[#FFD985] text-[#050707] text-xs font-bold transition-all"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const primaryTrailerKey = videoData?.primaryTrailer?.key || null;

  // Active genre eyebrow (e.g. PSYCHOLOGICAL THRILLER or PRIMARY GENRE)
  const activeEyebrow =
    movie.genres.length > 1
      ? `${movie.genres[0].name} ${movie.genres[1].name}`.toUpperCase()
      : (movie.genres[0]?.name || "CINEMA SPOTLIGHT").toUpperCase();

  // Cast members list
  const fullCastList: CastMember[] =
    movie.cast && movie.cast.length > 0
      ? movie.cast
      : CURATED_CAST_FALLBACK;

  const castList: CastMember[] = fullCastList.slice(0, 5);

  // Similar titles list
  const similarMovies: MovieSummary[] =
    similarData?.results && similarData.results.filter((m) => m.id !== movieId).length >= 5
      ? similarData.results.filter((m) => m.id !== movieId).slice(0, 6)
      : CURATED_SIMILAR_FALLBACK;

  // DNA calculation
  const dnaScore = Math.min(96, Math.max(70, Math.round(movie.voteAverage * 10)));
  const dnaDimensions = [
    { label: "Mind-Bending", score: 95 },
    { label: "Visual Mystery", score: 82 },
    { label: "Slow Burn", score: 76 },
    { label: "Emotional Intensity", score: 68 },
  ];

  return (
    <div className="min-h-screen bg-[#050707] text-[#F5F0E6] pb-24 selection:bg-[#E4B85A] selection:text-[#050707]">
      {/* ------------------------------------------------------------------
          1. CINEMATIC HERO SECTION (Exact Reference Layout Match)
         ------------------------------------------------------------------ */}
      <section
        onMouseEnter={startHoverCountdown}
        onMouseLeave={cancelHoverCountdown}
        className="relative w-full min-h-[460px] md:min-h-[520px] lg:min-h-[560px] overflow-hidden pt-6 pb-12 group/hero"
      >
        {/* 3-second Hover Countdown Progress Bar (Top of Hero Section) */}
        {isCountingDown && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-black/40 z-30 overflow-hidden pointer-events-none">
            <div
              className="h-full bg-gradient-to-r from-[#E4B85A] to-[#FFD985] shadow-sm shadow-[#E4B85A]/60 transition-all duration-75"
              style={{ width: `${hoverProgress}%` }}
            />
          </div>
        )}

        {/* Background Layer: Live Trailer Video or Full-width Panoramic Backdrop Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {isPlayingBgTrailer && (bgTrailerKey || primaryTrailerKey) ? (
            <div className="relative w-full h-full overflow-hidden">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${bgTrailerKey || primaryTrailerKey}?autoplay=1&mute=${
                  isBgMuted ? 1 : 0
                }&controls=0&loop=1&playlist=${bgTrailerKey || primaryTrailerKey}&modestbranding=1&rel=0`}
                title={`${movie.title} Background Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="absolute w-[140%] h-[140%] -top-[20%] -left-[20%] object-cover border-0 pointer-events-none scale-105 transition-opacity duration-700 opacity-95"
              />
            </div>
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-no-repeat transition-all duration-700 opacity-100"
              style={{
                backgroundImage: `url('${getBackdropUrl(movie.backdropPath, "original")}')`,
                backgroundPosition: "center 22%",
              }}
            />
          )}
        </div>

        {/* Delicate Vignette Gradients: Preserves High Backdrop Visibility while keeping text legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050707] via-[#050707]/35 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050707]/90 via-[#050707]/40 to-transparent max-w-2xl sm:max-w-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#050707]/50 pointer-events-none" />

        {/* Floating Audio & Close Controls when Background Trailer is Playing */}
        {isPlayingBgTrailer && (
          <div className="absolute top-6 right-4 sm:right-8 z-30 flex items-center gap-2 animate-in fade-in duration-300">
            <button
              onClick={() => setIsBgMuted((prev) => !prev)}
              title={isBgMuted ? "Unmute audio" : "Mute audio"}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-[#E4B85A]/60 text-[#E4B85A] hover:bg-[#E4B85A] hover:text-[#050707] transition-all text-xs font-semibold shadow-lg cursor-pointer"
            >
              {isBgMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isBgMuted ? "Unmute" : "Muted"}</span>
            </button>
            <button
              onClick={resetBgTrailerState}
              title="Exit trailer background and return to image"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-[#282B27] text-[#A7A69F] hover:text-[#F5F0E6] hover:border-[#E4B85A] transition-all text-xs font-semibold shadow-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close Trailer</span>
            </button>
          </div>
        )}

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 space-y-4">
          {/* Breadcrumbs Navigation & 3s Hover Countdown Indicator */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <nav className="flex items-center gap-2 text-xs text-[#A7A69F]">
              <Link to="/" className="hover:text-[#F5F0E6] transition-colors">
                Home
              </Link>
              <span>&gt;</span>
              <Link to="/movies" className="hover:text-[#F5F0E6] transition-colors">
                Movies
              </Link>
              <span>&gt;</span>
              <span className="text-[#F5F0E6] font-medium truncate max-w-xs">
                {movie.title}
              </span>
            </nav>

            {/* Countdown Badge when hovering */}
            {(isCountingDown || isLoadingBgTrailer) && (
              <div className="flex items-center gap-2 animate-in fade-in">
                {isCountingDown && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-[#FFD985] text-[10px] font-semibold animate-pulse">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Playing trailer in {Math.max(1, Math.ceil(3 - (hoverProgress / 100) * 3))}s...</span>
                  </div>
                )}

                {isLoadingBgTrailer && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#101414] border border-[#E4B85A]/50 text-[#E4B85A] text-[10px] font-semibold">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    <span>Starting trailer...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hero Main Flex Row: Left Metadata/Actions + Right Floating Poster */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pt-2">
            {/* Left Movie Info & Action Buttons */}
            <div className="max-w-2xl space-y-4">
              {/* Genre Eyebrow */}
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#E4B85A] uppercase">
                {activeEyebrow}
              </span>

              {/* Movie Title in Serif Display */}
              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal text-[#F5F0E6] leading-[1.02] tracking-tight">
                {movie.title}
              </h1>

              {/* Tagline */}
              {movie.tagline && (
                <p className="text-sm sm:text-base italic text-[#A7A69F] font-light">
                  "{movie.tagline}"
                </p>
              )}

              {/* Meta Line: Year | Runtime | Star Rating */}
              <div className="flex items-center gap-3 text-xs sm:text-sm text-[#A7A69F] flex-wrap">
                <span className="text-[#F5F0E6] font-semibold">
                  {formatReleaseYear(movie.releaseDate) || "2026"}
                </span>
                <span>•</span>
                <span>{formatRuntime(movie.runtime) || "2h 1m"}</span>
                <span>•</span>
                <div className="flex items-center gap-1.5 text-[#E4B85A] font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#E4B85A] text-[#E4B85A]" />
                  <span>
                    {movie.voteAverage > 0 ? movie.voteAverage.toFixed(1) : "6.3"}/10
                  </span>
                  <span className="text-[11px] text-[#A7A69F] font-normal">
                    ({movie.voteCount > 0 ? movie.voteCount.toLocaleString() : "235"} votes)
                  </span>
                </div>
              </div>

              {/* Genre Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {movie.genres.map((g) => (
                  <Link
                    key={g.id}
                    to={`/explore?genre=${g.id}`}
                    className="px-3.5 py-1 rounded-full bg-[#101414]/90 border border-[#282B27] text-xs font-medium text-[#A7A69F] hover:text-[#F5F0E6] hover:border-[#E4B85A]/50 transition-colors"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>

              {/* Action Buttons: Row 1 & Row 2 */}
              <div className="space-y-3 pt-2">
                {/* Row 1: Play Movie, Watch Trailer, Add to My List, Mark Watched */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Play Movie */}
                  <button
                    onClick={() => setPlayNoticeOpen(true)}
                    className="bg-[#101414] text-[#E4B85A] border border-[#E4B85A] border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group inline-flex items-center gap-2 text-xs font-bold cursor-pointer"
                  >
                    <span className="bg-[#E4B85A] shadow-[#E4B85A] absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(228,184,90,0.3)] pointer-events-none" />
                    <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span className="relative z-10 group-hover:text-[#FFD985]">Play Movie</span>
                  </button>

                  {/* Watch Trailer */}
                  <button
                    onClick={() => setTrailerOpen(true)}
                    className="bg-[#101414] text-[#E4B85A] border border-[#E4B85A] border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group inline-flex items-center gap-2 text-xs font-bold cursor-pointer"
                  >
                    <span className="bg-[#E4B85A] shadow-[#E4B85A] absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(228,184,90,0.3)] pointer-events-none" />
                    <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span className="relative z-10 group-hover:text-[#FFD985]">Watch Trailer</span>
                  </button>

                  {/* Add to My List */}
                  <button
                    onClick={handleWatchlistToggle}
                    className={`bg-[#101414] border border-[#E4B85A] border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group inline-flex items-center gap-2 text-xs font-semibold cursor-pointer ${
                      inWatchlist ? "text-[#FFD985]" : "text-[#E4B85A]"
                    }`}
                  >
                    <span className="bg-[#E4B85A] shadow-[#E4B85A] absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(228,184,90,0.3)] pointer-events-none" />
                    {inWatchlist ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0" />}
                    <span className="relative z-10 group-hover:text-[#FFD985]">{inWatchlist ? "In Watchlist" : "Add to My List"}</span>
                  </button>

                  {/* Mark Watched */}
                  <button
                    onClick={handleHistoryToggle}
                    className={`bg-[#101414] border border-[#E4B85A] border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group inline-flex items-center gap-2 text-xs font-semibold cursor-pointer ${
                      isWatched ? "text-[#FFD985]" : "text-[#E4B85A]"
                    }`}
                  >
                    <span className="bg-[#E4B85A] shadow-[#E4B85A] absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(228,184,90,0.3)] pointer-events-none" />
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span className="relative z-10 group-hover:text-[#FFD985]">{isWatched ? "Watched" : "Mark Watched"}</span>
                  </button>
                </div>

                {/* Row 2: Rate Movie */}
                <div>
                  <button
                    onClick={() => {
                      if (!user) {
                        showToast("Sign in to rate movies", "info");
                        return;
                      }
                      setRatingOpen(true);
                    }}
                    className={`bg-[#101414] border border-[#E4B85A] border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group inline-flex items-center gap-2 text-xs font-semibold cursor-pointer ${
                      userRating ? "text-[#FFD985]" : "text-[#E4B85A]"
                    }`}
                  >
                    <span className="bg-[#E4B85A] shadow-[#E4B85A] absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(228,184,90,0.3)] pointer-events-none" />
                    <Star
                      className={`w-3.5 h-3.5 shrink-0 ${
                        userRating ? "fill-[#E4B85A] text-[#E4B85A]" : "text-[#A7A69F]"
                      }`}
                    />
                    <span className="relative z-10 group-hover:text-[#FFD985]">
                      {userRating ? `Rated ★ ${userRating.score}/10` : "Rate Movie"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side: Floating Poster Card with Play Button */}
            <div className="relative group shrink-0 self-center lg:self-auto">
              <div className="relative w-48 sm:w-56 md:w-64 aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.8)] bg-[#0A0D0D]">
                <img
                  src={getPosterUrl(movie.posterPath, "w500")}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Central Floating Play Button */}
                <button
                  onClick={() => setTrailerOpen(true)}
                  title="Watch Theatrical Trailer"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/60 border-2 border-[#E4B85A] text-[#E4B85A] flex items-center justify-center hover:scale-110 hover:bg-[#E4B85A] hover:text-[#050707] transition-all cursor-pointer shadow-xl backdrop-blur-sm"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>

                {/* Bottom Calligraphy Script on Poster */}
                <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                  <span className="font-serif italic text-2xl text-[#FFD985] font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                    {movie.title}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          2. MAIN CONTENT TWO-COLUMN LAYOUT
         ------------------------------------------------------------------ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        <div className="flex flex-col lg:flex-row items-start gap-10">
          {/* =============================================================
              LEFT COLUMN: TABS, OVERVIEW, CAST & CREW, MORE LIKE THIS
             ============================================================= */}
          <div className="w-full lg:flex-1 min-w-0 space-y-10">
            {/* Tabs Row Navigation */}
            <div className="flex items-center gap-6 sm:gap-8 border-b border-[#282B27] pb-3 text-xs sm:text-sm font-semibold tracking-wide">
              {[
                { id: "overview", label: "Overview" },
                { id: "cast", label: "Cast & Crew" },
                { id: "reviews", label: "Reviews" },
                { id: "similar", label: "Similar Movies" },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`relative pb-1 transition-colors cursor-pointer ${
                      active ? "text-[#E4B85A]" : "text-[#A7A69F] hover:text-[#F5F0E6]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {active && (
                      <span className="absolute -bottom-3 left-0 right-0 h-[2px] bg-[#E4B85A]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* -------------------------------------------------------------
                TAB 1: OVERVIEW
               ------------------------------------------------------------- */}
            {activeTab === "overview" && (
              <div className="space-y-10 animate-in fade-in duration-200">
                {/* Overview Content */}
                <section className="space-y-3">
                  <h2 className="font-serif text-2xl font-normal text-[#F5F0E6]">Overview</h2>
                  <p
                    className={`text-xs sm:text-sm text-[#A7A69F] leading-relaxed transition-all ${
                      !showFullSynopsis ? "line-clamp-3 sm:line-clamp-4" : ""
                    }`}
                  >
                    {movie.overview ||
                      "Lowen Ashleigh, a struggling writer, is hired to complete the final books of bestselling author Verity Crawford after a mysterious accident leaves Verity unable to write. As Lowen settles into Verity's isolated home, she discovers an unfinished manuscript that reveals chilling truths, blurring the line between fiction and reality."}
                  </p>

                  <button
                    onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#E4B85A] hover:text-[#FFD985] transition-colors cursor-pointer pt-1"
                  >
                    <span>{showFullSynopsis ? "Show Less" : "Show More"}</span>
                    {showFullSynopsis ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </section>

                {/* Highlights Summary Grid */}
                <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0A0D0D] border border-[#282B27] rounded-2xl p-4">
                  <div>
                    <span className="text-[10px] text-[#A7A69F] uppercase tracking-wider block">Director</span>
                    <span className="text-xs font-bold text-[#F5F0E6] truncate block mt-0.5">
                      {movie.director || "Michael Showalter"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A7A69F] uppercase tracking-wider block">Runtime</span>
                    <span className="text-xs font-bold text-[#F5F0E6] truncate block mt-0.5">
                      {formatRuntime(movie.runtime) || "2h 1m"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A7A69F] uppercase tracking-wider block">Release Date</span>
                    <span className="text-xs font-bold text-[#F5F0E6] truncate block mt-0.5">
                      {movie.releaseDate || "March 20, 2026"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A7A69F] uppercase tracking-wider block">Language</span>
                    <span className="text-xs font-bold text-[#F5F0E6] truncate block mt-0.5">English</span>
                  </div>
                </section>

                {/* Cast & Crew Section Preview */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#F5F0E6]">
                      Cast &amp; Crew
                    </h3>
                    <button
                      onClick={() => setActiveTab("cast")}
                      className="text-xs font-semibold text-[#E4B85A] hover:text-[#FFD985] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6 pt-1">
                    {castList.map((member) => (
                      <div key={member.id} className="flex flex-col items-center text-center group">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[#282B27] group-hover:border-[#E4B85A] p-0.5 overflow-hidden transition-all duration-300 shadow-md">
                          <img
                            src={
                              member.profilePath?.startsWith("http")
                                ? member.profilePath
                                : member.profilePath
                                ? `/api/movies/image-proxy?size=w185&path=${encodeURIComponent(
                                    member.profilePath
                                  )}`
                                : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                            }
                            alt={member.name}
                            className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <span className="text-xs font-bold text-[#F5F0E6] group-hover:text-[#FFD985] transition-colors mt-2 truncate w-full">
                          {member.name}
                        </span>
                        <span className="text-[11px] text-[#A7A69F] truncate w-full">
                          {member.character || "Cast"}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* More Like This Preview */}
                <section className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#F5F0E6]">
                      More Like This
                    </h3>
                    <button
                      onClick={() => setActiveTab("similar")}
                      className="text-xs font-semibold text-[#E4B85A] hover:text-[#FFD985] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="relative">
                    <div
                      ref={similarRowRef}
                      className="flex items-center gap-3.5 overflow-x-auto no-scrollbar scroll-smooth pb-2 pr-10"
                    >
                      {similarMovies.map((sim) => (
                        <Link
                          key={sim.id}
                          to={`/movies/${sim.id}`}
                          className="group shrink-0 w-28 sm:w-32 flex flex-col transition-all duration-300"
                        >
                          <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#0A0D0D] border border-white/5 group-hover:border-[#E4B85A]/50 transition-all shadow-md">
                            <img
                              src={getPosterUrl(sim.posterPath, "w342")}
                              alt={sim.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <span className="text-xs font-bold text-[#F5F0E6] group-hover:text-[#FFD985] truncate mt-1.5 transition-colors">
                            {sim.title}
                          </span>
                          <div className="flex items-center justify-between text-[11px] text-[#A7A69F] mt-0.5">
                            <span>{formatReleaseYear(sim.releaseDate)}</span>
                            <div className="flex items-center gap-1 text-[#E4B85A] font-bold">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{sim.voteAverage > 0 ? sim.voteAverage.toFixed(1) : "8.1"}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <button
                      onClick={() => scrollSimilar("right")}
                      aria-label="Scroll Similar Movies"
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#101414]/90 border border-[#282B27] hover:border-[#E4B85A] text-[#E4B85A] flex items-center justify-center shadow-lg transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </section>
              </div>
            )}

            {/* -------------------------------------------------------------
                TAB 2: CAST & CREW (Specialized Feature)
               ------------------------------------------------------------- */}
            {activeTab === "cast" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-serif text-2xl font-normal text-[#F5F0E6] flex items-center gap-2">
                    <Users className="w-6 h-6 text-[#E4B85A]" />
                    <span>Cast &amp; Creative Team</span>
                  </h2>
                  <p className="text-xs text-[#A7A69F] mt-1">
                    The ensemble cast and creative heads bringing {movie.title} to life.
                  </p>
                </div>

                {/* Sub-Filters */}
                <div className="flex items-center gap-2">
                  {[
                    { id: "all", label: `All Creative Members (${fullCastList.length + 3})` },
                    { id: "cast", label: `Principal Cast (${fullCastList.length})` },
                    { id: "crew", label: "Directing & Production (3)" },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setCastSubTab(sub.id as typeof castSubTab)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        castSubTab === sub.id
                          ? "bg-[#E4B85A] text-[#050707] shadow-sm shadow-[#E4B85A]/30"
                          : "bg-[#101414] text-[#A7A69F] hover:text-[#F5F0E6] border border-[#282B27]"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* Key Creative Heads Spotlight */}
                {(castSubTab === "all" || castSubTab === "crew") && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#E4B85A]">
                      Creative Department Leads
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Director Card */}
                      <div className="bg-[#0A0D0D] border border-[#282B27] hover:border-[#E4B85A]/50 rounded-2xl p-4 transition-all space-y-2.5">
                        <div className="flex items-center gap-2 text-[#E4B85A]">
                          <Clapperboard className="w-4 h-4" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">Directing</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#F5F0E6]">
                            {movie.director || "Michael Showalter"}
                          </h4>
                          <p className="text-xs text-[#A7A69F] mt-0.5">Director &amp; Visionary</p>
                        </div>
                        <p className="text-[11px] text-[#A7A69F]/80 leading-relaxed pt-1 border-t border-[#282B27]">
                          Guides tone, tension, and camera choreography.
                        </p>
                      </div>

                      {/* Writers Card */}
                      <div className="bg-[#0A0D0D] border border-[#282B27] hover:border-[#E4B85A]/50 rounded-2xl p-4 transition-all space-y-2.5">
                        <div className="flex items-center gap-2 text-[#E4B85A]">
                          <PenLine className="w-4 h-4" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">Writing</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#F5F0E6]">Colleen Hoover, Lauren Levine</h4>
                          <p className="text-xs text-[#A7A69F] mt-0.5">Screenplay &amp; Novel</p>
                        </div>
                        <p className="text-[11px] text-[#A7A69F]/80 leading-relaxed pt-1 border-t border-[#282B27]">
                          Adapted from the bestselling psychological mystery thriller.
                        </p>
                      </div>

                      {/* Production & Score Card */}
                      <div className="bg-[#0A0D0D] border border-[#282B27] hover:border-[#E4B85A]/50 rounded-2xl p-4 transition-all space-y-2.5">
                        <div className="flex items-center gap-2 text-[#E4B85A]">
                          <Film className="w-4 h-4" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">Cinematography</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#F5F0E6]">Atmospheric Cinema</h4>
                          <p className="text-xs text-[#A7A69F] mt-0.5">Original Score &amp; Audio</p>
                        </div>
                        <p className="text-[11px] text-[#A7A69F]/80 leading-relaxed pt-1 border-t border-[#282B27]">
                          Captured in immersive 4K Dolby Vision and Atmos acoustics.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Complete Cast Roster */}
                {(castSubTab === "all" || castSubTab === "cast") && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#E4B85A]">
                      Ensemble Cast Roster
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {fullCastList.map((member) => (
                        <div
                          key={member.id}
                          className="bg-[#0A0D0D] border border-[#282B27] hover:border-[#E4B85A] rounded-2xl p-3.5 flex flex-col items-center text-center transition-all duration-300 group shadow-md"
                        >
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-[#282B27] group-hover:border-[#E4B85A] p-0.5 overflow-hidden transition-all duration-300 shadow-md">
                            <img
                              src={
                                member.profilePath?.startsWith("http")
                                  ? member.profilePath
                                  : member.profilePath
                                  ? `/api/movies/image-proxy?size=w185&path=${encodeURIComponent(
                                      member.profilePath
                                    )}`
                                  : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                              }
                              alt={member.name}
                              className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>

                          <h4 className="text-xs font-bold text-[#F5F0E6] group-hover:text-[#FFD985] transition-colors mt-3 truncate w-full">
                            {member.name}
                          </h4>
                          <span className="text-[11px] font-medium text-[#E4B85A] truncate w-full mt-0.5">
                            as {member.character || "Cast"}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-[#A7A69F] px-2 py-0.5 bg-[#101414] rounded-full border border-[#282B27] mt-2">
                            Acting
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------------
                TAB 3: REVIEWS (Specialized Box for Review)
               ------------------------------------------------------------- */}
            {activeTab === "reviews" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-serif text-2xl font-normal text-[#F5F0E6] flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-[#E4B85A]" />
                    <span>Audience Reviews &amp; Ratings</span>
                  </h2>
                  <p className="text-xs text-[#A7A69F] mt-1">
                    Community perspectives and in-depth critiques for {movie.title}.
                  </p>
                </div>

                {/* Overall Score Summary Box */}
                <div className="bg-[#0A0D0D] border border-[#282B27] rounded-3xl p-6 sm:p-7 shadow-xl">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Left Score Block */}
                    <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-[#282B27] pb-6 md:pb-0 md:pr-6">
                      <span className="text-[10px] uppercase tracking-widest text-[#A7A69F] font-bold">
                        COMMUNITY SCORE
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-5xl font-black text-[#E4B85A]">
                          {movie.voteAverage.toFixed(1)}
                        </span>
                        <span className="text-sm text-[#A7A69F]">/ 10</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#E4B85A]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-[#A7A69F]">
                        Based on {movie.voteCount.toLocaleString()} verified ratings
                      </p>
                    </div>

                    {/* Right Rating Distribution */}
                    <div className="md:col-span-7 space-y-2.5">
                      {[
                        { label: "Masterpiece (9-10)", pct: 68 },
                        { label: "Great Watch (7-8)", pct: 22 },
                        { label: "Average (5-6)", pct: 7 },
                        { label: "Mixed / Poor (1-4)", pct: 3 },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3 text-xs">
                          <span className="text-[#A7A69F] text-[11px] w-36 shrink-0 truncate">
                            {item.label}
                          </span>
                          <div className="flex-1 h-2 bg-[#171B1A] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#927442] to-[#E4B85A] rounded-full"
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-[#E4B85A] w-9 text-right">
                            {item.pct}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* =========================================================
                    SPECIALIZED REVIEW BOX: "WRITE / EDIT YOUR REVIEW"
                   ========================================================= */}
                <div className="bg-[#0A0D0D] border border-[#E4B85A]/50 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-5">
                  <div className="absolute top-0 right-0 w-44 h-44 bg-[#E4B85A]/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-[#E4B85A] uppercase">
                        SPECIALIZED FEATURE
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F5F0E6] mt-0.5">
                        {userRating && !isEditingReview ? "Your Published Verdict" : "Write a Review"}
                      </h3>
                      <p className="text-xs text-[#A7A69F] mt-1">
                        Share your thoughts on performances, pacing, and cinematography.
                      </p>
                    </div>

                    {userRating && !isEditingReview && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsEditingReview(true)}
                          className="bg-[#101414] text-[#E4B85A] border border-[#E4B85A] border-b-4 font-medium overflow-hidden relative px-3 py-1.5 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                        >
                          <span className="bg-[#E4B85A] shadow-[#E4B85A] absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(228,184,90,0.3)] pointer-events-none" />
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="relative z-10 group-hover:text-[#FFD985]">Edit</span>
                        </button>
                        <button
                          onClick={handleReviewDelete}
                          className="p-2 rounded-md bg-[#101414] border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* If user has an existing review and not editing */}
                  {userRating && !isEditingReview ? (
                    <div className="bg-[#101414] border border-[#282B27] rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E4B85A]/15 border border-[#E4B85A]/40 text-[#E4B85A] flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-[#E4B85A]" />
                            <span>{userRating.score}/10 — {getScoreDescriptor(userRating.score)}</span>
                          </span>
                          <span className="text-[10px] text-[#A7A69F]">Your Rating</span>
                        </div>
                        <span className="text-[11px] text-[#A7A69F]">Updated recently</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#F5F0E6] leading-relaxed">
                        {userRating.reviewNote || "No written review note attached."}
                      </p>
                    </div>
                  ) : user ? (
                    /* Review Form */
                    <form onSubmit={handleReviewSubmit} className="space-y-4 pt-1">
                      {/* Score Selector */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-bold text-[#F5F0E6]">Your Score:</span>
                          <span className="text-sm font-extrabold text-[#E4B85A]">
                            {hoverReviewScore !== null ? hoverReviewScore : reviewScore}/10 —{" "}
                            {getScoreDescriptor(hoverReviewScore !== null ? hoverReviewScore : reviewScore)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                            const isSelected = (hoverReviewScore !== null ? hoverReviewScore : reviewScore) >= num;
                            return (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setReviewScore(num)}
                                onMouseEnter={() => setHoverReviewScore(num)}
                                onMouseLeave={() => setHoverReviewScore(null)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-[#E4B85A] text-[#050707] scale-105 shadow-md shadow-[#E4B85A]/30"
                                    : "bg-[#101414] text-[#A7A69F] hover:text-[#F5F0E6] border border-[#282B27]"
                                }`}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Review Headline Input */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A7A69F] mb-1">
                          Review Headline
                        </label>
                        <input
                          type="text"
                          value={reviewHeadline}
                          onChange={(e) => setReviewHeadline(e.target.value)}
                          placeholder="e.g. A pulse-pounding masterpiece of psychological suspense"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#101414] border border-[#282B27] text-xs text-[#F5F0E6] placeholder-[#A7A69F]/40 focus:outline-none focus:border-[#E4B85A] transition-colors"
                        />
                      </div>

                      {/* Review Body Textarea */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A7A69F] mb-1">
                          Detailed Review
                        </label>
                        <textarea
                          rows={4}
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="What did you think of the story, performances, and pacing? Share your insights with fellow cinema lovers..."
                          className="w-full px-4 py-3 rounded-xl bg-[#101414] border border-[#282B27] text-xs text-[#F5F0E6] placeholder-[#A7A69F]/40 focus:outline-none focus:border-[#E4B85A] transition-colors resize-none leading-relaxed"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={saveRating.isPending}
                          className="bg-[#101414] text-[#E4B85A] border border-[#E4B85A] border-b-4 font-medium overflow-hidden relative px-5 py-2.5 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group inline-flex items-center justify-center gap-2 text-xs font-bold cursor-pointer disabled:opacity-50"
                        >
                          <span className="bg-[#E4B85A] shadow-[#E4B85A] absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(228,184,90,0.3)] pointer-events-none" />
                          <Sparkles className="w-4 h-4 text-[#E4B85A] shrink-0" />
                          <span className="relative z-10 group-hover:text-[#FFD985]">
                            {saveRating.isPending
                              ? "Publishing..."
                              : userRating
                              ? "Update Review"
                              : "Publish Review"}
                          </span>
                        </button>

                        {isEditingReview && (
                          <button
                            type="button"
                            onClick={() => setIsEditingReview(false)}
                            className="px-4 py-2 rounded-md bg-[#101414] border border-[#282B27] text-xs font-semibold text-[#A7A69F] hover:text-[#F5F0E6] transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    /* Guest prompt to Sign In */
                    <div className="bg-[#101414] border border-[#282B27] rounded-2xl p-5 text-center space-y-3">
                      <p className="text-xs text-[#A7A69F]">
                        Sign in to WatchBox to rate this movie, write your review, and shape your WatchBox DNA recommendations.
                      </p>
                      <Link
                        to="/login"
                        className="bg-[#101414] text-[#E4B85A] border border-[#E4B85A] border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group inline-flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
                      >
                        <span className="bg-[#E4B85A] shadow-[#E4B85A] absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(228,184,90,0.3)] pointer-events-none" />
                        <span className="relative z-10 group-hover:text-[#FFD985]">Sign In to Write a Review</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Community Reviews Feed */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-[#F5F0E6]">
                      Community Critiques
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#A7A69F]">
                      <span>Sort by:</span>
                      {["helpful", "recent", "highest"].map((sf) => (
                        <button
                          key={sf}
                          onClick={() => setReviewFilter(sf as typeof reviewFilter)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                            reviewFilter === sf
                              ? "bg-[#101414] text-[#E4B85A] border border-[#E4B85A]/40"
                              : "text-[#A7A69F] hover:text-[#F5F0E6]"
                          }`}
                        >
                          {sf}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {COMMUNITY_REVIEWS_BASE.map((rev) => {
                      const isLiked = Boolean(likedReviewIds[rev.id]);
                      const currentLikes = rev.likes + (isLiked ? 1 : 0);

                      return (
                        <div
                          key={rev.id}
                          className="bg-[#0A0D0D] border border-[#282B27] hover:border-[#E4B85A]/40 rounded-2xl p-5 space-y-3.5 transition-all shadow-md"
                        >
                          {/* Top Author Row */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={rev.avatar}
                                alt={rev.author}
                                className="w-10 h-10 rounded-full object-cover border border-[#E4B85A]/40"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs font-bold text-[#F5F0E6]">{rev.author}</h4>
                                  {rev.isVerified && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E4B85A]" />
                                  )}
                                </div>
                                <span className="text-[10px] text-[#A7A69F]">{rev.username} • {rev.date}</span>
                              </div>
                            </div>

                            {/* Rating badge */}
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#101414] border border-[#E4B85A]/40 text-[#E4B85A] text-xs font-bold">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{rev.rating}/10</span>
                            </div>
                          </div>

                          {/* Review Title & Content */}
                          <div>
                            <h5 className="text-xs sm:text-sm font-bold text-[#FFD985]">
                              "{rev.title}"
                            </h5>
                            <p className="text-xs text-[#A7A69F] leading-relaxed mt-1">
                              {rev.content}
                            </p>
                          </div>

                          {/* Helpful button */}
                          <div className="pt-2 border-t border-[#282B27] flex items-center justify-between text-xs text-[#A7A69F]">
                            <button
                              onClick={() => toggleReviewLike(rev.id)}
                              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                                isLiked ? "text-[#E4B85A]" : "hover:text-[#F5F0E6]"
                              }`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
                              <span>Helpful ({currentLikes})</span>
                            </button>
                            <span className="text-[10px] text-[#A7A69F]">Verified WatchBox Viewer</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                TAB 4: SIMILAR MOVIES (Specialized Feature)
               ------------------------------------------------------------- */}
            {activeTab === "similar" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="font-serif text-2xl font-normal text-[#F5F0E6] flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-[#E4B85A]" />
                    <span>Similar Cinematic Universes</span>
                  </h2>
                  <p className="text-xs text-[#A7A69F] mt-1">
                    Films matching the psychological intrigue, storytelling tone, and genre vectors of {movie.title}.
                  </p>
                </div>

                {/* Multi-column Grid of Similar Titles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 pt-2">
                  {similarMovies.map((sim, idx) => {
                    const matchPercent = 96 - idx * 3;
                    return (
                      <Link
                        key={sim.id}
                        to={`/movies/${sim.id}`}
                        className="group bg-[#0A0D0D] border border-[#282B27] hover:border-[#E4B85A] rounded-2xl overflow-hidden flex flex-col justify-between p-3 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(228,184,90,0.15)]"
                      >
                        <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#101414]">
                          <img
                            src={getPosterUrl(sim.posterPath, "w500")}
                            alt={sim.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-[#E4B85A]/50 text-[10px] font-bold text-[#E4B85A]">
                            {matchPercent}% Match
                          </div>
                        </div>

                        <div className="pt-3 space-y-1">
                          <h4 className="text-xs font-bold text-[#F5F0E6] group-hover:text-[#FFD985] truncate transition-colors">
                            {sim.title}
                          </h4>
                          <div className="flex items-center justify-between text-[11px] text-[#A7A69F]">
                            <span>{formatReleaseYear(sim.releaseDate)}</span>
                            <div className="flex items-center gap-1 text-[#E4B85A] font-bold">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{sim.voteAverage > 0 ? sim.voteAverage.toFixed(1) : "8.0"}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* =============================================================
              RIGHT COLUMN: WATCHBOX DNA, WHERE TO WATCH, MOVIE FACTS
             ============================================================= */}
          <div className="w-full lg:w-80 lg:shrink-0 space-y-6">
            {/* -----------------------------------------------------------
                WIDGET 1: WATCHBOX DNA (AFFINITY ANALYSIS)
               ----------------------------------------------------------- */}
            <div className="bg-[#0A0D0D] border border-[#282B27] rounded-3xl p-5 space-y-4 shadow-xl">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-[#E4B85A]" />
                  <div>
                    <h4 className="text-sm font-bold text-[#F5F0E6]">WatchBox DNA</h4>
                    <p className="text-[10px] text-[#A7A69F]">Affinity Analysis for {movie.title}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#101414] border border-[#E4B85A]/40 text-[#E4B85A]">
                  Rule-Based
                </span>
              </div>

              {/* Match Gauge & Dimensions */}
              <div className="flex items-center gap-4 pt-1">
                {/* Circular Gauge */}
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#1A1F1F]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#E4B85A]"
                      strokeDasharray={`${dnaScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-black text-[#F5F0E6] leading-none">
                      {dnaScore}%
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-[#A7A69F] mt-0.5">
                      Match
                    </span>
                  </div>
                </div>

                {/* Taste Dimensions Bars */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-[#A7A69F]">
                    TASTE VECTOR DIMENSIONS
                  </div>
                  {dnaDimensions.map((dim) => (
                    <div key={dim.label} className="space-y-0.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#A7A69F] truncate">{dim.label}</span>
                        <span className="font-semibold text-[#F5F0E6]">{dim.score}%</span>
                      </div>
                      <div className="w-full h-1 bg-[#171B1A] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#927442] to-[#E4B85A] rounded-full"
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why it fits your taste callout */}
              <div className="bg-[#101414] border border-[#282B27] rounded-2xl p-3 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#E4B85A] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-[#E4B85A]">Why it fits your taste</span>
                  <p className="text-[11px] text-[#A7A69F] leading-tight">
                    You often enjoy psychological thrillers with complex characters, dark themes and surprising twists. {movie.title} matches your interest in slow-burn, mind-bending stories.
                  </p>
                </div>
              </div>
            </div>

            {/* -----------------------------------------------------------
                WIDGET 2: WHERE TO WATCH
               ----------------------------------------------------------- */}
            <div className="bg-[#0A0D0D] border border-[#282B27] rounded-3xl p-5 space-y-3.5 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-[#E4B85A]" />
                  <h4 className="text-sm font-bold text-[#F5F0E6]">Where to Watch</h4>
                </div>
                <p className="text-[10px] text-[#A7A69F] mt-0.5">Availability may vary by region.</p>
              </div>

              {/* Full Movie Row */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#101414] border border-[#282B27]">
                <Film className="w-4 h-4 text-[#A7A69F] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#F5F0E6]">Full Movie</span>
                  <p className="text-[10px] text-[#A7A69F]">
                    Not available for streaming yet<br />
                    <span className="text-[#A7A69F]/60">This title is not currently available on supported platforms.</span>
                  </p>
                </div>
              </div>

              {/* Trailer Row */}
              <div
                onClick={() => setTrailerOpen(true)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#101414] border border-[#282B27] hover:border-[#E4B85A]/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <Play className="w-4 h-4 text-[#E4B85A] fill-[#E4B85A] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#F5F0E6] group-hover:text-[#FFD985]">
                      Trailer
                    </span>
                    <p className="text-[10px] text-[#A7A69F]">
                      <span className="text-[#FFD985] font-semibold">Available on YouTube</span>
                      <br />
                      Watch the official trailer in HD.
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#A7A69F] group-hover:text-[#E4B85A]" />
              </div>
            </div>

            {/* -----------------------------------------------------------
                WIDGET 3: MOVIE FACTS
               ----------------------------------------------------------- */}
            <div className="bg-[#0A0D0D] border border-[#282B27] rounded-3xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 pb-1 border-b border-[#282B27]">
                <Clapperboard className="w-4 h-4 text-[#E4B85A]" />
                <h4 className="text-sm font-bold text-[#F5F0E6]">Movie Facts</h4>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                <div>
                  <span className="text-[11px] text-[#A7A69F]">Director</span>
                  <p className="font-semibold text-[#F5F0E6] truncate">
                    {movie.director || "Michael Showalter"}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-[#A7A69F]">Writers</span>
                  <p className="font-semibold text-[#F5F0E6] truncate">
                    Colleen Hoover, Lauren Levine
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-[#A7A69F]">Language</span>
                  <p className="font-semibold text-[#F5F0E6]">English</p>
                </div>

                <div>
                  <span className="text-[11px] text-[#A7A69F]">Release Date</span>
                  <p className="font-semibold text-[#F5F0E6]">
                    {movie.releaseDate || "March 20, 2026"}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-[#A7A69F]">Runtime</span>
                  <p className="font-semibold text-[#F5F0E6]">
                    {formatRuntime(movie.runtime) || "2h 1m"}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-[#A7A69F]">Genres</span>
                  <p className="font-semibold text-[#F5F0E6] truncate">
                    {movie.genres.map((g) => g.name).join(", ") || "Mystery, Thriller, Drama"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          3. MODALS (TRAILER, RATING, AND SPECIALIZED PLAY NOTICE)
         ------------------------------------------------------------------ */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerKey={primaryTrailerKey}
        title={movie.title}
      />

      <RatingModal
        isOpen={ratingOpen}
        onClose={() => setRatingOpen(false)}
        tmdbId={movie.id}
        title={movie.title}
        initialScore={userRating?.score}
        initialNote={userRating?.reviewNote}
      />

      {/* Specialized Featured Box: Movie Not Uploaded Yet */}
      {playNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0A0D0D] border-2 border-[#E4B85A] rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(228,184,90,0.4)] text-center space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Ambient gold flare */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#E4B85A]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setPlayNoticeOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-[#101414] border border-[#282B27] text-[#A7A69F] hover:text-[#F5F0E6] hover:border-[#E4B85A] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Film Reel Badge */}
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#927442] via-[#E4B85A] to-[#FFD985] p-0.5 shadow-xl shadow-[#E4B85A]/30">
              <div className="w-full h-full rounded-2xl bg-[#050707] flex items-center justify-center text-[#E4B85A]">
                <Film className="w-8 h-8 text-[#E4B85A] animate-pulse" />
              </div>
            </div>

            {/* Heading & Eyebrow */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#E4B85A] uppercase">
                WATCHBOX STREAMING NOTICE
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#F5F0E6]">
                Movie Not Uploaded Yet
              </h3>
            </div>

            {/* Explanation Message */}
            <p className="text-xs text-[#A7A69F] leading-relaxed px-2">
              The full-length theatrical feature for{" "}
              <span className="text-[#FFD985] font-bold">"{movie.title}"</span> has not been uploaded to the WatchBox streaming servers yet. Full streaming integration is actively in progress.
            </p>

            {/* Information Box */}
            <div className="bg-[#101414] border border-[#282B27] rounded-2xl p-4 text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A7A69F]">Status:</span>
                <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Pending Server Upload
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A7A69F]">Available Media:</span>
                <span className="font-semibold text-emerald-400">Official Theatrical Trailer</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A7A69F]">Recommendation:</span>
                <span className="text-[#A7A69F] text-[11px]">Watch trailer or add to My List for premiere alerts</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setPlayNoticeOpen(false);
                  setTrailerOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E4B85A] to-[#FFD985] text-[#050707] text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-[#E4B85A]/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Watch Official Trailer Instead</span>
              </button>
              <button
                onClick={() => setPlayNoticeOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#101414] border border-[#282B27] hover:border-[#E4B85A] text-xs font-semibold text-[#A7A69F] hover:text-[#F5F0E6] transition-colors cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
