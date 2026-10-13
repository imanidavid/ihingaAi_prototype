import { useState } from 'react';

interface NavbarProps {
  onOpenSection: (section: string) => void;
  onOpenPortal: () => void;
  onOpenJoin: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export function Navbar({
  onOpenSection,
  onOpenPortal,
  onOpenJoin,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: NavbarProps) {
  const navLinks = ['Intelligence', 'Micro-Insurance', 'Co-operatives', 'Methodology'];

  return (
    <nav
      id="main-navbar"
      className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 sm:px-12 py-6 sm:py-8"
    >
      {/* Left side: Logo & Desktop Links */}
      <div className="flex items-center gap-8 lg:gap-12">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-white text-xl font-semibold tracking-tight uppercase hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
          id="brand-logo"
        >
          <span>Ihinga AI</span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-white/70">
          {navLinks.map((link) => (
            <button
              key={link}
              onClick={() => onOpenSection(link)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {link}
            </button>
          ))}
        </div>
      </div>

      {/* Right side: Farmer Portal + Join Network Button */}
      <div className="flex items-center gap-6 sm:gap-8">
        <button
          onClick={onOpenPortal}
          className="text-sm font-medium hover:text-white/80 transition-colors hidden lg:block text-white/90 cursor-pointer"
        >
          Farmer Portal
        </button>

        <button
          onClick={onOpenJoin}
          className="hidden sm:block bg-white text-black text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
        >
          Join Network
        </button>

        {/* Mobile Hamburger Button: 3 lines (middle line shorter) */}
        <button
          id="mobile-hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex flex-col gap-1.5 items-end group md:hidden p-1 focus:outline-none cursor-pointer z-50"
          aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          <span
            style={{
              transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
              transitionDuration: '500ms',
            }}
            className={`h-0.5 bg-white transition-all transform origin-center ${
              isMobileMenuOpen ? 'w-8 rotate-45 translate-y-[8px]' : 'w-8'
            }`}
          />
          <span
            style={{
              transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
              transitionDuration: '500ms',
            }}
            className={`h-0.5 bg-white transition-all ${
              isMobileMenuOpen ? 'w-0 opacity-0' : 'w-5 opacity-100'
            }`}
          />
          <span
            style={{
              transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
              transitionDuration: '500ms',
            }}
            className={`h-0.5 bg-white transition-all transform origin-center ${
              isMobileMenuOpen ? 'w-8 -rotate-45 -translate-y-[8px]' : 'w-8'
            }`}
          />
        </button>
      </div>
    </nav>
  );
}
