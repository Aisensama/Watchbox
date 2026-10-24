import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Play,
  Plus,
  Check,
  Star,
  Eye,
  Clock,
  ChevronRight,
  User as UserIcon,
} from "lucide-react";
import { useMovieDetails, useMovieVideos } from "../hooks/useMovies";
import {
  useWatchlist,
  useAddToWatchlist,
  useRemoveFromWatchlist,
  useRatings,
  useHistory,
  useRecordHistory,
} from "../hooks/usePersonal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  getBackdropUrl,
  getPosterUrl,
  formatRuntime,
  formatReleaseYear,
} from "../utils/tmdb";
import { TrailerModal } from "../components/TrailerModal";
import { RatingModal } from "../components/RatingModal";
import { WatchBoxDnaCard } from "../components/WatchBoxDnaCard";
import { SurfButton } from "../components/SurfButton";
import type { DnaRecommendation } from "@watchbox/shared";

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);

  const { user } = useAuth();
  const { showToast } = useToast();

  const [trailerOpen, setTrailerOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);

  const { data: movie, isLoading, error } = useMovieDetails(movieId);
  const { data: videoData } = useMovieVideos(movieId);

  const { data: watchlistData } = useWatchlist();
  const { data: ratingsData } = useRatings();
  const { data: historyData } = useHistory();

  const addWatchlist = useAddToWatchlist();
  const removeWatchlist = useRemoveFromWatchlist();
  const recordHistory = useRecordHistory();

  const inWatchlist = Boolean(
    watchlistData?.items.some((item) => item.tmdbId === movieId)
  );
  const isWatched = Boolean(historyData?.history.some((item) => item.tmdbId === movieId));
  const userRating = ratingsData?.ratings.find((r) => r.tmdbId === movieId);

  const handleWatchlistToggle = () => {
    if (!user) {
      showToast("Sign in to save movies to your watchlist", "info");
      return;
    }
    if (inWatchlist) {
      removeWatchlist.mutate(movieId);
    } else {
      addWatchlist.mutate(movieId);
    }
  };

  const handleHistoryToggle = () => {
    if (!user) {
      showToast("Sign in to track your watch history", "info");
      return;
    }
    recordHistory.mutate({ tmdbId: movieId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold">Loading movie presentation...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <p className="text-lg font-bold text-slate-100">Movie Not Found</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            The requested movie could not be retrieved from TMDB. Please verify the ID or
            your TMDB API connection.
          </p>
          <Link
            to="/explore"
            className="inline-block px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  // Construct DNA Recommendation representation for this movie
  const dnaRecommendation: DnaRecommendation = {
    movie,
    affinityScore: Math.min(98, Math.max(70, Math.round(movie.voteAverage * 10))),
    reasons: [
      `High audience acclaim with a ${movie.voteAverage.toFixed(1)}/10 rating`,
      movie.genres.length > 0
        ? `Rich thematic exploration across ${movie.genres.map((g) => g.name).join(", ")}`
        : "Compelling cinematic storytelling",
      movie.director
        ? `Directed by visionary filmmaker ${movie.director}`
        : "Curated cinema pick",
    ],
    dimensions: [
      {
        label: "Mind-Bending",
        score: movie.genres.some(
          (g) => g.name.includes("Sci-Fi") || g.name.includes("Mystery")
        )
          ? 95
          : 75,
      },
      {
        label: "Visual Spectacle",
        score: movie.genres.some(
          (g) => g.name.includes("Action") || g.name.includes("Adventure")
        )
          ? 94
          : 80,
      },
      {
        label: "Emotional Depth",
        score: movie.genres.some((g) => g.name.includes("Drama")) ? 92 : 72,
      },
      {
        label: "Pacing & Suspense",
        score: movie.genres.some((g) => g.name.includes("Thriller")) ? 90 : 82,
      },
      {
        label: "Critical Acclaim",
        score: Math.min(99, Math.round(movie.voteAverage * 10)),
      },
    ],
  };

  const primaryTrailerKey = videoData?.primaryTrailer?.key || null;

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 pb-20">
      {/* Backdrop Hero with Cinematic Vignettes */}
      <div className="relative w-full h-[380px] sm:h-[480px] md:h-[560px] overflow-hidden">
        <img
          src={getBackdropUrl(movie.backdropPath, "original")}
          alt={movie.title}
          className="w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10] via-[#0A0C10]/40 to-transparent" />
      </div>

      {/* Main Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 -mt-44 sm:-mt-56 z-10 space-y-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link to="/explore" className="hover:text-white transition-colors">
            Movies
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-200 font-medium truncate max-w-[200px] sm:max-w-md">
            {movie.title}
          </span>
        </div>

        {/* Top Header Card: Poster + Title + Actions */}
        <div className="neon-layout-border flex flex-col md:flex-row items-start gap-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {/* Poster */}
          <div className="w-40 sm:w-56 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
            <img
              src={getPosterUrl(movie.posterPath, "w500")}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Core Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-xs sm:text-sm italic text-slate-400 mt-1">
                  "{movie.tagline}"
                </p>
              )}
            </div>

            {/* Badges / Metrics Row */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 flex-wrap">
              <span className="font-semibold text-white">
                {formatReleaseYear(movie.releaseDate)}
              </span>
              {movie.runtime && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="flex items-center gap-1 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </span>
                </>
              )}
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{movie.voteAverage.toFixed(1)}/10</span>
                <span className="text-slate-400 text-xs font-normal">
                  ({movie.voteCount.toLocaleString()} votes)
                </span>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((g) => (
                <Link
                  key={g.id}
                  to={`/explore?genre=${g.id}`}
                  className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 hover:border-rose-500/50 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {g.name}
                </Link>
              ))}
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-4 pt-3 flex-wrap">
              <SurfButton
                onClick={() => setTrailerOpen(true)}
                icon={<Play className="w-4 h-4 fill-current" />}
                hoverText="PLAY TRAILER"
                size="md"
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
                hoverText={inWatchlist ? "IN WATCHLIST" : "ADD TO LIST"}
                gradientVariant="orange-red"
                size="md"
              >
                {inWatchlist ? "In Watchlist" : "Add to My List"}
              </SurfButton>

              <SurfButton
                onClick={handleHistoryToggle}
                icon={<Eye className="w-4 h-4" />}
                hoverText={isWatched ? "WATCHED" : "MARK WATCHED"}
                size="md"
              >
                {isWatched ? "Watched" : "Mark Watched"}
              </SurfButton>

              <SurfButton
                onClick={() => {
                  if (!user) {
                    showToast("Sign in to rate movies", "info");
                    return;
                  }
                  setRatingOpen(true);
                }}
                icon={
                  <Star
                    className={`w-4 h-4 ${
                      userRating ? "fill-amber-400 text-amber-400" : "text-amber-500"
                    }`}
                  />
                }
                hoverText={userRating ? `RATED ${userRating.score}/10` : "RATE MOVIE"}
                size="md"
                gradientVariant="orange-red"
              >
                {userRating ? `Rated: ${userRating.score}/10` : "Rate Movie"}
              </SurfButton>
            </div>
          </div>
        </div>

        {/* Two-Column Layout: Overview & Cast (Left) + DNA & Details (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Synopsis, Trailer Preview, Cast */}
          <div className="lg:col-span-2 space-y-8">
            {/* Synopsis */}
            <div className="neon-layout-border bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3">
              <h3 className="text-lg font-bold text-white">Synopsis</h3>
              <p
                className={`text-sm text-slate-300 leading-relaxed ${
                  showFullSynopsis ? "" : "line-clamp-4"
                }`}
              >
                {movie.overview || "No detailed synopsis available for this title."}
              </p>
              {movie.overview && movie.overview.length > 250 && (
                <button
                  onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300"
                >
                  {showFullSynopsis ? "Show Less" : "Show More..."}
                </button>
              )}
            </div>

            {/* Official Trailer Preview Card (Screenshot 4) */}
            <div className="neon-layout-border bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Official Trailer Preview</span>
              </h3>
              <div
                onClick={() => setTrailerOpen(true)}
                className="group relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer shadow-xl"
              >
                <img
                  src={getBackdropUrl(movie.backdropPath, "w1280")}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-rose-600/90 group-hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl shadow-rose-600/50 group-hover:scale-110 transition-all">
                    <Play className="w-7 h-7 fill-white translate-x-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white drop-shadow-md">
                  <span className="font-bold">{movie.title} — Official Trailer</span>
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md">
                    HD
                  </span>
                </div>
              </div>
            </div>

            {/* Cast & Crew Avatars (Screenshot 4) */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
                <h3 className="text-lg font-bold text-white">Top Cast & Crew</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {movie.cast.slice(0, 8).map((actor) => (
                    <div
                      key={actor.id}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80"
                    >
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                        {actor.profilePath ? (
                          <img
                            src={getPosterUrl(actor.profilePath, "w342")}
                            alt={actor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <UserIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">
                          {actor.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {actor.character}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: WatchBox DNA Breakdown & Movie Specs */}
          <div className="space-y-8">
            {/* WatchBox DNA Card */}
            <WatchBoxDnaCard recommendation={dnaRecommendation} />

            {/* Production Details Metadata Card */}
            <div className="neon-layout-border bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider text-xs">
                Production Details
              </h4>
              <div className="space-y-3 text-xs">
                {movie.director && (
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Director</span>
                    <span className="font-semibold text-slate-200">{movie.director}</span>
                  </div>
                )}
                {movie.status && (
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Status</span>
                    <span className="font-semibold text-slate-200">{movie.status}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Release Date</span>
                  <span className="font-semibold text-slate-200">
                    {movie.releaseDate || "N/A"}
                  </span>
                </div>
                {movie.runtime && (
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Runtime</span>
                    <span className="font-semibold text-slate-200">
                      {formatRuntime(movie.runtime)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">TMDB ID</span>
                  <span className="font-mono text-slate-400">{movie.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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
    </div>
  );
};
