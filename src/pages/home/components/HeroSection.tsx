import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/design-system/atoms/Button';
import { tokens } from '@/design-system/tokens';

const LEAF_URL = 'https://public.readdy.ai/ai/img_res/788dfe8e-2bd1-478f-ade8-175d13c52bb9.png';

// Autumn colour filters — sepia base removes green, then hue-rotate for variety
const AUTUMN_FILTERS = [
  'sepia(0.3) saturate(1.2) brightness(1.05)',
  'sepia(0.3) hue-rotate(10deg) saturate(1.3) brightness(1.1)',
  'sepia(0.3) hue-rotate(20deg) saturate(1.4) brightness(1.15)',
  'sepia(0.3) hue-rotate(30deg) saturate(1.5) brightness(1.2)',
  'sepia(0.3) hue-rotate(15deg) saturate(1.35) brightness(1.05)',
  'sepia(0.3) hue-rotate(25deg) saturate(1.45) brightness(1.15)',
  'sepia(0.3) hue-rotate(35deg) saturate(1.5) brightness(1.1)',
];

export default function HeroSection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [isGust, setIsGust] = useState(false);
  const [watermarkGust, setWatermarkGust] = useState(false);

  const fontFamily = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Gentle gust — just sways the watermark leaves, doesn't affect falling leaves
  const triggerGust = useCallback(() => {
    setIsGust(true);
    setWatermarkGust(true);
    setTimeout(() => {
      setIsGust(false);
      setWatermarkGust(false);
    }, 2500);
  }, []);

  useEffect(() => {
    const scheduleNext = () => {
      const delay = 10000 + Math.random() * 8000;
      return setTimeout(() => {
        triggerGust();
        timerRef = scheduleNext();
      }, delay);
    };

    let timerRef = setTimeout(() => {
      triggerGust();
      timerRef = scheduleNext();
    }, 6000);

    return () => clearTimeout(timerRef);
  }, [triggerGust]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

      {/* ── Warm autumn gradient background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F5EFE8] via-[#F7F4EF] to-[#F0EBE3] dark:from-[#0E0818] dark:via-[#130A22] dark:to-[#0E0818]" />

      {/* ── Warm amber/orange glow blobs ── */}
      <div className="absolute top-0 left-0 w-[560px] h-[560px] rounded-full bg-[#FF6B00]/15 dark:hidden blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '7s' }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#FF0000]/12 dark:hidden blur-3xl translate-x-1/3 translate-y-1/3 animate-pulse" style={{ animationDuration: '9s', animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full bg-[#FFB347]/10 dark:hidden blur-3xl animate-pulse" style={{ animationDuration: '11s', animationDelay: '1s' }} />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#FF4500]/8 dark:hidden blur-3xl animate-pulse" style={{ animationDuration: '13s', animationDelay: '3s' }} />

      {/* ── Aurora borealis band ── */}

      {/* ── Giant animated maple leaf watermarks ── */}
      <img
        src={LEAF_URL}
        alt=""
        loading="lazy"
        decoding="async"
        className={`absolute right-[-100px] top-1/2 -translate-y-1/2 w-[420px] h-[420px] object-contain pointer-events-none select-none ${watermarkGust ? 'animate-leaf-sway-gust' : 'animate-leaf-sway'}`}
        style={{
          opacity: 0.08,
          filter: 'sepia(0.3) hue-rotate(10deg) saturate(1.4) brightness(1.1)',
          animationDuration: watermarkGust ? undefined : '8s',
        }}
      />
      <img
        src={LEAF_URL}
        alt=""
        className={`absolute left-[-80px] bottom-8 w-[280px] h-[280px] object-contain pointer-events-none select-none ${watermarkGust ? 'animate-leaf-sway-gust' : 'animate-leaf-sway'}`}
        style={{
          opacity: 0.06,
          filter: 'sepia(0.3) hue-rotate(25deg) saturate(1.5) brightness(1.15)',
          animationDuration: watermarkGust ? undefined : '10s',
          animationDelay: watermarkGust ? '0.15s' : '2s',
        }}
      />
      <img
        src={LEAF_URL}
        alt=""
        className={`absolute left-[8%] top-[-60px] w-[180px] h-[180px] object-contain pointer-events-none select-none ${watermarkGust ? 'animate-leaf-sway-gust' : 'animate-leaf-sway'}`}
        style={{
          opacity: 0.10,
          filter: 'sepia(0.3) hue-rotate(35deg) saturate(1.5) brightness(1.2)',
          animationDuration: watermarkGust ? undefined : '12s',
          animationDelay: watermarkGust ? '0.08s' : '1s',
        }}
      />



      {/* ── Floating mini leaf shapes ── */}
      {[
        { top: '6rem', left: '4rem', size: 28, delay: '0s', filter: AUTUMN_FILTERS[1], rot: 15 },
        { top: '10rem', right: '6rem', size: 22, delay: '1.5s', filter: AUTUMN_FILTERS[3], rot: -20 },
        { bottom: '8rem', left: '6rem', size: 18, delay: '0.8s', filter: AUTUMN_FILTERS[5], rot: 45 },
        { bottom: '12rem', right: '4rem', size: 24, delay: '2s', filter: AUTUMN_FILTERS[2], rot: -35 },
        { top: '33%', left: '22%', size: 16, delay: '1s', filter: AUTUMN_FILTERS[4], rot: 60 },
        { bottom: '30%', right: '28%', size: 20, delay: '3s', filter: AUTUMN_FILTERS[0], rot: -50 },
      ].map((orb, i) => (
        <div
          key={`orb-${i}`}
          className="absolute pointer-events-none select-none animate-float"
          style={{
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
            animationDelay: orb.delay,
            opacity: 0.35,
            transform: `rotate(${orb.rot}deg)`,
          }}
        >
          <img
            src={LEAF_URL}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ width: `${orb.size}px`, height: `${orb.size}px`, filter: orb.filter }}
          />
        </div>
      ))}

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-4xl mx-auto">

        {/* Location badges */}
        <div
          className={`flex flex-wrap items-center justify-center gap-2 mb-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'}`}
          style={{ transitionDelay: '0.15s', transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          {[
            { flag: '🇨🇦', label: 'Canada' },
            { flag: '🇭🇰', label: 'Hong Kong' },
            { flag: '🎁', label: i18n.language === 'zh-HK' ? '首堂試聽優惠' : i18n.language === 'fr' ? 'Offre d\'essai' : 'Introductory Trial', color: 'border-coral/40 text-coral' },
          ].map((item, i) => (
            <div key={item.label} className="flex items-center gap-2">
              {i > 0 && <div className="w-1.5 h-1.5 rounded-full bg-[#FF4500]/40 dark:bg-[#FF4500]/50" />}
              <div className={`flex items-center gap-1.5 bg-white/60 dark:bg-[#1E1530]/80 backdrop-blur-sm rounded-full px-3 py-1.5 border ${item.color || 'border-[#D4C8BC]/60 dark:border-[#32254E]'} hover:scale-105 transition-all duration-200 cursor-default animate-pill-pop`} style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="text-base leading-none">{item.flag}</span>
                <span className={`text-xs font-bold ${item.color ? '' : 'text-[#4A4440] dark:text-[#C4B5FD]'}`} style={{ fontFamily }}>{item.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Logo */}
        <div
          className={`mb-8 relative transition-all duration-1000 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50 rotate-6'}`}
          style={{ transitionDelay: '0.3s', transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          <h1 className="sr-only">Chiu Gor French - 專業法語教師 | Professional French Teacher in Hong Kong</h1>
          <img
            src="https://static.readdy.ai/image/c3c070ed3a92273f043678549554b0d6/e3451f52961636b2aea237770c224254.png"
            alt="Chiu Gor French"
            fetchPriority="high"
            decoding="async"
            className="relative h-40 sm:h-52 md:h-72 w-auto object-contain mx-auto animate-float"
            style={{ animationDuration: '6s' }}
          />
        </div>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center gap-5 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
          style={{ transitionDelay: '0.6s', transitionTimingFunction: tokens.animations.spring }}
        >
          <Button
            variant="primary"
            onClick={() => navigate('/booking')}
            className="group relative px-10 min-w-[220px] canada-glow"
          >
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20">
              <i className="ri-calendar-check-line text-sm" />
            </span>
            <span>{t('hero_cta_booking')}</span>
            <i className="ri-arrow-right-line text-sm group-hover:translate-x-1 transition-transform duration-200" />
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              const el = document.getElementById('courses');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="group px-10 min-w-[220px]"
          >
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20">
              <i className="ri-book-open-line text-sm" />
            </span>
            <span>{t('hero_cta_courses')}</span>
            <i className="ri-arrow-down-line text-sm group-hover:translate-y-1 transition-transform duration-200" />
          </Button>
        </div>

      </div>

    </section>
  );
}
