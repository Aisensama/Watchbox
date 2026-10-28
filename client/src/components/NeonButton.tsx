import React from "react";

export interface NeonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  showSparkle?: boolean;
  hoverText?: string;
  gradientVariant?: string;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  icon,
  size = "md",
  showSparkle = false,
  hoverText: _hoverText,
  gradientVariant: _gradientVariant,
  className = "",
  disabled = false,
  ...props
}) => {
  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs rounded-lg",
    md: "px-5 py-2 text-xs sm:text-sm rounded-xl",
    lg: "px-7 py-3 text-sm sm:text-base rounded-2xl",
  }[size];

  const innerRadius = {
    sm: "rounded-[6px]",
    md: "rounded-[10px]",
    lg: "rounded-[14px]",
  }[size];

  return (
    <button
      {...props}
      disabled={disabled}
      className={`group relative p-[1.5px] inline-flex items-center justify-center transition-all duration-300 ease-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100 cursor-pointer overflow-hidden bg-gradient-to-br from-[#927442] via-[#E4B85A] to-[#FFD985] hover:from-[#E4B85A] hover:via-[#FFD985] hover:to-[#FFFFFF] hover:shadow-xl hover:shadow-[#E4B85A]/40 ${
        size === "sm" ? "rounded-lg" : size === "lg" ? "rounded-2xl" : "rounded-xl"
      } ${className}`}
    >
      {/* Inner Dark Backdrop with Glass Blur */}
      <div
        className={`w-full h-full bg-[#050707]/92 group-hover:bg-[#0A0D0D]/80 backdrop-blur-xl transition-all duration-300 flex items-center justify-center ${innerRadius} ${sizeClasses}`}
      >
        <div className="flex items-center gap-2 text-[#E4B85A] group-hover:text-[#FFD985] font-bold tracking-wide transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(228,184,90,0.85)]">
          {showSparkle && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              className="w-4 h-4 stroke-[#E4B85A] group-hover:stroke-[#FFD985] transition-colors animate-pulse"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0 2.456 2.456Z"
              />
            </svg>
          )}

          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </div>
      </div>
    </button>
  );
};
