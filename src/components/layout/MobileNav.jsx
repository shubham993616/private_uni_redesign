import { Link, useLocation } from 'react-router-dom';
import { Home, GraduationCap, Scale, BookOpen, User } from 'lucide-react';

/**
 * MobileNav — bottom tab bar (<md). Compare is now reachable from the thumb
 * bar (it was previously desktop-only); Abroad stays one tap away via the
 * navbar menu and footer. Active tab = brand tint chip + label.
 */
export default function MobileNav() {
  const { pathname } = useLocation();
  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/universities', icon: GraduationCap, label: 'Colleges' },
    { to: '/compare-universities', icon: Scale, label: 'Compare' },
    { to: '/courses', icon: BookOpen, label: 'Courses' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-dark-card/95 backdrop-blur border-t border-light-border dark:border-dark-border md:hidden z-50 pb-safe"
      aria-label="Mobile navigation"
    >
      <div className="flex justify-around py-1">
        {links.map((l) => {
          const isActive = pathname === l.to || (l.to !== '/' && pathname?.startsWith(l.to + '/'));
          return (
            <Link
              key={l.to}
              to={l.to}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[56px] transition-colors ${
                isActive ? 'text-link dark:text-primary-300' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <span
                className={`flex items-center justify-center w-9 h-7 rounded-lg transition-colors ${
                  isActive ? 'bg-primary-50 dark:bg-primary/15' : ''
                }`}
              >
                <l.icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="text-[11px] font-semibold leading-3">{l.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
