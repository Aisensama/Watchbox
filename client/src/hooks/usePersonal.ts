import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type {
  WatchlistItem,
  RatingItem,
  WatchHistoryItem,
  RatingInput,
  CuratedCollection,
} from "@watchbox/shared";

// --- Watchlist ---
export const useWatchlist = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["watchlist", user?.id],
    queryFn: () => apiClient<{ items: WatchlistItem[] }>("/watchlist"),
    enabled: Boolean(user),
  });
};

export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (tmdbId: number) =>
      apiClient<{ message: string; item: WatchlistItem }>("/watchlist", {
        method: "POST",
        body: JSON.stringify({ tmdbId }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["watchlist", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["movies", "dna"] });
      showToast(data.message || "Added to watchlist", "success");
    },
    onError: (err: Error) => {
      showToast(err.message, "error");
    },
  });
};

export const useRemoveFromWatchlist = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (tmdbId: number) =>
      apiClient<{ message: string; tmdbId: number }>(`/watchlist/${tmdbId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist", user?.id] });
      showToast("Removed from watchlist", "info");
    },
    onError: (err: Error) => {
      showToast(err.message, "error");
    },
  });
};

// --- Ratings ---
export const useRatings = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ratings", user?.id],
    queryFn: () => apiClient<{ ratings: RatingItem[] }>("/ratings"),
    enabled: Boolean(user),
  });
};

export const useSaveRating = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ tmdbId, input }: { tmdbId: number; input: RatingInput }) =>
      apiClient<{ message: string; rating: RatingItem }>(`/ratings/${tmdbId}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ratings", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["movies", "dna"] });
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
      showToast("Rating saved!", "success");
    },
    onError: (err: Error) => {
      showToast(err.message, "error");
    },
  });
};

export const useRemoveRating = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (tmdbId: number) =>
      apiClient<{ message: string; tmdbId: number }>(`/ratings/${tmdbId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ratings", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["movies", "dna"] });
      showToast("Rating removed", "info");
    },
    onError: (err: Error) => {
      showToast(err.message, "error");
    },
  });
};

// --- Watch History ---
export const useHistory = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["history", user?.id],
    queryFn: () => apiClient<{ history: WatchHistoryItem[] }>("/history"),
    enabled: Boolean(user),
  });
};

export const useRecordHistory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ tmdbId, watchedAt }: { tmdbId: number; watchedAt?: string }) =>
      apiClient<{ message: string; item: WatchHistoryItem }>(`/history/${tmdbId}`, {
        method: "POST",
        body: JSON.stringify({ watchedAt }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["movies", "dna"] });
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
      showToast("Marked as watched!", "success");
    },
    onError: (err: Error) => {
      showToast(err.message, "error");
    },
  });
};

export const useRemoveHistory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (tmdbId: number) =>
      apiClient<{ message: string; tmdbId: number }>(`/history/${tmdbId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["movies", "dna"] });
      showToast("Removed from watch history", "info");
    },
    onError: (err: Error) => {
      showToast(err.message, "error");
    },
  });
};

// --- Curated Collections ---
export const useCuratedCollections = (featuredOnly = false) => {
  return useQuery({
    queryKey: ["collections", { featuredOnly }],
    queryFn: () =>
      apiClient<{ collections: CuratedCollection[] }>(
        `/collections${featuredOnly ? "?featured=true" : ""}`
      ),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCuratedCollectionBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["collection", slug],
    queryFn: () => apiClient<{ collection: CuratedCollection }>(`/collections/${slug}`),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
};
