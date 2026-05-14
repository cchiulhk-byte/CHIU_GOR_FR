import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
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

  const leftLinks = allLinks.slice(0, 3);
  const rightLinks = allLinks.slice(3);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled || !isHomePage 
          ? 'glass-surface translate-y-0' 
          : 'bg-transparent -translate-y-1'
      }`}
    >

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* ── Left Links (Desktop) ── */}
        <div className="hidden lg:flex items-center gap-8 flex-1">
          {isHomePage && leftLinks.map((link) => (
            link.path ? (
              <Link
                key={link.id}
                to={link.path}
                className={`text-[13px] font-bold tracking-widest uppercase whitespace-nowrap transition-all duration-300 relative group ${
                  scrolled || !isHomePage ? 'text-[#1A1410] dark:text-[#E8E0F5]' : 'text-gray-800 dark:text-white'
                }`}
                style={{ fontFamily: tokens.typography.fontFamily }}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ) : (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`text-[13px] font-bold tracking-widest uppercase whitespace-nowrap transition-all duration-300 relative group ${
                  scrolled || !isHomePage ? 'text-[#1A1410] dark:text-[#E8E0F5]' : 'text-gray-800 dark:text-white'
                }`}
                style={{ fontFamily: tokens.typography.fontFamily }}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral transition-all duration-300 group-hover:w-full"></span>
              </button>
            )
          ))}
        </div>

        {/* ── Center Logo ── */}
        <div className="flex items-center justify-center lg:px-8">
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
            <div className="flex flex-col leading-tight">
              <span
                className="font-black text-sm sm:text-lg tracking-tight flex items-center gap-1"
                style={{ fontFamily: "Candara, 'Nunito', sans-serif" }}
              >
                <span className={scrolled || !isHomePage ? "text-[#CC0000]" : "text-[#CC0000] dark:text-white"}>Chiu Gor</span>
                <span className="text-teal">French</span>
              </span>
              <span
                className="hidden sm:block text-[8px] sm:text-[9px] font-bold tracking-[0.2em] uppercase text-[#7A7068] dark:text-gray-400"
                style={{ fontFamily: "Candara, 'Nunito', sans-serif" }}
              >
                Langue Française
              </span>
            </div>
          </Link>
        </div>

        {/* ── Right Links + Controls ── */}
        <div className="flex items-center justify-end gap-3 sm:gap-6 flex-1">
          {/* Desktop Right Links */}
          <div className="hidden xl:flex items-center gap-6 mr-4">
            {isHomePage && rightLinks.map((link) => (
              link.path ? (
                <Link
                  key={link.id}
                  to={link.path}
                  className={`text-[13px] font-bold tracking-widest uppercase whitespace-nowrap transition-all duration-300 relative group ${
                    scrolled || !isHomePage ? 'text-[#1A1410] dark:text-[#E8E0F5]' : 'text-gray-800 dark:text-white'
                  }`}
                  style={{ fontFamily: tokens.typography.fontFamily }}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ) : (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className={`text-[13px] font-bold tracking-widest uppercase whitespace-nowrap transition-all duration-300 relative group ${
                    scrolled || !isHomePage ? 'text-[#1A1410] dark:text-[#E8E0F5]' : 'text-gray-800 dark:text-white'
                  }`}
                  style={{ fontFamily: tokens.typography.fontFamily }}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral transition-all duration-300 group-hover:w-full"></span>
                </button>
              )
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={() => window.location.href = '/booking'}
              className="hidden sm:flex !px-4 sm:!px-6 !py-2.5 !text-[11px] !font-black !tracking-widest !uppercase !rounded-full !whitespace-nowrap shadow-lg hover:shadow-coral/20 transition-all duration-300"
            >
              {t('booking_title')}
            </Button>

            {user ? (
              <Button
                variant="outline"
                onClick={confirmLogout}
                className="hidden lg:flex !px-5 !py-2.5 !text-[11px] !font-bold !rounded-full !whitespace-nowrap !bg-white/10 backdrop-blur-md border-[#D4C8BC]/30"
                title={user.email || ''}
              >
                <i className="ri-user-line mr-1.5"></i>
                <span className="max-w-[70px] truncate">{(user.email ? String(user.email).split('@')[0] : 'Account')}</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => window.location.href = '/login'}
                className="hidden lg:flex !px-5 !py-2.5 !text-[11px] !font-bold !rounded-full !whitespace-nowrap !bg-white/10 backdrop-blur-md border-[#D4C8BC]/30"
              >
                {t('nav_login')}
              </Button>
            )}

            {/* Compact Controls */}
            <div className="hidden lg:flex items-center gap-1 ml-2">
              <div className="flex bg-[#1A1410]/5 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLangChange(lang.code)}
                    className={`px-2 py-1 rounded-full text-[10px] font-black transition-all ${
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
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {isDark ? <i className="ri-sun-fill text-yellow-400"></i> : <i className="ri-moon-fill text-gray-400"></i>}
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-coral/10 text-coral"
            >
              <i className={menuOpen ? "ri-close-line text-xl" : "ri-menu-3-line text-xl"}></i>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile/Tablet Menu with slide animation ── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        } bg-[#F7F4EF]/98 dark:bg-[#1A0A2E]/98 backdrop-blur-xl border-t border-[#D4C8BC]/60 dark:border-[#5B2D8E]/30`}
      >
        <div className="px-4 py-3 flex flex-col gap-1">
          {allLinks.map((link, i) => (
            link.path ? (
              <Link
                key={link.id}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className="text-left text-sm font-bold text-[#1A1410] dark:text-[#D4B8F0] py-3.5 px-4 rounded-2xl hover:bg-coral/10 hover:text-coral transition-all duration-300 flex items-center justify-between group"
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
              className="text-left text-sm font-bold text-[#1A1410] dark:text-[#D4B8F0] py-3.5 px-4 rounded-2xl hover:bg-coral/10 hover:text-coral transition-all duration-300 flex items-center justify-between mt-1"
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
            <div className="flex bg-[#1A1410]/5 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang.code)}
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
