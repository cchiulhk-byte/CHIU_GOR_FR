import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { lessonTypes } from '@/mocks/booking';

interface Course {
  titleKey: string;
  descKey: string;
  levelKey: string;
  durationKey: string;
  levelFilter: 'beginner' | 'intermediate' | 'advanced';
  headerBg: string;
  icon: string;
  image: string;
  levelBadge: string;
  courseId: string;
  price?: number;
}

const COURSES: Course[] = [
  {
    titleKey: 'course1_title',
    descKey: 'course1_desc',
    levelKey: 'course1_level',
    durationKey: 'course1_duration',
    levelFilter: 'beginner',
    headerBg: 'bg-gradient-to-br from-coral to-[#FF8E53]',
    icon: 'ri-book-open-line',
    image: 'https://storage.readdy-site.link/project_files/3e3df1c6-a37e-4758-afde-f43b81f1cdcf/9b4a06c2-3e58-4911-9b2d-af115abc00e4_ChatGPT-Image-Apr-25-2026-02_04_43-AM.png?v=c48a4852f4a48000310ab684a75558cc',
    levelBadge: 'bg-coral/10 text-coral dark:bg-coral/20',
    courseId: 'beginner',
    price: lessonTypes.find((l) => l.id === 'beginner')?.price,
  },
  {
    titleKey: 'course2_title',
    descKey: 'course2_desc',
    levelKey: 'course2_level',
    durationKey: 'course2_duration',
    levelFilter: 'beginner',
    headerBg: 'bg-gradient-to-br from-teal to-[#38B2AC]',
    icon: 'ri-chat-voice-line',
    image: 'https://storage.readdy-site.link/project_files/3e3df1c6-a37e-4758-afde-f43b81f1cdcf/5bb32cea-fa03-4696-9b9f-9721bdd6adf6_ChatGPT-Image-Apr-25-2026-01_56_07-AM.png?v=d56a10ca8db0280a4f164ba49d9f909e',
    levelBadge: 'bg-teal/10 text-teal dark:bg-teal/20',
    courseId: 'conversation',
    price: lessonTypes.find((l) => l.id === 'conversation')?.price,
  },
  {
    titleKey: 'course3_title',
    descKey: 'course3_desc',
    levelKey: 'course3_level',
    durationKey: 'course3_duration',
    levelFilter: 'intermediate',
    headerBg: 'bg-gradient-to-br from-mustard to-[#F6C90E]',
    icon: 'ri-award-line',
    image: 'https://storage.readdy-site.link/project_files/3e3df1c6-a37e-4758-afde-f43b81f1cdcf/c1e15c4b-b495-4793-81a4-38dd4d115f04_ChatGPT-Image-Apr-25-2026-02_13_17-AM.png?v=d70120371a113d95812fb5c30a63fd52',
    levelBadge: 'bg-mustard/20 text-yellow-700 dark:text-yellow-400',
    courseId: 'delf',
    price: lessonTypes.find((l) => l.id === 'delf')?.price,
  },
  {
    titleKey: 'course4_title',
    descKey: 'course4_desc',
    levelKey: 'course4_level',
    durationKey: 'course4_duration',
    levelFilter: 'intermediate',
    headerBg: 'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED]',
    icon: 'ri-quill-pen-line',
    image: 'https://storage.readdy-site.link/project_files/3e3df1c6-a37e-4758-afde-f43b81f1cdcf/9db2bbac-f98b-4514-8af5-fbcc113cc593_ChatGPT-Image-Apr-25-2026-02_29_55-AM.png?v=f95cbe2e86f0f6b44bfcde2da2a85121',
    levelBadge: 'bg-[#A78BFA]/10 text-[#7C3AED] dark:text-[#A78BFA]',
    courseId: 'grammar',
    price: lessonTypes.find((l) => l.id === 'grammar')?.price,
  },
  {
    titleKey: 'course6_title',
    descKey: 'course6_desc',
    levelKey: 'course6_level',
    durationKey: 'course6_duration',
    levelFilter: 'advanced',
    headerBg: 'bg-gradient-to-br from-[#EC4899] to-[#BE185D]',
    icon: 'ri-film-line',
    image: 'https://storage.readdy-site.link/project_files/3e3df1c6-a37e-4758-afde-f43b81f1cdcf/8c75a9a4-9526-4a24-a64b-d23d34f91224_ChatGPT-Image-Apr-25-2026-02_31_44-AM.png?v=722160bb26172305d41c90a534a0a75a',
    levelBadge: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    courseId: 'culture',
    price: lessonTypes.find((l) => l.id === 'culture')?.price,
  },
];

