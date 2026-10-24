import React from "react";
import { Link } from "react-router-dom";
import { Film, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-[#08090D] text-slate-400 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8 pb-10 border-b border-slate-800/60">
        {/* Brand Column */}
        <div className="space-y-3 max-w-sm">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-600/30">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              Watch<span className="text-rose-500">Box</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            A premium full-stack movie discovery platform and personal cinema management
            suite. Designed according to the approved WatchBox SDD v0.2.
          </p>
        </div>

        {/* Navigation Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
          <div className="space-y-2.5">
            <p className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Explore
            </p>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-rose-400 transition-colors">
                  Home Spotlight
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-rose-400 transition-colors">
                  All Movies
                </Link>
              </li>
              <li>
                <Link
                  to="/explore?tab=top-rated"
                  className="hover:text-rose-400 transition-colors"
                >
                  Top Rated
                </Link>
              </li>
              <li>
                <Link
                  to="/explore?tab=upcoming"
                  className="hover:text-rose-400 transition-colors"
                >
                  Upcoming
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <p className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Personal
            </p>
            <ul className="space-y-2">
              <li>
                <Link to="/watchlist" className="hover:text-rose-400 transition-colors">
                  My Watchlist
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-rose-400 transition-colors">
                  Watch History
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-rose-400 transition-colors">
                  DNA Profile & Stats
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 col-span-2 sm:col-span-1">
            <p className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Data Source
            </p>
            <p className="text-[11px] text-slate-400 leading-normal">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} WatchBox • Demo-Ready Full-Stack MVP.</p>
        <div className="flex items-center gap-1 text-[11px]">
          <span>Built with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>React, Express & MongoDB</span>
        </div>
      </div>
    </footer>
  );
};
