import { Link } from 'react-router-dom';
import { Scale, Trophy, Sparkles } from 'lucide-react';
import SearchBar from '../search/SearchBar';
import Container from '../layout/Container';
import { useAiChat } from '../../context/AiChatContext';

/**
 * M-01 Hero — primary landing statement + the dominant search experience.
 * One stable composition (the 4-image auto-rotator is retired: motion cost
 * without decision value; faster LCP). Attention order: search → headline →
 * quick paths. All copy arrives via props (CMS-shaped module config).
 *
 * props: { headline, highlight, subheadline, image, quickLinks[{label,to,icon}] }
 */
const ICONS = { scale: Scale, trophy: Trophy, sparkles: Sparkles };

export default function HeroSection({
  headline = 'Find the right university,',
  highlight = 'with all the facts.',
  subheadline = 'Compare fees, placements, rankings and admissions across 500+ private and deemed universities — free, honest, and in your language.',
  image,
  quickLinks = [],
}) {
  const { openChat } = useAiChat();

  return (
    <section className="relative bg-slate-900 text-white overflow-hidden" aria-label="Search universities">
      {/* Background image with ink scrim — photography supports, never competes */}
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          loading="eager"
          fetchpriority="high"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900" aria-hidden="true" />

      <Container className="relative py-16 md:py-24 lg:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-display-serif !text-white">
            {headline}{' '}
            <span className="text-primary-300">{highlight}</span>
          </h1>
          <p className="text-body !text-white/75 mt-4 max-w-2xl mx-auto">{subheadline}</p>

          <div className="mt-8 max-w-2xl mx-auto text-left">
            <SearchBar size="lg" placeholder="Try “B.Tech CSE in Maharashtra” or a university name…" />
          </div>

          {quickLinks.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {quickLinks.map((q) => {
                const Icon = ICONS[q.icon] || Sparkles;
                const cls =
                  'inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-white/20 bg-white/10 text-sm font-medium text-white/90 hover:bg-white/20 transition-colors duration-150';
                return q.to === '/ask' ? (
                  <button key={q.label} type="button" onClick={openChat} className={cls}>
                    <Icon className="w-4 h-4" aria-hidden="true" /> {q.label}
                  </button>
                ) : (
                  <Link key={q.label} to={q.to} className={cls}>
                    <Icon className="w-4 h-4" aria-hidden="true" /> {q.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
