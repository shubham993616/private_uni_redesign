import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Moon, Sun, Menu, X, User, Bookmark, Settings, LogOut, ChevronDown, Shield,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import AccessibilityWidget from './AccessibilityWidget';
import SearchBar from '../search/SearchBar';
import Container from './Container';
import { Dropdown } from '../ui';

/**
 * Navbar — the trust header. Sticky, translucent, gains a hairline shadow on
 * scroll. One search pattern (SearchBar), click-triggered menus, brand-700
 * active indicator (single-color underline), role-aware Admin link, working
 * mobile search. Height 64px desktop / 56px mobile.
 */
const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/universities', label: 'Universities' },
  { to: '/courses', label: 'Courses' },
  { to: '/exams', label: 'Exams' },
  { to: '/compare-universities', label: 'Compare' },
  { to: '/foreign-universities', label: 'Abroad' },
];

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const links = isAdmin ? [...NAV_LINKS, { to: '/admin', label: 'Admin' }] : NAV_LINKS;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile panel on navigation.
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (to) =>
    location.pathname === to || (to !== '/' && location.pathname?.startsWith(to + '/'));

  return (
    <nav
      className={`sticky top-0 z-[100] bg-white/95 dark:bg-dark-bg/95 backdrop-blur border-b border-light-border dark:border-dark-border transition-shadow duration-200 ${
        scrolled ? 'shadow-card' : ''
      }`}
      aria-label="Main navigation"
    >
      <Container>
        <div className="flex items-center justify-between h-14 md:h-16 gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Vidyarthi Mitra home">
            <img src={logo} alt="Vidyarthi Mitra" className="h-7 md:h-8" />
          </Link>

          {/* Primary nav */}
          <div className="hidden lg:flex items-center h-full">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                aria-current={isActive(l.to) ? 'page' : undefined}
                className={`relative h-full flex items-center px-4 text-sm font-semibold transition-colors duration-150 ${
                  isActive(l.to)
                    ? 'text-link dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-light-text dark:hover:text-white'
                }`}
              >
                {l.label}
                {isActive(l.to) && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary" aria-hidden="true" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Global search (desktop) */}
            <SearchBar size="md" className="hidden md:block w-56 lg:w-64 focus-within:w-72 transition-all" placeholder="Search universities, courses…" />

            <button
              type="button"
              onClick={toggle}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-btn hover:bg-light-card dark:hover:bg-dark-card transition-colors"
            >
              {dark ? <Sun className="w-5 h-5 text-accent" aria-hidden="true" /> : <Moon className="w-5 h-5 text-slate-600" aria-hidden="true" />}
            </button>

            <AccessibilityWidget inline />

            {user ? (
              <Dropdown
                trigger={({ open }) => (
                  <span className="flex items-center gap-1.5 p-1.5 rounded-btn hover:bg-light-card dark:hover:bg-dark-card transition-colors cursor-pointer">
                    <span className="w-8 h-8 rounded-btn bg-primary text-white text-sm font-bold flex items-center justify-center">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </span>
                    <ChevronDown className={`w-4 h-4 hidden md:block transition-transform duration-150 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </span>
                )}
              >
                <div className="px-4 py-3 bg-light-card dark:bg-white/5 border-b border-light-border dark:border-dark-border">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-caption truncate">{user.email}</p>
                </div>
                <div className="py-1.5">
                  <Dropdown.Item as={Link} to="/profile?tab=overview" icon={User}>Dashboard</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/profile?tab=saved-colleges" icon={Bookmark}>My shortlist</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/profile?tab=settings" icon={Settings}>Settings</Dropdown.Item>
                  {isAdmin && (
                    <Dropdown.Item as={Link} to="/admin" icon={Shield} className="text-link dark:text-primary-300">
                      Admin panel
                    </Dropdown.Item>
                  )}
                  <div className="h-px bg-light-border dark:bg-dark-border my-1.5 mx-3" aria-hidden="true" />
                  <Dropdown.Item
                    icon={LogOut}
                    className="text-error-text dark:text-red-300"
                    onClick={() => { logout(); navigate('/'); }}
                  >
                    Log out
                  </Dropdown.Item>
                </div>
              </Dropdown>
            ) : (
              <div className="hidden md:flex items-center gap-1.5">
                <Link to="/login" className="h-10 px-4 inline-flex items-center rounded-btn text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-light-card dark:hover:bg-dark-card transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="h-10 px-4 inline-flex items-center rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors duration-150">
                  Sign up
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="lg:hidden p-2 rounded-btn text-slate-600 dark:text-slate-300 hover:bg-light-card dark:hover:bg-dark-card transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile panel — with a WORKING search */}
        {mobileOpen && (
          <div className="lg:hidden py-4 border-t border-light-border dark:border-dark-border space-y-1">
            <div className="px-1 pb-3">
              <SearchBar size="md" placeholder="Search universities, courses…" />
            </div>
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                aria-current={isActive(l.to) ? 'page' : undefined}
                className={`flex items-center px-4 h-11 rounded-btn text-sm font-semibold transition-colors ${
                  isActive(l.to)
                    ? 'bg-primary-50 dark:bg-primary/15 text-link dark:text-primary-300'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-light-card dark:hover:bg-dark-card'
                }`}
              >
                {l.label}
              </Link>
            ))}
            {!user && (
              <div className="flex gap-3 pt-3 px-1">
                <Link to="/login" className="flex-1 h-11 inline-flex items-center justify-center rounded-btn text-sm font-semibold border border-primary/40 text-link dark:text-primary-300">
                  Login
                </Link>
                <Link to="/signup" className="flex-1 h-11 inline-flex items-center justify-center rounded-btn text-sm font-semibold bg-primary text-white">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </Container>
    </nav>
  );
}
