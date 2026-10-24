import React from "react";

export interface GlowSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onFilterClick?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export const GlowSearchInput: React.FC<GlowSearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search movies, genres, actors...",
  onSubmit,
  onFilterClick,
  className = "",
  autoFocus = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className={`search-poda-wrapper ${className}`}>
      <div className="grid"></div>
      <div id="poda">
        <div className="glow"></div>
        <div className="darkBorderBg"></div>
        <div className="darkBorderBg"></div>
        <div className="darkBorderBg"></div>

        <div className="white"></div>

        <div className="border"></div>

        <div id="main">
          <input
            placeholder={placeholder}
            type="text"
            name="text"
            className="input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
          />
          <div id="input-mask"></div>
          <div id="pink-mask"></div>
          <div className="filterBorder"></div>
          <div
            id="filter-icon"
            onClick={onFilterClick || onSubmit}
            title="Browse / Filter Categories"
            role="button"
            tabIndex={0}
          >
            <svg
              preserveAspectRatio="none"
              height="20"
              width="20"
              viewBox="4.8 4.56 14.832 15.408"
              fill="none"
            >
              <path
                d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z"
                stroke="#FFD985"
                strokeWidth="1.2"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </div>
          <div
            id="search-icon"
            onClick={onSubmit}
            role="button"
            tabIndex={0}
            title="Submit search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              strokeWidth="2.2"
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
              className="feather feather-search transition-transform hover:scale-110"
            >
              <circle stroke="url(#search-gold)" r="8" cy="11" cx="11"></circle>
              <line
                stroke="url(#searchl-gold)"
                y2="16.65"
                y1="22"
                x2="16.65"
                x1="22"
              ></line>
              <defs>
                <linearGradient gradientTransform="rotate(50)" id="search-gold">
                  <stop stopColor="#FFFFFF" offset="0%"></stop>
                  <stop stopColor="#FFD985" offset="50%"></stop>
                  <stop stopColor="#E4B85A" offset="100%"></stop>
                </linearGradient>
                <linearGradient id="searchl-gold">
                  <stop stopColor="#FFFFFF" offset="0%"></stop>
                  <stop stopColor="#E4B85A" offset="50%"></stop>
                  <stop stopColor="#C6922C" offset="100%"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
