import React from 'react';

/**
 * Official College Branding Component for INFO Institute of Engineering
 *
 * Implements official institutional branding requirements:
 * 1. Displays official logo clearly with college name beside it.
 * 2. Preserves authentic blue-and-green emblem proportions (no distortion).
 * 3. Supports clean, professional white background container with blue (#00afed) & green (#61b229) accents.
 * 4. Bold, modern, readable typography with Outfit/Inter.
 * 5. Visual balance and responsive scaling at 320px, 375px, 430px, tablet, and desktop.
 */
export default function CollegeBrand({
  variant = 'navbar',
  className = '',
  showSubtitle = true,
  showTag = true,
  onClick = null,
}) {
  const emblemSrc = '/branding/college_emblem.png';

  // NAVBAR VARIANT: Streamlined, horizontal, highly responsive for top navigation bars
  if (variant === 'navbar') {
    return (
      <div 
        onClick={onClick}
        className={`flex items-center gap-2 sm:gap-3 min-w-0 ${onClick ? 'cursor-pointer select-none active:scale-98 transition' : ''} ${className}`}
      >
        {/* Emblem on Left in clean, crisp white container with brand accent ring */}
        <div 
          className="h-9 w-9 xs:h-10 xs:w-10 sm:h-11 sm:w-11 rounded-xl bg-white p-1 sm:p-1.5 flex items-center justify-center shadow-md shadow-black/20 ring-1 ring-sky-500/30 border border-slate-200/90 shrink-0 transition-transform hover:scale-105"
          style={{ aspectRatio: '1 / 1' }}
        >
          <img
            src={emblemSrc}
            alt="INFO Institute of Engineering Official Emblem"
            className="w-full h-full object-contain"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* College Name & Details on Right */}
        <div className="min-w-0 flex-1 truncate">
          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
            <h1 className="font-display font-extrabold text-white text-[13px] xs:text-sm sm:text-base md:text-lg tracking-tight leading-tight truncate">
              INFO Institute of Engineering
            </h1>
            {showTag && (
              <span className="text-[9px] xs:text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0 shadow-xs">
                Autonomous
              </span>
            )}
          </div>
          {showSubtitle && (
            <p className="text-[10px] xs:text-[11px] sm:text-xs text-slate-400 font-medium truncate mt-0.5 hidden xs:block">
              Academic Intelligence &amp; Examination Analytics Portal
            </p>
          )}
        </div>
      </div>
    );
  }

  // LOGIN CARD VARIANT: Clean, professional white background with blue and green accent colors
  if (variant === 'login-card') {
    return (
      <div className={`w-full max-w-xl mx-auto rounded-2xl sm:rounded-3xl bg-white text-slate-900 p-4 sm:p-6 shadow-2xl border border-slate-200/80 relative overflow-hidden transition-all ${className}`}>
        {/* Subtle dual-color institutional top accent bar (Blue & Green) */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#00afed] via-[#38bdf8] to-[#61b229]"></div>

        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-5">
          {/* Logo on Left: Standalone Emblem preserved inside clean white frame */}
          <div 
            className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg border border-slate-200 ring-2 ring-sky-500/20 shrink-0"
            style={{ aspectRatio: '1 / 1' }}
          >
            <img
              src={emblemSrc}
              alt="INFO Institute of Engineering Official College Logo"
              className="w-full h-full object-contain"
              loading="eager"
            />
          </div>

          {/* College Name on Right: Modern bold typography */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mb-1.5 rounded-full bg-emerald-50 border border-emerald-300/80 text-emerald-800 text-[10px] sm:text-xs font-bold tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Autonomous Institution
            </div>

            <h1 className="font-display font-black text-slate-950 text-lg xs:text-xl sm:text-2xl md:text-2xl tracking-tight leading-tight">
              INFO Institute of Engineering
            </h1>

            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 leading-snug">
              Academic Intelligence &amp; Examination Analytics Portal
            </p>

            <div className="mt-2 text-[10px] sm:text-[11px] text-slate-500 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <span>Affiliated to Anna University</span>
              <span>•</span>
              <span>Approved by AICTE</span>
              <span>•</span>
              <span className="font-medium text-emerald-700">NAAC Accredited</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SIDEBAR VARIANT: Compact institutional header for drawer and desktop sidebar
  if (variant === 'sidebar') {
    return (
      <div className={`flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800/90 ${className}`}>
        <div 
          className="h-10 w-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border border-slate-200/90 ring-1 ring-sky-500/25 shrink-0"
          style={{ aspectRatio: '1 / 1' }}
        >
          <img
            src={emblemSrc}
            alt="INFO College Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1 truncate">
          <div className="font-display font-bold text-white text-xs sm:text-sm truncate">
            INFO Institute of Engg.
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Autonomous Institution
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT COMPACT VARIANT
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className="h-10 w-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border border-slate-200 ring-1 ring-sky-500/20 shrink-0"
        style={{ aspectRatio: '1 / 1' }}
      >
        <img
          src={emblemSrc}
          alt="INFO Institute of Engineering"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="min-w-0 truncate">
        <div className="font-display font-bold text-white text-sm truncate">
          INFO Institute of Engineering
        </div>
        {showTag && (
          <div className="text-[10px] text-slate-400 font-medium truncate">
            (Autonomous Institution)
          </div>
        )}
      </div>
    </div>
  );
}
