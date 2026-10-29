import React from "react";

export interface NeonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  showSparkle?: boolean;
  hoverText?: string;
  gradientVariant?: string;
  variant?: "primary" | "secondary";
}

/**
 * Neon Gold + Black Uiverse-style Button
 * Features 3D mechanical border shift (border-b-4 to hover:border-t-4)
 * and an animated sweeping neon gold light beam.
 */
export const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  icon,
  size = "md",
  showSparkle = false,
  hoverText: _hoverText,
  gradientVariant: _gradientVariant,
  variant: _variant,
  className = "",
  disabled = false,
  ...props
}) => {
  // Proportional sizing aligned to layout (neither too large nor too short)
  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs rounded-md",
    md: "px-4 py-2 text-xs sm:text-sm rounded-md",
    lg: "px-5 py-2.5 text-sm sm:text-base rounded-md",
  }[size];

  return (
    <button
      {...props}
      disabled={disabled}
      className={`bg-[#101414] text-[#E4B85A] border border-[#E4B85A] border-b-4 font-medium overflow-hidden relative ${sizeClasses} hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none disabled:hover:brightness-100 disabled:hover:border-b-4 disabled:hover:border-t ${className}`}
    >
      {/* Animated Sweeping Neon Gold Glow Beam */}
      <span className="bg-[#E4B85A] shadow-[#E4B85A] absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(228,184,90,0.3)] pointer-events-none" />

      {showSparkle && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          className="w-4 h-4 stroke-[#E4B85A] group-hover:stroke-[#FFD985] transition-colors shrink-0"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0 2.456 2.456Z"
          />
        </svg>
      )}

      {icon && <span className="shrink-0">{icon}</span>}
      <span className="relative z-10 font-semibold group-hover:text-[#FFD985] transition-colors flex items-center gap-2">
        {children}
      </span>
    </button>
  );
};
