import React from "react";

export interface GlowSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onFilterClick?: () => void;
  showFilterButton?: boolean;
  className?: string;
  compact?: boolean;
  autoFocus?: boolean;
}

export const GlowSearchInput: React.FC<GlowSearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search movies, genres, actors...",
  onSubmit,
  onFilterClick,
  showFilterButton = true,
  className = "",
  compact = false,
  autoFocus = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className={`wb-glow-wrapper ${compact ? "compact" : ""} ${className}`}>
      <div className="wb-poda">
        <div className="wb-glow" />
        <div className="wb-darkBorderBg" />
        <div className="wb-white" />
        <div className="wb-border" />

        <div className="wb-main">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="wb-input"
          />

          <div className="wb-input-mask" />
          <div className="wb-pink-mask" />

          {/* Search Icon */}
          <div className="wb-search-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={compact ? "18" : "20"}
              height={compact ? "18" : "20"}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-300"
            >
              <circle cx="11" cy="11" r="8" stroke="url(#wb-search-grad)" />
              <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
                stroke="url(#wb-search-line)"
              />
              <defs>
                <linearGradient id="wb-search-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop stopColor="#f43f5e" offset="0%" />
                  <stop stopColor="#c084fc" offset="50%" />
                  <stop stopColor="#60a5fa" offset="100%" />
                </linearGradient>
                <linearGradient id="wb-search-line" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop stopColor="#c084fc" offset="0%" />
                  <stop stopColor="#f43f5e" offset="100%" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Optional Filter Icon Button */}
          {showFilterButton && (
            <button
              type="button"
              onClick={onFilterClick}
              aria-label="Filter"
              className="wb-filter-btn group"
            >
              <div className="wb-filterBorder" />
              <div className="wb-filter-icon">
                <svg
                  height={compact ? "18" : "22"}
                  width={compact ? "18" : "22"}
                  viewBox="4.8 4.56 14.832 15.408"
                  fill="none"
                  className="transition-transform group-hover:scale-110"
                >
                  <path
                    d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z"
                    stroke="#e2e8f0"
                    strokeWidth="1.2"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          )}

          {/* Clear button if text entered */}
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className={`absolute top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white transition-colors ${
                showFilterButton ? (compact ? "right-11" : "right-14") : "right-4"
              }`}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
