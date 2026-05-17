import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { smoothScrollTo } from '@/hooks/useSmoothScroll';
import { supabase } from '@/lib/supabase';
import { useLogout } from '@/components/feature/LogoutProvider';
import { Button } from '@/design-system/atoms/Button';
import { tokens } from '@/design-system/tokens';

interface NavbarProps {
  isDark: boolean;
  onToggleDark: () => void;
}

const LANGUAGES = [
  { code: 'zh-HK', label: '中文' },
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
];

// Ripple effect hook
function useRipple() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const trigger = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  };
  return { ripples, trigger };
}

export default function Navbar({ isDark, onToggleDark }: NavbarProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [darkAnimKey, setDarkAnimKey] = useState(0);
  const [activeLang, setActiveLang] = useState(i18n.language);
  const [langAnimKey, setLangAnimKey] = useState<Record<string, number>>({});
  const { confirmLogout } = useLogout();
  const darkRipple = useRipple();
  const prevDark = useRef(isDark);

  // Unified font stack for consistent look across EN/FR/ZH
  const fontNav = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setActiveLang(i18n.language);
  }, [i18n.language]);

  const handleLogout = () => {
    confirmLogout();
  };

  // Trigger icon animation when dark mode changes
  useEffect(() => {
    if (prevDark.current !== isDark) {
      setDarkAnimKey((k) => k + 1);
      prevDark.current = isDark;
    }
  }, [isDark]);

  const handleDarkToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    darkRipple.trigger(e);
    onToggleDark();
  };

  const handleLangChange = (code: string) => {
    if (code === i18n.language) return;
    setLangAnimKey((prev) => ({ ...prev, [code]: (prev[code] ?? 0) + 1 }));
    setActiveLang(code);
    i18n.changeLanguage(code);
  };

  const scrollTo = (id: string) => {
    smoothScrollTo(id);
    setMenuOpen(false);
  };

  const allLinks = [
    { id: 'about', label: t('nav_about') },
    { id: 'experience', label: t('nav_experience') },
    { id: 'courses', label: t('nav_courses') },
    { id: 'blog', label: t('nav_blog'), path: '/blog' },
    { id: 'contact', label: t('nav_contact') },
    ...(user ? [{ id: 'my-bookings', label: t('my_bookings_title'), path: '/my-bookings' }] : []),
  ];

  const navLinks = allLinks;

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled || !isHomePage 
          ? 'glass-surface translate-y-0' 
          : 'bg-transparent -translate-y-1'
      }`}
    >

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center">
        
        {/* ── Left: All Nav Links (Desktop) ── */}
        <div className="hidden xl:flex items-center flex-wrap gap-x-5 gap-y-1 flex-1 min-w-0">
          {isHomePage && navLinks.map((link, i) => (
            <span key={link.id} className={`flex items-center gap-5 ${link.id === 'my-bookings' ? 'basis-full' : ''}`}>
              {link.path ? (
                <Link
                  to={link.path}
                  className={`text-[13px] font-bold tracking-wide uppercase whitespace-nowrap transition-all duration-300 relative group ${
                    link.id === 'my-bookings'
                      ? 'bg-[#ffee88] text-[#fcd6f9] px-4 py-1.5 rounded-xl hover:opacity-90'
                      : scrolled || !isHomePage ? 'text-white/90 hover:text-white' : 'text-gray-800 dark:text-white'
                  }`}
                  style={{ fontFamily: tokens.typography.fontFamily }}
                >
                  {link.label}
                  {link.id !== 'my-bookings' && <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral transition-all duration-300 group-hover:w-full"></span>}
                </Link>
              ) : (
                <button
                  onClick={() => scrollTo(link.id)}
                  className={`text-[13px] font-bold tracking-wide uppercase whitespace-nowrap transition-all duration-300 relative group ${
                    scrolled || !isHomePage ? 'text-white/90 hover:text-white' : 'text-gray-800 dark:text-white'
                  }`}
                  style={{ fontFamily: tokens.typography.fontFamily }}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral transition-all duration-300 group-hover:w-full"></span>
                </button>
              )}
              {i < 4 && i < navLinks.length - 1 && (
                <span className="w-px h-4" style={{ backgroundColor: '#ffd900' }} />
              )}
            </span>
          ))}
        </div>

        {/* ── Center Logo ── */}
        <div className="flex items-center justify-center flex-shrink-0 mx-auto xl:mx-0 xl:px-9">
          <Link
            to="/"
            className="flex items-center gap-2.5 cursor-pointer group transition-transform duration-500 hover:scale-105"
          >
            <img
              src="https://static.readdy.ai/image/c3c070ed3a92273f043678549554b0d6/e3451f52961636b2aea237770c224254.png"
              alt="Chiu Gor French Logo"
              fetchPriority="high"
              decoding="async"
              className="h-10 sm:h-12 w-auto object-contain"
            />
            <div className="flex flex-col leading-tight whitespace-nowrap">
              <span
                className="font-black text-sm sm:text-lg tracking-tight flex items-center gap-1"
                style={{ fontFamily: "Candara, 'Nunito', sans-serif" }}
              >
                <span className={scrolled || !isHomePage ? "text-[#FF4444]" : "text-[#CC0000] dark:text-white"}>Chiu Gor</span>
                <span className="text-teal">French</span>
              </span>
              <span
                className={`hidden sm:block text-[8px] sm:text-[9px] font-bold tracking-[0.2em] uppercase ${scrolled || !isHomePage ? 'text-white/50' : 'text-[#7A7068] dark:text-gray-400'}`}
                style={{ fontFamily: "Candara, 'Nunito', sans-serif" }}
              >
                Langue Française
              </span>
            </div>
          </Link>
        </div>

        {/* ── Right: Controls ── */}
        <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
          <Button
            variant="primary"
            onClick={() => navigate('/booking')}
            className="hidden sm:flex !px-5 !py-2.5 !text-[13px] !font-black !tracking-wide !uppercase !rounded-xl !whitespace-nowrap !border-0 shadow-lg hover:shadow-coral/20 transition-all duration-300"
          >
            {t('booking_title')}
          </Button>

          {user ? (
            <Button
              variant="outline"
              onClick={confirmLogout}
              className={`hidden lg:flex !px-5 !py-2.5 !text-[13px] !font-black !rounded-xl !whitespace-nowrap !bg-transparent !border-0 !shadow-none ${scrolled || !isHomePage ? '!text-white' : '!text-[#1A1410] dark:!text-white'}`}
              title={user.email || ''}
            >
              <i className="ri-user-line mr-1.5"></i>
              <span className="max-w-[80px] truncate">{(user.email ? String(user.email).split('@')[0] : 'Account')}</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="hidden lg:flex !px-5 !py-2.5 !text-[13px] !font-black !rounded-xl !whitespace-nowrap !border-0 !shadow-none !bg-[#ff5400] !text-[#fdeed9] hover:!opacity-90 transition-all duration-300"
            >
              {t('nav_login')}
            </Button>
          )}

          {/* Language + Dark Mode */}
          <div className="hidden xl:flex items-center gap-1 flex-shrink-0" role="group" aria-label="Language and theme">
            <div className="flex whitespace-nowrap bg-[#1A1410]/5 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/5" role="radiogroup" aria-label="Language">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang.code)}
                  aria-label={`Switch to ${lang.label}`}
                  aria-pressed={i18n.language === lang.code}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                    i18n.language === lang.code 
                      ? 'bg-coral text-white' 
                      : 'text-gray-500 hover:text-coral'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleDarkToggle}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {isDark ? <i className="ri-sun-fill text-yellow-400"></i> : <i className="ri-moon-fill text-gray-400"></i>}
            </button>
          </div>

          {/* Mobile/Tablet Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="xl:hidden w-10 h-10 flex items-center justify-center rounded-full bg-coral/10 text-coral"
          >
            <i className={menuOpen ? "ri-close-line text-xl" : "ri-menu-3-line text-xl"}></i>
          </button>
        </div>
      </div>

      {/* ── Mobile/Tablet Menu with slide animation ── */}
      <div
        className={`xl:hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-[85vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'
        } bg-[#F7F4EF]/98 dark:bg-[#1A0A2E]/98 backdrop-blur-xl border-t border-[#D4C8BC]/60 dark:border-[#5B2D8E]/30`}
      >
        <div className="px-4 py-3 flex flex-col gap-1">
          {allLinks.map((link, i) => (
            link.path ? (
              <Link
                key={link.id}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`text-left text-sm font-bold py-3.5 px-4 rounded-2xl transition-all duration-300 flex items-center justify-between group ${
                  link.id === 'my-bookings'
                    ? 'bg-[#ffee88] text-[#fcd6f9] hover:opacity-90'
                    : 'text-[#1A1410] dark:text-[#D4B8F0] hover:bg-coral/10 hover:text-coral'
                }`}
                style={{
                  fontFamily: fontNav,
                  transitionDelay: menuOpen ? `${i * 0.05}s` : '0s',
                }}
              >
                {link.label}
                <i className="ri-arrow-right-line opacity-0 group-hover:opacity-100 transition-all"></i>
              </Link>
            ) : (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-left text-sm font-bold text-[#1A1410] dark:text-[#D4B8F0] py-3.5 px-4 rounded-2xl hover:bg-coral/10 hover:text-coral transition-all duration-300 flex items-center justify-between group"
                style={{
                  fontFamily: fontNav,
                  transitionDelay: menuOpen ? `${i * 0.05}s` : '0s',
                }}
              >
                {link.label}
                <i className="ri-arrow-right-line opacity-0 group-hover:opacity-100 transition-all"></i>
              </button>
            )
          ))}
          <Link
            to="/booking"
            className="text-left text-sm font-bold text-white py-3.5 px-4 rounded-2xl bg-coral hover:bg-coral/90 transition-all duration-300 flex items-center justify-between mt-2 shadow-lg shadow-coral/20"
            style={{ fontFamily: fontNav }}
            onClick={() => setMenuOpen(false)}
          >
            <div className="flex items-center gap-2">
              <i className="ri-calendar-check-line"></i>
              {t('booking_title')}
            </div>
            <i className="ri-arrow-right-line"></i>
          </Link>

          {!user ? (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="text-left text-sm font-bold text-[#fdeed9] bg-[#390099] py-3.5 px-4 rounded-2xl hover:opacity-90 transition-all duration-300 flex items-center justify-between mt-1"
              style={{ fontFamily: fontNav }}
            >
              {t('nav_login')}
              <i className="ri-login-box-line"></i>
            </Link>
          ) : (
            <button
              onClick={() => {
                setMenuOpen(false);
                confirmLogout();
              }}
              className="text-left text-sm font-bold text-[#1A1410] dark:text-[#D4B8F0] py-3.5 px-4 rounded-2xl hover:bg-[#CC0000]/10 hover:text-[#CC0000] transition-all duration-300 flex items-center justify-between mt-1"
              style={{ fontFamily: fontNav }}
            >
              {t('nav_logout')}
              <i className="ri-logout-box-r-line"></i>
            </button>
          )}

          {/* Mobile/Tablet Language + Theme Row */}
          <div className="mt-2 pt-2 border-t border-[#D4C8BC]/40 dark:border-[#5B2D8E]/20 flex items-center justify-between px-3 py-1">
            <div className="flex bg-[#1A1410]/5 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/5" role="radiogroup" aria-label="Language">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang.code)}
                  aria-label={`Switch to ${lang.label}`}
                  aria-pressed={i18n.language === lang.code}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                    i18n.language === lang.code 
                      ? 'bg-coral text-white' 
                      : 'text-gray-500 hover:text-coral'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleDarkToggle}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-[#2D1B4E] border border-[#D4C8BC]/60 dark:border-[#5B2D8E]/40 text-[#4A4440] dark:text-[#D4B8F0] shadow-sm active:scale-90 transition-transform"
            >
              <span key={darkAnimKey}>
                {isDark ? (
                  <i className="ri-sun-line text-lg text-yellow-400 animate-spin-in" />
                ) : (
                  <i className="ri-moon-line text-lg animate-moon-in" />
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
