import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import {
  LayoutDashboard, Building2, BookOpen, FileText, Newspaper,
  Users, Image, MessageSquareQuote, FileEdit, HelpCircle,
  Mail, Bell, Send, Settings, Shield, Menu, X, ChevronLeft, FileSpreadsheet, BarChart3,
  Star, Wrench
} from 'lucide-react';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
  { label: 'Universities', icon: Building2, path: '/admin/universities' },
  { label: 'Courses', icon: BookOpen, path: '/admin/courses' },
  { label: 'Exams', icon: FileText, path: '/admin/exams' },
  { label: 'News', icon: Newspaper, path: '/admin/news' },
  { label: 'Users', icon: Users, path: '/admin/users', superadminOnly: true },
  { label: 'Leads', icon: MessageSquareQuote, path: '/admin/leads' },
  { divider: true, label: 'Advertising' },
  { label: 'Banners', icon: Image, path: '/admin/banners' },
  { label: 'Ad Analytics', icon: BarChart3, path: '/admin/banner-analytics' },
  { divider: true, label: 'CMS' },
  { label: 'Testimonials', icon: MessageSquareQuote, path: '/admin/testimonials' },
  { label: 'Pages', icon: FileEdit, path: '/admin/pages' },
  { label: 'FAQs', icon: HelpCircle, path: '/admin/faqs' },
  { divider: true, label: 'Communication' },
  { label: 'Contact Forms', icon: Mail, path: '/admin/contacts' },
  { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
  { label: 'Newsletter', icon: Send, path: '/admin/newsletter' },
  { divider: true, label: 'System' },
  { label: 'Site Settings', icon: Settings, path: '/admin/settings' },
  { label: 'Data Import', icon: FileSpreadsheet, path: '/admin/data-import' },
  { label: 'Audit Logs', icon: Shield, path: '/admin/audit-logs', superadminOnly: true },
];

export default function AdminLayout() {
  const { isSuperAdmin } = useRole();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const filteredNavItems = navItems.filter(item => !item.superadminOnly || isSuperAdmin);

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname?.startsWith(path);
  };

  const SidebarContent = () => (
    <nav className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-ink-800">
        <Link to="/admin" className="flex items-center gap-2 text-white">
          <Shield className="w-5 h-5 text-primary-light" aria-hidden="true" />
          {sidebarOpen && <span className="text-card-title !text-white">Admin Panel</span>}
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'} className="hidden md:block p-1.5 rounded-btn text-slate-400 hover:bg-white/10 hover:text-white transition-colors duration-150">
          <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} aria-hidden="true" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {filteredNavItems.map((item, i) => {
          if (item.divider) {
            return sidebarOpen ? (
              <div key={i} className="pt-4 pb-1 px-3">
                <span className="text-eyebrow !text-slate-500">{item.label}</span>
              </div>
            ) : <div key={i} className="my-2 h-px bg-ink-800" />;
          }
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-label transition-colors duration-150 ${active
                ? 'bg-primary !text-white'
                : '!text-slate-300 hover:bg-white/10 hover:!text-white'
              }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>
      <div className="p-3 border-t border-ink-800 space-y-1">
        {sidebarOpen && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-caption font-semibold ${isSuperAdmin ? 'bg-accent/15 !text-accent-300' : 'bg-primary/15 !text-primary-300'}`}>
            <Shield className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{isSuperAdmin ? 'Super Admin' : 'Admin'}</span>
          </div>
        )}
        <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-btn text-label !text-slate-400 hover:bg-white/10 hover:!text-white transition-colors duration-150">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          {sidebarOpen && <span>Back to Site</span>}
        </Link>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col border-r border-ink-800 bg-ink transition-all duration-300 ${sidebarOpen ? 'w-60' : 'w-16'} sticky top-0 h-screen`}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-ink z-50 shadow-modal">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-light-border dark:border-dark-border px-4 md:px-6 py-3 flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} aria-label="Open navigation" className="md:hidden p-1.5 rounded-btn hover:bg-light-card dark:hover:bg-dark-card transition-colors duration-150">
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <h1 className="text-h3 capitalize flex-1">
            {filteredNavItems.find(n => !n.divider && isActive(n.path))?.label || 'Admin'}
          </h1>
          {isSuperAdmin ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <Star className="w-3.5 h-3.5" aria-hidden="true" /> Super Admin
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-link dark:text-primary-300">
              <Wrench className="w-3.5 h-3.5" aria-hidden="true" /> Admin
            </span>
          )}
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
