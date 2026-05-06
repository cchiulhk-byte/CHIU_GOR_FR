import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Button } from "@/design-system/atoms/Button";
import { tokens } from "@/design-system/tokens";

interface Booking {
  id: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  course_type: string;
  preferred_date: string;
  preferred_time: string;
  notes: string | null;
  status: string;
  payment_method: string | null;
  payment_status: string | null;
  payment_reference: string | null;
  created_at: string;
}

interface BookingCardProps {
  booking: Booking;
  adminSecret: string;
  onStatusChange: (id: string, newStatus: string) => void;
}

export default function BookingCard({ booking, adminSecret, onStatusChange }: BookingCardProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<"approve" | "cancel" | "mark_paid" | null>(null);
  const [error, setError] = useState("");
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [paidMarked, setPaidMarked] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(booking.student_email).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    });
  };

  const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;

  const handleAction = async (action: "approve" | "cancel" | "mark_paid") => {
    setLoading(action);
    setError("");
    try {
      const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/booking-manage`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseAnonKey}` },
        body: JSON.stringify({
          action,
          booking_id: booking.id,
          admin_secret: adminSecret,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Action failed");
      if (action === "mark_paid") {
        setPaidMarked(true);
      } else {
        onStatusChange(booking.id, action === "approve" ? "confirmed" : "cancelled");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin_booking_error_generic"));
    } finally {
      setLoading(null);
      setShowConfirmCancel(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending_verification: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-teal-100 text-teal-700 border-teal-200",
    cancelled: "bg-red-100 text-red-600 border-red-200",
  };

  const statusLabels: Record<string, string> = {
    pending_verification: t("admin_tab_pending"),
    confirmed: t("admin_tab_confirmed"),
    cancelled: t("admin_tab_cancelled"),
  };

  const methodIcons: Record<string, string> = {
    fps: "ri-smartphone-line",
    payme: "ri-qr-code-line",
    alipayhk: "ri-wallet-3-line",
  };

  const isPending = booking.status === "pending_verification";

  return (
    <div className={`bg-white dark:bg-[#1E0D38] rounded-2xl sm:rounded-[2.5rem] border p-4 sm:p-8 transition-all shadow-lg ${
      isPending 
        ? "border-yellow-200 shadow-yellow-500/5 dark:border-yellow-500/20" 
        : booking.status === "confirmed" 
          ? "border-teal-200 shadow-teal-500/5 dark:border-teal-500/20" 
          : "border-[#D4C8BC]/20 dark:border-[#3B2060]/20 opacity-70"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
            <h3 className="font-black text-[#1A1410] dark:text-[#E8E0F5] text-base sm:text-xl tracking-tight" style={{ fontFamily: tokens.typography.fontFamily }}>
              {booking.student_name}
            </h3>
            <span className={`text-[10px] px-3 py-1 rounded-full border font-black uppercase tracking-widest ${statusColors[booking.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
              {statusLabels[booking.status] || booking.status}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm sm:text-base text-[#7A7068] dark:text-[#B89FD8] font-medium break-all sm:break-normal">{booking.student_email} · {booking.student_phone}</p>
            <button
              onClick={handleCopyEmail}
              title={t("admin_booking_copy_email")}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-[#7A7068] dark:text-[#B89FD8] hover:text-coral hover:bg-coral/10 transition-all cursor-pointer flex-shrink-0"
            >
              <i className={`text-base ${emailCopied ? "ri-check-line text-teal-500" : "ri-file-copy-line"}`}></i>
            </button>
            {emailCopied && <span className="text-xs text-teal-500 font-bold uppercase tracking-widest">{t("admin_booking_copied")}</span>}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#7A7068]/60 dark:text-[#B89FD8]/60 font-bold whitespace-nowrap bg-[#F7F4EF] dark:bg-[#0E0818] px-3 py-1 rounded-lg self-start">
          {new Date(booking.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4 mb-4 sm:mb-6">
        <div className="bg-[#F7F4EF] dark:bg-[#0E0818] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#D4C8BC]/20 dark:border-[#3B2060]/20">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#7A7068] dark:text-[#B89FD8] mb-1">{t("admin_booking_course")}</p>
          <p className="text-sm sm:text-base font-bold text-[#1A1410] dark:text-[#E8E0F5] leading-tight">{booking.course_type}</p>
        </div>
        <div className="bg-[#F7F4EF] dark:bg-[#0E0818] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#D4C8BC]/20 dark:border-[#3B2060]/20">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#7A7068] dark:text-[#B89FD8] mb-1">{t("admin_booking_date")}</p>
          <p className="text-sm sm:text-base font-bold text-[#1A1410] dark:text-[#E8E0F5]">{booking.preferred_date}</p>
        </div>
        <div className="bg-[#F7F4EF] dark:bg-[#0E0818] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#D4C8BC]/20 dark:border-[#3B2060]/20">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#7A7068] dark:text-[#B89FD8] mb-1">{t("admin_booking_time")}</p>
          <p className="text-sm sm:text-base font-bold text-[#1A1410] dark:text-[#E8E0F5]">{booking.preferred_time} HKT</p>
        </div>
        <div className="bg-[#F7F4EF] dark:bg-[#0E0818] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#D4C8BC]/20 dark:border-[#3B2060]/20">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#7A7068] dark:text-[#B89FD8] mb-1">{t("admin_booking_payment")}</p>
          <div className="flex items-center gap-2">
            {booking.payment_method && (
              <i className={`${methodIcons[booking.payment_method] || "ri-money-dollar-circle-line"} text-coral text-lg`}></i>
            )}
            <p className="text-sm sm:text-base font-bold text-[#1A1410] dark:text-[#E8E0F5] capitalize">{booking.payment_method || "—"}</p>
          </div>
        </div>
      </div>

      {/* Payment reference */}
      {booking.payment_reference && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
          <i className="ri-receipt-line text-yellow-600 text-sm flex-shrink-0"></i>
          <div>
            <span className="text-xs text-yellow-600 font-medium">{t("admin_booking_ref")} : </span>
            <span className="text-sm text-yellow-800 font-bold">{booking.payment_reference}</span>
          </div>
        </div>
      )}

      {/* Notes */}
      {booking.notes && (
        <div className="bg-gray-50 rounded-lg px-4 py-2.5 mb-4 flex items-start gap-2">
          <i className="ri-sticky-note-line text-gray-400 text-sm mt-0.5 flex-shrink-0"></i>
          <p className="text-xs text-gray-500">{booking.notes}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-1.5">
          <i className="ri-error-warning-line"></i>{error}
        </div>
      )}

      {/* Actions */}
      {isPending && !showConfirmCancel && (
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => handleAction("approve")}
            disabled={loading !== null}
            className="flex-1 py-2.5 rounded-lg bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading === "approve" ? (
              <><i className="ri-loader-4-line animate-spin"></i>{t("admin_booking_approve")}...</>
            ) : (
              <><i className="ri-checkbox-circle-line"></i>{t("admin_booking_approve")}</>
            )}
          </button>
          <button
            onClick={() => setShowConfirmCancel(true)}
            disabled={loading !== null}
            className="flex-1 py-2.5 rounded-lg bg-red-50 text-red-500 border border-red-200 text-sm font-medium hover:bg-red-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <i className="ri-close-circle-line"></i>{t("admin_booking_cancel")}
          </button>
        </div>
      )}

      {/* Cancel confirmation */}
      {isPending && showConfirmCancel && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-medium text-red-700 mb-1">{t("admin_booking_confirm_cancel_title")}</p>
          <p className="text-xs text-red-500 mb-3">
            {t("admin_booking_confirm_cancel_desc")} (<strong>{booking.student_email}</strong>)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleAction("cancel")}
              disabled={loading !== null}
              className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              {loading === "cancel" ? (
                <><i className="ri-loader-4-line animate-spin"></i>...</>
              ) : (
                <>{t("admin_booking_confirm_cancel_btn")}</>
              )}
            </button>
            <button
              onClick={() => setShowConfirmCancel(false)}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
            >
              {t("admin_booking_back")}
            </button>
          </div>
        </div>
      )}

      {/* Marquer comme paye */}
      {booking.status === "confirmed" && !paidMarked && booking.payment_status !== "paid" && (
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => handleAction("mark_paid")}
            disabled={loading !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-sm font-medium hover:bg-emerald-100 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            {loading === "mark_paid" ? (
              <><i className="ri-loader-4-line animate-spin"></i>...</>
            ) : (
              <><i className="ri-money-dollar-circle-line"></i>{t("admin_booking_mark_paid")}</>
            )}
          </button>
        </div>
      )}

      {paidMarked && (
        <div className="flex items-center gap-2 pt-1 text-emerald-600 text-sm">
          <i className="ri-checkbox-circle-fill text-lg"></i>
          <span className="font-medium">{t("admin_booking_paid_recorded")}</span>
        </div>
      )}

      {/* Confirmed state */}
      {booking.status === "confirmed" && (
        <div className="flex items-center gap-2 pt-1 text-teal-600 text-sm">
          <i className="ri-checkbox-circle-fill text-lg"></i>
          <span className="font-medium">{t("admin_booking_confirmed_desc")}</span>
        </div>
      )}

      {/* Cancelled state */}
      {booking.status === "cancelled" && (
        <div className="flex items-center gap-2 pt-1 text-red-400 text-sm">
          <i className="ri-close-circle-fill text-lg"></i>
          <span className="font-medium">{t("admin_booking_cancelled_desc")}</span>
        </div>
      )}
    </div>
  );
}