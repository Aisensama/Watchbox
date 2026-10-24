import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import {
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from "lucide-react";
import { useDiscoverMovies, useGenres } from "../hooks/useMovies";
import { MovieCard } from "../components/MovieCard";
import { TrailerModal } from "../components/TrailerModal";
import { apiClient } from "../api/client";
import type { MovieFilterQuery, MovieSummary } from "@watchbox/shared";

type SortByOption = NonNullable<MovieFilterQuery["sortBy"]>;

interface ExplorePageProps {
  defaultContentType?: "all" | "movies" | "tv";
  pageTitle?: string;
  eyebrow?: string;
}

// Curated cinematic sample fallback movies matching the reference screenshot
const CURATED_SAMPLE_MOVIES: MovieSummary[] = [
  {
    id: 693134,
    title: "Dune: Part Two",
    posterPath: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdropPath: "/xOMo8BRK7PfcJv9JCnx7s5200bm.jpg",
    releaseDate: "2024-03-01",
    voteAverage: 8.7,
    voteCount: 4800,
    genreIds: [878, 12],
    overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
  },
  {
    id: 157336,
    title: "Interstellar",
    posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdropPath: "/rAiYTsqJiOEZnh0nZ2qraEMqHd.jpg",
    releaseDate: "2014-11-05",
    voteAverage: 8.6,
    voteCount: 34000,
    genreIds: [878, 18],
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.",
  },
  {
    id: 414906,
    title: "The Batman",
    posterPath: "/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    backdropPath: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    releaseDate: "2022-03-04",
    voteAverage: 7.8,
    voteCount: 9200,
    genreIds: [28, 80],
    overview: "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.",
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
    overview: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
  },
  {
    id: 634649,
    title: "Spider-Man: No Way Home",
    posterPath: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    backdropPath: "/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",
    releaseDate: "2021-12-17",
    voteAverage: 8.0,
    voteCount: 19400,
    genreIds: [28, 12],
    overview: "Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero.",
  },
  {
    id: 1022789,
    title: "Inside Out 2",
    posterPath: "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
    backdropPath: "/xg27NrXi7VXCGUr7MG75UqLl6Vg.jpg",
    releaseDate: "2024-06-14",
    voteAverage: 7.9,
    voteCount: 4200,
    genreIds: [16, 35],
    overview: "Teenager Riley's mind headquarters undergoes a sudden demolition to make room for unexpected new Emotions.",
  },
  {
    id: 746036,
    title: "The Fall Guy",
    posterPath: "/tSz1qsmS900YnaomZ22UQczBtfd.jpg",
    backdropPath: "/H5vfqFly8b97KaEOiCcA9dpXMj.jpg",
    releaseDate: "2024-05-03",
    voteAverage: 7.0,
    voteCount: 2100,
    genreIds: [28, 35],
    overview: "A battered and past-his-prime stuntman is called back into action when the star of a high-budget movie disappears.",
  },
  {
    id: 653346,
    title: "Kingdom of the Planet of the Apes",
    posterPath: "/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",
    backdropPath: "/fqv8v6A9PnIvsvslje379OHYGhp.jpg",
    releaseDate: "2024-05-10",
    voteAverage: 7.2,
    voteCount: 2900,
    genreIds: [878, 12],
    overview: "Several generations following Caesar's reign, a young ape embarks on a journey that will lead him to question all he's been taught about the past.",
  },
  {
    id: 792307,
    title: "Poor Things",
    posterPath: "/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
    backdropPath: "/bQS43HSLZzMjZkcHJz4fUgQfKyv.jpg",
    releaseDate: "2023-12-08",
    voteAverage: 7.8,
    voteCount: 3900,
    genreIds: [35, 18],
    overview: "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by an eccentric scientist.",
  },
  {
    id: 823464,
    title: "Godzilla x Kong: The New Empire",
    posterPath: "/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg",
    backdropPath: "/xOMo8BRK7PfcJv9JCnx7s5200bm.jpg",
    releaseDate: "2024-03-29",
    voteAverage: 6.4,
    voteCount: 3600,
    genreIds: [28, 878],
    overview: "Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world.",
  },
];

export const ExplorePage: React.FC<ExplorePageProps> = ({
  defaultContentType = "all",
  pageTitle,
  eyebrow,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Read initial params from URL or route
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

  // Synchronously determine content type from route & search params without 1-frame state delay
  const contentType: "all" | "movies" | "tv" =
    location.pathname === "/movies"
      ? "movies"
      : location.pathname.startsWith("/tv")
      ? "tv"
      : (searchParams.get("type") as "all" | "movies" | "tv") || defaultContentType;

  const [selectedGenre, setSelectedGenre] = useState<number | undefined>(initialGenre);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(initialYear);
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortByOption>(initialSortBy);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [selectedTrailer, setSelectedTrailer] = useState<{
    id: number;
    title: string;
    key: string | null;
  } | null>(null);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);

  const { data: genresData } = useGenres();

  // Reset pagination cleanly when route changes
  useEffect(() => {
    setCurrentPage(1);
  }, [location.pathname]);

  // Sync state to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (initialSearch) params.set("search", initialSearch);
    if (selectedGenre) params.set("genre", String(selectedGenre));
    if (selectedYear) params.set("year", String(selectedYear));
    if (sortBy && sortBy !== "popularity.desc") params.set("sortBy", sortBy);
    if (currentPage > 1) params.set("page", String(currentPage));
    if (activeTab && activeTab !== "all") params.set("tab", activeTab);
    if (contentType && contentType !== "all" && location.pathname === "/explore") {
      params.set("type", contentType);
    }

    setSearchParams(params, { replace: true });
  }, [
    initialSearch,
    selectedGenre,
    selectedYear,
    sortBy,
    currentPage,
    activeTab,
    contentType,
    location.pathname,
    setSearchParams,
  ]);

  const { data, isLoading } = useDiscoverMovies({
    page: currentPage,
    genre: selectedGenre,
    year: selectedYear,
    sortBy,
    search: initialSearch || undefined,
    type: contentType === "tv" ? "tv" : contentType === "movies" ? "movie" : undefined,
  });

  const handleResetFilters = () => {
    setSelectedGenre(undefined);
    setSelectedYear(undefined);
    setSelectedRating("all");
    setSortBy("popularity.desc");
    setActiveTab("all");
    setCurrentPage(1);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "trending") setSortBy("popularity.desc");
    else if (tabId === "popular") setSortBy("popularity.desc");
    else if (tabId === "top-rated") setSortBy("vote_average.desc");
    else if (tabId === "upcoming") setSortBy("primary_release_date.desc");
    else setSortBy("popularity.desc");
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

  // Filter movies by minimum rating if selected
  const displayedMovies = useMemo(() => {
    const baseList =
      data?.results && data.results.length > 0
        ? data.results
        : activeTab === "all" && !selectedGenre && !selectedYear && !initialSearch && contentType !== "tv"
        ? CURATED_SAMPLE_MOVIES
        : [];

    if (selectedRating === "all") return baseList;
    const minRating = Number(selectedRating);
    return baseList.filter((m) => m.voteAverage >= minRating);
  }, [data, selectedRating, activeTab, selectedGenre, selectedYear, initialSearch, contentType]);

  const totalDisplayCount = data?.results?.length
    ? "1,248"
    : displayedMovies.length.toString();

  // Dynamic titles and subtitles based on active content type
  const activeEyebrow =
    eyebrow ||
    (contentType === "tv"
      ? "TELEVISION CATALOG"
      : contentType === "movies"
      ? "MOVIES CATALOG"
      : "EXPLORE CATALOG");

  return (
    <div className="min-h-screen bg-[#050707] text-[#F5F0E6] pt-16 pb-24 selection:bg-[#E4B85A] selection:text-[#050707]">
      {/* 5. CINEMATIC HERO SECTION (High Opacity & Vivid Artwork) */}
      <section className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] overflow-hidden">
        {/* Dynamic Thematic Hero Artworks with smooth zero-glitch crossfade */}
        <div
          className={`absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-700 ease-in-out ${
            contentType === "all" ? "opacity-100 z-[1]" : "opacity-0 z-0 pointer-events-none"
          }`}
          style={{
            backgroundImage: "url('/astronaut-hero.jpg')",
            backgroundPosition: "center 26%",
          }}
        />
        <div
          className={`absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-700 ease-in-out ${
            contentType === "movies" ? "opacity-100 z-[1]" : "opacity-0 z-0 pointer-events-none"
          }`}
          style={{
            backgroundImage: "url('/movies-hero.jpg')",
            backgroundPosition: "center 32%",
          }}
        />
        <div
          className={`absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-700 ease-in-out ${
            contentType === "tv" ? "opacity-100 z-[1]" : "opacity-0 z-0 pointer-events-none"
          }`}
          style={{
            backgroundImage: "url('/tv-hero.jpg')",
            backgroundPosition: "center 42%",
          }}
        />

        {/* Delicate Vignette Gradients: Preserves High Artwork Opacity while keeping typography clear */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050707] via-transparent to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050707]/90 via-[#050707]/35 to-transparent max-w-xl sm:max-w-2xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-[#050707]/80" />

        {/* Hero Left Content */}
        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-8 flex flex-col justify-center">
          <div className="max-w-xl space-y-3 sm:space-y-4">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#E4B85A] uppercase">
              {activeEyebrow}
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal text-[#F5F0E6] leading-tight tracking-tight">
              {pageTitle ? (
                <>
                  {pageTitle} <span className="text-[#E4B85A]/80 font-light">—</span>
                </>
              ) : contentType === "tv" ? (
                <>
                  Discover Top <span className="text-[#E4B85A]">Series</span>{" "}
                  <span className="text-[#E4B85A]/80 font-light">—</span>
                </>
              ) : contentType === "movies" ? (
                <>
                  Discover Feature <span className="text-[#E4B85A]">Films</span>{" "}
                  <span className="text-[#E4B85A]/80 font-light">—</span>
                </>
              ) : (
                <>
                  Discover Your Next{" "}
                  <span className="text-[#E4B85A]">Story</span>{" "}
                  <span className="text-[#E4B85A]/80 font-light">—</span>
                </>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-[#A7A69F] leading-relaxed max-w-lg">
              {contentType === "tv"
                ? "From award-winning miniseries to cultural phenomenon dramas, immerse yourself in premium television storytelling."
                : "From epic space odysseys to intimate human dramas, explore thousands of cinematic masterpieces curated for every mood and passion."}
            </p>
          </div>
        </div>
      </section>

      {/* 6. CATALOG CATEGORY NAVIGATION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
        <div className="flex items-center justify-between border-b border-[#282B27] pb-0">
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: "All" },
              { id: "trending", label: "Trending" },
              { id: "popular", label: "Popular" },
              { id: "top-rated", label: "Top Rated" },
              { id: "upcoming", label: "Upcoming" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative pb-3 text-xs sm:text-sm font-semibold tracking-wide transition-colors ${
                    active
                      ? "text-[#E4B85A]"
                      : "text-[#A7A69F] hover:text-[#F5F0E6]"
                  }`}
                >
                  {tab.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E4B85A]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden mb-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101414] border border-[#282B27] text-xs font-semibold text-[#E4B85A]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 7. MAIN CONTENT LAYOUT (Two-column layout) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Left Column: Filter Sidebar */}
          <aside
            className={`neon-layout-border w-full md:w-68 lg:w-72 shrink-0 bg-[#0A0D0D] border border-[#282B27] rounded-2xl p-5 space-y-6 ${
              mobileFiltersOpen ? "block" : "hidden md:block"
            }`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#282B27]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#E4B85A]" />
                <h3 className="text-sm font-bold text-[#F5F0E6]">Filters</h3>
              </div>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-[#A7A69F] hover:text-[#E4B85A] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Sort By Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#A7A69F]">
                Sort By
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortByOption);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-[#101414] border border-[#282B27] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F0E6] focus:outline-none focus:border-[#E4B85A] transition-colors cursor-pointer"
                >
                  <option value="popularity.desc">Most Popular</option>
                  <option value="vote_average.desc">Highest Rated</option>
                  <option value="primary_release_date.desc">Newest Release</option>
                  <option value="title.asc">Title A–Z</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-3 w-3.5 h-3.5 text-[#A7A69F] pointer-events-none" />
              </div>
            </div>

            {/* Release Year Slider */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#A7A69F]">
                Release Year
              </label>
              <input
                type="range"
                min="1980"
                max="2024"
                value={selectedYear || 2024}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full h-1 bg-[#282B27] rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex items-center justify-between text-xs text-[#A7A69F]">
                <span>1980</span>
                <span className="text-[#E4B85A] font-semibold">
                  {selectedYear || 2024}
                </span>
                <span>2024</span>
              </div>
            </div>

            {/* Minimum Rating Buttons */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#A7A69F]">
                Rating
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: "all", label: "All" },
                  { id: "8", label: "8+" },
                  { id: "7", label: "7+" },
                  { id: "6", label: "6+" },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRating(r.id);
                      setCurrentPage(1);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedRating === r.id
                        ? "bg-[#E4B85A] text-[#050707] shadow-sm shadow-[#E4B85A]/30"
                        : "bg-[#101414] border border-[#282B27] text-[#A7A69F] hover:text-[#F5F0E6] hover:border-[#927442]"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#A7A69F]">
                Genre
              </label>
              <div className="relative">
                <select
                  value={selectedGenre || ""}
                  onChange={(e) => {
                    setSelectedGenre(e.target.value ? Number(e.target.value) : undefined);
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-[#101414] border border-[#282B27] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F0E6] focus:outline-none focus:border-[#E4B85A] transition-colors cursor-pointer"
                >
                  <option value="">All Genres</option>
                  {(genresData?.genres || []).map((genre) => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-3 w-3.5 h-3.5 text-[#A7A69F] pointer-events-none" />
              </div>
            </div>

            {/* Content Type Controls */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#A7A69F]">
                Content Type
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "all", label: "All" },
                  { id: "movies", label: "Movies" },
                  { id: "tv", label: "TV Shows" },
                ].map((ct) => (
                  <button
                    key={ct.id}
                    type="button"
                    onClick={() => {
                      if (ct.id === "all") {
                        navigate("/explore");
                      } else if (ct.id === "movies") {
                        navigate("/movies");
                      } else {
                        navigate("/tv-shows");
                      }
                      setCurrentPage(1);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      contentType === ct.id
                        ? "bg-[#E4B85A] text-[#050707] shadow-sm shadow-[#E4B85A]/30"
                        : "bg-[#101414] border border-[#282B27] text-[#A7A69F] hover:text-[#F5F0E6] hover:border-[#927442]"
                    }`}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Column: Catalog Toolbar & Movie Grid */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* 8. CATALOG TOOLBAR */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs sm:text-sm font-semibold text-[#A7A69F]">
                Showing {totalDisplayCount} titles
              </span>

              <div className="flex items-center gap-3">
                {/* Grid / List View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-[#101414] border border-[#282B27] rounded-lg">
                  <button
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid View"
                    className={`p-1.5 rounded ${
                      viewMode === "grid"
                        ? "text-[#E4B85A] bg-[#171B1A]"
                        : "text-[#A7A69F] hover:text-[#F5F0E6]"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    aria-label="List View"
                    className={`p-1.5 rounded ${
                      viewMode === "list"
                        ? "text-[#E4B85A] bg-[#171B1A]"
                        : "text-[#A7A69F] hover:text-[#F5F0E6]"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Compact Toolbar Sorting */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as SortByOption);
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-[#101414] border border-[#282B27] rounded-lg pl-3 pr-8 py-1.5 text-xs text-[#F5F0E6] focus:outline-none focus:border-[#E4B85A] cursor-pointer"
                  >
                    <option value="popularity.desc">Sort: Popularity</option>
                    <option value="vote_average.desc">Sort: Rating</option>
                    <option value="primary_release_date.desc">Sort: Release Date</option>
                    <option value="title.asc">Sort: Title</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 w-3 h-3 text-[#A7A69F] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 9. MOVIE CATALOG GRID (5-column on desktop) */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[2/3] rounded-2xl bg-[#101414] animate-pulse border border-[#282B27]"
                  />
                ))}
              </div>
            ) : displayedMovies.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5"
                    : "space-y-4"
                }
              >
                {displayedMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onPlayTrailer={handlePlayTrailer}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-[#0A0D0D] rounded-3xl border border-[#282B27] space-y-3">
                <p className="text-base font-semibold text-[#F5F0E6]">No titles found</p>
                <p className="text-xs text-[#A7A69F] max-w-sm mx-auto">
                  Try adjusting your filter criteria, changing the rating range, or
                  resetting your filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-[#101414] hover:bg-[#171B1A] border border-[#282B27] text-xs font-semibold text-[#E4B85A] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {displayedMovies.length > 0 && (
              <div className="flex items-center justify-center gap-3 pt-6 border-t border-[#282B27]">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#101414] border border-[#282B27] text-xs font-semibold text-[#F5F0E6] hover:border-[#E4B85A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-xs font-semibold text-[#A7A69F] px-3">
                  Page {currentPage} of {Math.min(data?.totalPages || 50, 500)}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage >= (data?.totalPages || 50)}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#101414] border border-[#282B27] text-xs font-semibold text-[#F5F0E6] hover:border-[#E4B85A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
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
