import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Dna, Sparkles, AlertTriangle, ArrowRight, Eye, Star } from "lucide-react";
import {
  useTrendingMovies,
  usePopularMovies,
  useTopRatedMovies,
  useDnaRecommendations,
} from "../hooks/useMovies";
import { useCuratedCollections, useHistory } from "../hooks/usePersonal";
import { HeroBanner } from "../components/HeroBanner";
import { MovieCarousel } from "../components/MovieCarousel";
import { TrailerModal } from "../components/TrailerModal";
import { apiClient } from "../api/client";
import { useQuery } from "@tanstack/react-query";
import { getBackdropUrl } from "../utils/tmdb";

interface HomePageProps {
  onOpenAuthModal?: (mode: "login" | "register") => void;
}

export const HomePage: React.FC<HomePageProps> = () => {
  const [selectedTrailer, setSelectedTrailer] = useState<{
    id: number;
    title: string;
    key: string | null;
  } | null>(null);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [trendingGenreTab, setTrendingGenreTab] = useState<number | null>(null);

  // Check TMDB configuration status
  const { data: statusData } = useQuery({
    queryKey: ["movies", "status"],
    queryFn: () => apiClient<{ configured: boolean }>("/movies/status"),
  });

  const isTmdbReady = statusData?.configured ?? true;

  const { data: trendingData, isLoading: isLoadingTrending } = useTrendingMovies(1);
  const { data: popularData, isLoading: isLoadingPopular } = usePopularMovies(1);
  const { data: topRatedData, isLoading: isLoadingTopRated } = useTopRatedMovies(1);
  const { data: dnaData } = useDnaRecommendations();
  const { data: collectionsData } = useCuratedCollections(true);
  const { data: historyData } = useHistory();

  const handlePlayTrailer = async (tmdbId: number, title: string) => {
    try {
      const data = await apiClient<{ primaryTrailer: { key: string } | null }>(
        `/movies/${tmdbId}/videos`
      );
      setSelectedTrailer({
        id: tmdbId,
        title,
        key: data.primaryTrailer?.key || null,
      });
    } catch {
      setSelectedTrailer({ id: tmdbId, title, key: null });
    }
    setTrailerModalOpen(true);
  };

  // Filter trending movies by active genre pill if selected
  const allTrendingMovies = trendingData?.results || [];
  const filteredTrendingMovies = trendingGenreTab
    ? allTrendingMovies.filter((m) => m.genreIds?.includes(trendingGenreTab))
    : allTrendingMovies;

  const genreTabs = [
    { id: null, label: "All" },
    { id: 878, label: "Sci-Fi" },
    { id: 28, label: "Action" },
    { id: 18, label: "Drama" },
    { id: 35, label: "Comedy" },
    { id: 53, label: "Thriller" },
    { id: 14, label: "Fantasy" },
    { id: 27, label: "Horror" },
  ];

  return (
    <div className="min-h-screen bg-[#050707] text-[#F5F0E6] pb-16">
      {/* TMDB Unconfigured Diagnostic Banner */}
      {!isTmdbReady && (
        <div className="bg-amber-950/60 border-b border-amber-600/40 px-4 py-3 text-xs text-amber-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Action Needed:</strong> Live movie discovery requires a TMDB
                credential. Add{" "}
                <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono">
                  TMDB_API_KEY
                </code>{" "}
                in <code className="font-mono">server/.env</code> to unlock the full movie
                catalog.
              </span>
            </div>
            <a
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline hover:text-white"
            >
              Get Free TMDB Key →
            </a>
          </div>
        </div>
      )}

      {/* Hero Banner with Trending Movies or Skeleton */}
      {allTrendingMovies.length > 0 ? (
        <HeroBanner
          movies={allTrendingMovies.slice(0, 5)}
          onPlayTrailer={handlePlayTrailer}
        />
      ) : isLoadingTrending ? (
        <div className="relative w-full min-h-[460px] md:min-h-[560px] flex items-end pb-12 pt-24 bg-[#0A0D0D] border-b border-[#282B27] animate-pulse">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full space-y-4">
            <div className="w-28 h-6 rounded-full bg-[#171B1A]" />
            <div className="w-80 h-10 rounded-xl bg-[#171B1A]" />
            <div className="w-96 h-4 rounded bg-[#171B1A]" />
            <div className="flex gap-3 pt-2">
              <div className="w-32 h-10 rounded-xl bg-[#171B1A]" />
              <div className="w-32 h-10 rounded-xl bg-[#171B1A]" />
            </div>
          </div>
        </div>
      ) : null}

      {/* Continue Watching / History Row (if logged in and has watched movies) */}
      {historyData?.history && historyData.history.length > 0 && (
        <section className="py-6 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-100">
                Continue Watching / History
              </h2>
            </div>
            <Link
              to="/history"
              className="text-xs font-semibold text-rose-400 hover:text-rose-300"
            >
              View All History →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {historyData.history.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                to={`/movies/${item.tmdbId}`}
                className="neon-layout-border group relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all"
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-slate-950">
                  <img
                    src={getBackdropUrl(item.movie?.backdropPath, "w780")}
                    alt={item.movie?.title || "Movie"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-emerald-400">
                    {item.movie?.title || `Movie #${item.tmdbId}`}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Watched {new Date(item.watchedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-full h-1 bg-slate-800">
                  <div className="w-full h-full bg-emerald-500" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trending Now Carousel with Category Pills */}
      <MovieCarousel
        title="Trending Now"
        subtitle="Most popular cinema worldwide today"
        movies={filteredTrendingMovies}
        isLoading={isLoadingTrending}
        onPlayTrailer={handlePlayTrailer}
        genreFilterTabs={genreTabs}
        activeGenreTab={trendingGenreTab}
        onSelectGenreTab={(id) => setTrendingGenreTab(id)}
      />

      {/* WatchBox DNA — Picks For You Section (Neon Gold Effect) */}
      <section className="py-8 sm:py-10 bg-[#0A0D0D] border-y border-[#282B27]/80 my-4 relative overflow-hidden">
        {/* Ambient neon gold glow background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E4B85A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#927442]/30 via-[#E4B85A]/20 to-[#FFD985]/10 border border-[#E4B85A]/40 shadow-lg shadow-[#E4B85A]/15 text-[#FFD985]">
                <Dna className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F0E6] flex items-center gap-2">
                  <span>WatchBox DNA</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E4B85A]/15 text-[#FFD985] border border-[#E4B85A]/40 shadow-sm shadow-[#E4B85A]/10">
                    Picks For You
                  </span>
                </h2>
                <p className="text-xs text-[#A7A69F] mt-0.5">
                  {dnaData?.summary ||
                    "Deterministic taste matching powered by genre vectors, history, and your movie ratings."}
                </p>
              </div>
            </div>

            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E4B85A] hover:text-[#FFD985] transition-colors group"
            >
              <span>See Taste Calibrations</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* DNA Recommended Movie Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(dnaData?.recommendations || []).slice(0, 5).map((rec) => (
              <div
                key={rec.movie.id}
                className="neon-layout-border group relative flex flex-col rounded-2xl overflow-hidden bg-[#101414] border border-[#282B27] hover:border-[#E4B85A]/60 hover:shadow-xl hover:shadow-[#E4B85A]/10 hover:-translate-y-1 transition-all duration-300"
              >
                <Link
                  to={`/movies/${rec.movie.id}`}
                  className="block relative aspect-[2/3] w-full overflow-hidden bg-[#0A0D0D]"
                >
                  <img
                    src={getBackdropUrl(rec.movie.posterPath, "w780")}
                    alt={rec.movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Affinity Score Pill */}
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[#050707]/90 border border-[#E4B85A]/60 text-[#FFD985] font-extrabold text-xs shadow-lg flex items-center gap-1 shadow-black/60">
                    <Sparkles className="w-3 h-3 text-[#E4B85A]" />
                    <span>{rec.affinityScore}%</span>
                  </div>
                </Link>

                <div className="p-3.5 flex flex-col justify-between flex-1 bg-[#101414]">
                  <div>
                    <Link
                      to={`/movies/${rec.movie.id}`}
                      className="text-xs sm:text-sm font-bold text-[#F5F0E6] hover:text-[#FFD985] transition-colors line-clamp-1"
                    >
                      {rec.movie.title}
                    </Link>
                    <p className="text-[11px] text-[#A7A69F] line-clamp-1 mt-1">
                      {rec.reasons[0] || "High affinity match"}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#282B27] flex items-center justify-between text-[11px] text-[#A7A69F]">
                    <div className="flex items-center gap-1 text-[#E4B85A] font-bold">
                      <Star className="w-3.5 h-3.5 fill-[#E4B85A] text-[#E4B85A]" />
                      <span>{rec.movie.voteAverage.toFixed(1)}</span>
                    </div>
                    <button
                      onClick={() => handlePlayTrailer(rec.movie.id, rec.movie.title)}
                      className="text-[#E4B85A] hover:text-[#FFD985] font-semibold transition-colors flex items-center gap-0.5"
                    >
                      Trailer →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Movies Carousel */}
      <MovieCarousel
        title="Popular Across All Audiences"
        subtitle="Top streamed and discussed films this month"
        movies={popularData?.results || []}
        isLoading={isLoadingPopular}
        onPlayTrailer={handlePlayTrailer}
      />

      {/* Featured Curated Collections (from MongoDB Admin) */}
      {collectionsData?.collections && collectionsData.collections.length > 0 && (
        <section className="py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              Curated Cinema Collections
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Hand-picked selections crafted by WatchBox curators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collectionsData.collections.slice(0, 3).map((col) => (
              <div
                key={col.id}
                className="neon-layout-border group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all p-5 flex flex-col justify-between"
              >
                {col.coverImage && (
                  <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity">
                    <img
                      src={col.coverImage}
                      alt={col.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                  </div>
                )}
                <div className="relative z-10 space-y-2">
                  <span className="text-[10px] font-bold tracking-widest text-rose-400 uppercase">
                    FEATURED COLLECTION
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                    {col.title}
                  </h3>
                  <p className="text-xs text-slate-300/80 line-clamp-2">
                    {col.description}
                  </p>
                </div>

                <div className="relative z-10 mt-6 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {col.tmdbMovieIds.length} titles included
                  </span>
                  <Link
                    to={`/explore?collection=${col.slug}`}
                    className="font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <span>Browse Collection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top Rated Masterpieces Carousel */}
      <MovieCarousel
        title="Top Rated Masterpieces"
        subtitle="Highest rated movies in cinematic history"
        movies={topRatedData?.results || []}
        isLoading={isLoadingTopRated}
        onPlayTrailer={handlePlayTrailer}
      />

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerModalOpen}
        onClose={() => setTrailerModalOpen(false)}
        trailerKey={selectedTrailer?.key || null}
        title={selectedTrailer?.title || "Movie"}
      />
    </div>
  );
};
