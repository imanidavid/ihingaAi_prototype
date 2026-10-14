interface FooterProps {
  onOpenSection: (section: string) => void;
  onOpenPortal: () => void;
  onOpenJoin: () => void;
  onOpenContact: () => void;
  onOpenRiskMap: () => void;
}

export function Footer({
  onOpenSection,
  onOpenPortal,
  onOpenJoin,
  onOpenContact,
  onOpenRiskMap,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handlePlatformClick = (item: string) => {
    if (item === 'Risk Map') {
      onOpenRiskMap();
    } else if (item === 'Early Warnings') {
      const el = document.getElementById('how-it-works-screen');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else onOpenSection(item);
    } else if (item === 'Cooperative Tools' || item === 'Results') {
      const el = document.getElementById('results-screen');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else onOpenSection(item);
    } else {
      onOpenSection(item);
    }
  };

  const handleCompanyClick = (item: string) => {
    if (item === 'Pricing') {
      const el = document.getElementById('pricing-screen');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else onOpenSection(item);
    } else if (item === 'FAQ') {
      const el = document.getElementById('faq-screen');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else onOpenSection(item);
    } else if (item === 'Contact Sales') {
      onOpenContact();
    } else {
      onOpenSection(item);
    }
  };

  const handleTrustClick = (item: string) => {
    if (item === 'Sign in') {
      onOpenPortal();
    } else if (item === 'Sign up') {
      onOpenJoin();
    } else if (item === 'Data & Security' || item === 'Compliance') {
      const el = document.getElementById('faq-screen');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else onOpenSection(item);
    } else {
      onOpenSection(item);
    }
  };

  return (
    <footer className="relative z-10 w-full bg-[#05090f] text-white/70 font-sans border-t border-white/10 pt-16 pb-12 px-6 sm:px-10 md:px-16 lg:px-20 selection:bg-emerald-500/30 selection:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Brand Info & Socials */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              {/* 4-Quadrant Logo */}
              <div className="w-7 h-7 grid grid-cols-2 gap-0.5">
                <div className="w-3 h-3 rounded-tl-sm bg-[#00d2aa]" />
                <div className="w-3 h-3 rounded-tr-sm bg-white" />
                <div className="w-3 h-3 rounded-bl-sm bg-white" />
                <div className="w-3 h-3 rounded-br-sm bg-[#00d2aa]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                ihinga<span className="text-[#00d2aa]">AI</span>
              </span>
            </div>

            <p className="text-sm text-white/60 leading-relaxed max-w-sm font-sans">
              Climate intelligence for modern agriculture — built for Rwanda&apos;s farmers, cooperatives, and district offices.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 text-white/70 hover:text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.9 0-1.63.73-1.63 1.63s.73 1.63 1.63 1.63 1.63-.73 1.63-1.63-.73-1.63-1.63-1.63Z" />
                </svg>
              </a>

              {/* Twitter/X */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 text-white/70 hover:text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 text-white/70 hover:text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Columns */}
          {/* 1. Platform */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-white font-semibold">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-white/60">
              {['Risk Map', 'Early Warnings', 'Crop Calendar', 'Cooperative Tools', 'Reporting & Analytics'].map(
                (item) => (
                  <li key={item}>
                    <button
                      onClick={() => handlePlatformClick(item)}
                      className="hover:text-white transition-colors text-left cursor-pointer"
                    >
                      {item}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* 2. Company */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-white font-semibold">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-white/60">
              {['Why Rwanda', 'Pricing', 'FAQ'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => handleCompanyClick(item)}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Trust */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-white font-semibold">
              Trust
            </h4>
            <ul className="space-y-2.5 text-xs text-white/60">
              {['Sign in', 'Sign up', 'Data & Security', 'Compliance'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => handleTrustClick(item)}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center text-center gap-4 text-xs text-white/50">
          <div>
            © {currentYear} ihingaAI. Built for Rwandan farmers, cooperatives, and agricultural institutions.
          </div>
        </div>
      </div>
    </footer>
  );
}
