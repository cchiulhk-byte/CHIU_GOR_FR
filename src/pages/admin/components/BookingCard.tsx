import { useState } from "react";
import { supabase } from "@/lib/supabase";

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
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
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
    pending_verification: "En attente",
    confirmed: "Confirmé",
    cancelled: "Annulé",
  };

  const methodIcons: Record<string, string> = {
    fps: "ri-smartphone-line",
    payme: "ri-qr-code-line",
    alipayhk: "ri-wallet-3-line",
  };

  const isPending = booking.status === "pending_verification";

  return (
    <div className={`bg-white rounded-2xl border p-5 transition-all ${
      isPending ? "border-yellow-200" : booking.status === "confirmed" ? "border-teal-200" : "border-red-100 opacity-70"
    }`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-800 text-base">{booking.student_name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[booking.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
              {statusLabels[booking.status] || booking.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">{booking.student_email} · {booking.student_phone}</p>
            <button
              onClick={handleCopyEmail}
              title="Copier l’e-mail"
              className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer flex-shrink-0"
            >
              <i className={`text-xs ${emailCopied ? "ri-check-line text-teal-500" : "ri-file-copy-line"}`}></i>
            </button>
            {emailCopied && <span className="text-xs text-teal-500 font-medium">Copié !</span>}
          </div>
        </div>
        <p className="text-xs text-gray-400 whitespace-nowrap">
          {new Date(booking.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-0.5">Cours</p>
          <p className="text-sm font-semibold text-gray-800 leading-tight">{booking.course_type}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-0.5">Date</p>
          <p className="text-sm font-semibold text-gray-800">{booking.preferred_date}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-0.5">Heure</p>
          <p className="text-sm font-semibold text-gray-800">{booking.preferred_time} HKT</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-0.5">Paiement</p>
          <div className="flex items-center gap-1.5">
            {booking.payment_method && (
              <i className={`${methodIcons[booking.payment_method] || "ri-money-dollar-circle-line"} text-gray-600 text-sm`}></i>
            )}
            <p className="text-sm font-semibold text-gray-800 capitalize">{booking.payment_method || "—"}</p>
          </div>
        </div>
      </div>

      {/* Payment reference */}
      {booking.payment_reference && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
          <i className="ri-receipt-line text-yellow-600 text-sm flex-shrink-0"></i>
          <div>
            <span className="text-xs text-yellow-600 font-medium">Référence de transaction : </span>
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
              <><i className="ri-loader-4-line animate-spin"></i>Confirmation...</>
            ) : (
              <><i className="ri-checkbox-circle-line"></i>Approuver &amp; Confirmer</>
            )}
          </button>
          <button
            onClick={() => setShowConfirmCancel(true)}
            disabled={loading !== null}
            className="flex-1 py-2.5 rounded-lg bg-red-50 text-red-500 border border-red-200 text-sm font-medium hover:bg-red-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <i className="ri-close-circle-line"></i>Annuler la réservation
          </button>
        </div>
      )}

      {/* Cancel confirmation */}
      {isPending && showConfirmCancel && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-medium text-red-700 mb-1">Annuler cette réservation ?</p>
          <p className="text-xs text-red-500 mb-3">
            Un e-mail d’annulation sera envoyé à <strong>{booking.student_email}</strong>. Cette action est irréversible.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleAction("cancel")}
              disabled={loading !== null}
              className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              {loading === "cancel" ? (
                <><i className="ri-loader-4-line animate-spin"></i>Annulation...</>
              ) : (
                <>Oui, annuler &amp; notifier l’étudiant</>
              )}
            </button>
            <button
              onClick={() => setShowConfirmCancel(false)}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
            >
              Retour
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
              <><i className="ri-loader-4-line animate-spin"></i>Enregistrement...</>
            ) : (
              <><i className="ri-money-dollar-circle-line"></i>Marquer comme payé</>
            )}
          </button>
        </div>
      )}

      {paidMarked && (
        <div className="flex items-center gap-2 pt-1 text-emerald-600 text-sm">
          <i className="ri-checkbox-circle-fill text-lg"></i>
          <span className="font-medium">Paiement enregistré</span>
        </div>
      )}

      {/* Confirmed state */}
      {booking.status === "confirmed" && (
        <div className="flex items-center gap-2 pt-1 text-teal-600 text-sm">
          <i className="ri-checkbox-circle-fill text-lg"></i>
          <span className="font-medium">Confirmé — Agenda synchronisé &amp; e-mail envoyé</span>
        </div>
      )}

      {/* Cancelled state */}
      {booking.status === "cancelled" && (
        <div className="flex items-center gap-2 pt-1 text-red-400 text-sm">
          <i className="ri-close-circle-fill text-lg"></i>
          <span className="font-medium">Annulé — Étudiant notifié par e-mail</span>
        </div>
      )}
    </div>
  );
}