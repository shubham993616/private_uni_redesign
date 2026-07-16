import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Moon, Sun, Menu, X, User, Bookmark, Settings, LogOut, ChevronDown, Shield,
  GraduationCap, Stethoscope, Briefcase, Scale, Palette, MapPin, 
  Layers, School, Sparkles, Building2, BookOpen, Award, FileText,
  Flag, Globe2, Compass, Landmark, HelpCircle, ArrowRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import AccessibilityWidget from './AccessibilityWidget';
import SearchBar from '../search/SearchBar';
import Container from './Container';
import { Dropdown } from '../ui';

// Extended link metadata configuration for data-driven Mega Menus
const NAV_MENU_CONFIG = {
  '/universities': {
    columns: [
      {
        title: 'Browse by Stream',
        items: [
          { label: 'Engineering', desc: 'B.Tech, M.Tech paths', icon: GraduationCap, to: '/universities?stream=engineering' },
          { label: 'Medical', desc: 'MBBS, BDS programs', icon: Stethoscope, to: '/universities?stream=medical' },
          { label: 'Management', desc: 'MBA, BBA tracks', icon: Briefcase, to: '/universities?stream=management' },
          { label: 'Law', desc: 'Integrated LLB, LLM', icon: Scale, to: '/universities?stream=law' },
          { label: 'Arts & Humanities', desc: 'BA, MA specializations', icon: Palette, to: '/universities?stream=arts' },
        ]
      },
      {
        title: 'Browse by State',
        items: [
          { label: 'Uttar Pradesh', icon: MapPin, to: '/universities?state=UP' },
          { label: 'Delhi NCR', icon: MapPin, to: '/universities?state=Delhi' },
          { label: 'Maharashtra', icon: MapPin, to: '/universities?state=Maharashtra' },
          { label: 'Rajasthan', icon: MapPin, to: '/universities?state=Rajasthan' },
          { label: 'Karnataka', icon: MapPin, to: '/universities?state=Karnataka' },
          { label: 'Tamil Nadu', icon: MapPin, to: '/universities?state=TN' },
          { label: 'View All States', icon: Layers, to: '/universities', isAction: true },
        ]
      },
      {
        title: 'Popular Discovery',
        items: [
          { label: 'Top Private Universities', icon: School, to: '/universities?type=private' },
          { label: 'Top Government Universities', icon: Building2, to: '/universities?type=government' },
          { label: 'Admissions Open 2026', icon: Sparkles, to: '/universities?admissions=open' },
          { label: 'NAAC A++ Accredited', icon: Award, to: '/universities?naac=app' },
          { label: 'NIRF Ranked Institutions', icon: Layers, to: '/universities?ranked=nirf' },
          { label: 'Best Placements Records', icon: Briefcase, to: '/universities?feature=placements' },
        ]
      },
      {
        title: 'Featured University',
        isFeaturedCard: true,
        image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80',
        name: 'Amity University',
        badge: 'Admissions Open',
        meta: 'NAAC A++ Grade • UGC Approved',
        to: '/university/amity-university'
      }
    ],
    footerCTA: { label: 'Explore All Universities', to: '/universities' }
  },
  '/courses': {
    columns: [
      {
        title: 'Engineering',
        items: [
          { label: 'B.Tech / B.E.', to: '/courses/btech' },
          { label: 'M.Tech', to: '/courses/mtech' },
          { label: 'Computer Science', to: '/courses/cse' },
          { label: 'AI & Machine Learning', to: '/courses/ai-ml' },
          { label: 'Data Science', to: '/courses/data-science' },
          { label: 'Cyber Security', to: '/courses/cyber-security' },
        ]
      },
      {
        title: 'Medical & Healthcare',
        items: [
          { label: 'MBBS', to: '/courses/mbbs' },
          { label: 'BDS (Dental)', to: '/courses/bds' },
          { label: 'BAMS (Ayurveda)', to: '/courses/bams' },
          { label: 'BHMS (Homeopathy)', to: '/courses/bhms' },
          { label: 'Nursing BSc', to: '/courses/nursing' },
          { label: 'Pharmacy (B.Pharm)', to: '/courses/bpharm' },
        ]
      },
      {
        title: 'Management & Commerce',
        items: [
          { label: 'MBA / PGDM', to: '/courses/mba' },
          { label: 'BBA', to: '/courses/bba' },
          { label: 'B.Com (Honours)', to: '/courses/bcom' },
          { label: 'Finance & Banking', to: '/courses/finance' },
          { label: 'Marketing Management', to: '/courses/marketing' },
          { label: 'Business Analytics', to: '/courses/analytics' },
        ]
      },
      {
        title: 'Other Professional Fields',
        items: [
          { label: 'Law (BA LLB / BBA LLB)', to: '/courses/law' },
          { label: 'Architecture (B.Arch)', to: '/courses/barch' },
          { label: 'Design (B.Des / M.Des)', to: '/courses/design' },
          { label: 'Arts & Media', to: '/courses/arts' },
          { label: 'Hotel Management', to: '/courses/hm' },
          { label: 'Agriculture Sciences', to: '/courses/agriculture' },
        ]
      }
    ],
    footerCTA: { label: 'Browse All Courses Spectrum', to: '/courses' }
  },
  '/exams': {
    columns: [
      {
        title: 'Engineering Entrance',
        items: [
          { label: 'JEE Main', to: '/exams/jee-main' },
          { label: 'JEE Advanced', to: '/exams/jee-advanced' },
          { label: 'BITSAT', to: '/exams/bitsat' },
          { label: 'VITEEE', to: '/exams/viteee' },
          { label: 'SRMJEEE', to: '/exams/srmjeee' },
          { label: 'WBJEE', to: '/exams/wbjee' },
        ]
      },
      {
        title: 'Medical Entrance',
        items: [
          { label: 'NEET UG', to: '/exams/neet-ug' },
          { label: 'NEET PG', to: '/exams/neet-pg' },
          { label: 'AIIMS Professional', to: '/exams/aiims' },
          { label: 'INI CET', to: '/exams/ini-cet' },
        ]
      },
      {
        title: 'Management Entrance',
        items: [
          { label: 'CAT Examination', to: '/exams/cat' },
          { label: 'MAT Test', to: '/exams/mat' },
          { label: 'CMAT National', to: '/exams/cmat' },
          { label: 'SNAP Test', to: '/exams/snap' },
          { label: 'XAT Decision Making', to: '/exams/xat' },
          { label: 'NMAT by GMAC', to: '/exams/nmat' },
        ]
      },
      {
        title: 'Other Competitive Exams',
        items: [
          { label: 'CUET (UG / PG)', to: '/exams/cuet' },
          { label: 'CLAT (Law Entrance)', to: '/exams/clat' },
          { label: 'GATE Graduate Test', to: '/exams/gate' },
          { label: 'NATA (Architecture)', to: '/exams/nata' },
          { label: 'UGC NET Research', to: '/exams/ugc-net' },
        ]
      }
    ],
    footerCTA: { label: 'View Exam Timeline & Notifications Calendar', to: '/exams' }
  },
  '/foreign-universities': {
    columns: [
      {
        title: 'Popular Countries',
        items: [
          { label: 'United States', icon: Flag, to: '/abroad/usa' },
          { label: 'Canada', icon: Flag, to: '/abroad/canada' },
          { label: 'United Kingdom', icon: Flag, to: '/abroad/uk' },
          { label: 'Australia', icon: Flag, to: '/abroad/australia' },
          { label: 'Germany', icon: Flag, to: '/abroad/germany' },
          { label: 'France', icon: Flag, to: '/abroad/france' },
        ]
      },
      {
        title: 'Programs Fields',
        items: [
          { label: 'Global Engineering', to: '/abroad?field=engineering' },
          { label: 'International Business', to: '/abroad?field=business' },
          { label: 'Medical Specializations', to: '/abroad?field=medicine' },
          { label: 'Computer Science Masters', to: '/abroad?field=cse' },
          { label: 'Global Design Structures', to: '/abroad?field=design' },
        ]
      },
      {
        title: 'Student Resources',
        items: [
          { label: 'Global Scholarships Tracker', icon: Award, to: '/abroad/scholarships' },
          { label: 'Visa Application Guides', icon: FileText, to: '/abroad/visa-guide' },
          { label: 'IELTS Prep Guidelines', icon: BookOpen, to: '/exams/ielts' },
          { label: 'TOEFL Resources', icon: BookOpen, to: '/exams/toefl' },
          { label: 'GRE & GMAT Targets', icon: Compass, to: '/exams/gre' },
        ]
      },
      {
        title: 'Premium Destinations',
        isFeaturedCard: true,
        image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80',
        name: 'Study Abroad Blueprint',
        badge: 'Free Consultation',
        meta: 'Partnered with 150+ Top Tier Institutions',
        to: '/abroad/consulting'
      }
    ],
    footerCTA: { label: 'Explore Study Abroad Frameworks', to: '/foreign-universities' }
  }
};

