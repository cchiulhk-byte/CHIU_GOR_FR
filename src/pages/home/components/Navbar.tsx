import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { smoothScrollTo } from '@/hooks/useSmoothScroll';
import { supabase } from '@/lib/supabase';

interface NavbarProps {
  isDark: boolean;
  onToggleDark: () => void;
}

const LANGUAGES = [
  { code: 'zh-HK', label: '繁中' },
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
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

  const navLinks = [
    { id: 'about', label: t('nav_about') },
    { id: 'experience', label: t('nav_experience') },
    { id: 'courses', label: t('nav_courses') },
    { id: 'blog', label: t('nav_blog'), path: '/blog' },
    { id: 'contact', label: t('nav_contact') },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-xl"
      style={scrolled || !isHomePage
        ? isDark
          ? {
              background: 'linear-gradient(135deg, #1A0A2E 0%, #2D1B4E 55%, #1E0D38 100%)',
              border: 'none',
              boxShadow: 'none',
            }
          : {
              background: 'rgba(247,244,239,0.98)',
              border: 'none',
              boxShadow: 'none',
            }
        : { background: 'transparent', border: 'none' }
      }
    >

      <div className="max-w-6xl mx-auto px-3 md:px-6 h-16 flex items-center justify-between gap-2">

        {/* ── Logo + Brand Name ── */}
        <Link
          to="/"
          className="flex items-center gap-2 cursor-pointer group flex-shrink-0 min-w-0"
        >
          <img
            src="https://static.readdy.ai/image/c3c070ed3a92273f043678549554b0d6/e3451f52961636b2aea237770c224254.png"
            alt="Chiu Gor French Logo"
            fetchPriority="high"
            decoding="async"
            className="h-9 w-auto object-contain flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col leading-none min-w-0">
            <span
              className="font-extrabold text-sm sm:text-base whitespace-nowrap flex items-center gap-1"
              style={{ fontFamily: "Candara, 'Nunito', sans-serif", letterSpacing: '-0.01em' }}
            >
              <span className="text-[#CC0000]">Chiu Gor</span>
              <img src="https://public.readdy.ai/ai/img_res/788dfe8e-2bd1-478f-ade8-175d13c52bb9.png" alt="" className="w-3 h-3" />
              <span className="text-teal">French</span>
            </span>
            <span
              className="hidden xs:block text-[9px] sm:text-[10px] font-semibold tracking-[0.16em] uppercase text-[#7A7068] dark:text-gray-500 mt-0.5 whitespace-nowrap"
              style={{ fontFamily: "Candara, 'Nunito', sans-serif" }}
            >
              Langue Française
            </span>
          </div>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <div className="hidden md:flex items-center gap-5 flex-1 justify-center">
          {isHomePage ? (
            navLinks.map((link) => (
              link.path ? (
                <Link
                  key={link.id}
                  to={link.path}
                  className={`text-sm font-bold tracking-wide transition-colors duration-200 cursor-pointer whitespace-nowrap relative group ${
                    scrolled
                      ? 'text-[#1A1410] dark:text-[#D4B8F0]'
                      : 'text-gray-800 dark:text-[#E8E0F5]'
                  }`}
                  style={{ fontFamily: fontNav }}
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-coral rounded-full transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ) : (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className={`text-sm font-bold tracking-wide transition-colors duration-200 cursor-pointer whitespace-nowrap relative group ${
                    scrolled
                      ? 'text-[#1A1410] dark:text-[#D4B8F0]'
                      : 'text-gray-800 dark:text-[#E8E0F5]'
                  }`}
                  style={{ fontFamily: fontNav }}
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-coral rounded-full transition-all duration-300 group-hover:w-full"></span>
                </button>
              )
            ))
          ) : (
            <Link
              to="/"
              className="text-sm font-medium tracking-wide transition-colors duration-200 cursor-pointer whitespace-nowrap relative group text-[#1A1410] dark:text-[#D4B8F0]"
              style={{ fontFamily: fontNav }}
            >
              {t('nav_about')}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-coral rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
          )}
        </div>

        {/* ── Right Controls ── */}
        <div className="flex items-center gap-1.5 flex-shrink-0">

          {/* Book Now Button */}
          <Link
            to="/booking"
            className="hidden sm:flex px-4 py-2 rounded-full bg-coral text-white text-sm font-semibold hover:bg-coral/90 transition-all duration-200 cursor-pointer items-center gap-1.5 shadow-sm hover:shadow-md whitespace-nowrap"
            style={{ fontFamily: fontNav }}
          >
            <i className="ri-calendar-check-line text-sm"></i>
            {t('booking_title')}
          </Link>

          {/* Visitor Login */}
          {user ? (
            <button
              onClick={handleLogout}
              className="hidden sm:flex px-4 py-2 rounded-full bg-white/80 dark:bg-[#2D1B4E]/60 backdrop-blur-sm border border-[#D4C8BC]/60 dark:border-[#5B2D8E]/40 text-[#4A4440] dark:text-[#D4B8F0] text-sm font-semibold hover:bg-white hover:dark:bg-[#3B2060]/70 transition-all duration-200 cursor-pointer items-center gap-2 whitespace-nowrap"
              style={{ fontFamily: fontNav }}
              title={user.email || ''}
            >
              <i className="ri-user-line text-sm"></i>
              {(user.email ? String(user.email).split('@')[0] : 'Account')}
              <i className="ri-logout-box-r-line text-sm text-coral"></i>
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden sm:flex px-4 py-2 rounded-full bg-white/80 dark:bg-[#2D1B4E]/60 backdrop-blur-sm border border-[#D4C8BC]/60 dark:border-[#5B2D8E]/40 text-[#4A4440] dark:text-[#D4B8F0] text-sm font-semibold hover:bg-white hover:dark:bg-[#3B2060]/70 transition-all duration-200 cursor-pointer items-center gap-2 whitespace-nowrap"
              style={{ fontFamily: fontNav }}
            >
              <i className="ri-login-box-line text-sm"></i>
              {t('nav_login')}
            </Link>
          )}

          {/* Language Switcher with pop animation */}
          <div className="flex items-center gap-0.5 bg-[#1A1410]/5 dark:bg-[#2D1B4E]/50 backdrop-blur-sm rounded-full px-1 py-1 border border-[#D4C8BC]/60 dark:border-[#5B2D8E]/40">
            {LANGUAGES.map((lang) => {
              const isActive = activeLang === lang.code || i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang.code)}
                  className={`relative px-2 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap overflow-hidden ${
                    isActive
                      ? 'bg-coral text-white shadow-sm'
                      : 'text-[#4A4440] dark:text-[#B89FD8] hover:text-[#1A1410] dark:hover:text-[#E8E0F5] hover:bg-[#1A1410]/8 dark:hover:bg-[#3B2060]/60'
                  }`}
                  style={{
                    fontFamily: fontNav,
                  }}
                >
                  {/* Active pill pop animation */}
                  {isActive && (
                    <span
                      key={langAnimKey[lang.code] ?? 0}
                      className="absolute inset-0 rounded-full bg-coral animate-pill-pop"
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <span
                    key={`label-${langAnimKey[lang.code] ?? 0}`}
                    className={isActive ? 'animate-pill-pop inline-block' : 'inline-block'}
                  >
                    {lang.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dark Mode Toggle with icon swap animation + ripple */}
          <button
            onClick={handleDarkToggle}
            className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[#1A1410]/5 dark:bg-[#2D1B4E]/50 backdrop-blur-sm border border-[#D4C8BC]/60 dark:border-[#5B2D8E]/40 text-[#4A4440] dark:text-[#D4B8F0] hover:bg-[#1A1410]/10 dark:hover:bg-[#3B2060]/70 transition-all duration-200 cursor-pointer overflow-hidden group hover:scale-110 active:scale-95"
            aria-label="Toggle dark mode"
          >
            {/* Ripple effects */}
            {darkRipple.ripples.map((r) => (
              <span
                key={r.id}
                className="absolute rounded-full bg-mustard/40 dark:bg-teal/30 animate-ripple pointer-events-none"
                style={{
                  width: 8,
                  height: 8,
                  left: r.x - 4,
                  top: r.y - 4,
                }}
              />
            ))}

            {/* Rotating background on hover */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-mustard/0 to-coral/0 group-hover:from-mustard/20 group-hover:to-coral/10 transition-all duration-300"></span>

            {/* Icon with swap animation */}
            <span key={darkAnimKey} className="relative z-10">
              {isDark ? (
                <i className="ri-sun-line text-sm text-yellow-400 animate-spin-in" />
              ) : (
                <i className="ri-moon-line text-sm animate-moon-in" />
              )}
            </span>
          </button>

          {/* Mobile Hamburger with animated bars */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[#1A1410]/5 dark:bg-[#2D1B4E]/50 backdrop-blur-sm border border-[#D4C8BC]/60 dark:border-[#5B2D8E]/40 text-[#4A4440] dark:text-[#D4B8F0] cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 overflow-hidden"
          >
            <span className={`transition-all duration-300 ${menuOpen ? 'rotate-90 opacity-0 scale-50 absolute' : 'rotate-0 opacity-100 scale-100'}`}>
              <i className="ri-menu-line text-sm"></i>
            </span>
            <span className={`transition-all duration-300 ${menuOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50 absolute'}`}>
              <i className="ri-close-line text-sm text-coral"></i>
            </span>
          </button>
        </div>
      </div>

      {/* ── Mobile Menu with slide animation ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        } bg-[#F7F4EF]/98 dark:bg-[#1A0A2E]/98 backdrop-blur-xl border-t border-[#D4C8BC]/60 dark:border-[#5B2D8E]/30`}
      >
        <div className="px-4 py-3 flex flex-col gap-1">
          {isHomePage ? (
            navLinks.map((link, i) => (
              link.path ? (
                <Link
                  key={link.id}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className="text-left text-sm font-medium text-[#1A1410] dark:text-[#D4B8F0] py-2.5 px-3 rounded-xl hover:bg-[#CC0000]/8 dark:hover:bg-[#3B2060]/50 hover:text-[#CC0000] dark:hover:text-[#E8C4FF] transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 group"
                  style={{
                    fontFamily: fontNav,
                    transitionDelay: menuOpen ? `${i * 0.05}s` : '0s',
                    transform: menuOpen ? 'translateX(0)' : 'translateX(-8px)',
                    opacity: menuOpen ? 1 : 0,
                    transition: `all 0.25s ease ${i * 0.05}s`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-coral/40 flex-shrink-0 group-hover:bg-coral transition-colors duration-200"></span>
                  {link.label}
                  <i className="ri-arrow-right-s-line ml-auto text-gray-300 dark:text-[#7C3AED]/60 group-hover:text-coral group-hover:translate-x-1 transition-all duration-200"></i>
                </Link>
              ) : (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="text-left text-sm font-medium text-[#1A1410] dark:text-[#D4B8F0] py-2.5 px-3 rounded-xl hover:bg-[#CC0000]/8 dark:hover:bg-[#3B2060]/50 hover:text-[#CC0000] dark:hover:text-[#E8C4FF] transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 group"
                  style={{
                    fontFamily: fontNav,
                    transitionDelay: menuOpen ? `${i * 0.05}s` : '0s',
                    transform: menuOpen ? 'translateX(0)' : 'translateX(-8px)',
                    opacity: menuOpen ? 1 : 0,
                    transition: `all 0.25s ease ${i * 0.05}s`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-coral/40 flex-shrink-0 group-hover:bg-coral transition-colors duration-200"></span>
                  {link.label}
                  <i className="ri-arrow-right-s-line ml-auto text-gray-300 dark:text-[#7C3AED]/60 group-hover:text-coral group-hover:translate-x-1 transition-all duration-200"></i>
                </button>
              )
            ))
          ) : (
            <Link
              to="/"
              className="text-left text-sm font-medium text-[#1A1410] dark:text-[#D4B8F0] py-2.5 px-3 rounded-xl hover:bg-[#CC0000]/8 dark:hover:bg-[#3B2060]/50 hover:text-[#CC0000] transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 group"
              style={{ fontFamily: fontNav }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-coral/40 flex-shrink-0 group-hover:bg-coral transition-colors duration-200"></span>
              {t('nav_about')}
              <i className="ri-arrow-right-s-line ml-auto text-gray-300 dark:text-gray-600 group-hover:text-coral group-hover:translate-x-1 transition-all duration-200"></i>
            </Link>
          )}
          <Link
            to="/booking"
            className="text-left text-sm font-medium text-white py-2.5 px-3 rounded-xl bg-coral hover:bg-coral/90 transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 mt-1"
            style={{ fontFamily: fontNav }}
            onClick={() => setMenuOpen(false)}
          >
            <i className="ri-calendar-check-line"></i>
            {t('booking_title')}
            <i className="ri-arrow-right-s-line ml-auto"></i>
          </Link>

          {user ? (
            <button
              onClick={async () => {
                await handleLogout();
                setMenuOpen(false);
              }}
              className="text-left text-sm font-medium text-[#1A1410] dark:text-[#D4B8F0] py-2.5 px-3 rounded-xl hover:bg-[#CC0000]/8 dark:hover:bg-[#3B2060]/50 hover:text-[#CC0000] dark:hover:text-[#E8C4FF] transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 group"
              style={{ fontFamily: fontNav }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-coral/40 flex-shrink-0 group-hover:bg-coral transition-colors duration-200"></span>
              {t('nav_logout')}
              <i className="ri-logout-box-r-line ml-auto text-coral"></i>
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="text-left text-sm font-medium text-[#1A1410] dark:text-[#D4B8F0] py-2.5 px-3 rounded-xl hover:bg-[#CC0000]/8 dark:hover:bg-[#3B2060]/50 hover:text-[#CC0000] dark:hover:text-[#E8C4FF] transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 group"
              style={{ fontFamily: fontNav }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-coral/40 flex-shrink-0 group-hover:bg-coral transition-colors duration-200"></span>
              {t('nav_login')}
              <i className="ri-arrow-right-s-line ml-auto text-gray-300 dark:text-[#7C3AED]/60 group-hover:text-coral group-hover:translate-x-1 transition-all duration-200"></i>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
