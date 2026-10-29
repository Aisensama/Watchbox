import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { MovieSummary } from "@watchbox/shared";
import { MovieCard } from "./MovieCard";

interface MovieCarouselProps {
  title: string;
  subtitle?: string;
  movies: MovieSummary[];
  isLoading?: boolean;
  onPlayTrailer?: (tmdbId: number, title: string) => void;
  genreFilterTabs?: { id: number | null; label: string }[];
  activeGenreTab?: number | null;
  onSelectGenreTab?: (id: number | null) => void;
  seeAllLink?: string;
}

export const MovieCarousel: React.FC<MovieCarouselProps> = ({
  title,
  subtitle,
  movies,
  isLoading = false,
  onPlayTrailer,
  genreFilterTabs,
  activeGenreTab = null,
  onSelectGenreTab,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -600 : 600;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-6 sm:py-8 space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-8 max-w-7xl mx-auto">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F0E6] flex items-center gap-2">
            <span>{title}</span>
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#A7A69F] mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="p-2 rounded-full bg-[#101414] border border-[#282B27] text-[#A7A69F] hover:text-[#F5F0E6] hover:bg-[#171B1A] hover:border-[#E4B85A] transition-colors shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="p-2 rounded-full bg-[#101414] border border-[#282B27] text-[#A7A69F] hover:text-[#F5F0E6] hover:bg-[#171B1A] hover:border-[#E4B85A] transition-colors shadow-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Genre Filter Tabs */}
      {genreFilterTabs && genreFilterTabs.length > 0 && onSelectGenreTab && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 sm:px-8 max-w-7xl mx-auto py-1">
          {genreFilterTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => onSelectGenreTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeGenreTab === tab.id
                  ? "bg-[#E4B85A] text-[#050707] shadow-sm shadow-[#E4B85A]/30"
                  : "bg-[#101414] text-[#A7A69F] hover:text-[#F5F0E6] hover:bg-[#171B1A] border border-[#282B27]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Movie Horizontal Row */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar px-4 sm:px-8 max-w-7xl mx-auto scroll-smooth py-2"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-36 sm:w-44 md:w-48 shrink-0 aspect-[2/3] rounded-2xl bg-[#101414] animate-pulse border border-[#282B27]"
            />
          ))
        ) : movies.length > 0 ? (
          movies.map((movie) => (
            <div key={movie.id} className="w-36 sm:w-44 md:w-48 shrink-0">
              <MovieCard movie={movie} onPlayTrailer={onPlayTrailer} useLetterSwap />
            </div>
          ))
        ) : (
          <div className="w-full py-12 text-center text-[#A7A69F] text-sm bg-[#0A0D0D] rounded-2xl border border-[#282B27] flex flex-col items-center justify-center gap-3">
            <p>No titles found in this selection</p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {onSelectGenreTab && activeGenreTab && (
                <button
                  onClick={() => onSelectGenreTab(null)}
                  className="text-xs text-[#E4B85A] hover:underline cursor-pointer"
                >
                  Reset to All Titles →
                </button>
              )}
              <button
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["movies"] });
                  queryClient.refetchQueries({ queryKey: ["movies"] });
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#171B1A] border border-[#282B27] text-xs font-medium text-[#E4B85A] hover:bg-[#282B27] transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#E4B85A]/10 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Live Titles</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
