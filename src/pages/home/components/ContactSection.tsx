import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const FORM_URL = 'https://readdy.ai/api/form/d7lt97nu2vahpmebevtg';

export default function ContactSection() {
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const { ref: headerRef, visible: headerVisible } = useScrollReveal(0.1);
  const { ref: leftRef, visible: leftVisible } = useScrollReveal(0.1);
  const { ref: rightRef, visible: rightVisible } = useScrollReveal(0.1);

  const fontFamily = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'loading') return;

    const form = e.currentTarget;
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement)?.value || '';
    if (message.length > 500) return;

    setStatus('loading');
    const data = new URLSearchParams();
    const formData = new FormData(form);
    formData.forEach((value, key) => {
      data.append(key, value as string);
    });

    try {
      const res = await fetch(FORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data.toString(),
      });
      if (res.ok) {
        setStatus('success');
        formRef.current?.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const socials = [
    {
      key: 'contact_whatsapp',
      icon: 'ri-whatsapp-line',
      href: 'https://wa.me/',
      bg: 'bg-gradient-to-br from-[#25D366] to-[#128C7E]',
      label: 'WhatsApp',
    },
    {
      key: 'contact_instagram',
      icon: 'ri-instagram-line',
      href: 'https://instagram.com/',
      bg: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
      label: 'Instagram',
    },
    {
      key: 'contact_threads',
      icon: 'ri-at-line',
      href: 'https://www.threads.com/@chichiulam?hl=fr-ca',
      bg: 'bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-500 dark:to-gray-700',
      label: 'Threads',
    },
  ];

  return (
    <section id="contact" className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-[#EFF5F4] via-[#EDE6DC] to-[#F5EFE8] dark:from-[#130A22] dark:via-[#0E0818] dark:to-[#130A22]">

      {/* Background blobs */}
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-teal/15 dark:hidden blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-coral/15 dark:hidden blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-mustard/8 dark:hidden blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '12s', animationDelay: '1s' }}></div>

      {/* Wave top */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none pointer-events-none">
        <svg viewBox="0 0 1440 60" className="w-full h-12 fill-[#F5EFE8] dark:fill-[#0E0818]">
          <path d="M0,30 C360,0 1080,60 1440,30 L1440,0 L0,0 Z" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div ref={headerRef} className={`text-center mb-14 reveal ${headerVisible ? 'visible' : ''}`}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12 bg-teal/40"></div>
            <p className="text-teal font-bold text-sm uppercase tracking-widest" style={{ fontFamily }}>
              {t('contact_label')}
            </p>
            <div className="h-px w-12 bg-teal/40"></div>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold text-[#1A1410] dark:text-[#E8E0F5] mb-4"
            style={{ fontFamily }}
          >
            {t('contact_title')}
          </h2>
          <p
            className="text-[#7A7068] dark:text-[#C4A8E8] text-base max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily }}
          >
            {t('contact_subtitle')}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          {/* Left: Social links */}
          <div ref={leftRef} className={`w-full lg:w-80 flex-shrink-0 flex flex-col gap-4 reveal-left ${leftVisible ? 'visible' : ''}`}>
            {socials.map((s, i) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={`flex items-center gap-4 p-4 rounded-2xl bg-[#F7F4EF] dark:bg-[#1E0D38] border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 card-hover cursor-pointer group reveal-scale ${leftVisible ? 'visible' : ''}`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 ${s.bg} text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                  <i className={`${s.icon} text-xl`}></i>
                </div>
                <span className="font-semibold text-base text-[#1A1410] dark:text-[#D4B8F0]" style={{ fontFamily }}>
                  {t(s.key)}
                </span>
                <i className="ri-arrow-right-line ml-auto text-gray-300 dark:text-[#5B2D8E]/60 group-hover:text-teal group-hover:translate-x-1 transition-all duration-200"></i>
              </a>
            ))}

            {/* Book Now Card */}
            <Link
              to="/booking"
              className={`mt-2 p-5 rounded-2xl bg-gradient-to-br from-coral/10 to-mustard/10 dark:from-[#CC0000]/8 dark:to-[#5B1A8A]/10 border border-coral/20 dark:border-[#5B2D8E]/30 reveal-scale ${leftVisible ? 'visible' : ''} cursor-pointer group hover:border-coral/40 dark:hover:border-[#8B3FBF]/50 transition-all duration-200`}
              style={{ transitionDelay: '0.3s' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-coral text-white">
                  <i className="ri-calendar-check-line text-sm"></i>
                </div>
                <p className="font-bold text-sm text-[#1A1410] dark:text-[#E8E0F5]" style={{ fontFamily }}>
                  {t('booking_title')}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-[#C4A8E8] leading-relaxed" style={{ fontFamily }}>
                {i18n.language === 'zh-HK'
                  ? '立即預約你的法語課程，選擇適合你的時間！'
                  : i18n.language === 'fr'
                  ? "Réservez votre cours de français maintenant, choisissez l'heure qui vous convient !"
                  : 'Book your French lesson now, choose a time that works for you!'}
              </p>
              <div className="mt-3 flex items-center gap-1 text-coral text-xs font-medium group-hover:gap-2 transition-all duration-200">
                <span style={{ fontFamily }}>
                  {i18n.language === 'zh-HK' ? '立即預約' : i18n.language === 'fr' ? 'Réserver' : 'Book Now'}
                </span>
                <i className="ri-arrow-right-line"></i>
              </div>
            </Link>
          </div>

          {/* Right: Form */}
          <div ref={rightRef} className={`flex-1 w-full reveal-right ${rightVisible ? 'visible' : ''}`}>
            <div className="bg-white dark:bg-[#161D2B] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-[#232E42]">
              {/* Colorful top bar */}
              <div className="h-1.5 rounded-full bg-gradient-to-r from-coral via-mustard to-teal mb-6"></div>

              <form
                ref={formRef}
                id="contact-form"
                data-readdy-form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <div>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder={t('contact_form_name')}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#D4C8BC]/80 dark:border-[#3B2060]/50 bg-[#F0EBE3] dark:bg-[#130A22] text-[#1A1410] dark:text-[#E8E0F5] text-sm focus:outline-none focus:border-teal transition-colors duration-200"
                    style={{ fontFamily }}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={t('contact_form_email')}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#D4C8BC]/80 dark:border-[#3B2060]/50 bg-[#F0EBE3] dark:bg-[#130A22] text-[#1A1410] dark:text-[#E8E0F5] text-sm focus:outline-none focus:border-coral transition-colors duration-200"
                    style={{ fontFamily }}
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    maxLength={500}
                    placeholder={t('contact_form_message')}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#D4C8BC]/80 dark:border-[#3B2060]/50 bg-[#F0EBE3] dark:bg-[#130A22] text-[#1A1410] dark:text-[#E8E0F5] text-sm focus:outline-none focus:border-mustard transition-colors duration-200 resize-none"
                    style={{ fontFamily }}
                  />
                </div>

                {status === 'success' && (
                  <div className="bg-teal/10 text-teal rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2" style={{ fontFamily }}>
                    <i className="ri-checkbox-circle-line text-lg"></i>
                    {t('contact_form_success')}
                  </div>
                )}
                {status === 'error' && (
                  <div className="bg-coral/10 text-coral rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2" style={{ fontFamily }}>
                    <i className="ri-error-warning-line text-lg"></i>
                    {t('contact_form_error')}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-coral to-[#FF8E53] text-white font-semibold text-sm hover:opacity-90 transition-all duration-300 hover:scale-[1.02] cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-coral/20"
                  style={{ fontFamily }}
                >
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin"></i>
                      {t('contact_form_submit')}
                    </span>
                  ) : (
                    t('contact_form_submit')
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
