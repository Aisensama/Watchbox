import React, { useEffect } from "react";
import { X } from "lucide-react";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerKey: string | null;
  title: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  trailerKey,
  title,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="neon-layout-border relative w-full max-w-4xl bg-[#0A0D0D] border border-[#282B27] rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#282B27] bg-[#101414]">
          <h3 className="font-serif text-base sm:text-lg text-[#F5F0E6] truncate pr-4">
            {title} <span className="text-[#E4B85A] text-sm">— Official Trailer</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A7A69F] hover:text-[#F5F0E6] hover:bg-[#171B1A] transition-colors"
            aria-label="Close trailer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full aspect-video bg-black">
          {trailerKey ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
              title={`${title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-3">
              <p className="text-sm font-semibold text-[#F5F0E6]">Trailer Not Available</p>
              <p className="text-xs text-[#A7A69F] max-w-sm">
                No official trailer video is currently attached to this title in the TMDB catalog.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
