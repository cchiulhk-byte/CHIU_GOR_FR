import { useTranslation } from 'react-i18next';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function TestimonialsSection() {
  const { t, i18n } = useTranslation();
  const { ref: headerRef, visible: headerVisible } = useScrollReveal(0.1);
  const { ref: gridRef, visible: gridVisible } = useScrollReveal(0.1);

  const fontFamily = i18n.language === 'zh-HK'
    ? "'Chiron GoRound TC', Candara, 'Nunito', sans-serif"
    : "Candara, 'Nunito', sans-serif";

  const testimonials = [
    { nameKey: 'test1_name', levelKey: 'test1_level', textKey: 'test1_text', icon: 'ri-chat-quote-line', color: 'text-coral' },
    { nameKey: 'test2_name', levelKey: 'test2_level', textKey: 'test2_text', icon: 'ri-chat-smile-3-line', color: 'text-teal' },
    { nameKey: 'test3_name', levelKey: 'test3_level', textKey: 'test3_text', icon: 'ri-chat-heart-line', color: 'text-mustard' },
    { nameKey: 'test4_name', levelKey: 'test4_level', textKey: 'test4_text', icon: 'ri-chat-check-line', color: 'text-[#7C3AED]' },
  ];

  return (
    <section id="testimonials" className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-[#F5EFE8] to-[#EFF5F4] dark:from-[#0E0818] dark:to-[#130A22]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        <div ref={headerRef} className={`text-center mb-16 reveal ${headerVisible ? 'visible' : ''}`}>
          <p className="text-coral font-bold text-sm uppercase tracking-widest mb-3" style={{ fontFamily }}>
            {t('testimonials_label')}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-[#1A1410] dark:text-[#E8E0F5]" style={{ fontFamily }}>
            {t('testimonials_title')}
          </h2>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((test, i) => (
            <div
              key={i}
              className={`bg-white dark:bg-[#1E0D38] p-8 rounded-3xl border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 shadow-sm hover:shadow-md transition-all duration-300 reveal-scale ${gridVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-[#2D1B4E] ${test.color}`}>
                  <i className={`${test.icon} text-2xl`}></i>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-[#1A1410] dark:text-[#E8E0F5]" style={{ fontFamily }}>
                    {t(test.nameKey)}
                  </h4>
                  <p className="text-sm font-semibold text-teal opacity-80" style={{ fontFamily }}>
                    {t(test.levelKey)}
                  </p>
                </div>
              </div>
              <p className="text-[#4A4440] dark:text-[#C4A8E8] text-lg leading-relaxed italic font-medium" style={{ fontFamily }}>
                "{t(test.textKey)}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