const BASE_NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/universities', label: 'Universities', hasDropdown: true },
  { to: '/courses', label: 'Courses', hasDropdown: true },
  { to: '/exams', label: 'Exams', hasDropdown: true },
  { to: '/compare-universities', label: 'Compare' },
  { to: '/foreign-universities', label: 'Abroad', hasDropdown: true },
];

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileAccordions, setMobileAccordions] = useState({});

  const navRef = useRef(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const links = isAdmin ? [...BASE_NAV_LINKS, { to: '/admin', label: 'Admin' }] : BASE_NAV_LINKS;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile panel and all menus on navigation changes
  useEffect(() => { 
    setMobileOpen(false); 
    setActiveDropdown(null);
  }, [location.pathname]);

  // Handle outside click closures and keyboard escape mechanics
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActiveDropdown(null);
    };

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isActive = (to) =>
    location.pathname === to || (to !== '/' && location.pathname?.startsWith(to + '/'));

  const toggleMobileAccordion = (path) => {
    setMobileAccordions((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-[100] bg-white/95 dark:bg-dark-bg/95 backdrop-blur border-b border-light-border dark:border-dark-border transition-shadow duration-200"
      aria-label="Main navigation"
    >
      {/* We make the main relative scope here to contain the mega menus safely inside viewport rules */}
      <div className="relative">
        <Container>
          <div className="flex items-center justify-between h-14 md:h-16 gap-3">
            <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Vidyarthi Mitra home">
              <img src={logo} alt="Vidyarthi Mitra" className="h-7 md:h-8" />
            </Link>

            {/* Primary Nav Matrix (Desktop Only) */}
            <div className="hidden lg:flex items-center h-full">
              {links.map((l) => {
                const menuData = NAV_MENU_CONFIG[l.to];
                const isMenuOpen = activeDropdown === l.to;

                return (
                  <div
                    key={l.to}
                    className="h-full flex items-center"
                    onMouseEnter={() => l.hasDropdown && setActiveDropdown(l.to)}
                    onMouseLeave={() => l.hasDropdown && setActiveDropdown(null)}
                  >
                    <Link
                      to={l.to}
                      aria-current={isActive(l.to) ? 'page' : undefined}
                      aria-expanded={l.hasDropdown ? isMenuOpen : undefined}
                      className={`relative h-full flex items-center gap-1 px-4 text-sm font-semibold transition-colors duration-150 z-50 ${
                        isActive(l.to)
                          ? 'text-link dark:text-primary-300'
                          : 'text-slate-600 dark:text-slate-300 hover:text-light-text dark:hover:text-white'
                      }`}
                    >
                      {l.label}
                      {l.hasDropdown && (
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180 text-orange-500' : ''}`} />
                      )}
                      {isActive(l.to) && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary" aria-hidden="true" />
                      )}
                    </Link>

                    {/* PREMIUM MEGA DROP-DOWN PANEL ENGINE */}
                    {l.hasDropdown && menuData && (
                      <div
                        className={`absolute top-full left-4 right-4 mx-auto max-w-7xl bg-white dark:bg-dark-card border border-light-border dark:border-dark-border p-8 shadow-xl rounded-2xl transition-all duration-180 ease-out origin-top z-40 ${
                          isMenuOpen 
                            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                            : 'opacity-0 -translate-y-2 scale-[0.98] pointer-events-none'
                        }`}
                      >
                        <div className="grid grid-cols-4 gap-8">
                          {menuData.columns.map((col, cIdx) => (
                            <div key={cIdx} className="space-y-4">
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                {col.title}
                              </h4>
                              
                              {col.isFeaturedCard ? (
                                /* Column Type: Featured Marketing Layout Block */
                                <Link to={col.to} className="group/card block relative overflow-hidden rounded-xl border border-light-border dark:border-dark-border bg-slate-50 dark:bg-white/5 p-3 transition-all hover:border-orange-500">
                                  <img src={col.image} alt={col.name} className="h-28 w-full object-cover rounded-lg mb-3 grayscale group-hover/card:grayscale-0 transition-all duration-300" />
                                  <span className="inline-block bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded mb-1">{col.badge}</span>
                                  <h5 className="text-sm font-bold text-slate-900 dark:text-white group-hover/card:text-orange-500">{col.name}</h5>
                                  <p className="text-[11px] text-slate-400 mt-0.5">{col.meta}</p>
                                  <span className="mt-3 inline-flex items-center text-xs font-bold text-orange-500 gap-1">
                                    View Portfolio <ArrowRight className="w-3 h-3 group-hover/card:translate-x-0.5 transition-transform" />
                                  </span>
                                </Link>
                              ) : (
                                /* Column Type: Standard Link Stream Grid Array */
                                <div className="space-y-1">
                                  {col.items?.map((item, iIdx) => {
                                    const ItemIcon = item.icon;
                                    return (
                                      <Link
                                        key={iIdx}
                                        to={item.to}
                                        className={`group/item flex items-start gap-3 p-2 rounded-xl transition-all ${
                                          item.isAction 
                                            ? 'text-orange-500 font-bold hover:bg-orange-500/5' 
                                            : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                        }`}
                                      >
                                        {ItemIcon && <ItemIcon className={`w-4 h-4 mt-0.5 transition-colors ${item.isAction ? 'text-orange-500' : 'text-slate-400 group-hover/item:text-orange-500'}`} />}
                                        <div>
                                          <p className={`text-sm font-semibold transition-colors ${item.isAction ? 'text-orange-500' : 'text-slate-700 dark:text-slate-200 group-hover/item:text-orange-500'}`}>
                                            {item.label}
                                          </p>
                                          {item.desc && <p className="text-[12px] text-slate-400 mt-0.5 group-hover/item:text-slate-500">{item.desc}</p>}
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Mega Menu Shared Data Footer */}
                        {menuData.footerCTA && (
                          <div className="mt-6 pt-4 border-t border-light-border dark:border-dark-border flex justify-end">
                            <Link to={menuData.footerCTA.to} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-500 hover:text-orange-600 transition-colors">
                              {menuData.footerCTA.label} <ChevronDown className="w-4 h-4 -rotate-90" />
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
                    Register
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

          {/* Responsive Mobile Drawer Panel with Nested Accordion Engines */}
          {mobileOpen && (
            <div className="lg:hidden py-4 border-t border-light-border dark:border-dark-border space-y-1 max-h-[calc(100vh-64px)] overflow-y-auto">
              <div className="px-1 pb-3">
                <SearchBar size="md" placeholder="Search universities, courses…" />
              </div>

              {links.map((l) => {
                const menuData = NAV_MENU_CONFIG[l.to];
                const isAccordionOpen = !!mobileAccordions[l.to];

                if (l.hasDropdown && menuData) {
                  return (
                    <div key={l.to} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => toggleMobileAccordion(l.to)}
                        className={`w-full flex items-center justify-between px-4 h-11 rounded-btn text-sm font-semibold transition-colors ${
                          isActive(l.to) ? 'text-link dark:text-primary-300' : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span>{l.label}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isAccordionOpen ? 'rotate-180 text-orange-500' : ''}`} />
                      </button>
                      
                      {isAccordionOpen && (
                        <div className="pl-6 pr-4 py-1 space-y-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-light-border dark:border-dark-border/40 my-1 mx-2">
                          {menuData.columns.map((col, cIdx) => (
                            <div key={cIdx} className="space-y-1.5">
                              <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-2">
                                {col.title}
                              </h5>
                              {col.isFeaturedCard ? (
                                <Link to={col.to} className="block p-2 text-xs font-semibold text-orange-500">
                                  {col.name} →
                                </Link>
                              ) : (
                                col.items?.map((item, iIdx) => (
                                  <Link
                                    key={iIdx}
                                    to={item.to}
                                    className="flex items-center h-8 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500"
                                  >
                                    {item.label}
                                  </Link>
                                ))
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
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
                );
              })}

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
      </div>
    </nav>
  );
}