import { useState, useEffect, useCallback } from "react";
import AdminLogin from "./components/AdminLogin";
import BookingCard from "./components/BookingCard";
import BlogManager from "./components/BlogManager";
import AvailabilityManager from "./components/AvailabilityManager";

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

type FilterTab = "pending_verification" | "confirmed" | "cancelled" | "all" | "blog";

export default function AdminPage() {
  const [adminSecret, setAdminSecret] = useState<string>(() => sessionStorage.getItem("adminSecret") || "");
  const [authError, setAuthError] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("pending_verification");
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;

  const applyQuickRange = (range: "this_week" | "this_month" | "last_month") => {
    const now = new Date();
    if (range === "this_week") {
      const day = now.getDay();
      const mon = new Date(now);
      mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      setDateFrom(mon.toISOString().slice(0, 10));
      setDateTo(sun.toISOString().slice(0, 10));
    } else if (range === "this_month") {
      setDateFrom(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
      setDateTo(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10));
    } else if (range === "last_month") {
      setDateFrom(new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10));
      setDateTo(new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10));
    }
  };

  const clearDateRange = () => {
    setDateFrom("");
    setDateTo("");
  };

  const hasDateFilter = dateFrom || dateTo;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setAuthError("");
    try {
      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error("Missing VITE_PUBLIC_SUPABASE_URL");
      }

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${supabaseUrl}/functions/v1/booking-manage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list", admin_secret: adminSecret, booking_id: "_" }),
        signal: controller.signal,
      }).finally(() => window.clearTimeout(timeoutId));

      console.log("Sending request with admin_secret length:", adminSecret.length);

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        if (res.status === 401) {
          handleInvalidSecret();
          return;
        }
        throw new Error(json?.error || `Failed to load bookings (HTTP ${res.status})`);
      }

      setBookings((json.bookings || []) as Booking[]);
    } catch (e) {
      setBookings([]);
      if (e instanceof DOMException && e.name === "AbortError") {
        setAuthError("Request timed out while loading bookings");
      } else {
        setAuthError(e instanceof Error ? e.message : "Failed to load bookings");
      }
    } finally {
      setLoading(false);
    }
  }, [adminSecret]);

  useEffect(() => {
    if (adminSecret) {
      fetchBookings();
    }
  }, [adminSecret, fetchBookings]);

  const handleLogin = async (secret: string) => {
    if (!supabaseUrl) {
      setAuthError("Missing backend URL. Please configure VITE_PUBLIC_SUPABASE_URL.");
      return;
    }

    setAuthError("");
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${supabaseUrl}/functions/v1/booking-manage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list", admin_secret: secret, booking_id: "_" }),
        signal: controller.signal,
      }).finally(() => window.clearTimeout(timeoutId));

      console.log("Login attempt - sending admin_secret length:", secret.length);

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        if (res.status === 401) {
          setAuthError("Admin secret invalid. Please try again.");
        } else {
          setAuthError(json?.error || `Failed to validate admin secret (HTTP ${res.status})`);
        }
        return;
      }

      sessionStorage.setItem("adminSecret", secret);
      setAdminSecret(secret);
      setAuthError("");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setAuthError("Login request timed out. Please try again.");
      } else {
        setAuthError(error instanceof Error ? error.message : "Failed to validate admin secret.");
      }
    }
  };

  const handleInvalidSecret = () => {
    sessionStorage.removeItem("adminSecret");
    setAdminSecret("");
    setAuthError("Admin secret invalid. Please log in again.");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminSecret");
    setAdminSecret("");
    setBookings([]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: newStatus, payment_status: newStatus === "confirmed" ? "paid" : "cancelled" }
          : b
      )
    );
  };

  if (!adminSecret) {
    return <AdminLogin onLogin={handleLogin} error={authError} />;
  }

  const counts = {
    all: bookings.length,
    pending_verification: bookings.filter((b) => b.status === "pending_verification").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const byStatus = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const byDate = byStatus.filter((b) => {
    const bookingDate = b.preferred_date;
    if (dateFrom && bookingDate < dateFrom) return false;
    if (dateTo && bookingDate > dateTo) return false;
    return true;
  });

  const filtered = search.trim()
    ? byDate.filter((b) => {
        const q = search.toLowerCase();
        return (
          b.student_name.toLowerCase().includes(q) ||
          b.student_email.toLowerCase().includes(q)
        );
      })
    : byDate;

  const tabs: { key: FilterTab; label: string; color: string }[] = [
    { key: "pending_verification", label: "En attente", color: "text-yellow-600" },
    { key: "confirmed", label: "Confirmé", color: "text-teal-600" },
    { key: "cancelled", label: "Annulé", color: "text-red-500" },
    { key: "blog", label: "Blog", color: "text-coral" },
    { key: "all", label: "Tout", color: "text-gray-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-coral flex items-center justify-center">
            <i className="ri-calendar-check-line text-white text-base"></i>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-base leading-tight" style={{ fontFamily: "Candara, 'Nunito', sans-serif" }}>
              Tableau de bord
            </h1>
            <p className="text-xs text-gray-400">Chiu Gor French</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
          >
            <i className={`ri-refresh-line text-base ${refreshing ? "animate-spin" : ""}`}></i>
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <i className="ri-logout-box-r-line"></i>
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {authError && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <i className="ri-error-warning-line text-base mt-0.5"></i>
              <span>{authError}</span>
            </div>
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-all cursor-pointer whitespace-nowrap"
            >
              Réessayer
            </button>
          </div>
        )}

        <AvailabilityManager adminSecret={adminSecret} onUnauthorized={handleInvalidSecret} />

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "En attente", count: counts.pending_verification, icon: "ri-time-line", bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200" },
            { label: "Confirmé", count: counts.confirmed, icon: "ri-checkbox-circle-line", bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200" },
            { label: "Annulé", count: counts.cancelled, icon: "ri-close-circle-line", bg: "bg-red-50", text: "text-red-500", border: "border-red-200" },
            { label: "Total", count: counts.all, icon: "ri-file-list-3-line", bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-xl p-4`}>
              <div className={`w-8 h-8 flex items-center justify-center mb-2`}>
                <i className={`${stat.icon} ${stat.text} text-xl`}></i>
              </div>
              <p className={`text-2xl font-bold ${stat.text}`}>{stat.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Date range filter */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <i className="ri-calendar-line text-gray-400 text-sm"></i>
              </div>
              <span className="text-sm text-gray-500 whitespace-nowrap">Date du cours :</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 min-w-0 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer"
              />
              <span className="text-gray-400 text-sm">—</span>
              <input
                type="date"
                value={dateTo}
                min={dateFrom}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 min-w-0 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(["this_week", "this_month", "last_month"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => applyQuickRange(r)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer whitespace-nowrap"
                >
                  {r === "this_week" ? "Cette semaine" : r === "this_month" ? "Ce mois-ci" : "Mois dernier"}
                </button>
              ))}
              {hasDateFilter && (
                <button
                  onClick={clearDateRange}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs text-gray-500 hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                >
                  <i className="ri-close-line"></i>Effacer
                </button>
              )}
            </div>
          </div>
          {hasDateFilter && (
            <p className="text-xs text-gray-400 mt-2 ml-7">
              Cours affichés {dateFrom && `du ${dateFrom}`}{dateFrom && dateTo && " "}{dateTo && `au ${dateTo}`}
            </p>
          )}
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-3 w-5 h-full flex items-center justify-center pointer-events-none">
            <i className="ri-search-line text-gray-400 text-sm"></i>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou e-mail..."
            className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-3 w-5 h-full flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <i className="ri-close-line text-sm"></i>
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                filter === tab.key
                  ? "bg-gray-800 text-white"
                  : `${tab.color} hover:bg-gray-50`
              }`}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  filter === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bookings list or Blog Manager */}
        {filter === "blog" ? (
          <BlogManager adminSecret={adminSecret} />
        ) : loading ? (
          <div className="text-center py-16">
            <i className="ri-loader-4-line animate-spin text-3xl text-gray-300 mb-3"></i>
            <p className="text-gray-400 text-sm">Chargement des réservations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <i className="ri-inbox-line text-4xl text-gray-200 mb-3"></i>
            <p className="text-gray-400 text-sm">
              {search.trim() ? `Aucun résultat pour « ${search} »` : `Aucune réservation${filter === "pending_verification" ? " en attente" : filter === "confirmed" ? " confirmée" : filter === "cancelée" ? " annulée" : ""}`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AvailabilityManager adminSecret={adminSecret} onUnauthorized={handleInvalidSecret} />
            {filtered.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                adminSecret={adminSecret}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}