import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { lessonTypes, timeSlots } from "@/mocks/booking";

interface BookingData {
  lessonType: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

interface RecentBooking {
  lessonType: string;
  lessonTitle: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
}

const RECENT_KEY = "recentBooking";

export default function BookingForm() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState<BookingData>({
    lessonType: "",
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingData, string>>>({});
  const [highlightedCourse, setHighlightedCourse] = useState<string | null>(null);
  const [recentBooking, setRecentBooking] = useState<RecentBooking | null>(null);
  const [showRecentBanner, setShowRecentBanner] = useState(true);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent booking from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecentBooking(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  // Handle ?course= param — pre-select and skip to step 2 with highlight
  useEffect(() => {
    const courseParam = searchParams.get("course");
    if (courseParam) {
      const match = lessonTypes.find((l) => l.id === courseParam);
      if (match) {
        setBooking((b) => ({ ...b, lessonType: match.id }));
        setStep(2);
        setHighlightedCourse(match.id);
        highlightTimerRef.current = setTimeout(() => setHighlightedCourse(null), 2500);
      }
    }
    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, [searchParams]);

  const fontFamily =
    i18n.language === "zh-HK"
      ? "'Chiron GoRound TC', Candara, 'Nunito', sans-serif"
      : "Candara, 'Nunito', sans-serif";

  const getLessonTitle = (lesson: (typeof lessonTypes)[0]) => {
    if (i18n.language === "zh-HK") return lesson.titleZh;
    if (i18n.language === "fr") return lesson.titleFr;
    return lesson.title;
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Partial<Record<keyof BookingData, string>> = {};
    if (currentStep === 1 && !booking.lessonType) newErrors.lessonType = t("booking_error_lesson");
    if (currentStep === 2 && !booking.date) newErrors.date = t("booking_error_date");
    if (currentStep === 3 && !booking.time) newErrors.time = t("booking_error_time");
    if (currentStep === 4) {
      if (!booking.name.trim()) newErrors.name = t("booking_error_name");
      if (!booking.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email))
        newErrors.email = t("booking_error_email");
      if (!booking.phone.trim()) newErrors.phone = t("booking_error_phone");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) { setStep((s) => s + 1); setErrors({}); }
  };

  const handleBack = () => { setStep((s) => s - 1); setErrors({}); };

  const handleProceedToPayment = () => {
    if (!validateStep(step)) return;
    const selectedLesson = lessonTypes.find((l) => l.id === booking.lessonType);
    const bookingSummary = {
      ...booking,
      lessonTitle: selectedLesson ? getLessonTitle(selectedLesson) : "",
      price: selectedLesson?.price || 0,
      duration: selectedLesson?.duration || "60 min",
      courseType: selectedLesson?.title || booking.lessonType,
    };
    // Save to localStorage for "recently viewed"
    const recent: RecentBooking = {
      lessonType: booking.lessonType,
      lessonTitle: selectedLesson ? getLessonTitle(selectedLesson) : "",
      date: booking.date,
      time: booking.time,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
    };
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
    sessionStorage.setItem("pendingBooking", JSON.stringify(bookingSummary));
    navigate("/payment");
  };

  const handleQuickRebook = () => {
    if (!recentBooking) return;
    setBooking((b) => ({
      ...b,
      lessonType: recentBooking.lessonType,
      name: recentBooking.name,
      email: recentBooking.email,
      phone: recentBooking.phone,
    }));
    setHighlightedCourse(recentBooking.lessonType);
    highlightTimerRef.current = setTimeout(() => setHighlightedCourse(null), 2500);
    setStep(2);
    setShowRecentBanner(false);
  };

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const steps = [
    { num: 1, label: t("booking_step_lesson") },
    { num: 2, label: t("booking_step_date") },
    { num: 3, label: t("booking_step_time") },
    { num: 4, label: t("booking_step_info") },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* Recently Viewed Banner */}
      {recentBooking && showRecentBanner && step === 1 && (
        <div className="mb-6 p-4 rounded-xl bg-teal/5 border border-teal/20 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-teal/10 flex-shrink-0">
              <i className="ri-history-line text-teal text-base"></i>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 mb-0.5" style={{ fontFamily }}>Last booked</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white truncate" style={{ fontFamily }}>
                {recentBooking.lessonTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleQuickRebook}
              className="px-3 py-1.5 rounded-lg bg-teal text-white text-xs font-semibold hover:bg-teal/90 transition-all cursor-pointer whitespace-nowrap"
              style={{ fontFamily }}
            >
              Book Again
            </button>
            <button
              onClick={() => setShowRecentBanner(false)}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step >= s.num
                    ? "bg-coral text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}
              >
                {step > s.num ? <i className="ri-check-line text-lg"></i> : s.num}
              </div>
              <span
                className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                  step >= s.num ? "text-coral" : "text-gray-400 dark:text-gray-500"
                }`}
                style={{ fontFamily }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                  step > s.num ? "bg-coral" : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Lesson */}
      {step === 1 && (
        <div className="animate-fade-in">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6" style={{ fontFamily }}>
            {t("booking_select_lesson")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lessonTypes.map((lesson) => {
              const isSelected = booking.lessonType === lesson.id;
              const isHighlighted = highlightedCourse === lesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setBooking((b) => ({ ...b, lessonType: lesson.id }));
                    setErrors((e) => ({ ...e, lessonType: undefined }));
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-300 cursor-pointer relative overflow-hidden
                    ${isSelected
                      ? "border-coral bg-coral/5 dark:bg-coral/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-coral/50 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }
                    ${isHighlighted ? "ring-2 ring-coral ring-offset-2 scale-[1.02]" : ""}
                  `}
                >
                  {/* Shimmer highlight animation */}
                  {isHighlighted && (
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-coral/10 to-transparent animate-shimmer pointer-events-none" />
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-bold text-gray-800 dark:text-white text-sm" style={{ fontFamily }}>
                      {getLessonTitle(lesson)}
                    </span>
                    {isSelected && <i className="ri-checkbox-circle-fill text-coral text-lg"></i>}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <i className="ri-time-line"></i>
                        {lesson.duration}
                      </span>
                    </div>
                    <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">
                      HK$ {lesson.price}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {errors.lessonType && (
            <p className="text-coral text-sm mt-3 flex items-center gap-1">
              <i className="ri-error-warning-line"></i>
              {errors.lessonType}
            </p>
          )}
        </div>
      )}

      {/* Step 2: Select Date */}
      {step === 2 && (
        <div className="animate-fade-in">
          {/* Selected course pill */}
          {booking.lessonType && (() => {
            const sel = lessonTypes.find((l) => l.id === booking.lessonType);
            return sel ? (
              <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-coral/5 border border-coral/20">
                <i className="ri-checkbox-circle-fill text-coral text-base"></i>
                <span className="text-sm font-semibold text-coral" style={{ fontFamily }}>
                  {getLessonTitle(sel)}
                </span>
                <span className="text-xs text-gray-400 ml-auto">HK$ {sel.price}</span>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-400 hover:text-coral transition-colors cursor-pointer whitespace-nowrap"
                  style={{ fontFamily }}
                >
                  Change
                </button>
              </div>
            ) : null;
          })()}
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6" style={{ fontFamily }}>
            {t("booking_select_date")}
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4">
            <input
              type="date"
              value={booking.date}
              min={today}
              max={maxDate}
              onChange={(e) => {
                setBooking((b) => ({ ...b, date: e.target.value }));
                setErrors((e) => ({ ...e, date: undefined }));
              }}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all duration-200"
              style={{ fontFamily }}
            />
          </div>
          {errors.date && (
            <p className="text-coral text-sm mt-3 flex items-center gap-1">
              <i className="ri-error-warning-line"></i>{errors.date}
            </p>
          )}
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 flex items-center gap-1">
            <i className="ri-calendar-check-line"></i>
            {t("booking_date_hint")}
          </p>
        </div>
      )}

      {/* Step 3: Select Time */}
      {step === 3 && (
        <div className="animate-fade-in">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6" style={{ fontFamily }}>
            {t("booking_select_time")}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => {
                  setBooking((b) => ({ ...b, time: slot }));
                  setErrors((e) => ({ ...e, time: undefined }));
                }}
                className={`py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  booking.time === slot
                    ? "border-coral bg-coral text-white"
                    : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-coral/50 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                style={{ fontFamily }}
              >
                {slot}
              </button>
            ))}
          </div>
          {errors.time && (
            <p className="text-coral text-sm mt-3 flex items-center gap-1">
              <i className="ri-error-warning-line"></i>{errors.time}
            </p>
          )}
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 flex items-center gap-1">
            <i className="ri-time-zone-line"></i>
            {t("booking_time_hint")}
          </p>
        </div>
      )}

      {/* Step 4: Student Info */}
      {step === 4 && (
        <div className="animate-fade-in">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6" style={{ fontFamily }}>
            {t("booking_your_info")}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" style={{ fontFamily }}>
                {t("booking_name")} *
              </label>
              <input
                type="text"
                value={booking.name}
                onChange={(e) => { setBooking((b) => ({ ...b, name: e.target.value })); setErrors((e) => ({ ...e, name: undefined })); }}
                placeholder={t("booking_name_placeholder")}
                className="w-full p-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all duration-200"
                style={{ fontFamily }}
              />
              {errors.name && <p className="text-coral text-xs mt-1 flex items-center gap-1"><i className="ri-error-warning-line"></i>{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" style={{ fontFamily }}>
                {t("booking_email")} *
              </label>
              <input
                type="email"
                value={booking.email}
                onChange={(e) => { setBooking((b) => ({ ...b, email: e.target.value })); setErrors((e) => ({ ...e, email: undefined })); }}
                placeholder={t("booking_email_placeholder")}
                className="w-full p-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all duration-200"
                style={{ fontFamily }}
              />
              {errors.email && <p className="text-coral text-xs mt-1 flex items-center gap-1"><i className="ri-error-warning-line"></i>{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" style={{ fontFamily }}>
                {t("booking_phone")} *
              </label>
              <input
                type="tel"
                value={booking.phone}
                onChange={(e) => { setBooking((b) => ({ ...b, phone: e.target.value })); setErrors((e) => ({ ...e, phone: undefined })); }}
                placeholder={t("booking_phone_placeholder")}
                className="w-full p-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all duration-200"
                style={{ fontFamily }}
              />
              {errors.phone && <p className="text-coral text-xs mt-1 flex items-center gap-1"><i className="ri-error-warning-line"></i>{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" style={{ fontFamily }}>
                {t("booking_notes")}
              </label>
              <textarea
                value={booking.notes}
                onChange={(e) => setBooking((b) => ({ ...b, notes: e.target.value }))}
                placeholder={t("booking_notes_placeholder")}
                rows={3}
                maxLength={500}
                className="w-full p-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-all duration-200 resize-none"
                style={{ fontFamily }}
              />
              <p className="text-gray-400 text-xs mt-1 text-right">{booking.notes.length}/500</p>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 rounded-xl bg-mustard/10 dark:bg-mustard/5 border border-mustard/20">
            <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-3 flex items-center gap-2" style={{ fontFamily }}>
              <i className="ri-file-list-3-line text-mustard"></i>
              {t("booking_summary")}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t("booking_summary_lesson")}</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {getLessonTitle(lessonTypes.find((l) => l.id === booking.lessonType) || lessonTypes[0])}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t("booking_summary_date")}</span>
                <span className="font-medium text-gray-800 dark:text-white">{booking.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t("booking_summary_time")}</span>
                <span className="font-medium text-gray-800 dark:text-white">{booking.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">{t("booking_summary_duration")}</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {lessonTypes.find((l) => l.id === booking.lessonType)?.duration}
                </span>
              </div>
              <div className="border-t border-mustard/20 pt-2 flex justify-between">
                <span className="font-bold text-gray-800 dark:text-white">{t("booking_summary_price")}</span>
                <span className="font-bold text-coral text-lg">
                  HK$ {lessonTypes.find((l) => l.id === booking.lessonType)?.price}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer flex items-center gap-2"
            style={{ fontFamily }}
          >
            <i className="ri-arrow-left-line"></i>
            {t("booking_back")}
          </button>
        ) : (
          <div />
        )}
        {step < 4 ? (
          <button
            onClick={handleNext}
            className="px-6 py-3 rounded-xl bg-coral text-white font-medium text-sm hover:bg-coral/90 transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-sm hover:shadow-md"
            style={{ fontFamily }}
          >
            {t("booking_next")}
            <i className="ri-arrow-right-line"></i>
          </button>
        ) : (
          <button
            onClick={handleProceedToPayment}
            className="px-6 py-3 rounded-xl bg-coral text-white font-medium text-sm hover:bg-coral/90 transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-sm hover:shadow-md"
            style={{ fontFamily }}
          >
            {t("booking_proceed_payment")}
            <i className="ri-arrow-right-line"></i>
          </button>
        )}
      </div>
    </div>
  );
}
