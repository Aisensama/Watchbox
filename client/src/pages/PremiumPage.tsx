import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Crown,
  Check,
  XCircle,
  Tv,
  Download,
  Sparkles,
  BarChart3,
  Rocket,
  Headphones,
  ArrowRight,
  X,
  ShieldCheck,
  Clock,
  ChevronUp,
} from "lucide-react";

export const PremiumPage: React.FC = () => {
  const navigate = useNavigate();

  // Subscription Process Modal State ("specialized thanks box")
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: string;
    cycle: string;
    orderId: string;
  } | null>(null);

  // FAQ Accordion State
  const [faqsExpanded, setFaqsExpanded] = useState(false);

  const handleSubscribe = (planName: string, price: string, cycle: string) => {
    // Generate unique order ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `WB-${planName.substring(0, 3).toUpperCase()}-${randomSuffix}`;

    setSelectedPlan({
      name: planName,
      price,
      cycle,
      orderId,
    });
    setIsProcessingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050707] text-[#F5F0E6] pb-24 selection:bg-[#E4B85A] selection:text-[#050707]">
      {/* ------------------------------------------------------------------
          1. CINEMATIC HERO SECTION (Exact Reference Match)
         ------------------------------------------------------------------ */}
      <section className="relative w-full h-[380px] sm:h-[440px] md:h-[500px] lg:h-[540px] overflow-hidden">
        {/* Living Room Cinema Atmosphere Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat transition-all duration-700"
          style={{
            backgroundImage: "url('/movies-hero.jpg')",
            backgroundPosition: "center 30%",
          }}
        />

        {/* Ambient Dark Vignette & Gold Atmosphere Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050707] via-[#050707]/60 to-transparent opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050707]/95 via-[#050707]/40 to-transparent max-w-2xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#050707]" />

        {/* Hero Content Grid: Left Title + Right Calligraphy */}
        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
          {/* Left Title & Description */}
          <div className="max-w-xl space-y-3 sm:space-y-4 pt-4 sm:pt-6">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#E4B85A] uppercase">
              MORE THAN MOVIES
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-[#F5F0E6] leading-[1.06] tracking-tight">
              Upgrade Your<br />Movie Experience
            </h1>

            <p className="text-xs sm:text-sm text-[#A7A69F] leading-relaxed max-w-lg">
              Unlock a world of premium features and enjoy cinema the way it's meant to be — without limits.
            </p>

            {/* Social Proof: Overlapping User Avatars */}
            <div className="pt-2 flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden">
                <img
                  className="inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full ring-2 ring-[#050707] object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="User 1"
                />
                <img
                  className="inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full ring-2 ring-[#050707] object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="User 2"
                />
                <img
                  className="inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full ring-2 ring-[#050707] object-cover"
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                  alt="User 3"
                />
                <img
                  className="inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full ring-2 ring-[#050707] object-cover"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                  alt="User 4"
                />
              </div>
              <span className="text-xs text-[#A7A69F] leading-tight">
                Join thousands of movie lovers enjoying a better experience.
              </span>
            </div>
          </div>

          {/* Right Calligraphy: "Good Movies Better Humans" */}
          <div className="hidden lg:flex flex-col items-end justify-center select-none pr-4">
            <p className="font-serif italic text-3xl xl:text-4xl font-light text-[#E4B85A]/90 tracking-wide text-right leading-tight drop-shadow-[0_2px_15px_rgba(228,184,90,0.35)]">
              Good<br />
              Movies<br />
              Better<br />
              Humans
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          2. PRICING & SUBSCRIPTION CARDS GRID (3 Cards Side-by-Side)
         ------------------------------------------------------------------ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-8 sm:-mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* =============================================================
              CARD 1: FREE PLAN
             ============================================================= */}
          <div className="bg-[#0A0D0D] border border-[#282B27] rounded-3xl p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between hover:border-[#E4B85A]/30 transition-all">
            {/* Subtle atmospheric backdrop in top right */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none rounded-bl-full" />

            <div className="space-y-5">
              {/* Card Header */}
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#F5F0E6]">Free</h3>
                <p className="text-xs text-[#A7A69F] mt-1">A great start for casual viewers</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl sm:text-4xl font-black text-[#F5F0E6]">₹0</span>
                <span className="text-xs text-[#A7A69F]">/ month</span>
              </div>

              {/* Action Button: Current Plan */}
              <button
                disabled
                className="w-full py-3 rounded-xl bg-[#101414] border border-[#282B27] text-xs font-semibold text-[#A7A69F] cursor-default"
              >
                Current Plan
              </button>

              {/* Checklist */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6]">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>Watch trailers</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6]">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>Browse full movie catalog</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6]">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>Create watchlist</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#A7A69F]/50">
                  <XCircle className="w-4 h-4 text-[#A7A69F]/30 shrink-0" />
                  <span>Watch full movies/videos</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#A7A69F]/50">
                  <XCircle className="w-4 h-4 text-[#A7A69F]/30 shrink-0" />
                  <span>Offline downloads</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#A7A69F]/50">
                  <XCircle className="w-4 h-4 text-[#A7A69F]/30 shrink-0" />
                  <span>Ad-free experience</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#A7A69F]/50">
                  <XCircle className="w-4 h-4 text-[#A7A69F]/30 shrink-0" />
                  <span>Advanced recommendations</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#A7A69F]/50">
                  <XCircle className="w-4 h-4 text-[#A7A69F]/30 shrink-0" />
                  <span>Personalized analytics</span>
                </div>
              </div>
            </div>
          </div>

          {/* =============================================================
              CARD 2: PREMIUM PLAN (FEATURED / MOST POPULAR)
             ============================================================= */}
          <div className="bg-[#0A0D0D] border-2 border-[#E4B85A] rounded-3xl p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between shadow-[0_0_35px_rgba(228,184,90,0.25)] md:-translate-y-3 transition-all">
            {/* MOST POPULAR Pill Badge pinned on top */}
            <div className="absolute top-0 left-6 -translate-y-1/2 z-20">
              <span className="bg-[#E4B85A] text-[#050707] text-[10px] font-extrabold tracking-wider uppercase px-3.5 py-1 rounded-full shadow-md shadow-[#E4B85A]/40">
                MOST POPULAR
              </span>
            </div>

            {/* Glowing cosmic flare backdrop in top right */}
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-[#E4B85A]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-5 pt-1">
              {/* Card Header */}
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#FFD985]">Premium</h3>
                <p className="text-xs text-[#A7A69F] mt-1">The complete movie experience</p>
              </div>

              {/* Price Row with Discount Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-3xl sm:text-4xl font-black text-[#F5F0E6]">₹149</span>
                  <span className="text-xs text-[#A7A69F]">/ month</span>
                  <span className="text-xs text-[#A7A69F] line-through ml-1">₹249</span>
                </div>
                <span className="bg-[#E4B85A]/20 text-[#FFD985] border border-[#E4B85A]/50 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                  Save 40%
                </span>
              </div>

              {/* Action Button: Get Premium */}
              <button
                onClick={() => handleSubscribe("Premium Monthly", "₹149", "month")}
                className="w-full bg-[#101414] text-[#E4B85A] border border-[#E4B85A] border-b-4 font-medium overflow-hidden relative py-2.5 px-4 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group inline-flex items-center justify-center gap-2 text-xs font-extrabold cursor-pointer"
              >
                <span className="bg-[#E4B85A] shadow-[#E4B85A] absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(228,184,90,0.3)] pointer-events-none" />
                <Crown className="w-4 h-4 fill-current shrink-0" />
                <span className="relative z-10 group-hover:text-[#FFD985]">Get Premium</span>
              </button>

              {/* Checklist */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6] font-medium">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>
                    Watch full movies <span className="text-[#A7A69F] text-[11px]">(where available)</span>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6] font-medium">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>Ad-free experience</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6] font-medium">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>HD & 4K streaming</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6] font-medium">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>Offline downloads</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6] font-medium">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>Advanced AI recommendations</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6] font-medium">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>Personalized watch analytics</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6] font-medium">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>Early access to new features</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6] font-medium">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>Priority support</span>
                </div>
              </div>
            </div>
          </div>

          {/* =============================================================
              CARD 3: ANNUAL PLAN
             ============================================================= */}
          <div className="bg-[#0A0D0D] border border-[#282B27] rounded-3xl p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between hover:border-[#E4B85A]/40 transition-all">
            {/* Subtle atmospheric backdrop */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#E4B85A]/5 to-transparent pointer-events-none rounded-bl-full" />

            <div className="space-y-5">
              {/* Card Header */}
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#F5F0E6]">Annual</h3>
                <p className="text-xs text-[#A7A69F] mt-1">Best value for true movie lovers</p>
              </div>

              {/* Price Row with Discount Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif text-3xl sm:text-4xl font-black text-[#F5F0E6]">₹1,499</span>
                  <span className="text-xs text-[#A7A69F]">/ year</span>
                  <span className="text-xs text-[#A7A69F] line-through ml-1">₹3,588</span>
                </div>
                <span className="bg-[#E4B85A]/20 text-[#FFD985] border border-[#E4B85A]/50 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                  Save 58%
                </span>
              </div>

              {/* Action Button: Get Annual */}
              <button
                onClick={() => handleSubscribe("Annual VIP", "₹1,499", "year")}
                className="w-full bg-[#101414] text-[#E4B85A] border border-[#E4B85A] border-b-4 font-medium overflow-hidden relative py-2.5 px-4 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group inline-flex items-center justify-center gap-2 text-xs font-extrabold cursor-pointer"
              >
                <span className="bg-[#E4B85A] shadow-[#E4B85A] absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(228,184,90,0.3)] pointer-events-none" />
                <span className="relative z-10 group-hover:text-[#FFD985]">Get Annual</span>
              </button>

              {/* Checklist */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6] font-medium">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>
                    Watch full movies <span className="text-[#A7A69F] text-[11px]">(where available)</span>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6] font-medium">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>Ad-free experience</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6] font-medium">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>HD & 4K streaming</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6] font-medium">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>Offline downloads</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6] font-medium">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>Advanced AI recommendations</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6] font-medium">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>Personalized watch analytics</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6] font-medium">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>Early access to new features</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#F5F0E6] font-medium">
                  <Check className="w-4 h-4 text-[#E4B85A] shrink-0" />
                  <span>Priority support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          3. FEATURES HIGHLIGHTS ROW (Horizontal 7-Icon Bar)
         ------------------------------------------------------------------ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-16">
        <div className="border-t border-b border-[#282B27] py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 text-left">
            {/* 1. Ad-Free */}
            <div className="flex flex-col gap-2">
              <Tv className="w-6 h-6 text-[#E4B85A]" />
              <h5 className="text-xs font-bold text-[#F5F0E6]">Ad-Free Experience</h5>
              <p className="text-[11px] text-[#A7A69F] leading-tight">Enjoy uninterrupted watching</p>
            </div>

            {/* 2. HD & 4K */}
            <div className="flex flex-col gap-2">
              <div className="w-fit px-1.5 py-0.5 rounded border border-[#E4B85A] text-[10px] font-black text-[#E4B85A]">
                4K
              </div>
              <h5 className="text-xs font-bold text-[#F5F0E6]">HD & 4K Streaming</h5>
              <p className="text-[11px] text-[#A7A69F] leading-tight">Stunning picture quality</p>
            </div>

            {/* 3. Offline Downloads */}
            <div className="flex flex-col gap-2">
              <Download className="w-6 h-6 text-[#E4B85A]" />
              <h5 className="text-xs font-bold text-[#F5F0E6]">Offline Downloads</h5>
              <p className="text-[11px] text-[#A7A69F] leading-tight">Watch anywhere, anytime</p>
            </div>

            {/* 4. AI Recommendations */}
            <div className="flex flex-col gap-2">
              <Sparkles className="w-6 h-6 text-[#E4B85A]" />
              <h5 className="text-xs font-bold text-[#F5F0E6]">AI Recommendations</h5>
              <p className="text-[11px] text-[#A7A69F] leading-tight">Find movies you'll love</p>
            </div>

            {/* 5. Personalized Analytics */}
            <div className="flex flex-col gap-2">
              <BarChart3 className="w-6 h-6 text-[#E4B85A]" />
              <h5 className="text-xs font-bold text-[#F5F0E6]">Personalized Analytics</h5>
              <p className="text-[11px] text-[#A7A69F] leading-tight">See your movie journey</p>
            </div>

            {/* 6. Early Access */}
            <div className="flex flex-col gap-2">
              <Rocket className="w-6 h-6 text-[#E4B85A]" />
              <h5 className="text-xs font-bold text-[#F5F0E6]">Early Access</h5>
              <p className="text-[11px] text-[#A7A69F] leading-tight">Try new features first</p>
            </div>

            {/* 7. Priority Support */}
            <div className="flex flex-col gap-2">
              <Headphones className="w-6 h-6 text-[#E4B85A]" />
              <h5 className="text-xs font-bold text-[#F5F0E6]">Priority Support</h5>
              <p className="text-[11px] text-[#A7A69F] leading-tight">Get help when you need it</p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          4. FREQUENTLY ASKED QUESTIONS ACCORDION
         ------------------------------------------------------------------ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-12">
        <div className="flex items-center justify-between pb-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#F5F0E6]">
            Frequently Asked Questions
          </h2>
          <button
            onClick={() => setFaqsExpanded(!faqsExpanded)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#282B27] bg-[#101414] text-xs font-semibold text-[#F5F0E6] hover:border-[#E4B85A] hover:text-[#FFD985] transition-all cursor-pointer"
          >
            <span>{faqsExpanded ? "Hide FAQs" : "View All FAQs"}</span>
            {faqsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {faqsExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-in fade-in duration-300">
            <div className="bg-[#0A0D0D] border border-[#282B27] rounded-2xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-[#E4B85A]">Can I cancel my subscription anytime?</h4>
              <p className="text-xs text-[#A7A69F] leading-relaxed">
                Yes! You can cancel or change your plan at any time from your Profile settings with zero penalties or cancellation fees.
              </p>
            </div>

            <div className="bg-[#0A0D0D] border border-[#282B27] rounded-2xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-[#E4B85A]">What devices are supported?</h4>
              <p className="text-xs text-[#A7A69F] leading-relaxed">
                WatchBox Premium works seamlessly across Desktop browsers, iOS & Android devices, Smart TVs, and 4K Chromecast/Apple TV casting.
              </p>
            </div>

            <div className="bg-[#0A0D0D] border border-[#282B27] rounded-2xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-[#E4B85A]">How does offline download work?</h4>
              <p className="text-xs text-[#A7A69F] leading-relaxed">
                You can save movies and curated episodes to your local device cache and watch them anywhere, even on airplane mode without internet.
              </p>
            </div>

            <div className="bg-[#0A0D0D] border border-[#282B27] rounded-2xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-[#E4B85A]">What payment options are available?</h4>
              <p className="text-xs text-[#A7A69F] leading-relaxed">
                We accept all major UPI apps, credit/debit cards, Net Banking, and digital wallets with instant cryptographic payment verification.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------
          5. SPECIALIZED THANKS / "REQUEST UNDER PROCESS" POPUP BOX
         ------------------------------------------------------------------ */}
      {isProcessingModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0A0D0D] border-2 border-[#E4B85A] rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(228,184,90,0.4)] text-center space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Glowing gold ambient flare */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#E4B85A]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setIsProcessingModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-[#101414] border border-[#282B27] text-[#A7A69F] hover:text-[#F5F0E6] hover:border-[#E4B85A] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Animated Crown Icon */}
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#927442] via-[#E4B85A] to-[#FFD985] p-0.5 shadow-xl shadow-[#E4B85A]/30">
              <div className="w-full h-full rounded-2xl bg-[#050707] flex items-center justify-center text-[#E4B85A]">
                <Crown className="w-8 h-8 fill-[#E4B85A] animate-pulse" />
              </div>
            </div>

            {/* Modal Heading & Slogan */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#E4B85A] uppercase">
                THANK YOU FOR CHOOSING WATCHBOX
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#F5F0E6]">
                Your Request is Under Process!
              </h3>
            </div>

            {/* Explanation Message */}
            <p className="text-xs text-[#A7A69F] leading-relaxed px-2">
              We have received your upgrade request for the{" "}
              <span className="text-[#FFD985] font-bold">{selectedPlan.name}</span> plan (
              <span className="text-[#F5F0E6] font-semibold">{selectedPlan.price}/{selectedPlan.cycle}</span>
              ). Our VIP cinema concierge is currently processing your activation.
            </p>

            {/* Processing Order Information Box */}
            <div className="bg-[#101414] border border-[#282B27] rounded-2xl p-4 text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A7A69F]">Order Reference:</span>
                <span className="font-mono font-bold text-[#E4B85A]">{selectedPlan.orderId}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A7A69F]">Status:</span>
                <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Verifying Gateway
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A7A69F]">Estimated Setup:</span>
                <span className="flex items-center gap-1 text-[#F5F0E6]">
                  <Clock className="w-3.5 h-3.5 text-[#E4B85A]" />
                  Instant (within 2-5 mins)
                </span>
              </div>
            </div>

            {/* Guarantee Note */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#A7A69F]">
              <ShieldCheck className="w-4 h-4 text-[#E4B85A]" />
              <span>100% Encrypted & Authenticated Transaction</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsProcessingModalOpen(false);
                  navigate("/explore");
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E4B85A] to-[#FFD985] text-[#050707] text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-[#E4B85A]/25 cursor-pointer"
              >
                Continue Exploring Movies
              </button>
              <button
                onClick={() => setIsProcessingModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#101414] border border-[#282B27] hover:border-[#E4B85A] text-xs font-semibold text-[#A7A69F] hover:text-[#F5F0E6] transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
