import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  User as UserIcon,
  Bookmark,
  Eye,
  Star,
  Edit3,
  Check,
  Dna,
  Save,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { useGenres } from "../hooks/useMovies";
import { NeonButton } from "../components/NeonButton";
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

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { data: genresData } = useGenres();

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
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6 text-center pt-24">
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <UserIcon className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Profile Access</h2>
          <p className="text-xs text-slate-400">
            Please sign in to view and edit your profile, preferences, and personal stats.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  const stats = profileData?.stats || {
    watchlistCount: 0,
    ratingsCount: 0,
    historyCount: 0,
    averageRating: 0,
  };

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

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 pt-24 pb-20 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Profile Header Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/30 border border-slate-800 p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-indigo-600 flex items-center justify-center text-2xl font-black text-white uppercase shadow-xl shadow-rose-600/30">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  user.displayName.substring(0, 2)
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    {user.displayName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                {user.bio ? (
                  <p className="text-xs text-slate-300 mt-2 max-w-lg leading-relaxed">
                    {user.bio}
                  </p>
                ) : (
                  <p className="text-xs italic text-slate-500 mt-2">No bio added yet.</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors shadow-md"
            >
              <Edit3 className="w-3.5 h-3.5 text-rose-400" />
              <span>{editMode ? "Cancel Editing" : "Edit Profile"}</span>
            </button>
          </div>
        </div>

        {/* Edit Profile Form */}
        {editMode && (
          <form
            onSubmit={handleSaveProfile}
            className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in slide-in-from-top-3"
          >
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Edit Profile & Taste Calibration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Bio / Taste Motto
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Sci-fi enthusiast & Nolan admirer"
                  maxLength={300}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Favorite Genres (Feeds directly into your WatchBox DNA)
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
                          ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                          : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 inline mr-1" />}
                      <span>{genre.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
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

        {/* Lifetime Activity Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <Bookmark className="w-4 h-4" />
              <span>Watchlist</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {stats.watchlistCount}
            </p>
            <p className="text-[11px] text-slate-500">Movies bookmarked</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              <span>Watched</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {stats.historyCount}
            </p>
            <p className="text-[11px] text-slate-500">Films in history</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Star className="w-4 h-4" />
              <span>Ratings</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {stats.ratingsCount}
            </p>
            <p className="text-[11px] text-slate-500">Scores submitted</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Dna className="w-4 h-4" />
              <span>Avg Score</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {stats.averageRating > 0 ? `${stats.averageRating}/10` : "—"}
            </p>
            <p className="text-[11px] text-slate-500">Overall taste score</p>
          </div>
        </div>

        {/* Favorite Genres Calibrated Tags */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Dna className="w-4 h-4 text-rose-400" />
            <span>Active Taste DNA Calibrations</span>
          </h3>
          {user.favoriteGenres && user.favoriteGenres.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {user.favoriteGenres.map((genreId) => {
                const genreName =
                  genresData?.genres.find((g) => g.id === genreId)?.name ||
                  `Genre #${genreId}`;
                return (
                  <span
                    key={genreId}
                    className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-rose-300"
                  >
                    {genreName}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              No favorite genres selected yet. Click "Edit Profile" above to calibrate
              your WatchBox DNA taste profile.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
