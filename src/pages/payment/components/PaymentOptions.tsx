import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import ShareBookingButton from "@/components/feature/ShareBookingButton";

interface PendingBooking {
  lessonType: string;
  lessonTitle: string;
  courseType: string;
  price: number;
  duration: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export default function PaymentOptions() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [bookingData, setBookingData] = useState<PendingBooking | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [referenceError, setReferenceError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fontFamily =
    i18n.language === "zh-HK"
      ? "'Chiron GoRound TC', Candara, 'Nunito', sans-serif"
      : "Candara, 'Nunito', sans-serif";

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pendingBooking");
      if (raw) {
        setBookingData(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  if (!bookingData) {
    return (
      <div className="text-center py-12">
        <i className="ri-error-warning-line text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
        <p className="text-gray-500 dark:text-gray-400 mb-4" style={{ fontFamily }}>
          {t("payment_no_booking")}
        </p>
        <button
          onClick={() => navigate("/booking")}
          className="px-6 py-3 rounded-xl bg-coral text-white font-medium text-sm hover:bg-coral/90 transition-all duration-200 cursor-pointer"
          style={{ fontFamily }}
        >
          {t("payment_go_booking")}
        </button>
      </div>
    );
  }

  const paymentMethods = [
    {
      id: "fps",
      name: t("payment_fps"),
      icon: "ri-smartphone-line",
      color: "bg-teal-600",
      description: t("payment_fps_desc"),
    },
    {
      id: "payme",
      name: t("payment_payme"),
      icon: "ri-qr-code-line",
      color: "bg-rose-500",
      description: t("payment_payme_desc"),
    },
    {
      id: "alipayhk",
      name: t("payment_alipayhk"),
      icon: "ri-wallet-3-line",
      color: "bg-sky-500",
      description: t("payment_alipayhk_desc"),
    },
  ];

  const handleCopyFPS = () => {
    navigator.clipboard.writeText("61985259");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError(t("payment_screenshot_error"));
      return;
    }
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setSubmitError("");
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitForVerification = async () => {
    if (!paymentReference.trim()) {
      setReferenceError(t("payment_reference_error"));
      return;
    }
    setReferenceError("");
    setProcessing(true);
    setSubmitError("");

    try {
      // 1. Save booking to Supabase as PENDING (no calendar sync yet)
      const { data: savedBooking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          student_name: bookingData.name,
          student_email: bookingData.email,
          student_phone: bookingData.phone,
          course_type: bookingData.courseType,
          preferred_date: bookingData.date,
          preferred_time: bookingData.time,
          notes: bookingData.notes || null,
          status: "pending_verification",
          payment_method: selectedMethod,
          payment_status: "pending",
          payment_reference: paymentReference.trim(),
        })
        .select("id")
        .single();

      if (bookingError || !savedBooking) {
        throw new Error(bookingError?.message || "Failed to save booking");
      }

      // 2. Clear pending booking
      sessionStorage.removeItem("pendingBooking");

      setProcessing(false);
      setShowSuccess(true);
    } catch (err) {
      setProcessing(false);
      setSubmitError(err instanceof Error ? err.message : t("payment_error_generic"));
    }
  };

  if (showSuccess) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-mustard/10 flex items-center justify-center mx-auto mb-6">
          <i className="ri-time-line text-4xl text-mustard"></i>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3" style={{ fontFamily }}>
          {t("payment_submitted_title")}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-2 max-w-md mx-auto" style={{ fontFamily }}>
          {t("payment_pending_msg1")}
          <strong className="text-gray-700 dark:text-gray-300">{bookingData.email}</strong>{t("payment_pending_msg2")}
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-8" style={{ fontFamily }}>
          {t("payment_allow_24h")}
        </p>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 max-w-md mx-auto mb-8 text-left">
          <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-3" style={{ fontFamily }}>
            {t("payment_booking_details")}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t("payment_lesson")}</span>
              <span className="font-medium text-gray-800 dark:text-white">{bookingData.lessonTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t("payment_date")}</span>
              <span className="font-medium text-gray-800 dark:text-white">{bookingData.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t("payment_time")}</span>
              <span className="font-medium text-gray-800 dark:text-white">{bookingData.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t("payment_method_label")}</span>
              <span className="font-medium text-gray-800 dark:text-white capitalize">
                {selectedMethod === "fps" ? t("payment_fps")
                  : selectedMethod === "payme" ? t("payment_payme")
                  : t("payment_alipayhk")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t("payment_ref")}</span>
              <span className="font-medium text-gray-800 dark:text-white text-xs">{paymentReference}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
              <span className="font-bold text-gray-800 dark:text-white">{t("payment_total")}</span>
              <span className="font-bold text-coral text-lg">HK$ {bookingData.price}</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-4 max-w-md mx-auto mb-8 text-left border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <i className="ri-information-line text-yellow-600 dark:text-yellow-400 mt-0.5"></i>
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300" style={{ fontFamily }}>
                {t("payment_what_happens_next")}
              </p>
              <ol className="text-xs text-yellow-700 dark:text-yellow-400 mt-1 space-y-1 list-decimal list-inside">
                <li>{t("payment_step1")}</li>
                <li>{t("payment_step2")}</li>
                <li>{t("payment_step3")}</li>
                <li>{t("payment_step4")}</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <ShareBookingButton variant="full" />
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl bg-coral text-white font-medium text-sm hover:bg-coral/90 transition-all duration-200 cursor-pointer whitespace-nowrap"
            style={{ fontFamily }}
          >
            {t("payment_back_home")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Booking Summary */}
      <div className="bg-mustard/10 dark:bg-mustard/5 rounded-xl p-4 mb-8 border border-mustard/20">
        <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-3 flex items-center gap-2" style={{ fontFamily }}>
          <i className="ri-file-list-3-line text-mustard"></i>
          {t("payment_order_summary")}
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">{t("payment_lesson")}</span>
            <span className="font-medium text-gray-800 dark:text-white">{bookingData.lessonTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">{t("payment_date")}</span>
            <span className="font-medium text-gray-800 dark:text-white">{bookingData.date} {bookingData.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">{t("payment_duration")}</span>
            <span className="font-medium text-gray-800 dark:text-white">{bookingData.duration}</span>
          </div>
          <div className="border-t border-mustard/20 pt-2 flex justify-between">
            <span className="font-bold text-gray-800 dark:text-white">{t("payment_total")}</span>
            <span className="font-bold text-coral text-lg">HK$ {bookingData.price}</span>
          </div>
        </div>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-coral/10 border border-coral/20 text-coral text-sm flex items-center gap-2">
          <i className="ri-error-warning-line text-lg"></i>
          <span style={{ fontFamily }}>{submitError}</span>
        </div>
      )}

      {/* Payment Methods */}
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4" style={{ fontFamily }}>
        {t("payment_select_method")}
      </h3>

      <div className="space-y-3 mb-8">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => {
              setSelectedMethod(method.id);
              setPaymentConfirmed(false);
              setPaymentReference("");
              setReferenceError("");
              setScreenshotFile(null);
              setScreenshotPreview(null);
            }}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
              selectedMethod === method.id
                ? "border-coral bg-coral/5 dark:bg-coral/10"
                : "border-gray-200 dark:border-gray-700 hover:border-coral/50 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center flex-shrink-0`}>
                <i className={`${method.icon} text-white text-lg`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 dark:text-white text-sm" style={{ fontFamily }}>
                    {method.name}
                  </span>
                  {selectedMethod === method.id && (
                    <i className="ri-checkbox-circle-fill text-coral text-xl"></i>
                  )}
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{method.description}</p>
              </div>
            </div>

            {/* FPS Payment Details */}
            {selectedMethod === "fps" && method.id === "fps" && (
              <div className="mt-4 p-4 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-smartphone-line text-teal-600 text-lg"></i>
                  <p className="text-sm font-bold text-teal-800 dark:text-teal-300" style={{ fontFamily }}>
                    {t("payment_pay_via_fps")}
                  </p>
                </div>
                <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 mb-4 list-decimal list-inside">
                  <li>{t("payment_fps_step1")}</li>
                  <li>{t("payment_fps_step2")}</li>
                  <li>{t("payment_fps_step3")}</li>
                  <li>{t("payment_fps_step4")} <strong className="text-coral">HK$ {bookingData.price}</strong></li>
                  <li>{t("payment_fps_step5")}</li>
                  <li><strong>{t("payment_fps_step6")}</strong></li>
                </ol>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-3 rounded-lg bg-white dark:bg-gray-800 border border-teal-200 dark:border-teal-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("payment_fps_number")}</p>
                    <p className="text-xl font-bold text-teal-600 dark:text-teal-400 tracking-wider">61985259</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopyFPS(); }}
                    className="px-4 py-3 rounded-lg bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition-all duration-200 cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                    style={{ fontFamily }}
                  >
                    {copied ? <><i className="ri-check-line"></i>Copied</> : <><i className="ri-file-copy-line"></i>Copy</>}
                  </button>
                </div>
                <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">{t("payment_fps_name")}</p>
              </div>
            )}

            {/* PayMe Payment Details */}
            {selectedMethod === "payme" && method.id === "payme" && (
              <div className="mt-4 p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-qr-code-line text-rose-500 text-lg"></i>
                  <p className="text-sm font-bold text-rose-800 dark:text-rose-300" style={{ fontFamily }}>
                    {t("payment_pay_via_payme")}
                  </p>
                </div>
                <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 mb-4 list-decimal list-inside">
                  <li>{t("payment_payme_step1")}</li>
                  <li>{t("payment_payme_step2")}</li>
                  <li>{t("payment_payme_step3")}</li>
                  <li>{t("payment_fps_step4")} <strong className="text-coral">HK$ {bookingData.price}</strong></li>
                  <li>{t("payment_fps_step5")}</li>
                  <li><strong>{t("payment_fps_step6")}</strong></li>
                </ol>
                <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-rose-200 dark:border-rose-800 flex flex-col items-center">
                  <img
                    src="https://storage.readdy-site.link/project_files/3e3df1c6-a37e-4758-afde-f43b81f1cdcf/156a71c9-b78b-427e-8431-105bebad6a00_PayCode_1777060713316.jpg?v=0e8c76fb52520e653f926572ded1e29a"
                    alt="PayMe QR Code"
                    className="w-44 h-44 object-contain rounded-lg"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t("payment_payme_scan")}</p>
                </div>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">{t("payment_payme_note")}</p>
              </div>
            )}

            {/* AlipayHK Payment Details */}
            {selectedMethod === "alipayhk" && method.id === "alipayhk" && (
              <div className="mt-4 p-4 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800">
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-wallet-3-line text-sky-500 text-lg"></i>
                  <p className="text-sm font-bold text-sky-800 dark:text-sky-300" style={{ fontFamily }}>
                    {t("payment_pay_via_alipayhk")}
                  </p>
                </div>
                <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 mb-4 list-decimal list-inside">
                  <li>{t("payment_alipayhk_step1")}</li>
                  <li>{t("payment_alipayhk_step2")}</li>
                  <li>{t("payment_alipayhk_step3")}</li>
                  <li>{t("payment_fps_step4")} <strong className="text-coral">HK$ {bookingData.price}</strong></li>
                  <li>{t("payment_fps_step5")}</li>
                  <li><strong>{t("payment_fps_step6")}</strong></li>
                </ol>
                <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-sky-200 dark:border-sky-800 flex flex-col items-center">
                  <img
                    src="https://storage.readdy-site.link/project_files/3e3df1c6-a37e-4758-afde-f43b81f1cdcf/d0edff60-ba04-44b6-b92c-723e5562e131_payee_1777060760823.png?v=c44f112c4811774554c6e65eef2edb0e"
                    alt="AlipayHK QR Code"
                    className="w-44 h-44 object-contain rounded-lg"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t("payment_alipayhk_scan")}</p>
                </div>
                <p className="text-xs text-sky-600 dark:text-sky-400 mt-2">{t("payment_alipayhk_note")}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Payment Verification Form */}
      {paymentConfirmed && (
        <div className="mb-8 p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 animate-fade-in">
          <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-4 flex items-center gap-2" style={{ fontFamily }}>
            <i className="ri-shield-check-line text-coral"></i>
            {t("payment_verification_title")}
          </h4>

          <div className="space-y-4">
            {/* Transaction Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" style={{ fontFamily }}>
                {t("payment_ref_label")} <span className="text-coral">*</span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {t("payment_ref_desc")}
              </p>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => {
                  setPaymentReference(e.target.value);
                  if (e.target.value.trim()) setReferenceError("");
                }}
                placeholder={t("payment_ref_placeholder")}
                className={`w-full p-3 rounded-lg border bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                  referenceError
                    ? "border-coral focus:ring-coral/30"
                    : "border-gray-200 dark:border-gray-700 focus:ring-coral/30"
                }`}
                style={{ fontFamily }}
              />
              {referenceError && (
                <p className="text-xs text-coral mt-1.5 flex items-center gap-1">
                  <i className="ri-error-warning-line"></i>
                  {referenceError}
                </p>
              )}
            </div>

            {/* Screenshot Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" style={{ fontFamily }}>
                {t("payment_screenshot_label")} <span className="text-gray-400 font-normal">{t("payment_screenshot_optional")}</span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {t("payment_screenshot_desc")}
              </p>

              {!screenshotPreview ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-coral hover:bg-coral/5 transition-all duration-200 cursor-pointer flex flex-col items-center gap-2"
                >
                  <i className="ri-upload-cloud-2-line text-2xl text-gray-400"></i>
                  <span className="text-sm text-gray-500 dark:text-gray-400" style={{ fontFamily }}>
                    {t("payment_upload_click")}
                  </span>
                  <span className="text-xs text-gray-400">{t("payment_upload_format")}</span>
                </button>
              ) : (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img
                    src={screenshotPreview}
                    alt="Payment screenshot preview"
                    className="w-full max-h-48 object-contain bg-gray-100 dark:bg-gray-800"
                  />
                  <button
                    onClick={handleRemoveScreenshot}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-800/70 text-white flex items-center justify-center hover:bg-gray-800 transition-all cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleScreenshotChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/booking")}
          className="px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer flex items-center gap-2 whitespace-nowrap"
          style={{ fontFamily }}
        >
          <i className="ri-arrow-left-line"></i>
          {t("payment_back")}
        </button>

        {!paymentConfirmed ? (
          <button
            onClick={() => setPaymentConfirmed(true)}
            disabled={!selectedMethod}
            className="px-8 py-3 rounded-xl bg-coral text-white font-medium text-sm hover:bg-coral/90 transition-all duration-200 cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            style={{ fontFamily }}
          >
            {t("payment_btn_completed")}
            <i className="ri-arrow-right-line"></i>
          </button>
        ) : (
          <button
            onClick={handleSubmitForVerification}
            disabled={processing}
            className="px-8 py-3 rounded-xl bg-coral text-white font-medium text-sm hover:bg-coral/90 transition-all duration-200 cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            style={{ fontFamily }}
          >
            {processing ? (
              <><i className="ri-loader-4-line animate-spin"></i>{t("payment_btn_submitting")}</>
            ) : (
              <>{t("payment_btn_submit")}<i className="ri-arrow-right-line"></i></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}