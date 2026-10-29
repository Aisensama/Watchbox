import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  Play,
  History,
} from "lucide-react";
import {
  useTrendingMovies,
  usePopularMovies,
  useUpcomingMovies,
} from "../hooks/useMovies";
import { useHistory } from "../hooks/usePersonal";
import { HeroBanner } from "../components/HeroBanner";
import { MovieCarousel } from "../components/MovieCarousel";
import { TrailerModal } from "../components/TrailerModal";
import { apiClient } from "../api/client";
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

  const continueWatchingRef = useRef<HTMLDivElement>(null);

  // Queries for the layers
  const { data: trendingData, isLoading: isLoadingTrending } = useTrendingMovies(1);
  const { data: popularData, isLoading: isLoadingPopular } = usePopularMovies(1);
  const { data: upcomingData, isLoading: isLoadingUpcoming } = useUpcomingMovies(1);
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

  const scrollContinue = (direction: "left" | "right") => {
    if (continueWatchingRef.current) {
      const scrollAmount = direction === "left" ? -450 : 450;
      continueWatchingRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Genre filter tabs for Layer 1: Trending Movies
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

  const allTrendingMovies = trendingData?.results || [];
  const filteredTrendingMovies = trendingGenreTab
    ? allTrendingMovies.filter((m) => m.genreIds?.includes(trendingGenreTab))
    : allTrendingMovies;

  const hasHistory = Boolean(historyData?.history && historyData.history.length > 0);

  return (
    <div className="min-h-screen bg-[#050707] text-[#F5F0E6] pb-24 selection:bg-[#E4B85A] selection:text-[#050707] space-y-4">
      {/* ------------------------------------------------------------------
          1. HERO CAROUSEL BANNER (5-Card Vertical Carousel on Right)
         ------------------------------------------------------------------ */}
      <HeroBanner
        onPlayTrailer={handlePlayTrailer}
      />

      {/* ------------------------------------------------------------------
          CONTINUE WATCHING (Rendered only if watch history is available)
         ------------------------------------------------------------------ */}
      {hasHistory && (
        <section className="py-6 sm:py-8 space-y-4 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F0E6] flex items-center gap-2">
                <History className="w-5 h-5 text-[#E4B85A]" />
                <span>Continue Watching</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#A7A69F] mt-0.5">
                Pick up right where you left off
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <Link
                to="/profile"
                className="text-xs font-semibold text-[#E4B85A] hover:text-[#FFD985] flex items-center gap-1 transition-colors mr-1 cursor-pointer"
              >
                <span>View All History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => scrollContinue("left")}
                aria-label="Scroll left"
                className="p-2 rounded-full bg-[#101414] border border-[#282B27] text-[#A7A69F] hover:text-[#F5F0E6] hover:bg-[#171B1A] hover:border-[#E4B85A] transition-colors shadow-md"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContinue("right")}
                aria-label="Scroll right"
                className="p-2 rounded-full bg-[#101414] border border-[#282B27] text-[#A7A69F] hover:text-[#F5F0E6] hover:bg-[#171B1A] hover:border-[#E4B85A] transition-colors shadow-md"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={continueWatchingRef}
            className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2"
          >
            {historyData?.history.map((item) => {
              const title = item.movie?.title || `Movie #${item.tmdbId}`;
              const image = getBackdropUrl(
                item.movie?.backdropPath || item.movie?.posterPath,
                "w780"
              );

              return (
                <Link
                  key={item.id}
                  to={`/movies/${item.tmdbId}`}
                  className="group relative shrink-0 w-64 sm:w-72 aspect-[16/9] rounded-2xl overflow-hidden bg-[#0A0D0D] border border-[#282B27] hover:border-[#E4B85A] transition-all shadow-lg flex flex-col justify-end p-3.5"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#101414] flex items-center justify-center text-[#A7A69F] text-xs">
                      No Preview
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-black/60 border border-[#E4B85A] flex items-center justify-center text-[#E4B85A] group-hover:scale-110 group-hover:bg-[#E4B85A] group-hover:text-[#050707] transition-all shadow-lg">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>

                  <div className="relative z-10 space-y-1.5">
                    <h4 className="text-sm font-bold text-[#F5F0E6] group-hover:text-[#FFD985] truncate">
                      {title}
                    </h4>
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-[#927442] to-[#E4B85A] rounded-full" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------
          LAYER 1: TRENDING MOVIES (With Genre Filter Tabs)
         ------------------------------------------------------------------ */}
      <MovieCarousel
        title="Trending Movies"
        subtitle="Most popular cinema worldwide today"
        movies={filteredTrendingMovies}
        isLoading={isLoadingTrending}
        onPlayTrailer={handlePlayTrailer}
        genreFilterTabs={genreTabs}
        activeGenreTab={trendingGenreTab}
        onSelectGenreTab={setTrendingGenreTab}
        seeAllLink="/explore?tab=trending"
      />

      {/* ------------------------------------------------------------------
          LAYER 2: MOST WATCHED MOVIES
         ------------------------------------------------------------------ */}
      <MovieCarousel
        title="Most Watched Movies"
        subtitle="Top streamed and discussed films this month"
        movies={popularData?.results || []}
        isLoading={isLoadingPopular}
        onPlayTrailer={handlePlayTrailer}
        seeAllLink="/explore?tab=popular"
      />

      {/* ------------------------------------------------------------------
          LAYER 3: NEWLY RELEASED MOVIES
         ------------------------------------------------------------------ */}
      <MovieCarousel
        title="Newly Released Movies"
        subtitle="Fresh in theaters and streaming soon"
        movies={upcomingData?.results || []}
        isLoading={isLoadingUpcoming}
        onPlayTrailer={handlePlayTrailer}
        seeAllLink="/explore?tab=upcoming"
      />

      {/* ------------------------------------------------------------------
          TRAILER MODAL
         ------------------------------------------------------------------ */}
      <TrailerModal
        isOpen={trailerModalOpen}
        onClose={() => setTrailerModalOpen(false)}
        trailerKey={selectedTrailer?.key || null}
        title={selectedTrailer?.title || "Movie"}
      />
    </div>
  );
};
