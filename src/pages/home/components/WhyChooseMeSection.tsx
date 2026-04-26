import { useTranslation } from 'react-i18next';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function WhyChooseMeSection() {
  const { t, i18n } = useTranslation();
  const { ref, visible } = useScrollReveal(0.1);

  const fontFamily = i18n.language === 'zh-HK'
    ? "'Chiron GoRound TC', Candara, 'Nunito', sans-serif"
    : "Candara, 'Nunito', sans-serif";

  const reasons = [
    { key: 'why1', icon: 'ri-medal-line', color: 'bg-coral' },
    { key: 'why2', icon: 'ri-briefcase-line', color: 'bg-teal' },
    { key: 'why3', icon: 'ri-group-line', color: 'bg-mustard' },
    { key: 'why4', icon: 'ri-magic-line', color: 'bg-[#7C3AED]' },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#FDFBF9] dark:bg-[#0E0818] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div ref={ref} className={`text-center mb-16 reveal ${visible ? 'visible' : ''}`}>
          <p className="text-teal font-bold text-sm uppercase tracking-widest mb-3" style={{ fontFamily }}>
            {t('why_label')}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-[#1A1410] dark:text-[#E8E0F5]" style={{ fontFamily }}>
            {t('why_title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-center p-8 rounded-3xl bg-white dark:bg-[#1E0D38] border border-[#D4C8BC]/30 dark:border-[#3B2060]/30 shadow-sm hover:shadow-lg transition-all duration-300 card-hover reveal-scale ${visible ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className={`w-16 h-16 flex items-center justify-center rounded-2xl ${reason.color} text-white mb-6 shadow-lg rotate-3 group-hover:rotate-6 transition-transform`}>
                <i className={`${reason.icon} text-3xl`}></i>
              </div>
              <h3 className="text-xl font-bold text-[#1A1410] dark:text-[#E8E0F5] mb-4" style={{ fontFamily }}>
                {t(`${reason.key}_title`)}
              </h3>
              <p className="text-[#7A7068] dark:text-[#C4A8E8] text-base leading-relaxed font-medium" style={{ fontFamily }}>
                {t(`${reason.key}_desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
