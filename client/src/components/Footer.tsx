import React from "react";
import { Link } from "react-router-dom";
import RandomLetterSwap from "./RandomLetterSwap";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-[#282B27] bg-[#050707] text-[#A7A69F] py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8 pb-10 border-b border-[#282B27]">
        {/* Brand Column */}
        <div className="space-y-3 max-w-sm">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#F5F0E6] flex items-center">
              <RandomLetterSwap label="Watch" color="#F5F0E6" mode="pingpong" staggerDuration={0.04} />
              <RandomLetterSwap label="Box" color="#E4B85A" mode="pingpong" staggerDuration={0.04} />
            </span>
          </Link>
          <p className="text-xs text-[#A7A69F] leading-relaxed">
            A premium full-stack movie discovery platform and personal cinema management
            suite. Curated luxury cinematic experience.
          </p>
        </div>

        {/* Navigation Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
          <div className="space-y-2.5">
            <p className="font-bold text-[#F5F0E6] uppercase tracking-wider text-[11px]">
              Explore
            </p>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-[#E4B85A] transition-colors">
                  Home Spotlight
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-[#E4B85A] transition-colors">
                  All Movies
                </Link>
              </li>
              <li>
                <Link
                  to="/explore?tab=top-rated"
                  className="hover:text-[#E4B85A] transition-colors"
                >
                  Top Rated
                </Link>
              </li>
              <li>
                <Link
                  to="/explore?tab=upcoming"
                  className="hover:text-[#E4B85A] transition-colors"
                >
                  Upcoming
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <p className="font-bold text-[#F5F0E6] uppercase tracking-wider text-[11px]">
              Personal
            </p>
            <ul className="space-y-2">
              <li>
                <Link to="/watchlist" className="hover:text-[#E4B85A] transition-colors">
                  My Watchlist
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-[#E4B85A] transition-colors">
                  Watch History
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#E4B85A] transition-colors">
                  DNA Profile & Stats
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 col-span-2 sm:col-span-1">
            <p className="font-bold text-[#F5F0E6] uppercase tracking-wider text-[11px]">
              Data Source
            </p>
            <p className="text-[11px] text-[#A7A69F] leading-normal">
              This product uses the TMDB API for movie metadata but is not endorsed or certified by TMDB.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A7A69F]">
        <p>© {new Date().getFullYear()} WatchBox • Luxury Cinema & Discovery.</p>
      </div>
    </footer>
  );
};