function CourseCard({ course, index, visible }: { course: Course; index: number; visible: boolean }) {
  const { t, i18n } = useTranslation();
  const fontFamily = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";

  return (
    <div
      className={`bg-[#F7F4EF] dark:bg-[#1E0D38] rounded-2xl overflow-hidden border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 card-hover group reveal-scale flex flex-col ${visible ? 'visible' : ''}`}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      {/* Colorful header strip */}
      <div className={`relative h-2 ${course.headerBg}`}></div>

      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={course.image}
          alt={t(course.titleKey)}
          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
        />
        {/* no overlay */}
        <div className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-xl ${course.headerBg} text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`}>
          <i className={`${course.icon} text-base`}></i>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className="text-base font-bold text-[#1A1410] dark:text-[#E8E0F5] mb-2 leading-snug"
          style={{ fontFamily }}
        >
          {t(course.titleKey)}
        </h3>
        <p
          className="text-[#7A7068] dark:text-[#C4A8E8] text-base font-medium leading-relaxed mb-4 line-clamp-2"
          style={{ fontFamily }}
        >
          {t(course.descKey)}
        </p>

        {/* Tags + Price */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${course.levelBadge}`}
              style={{ fontFamily }}
            >
              {t(course.levelKey)}
            </span>
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full bg-[#E8DFD4] dark:bg-[#2D1B4E] text-[#4A4440] dark:text-[#C4A8E8] flex items-center gap-1"
              style={{ fontFamily }}
            >
              <i className="ri-time-line text-xs"></i>
              {t(course.durationKey)}
            </span>
          </div>
          {course.price && (
            <span
              className="text-sm font-bold text-[#1A1410] dark:text-[#E8E0F5] whitespace-nowrap"
              style={{ fontFamily }}
            >
              HK$ {course.price}
            </span>
          )}
        </div>

        {/* Book button */}
        <div className="mt-auto">
          <Link
            to={`/booking?course=${course.courseId}`}
            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap ${course.headerBg} text-white opacity-90 hover:opacity-100 hover:scale-[1.02]`}
            style={{ fontFamily }}
          >
            <i className="ri-calendar-check-line text-sm"></i>
            {t('book_this_course') || 'Book This Course'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CoursesSection() {
  const { t, i18n } = useTranslation();
  const { ref: headerRef, visible: headerVisible } = useScrollReveal(0.1);
  const { ref: gridRef, visible: gridVisible } = useScrollReveal(0.05);

  const fontFamily = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";

  return (
    <section id="courses" className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-[#F5EFE8] via-[#F7F4EF] to-[#EFF5F4] dark:from-[#0E0818] dark:via-[#130A22] dark:to-[#0E0818]">

      {/* Background blobs */}
      <div className="absolute top-20 left-0 w-80 h-80 rounded-full bg-mustard/10 dark:hidden blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '9s' }}></div>
      <div className="absolute bottom-20 right-0 w-72 h-72 rounded-full bg-coral/10 dark:hidden blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '11s', animationDelay: '3s' }}></div>

      {/* Wave top */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none pointer-events-none">
        <svg viewBox="0 0 1440 60" className="w-full h-12 fill-[#EFF5F4] dark:fill-[#130A22]">
          <path d="M0,60 C360,0 1080,60 1440,0 L1440,0 L0,0 Z" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div ref={headerRef} className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 reveal ${headerVisible ? 'visible' : ''}`}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-10 bg-mustard/60"></div>
              <p className="text-yellow-600 dark:text-mustard font-bold text-sm uppercase tracking-widest" style={{ fontFamily }}>
                {t('courses_label')}
              </p>
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold text-[#1A1410] dark:text-[#E8E0F5]"
              style={{ fontFamily }}
            >
              {t('courses_title')}
            </h2>
          </div>

        </div>

        {/* Course Grid */}
        <div ref={gridRef} className="flex flex-col gap-6">
          {/* First row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.slice(0, 3).map((course, i) => (
              <CourseCard key={course.titleKey} course={course} index={i} visible={gridVisible} />
            ))}
          </div>
          {/* Second row — centered */}
          {COURSES.length > 3 && (
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              {COURSES.slice(3).map((course, i) => (
                <div key={course.titleKey} className="w-full sm:w-[calc(33.333%-12px)]">
                  <CourseCard course={course} index={i + 3} visible={gridVisible} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}