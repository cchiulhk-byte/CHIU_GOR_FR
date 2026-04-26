import { useTranslation } from 'react-i18next';

const LEAF_URL = 'https://public.readdy.ai/ai/img_res/788dfe8e-2bd1-478f-ade8-175d13c52bb9.png';
const FOOTER_IMAGE = '/footer-img.jpg';

const NAV_COLORS = [
  { bg: 'bg-[#CC0000]/70', border: 'border-[#CC0000]/80', text: 'text-white', hover: 'hover:bg-[#CC0000]/90' },
  { bg: 'bg-amber-600/70', border: 'border-amber-600/80', text: 'text-white', hover: 'hover:bg-amber-600/90' },
  { bg: 'bg-teal-600/70', border: 'border-teal-600/80', text: 'text-white', hover: 'hover:bg-teal-600/90' },
  { bg: 'bg-violet-600/70', border: 'border-violet-600/80', text: 'text-white', hover: 'hover:bg-violet-600/90' },
];

const SOCIAL_COLORS = [
  { bg: 'bg-[#25D366]/70', border: 'border-[#25D366]/80', text: 'text-white', hover: 'hover:bg-[#25D366]/90 hover:border-[#25D366]' },
  { bg: 'bg-[#E1306C]/70', border: 'border-[#E1306C]/80', text: 'text-white', hover: 'hover:bg-[#E1306C]/90 hover:border-[#E1306C]' },
  { bg: 'bg-slate-600/70', border: 'border-slate-600/80', text: 'text-white', hover: 'hover:bg-slate-600/90 hover:border-slate-600' },
];

export default function Footer() {
  const { t, i18n } = useTranslation();

  const fontFamily = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'about', label: t('nav_about') },
    { id: 'experience', label: t('nav_experience') },
    { id: 'courses', label: t('nav_courses') },
    { id: 'contact', label: t('nav_contact') },
  ];

  const socials = [
    { label: 'WhatsApp', icon: 'ri-whatsapp-line', href: 'https://wa.me/' },
    { label: 'Instagram', icon: 'ri-instagram-line', href: 'https://instagram.com/' },
    { label: 'Threads', icon: 'ri-at-line', href: 'https://threads.net/' },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Background image */}
      <img
        src={FOOTER_IMAGE}
        alt="Footer background"
        className="absolute inset-0 z-0 w-full h-full object-cover object-center opacity-80 dark:opacity-45"
      />



      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-10 pb-8 flex flex-col gap-6">

        {/* Main row: logo+badges left, social right */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">

          {/* Left: logo + flags + nav badges */}
          <div className="flex flex-col items-start gap-4">
            <img
              src="https://static.readdy.ai/image/c3c070ed3a92273f043678549554b0d6/e3451f52961636b2aea237770c224254.png"
              alt="Chiu Gor French"
              className="h-16 w-auto object-contain"
              style={{ imageRendering: 'crisp-edges' }}
            />

            {/* Canada × HK flags */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1" title="Canada">
                <div className="flex items-center rounded overflow-hidden border border-[#1A1410]/20 dark:border-white/10">
                  <div className="w-4 h-6 bg-[#FF0000]" />
                  <div className="w-6 h-6 bg-white flex items-center justify-center">
                    <img src={LEAF_URL} alt="" className="w-3 h-3" style={{ filter: 'sepia(0.3) saturate(1.2)' }} />
                  </div>
                  <div className="w-4 h-6 bg-[#FF0000]" />
                </div>
                <span className="text-[9px] text-[#4A4440] dark:text-[#B89FD8] tracking-wide font-bold" style={{ fontFamily }}>Canada</span>
              </div>
              <span className="text-[#4A4440] dark:text-gray-500 text-sm">×</span>
              <div className="flex flex-col items-center gap-1" title="Hong Kong">
                <div className="w-12 h-6 rounded overflow-hidden border border-[#1A1410]/20 dark:border-white/10 bg-[#DE2910] flex items-center justify-center">
                  <span className="text-white text-xs">🌸</span>
                </div>
                <span className="text-[9px] text-[#4A4440] dark:text-[#B89FD8] tracking-wide font-bold" style={{ fontFamily }}>Hong Kong</span>
              </div>
            </div>

            {/* Nav badges */}
            <div className="flex flex-wrap items-center gap-2">
              {navLinks.map((link, i) => {
                const c = NAV_COLORS[i % NAV_COLORS.length];
                return (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className={`${c.bg} ${c.border} ${c.text} ${c.hover} backdrop-blur-sm border rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap hover:scale-105`}
                    style={{ fontFamily }}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: social badges */}
          <div className="flex flex-col items-end gap-2">
            {socials.map((s, i) => {
              const c = SOCIAL_COLORS[i % SOCIAL_COLORS.length];
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className={`flex items-center gap-1.5 ${c.bg} ${c.border} ${c.text} ${c.hover} backdrop-blur-sm border rounded-full px-3 py-1.5 text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap hover:scale-105`}
                  style={{ fontFamily }}
                >
                  <i className={`${s.icon} text-sm`} />
                  {s.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Copyright row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span
            className="bg-white/90 dark:bg-[#1E1530]/95 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#D4C8BC]/80 dark:border-[#32254E] text-[#4A4440] dark:text-[#B89FD8] text-xs font-semibold"
            style={{ fontFamily }}
          >
            {t('footer_copyright')}
          </span>
          <span
            className="flex items-center gap-1.5 bg-white/90 dark:bg-[#1E1530]/95 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#D4C8BC]/80 dark:border-[#32254E] text-[#4A4440] dark:text-[#B89FD8] text-xs font-semibold"
            style={{ fontFamily }}
          >
            Made with
            <img src={LEAF_URL} alt="" className="w-3 h-3" style={{ filter: 'sepia(0.3) saturate(1.2)' }} />
            in Québec &amp; Hong Kong
          </span>
        </div>
      </div>


    </footer>
  );
}
