import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAiChat } from '../../context/AiChatContext';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import {
  Facebook, Instagram, Linkedin, Youtube, Mail, Phone, Sparkles, ArrowRight,
} from 'lucide-react';
import Container from './Container';

/**
 * Footer — ink surface (orange retired from footer scale so the action color
 * stays precious). Same link taxonomy, working newsletter form, socials,
 * legal bar. All destinations preserved from the previous footer.
 */
const FOOTER_GROUPS = [
  {
    title: 'Explore',
    links: [
      { label: 'Universities', to: '/universities' },
      { label: 'Courses', to: '/courses' },
      { label: 'Entrance Exams', to: '/exams' },
      { label: 'Study Abroad', to: '/foreign-universities' },
      { label: 'Compare Universities', to: '/compare-universities' },
    ],
  },
  {
    title: 'Student Tools',
    links: [
      { label: 'Rank Predictor', to: '/rank-predictor' },
      { label: 'AI Counsellor', to: '/ask' },
      { label: 'My Dashboard', to: '/profile' },
      { label: 'Sign In', to: '/login' },
      { label: 'Create Account', to: '/signup' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms and Conditions', to: '/terms-and-conditions' },
      { label: 'Refund Policy', to: '/refund-cancellation' },
    ],
  },
];

const SOCIALS = [
  { label: 'Facebook', href: 'https://www.facebook.com/vidyarthimitra', icon: Facebook },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/vidyarthimitra', icon: Linkedin },
  { label: 'Instagram', href: 'https://www.instagram.com/vidyarthi_mitra/', icon: Instagram },
  { label: 'YouTube', href: 'https://www.youtube.com/@vidyarthimitra', icon: Youtube },
];

export default function Footer() {
  const { openChat } = useAiChat();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Enter your email address');
    setSubscribing(true);
    try {
      await api.post('/newsletter/subscribe', { email: email.trim() });
      toast.success('Subscribed! We will keep you posted.');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not subscribe. Try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="mt-16 md:mt-24 bg-slate-900 text-white" aria-label="Footer">
      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand + AI CTA */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-white rounded-xl p-1.5 inline-flex">
                <img src={logo} alt="Vidyarthi Mitra" className="h-7" />
              </span>
            </div>
            <p className="text-sm leading-6 text-white/70 max-w-xs mb-6">
              The trusted counsellor for your university decision — every fact, every fee,
              every deadline, in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openChat}
                className="h-10 px-4 inline-flex items-center gap-2 rounded-btn bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors duration-150"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" /> Talk to the AI counsellor
              </button>
              <Link
                to="/contact"
                className="h-10 px-4 inline-flex items-center gap-2 rounded-btn border border-white/20 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors duration-150"
              >
                Contact team
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_GROUPS.map((group) => (
            <nav key={group.title} className="lg:col-span-2" aria-label={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">{group.title}</h3>
              <ul className="space-y-2.5">
                {group.links.map((l) => (
                  <li key={l.to + l.label}>
                    <Link to={l.to} className="text-sm text-white/75 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Connect */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">Connect</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="tel:+917720025900" className="flex items-center gap-2 text-white/75 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 shrink-0" aria-hidden="true" /> +91 77200 25900
                </a>
              </li>
              <li>
                <a href="tel:+917720081400" className="flex items-center gap-2 text-white/75 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 shrink-0" aria-hidden="true" /> +91 77200 81400
                </a>
              </li>
              <li>
                <a href="mailto:contact@vidyarthimitra.org" className="flex items-center gap-2 text-white/75 hover:text-white transition-colors break-all">
                  <Mail className="w-4 h-4 shrink-0" aria-hidden="true" /> contact@vidyarthimitra.org
                </a>
              </li>
            </ul>
            <div className="flex gap-2 mt-5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-btn bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <s.icon className="w-4 h-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center gap-4">
          <div className="md:flex-1">
            <p className="text-sm font-semibold">Stay updated</p>
            <p className="text-sm text-white/60">Admission alerts, exam dates and new universities — once a week, no spam.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
            <label htmlFor="footer-newsletter" className="sr-only">Email address</label>
            <input
              id="footer-newsletter"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 flex-1 md:w-72 px-3.5 rounded-btn bg-white/10 border border-white/15 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="h-11 px-5 rounded-btn bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors duration-150 disabled:opacity-50 inline-flex items-center gap-2 shrink-0"
            >
              {subscribing ? 'Subscribing…' : <>Subscribe <ArrowRight className="w-4 h-4" aria-hidden="true" /></>}
            </button>
          </form>
        </div>

        {/* Legal bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© VidyarthiMitra.org {new Date().getFullYear()} · All rights reserved</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/refund-cancellation" className="hover:text-white transition-colors">Refunds</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
