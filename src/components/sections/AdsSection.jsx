import Container from '../layout/Container';
import HeroBannerSlider from '../ads/HeroBannerSlider';
import SponsoredUniversities from '../ads/SponsoredUniversities';
import SidebarAds from '../ads/SidebarAds';

/**
 * M-07/M-08 Ad placement module — thin section wrapper around the existing,
 * fully-tracked banner components (impressions on fetch, UTM-tagged click
 * redirects). Placement/scheduling/creative stay admin-managed in the
 * Banners manager; this module only positions the band. Renders nothing when
 * no active banners exist (preserved behavior).
 *
 * props: { variant: "hero-slider" | "sponsored" | "sidebar", page }
 */
export default function AdsSection({ variant = 'hero-slider', page = 'home' }) {
  if (variant === 'sponsored') {
    // SponsoredUniversities renders its own labeled band + amber styling.
    return <SponsoredUniversities page={page} />;
  }
  if (variant === 'sidebar') {
    return (
      <Container className="py-6">
        <SidebarAds page={page} />
      </Container>
    );
  }
  return (
    <Container className="py-6">
      <HeroBannerSlider page={page} />
    </Container>
  );
}
