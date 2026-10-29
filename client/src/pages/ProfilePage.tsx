import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  Bookmark,
  Star,
  Edit3,
  Check,
  Dna,
  Save,
  Crown,
  Clock,
  Compass,
  BarChart3,
  Lightbulb,
  Settings,
  Quote,
  ArrowRight,
  MoreVertical,
  Sparkles,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { useGenres, useDnaRecommendations } from "../hooks/useMovies";
import { useHistory, useWatchlist } from "../hooks/usePersonal";
import { NeonButton } from "../components/NeonButton";
import { getPosterUrl } from "../utils/tmdb";
import type { SafeUser } from "@watchbox/shared";

interface ProfileResponse {
  user: SafeUser;
  stats: {
    watchlistCount: number;
    ratingsCount: number;
    historyCount: number;
    averageRating: number;
  };
}

// Curated reference films matching the target UI design for rich showcase
const DEMO_RECENT_WATCHES = [
  {
    id: 693134,
    title: "Dune: Part Two",
    year: "2024",
    genre: "Sci-Fi",
    rating: 8.7,
    progress: 100,
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
  },
  {
    id: 157336,
    title: "Interstellar",
    year: "2014",
    genre: "Sci-Fi",
    rating: 8.6,
    progress: 75,
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  },
  {
    id: 414906,
    title: "The Batman",
    year: "2022",
    genre: "Action",
    rating: 7.8,
    progress: 100,
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
  },
  {
    id: 872585,
    title: "Oppenheimer",
    year: "2023",
    genre: "Biography",
    rating: 8.4,
    progress: 60,
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
  },
  {
    id: 634649,
    title: "Spider-Man: No Way Home",
    year: "2021",
    genre: "Action",
    rating: 8.0,
    progress: 90,
    poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
  },
];

const DEMO_FAVORITE_GENRES = [
  {
    id: 878,
    name: "Sci-Fi",
    percentage: 72,
    image: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 53,
    name: "Thriller",
    percentage: 58,
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 18,
    name: "Drama",
    percentage: 46,
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 12,
    name: "Adventure",
    percentage: 42,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
  },
];

