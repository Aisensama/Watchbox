import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { useDiscoverMovies, useGenres } from "../hooks/useMovies";
import { MovieCard } from "../components/MovieCard";
import { TrailerModal } from "../components/TrailerModal";
import { apiClient } from "../api/client";

import type { MovieFilterQuery } from "@watchbox/shared";

type SortByOption = NonNullable<MovieFilterQuery["sortBy"]>;

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial params from URL
  const initialSearch = searchParams.get("search") || "";
  const initialGenre = searchParams.get("genre")
    ? Number(searchParams.get("genre"))
    : undefined;
  const initialYear = searchParams.get("year")
    ? Number(searchParams.get("year"))
    : undefined;
  const initialSortBy = (searchParams.get("sortBy") as SortByOption) || "popularity.desc";
  const initialPage = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const initialTab = searchParams.get("tab") || "all";

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState<number | undefined>(initialGenre);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(initialYear);
  const [sortBy, setSortBy] = useState<SortByOption>(initialSortBy);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [selectedTrailer, setSelectedTrailer] = useState<{
    id: number;
    title: string;
    key: string | null;
  } | null>(null);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);

  const { data: genresData } = useGenres();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Sync state to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedGenre) params.set("genre", String(selectedGenre));
    if (selectedYear) params.set("year", String(selectedYear));
    if (sortBy && sortBy !== "popularity.desc") params.set("sortBy", sortBy);
    if (currentPage > 1) params.set("page", String(currentPage));
    if (activeTab && activeTab !== "all") params.set("tab", activeTab);

    setSearchParams(params, { replace: true });
  }, [
    debouncedSearch,
    selectedGenre,
    selectedYear,
    sortBy,
    currentPage,
    activeTab,
    setSearchParams,
  ]);

  const { data, isLoading } = useDiscoverMovies({
    page: currentPage,
    genre: selectedGenre,
    year: selectedYear,
    sortBy,
    search: debouncedSearch || undefined,
  });

  const handleResetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setSelectedGenre(undefined);
    setSelectedYear(undefined);
    setSortBy("popularity.desc");
    setActiveTab("all");
    setCurrentPage(1);
  };

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

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 45 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 pt-24 pb-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Hero Banner Matching Screenshot 3 */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="text-xs font-bold tracking-widest text-rose-400 uppercase">
              EXPLORE CATALOG
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Discover Your Next{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400">
                Story
              </span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              From epic space odysseys to intimate human dramas, explore thousands of
              cinematic masterpieces curated for every mood and passion.
            </p>
          </div>
        </div>

        {/* Top Category Tabs (Screenshot 3) */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: "all", label: "All" },
              { id: "trending", label: "Trending" },
              { id: "popular", label: "Popular" },
              { id: "top-rated", label: "Top Rated" },
              { id: "upcoming", label: "Upcoming" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "trending") setSortBy("popularity.desc");
                  else if (tab.id === "top-rated") setSortBy("vote_average.desc");
                  else if (tab.id === "upcoming") setSortBy("primary_release_date.desc");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-rose-400" />
            <span>Filters</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by movie title or keyword..."
            className="w-full bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-100 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:border-rose-500 transition-colors shadow-inner"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Content Layout: Filters Sidebar + Movies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 items-start">
          {/* Left Sidebar Filter Panel (Screenshot 3) */}
          <div
            className={`space-y-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:block ${
              mobileFiltersOpen ? "block" : "hidden"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-slate-100">Filters</h3>
              </div>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-400 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Sort By Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortByOption);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="popularity.desc">Most Popular</option>
                <option value="vote_average.desc">Highest Rated</option>
                <option value="primary_release_date.desc">Newest Release</option>
                <option value="title.asc">Title (A-Z)</option>
              </select>
            </div>

            {/* Release Year Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Release Year
              </label>
              <select
                value={selectedYear || ""}
                onChange={(e) => {
                  setSelectedYear(e.target.value ? Number(e.target.value) : undefined);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="">Any Year</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Genre Pills */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Genre
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGenre(undefined);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedGenre === undefined
                      ? "bg-rose-500 text-white"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  All
                </button>
                {(genresData?.genres || []).map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => {
                      setSelectedGenre(selectedGenre === genre.id ? undefined : genre.id);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedGenre === genre.id
                        ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Movie Grid */}
          <div className="md:col-span-3 lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                {isLoading
                  ? "Loading movie catalog..."
                  : `Showing ${data?.results?.length || 0} movies (Page ${currentPage})`}
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[2/3] rounded-xl bg-slate-900 animate-pulse border border-slate-800"
                  />
                ))}
              </div>
            ) : data?.results && data.results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {data.results.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onPlayTrailer={handlePlayTrailer}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
                <p className="text-base font-semibold text-slate-200">No movies found</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search criteria, switching genres, or resetting your
                  filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-rose-300 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {data && data.results.length > 0 && (
              <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-800/80">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-xs font-semibold text-slate-400 px-3">
                  Page {currentPage} of {Math.min(data.totalPages || 1, 500)}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage >= (data.totalPages || 1)}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
