import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/pages/home/components/Navbar';
import Footer from '@/pages/home/components/Footer';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useTranslation } from 'react-i18next';
import { tokens } from '@/design-system/tokens';
import {
  AvailabilityConfig,
  defaultAvailabilityConfig,
  getAvailableTimeSlotsForDate,
  isDateBlocked,
  isWeekdayEnabled,
  loadAvailabilityConfig,
} from '@/lib/availability';
import { lessonTypes } from '@/mocks/booking';

interface Booking {
  id: string;
  course_type: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  payment_status: string;
  created_at: string;
  edit_request?: any;
}

export default function MyBookings() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDark, toggle } = useDarkMode();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [availabilityConfig, setAvailabilityConfig] = useState<AvailabilityConfig>(defaultAvailabilityConfig);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    // Load local config first
    const localConfig = loadAvailabilityConfig();
    setAvailabilityConfig(localConfig);

    // Load from server
    const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      fetch(`${supabaseUrl}/functions/v1/booking-manage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_availability" }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data.availability) {
            setAvailabilityConfig(data.availability);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login', { state: { from: '/my-bookings' } });
        return;
      }
      setUser(data.session.user);
      fetchBookings(data.session.user.id);
    }
    getSession();
  }, [navigate]);

  async function fetchBookings(userId: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  }

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const availableTimeSlots = newDate
    ? getAvailableTimeSlotsForDate(newDate, availabilityConfig)
    : [];

  useEffect(() => {
    if (newDate) {
      if (!isWeekdayEnabled(newDate, availabilityConfig)) {
        setDateError(t('booking_error_date') + ". Please choose an available weekday.");
        setNewTime('');
      } else if (isDateBlocked(newDate, availabilityConfig)) {
        setDateError(t('booking_error_date') + ". This date is blocked.");
        setNewTime('');
      } else {
        setDateError(null);
      }
    }
  }, [newDate, availabilityConfig, t]);

  async function handleEditSubmit() {
    if (!editingBooking || !newDate || !newTime || dateError) return;
    setEditLoading(true);
    try {
      const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
      
      const res = await fetch(`${supabaseUrl}/functions/v1/booking-manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          action: 'student_edit',
          booking_id: editingBooking.id,
          edit_data: {
            preferred_date: newDate,
            preferred_time: newTime,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(t('my_bookings_submit_success', 'Your change request has been submitted and is pending approval.'));
        setEditingBooking(null);
        fetchBookings(user.id);
      } else {
        alert(data.error || 'Failed to submit change request');
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setEditLoading(false);
    }
  }

  const statusColors: any = {
    pending_verification: 'bg-yellow-100 text-yellow-700',
    pending_reapproval: 'bg-orange-100 text-orange-700',
    confirmed: 'bg-teal-100 text-teal-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const getLessonTitle = (courseType: string) => {
    const lesson = lessonTypes.find(l => l.id === courseType || l.title === courseType);
    if (!lesson) return courseType;
    if (i18n.language === 'zh-HK') return lesson.titleZh;
    if (i18n.language === 'fr') return lesson.titleFr;
    return lesson.title;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF9] dark:bg-[#0E0818]">
      <Navbar isDark={isDark} onToggleDark={toggle} />

      <div className="flex-1 pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-[#1A1410] dark:text-[#E8E0F5] mb-2" style={{ fontFamily: tokens.typography.fontFamily }}>
            {t('my_bookings_title')}
          </h1>
          <p className="text-[#7A7068] dark:text-[#B89FD8] mb-10 font-medium">
            {t('my_bookings_subtitle')}
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-coral border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[#7A7068] dark:text-[#B89FD8] font-bold animate-pulse">{t('my_bookings_loading')}</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white dark:bg-[#1E0D38] rounded-3xl p-12 text-center border border-[#D4C8BC]/40 dark:border-[#3B2060]/40">
              <div className="w-20 h-20 bg-[#F0EBE3] dark:bg-[#130A22] rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-calendar-event-line text-4xl text-[#D4C8BC] dark:text-[#3B2060]"></i>
              </div>
              <h3 className="text-xl font-bold text-[#1A1410] dark:text-[#E8E0F5] mb-2">{t('my_bookings_no_bookings')}</h3>
              <p className="text-[#7A7068] dark:text-[#B89FD8] mb-8">{t('my_bookings_no_bookings_desc')}</p>
              <button
                onClick={() => navigate('/booking')}
                className="px-8 py-4 bg-coral text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-coral/20"
              >
                {t('my_bookings_book_first')}
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white dark:bg-[#1E0D38] rounded-3xl p-6 sm:p-8 border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-black text-[#1A1410] dark:text-[#E8E0F5]">
                          {getLessonTitle(booking.course_type)}
                        </h3>
                        <span className={`text-xs px-3 py-1 rounded-lg font-black uppercase tracking-widest ${statusColors[booking.status] || 'bg-gray-100'}`}>
                          {t(`status_${booking.status}`)}
                        </span>
                      </div>
                      <p className="text-[#7A7068] dark:text-[#B89FD8] text-sm font-medium">
                        {t('my_bookings_booked_on', { date: new Date(booking.created_at).toLocaleDateString() })}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xl font-black text-coral">{booking.preferred_date}</p>
                      <p className="text-sm font-bold text-[#1A1410] dark:text-[#E8E0F5] uppercase tracking-widest">
                        {booking.preferred_time} HKT
                      </p>
                    </div>
                  </div>

                  {booking.edit_request && (
                    <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 rounded-2xl">
                      <p className="text-xs font-black text-orange-800 dark:text-orange-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <i className="ri-history-line"></i> {t('my_bookings_change_pending')}
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-400">
                        {t('my_bookings_requested_change', { date: booking.edit_request.preferred_date, time: booking.edit_request.preferred_time })}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {booking.status !== 'cancelled' && !booking.edit_request && (
                      <button
                        onClick={() => {
                          setEditingBooking(booking);
                          setNewDate(booking.preferred_date);
                          setNewTime(booking.preferred_time);
                        }}
                        className="px-6 py-2.5 bg-[#F0EBE3] dark:bg-[#130A22] text-[#1A1410] dark:text-[#E8E0F5] rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-[#D4C8BC]/20 transition-all border border-[#D4C8BC]/20 flex items-center gap-2"
                      >
                        <i className="ri-edit-line"></i> {t('my_bookings_edit_time')}
                      </button>
                    )}
                    <button
                      className="px-6 py-3 text-[#7A7068] dark:text-[#B89FD8] font-bold text-xs uppercase tracking-widest hover:text-coral transition-all"
                    >
                      {t('my_bookings_view_details')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E0D38] rounded-[2.5rem] p-8 max-md w-full shadow-2xl border border-[#D4C8BC]/40 dark:border-[#3B2060]/40">
            <h3 className="text-2xl font-black text-[#1A1410] dark:text-[#E8E0F5] mb-2">{t('my_bookings_request_title')}</h3>
            <p className="text-[#7A7068] dark:text-[#B89FD8] mb-8 text-sm">
              {t('my_bookings_request_desc')}
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-black text-[#7A7068] dark:text-[#B89FD8] uppercase tracking-widest mb-2 ml-1">
                  {t('my_bookings_new_date')}
                </label>
                <input
                  type="date"
                  value={newDate}
                  min={today}
                  max={maxDate}
                  onChange={(e) => {
                    setNewDate(e.target.value);
                    setNewTime('');
                  }}
                  className="w-full px-5 py-4 bg-[#F0EBE3] dark:bg-[#130A22] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 rounded-2xl text-[#1A1410] dark:text-[#E8E0F5] font-bold focus:outline-none focus:border-coral transition-all"
                />
                {dateError && <p className="text-coral text-xs mt-2 font-bold uppercase tracking-wider">{dateError}</p>}
              </div>

              <div>
                <label className="block text-xs font-black text-[#7A7068] dark:text-[#B89FD8] uppercase tracking-widest mb-3 ml-1">
                  {t('my_bookings_new_time')}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map((slot) => (
                      <button
                        key={slot.start}
                        onClick={() => setNewTime(slot.start)}
                        className={`py-3 px-2 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                          newTime === slot.start
                            ? "border-coral bg-coral text-white"
                            : "border-[#D4C8BC]/40 dark:border-[#3B2060]/40 text-[#1A1410] dark:text-[#E8E0F5] hover:border-coral/50"
                        }`}
                      >
                        {slot.start}
                      </button>
                    ))
                  ) : (
                    <p className="col-span-full text-xs font-bold text-coral uppercase tracking-widest bg-coral/5 p-4 rounded-2xl border border-coral/20">
                      {newDate ? "No slots available for this date." : "Select a date first."}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleEditSubmit}
                disabled={editLoading || !newDate || !newTime || !!dateError}
                variant="primary"
                className="w-full !py-4 !rounded-2xl shadow-xl shadow-coral/20"
              >
                {editLoading ? <i className="ri-loader-4-line animate-spin"></i> : t('my_bookings_submit_request')}
              </Button>
              <Button
                onClick={() => setEditingBooking(null)}
                variant="ghost"
                className="w-full !py-4 !rounded-2xl"
              >
                {t('admin_blog_cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
