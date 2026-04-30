import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import BookingForm from "./components/BookingForm";
import Navbar from "@/pages/home/components/Navbar";
import Footer from "@/pages/home/components/Footer";
import { useDarkMode } from "@/hooks/useDarkMode";
import ShareBookingButton from "@/components/feature/ShareBookingButton";
import { lessonTypes } from "@/mocks/booking";

export default function BookingPage() {
  const { t, i18n } = useTranslation();
  const { isDark, toggle } = useDarkMode();
  const [searchParams] = useSearchParams();
  const courseParam = searchParams.get("course");
  const activeCourse = lessonTypes.find((l) => l.id === courseParam);

  const fontFamily =
    i18n.language === "zh-HK"
      ? "'Chiron GoRound TC', Candara, 'Nunito', sans-serif"
      : "Candara, 'Nunito', sans-serif";

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-[#0D1117] transition-colors duration-300">
      <Navbar isDark={isDark} onToggleDark={toggle} />

      <main className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-between mb-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-500 dark:text-[#7A8FA6] hover:text-coral transition-colors duration-200 text-sm cursor-pointer"
                style={{ fontFamily }}
              >
                <i className="ri-arrow-left-line"></i>
                {t("booking_back_home")}
              </Link>
              <ShareBookingButton
                courseId={activeCourse?.id}
                courseTitle={activeCourse?.title}
                variant="full"
              />
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-[#E6EDF3] mb-3"
              style={{ fontFamily }}
            >
              {t("booking_title")}
            </h1>
            <p
              className="text-gray-500 dark:text-[#7A8FA6] text-base max-w-lg mx-auto"
              style={{ fontFamily }}
            >
              {t("booking_subtitle")}
            </p>
          </div>

          <div className="bg-[#FFFDF8] dark:bg-[#161D2B] rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-[#232E42]">
            <BookingForm />
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-gray-400 dark:text-[#4A5568] text-xs">
            <span className="flex items-center gap-1.5">
              <i className="ri-shield-check-line text-teal"></i>
              {t("booking_secure")}
            </span>
            <span className="flex items-center gap-1.5">
              <i className="ri-calendar-check-line text-coral"></i>
              {t("booking_instant_confirm")}
            </span>
            <span className="flex items-center gap-1.5">
              <i className="ri-refund-line text-mustard"></i>
              {t("booking_flexible")}
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}