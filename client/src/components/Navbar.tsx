import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Menu,
  X,
  User as UserIcon,
  Shield,
  Bookmark,
  History,
  LogOut,
  CheckCheck,
  Trash2,
  Film,
  Dna,
  Sparkles,
  Play,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import RandomLetterSwap from "./RandomLetterSwap";
import { GlowSearchInput } from "./GlowSearchInput";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "release" | "dna" | "trailer" | "system";
  badge?: string;
  link?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Spider-Man: Brand New Day",
    message: "Now trending worldwide. Available in 4K Cinema on WatchBox.",
    time: "10m ago",
    read: false,
    type: "release",
    badge: "Trending #1",
    link: "/movies/969681",
  },
  {
    id: "notif-2",
    title: "WatchBox DNA Match",
    message: "98% taste match: Dune: Part Three was added to your curated picks.",
    time: "1h ago",
    read: false,
    type: "dna",
    badge: "98% Match",
    link: "/explore?search=Dune",
  },
  {
    id: "notif-3",
    title: "New Trailer Premiere",
    message: "Avengers: Doomsday final theatrical trailer is now available.",
    time: "3h ago",
    read: false,
    type: "trailer",
    badge: "Trailer",
    link: "/movies/1003596",
  },
  {
    id: "notif-4",
    title: "Curated Masterpieces Updated",
    message: "12 award-winning cinema classics added to this week's spotlight.",
    time: "1d ago",
    read: true,
    type: "system",
    badge: "Curated",
    link: "/explore",
  },
];

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem("watchbox_notifications");
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  const notificationRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("watchbox_notifications", JSON.stringify(notifications));
    } catch (e) {
      console.warn("Could not save notifications to localStorage:", e);
    }
  }, [notifications]);

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(target)
      ) {
        setUserDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNotificationsOpen(false);
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setNotificationsOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };


  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Explore", path: "/explore" },
    { label: "Movies", path: "/movies" },
    { label: "TV Shows", path: "/tv-shows" },
    { label: "My List", path: "/watchlist" },
  ];

  if (user?.role === "admin") {
    navLinks.push({ label: "Admin", path: "/admin" });
  }

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path === "/explore" && location.pathname === "/explore") return true;
    if (path === "/movies" && location.pathname === "/movies") return true;
    if (path === "/tv-shows" && (location.pathname === "/tv-shows" || location.pathname === "/tv")) return true;
    if (path !== "/" && path !== "/explore" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="neon-nav-border fixed top-0 left-0 right-0 z-50 bg-[#050707]/90 backdrop-blur-md border-b border-[#282B27] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-serif text-2xl sm:text-[26px] font-bold tracking-tight text-[#F5F0E6] flex items-center">
              <RandomLetterSwap label="Watch" color="#F5F0E6" mode="pingpong" staggerDuration={0.04} />
              <RandomLetterSwap label="Box" color="#E4B85A" mode="pingpong" staggerDuration={0.04} />
            </span>
          </Link>

          {/* Center: Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`relative px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                    active
                      ? "text-[#F5F0E6]"
                      : "text-[#A7A69F] hover:text-[#F5F0E6]"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-[21px] left-3 right-3 h-[2px] bg-[#E4B85A]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Search, Notifications, Profile / Auth */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Uiverse.io Neon Gold & White Search Input Box */}
          <div className="hidden sm:block">
            <GlowSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={() => {
                if (searchQuery.trim()) {
                  navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery("");
                }
              }}
              onFilterClick={() => navigate("/explore")}
              placeholder="Search movies, actors..."
            />
          </div>

          {/* Notification Bell with Interactive Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setNotificationsOpen((prev) => !prev);
                setUserDropdownOpen(false);
              }}
              aria-label="Notifications"
              title="Notifications"
              className={`p-2 rounded-full transition-all relative ${
                notificationsOpen
                  ? "text-[#E4B85A] bg-[#101414] border border-[#E4B85A]/40 shadow-sm shadow-[#E4B85A]/20"
                  : "text-[#A7A69F] hover:text-[#F5F0E6] hover:bg-[#101414]"
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E4B85A] text-[#050707] text-[10px] font-black flex items-center justify-center shadow-md animate-in zoom-in">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover Menu */}
            {notificationsOpen && (
              <div className="neon-layout-border !absolute right-0 top-full mt-4 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-[#0A0D0D] border border-[#282B27] rounded-2xl p-3.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#282B27]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F5F0E6] tracking-wide">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E4B85A]/15 text-[#E4B85A] border border-[#E4B85A]/30 text-[10px] font-extrabold">
                        {unreadCount} New
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] font-semibold text-[#E4B85A] hover:text-[#FFD985] flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-[#171B1A]"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Read all</span>
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="p-1 rounded text-[#A7A69F] hover:text-rose-400 hover:bg-[#171B1A] transition-colors"
                        title="Clear all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-[380px] overflow-y-auto space-y-2 pr-0.5 no-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center text-xs text-[#A7A69F] space-y-2">
                      <Bell className="w-7 h-7 mx-auto opacity-30 text-[#A7A69F]" />
                      <p className="font-bold text-[#F5F0E6]">All caught up!</p>
                      <p className="text-[11px]">No new alerts or releases right now.</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          n.read
                            ? "bg-[#101414]/40 border-transparent hover:bg-[#101414] hover:border-[#282B27]"
                            : "bg-[#101414] border-[#282B27] hover:border-[#E4B85A]/60 shadow-sm"
                        }`}
                      >
                        {/* Type Icon */}
                        <div
                          className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                            n.type === "dna"
                              ? "bg-purple-950/60 text-purple-400 border border-purple-800/40"
                              : n.type === "release"
                              ? "bg-amber-950/60 text-[#E4B85A] border border-amber-800/40"
                              : n.type === "trailer"
                              ? "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                              : "bg-[#171B1A] text-[#A7A69F] border border-[#282B27]"
                          }`}
                        >
                          {n.type === "dna" && <Dna className="w-3.5 h-3.5" />}
                          {n.type === "release" && <Film className="w-3.5 h-3.5" />}
                          {n.type === "trailer" && <Play className="w-3.5 h-3.5 fill-current" />}
                          {n.type === "system" && <Sparkles className="w-3.5 h-3.5" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <p
                              className={`text-xs font-bold truncate ${
                                n.read ? "text-[#A7A69F]" : "text-[#F5F0E6]"
                              }`}
                            >
                              {n.title}
                            </p>
                            <span className="text-[10px] text-[#A7A69F] shrink-0 font-mono">
                              {n.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#A7A69F] leading-tight line-clamp-2">
                            {n.message}
                          </p>
                          {n.badge && (
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-[#E4B85A] border border-[#E4B85A]/30">
                              {n.badge}
                            </span>
                          )}
                        </div>

                        {/* Dismiss or Unread Indicator */}
                        <div className="flex flex-col items-center justify-between gap-2 shrink-0 self-stretch">
                          {!n.read ? (
                            <span className="w-2 h-2 rounded-full bg-[#E4B85A] shadow-sm shadow-[#E4B85A]/80 mt-1" />
                          ) : (
                            <span className="w-2 h-2" />
                          )}
                          <button
                            onClick={(e) => dismissNotification(e, n.id)}
                            className="p-1 rounded text-[#A7A69F] hover:text-[#F5F0E6] hover:bg-[#171B1A] opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Dismiss"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile or Sign In buttons */}
          {user ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-[#101414] border border-[#282B27] hover:border-[#E4B85A]/50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#927442] to-[#E4B85A] flex items-center justify-center text-xs font-bold text-[#050707] uppercase overflow-hidden">
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
                <span className="hidden sm:inline text-xs font-semibold text-[#F5F0E6] truncate max-w-[100px]">
                  {user.displayName}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-6 w-56 bg-[#0A0D0D] border border-[#282B27] rounded-xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2.5 border-b border-[#282B27]">
                    <p className="text-xs font-bold text-[#F5F0E6] truncate">
                      {user.displayName}
                    </p>
                    <p className="text-[11px] text-[#A7A69F] truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#101414] border border-[#282B27] text-[#E4B85A] capitalize">
                      {user.role} Account
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#F5F0E6] hover:bg-[#171B1A] hover:text-[#FFD985] transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#A7A69F]" />
                      <span>My Profile & Stats</span>
                    </Link>
                    <Link
                      to="/watchlist"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#F5F0E6] hover:bg-[#171B1A] hover:text-[#FFD985] transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-[#A7A69F]" />
                      <span>My Watchlist</span>
                    </Link>
                    <Link
                      to="/history"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#F5F0E6] hover:bg-[#171B1A] hover:text-[#FFD985] transition-colors"
                    >
                      <History className="w-3.5 h-3.5 text-[#A7A69F]" />
                      <span>Watch History</span>
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#E4B85A] hover:bg-[#171B1A] transition-colors font-medium"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#E4B85A]" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-[#282B27]">
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors font-medium text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  onOpenAuthModal ? onOpenAuthModal("login") : navigate("/login")
                }
                className="text-xs font-semibold text-[#F5F0E6] hover:text-[#E4B85A] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() =>
                  onOpenAuthModal ? onOpenAuthModal("register") : navigate("/register")
                }
                className="border border-[#E4B85A] text-[#E4B85A] hover:bg-[#E4B85A] hover:text-[#050707] rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all"
              >
                Join Free
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#A7A69F] hover:text-[#F5F0E6] hover:bg-[#101414] transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#282B27] bg-[#0A0D0D] px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="w-full flex justify-center py-1">
            <GlowSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={() => {
                if (searchQuery.trim()) {
                  navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery("");
                  setMobileMenuOpen(false);
                }
              }}
              onFilterClick={() => {
                navigate("/explore");
                setMobileMenuOpen(false);
              }}
              placeholder="Search movies, shows..."
            />
          </div>

          <div className="flex flex-col gap-1 pt-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive(link.path)
                    ? "bg-[#171B1A] text-[#E4B85A] border border-[#E4B85A]/30"
                    : "text-[#A7A69F] hover:bg-[#101414] hover:text-[#F5F0E6]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
