import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Star, ArrowRight, Loader2, Film } from "lucide-react";
import type { MovieSummary } from "@watchbox/shared";
import { apiClient } from "../api/client";
import { getPosterUrl } from "../utils/tmdb";
import { NeonGoldLoader } from "./NeonGoldLoader";

export interface GlowSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onFilterClick?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export const GlowSearchInput: React.FC<GlowSearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search movies, genres, actors...",
  onSubmit,
  onFilterClick,
  className = "",
  autoFocus = false,
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [suggestions, setSuggestions] = useState<MovieSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Debounced search suggestions fetch
  useEffect(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsLoading(false);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      try {
        const data = await apiClient<{ results: MovieSummary[] }>(
          `/movies/search?query=${encodeURIComponent(trimmed)}`
        );
        const q = trimmed.toLowerCase();
        const results = data.results || [];

        // Prioritize movies starting with the typed letter/query
        const startsWithList = results.filter((m) => {
          const title = m.title.toLowerCase();
          return title.startsWith(q) || title.replace(/^the\s+/, "").startsWith(q);
        });

        const othersList = results.filter(
          (m) => !startsWithList.some((s) => s.id === m.id)
        );

        const prioritized = [...startsWithList, ...othersList].slice(0, 6);

        setSuggestions(prioritized);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Suggestions fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectMovie = (movieId: number) => {
    setIsOpen(false);
    onChange("");
    navigate(`/movies/${movieId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectMovie(suggestions[selectedIndex].id);
      } else if (onSubmit) {
        setIsOpen(false);
        onSubmit();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`search-poda-wrapper relative ${className}`}>
      <div className="grid"></div>
      <div id="poda">
        <div className="glow"></div>
        <div className="darkBorderBg"></div>
        <div className="darkBorderBg"></div>
        <div className="darkBorderBg"></div>

        <div className="white"></div>

        <div className="border"></div>

        <div id="main">
          <input
            placeholder={placeholder}
            type="text"
            name="text"
            className="input"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (e.target.value.trim()) {
                setIsOpen(true);
              }
            }}
            onFocus={() => {
              if (value.trim()) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            autoComplete="off"
          />
          <div id="input-mask"></div>
          <div id="pink-mask"></div>
          <div className="filterBorder"></div>
          <div
            id="filter-icon"
            onClick={onFilterClick || onSubmit}
            title="Browse / Filter Categories"
            role="button"
            tabIndex={0}
          >
            <svg
              preserveAspectRatio="none"
              height="20"
              width="20"
              viewBox="4.8 4.56 14.832 15.408"
              fill="none"
            >
              <path
                d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z"
                stroke="#FFD985"
                strokeWidth="1.2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </div>
          <div
            id="search-icon"
            onClick={onSubmit}
            role="button"
            tabIndex={0}
            title="Submit search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              strokeWidth="2.2"
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
              className="feather feather-search transition-transform hover:scale-110"
            >
              <circle stroke="url(#search-gold)" r="8" cy="11" cx="11"></circle>
              <line
                stroke="url(#searchl-gold)"
                y2="16.65"
                y1="22"
                x2="16.65"
                x1="22"
              ></line>
              <defs>
                <linearGradient gradientTransform="rotate(50)" id="search-gold">
                  <stop stopColor="#FFFFFF" offset="0%"></stop>
                  <stop stopColor="#FFD985" offset="50%"></stop>
                  <stop stopColor="#E4B85A" offset="100%"></stop>
                </linearGradient>
                <linearGradient id="searchl-gold">
                  <stop stopColor="#FFFFFF" offset="0%"></stop>
                  <stop stopColor="#E4B85A" offset="50%"></stop>
                  <stop stopColor="#C6922C" offset="100%"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Auto-Suggestions Dropdown (Styled with Neon Gold Luxury Border) */}
      {isOpen && value.trim().length > 0 && (
        <div className="absolute top-[calc(100%+10px)] left-0 sm:left-auto sm:right-0 w-[calc(100vw-32px)] sm:w-[380px] max-w-[420px] rounded-2xl bg-[#0A0D0D]/95 border border-[#E4B85A]/40 backdrop-blur-2xl shadow-2xl shadow-black/95 p-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 flex items-center justify-between border-b border-[#282B27]/70 text-[11px] font-bold tracking-wider text-[#A7A69F] uppercase">
            <span className="flex items-center gap-1.5 text-[#E4B85A]">
              <Sparkles className="w-3.5 h-3.5 text-[#E4B85A]" />
              <span>Suggested Movies</span>
            </span>
            {isLoading && (
              <span className="flex items-center gap-1 text-[#E4B85A] normal-case text-[10px]">
                <Loader2 className="w-3 h-3 animate-spin" />
                Searching...
              </span>
            )}
          </div>

          <div className="py-1 max-h-[340px] overflow-y-auto no-scrollbar space-y-1">
            {isLoading && suggestions.length === 0 ? (
              <div className="py-4 flex flex-col items-center justify-center">
                <NeonGoldLoader size="sm" label={`Searching movies starting with "${value}"...`} />
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((movie, idx) => {
                const isSelected = selectedIndex === idx;
                const releaseYear = movie.releaseDate
                  ? new Date(movie.releaseDate).getFullYear()
                  : null;

                return (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() => handleSelectMovie(movie.id)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left p-2 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#171B1A] border-l-2 border-[#E4B85A] text-[#F5F0E6] pl-2.5"
                        : "hover:bg-[#101414] text-[#A7A69F] hover:text-[#F5F0E6]"
                    }`}
                  >
                    {/* Thumbnail Poster */}
                    <img
                      src={getPosterUrl(movie.posterPath, "w342")}
                      alt={movie.title}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
                      }}
                      className="w-8 h-12 object-cover rounded-md bg-[#101414] border border-[#282B27] shrink-0"
                    />

                    {/* Movie Info */}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-bold text-[#F5F0E6] truncate flex items-center gap-1.5">
                        <span>{movie.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#A7A69F] mt-0.5">
                        {releaseYear && <span>{releaseYear}</span>}
                        {releaseYear && movie.voteAverage > 0 && <span>•</span>}
                        {movie.voteAverage > 0 && (
                          <span className="flex items-center gap-0.5 text-[#E4B85A] font-semibold">
                            <Star className="w-3 h-3 fill-[#E4B85A] text-[#E4B85A]" />
                            {movie.voteAverage.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    <ArrowRight
                      className={`w-4 h-4 shrink-0 text-[#E4B85A] transition-transform ${
                        isSelected ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"
                      }`}
                    />
                  </button>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-[#A7A69F]">
                <Film className="w-6 h-6 text-[#E4B85A]/50 mx-auto mb-1.5" />
                <p>No movies starting with "{value}"</p>
                <p className="text-[10px] text-[#A7A69F]/70 mt-1">Press Enter to search all results</p>
              </div>
            )}
          </div>

          {/* Bottom Footer: See all results */}
          <div
            onClick={() => {
              setIsOpen(false);
              onSubmit?.();
            }}
            className="mt-1 pt-2 border-t border-[#282B27] px-3 py-2 rounded-xl flex items-center justify-between text-xs font-semibold text-[#E4B85A] hover:bg-[#171B1A] hover:text-[#FFD985] cursor-pointer transition-colors"
          >
            <span>Search all for "{value}"</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </div>
  );
};
