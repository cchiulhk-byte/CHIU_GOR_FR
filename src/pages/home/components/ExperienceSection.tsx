import { useTranslation } from 'react-i18next';
import { useScrollReveal } from '@/hooks/useScrollReveal';

function ExperienceCard({ exp, index }: { exp: ExperienceItem; index: number }) {
  const { t, i18n } = useTranslation();
  const { ref, visible } = useScrollReveal(0.1);
  const fontFamily = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";

  return (
    <div
      ref={ref}
      className={`relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 ${
        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
      } ${index % 2 === 0 ? 'reveal-left' : 'reveal-right'} ${visible ? 'visible' : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className="flex-1 ml-12 md:ml-0">
        <div className={`bg-[#F7F4EF] dark:bg-[#1E0D38] rounded-2xl p-6 card-hover border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 ${exp.cardAccent} group`}>
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${exp.iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
              <i className={`${exp.icon} text-lg`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-block bg-mustard text-gray-800 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap" style={{ fontFamily }}>
                  {t(exp.yearKey)}
                </span>
                {exp.flag && <span className="text-base">{exp.flag}</span>}
              </div>
              <h3 className="text-base font-bold text-[#1A1410] dark:text-[#E8E0F5] mb-1" style={{ fontFamily }}>{t(exp.titleKey)}</h3>
              <p className="text-teal font-semibold text-sm mb-2" style={{ fontFamily }}>{t(exp.orgKey)}</p>
              <p className="text-[#7A7068] dark:text-[#C4A8E8] text-base font-medium leading-relaxed" style={{ fontFamily }}>{t(exp.descKey)}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10">
        <div className={`w-5 h-5 rounded-full border-4 border-[#F7F4EF] dark:border-[#0E0818] ${exp.dotColor} shadow-md transition-transform duration-300 hover:scale-150`}></div>
      </div>
      <div className={`md:hidden absolute left-3 top-6 w-5 h-5 rounded-full border-4 border-[#F7F4EF] dark:border-[#0E0818] z-10 ${exp.dotColor}`}></div>
      <div className="hidden md:block flex-1"></div>
    </div>
  );
}

interface ExperienceItem {
  yearKey: string;
  titleKey: string;
  orgKey: string;
  descKey: string;
  dotColor: string;
  cardAccent: string;
  iconBg: string;
  icon: string;
  flag?: string;
}

const EXPERIENCES: ExperienceItem[] = [
  {
    yearKey: 'exp1_year',
    titleKey: 'exp1_title',
    orgKey: 'exp1_org',
    descKey: 'exp1_desc',
    dotColor: 'bg-mustard',
    cardAccent: 'border-l-4 border-mustard',
    iconBg: 'bg-mustard/20 text-yellow-600',
    icon: 'ri-heart-line',
    flag: '🇭🇰',
  },
  {
    yearKey: 'exp2_year',
    titleKey: 'exp2_title',
    orgKey: 'exp2_org',
    descKey: 'exp2_desc',
    dotColor: 'bg-[#FF0000]',
    cardAccent: 'border-l-4 border-[#FF0000]',
    iconBg: 'bg-[#FF0000]/10 text-[#FF0000]',
    icon: 'ri-graduation-cap-line',
    flag: '🇨🇦',
  },
  {
    yearKey: 'exp3_year',
    titleKey: 'exp3_title',
    orgKey: 'exp3_org',
    descKey: 'exp3_desc',
    dotColor: 'bg-teal',
    cardAccent: 'border-l-4 border-teal',
    iconBg: 'bg-teal/10 text-teal',
    icon: 'ri-book-open-line',
    flag: '🇨🇦',
  },
  {
    yearKey: 'exp4_year',
    titleKey: 'exp4_title',
    orgKey: 'exp4_org',
    descKey: 'exp4_desc',
    dotColor: 'bg-coral',
    cardAccent: 'border-l-4 border-coral',
    iconBg: 'bg-coral/10 text-coral',
    icon: 'ri-edit-line',
    flag: '🇭🇰',
  },
  {
    yearKey: 'exp5_year',
    titleKey: 'exp5_title',
    orgKey: 'exp5_org',
    descKey: 'exp5_desc',
    dotColor: 'bg-[#7C3AED]',
    cardAccent: 'border-l-4 border-[#7C3AED]',
    iconBg: 'bg-[#7C3AED]/10 text-[#7C3AED]',
    icon: 'ri-user-star-line',
    flag: '🇭🇰',
  },
];

export default function ExperienceSection() {
  const { t, i18n } = useTranslation();
  const { ref: headerRef, visible: headerVisible } = useScrollReveal(0.1);

  const fontFamily = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";

  return (
    <section id="experience" className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-[#EFF5F4] via-[#EDE6DC] to-[#F5EFE8] dark:from-[#130A22] dark:via-[#0E0818] dark:to-[#130A22]">

      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-teal/10 dark:hidden blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '9s' }}></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-coral/10 dark:hidden blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '11s', animationDelay: '2s' }}></div>
      {/* Canadian red blob */}
      <div className="absolute top-1/2 right-1/4 w-56 h-56 rounded-full bg-[#FF0000]/6 dark:hidden blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }}></div>

      {/* Wave top */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none pointer-events-none">
        <svg viewBox="0 0 1440 60" className="w-full h-12 fill-[#F7F4EF] dark:fill-[#0E0818]">
          <path d="M0,0 C360,60 1080,0 1440,60 L1440,0 L0,0 Z" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div ref={headerRef} className={`text-center mb-16 reveal ${headerVisible ? 'visible' : ''}`}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12 bg-coral/40"></div>
            <p className="text-coral font-bold text-sm uppercase tracking-widest" style={{ fontFamily }}>
              {t('exp_label')}
            </p>
            <div className="h-px w-12 bg-coral/40"></div>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold text-[#1A1410] dark:text-[#E8E0F5]"
            style={{ fontFamily }}
          >
            {t('exp_title')}
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line - desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-coral via-teal via-mustard to-[#FF0000] opacity-30 -translate-x-1/2"></div>
          {/* Left line - mobile */}
          <div className="md:hidden absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-coral via-teal to-[#FF0000] opacity-30"></div>

          <div className="flex flex-col gap-10">
            {EXPERIENCES.map((exp, index) => (
              <ExperienceCard key={exp.titleKey} exp={exp} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}