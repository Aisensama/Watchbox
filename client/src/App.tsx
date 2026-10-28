import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { AuthModal } from "./components/AuthModal";
import { NeonGoldLoader } from "./components/NeonGoldLoader";

// Code-split pages for instant initial bundle loading
const HomePage = React.lazy(() =>
  import("./pages/HomePage").then((m) => ({ default: m.HomePage }))
);
const ExplorePage = React.lazy(() =>
  import("./pages/ExplorePage").then((m) => ({ default: m.ExplorePage }))
);
const MovieDetailPage = React.lazy(() =>
  import("./pages/MovieDetailPage").then((m) => ({ default: m.MovieDetailPage }))
);
const WatchlistPage = React.lazy(() =>
  import("./pages/WatchlistPage").then((m) => ({ default: m.WatchlistPage }))
);
const HistoryPage = React.lazy(() =>
  import("./pages/HistoryPage").then((m) => ({ default: m.HistoryPage }))
);
const ProfilePage = React.lazy(() =>
  import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage }))
);
const AdminPage = React.lazy(() =>
  import("./pages/AdminPage").then((m) => ({ default: m.AdminPage }))
);
const LoginPage = React.lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = React.lazy(() =>
  import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: true,
      staleTime: 60 * 1000, // 1 minute fresh window, auto-syncs on window focus
      gcTime: 15 * 60 * 1000,
    },
  },
});

export const AppContent: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  const openAuth = (mode: "login" | "register") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050707] text-[#F5F0E6] selection:bg-[#E4B85A] selection:text-[#050707] relative overflow-x-hidden">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onOpenAuthModal={openAuth} />

        <main className="flex-1">
          <React.Suspense
            fallback={
              <div className="min-h-[60vh] flex items-center justify-center">
                <NeonGoldLoader size="md" label="Loading WatchBox..." />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage onOpenAuthModal={openAuth} />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/movies" element={<ExplorePage defaultContentType="movies" />} />
              <Route path="/tv-shows" element={<ExplorePage defaultContentType="tv" />} />
              <Route path="/tv" element={<ExplorePage defaultContentType="tv" />} />
              <Route path="/movies/:id" element={<MovieDetailPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/my-list" element={<Navigate to="/watchlist" replace />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="*"
                element={
                  <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <h1 className="text-4xl font-black text-white">404</h1>
                    <p className="text-sm text-slate-400">
                      The page you requested could not be found.
                    </p>
                    <a
                      href="/"
                      className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
                    >
                      Return to Home
                    </a>
                  </div>
                }
              />
            </Routes>
          </React.Suspense>
        </main>

        <Footer />
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
