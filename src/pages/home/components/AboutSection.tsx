import { useTranslation } from 'react-i18next';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function AboutSection() {
  const { t, i18n } = useTranslation();
  const { ref: sectionRef, visible } = useScrollReveal(0.1);
  const { ref: imgRef, visible: imgVisible } = useScrollReveal(0.1);
  const { ref: textRef, visible: textVisible } = useScrollReveal(0.1);

  const fontFamily = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";

  const tags = [
    { key: 'about_tag1', color: 'bg-coral text-white' },
    { key: 'about_tag2', color: 'bg-teal text-white' },
    { key: 'about_tag3', color: 'bg-mustard text-gray-800' },
    { key: 'about_tag4', color: 'bg-coral text-white' },
    { key: 'about_tag5', color: 'bg-teal text-white' },
    { key: 'about_tag6', color: 'bg-[#FF0000] text-white' },
  ];

  return (
    <section id="about" className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-[#F5EFE8] via-[#F7F4EF] to-[#EFF5F4] dark:from-[#0E0818] dark:via-[#130A22] dark:to-[#0E0818]">

      {/* Colorful background blobs */}
      <div className="absolute top-10 left-0 w-72 h-72 rounded-full bg-coral/10 dark:hidden blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-10 right-0 w-80 h-80 rounded-full bg-teal/10 dark:hidden blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-mustard/10 dark:hidden blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '12s', animationDelay: '1s' }}></div>
      {/* Canadian red blob */}
      <div className="absolute bottom-20 left-1/4 w-48 h-48 rounded-full bg-[#FF0000]/5 dark:hidden blur-3xl pointer-events-none"></div>

      {/* Decorative dots */}
      <div className="absolute top-16 right-16 w-4 h-4 rounded-full bg-coral/40 dark:bg-coral/20 animate-pulse"></div>
      <div className="absolute top-32 right-32 w-2 h-2 rounded-full bg-mustard/60 dark:bg-mustard/30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-24 left-20 w-3 h-3 rounded-full bg-teal/40 dark:bg-teal/20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-40 left-40 w-2 h-2 rounded-full bg-[#FF0000]/30 dark:bg-[#FF0000]/15 animate-pulse" style={{ animationDelay: '1.5s' }}></div>

      <div ref={sectionRef} className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        {/* Section label */}
        <div className={`flex items-center justify-center gap-3 mb-10 reveal ${visible ? 'visible' : ''}`}>
          <div className="h-px w-12 bg-teal/40"></div>
          <p className="text-teal font-bold text-sm uppercase tracking-widest" style={{ fontFamily }}>
            {t('about_label')}
          </p>
          <div className="h-px w-12 bg-teal/40"></div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left: Illustration */}
          <div ref={imgRef} className={`flex-shrink-0 flex flex-col items-center gap-4 w-full lg:w-auto reveal-left ${imgVisible ? 'visible' : ''}`}>
            <div className="relative">
              {/* Colorful ring decoration */}
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-coral via-mustard to-teal opacity-30 dark:hidden blur-sm animate-pulse" style={{ animationDuration: '4s' }}></div>
              <div className="relative w-64 h-72 md:w-72 md:h-80 rounded-3xl overflow-hidden">
                <img
                  src="https://public.readdy.ai/ai/img_res/edited_8bd897bd9f57973f94f82848985bef64_4cb35732.jpg"
                  alt="超哥"
                  className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                />
              </div>

            </div>



            {/* Stats row */}
            <div className="flex gap-3 mt-10">
              {[
                { value: '5+', label: i18n.language === 'zh-HK' ? '年教學' : i18n.language === 'fr' ? 'ans exp.' : 'yrs exp.', color: 'text-coral' },
                { value: '120+', label: i18n.language === 'zh-HK' ? '位學生' : i18n.language === 'fr' ? 'étudiants' : 'students', color: 'text-teal' },
                { value: '6', label: i18n.language === 'zh-HK' ? '種課程' : i18n.language === 'fr' ? 'cours' : 'courses', color: 'text-mustard' },
              ].map((stat, i) => (
                <div
                  key={stat.value}
                  className={`text-center bg-[#F7F4EF] dark:bg-[#1E0D38] rounded-2xl px-4 py-3 border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 card-hover reveal-scale ${imgVisible ? 'visible' : ''}`}
                  style={{ transitionDelay: `${0.2 + i * 0.1}s` }}
                >
                  <p className={`text-2xl font-bold ${stat.color}`} style={{ fontFamily }}>{stat.value}</p>
                  <p className="text-xs text-[#7A7068] dark:text-[#B89FD8] mt-0.5" style={{ fontFamily }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Text */}
          <div ref={textRef} className={`flex-1 reveal-right ${textVisible ? 'visible' : ''}`}>
            <h2
              className="text-3xl md:text-4xl font-bold text-[#1A1410] dark:text-[#E8E0F5] mb-6 leading-tight"
              style={{ fontFamily }}
            >
              {t('about_title')}
            </h2>

            {/* Canada experience highlight */}
            <div className="flex items-start gap-3 bg-gradient-to-r from-[#FF0000]/8 to-[#FF0000]/3 dark:from-[#FF0000]/10 dark:to-transparent border border-[#FF0000]/15 rounded-2xl p-4 mb-5">
              <img src="https://public.readdy.ai/ai/img_res/788dfe8e-2bd1-478f-ade8-175d13c52bb9.png" alt="" className="w-6 h-6 flex-shrink-0 animate-wiggle mt-0.5" />
              <p className="text-gray-600 dark:text-[#A8B8D0] text-base font-medium leading-relaxed" style={{ fontFamily }}>
                {t('about_p1')}
              </p>
            </div>

            <p
              className="text-[#4A4440] dark:text-[#C4A8E8] text-base font-semibold leading-relaxed mb-8"
              style={{ fontFamily }}
            >
              {t('about_p2')}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span
                  key={tag.key}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold ${tag.color} reveal-scale ${textVisible ? 'visible' : ''} transition-transform duration-200 hover:scale-105 cursor-default`}
                  style={{ fontFamily, transitionDelay: `${0.1 + i * 0.07}s` }}
                >
                  {t(tag.key)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}