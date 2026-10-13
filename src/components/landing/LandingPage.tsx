import { useState, useRef, useEffect } from 'react';
import { Navbar } from './Navbar';
import { MobileMenu } from './MobileMenu';
import { Hero } from './Hero';
import { AboutPlatformScreen } from './AboutPlatformScreen';
import { CoreCapabilitiesSection } from './CoreCapabilitiesSection';
import { HowItWorksScreen } from './HowItWorksScreen';
import { ResultsScreen } from './ResultsScreen';
import { TestimonialsScreen } from './TestimonialsScreen';
import { PricingScreen } from './PricingScreen';
import { FaqScreen } from './FaqScreen';
import { FinalCtaBanner } from './FinalCtaBanner';
import { Footer } from './Footer';
import { Volume2, VolumeX, ChevronDown } from 'lucide-react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204103_f607742e-09da-4cf5-bb06-4e67b0a531de.mp4';

interface LandingPageProps {
  /** Every "sign in / portal" button opens our sign-in screen. */
  onSignIn: () => void;
  /** Every "join / start / create account" button opens our sign-up wizard. */
  onCreateAccount: () => void;
}

/** The IHINGA AI landing page (ported from the landing project), shown before sign-in. */
export function LandingPage({ onSignIn, onCreateAccount }: LandingPageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Handle escape key to close modals or mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleOpenJoin = onCreateAccount;
  const handleOpenPortal = onSignIn;

  const scrollToOverview = () => {
    const overviewEl = document.getElementById('platform-overview-screen');
    if (overviewEl) {
      overviewEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works-screen');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onSignIn();
    }
  };

  const handleOpenSection = (section: string) => {
    if (section === 'Methodology') {
      scrollToHowItWorks();
    } else if (section === 'Intelligence') {
      const el = document.getElementById('core-capabilities-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else onSignIn();
    } else if (section === 'Co-operatives' || section === 'Cooperatives' || section === 'Results') {
      const el = document.getElementById('results-screen');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else onSignIn();
    } else if (section === 'Pricing') {
      const el = document.getElementById('pricing-screen');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else onSignIn();
    } else if (section === 'FAQ') {
      const el = document.getElementById('faq-screen');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else onSignIn();
    } else {
      onSignIn();
    }
  };

  // Otherwise render the Landing Page with seamless entry point to App Shell
  return (
    <div
      id="app-root-container"
      className="relative w-full min-h-screen overflow-x-clip bg-[#05090f] text-white font-sans selection:bg-white/20 selection:text-white flex flex-col justify-between scroll-smooth"
    >
      {/* SCREEN 1: Fullscreen Hero Section */}
      <section className="relative w-full h-screen min-h-[100vh] max-h-[100vh] flex flex-col justify-between overflow-hidden bg-[#05090f]">
        {/* Background Video with Object Cover and Autoplay Looping */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <video
            ref={videoRef}
            src={VIDEO_URL}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-60' : 'opacity-0'
            }`}
          />

          {/* Immersive UI Gradient Overlays seamlessly blending into #05090f */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05090f] via-black/30 to-black/50 pointer-events-none" />
        </div>

        {/* Navbar Component */}
        <Navbar
          onOpenSection={handleOpenSection}
          onOpenPortal={handleOpenPortal}
          onOpenJoin={handleOpenJoin}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Fullscreen Mobile Menu Overlay */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onSelectSection={handleOpenSection}
          onSelectPortal={handleOpenPortal}
          onSelectJoin={handleOpenJoin}
        />

        {/* Main Hero Centerpiece */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center pt-24 pb-20">
          <Hero
            onExploreRiskMap={onSignIn}
            onHowItWorks={scrollToHowItWorks}
          />

          {/* Scroll Down Hint to Next Screen */}
          <button
            onClick={scrollToOverview}
            className="mt-8 flex flex-col items-center gap-1.5 text-xs text-white/50 hover:text-white transition-all cursor-pointer group"
            aria-label="Scroll to platform overview"
          >
            <span className="tracking-widest uppercase text-[10px] font-mono group-hover:translate-y-0.5 transition-transform">
              Overview
            </span>
            <ChevronDown className="w-4 h-4 animate-bounce text-white/60 group-hover:text-white" />
          </button>
        </main>

        {/* Bottom Ambient Line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      </section>

      {/* SCREEN 2: Platform Overview & Mission Screen (Matching Photo Layout & Video Palette Gradient) */}
      <AboutPlatformScreen />

      {/* SCREEN 3: Core Capabilities Sticky Side-by-Side Section */}
      <CoreCapabilitiesSection />

      {/* SCREEN 4: How It Works (From risk detected to farmer protected) */}
      <HowItWorksScreen />

      {/* SCREEN 5: Results (What changes once ihingaAI is live) */}
      <ResultsScreen />

      {/* SCREEN 6: Testimonials (What agricultural leaders say) */}
      <TestimonialsScreen />

      {/* SCREEN 7: Pricing (Simple plans that scale with your reach) */}
      <PricingScreen
        onSelectTier={(action) => {
          if (action === 'join') handleOpenJoin();
          else if (action === 'portal') handleOpenPortal();
          else if (action === 'contact') handleOpenJoin();
        }}
      />

      {/* SCREEN 7.5: FAQ (Questions, answered.) */}
      <FaqScreen onContactClick={handleOpenJoin} />

      {/* SCREEN 8: Final CTA Banner (Ready to see the season before it happens?) */}
      <FinalCtaBanner
        onStartTrial={handleOpenJoin}
        onSignIn={handleOpenPortal}
      />

      {/* SCREEN 9: Comprehensive Footer */}
      <Footer
        onOpenSection={handleOpenSection}
        onOpenPortal={handleOpenPortal}
        onOpenJoin={handleOpenJoin}
        onOpenContact={handleOpenJoin}
        onOpenRiskMap={handleOpenPortal}
      />

      {/* Floating Audio Ambient Toggle Control */}
      <div className="fixed bottom-8 right-6 sm:right-12 z-30 hidden sm:block">
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute Video Audio' : 'Mute Video Audio'}
          className="p-2.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white/70 hover:text-white transition-all backdrop-blur-md cursor-pointer hover:scale-105 shadow-xl"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
      </div>

    </div>
  );
}
