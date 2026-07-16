import heroImage from '../assets/generated/amity_campus.png';
import gujaratImg from '../assets/states/gujarat.jpg';
import upImg from '../assets/states/uttar-pradesh.jpg';
import mpImg from '../assets/states/madhya-pradesh.jpg';
import gujaratLandmark from '../assets/generated/gujarat_landmark.png';
import upLandmark from '../assets/generated/up_landmark.png';
import tcetCampus from '../assets/generated/tcet_campus.png';

/**
 * HOMEPAGE SECTION CONFIG — the CMS seam.
 *
 * The homepage is this ordered list of module instances, rendered by
 * SectionRenderer. NO section content is hardcoded in the page component:
 * to change a headline, reorder sections, or disable a band, edit THIS DATA.
 * The admin page-builder (Modular Architecture, Doc 3 §3) will later serve
 * exactly this shape from `GET /pages/home/sections` — swap the import for a
 * fetch and nothing else changes.
 *
 * Universal per-section fields: type · id · enabled · audience
 * ("all" | "logged-in" | "logged-out") · props (module-specific config).
 * Live data (universities, counts, news…) is resolved by the page loader and
 * passed through ctx — modules never fetch for themselves.
 */
const homepageSections = [
  {
    id: 'hero',
    type: 'hero',
    enabled: true,
    props: {
      headline: 'Find the right university,',
      highlight: 'with all the facts.',
      subheadline:
        'Compare fees, placements, rankings and admissions across 500+ private and deemed universities — free, honest, and in your language.',
      image: heroImage,
      quickLinks: [
        { label: 'Compare universities', to: '/compare-universities', icon: 'scale' },
        { label: 'Rank predictor', to: '/rank-predictor', icon: 'trophy' },
        { label: 'Ask the AI counsellor', to: '/ask', icon: 'sparkles' },
      ],
    },
  },
  {
    id: 'trust-stats',
    type: 'stats',
    enabled: true,
    props: {
      // "live:" stats resolve from the API at render time (one source of
      // truth); manual values are the honest fallbacks while loading.
      stats: [
        { source: 'live:universities', value: '500+', label: 'Universities listed', icon: 'building' },
        { source: 'live:courses', value: '8,000+', label: 'Courses covered', icon: 'book' },
        { source: 'live:exams', value: '20+', label: 'Entrance exams', icon: 'file' },
        { source: 'live:states', value: '30+', label: 'States covered', icon: 'map' },
      ],
    },
  },
  {
    id: 'browse-states',
    type: 'states',
    enabled: true,
    props: {
      header: { eyebrow: 'Browse by state', title: 'Explore universities near you' },
      states: [
        { name: 'Maharashtra', image: tcetCampus },
        { name: 'Gujarat', image: gujaratImg },
        { name: 'Uttar Pradesh', image: upImg },
        { name: 'Madhya Pradesh', image: mpImg },
        { name: 'Karnataka', image: gujaratLandmark },
        { name: 'Delhi NCR', image: upLandmark },
      ],
    },
  },
  {
    id: 'browse-streams',
    type: 'streams',
    enabled: true,
    props: {
      header: { eyebrow: 'Browse by stream', title: 'What do you want to study?' },
      // Label → DB filter mapping lives HERE as data (was a hardcoded map).
      streams: [
        { label: 'MBA / PGDM', icon: 'briefcase', to: '/courses?stream=Management' },
        { label: 'Engineering', icon: 'cpu', to: '/courses?stream=Engineering' },
        { label: 'Medical', icon: 'stethoscope', to: '/courses?stream=Medical%20%26%20Health%20Sciences' },
        { label: 'Design', icon: 'palette', to: '/courses?stream=Design%20%26%20Architecture' },
        { label: 'Law', icon: 'scale', to: '/courses?stream=Law' },
        { label: 'Science', icon: 'flask', to: '/courses?stream=Science' },
        { label: 'Study Abroad', icon: 'globe', to: '/foreign-universities' },
      ],
    },
  },
  {
    id: 'tools',
    type: 'tools',
    enabled: true,
    props: {
      header: { eyebrow: 'Decision tools', title: 'Tools that do the hard math for you' },
      tools: [
        {
          label: 'Compare universities',
          description: 'Put up to 4 universities side by side — fees, placements, rankings — with the winners highlighted for you.',
          icon: 'scale',
          to: '/compare-universities',
        },
        {
          label: 'Rank predictor',
          description: 'Enter your JEE, MHT-CET, NEET or CAT score and see which colleges are ambitious, target and safe. An estimate, honestly labeled.',
          icon: 'trophy',
          to: '/rank-predictor',
        },
        {
          label: 'AI counsellor',
          description: 'Ask anything about admissions, fees or shortlists — in English, हिंदी or मराठी, by text or voice. Free, any time.',
          icon: 'sparkles',
          to: '/ask',
        },
      ],
    },
  },
  {
    id: 'ad-hero-banner',
    type: 'ads',
    enabled: true,
    props: { variant: 'hero-slider', page: 'home' },
  },
  {
    id: 'sponsored-band',
    type: 'ads',
    enabled: true,
    props: { variant: 'sponsored', page: 'home' },
  },
  {
    id: 'popular-universities',
    type: 'university-carousel',
    enabled: true,
    props: {
      header: { eyebrow: 'Popular right now', title: 'Universities students are exploring' },
      count: 6,
    },
  },
  {
    id: 'how-it-works',
    type: 'how-it-works',
    enabled: true,
    props: {
      steps: [
        { icon: 'search', title: 'Discover', text: 'Search 500+ universities and filter by state, budget, exams and accreditation — the full picture, not a brochure.' },
        { icon: 'scale', title: 'Compare & shortlist', text: 'Save colleges, compare them side by side, and track every application deadline in your dashboard.' },
        { icon: 'send', title: 'Apply with confidence', text: 'Download brochures, ask the AI counsellor, and apply — an admissions coordinator calls you back within 24 hours.' },
      ],
    },
  },
  {
    id: 'testimonials',
    type: 'testimonials',
    enabled: true,
    props: {
      header: { eyebrow: 'Student stories', title: 'What students say about their search' },
      count: 3,
    },
  },
  {
    id: 'news-community',
    type: 'news',
    enabled: true,
    props: {},
  },
  {
    id: 'faq',
    type: 'faq',
    enabled: true,
    props: { count: 6 },
  },
  {
    id: 'newsletter-cta',
    type: 'cta',
    enabled: true,
    props: {
      headline: 'Never miss an admission deadline',
      text: 'Weekly alerts on application windows, entrance exams and new universities — free, no spam.',
      form: 'newsletter',
    },
  },
];

export default homepageSections;
