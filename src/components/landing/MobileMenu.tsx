import { ArrowRight, Sparkles } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (section: string) => void;
  onSelectPortal: () => void;
  onSelectJoin: () => void;
}

export function MobileMenu({
  isOpen,
  onClose,
  onSelectSection,
  onSelectPortal,
  onSelectJoin,
}: MobileMenuProps) {
  if (!isOpen) return null;

  const links = [
    { title: 'Intelligence', type: 'section' },
    { title: 'Co-operatives', type: 'section' },
    { title: 'Methodology', type: 'section' },
    { title: 'Farmer Portal', type: 'portal' },
  ];

  const handleLinkClick = (item: { title: string; type: string }) => {
    onClose();
    if (item.type === 'portal') {
      onSelectPortal();
    } else {
      onSelectSection(item.title);
    }
  };

  return (
    <div
      id="mobile-menu-overlay"
      className="fixed inset-0 z-40 bg-black/90 backdrop-blur-xl flex flex-col justify-between p-8 sm:p-12 pt-28 transition-all"
      style={{
        animation: 'fadeIn 0.3s ease-out forwards',
      }}
    >
      {/* Links list */}
      <div className="flex flex-col space-y-6 sm:space-y-8 my-auto">
        {links.map((item, index) => {
          const delayMs = 150 + index * 80;
          return (
            <div
              key={item.title}
              className="overflow-hidden"
              style={{
                animation: `staggerSlideUp 500ms cubic-bezier(0.76, 0, 0.24, 1) ${delayMs}ms both`,
              }}
            >
              <button
                onClick={() => handleLinkClick(item)}
                className="text-left font-instrument-serif text-white hover:text-white/80 text-4xl sm:text-5xl tracking-tight transition-colors flex items-center justify-between w-full group cursor-pointer"
              >
                <span className="group-hover:translate-x-2 transition-transform duration-300">
                  {item.title}
                </span>
                <span className="text-white/20 group-hover:text-white/60 transition-colors text-2xl font-mono">
                  0{index + 1}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Action in Mobile Overlay */}
      <div
        className="pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{
          animation: `staggerSlideUp 500ms cubic-bezier(0.76, 0, 0.24, 1) ${150 + links.length * 80}ms both`,
        }}
      >
        <div className="flex items-center gap-2 text-xs text-white/60">
          <Sparkles className="w-3.5 h-3.5 text-white/80" />
          <span>Rwanda AI Agro-Telemetry Network</span>
        </div>

        <button
          onClick={() => {
            onClose();
            onSelectJoin();
          }}
          className="w-full sm:w-auto bg-white text-black font-bold text-xs uppercase tracking-wider rounded-full px-6 py-3.5 flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
        >
          Join Network
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <style>{`
        @keyframes staggerSlideUp {
          from {
            opacity: 0;
            transform: translateY(32px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