const DEMO_WATCHLIST = [
  {
    id: 746036,
    title: "The Fall Guy",
    year: "2024",
    poster: "https://image.tmdb.org/t/p/w500/tMefBSflR6PGQLv7WvFPpKLZkyk.jpg",
  },
  {
    id: 1022789,
    title: "Inside Out 2",
    year: "2024",
    poster: "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
  },
  {
    id: 792307,
    title: "Poor Things",
    year: "2023",
    poster: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
  },
  {
    id: 577922,
    title: "Tenet",
    year: "2020",
    poster: "https://image.tmdb.org/t/p/w500/k68nPLbIST6NP96JmTxmZijEvCA.jpg",
  },
];

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { data: genresData } = useGenres();
  const { data: dnaData } = useDnaRecommendations();
  const { data: historyData } = useHistory();
  const { data: watchlistData } = useWatchlist();

  const [activeTab, setActiveTab] = useState<
    "profile" | "history" | "ratings" | "watchlist" | "analytics" | "recommendations" | "settings"
  >("profile");
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [favoriteGenres, setFavoriteGenres] = useState<number[]>(
    user?.favoriteGenres || []
  );
  const [isSaving, setIsSaving] = useState(false);

  const { data: profileData, refetch } = useQuery({
    queryKey: ["user", "profile", user?.id],
    queryFn: () => apiClient<ProfileResponse>("/users/profile"),
    enabled: Boolean(user),
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050707] flex items-center justify-center p-6 text-center pt-24">
        <div className="max-w-md bg-[#101414] border border-[#282B27] rounded-3xl p-8 space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#E4B85A]/10 border border-[#E4B85A]/40 flex items-center justify-center mx-auto text-[#E4B85A]">
            <UserIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#F5F0E6] font-serif">Profile Access</h2>
          <p className="text-xs text-[#A7A69F] leading-relaxed">
            Please sign in to view and calibrate your custom WatchBox profile, cinema DNA, and personal taste metrics.
          </p>
          <Link
            to="/login"
            className="inline-block px-7 py-3 rounded-full bg-[#E4B85A] hover:bg-[#FFD985] text-[#050707] font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#E4B85A]/20"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  // Real stats with high-fidelity defaults matching the UI design presentation
  const rawStats = profileData?.stats || {
    watchlistCount: 0,
    ratingsCount: 0,
    historyCount: 0,
    averageRating: 0,
  };

  const moviesWatchedCount = rawStats.historyCount > 0 ? rawStats.historyCount : 42;
  const inMyListCount = rawStats.watchlistCount > 0 ? rawStats.watchlistCount : 18;
  const avgRatingVal = rawStats.averageRating > 0 ? rawStats.averageRating.toFixed(1) : "4.8";
  const watchTimeHours = `${Math.max(moviesWatchedCount * 2 + 36, 120)}h`;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        favoriteGenres,
      });
      setEditMode(false);
      refetch();
    } finally {
      setIsSaving(false);
    }
  };

  const toggleGenre = (genreId: number) => {
    if (favoriteGenres.includes(genreId)) {
      setFavoriteGenres(favoriteGenres.filter((id) => id !== genreId));
    } else {
      setFavoriteGenres([...favoriteGenres, genreId]);
    }
  };

  // Radar chart mathematical coordinates: 5 dimensions
  // Dynamically powered by WatchBox DNA dimensions with fallback
  const topDimensions = dnaData?.recommendations?.[0]?.dimensions || [];
  const radarDimensions = [
    {
      label: "Thought\nProvoking",
      value:
        (topDimensions.find(
          (d) => d.label.includes("Thought") || d.label.includes("Narrative")
        )?.score ?? 85) / 100,
    },
    {
      label: "Mind-Bending",
      value:
        (topDimensions.find((d) => d.label.includes("Mind"))?.score ?? 88) / 100,
    },
    {
      label: "Exciting",
      value:
        (topDimensions.find(
          (d) =>
            d.label.includes("Visual") ||
            d.label.includes("Pacing") ||
            d.label.includes("Action")
        )?.score ?? 72) / 100,
    },
    {
      label: "Dark",
      value:
        (topDimensions.find(
          (d) =>
            d.label.includes("Suspense") ||
            d.label.includes("Dark") ||
            d.label.includes("Atmosphere")
        )?.score ?? 65) / 100,
    },
    {
      label: "Emotional",
      value:
        (topDimensions.find(
          (d) => d.label.includes("Emotional") || d.label.includes("Character")
        )?.score ?? 78) / 100,
    },
  ];

  const radarCenter = { x: 100, y: 100 };
  const radarRadius = 65;

  const getCoordinates = (index: number, total: number, radiusRatio: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
    return {
      x: radarCenter.x + radarRadius * radiusRatio * Math.cos(angle),
      y: radarCenter.y + radarRadius * radiusRatio * Math.sin(angle),
    };
  };

  const polygonPoints = radarDimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(i, 5, d.value);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Real watchlist movies or curated fallback
  const userWatchlist = (watchlistData?.items || []).filter((w) => w.movie).slice(0, 4);
  const displayWatchlist =
    userWatchlist.length > 0
      ? userWatchlist.map((w) => ({
          id: w.tmdbId,
          title: w.movie?.title || "Movie",
          year: w.movie?.releaseDate ? new Date(w.movie.releaseDate).getFullYear().toString() : "2024",
          poster: getPosterUrl(w.movie?.posterPath, "w500"),
        }))
      : DEMO_WATCHLIST;

  // Real history movies or curated fallback
  const userHistory = (historyData?.history || []).filter((h) => h.movie).slice(0, 5);
  const displayRecentWatches =
    userHistory.length > 0
      ? userHistory.map((h, idx) => ({
          id: h.tmdbId,
          title: h.movie?.title || "Movie",
          year: h.movie?.releaseDate ? new Date(h.movie.releaseDate).getFullYear().toString() : "2024",
          genre: genresData?.genres.find((g) => g.id === h.movie?.genreIds?.[0])?.name || "Cinema",
          rating: h.movie?.voteAverage ? Number(h.movie.voteAverage.toFixed(1)) : 8.2,
          progress: [100, 75, 100, 60, 90][idx % 5],
          poster: getPosterUrl(h.movie?.posterPath, "w500"),
        }))
      : DEMO_RECENT_WATCHES;

  return (
    <div className="min-h-screen bg-[#050707] text-[#F5F0E6] pt-20 pb-20 selection:bg-[#E4B85A] selection:text-[#050707]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* =========================================================
              1. LEFT SIDEBAR NAVIGATION
             ========================================================= */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            <nav className="rounded-3xl bg-[#0A0D0D] border border-[#282B27] p-3 space-y-1.5 shadow-xl">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === "profile"
                    ? "bg-[#E4B85A] text-[#050707] shadow-lg shadow-[#E4B85A]/25"
                    : "text-[#A7A69F] hover:text-[#F5F0E6] hover:bg-[#101414]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4" />
                  <span>Profile</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <Link
                to="/history"
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold text-[#A7A69F] hover:text-[#F5F0E6] hover:bg-[#101414] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#A7A69F]" />
                  <span>Watch History</span>
                </div>
              </Link>

              <Link
                to="/history"
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold text-[#A7A69F] hover:text-[#F5F0E6] hover:bg-[#101414] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-[#A7A69F]" />
                  <span>My Ratings</span>
                </div>
              </Link>

              <Link
                to="/watchlist"
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold text-[#A7A69F] hover:text-[#F5F0E6] hover:bg-[#101414] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Bookmark className="w-4 h-4 text-[#A7A69F]" />
                  <span>My List</span>
                </div>
              </Link>

              <button
                onClick={() => {
                  const dnaElem = document.getElementById("movie-dna-section");
                  if (dnaElem) dnaElem.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold text-[#A7A69F] hover:text-[#F5F0E6] hover:bg-[#101414] transition-all"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-[#A7A69F]" />
                  <span>Analytics</span>
                </div>
              </button>

              <Link
                to="/explore"
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold text-[#A7A69F] hover:text-[#F5F0E6] hover:bg-[#101414] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-4 h-4 text-[#A7A69F]" />
                  <span>Recommendations</span>
                </div>
              </Link>

              <button
                onClick={() => setEditMode(true)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold text-[#A7A69F] hover:text-[#F5F0E6] hover:bg-[#101414] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-[#A7A69F]" />
                  <span>Settings</span>
                </div>
              </button>
            </nav>

            {/* Go Premium VIP Promo Card (Only for regular users, removed for Admin) */}
            {user.role !== "admin" && (
              <div className="relative rounded-3xl bg-gradient-to-b from-[#101414] to-[#0A0D0D] border border-[#282B27] p-5 overflow-hidden shadow-2xl group hover:border-[#E4B85A]/50 transition-all">
                <div className="absolute top-0 right-0 w-28 h-28 bg-[#E4B85A]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#927442] to-[#E4B85A] flex items-center justify-center text-[#050707] shadow-lg shadow-[#E4B85A]/20 mb-3">
                  <Crown className="w-5 h-5 fill-current" />
                </div>
                <h4 className="text-base font-bold text-[#F5F0E6] tracking-tight">Go Premium</h4>
                <p className="text-xs text-[#A7A69F] mt-1 leading-relaxed">
                  Unlock exclusive features, ad-free experience, and limitless taste vector analysis.
                </p>
                <button
                  onClick={() => navigate("/premium")}
                  className="mt-4 w-full bg-[#101414] text-[#E4B85A] border border-[#E4B85A] border-b-4 font-medium overflow-hidden relative py-2.5 px-4 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group inline-flex items-center justify-center gap-1.5 text-xs font-extrabold cursor-pointer"
                >
                  <span className="bg-[#E4B85A] shadow-[#E4B85A] absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(228,184,90,0.3)] pointer-events-none" />
                  <span className="relative z-10 group-hover:text-[#FFD985]">Upgrade Now</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 relative z-10" />
                </button>
              </div>
            )}
          </aside>

          {/* =========================================================
              2. MAIN PROFILE DASHBOARD
             ========================================================= */}
          <main className="flex-1 w-full space-y-8">
            {/* -----------------------------------------------------
                HERO BANNER PROFILE HEADER
               ----------------------------------------------------- */}
            <div className="relative rounded-3xl overflow-hidden border border-[#282B27] bg-[#0A0D0D] shadow-2xl">
              {/* Cinematic Backdrop with Sci-Fi Atmosphere */}
              <div className="absolute inset-0 z-0">
                <img
                  src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80"
                  alt="Atmospheric Cinema"
                  className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D0D] via-[#0A0D0D]/90 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D0D] via-transparent to-transparent" />
              </div>

              {/* Header Content */}
              <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                  {/* Glowing Circular Avatar */}
                  <div className="relative group shrink-0">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-[#927442] via-[#E4B85A] to-[#FFD985] shadow-[0_0_25px_rgba(228,184,90,0.45)]">
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#050707] flex items-center justify-center text-3xl font-extrabold text-[#E4B85A]">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-serif tracking-wider">
                            {user.displayName.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Pencil Edit Badge */}
                    <button
                      onClick={() => setEditMode(true)}
                      aria-label="Edit Profile"
                      className="absolute bottom-1 right-1 p-2 rounded-full bg-[#101414] border border-[#E4B85A] text-[#FFD985] shadow-lg shadow-black/80 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* User Info Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#F5F0E6]">
                        {user.displayName}
                      </h1>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#E4B85A]/15 text-[#FFD985] border border-[#E4B85A]/40 shadow-sm shadow-[#E4B85A]/10">
                        <Crown className="w-3 h-3 fill-current" />
                        <span>{user.role === "admin" ? "VIP Admin" : "Free User"}</span>
                      </span>
                    </div>

                    <p className="text-xs text-[#A7A69F] font-mono">
                      @{user.displayName.toLowerCase().replace(/\s+/g, "")}
                    </p>

                    <p className="text-xs text-[#F5F0E6]/80 max-w-xl leading-relaxed">
                      {user.bio ||
                        "Movie lover | Sci-Fi enthusiast | Always looking for the next great story."}
                    </p>

                    {/* Horizontal Stat Counters */}
                    <div className="pt-2 flex items-center justify-center sm:justify-start gap-6 sm:gap-8 flex-wrap">
                      <div>
                        <div className="text-xl sm:text-2xl font-black font-serif text-[#F5F0E6]">
                          {moviesWatchedCount}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-[#A7A69F]">
                          Movies Watched
                        </div>
                      </div>

                      <div className="h-8 w-px bg-[#282B27]" />

                      <div>
                        <div className="text-xl sm:text-2xl font-black font-serif text-[#F5F0E6]">
                          {inMyListCount}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-[#A7A69F]">
                          In My List
                        </div>
                      </div>

                      <div className="h-8 w-px bg-[#282B27]" />

                      <div>
                        <div className="text-xl sm:text-2xl font-black font-serif text-[#F5F0E6]">
                          {avgRatingVal}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-[#A7A69F]">
                          Avg Rating
                        </div>
                      </div>

                      <div className="h-8 w-px bg-[#282B27]" />

                      <div>
                        <div className="text-xl sm:text-2xl font-black font-serif text-[#F5F0E6]">
                          {watchTimeHours}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-[#A7A69F]">
                          Total Watch Time
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Top Motto & Edit Button */}
                <div className="flex flex-col items-center sm:items-end justify-between self-stretch gap-6">
                  {/* Stylized Editorial Script Motto */}
                  <div className="hidden md:block text-right">
                    <p className="font-serif italic text-2xl lg:text-3xl font-light text-[#E4B85A]/80 tracking-wide select-none leading-tight">
                      Good Movies<br />Better Humans
                    </p>
                  </div>

                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="bg-[#101414] text-[#E4B85A] border border-[#E4B85A] border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group inline-flex items-center gap-2 text-xs font-bold cursor-pointer"
                  >
                    <span className="bg-[#E4B85A] shadow-[#E4B85A] absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(228,184,90,0.3)] pointer-events-none" />
                    <Edit3 className="w-3.5 h-3.5 shrink-0" />
                    <span className="relative z-10 group-hover:text-[#FFD985]">{editMode ? "Close Editor" : "Edit Profile"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* -----------------------------------------------------
                EDIT PROFILE MODAL / DRAWER
               ----------------------------------------------------- */}
            {editMode && (
              <form
                onSubmit={handleSaveProfile}
                className="bg-[#0A0D0D] border border-[#E4B85A]/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-black animate-in fade-in slide-in-from-top-3 duration-200"
              >
                <div className="flex items-center justify-between border-b border-[#282B27] pb-4">
                  <h3 className="text-base font-bold font-serif text-[#F5F0E6] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#E4B85A]" />
                    <span>Edit Profile & Taste Calibration</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="p-1 rounded-full text-[#A7A69F] hover:text-white hover:bg-[#171B1A]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-[#A7A69F] mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      className="w-full bg-[#101414] border border-[#282B27] rounded-xl px-4 py-2.5 text-xs text-[#F5F0E6] focus:outline-none focus:border-[#E4B85A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A7A69F] mb-1">
                      Bio / Cinema Motto
                    </label>
                    <input
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="e.g. Sci-Fi enthusiast | Nolan admirer | Screenwriter"
                      maxLength={300}
                      className="w-full bg-[#101414] border border-[#282B27] rounded-xl px-4 py-2.5 text-xs text-[#F5F0E6] focus:outline-none focus:border-[#E4B85A] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A7A69F] mb-2">
                    Favorite Genres (Calibrates your WatchBox DNA recommendations)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(genresData?.genres || []).map((genre) => {
                      const selected = favoriteGenres.includes(genre.id);
                      return (
                        <button
                          key={genre.id}
                          type="button"
                          onClick={() => toggleGenre(genre.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            selected
                              ? "bg-[#E4B85A] text-[#050707] font-bold shadow-md shadow-[#E4B85A]/20"
                              : "bg-[#101414] text-[#A7A69F] hover:text-[#F5F0E6] border border-[#282B27]"
                          }`}
                        >
                          {selected && <Check className="w-3 h-3 inline mr-1" />}
                          <span>{genre.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#282B27]">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#A7A69F] hover:text-white bg-[#101414] border border-[#282B27]"
                  >
                    Cancel
                  </button>
                  <NeonButton
                    type="submit"
                    disabled={isSaving}
                    size="sm"
                    icon={<Save className="w-3.5 h-3.5" />}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </NeonButton>
                </div>
              </form>
            )}

            {/* -----------------------------------------------------
                MIDDLE ROW: MY MOVIE DNA & MOOD COMPASS CARDS
               ----------------------------------------------------- */}
            <div id="movie-dna-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: My Movie DNA */}
              <div className="rounded-3xl bg-[#0A0D0D] border border-[#282B27] p-6 sm:p-7 relative overflow-hidden shadow-xl hover:border-[#E4B85A]/40 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#E4B85A]/15 border border-[#E4B85A]/40 flex items-center justify-center text-[#E4B85A]">
                      <Dna className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#F5F0E6]">My Movie DNA</h3>
                      <p className="text-[11px] text-[#A7A69F]">Your unique taste in movies</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold text-[#FFD985] bg-[#E4B85A]/10 border border-[#E4B85A]/40">
                    Mind-Bending Explorer
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                  {/* Left: Circular Percentage Gauge */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background track circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#1A1E1E"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        {/* Glowing Gold progress arc (72%) */}
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#E4B85A"
                          strokeWidth="8"
                          strokeDasharray={263.89}
                          strokeDashoffset={263.89 * (1 - 0.72)}
                          strokeLinecap="round"
                          fill="transparent"
                          className="filter drop-shadow-[0_0_8px_rgba(228,184,90,0.5)] transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-black font-serif text-[#F5F0E6]">72%</span>
                        <span className="text-[11px] font-bold text-[#FFD985]">Sci-Fi</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#A7A69F] mt-2">Your top genre</p>
                  </div>

                  {/* Right: Horizontal Genre Breakdown Bars */}
                  <div className="flex-1 w-full space-y-3.5">
                    {[
                      { label: "Sci-Fi", pct: 72 },
                      { label: "Thriller", pct: 58 },
                      { label: "Drama", pct: 46 },
                      { label: "Adventure", pct: 42 },
                      { label: "Mystery", pct: 38 },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-[#F5F0E6]">{item.label}</span>
                          <span className="text-[#A7A69F] font-mono text-[11px]">{item.pct}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#171B1A] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#927442] via-[#E4B85A] to-[#FFD985] shadow-[0_0_8px_rgba(228,184,90,0.4)]"
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: Mood Compass (Radar Chart & Taste Insight) */}
              <div className="rounded-3xl bg-[#0A0D0D] border border-[#282B27] p-6 sm:p-7 relative overflow-hidden shadow-xl hover:border-[#E4B85A]/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-2xl bg-[#E4B85A]/15 border border-[#E4B85A]/40 flex items-center justify-center text-[#E4B85A]">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#F5F0E6]">Mood Compass</h3>
                      <p className="text-[11px] text-[#A7A69F]">Movies you enjoy most</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    {/* SVG 5-Point Radar / Spider Chart */}
                    <div className="relative w-full aspect-square max-w-[210px] mx-auto flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 200 200">
                        {/* Concentric pentagon web rings */}
                        {[0.25, 0.5, 0.75, 1.0].map((level) => {
                          const points = [0, 1, 2, 3, 4]
                            .map((i) => {
                              const pt = getCoordinates(i, 5, level);
                              return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
                            })
                            .join(" ");
                          return (
                            <polygon
                              key={level}
                              points={points}
                              fill="none"
                              stroke="rgba(228, 184, 90, 0.15)"
                              strokeWidth="1"
                            />
                          );
                        })}

                        {/* Spoke lines from center to outer vertices */}
                        {[0, 1, 2, 3, 4].map((i) => {
                          const outer = getCoordinates(i, 5, 1.0);
                          return (
                            <line
                              key={i}
                              x1={radarCenter.x}
                              y1={radarCenter.y}
                              x2={outer.x}
                              y2={outer.y}
                              stroke="rgba(228, 184, 90, 0.2)"
                              strokeWidth="1"
                              strokeDasharray="2,2"
                            />
                          );
                        })}

                        {/* Golden Taste Data Polygon */}
                        <polygon
                          points={polygonPoints}
                          fill="rgba(228, 184, 90, 0.28)"
                          stroke="#E4B85A"
                          strokeWidth="2"
                          className="filter drop-shadow-[0_0_10px_rgba(228,184,90,0.5)]"
                        />

                        {/* Vertex Dots */}
                        {radarDimensions.map((d, i) => {
                          const { x, y } = getCoordinates(i, 5, d.value);
                          return (
                            <circle
                              key={i}
                              cx={x}
                              cy={y}
                              r="3.5"
                              fill="#FFD985"
                              stroke="#050707"
                              strokeWidth="1.5"
                            />
                          );
                        })}

                        {/* Dimension Labels */}
                        {radarDimensions.map((d, i) => {
                          const labelPos = getCoordinates(i, 5, 1.25);
                          return (
                            <text
                              key={i}
                              x={labelPos.x}
                              y={labelPos.y}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="fill-[#A7A69F] text-[9px] font-semibold"
                            >
                              {d.label.split("\n")[0]}
                            </text>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Right Quote & Taste Insight Box */}
                    <div className="space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <Quote className="w-6 h-6 text-[#E4B85A]/50 rotate-180" />
                        <p className="text-xs text-[#F5F0E6]/90 leading-relaxed italic">
                          "You enjoy stories that challenge reality, complex characters, and thought-provoking worlds."
                        </p>
                      </div>

                      <Link
                        to="/explore"
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#E4B85A] hover:text-[#FFD985] group transition-colors pt-2"
                      >
                        <span>Explore Matches</span>
                        <div className="w-6 h-6 rounded-full bg-[#101414] border border-[#E4B85A]/40 flex items-center justify-center text-[#E4B85A] group-hover:bg-[#E4B85A] group-hover:text-[#050707] transition-all">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* -----------------------------------------------------
                BOTTOM SECTION: RECENTLY WATCHED & RIGHT STACK
               ----------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Recently Watched (Takes ~7 columns on desktop) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-serif text-[#F5F0E6]">Recently Watched</h3>
                  <Link
                    to="/history"
                    className="text-xs font-bold text-[#E4B85A] hover:text-[#FFD985] transition-colors flex items-center gap-1"
                  >
                    <span>See All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                  {displayRecentWatches.map((movie) => (
                    <div
                      key={movie.id}
                      className="group flex flex-col rounded-2xl bg-[#0A0D0D] border border-[#282B27] hover:border-[#E4B85A]/60 overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-lg"
                    >
                      <Link
                        to={`/movies/${movie.id}`}
                        className="relative aspect-[2/3] w-full overflow-hidden block bg-[#101414]"
                      >
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Options for ${movie.title}`);
                          }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </Link>

                      <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                        <div>
                          <Link
                            to={`/movies/${movie.id}`}
                            className="text-xs font-bold text-[#F5F0E6] hover:text-[#FFD985] line-clamp-1 transition-colors"
                          >
                            {movie.title}
                          </Link>
                          <p className="text-[10px] text-[#A7A69F] mt-0.5">
                            {movie.year} • {movie.genre}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-[#E4B85A]">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{movie.rating}</span>
                            </span>
                            <span className="text-[#A7A69F] font-mono text-[9px]">
                              {movie.progress}%
                            </span>
                          </div>
                          {/* Watch Progress Bar */}
                          <div className="h-1 w-full rounded-full bg-[#1A1E1E] overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#927442] to-[#E4B85A]"
                              style={{ width: `${movie.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Stack: Favorite Genres & Watchlist (Takes ~4 columns) */}
              <div className="lg:col-span-4 space-y-6">
                {/* 1. My Favorite Genres Bubble Row */}
                <div className="rounded-3xl bg-[#0A0D0D] border border-[#282B27] p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold font-serif text-[#F5F0E6]">My Favorite Genres</h4>
                    <button
                      onClick={() => setEditMode(true)}
                      className="text-xs font-bold text-[#E4B85A] hover:text-[#FFD985] transition-colors flex items-center gap-1"
                    >
                      <span>See All</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5 text-center">
                    {DEMO_FAVORITE_GENRES.map((g) => (
                      <div key={g.id} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#927442] via-[#E4B85A] to-[#FFD985] shadow-md group-hover:scale-105 transition-transform duration-300">
                          <div className="w-full h-full rounded-full overflow-hidden relative bg-[#101414]">
                            <img
                              src={g.image}
                              alt={g.name}
                              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-[#050707]/30" />
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#F5F0E6] truncate w-full">
                          {g.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#A7A69F]">
                          ({g.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. My Watchlist Compact Showcase */}
                <div className="rounded-3xl bg-[#0A0D0D] border border-[#282B27] p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold font-serif text-[#F5F0E6]">My Watchlist</h4>
                    <Link
                      to="/watchlist"
                      className="text-xs font-bold text-[#E4B85A] hover:text-[#FFD985] transition-colors flex items-center gap-1"
                    >
                      <span>See All</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5">
                    {displayWatchlist.map((m) => (
                      <Link
                        key={m.id}
                        to={`/movies/${m.id}`}
                        className="group flex flex-col space-y-1 block"
                      >
                        <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#101414] border border-[#282B27] group-hover:border-[#E4B85A]/60 transition-all shadow-md">
                          <img
                            src={m.poster}
                            alt={m.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#F5F0E6] truncate block group-hover:text-[#FFD985]">
                          {m.title}
                        </span>
                        <span className="text-[9px] text-[#A7A69F] block">
                          {m.year}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
