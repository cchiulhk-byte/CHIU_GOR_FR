import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import AdminLogin from "./components/AdminLogin";
import BookingCard from "./components/BookingCard";
import BlogManager from "./components/BlogManager";
import AvailabilityManager from "./components/AvailabilityManager";
import { useLogout } from "@/components/feature/LogoutProvider";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Card } from "@/design-system/atoms/Card";
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
  is_archived: boolean;
  edit_request?: {
    preferred_date: string;
    preferred_time: string;
    course_type?: string;
  };
}

type FilterTab = "pending_verification" | "confirmed" | "cancelled" | "all" | "blog";

export default function AdminPage() {
  const { t, i18n } = useTranslation();
  const [adminSecret, setAdminSecret] = useState<string>(() => sessionStorage.getItem("adminSecret") || "");
  const [authError, setAuthError] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("pending_verification");
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const { confirmLogout, isLoggingOut } = useLogout();
  const { isDark, toggle: toggleDark } = useDarkMode();
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

      const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/booking-manage`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseAnonKey}` },
        body: JSON.stringify({ action: "list", admin_secret: adminSecret, booking_id: "_" }),
        signal: controller.signal,
      }).finally(() => window.clearTimeout(timeoutId));

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
        setAuthError(t("admin_error_timeout"));
      } else {
        setAuthError(e instanceof Error ? e.message : t("admin_error_generic"));
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
      setAuthError(t("admin_error_missing_url"));
      return;
    }

    setAuthError("");
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 10000);

      const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/booking-manage`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseAnonKey}` },
        body: JSON.stringify({ action: "list", admin_secret: secret, booking_id: "_" }),
        signal: controller.signal,
      }).finally(() => window.clearTimeout(timeoutId));

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        if (res.status === 401) {
          setAuthError(t("admin_login_error_invalid"));
        } else {
          setAuthError(json?.error || t("admin_login_error_generic"));
        }
        return;
      }

      sessionStorage.setItem("adminSecret", secret);
      setAdminSecret(secret);
      setAuthError("");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setAuthError(t("admin_login_timeout"));
      } else {
        setAuthError(error instanceof Error ? error.message : t("admin_login_error_generic"));
      }
    }
  };

  const handleInvalidSecret = () => {
    sessionStorage.removeItem("adminSecret");
    setAdminSecret("");
    setAuthError(t("admin_login_error_invalid"));
  };

  const handleLogout = () => {
    confirmLogout();
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
          ? { ...b, status: newStatus, payment_status: (newStatus === "confirmed" || newStatus === "pending_reapproval") ? "paid" : "cancelled" }
          : b
      )
    );
  };

  const handleArchiveChange = (id: string, isArchived: boolean) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, is_archived: isArchived } : b))
    );
  };

  const handleDelete = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  if (!adminSecret) {
    return <AdminLogin onLogin={handleLogin} error={authError} />;
  }

  const counts = {
    all: bookings.filter(b => !b.is_archived).length,
    pending_verification: bookings.filter((b) => b.status === "pending_verification" && !b.is_archived).length,
    pending_reapproval: bookings.filter((b) => b.status === "pending_reapproval" && !b.is_archived).length,
    confirmed: bookings.filter((b) => b.status === "confirmed" && !b.is_archived).length,
    cancelled: bookings.filter((b) => b.status === "cancelled" && !b.is_archived).length,
    archived: bookings.filter((b) => b.is_archived).length,
    blog: 0,
  };

  const tabs: { key: FilterTab; label: string; color: string; bgColor: string }[] = [
    { key: "pending_verification", label: t("admin_tab_pending"), color: "text-yellow-600", bgColor: "bg-yellow-50" },
    { key: "pending_reapproval", label: t("admin_tab_reapproval"), color: "text-orange-600", bgColor: "bg-orange-50" },
    { key: "confirmed", label: t("admin_tab_confirmed"), color: "text-teal-600", bgColor: "bg-teal-50" },
    { key: "cancelled", label: t("admin_tab_cancelled"), color: "text-red-600", bgColor: "bg-red-50" },
    { key: "blog", label: t("admin_tab_blog"), color: "text-coral", bgColor: "bg-coral/5" },
    { key: "all", label: t("admin_tab_all"), color: "text-gray-600", bgColor: "bg-gray-50" },
  ];

  const baseBookings = showArchived ? bookings.filter(b => b.is_archived) : bookings.filter(b => !b.is_archived);
  const byStatus = filter === "all" ? baseBookings : baseBookings.filter((b) => b.status === filter);
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

  if (isLoggingOut) return null;

  return (
    <div className={`min-h-screen overflow-x-hidden ${isDark ? 'dark bg-[#0E0818]' : 'bg-[#F7F4EF]'}`}>
      <div className="bg-white/80 dark:bg-[#1E0D38]/80 backdrop-blur-md border-b border-[#D4C8BC]/40 dark:border-[#3B2060]/40 px-3 sm:px-4 md:px-8 py-3 sm:py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white dark:bg-[#2D1B4E] p-0.5 sm:p-1 shadow-lg border border-[#D4C8BC]/20 dark:border-[#3B2060]/20 flex-shrink-0">
              <img 
                src="https://static.readdy.ai/image/c3c070ed3a92273f043678549554b0d6/e3451f52961636b2aea237770c224254.png"
                alt="Admin Icon"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-[#1A1410] dark:text-[#E8E0F5] text-sm sm:text-lg leading-tight tracking-tight truncate" style={{ fontFamily: tokens.typography.fontFamily }}>
                {t("admin_dashboard")}
              </h1>
              <p className="text-xs text-[#7A7068] dark:text-[#B89FD8] font-black uppercase tracking-[0.2em] mt-0.5 hidden sm:block">Chiu Gor French</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="!w-9 !h-9 sm:!w-10 sm:!h-10 !p-0 !rounded-xl !bg-white/40 dark:!bg-[#2D1B4E]/40 !text-[#7A7068] dark:!text-[#B89FD8]"
            >
              <i className="ri-home-4-line text-base sm:text-lg"></i>
            </Button>

            <Button
              variant="ghost"
              onClick={toggleDark}
              className="!w-9 !h-9 sm:!w-10 sm:!h-10 !p-0 !rounded-xl !bg-white/40 dark:!bg-[#2D1B4E]/40 !text-[#7A7068] dark:!text-[#B89FD8]"
            >
              <i className={isDark ? 'ri-sun-line text-base sm:text-lg' : 'ri-moon-line text-base sm:text-lg'}></i>
            </Button>

            <div className="flex bg-gray-100/50 dark:bg-[#2D1B4E]/50 p-1 rounded-xl backdrop-blur-sm">
              {[
                { code: "fr", label: "FR" },
                { code: "en", label: "EN" },
                { code: "zh-HK", label: "中文" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    i18n.language === lang.code
                      ? 'bg-white dark:bg-coral text-coral dark:text-white shadow-sm'
                      : 'text-[#7A7068] dark:text-[#B89FD8] hover:text-[#1A1410] dark:hover:text-[#E8E0F5]'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="!w-9 !h-9 sm:!w-10 sm:!h-10 !p-0 !rounded-xl !bg-red-600 hover:!bg-red-700 !text-white"
            >
              <i className="ri-logout-box-line text-base sm:text-lg"></i>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-8 py-6 sm:py-8 overflow-x-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowArchived(false)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!showArchived ? 'bg-[#1A1410] dark:bg-coral text-white' : 'text-[#7A7068] dark:text-[#B89FD8]'}`}
            >
              {t("admin_booking_active")}
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${showArchived ? 'bg-[#1A1410] dark:bg-coral text-white' : 'text-[#7A7068] dark:text-[#B89FD8]'}`}
            >
              {t("admin_booking_archived")}
              {counts.archived > 0 && <span className="px-1.5 py-0.5 rounded-lg bg-gray-500/20 text-xs">{counts.archived}</span>}
            </button>
          </div>
        </div>
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
              {t("admin_refresh")}
            </button>
          </div>
        )}

        <AvailabilityManager adminSecret={adminSecret} onUnauthorized={handleInvalidSecret} />

        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 mb-10">
          {[
            { label: t("admin_tab_pending"), count: counts.pending_verification, icon: "ri-time-line", bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-500/20" },
            { label: t("admin_tab_confirmed"), count: counts.confirmed, icon: "ri-checkbox-circle-line", bg: "bg-teal-500/10", text: "text-teal-600 dark:text-teal-400", border: "border-teal-500/20" },
            { label: t("admin_tab_cancelled"), count: counts.cancelled, icon: "ri-close-circle-line", bg: "bg-red-500/10", text: "text-red-500 dark:text-red-400", border: "border-red-500/20" },
            { label: t("admin_tab_all"), count: counts.all, icon: "ri-file-list-3-line", bg: "bg-coral/10", text: "text-coral", border: "border-coral/20" },
          ].map((stat) => (
            <Card key={stat.label} className="!bg-white dark:!bg-[#1E0D38] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 p-3 sm:p-6 flex flex-col items-center text-center !rounded-2xl sm:!rounded-[2.5rem] shadow-sm hover:shadow-lg transition-all">
              <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${stat.bg} flex items-center justify-center mb-2 sm:mb-4`}>
                <i className={`${stat.icon} ${stat.text} text-xl sm:text-2xl`}></i>
              </div>
              <p className={`text-2xl sm:text-4xl font-black ${stat.text}`} style={{ fontFamily: tokens.typography.fontFamilyEn }}>{stat.count}</p>
              <p className="text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#7A7068] dark:text-[#B89FD8] mt-1 sm:mt-2">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Date range filter */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8 !rounded-2xl sm:!rounded-[2.5rem] !bg-white dark:!bg-[#1E0D38] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-[#F7F4EF] dark:bg-[#0E0818] rounded-xl text-coral">
                <i className="ri-calendar-line text-lg"></i>
              </div>
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="flex-1 min-w-0 px-2 sm:px-3 py-2 bg-[#F7F4EF] dark:bg-[#0E0818] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 rounded-xl text-xs sm:text-sm text-[#1A1410] dark:text-[#E8E0F5] focus:outline-none focus:border-coral transition-all"
                />
                <span className="text-[#7A7068] dark:text-[#B89FD8] text-sm flex-shrink-0">—</span>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="flex-1 min-w-0 px-2 sm:px-3 py-2 bg-[#F7F4EF] dark:bg-[#0E0818] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 rounded-xl text-xs sm:text-sm text-[#1A1410] dark:text-[#E8E0F5] focus:outline-none focus:border-coral transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(["this_week", "this_month", "last_month"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => applyQuickRange(r)}
                  className="px-3 py-2 text-sm rounded-xl border border-[#D4C8BC]/20 dark:border-[#3B2060]/20 text-[#7A7068] dark:text-[#B89FD8] hover:bg-white dark:hover:bg-[#2D1B4E] transition-all"
                >
                  {r === "this_week" ? t("admin_filter_this_week") : r === "this_month" ? t("admin_filter_this_month") : t("admin_filter_last_month")}
                </button>
              ))}
              {hasDateFilter && (
                <Button
                  variant="outline"
                  onClick={clearDateRange}
                  className="!px-3 !py-2 !text-xs sm:!text-sm !rounded-xl flex items-center gap-1"
                >
                  <i className="ri-close-line"></i>{t("admin_filter_clear")}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Search bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-5 w-5 h-full flex items-center justify-center pointer-events-none">
            <i className="ri-search-line text-[#7A7068] dark:text-[#B89FD8] text-lg"></i>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin_search_placeholder", "Search students...")}
            className="w-full pl-14 pr-14 py-4 bg-[#F7F4EF] dark:bg-[#0E0818] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 rounded-full text-base text-[#1A1410] dark:text-[#E8E0F5] placeholder-[#7A7068]/50 dark:placeholder-[#B89FD8]/50 focus:outline-none focus:border-coral transition-all font-bold shadow-inner"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-5 w-10 h-full flex items-center justify-center text-[#7A7068] dark:text-[#B89FD8] hover:text-coral transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-[#F7F4EF]/50 dark:bg-[#0E0818]/40 border border-[#D4C8BC]/20 dark:border-[#3B2060]/20 rounded-2xl p-1.5 mb-6 sm:mb-8 overflow-x-auto max-w-full no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider sm:tracking-widest transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 sm:gap-2 ${
                filter === tab.key
                  ? tab.key === "cancelled" 
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                    : "bg-[#1A1410] dark:bg-coral text-white shadow-lg shadow-coral/20"
                  : `${tab.color} hover:bg-[#F7F4EF] dark:hover:bg-[#2D1B4E]`
              }`}
            >
              {tab.label}
              {counts[tab.key as keyof typeof counts] > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-lg ${
                  filter === tab.key ? "bg-white/20 text-white" : `${tab.bgColor} ${tab.color}`
                }`}>
                  {counts[tab.key as keyof typeof counts]}
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
            <p className="text-gray-400 text-sm">{t("blog_loading")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-[#F7F4EF]/30 dark:bg-[#0E0818]/20 rounded-[2.5rem] border border-dashed border-[#D4C8BC]/40 dark:border-[#3B2060]/40">
            <div className="w-20 h-20 bg-[#F7F4EF] dark:bg-[#1E0D38] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <i className="ri-calendar-todo-line text-4xl text-[#D4C8BC] dark:text-[#3B2060]"></i>
            </div>
            <p className="text-[#7A7068] dark:text-[#B89FD8] font-bold text-base px-6">
              {search.trim() ? `${t("admin_search_placeholder")} « ${search} »` : t("my_bookings_no_bookings")}
            </p>
            <p className="text-xs text-[#7A7068]/60 dark:text-[#B89FD8]/60 mt-2">{t("admin_filter_clear_hint", "Try clearing your filters or search terms")}</p>
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
                onArchiveChange={handleArchiveChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}