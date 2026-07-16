import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import StatesSection from './StatesSection';
import StreamsSection from './StreamsSection';
import ToolsSection from './ToolsSection';
import UniversityCarousel from './UniversityCarousel';
import TestimonialSection from './TestimonialSection';
import NewsSection from './NewsSection';
import FAQSection from './FAQSection';
import CTASection from './CTASection';
import HowItWorksSection from './HowItWorksSection';
import AdsSection from './AdsSection';

/**
 * SectionRenderer — the CMS seam (Modular Architecture, Doc 3 §3).
 *
 * A page is a LIST OF CONFIGURED MODULE INSTANCES, not a bespoke layout:
 * each entry is { type, enabled, audience, props }. The renderer maps types
 * through this registry, filters disabled/audience-mismatched entries, and
 * passes shared live data via `ctx`. Unknown or retired module types render
 * NOTHING (and warn in dev) — stale content can never crash the site.
 *
 * Today the section list ships as a config file (config/homepageSections.js);
 * the admin page-builder later serves the same shape from the API with zero
 * changes here.
 */
export const SECTION_REGISTRY = {
  hero: HeroSection,
  stats: StatsSection,
  states: StatesSection,
  streams: StreamsSection,
  tools: ToolsSection,
  'university-carousel': UniversityCarousel,
  testimonials: TestimonialSection,
  news: NewsSection,
  faq: FAQSection,
  cta: CTASection,
  'how-it-works': HowItWorksSection,
  ads: AdsSection,
};

export default function SectionRenderer({ sections = [], ctx = {} }) {
  return sections
    .filter((s) => s.enabled !== false)
    .filter((s) => {
      if (!s.audience || s.audience === 'all') return true;
      if (s.audience === 'logged-in') return !!ctx.user;
      if (s.audience === 'logged-out') return !ctx.user;
      return true;
    })
    .map((s, i) => {
      const Comp = SECTION_REGISTRY[s.type];
      if (!Comp) {
        if (import.meta.env.DEV) console.warn(`[SectionRenderer] Unknown section type "${s.type}" — skipped.`);
        return null;
      }
      return <Comp key={s.id || `${s.type}-${i}`} {...(s.props || {})} ctx={ctx} />;
    });
}
