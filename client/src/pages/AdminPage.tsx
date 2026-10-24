import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Users, FolderPlus, Trash2, Edit2, Search, Plus, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { useSearchMovies } from "../hooks/useMovies";
import { getPosterUrl } from "../utils/tmdb";
import type {
  SafeUser,
  CuratedCollection,
  CreateCollectionInput,
} from "@watchbox/shared";

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"users" | "collections">("collections");
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CuratedCollection | null>(
    null
  );

  // Collection Form State
  const [colTitle, setColTitle] = useState("");
  const [colSlug, setColSlug] = useState("");
  const [colDescription, setColDescription] = useState("");
  const [colCoverImage, setColCoverImage] = useState("");
  const [colMovieIds, setColMovieIds] = useState<number[]>([]);
  const [colIsFeatured, setColIsFeatured] = useState(false);
  const [colIsPublished, setColIsPublished] = useState(true);

  // TMDB Movie Search inside Collection Modal
  const [movieSearchQuery, setMovieSearchQuery] = useState("");
  const { data: searchResults } = useSearchMovies(movieSearchQuery, 1);

  // 1. Fetch Users
  const { data: usersData, refetch: refetchUsers } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiClient<{ users: SafeUser[] }>("/admin/users"),
    enabled: user?.role === "admin",
  });

  // 2. Fetch Collections
  const { data: collectionsData, refetch: refetchCollections } = useQuery({
    queryKey: ["admin", "collections"],
    queryFn: () => apiClient<{ collections: CuratedCollection[] }>("/collections"),
    enabled: user?.role === "admin",
  });

  // 3. User Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "user" | "admin" }) =>
      apiClient(`/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      refetchUsers();
      showToast("User role updated successfully", "success");
    },
    onError: (err: Error) => {
      showToast(err.message, "error");
    },
  });

  // 4. Create/Update Collection Mutation
  const saveCollectionMutation = useMutation({
    mutationFn: (payload: Partial<CreateCollectionInput>) => {
      if (editingCollection) {
        return apiClient(`/admin/collections/${editingCollection.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        return apiClient("/admin/collections", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
    },
    onSuccess: () => {
      refetchCollections();
      setCollectionModalOpen(false);
      resetCollectionForm();
      showToast(
        editingCollection
          ? "Collection updated successfully"
          : "Collection created successfully",
        "success"
      );
    },
    onError: (err: Error) => {
      showToast(err.message, "error");
    },
  });

  // 5. Delete Collection Mutation
  const deleteCollectionMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/admin/collections/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      refetchCollections();
      showToast("Collection deleted", "info");
    },
    onError: (err: Error) => {
      showToast(err.message, "error");
    },
  });

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6 text-center pt-24">
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <Shield className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-black text-white">Access Restricted</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Administrator credentials are required to view this panel. Hiding UI elements
            is not security; the server strictly enforces role checks on every request.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const resetCollectionForm = () => {
    setEditingCollection(null);
    setColTitle("");
    setColSlug("");
    setColDescription("");
    setColCoverImage("");
    setColMovieIds([]);
    setColIsFeatured(false);
    setColIsPublished(true);
    setMovieSearchQuery("");
  };

  const handleOpenEdit = (col: CuratedCollection) => {
    setEditingCollection(col);
    setColTitle(col.title);
    setColSlug(col.slug);
    setColDescription(col.description);
    setColCoverImage(col.coverImage || "");
    setColMovieIds(col.tmdbMovieIds);
    setColIsFeatured(col.isFeatured);
    setColIsPublished(col.isPublished);
    setCollectionModalOpen(true);
  };

  const handleCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCollectionMutation.mutate({
      title: colTitle.trim(),
      slug: colSlug.trim().toLowerCase(),
      description: colDescription.trim(),
      coverImage: colCoverImage.trim() || undefined,
      tmdbMovieIds: colMovieIds,
      isFeatured: colIsFeatured,
      isPublished: colIsPublished,
    });
  };

  const toggleMovieInCollection = (tmdbId: number) => {
    if (colMovieIds.includes(tmdbId)) {
      setColMovieIds(colMovieIds.filter((id) => id !== tmdbId));
    } else {
      setColMovieIds([...colMovieIds, tmdbId]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 pt-24 pb-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Admin Operations
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Curated collection publishing, movie catalog indexing, and user role
                management
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab("collections")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "collections"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Curated Collections</span>
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "users"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User & Role Controls</span>
            </button>
          </div>
        </div>

        {/* TAB 1: CURATED COLLECTIONS */}
        {activeTab === "collections" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Homepage & Explore Collections
                </h2>
                <p className="text-xs text-slate-400">
                  Featured collections highlight hand-picked TMDB movies on the user
                  homepage
                </p>
              </div>

              <button
                onClick={() => {
                  resetCollectionForm();
                  setCollectionModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Collection</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(collectionsData?.collections || []).map((col) => (
                <div
                  key={col.id}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                        /{col.slug}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {col.isFeatured && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                            Featured
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            col.isPublished
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {col.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-1">
                      {col.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {col.description}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {col.tmdbMovieIds.length} TMDB Movies Linked
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleOpenEdit(col)}
                      className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit & Movies</span>
                    </button>

                    <button
                      onClick={() => deleteCollectionMutation.mutate(col.id)}
                      className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Registered Users</h2>
              <p className="text-xs text-slate-400">
                Safe projection fields only. Passwords and secret hashes are never queried
                or exposed.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Registered</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {(usersData?.users || []).map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase">
                            {u.displayName.substring(0, 2)}
                          </div>
                          <span>{u.displayName}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {u.email}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.role === "admin"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {u.role === "admin" ? (
                            <button
                              onClick={() =>
                                updateRoleMutation.mutate({ userId: u.id, role: "user" })
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300"
                            >
                              Demote to User
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                updateRoleMutation.mutate({ userId: u.id, role: "admin" })
                              }
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold"
                            >
                              Promote to Admin
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT COLLECTION MODAL WITH TMDB MOVIE PICKER */}
      {collectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingCollection
                    ? "Edit Curated Collection"
                    : "Create Curated Collection"}
                </h3>
                <p className="text-xs text-slate-400">
                  Select and attach TMDB movies using the search picker below
                </p>
              </div>
              <button
                onClick={() => setCollectionModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectionSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Collection Title
                  </label>
                  <input
                    type="text"
                    value={colTitle}
                    onChange={(e) => {
                      setColTitle(e.target.value);
                      if (!editingCollection) {
                        setColSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, "")
                        );
                      }
                    }}
                    placeholder="e.g. Nolan's Mind-Bending Realities"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Unique Slug (lowercase, hyphens)
                  </label>
                  <input
                    type="text"
                    value={colSlug}
                    onChange={(e) => setColSlug(e.target.value)}
                    placeholder="e.g. nolan-realities"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={colDescription}
                  onChange={(e) => setColDescription(e.target.value)}
                  rows={2}
                  required
                  placeholder="Curator's introduction to this movie collection..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Featured & Published Checkboxes */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={colIsFeatured}
                    onChange={(e) => setColIsFeatured(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                  />
                  <span>Feature on Homepage Spotlight</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={colIsPublished}
                    onChange={(e) => setColIsPublished(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
                  />
                  <span>Published & Visible</span>
                </label>
              </div>

              {/* TMDB Movie Picker with Search */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    Attached Movies ({colMovieIds.length} Selected)
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    IDs: [{colMovieIds.join(", ")}]
                  </span>
                </div>

                {/* Live Search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={movieSearchQuery}
                    onChange={(e) => setMovieSearchQuery(e.target.value)}
                    placeholder="Search TMDB to add movies to this collection..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Search Results Preview */}
                {movieSearchQuery &&
                  searchResults?.results &&
                  searchResults.results.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                      {searchResults.results.slice(0, 8).map((m) => {
                        const isSelected = colMovieIds.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleMovieInCollection(m.id)}
                            className={`flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors border ${
                              isSelected
                                ? "bg-amber-500/20 border-amber-500/60"
                                : "bg-slate-900 border-slate-800 hover:bg-slate-800"
                            }`}
                          >
                            <img
                              src={getPosterUrl(m.posterPath, "w342")}
                              alt={m.title}
                              className="w-8 aspect-[2/3] object-cover rounded shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-white truncate">
                                {m.title}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                {isSelected ? "✓ Attached" : "+ Add"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCollectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveCollectionMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                >
                  {saveCollectionMutation.isPending
                    ? "Saving..."
                    : editingCollection
                      ? "Update Collection"
                      : "Create Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
