import { useEffect, useState } from 'react';

const LOGO_URL = 'https://static.readdy.ai/image/c3c070ed3a92273f043678549554b0d6/e3451f52961636b2aea237770c224254.png';
const LEAF_URL = 'https://public.readdy.ai/ai/img_res/788dfe8e-2bd1-478f-ade8-175d13c52bb9.png';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [leafVisible, setLeafVisible] = useState(false);

  useEffect(() => {
    // Logo fades in first
    const logoTimer = setTimeout(() => setLogoVisible(true), 200);
    // Leaves appear shortly after
    const leafTimer = setTimeout(() => setLeafVisible(true), 600);
    return () => {
      clearTimeout(logoTimer);
      clearTimeout(leafTimer);
    };
  }, []);

  useEffect(() => {
    // Simulate loading progress
    const totalDuration = 2800;
    const steps = 80;
    const interval = totalDuration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      // Ease-out curve: fast at start, slows near 100
      const eased = Math.round(100 * (1 - Math.pow(1 - current / steps, 2.2)));
      setProgress(Math.min(eased, 100));

      if (current >= steps) {
        clearInterval(timer);
        // Brief pause at 100% then exit
        setTimeout(() => {
          setLeaving(true);
          setTimeout(onComplete, 700);
        }, 400);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Split percentage digits for individual animation
  const digits = String(progress).padStart(3, ' ').split('');

  return (
    <div
      className={`loading-screen fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden ${leaving ? 'loading-screen-leave' : ''}`}
      style={{ background: '#FFF8F0' }}
    >


      {/* Floating autumn leaves — background decoration */}
      <img
        src={LEAF_URL}
        alt=""
        className={`absolute right-[8%] top-[15%] w-24 h-24 object-contain pointer-events-none select-none transition-all duration-1000 ${leafVisible ? 'opacity-[0.12]' : 'opacity-0'}`}
        style={{
          filter: 'sepia(0.3) hue-rotate(10deg) saturate(1.4)',
          animation: leafVisible ? 'loading-leaf-sway 5s ease-in-out infinite' : 'none',
          animationDelay: '0.2s',
        }}
      />
      <img
        src={LEAF_URL}
        alt=""
        className={`absolute left-[6%] bottom-[35%] w-16 h-16 object-contain pointer-events-none select-none transition-all duration-1000 ${leafVisible ? 'opacity-[0.10]' : 'opacity-0'}`}
        style={{
          filter: 'sepia(0.3) hue-rotate(25deg) saturate(1.5)',
          animation: leafVisible ? 'loading-leaf-sway 7s ease-in-out infinite' : 'none',
          animationDelay: '1s',
        }}
      />
      <img
        src={LEAF_URL}
        alt=""
        className={`absolute left-[15%] top-[10%] w-10 h-10 object-contain pointer-events-none select-none transition-all duration-1000 ${leafVisible ? 'opacity-[0.08]' : 'opacity-0'}`}
        style={{
          filter: 'sepia(0.3) hue-rotate(35deg) saturate(1.5)',
          animation: leafVisible ? 'loading-leaf-sway 6s ease-in-out infinite' : 'none',
          animationDelay: '0.5s',
        }}
      />
      <img
        src={LEAF_URL}
        alt=""
        className={`absolute right-[18%] bottom-[32%] w-12 h-12 object-contain pointer-events-none select-none transition-all duration-1000 ${leafVisible ? 'opacity-[0.09]' : 'opacity-0'}`}
        style={{
          filter: 'sepia(0.3) hue-rotate(15deg) saturate(1.3)',
          animation: leafVisible ? 'loading-leaf-sway 8s ease-in-out infinite' : 'none',
          animationDelay: '1.5s',
        }}
      />

      {/* Main content area */}
      <div className="relative flex flex-col items-center">

        {/* Percentage counter — above logo like joguman */}
        <div
          className="mb-6 flex items-baseline gap-0.5"
          style={{ fontFamily: "Candara, 'Nunito', sans-serif" }}
        >
          {digits.map((d, i) => (
            <span
              key={`${i}-${d}`}
              className="loading-digit text-[#3A2A1A] font-bold"
              style={{
                fontSize: d === ' ' ? '0' : '1.5rem',
                width: d === ' ' ? '0' : 'auto',
                opacity: d === ' ' ? 0 : 1,
                display: 'inline-block',
                minWidth: d === ' ' ? '0' : '0.9rem',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              {d === ' ' ? '' : d}
            </span>
          ))}
          <span
            className="text-[#3A2A1A] font-bold ml-0.5"
            style={{ fontSize: '1.1rem', fontFamily: "Candara, 'Nunito', sans-serif" }}
          >
            %
          </span>
        </div>

        {/* Logo — the star of the show */}
        <div
          className={`relative transition-all duration-700 ${logoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          {/* Soft warm glow behind logo */}
          <div
            className="absolute inset-0 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%)',
              transform: 'scale(1.4)',
            }}
          />
          <img
            src={LOGO_URL}
            alt="Chiu Gor French"
            className="relative w-52 h-52 md:w-64 md:h-64 object-contain"
            style={{
              animation: logoVisible ? 'loading-logo-float 4s ease-in-out infinite' : 'none',
            }}
          />
        </div>

        {/* Animated Loading Bar */}
        <div className="mt-8 w-56 h-2 rounded-full bg-[#E8D5C0] overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-200 ease-out bg-coral relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
          </div>
        </div>



        {/* Brand name */}
        <p
          className={`mt-4 text-[#8A6A4A] text-xs tracking-[0.25em] uppercase font-semibold transition-all duration-700 ${logoVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ fontFamily: "Candara, 'Nunito', sans-serif", transitionDelay: '0.4s' }}
        >
          Chiu Gor French
        </p>
      </div>
    </div>
  );
}
