const TMDB_IMAGE_BASE =
  import.meta.env.VITE_TMDB_IMAGE_BASE_URL || "https://image.tmdb.org/t/p";

export const getPosterUrl = (
  path: string | null | undefined,
  size: "w342" | "w500" | "original" = "w500"
): string => {
  if (!path) {
    return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (
  path: string | null | undefined,
  size: "w780" | "w1280" | "original" = "w1280"
): string => {
  if (!path) {
    return "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&auto=format&fit=crop&q=80";
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const formatRuntime = (minutes?: number | null): string => {
  if (!minutes || minutes <= 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

export const formatReleaseYear = (dateStr?: string): string => {
  if (!dateStr) return "";
  return dateStr.split("-")[0] || "";
};
