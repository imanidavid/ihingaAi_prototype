import { useState, type FormEvent } from 'react';
import { X, CheckCircle2, Mail, Send, Sparkles } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setName('');
    setEmail('');
    setMessage('');
    onClose();
  };

  return (
    <div
      id="contact-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        id="contact-modal-container"
        className="relative w-full max-w-lg bg-neutral-950 border border-white/15 rounded-2xl shadow-2xl text-white p-6 sm:p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-semibold text-white">Message Dispatched</h4>
            <p className="text-xs text-white/60 mt-2 max-w-sm">
              Thank you for reaching out to the Ihinga AI team. Our agricultural technology specialists in Kigali will be in touch shortly.
            </p>
            <button
              onClick={handleReset}
              className="mt-6 bg-white text-black text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                <Mail className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-white/70">
                Direct Inquiries
              </span>
            </div>

            <h3 className="text-xl font-semibold">Say Hello to Ihinga AI</h3>
            <p className="text-xs text-white/60 mt-1 mb-5">
              Connect with our climate engineers, agronomy researchers, or institutional partnership leads.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jean-Paul Habimana"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@organization.rw"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Message or Collaboration Idea</label>
                <textarea
                  rows={3}
                  required
                  placeholder="How can Ihinga AI support your farm, cooperative, or research initiative?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black font-semibold text-sm py-3 rounded-full hover:bg-neutral-200 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                Send Message
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
