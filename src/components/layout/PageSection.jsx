import Container from './Container';
import { SectionHeader } from '../ui';

/**
 * Section wrapper — the module frame every homepage/landing section renders
 * inside. Applies the universal section contract from the modular
 * architecture: background surface, vertical rhythm (96/64/48 by breakpoint),
 * container width, and the standard eyebrow/title/description header.
 *
 * Props:
 *  background: "page" | "subtle" | "ink" | "brand-tint" | "amber-tint"
 *  spacing:    "default" | "compact"
 *  header:     { eyebrow, title, description, action }
 *  bleed:      true renders children full-width (hero media)
 */
const BACKGROUNDS = {
  page: 'bg-transparent',
  subtle: 'bg-light-card dark:bg-dark-card/40',
  ink: 'bg-slate-900 dark:bg-black/40 text-white',
  'brand-tint': 'bg-primary-50 dark:bg-primary/10',
  'amber-tint': 'bg-accent-50 dark:bg-accent/10',
};

const SPACING = {
  default: 'py-12 md:py-16 lg:py-24',
  compact: 'py-8 md:py-10 lg:py-12',
};

export default function PageSection({
  background = 'page',
  spacing = 'default',
  header,
  bleed = false,
  id,
  className = '',
  children,
}) {
  const inner = (
    <>
      {header && (
        <SectionHeader
          eyebrow={header.eyebrow}
          title={header.title}
          description={header.description}
          action={header.action}
        />
      )}
      {children}
    </>
  );
  return (
    <section id={id} className={`${BACKGROUNDS[background] || BACKGROUNDS.page} ${SPACING[spacing] || SPACING.default} ${className}`.trim()}>
      {bleed ? inner : <Container>{inner}</Container>}
    </section>
  );
}
