import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Film,
  Bell,
  Menu,
  X,
  User as UserIcon,
  Shield,
  Bookmark,
  History,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { GlowSearchInput } from "./GlowSearchInput";
import { SurfButton } from "./SurfButton";

interface NavbarProps {
  onOpenAuthModal?: (mode: "login" | "register") => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Explore", path: "/explore" },
    { label: "My List", path: "/watchlist", authRequired: true },
    { label: "History", path: "/history", authRequired: true },
  ];

  if (user?.role === "admin") {
    navLinks.push({ label: "Admin", path: "/admin", authRequired: true });
  }

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0A0C10]/85 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Main Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white group-hover:text-rose-400 transition-colors">
              Watch<span className="text-rose-500">Box</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.authRequired && !user) return null;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "text-white font-semibold"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-[-16px] left-3.5 right-3.5 h-0.5 bg-rose-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Search, Notifications, Profile / Auth */}
        <div className="flex items-center gap-3">
          {/* Search bar */}
          {/* Glowing Search bar */}
          <div className="hidden sm:block w-52 lg:w-72">
            <GlowSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search movies..."
              onSubmit={handleSearchSubmit}
              onFilterClick={() => navigate("/explore")}
              compact
            />
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              aria-label="Notifications"
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0A0C10]" />
            </button>
          </div>

          {/* User Profile or Sign In buttons */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white uppercase overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.displayName.substring(0, 2)
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-slate-200 truncate max-w-[100px]">
                  {user.displayName}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2.5 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">
                      {user.displayName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-rose-300 capitalize">
                      {user.role} Account
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile & Stats</span>
                    </Link>
                    <Link
                      to="/watchlist"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Watchlist</span>
                    </Link>
                    <Link
                      to="/history"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>Watch History</span>
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-amber-300 hover:bg-amber-500/10 transition-colors font-medium"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors font-medium text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  onOpenAuthModal ? onOpenAuthModal("login") : navigate("/login")
                }
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                Sign In
              </button>
              <SurfButton
                onClick={() =>
                  onOpenAuthModal ? onOpenAuthModal("register") : navigate("/register")
                }
                size="sm"
                hoverText="JOIN NOW"
              >
                Join Free
              </SurfButton>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0A0C10] px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="w-full">
            <GlowSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search movies, genres..."
              onSubmit={handleSearchSubmit}
              onFilterClick={() => {
                navigate("/explore");
                setMobileMenuOpen(false);
              }}
            />
          </div>

          <div className="flex flex-col gap-1 pt-1">
            {navLinks.map((link) => {
              if (link.authRequired && !user) return null;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? "bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};
