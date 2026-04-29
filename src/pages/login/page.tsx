import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/pages/home/components/Navbar';
import Footer from '@/pages/home/components/Footer';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showUrlWarning, setShowUrlWarning] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { isDark, toggle } = useDarkMode();

  const fontFamily = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";

  const from = (location.state as any)?.from || '/blog';

  // Check if using 127.0.0.1 and show warning
  useEffect(() => {
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === '::1') {
      setShowUrlWarning(true);
    }
  }, []);

  // Normalize localhost URLs to ensure consistent OAuth redirect
  const getNormalizedOrigin = () => {
    const envUrl = import.meta.env.VITE_PUBLIC_SITE_URL;
    if (envUrl) return envUrl;

    const origin = window.location.origin;
    // Normalize 127.0.0.1 or other localhost variants to localhost
    if (origin.includes('127.0.0.1') || origin.match(/:\/\/\[?::1\]?/)) {
      return origin.replace(/127\.0\.0\.1|\[?::1\]?/, 'localhost');
    }
    return origin;
  };

  const redirectTo = `${getNormalizedOrigin()}${__IS_PREVIEW__ ? '/#' : ''}/login`;

  useEffect(() => {
    void (async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      if (code) {
        setLoading(true);
        // Normalize URL for code exchange (127.0.0.1 -> localhost)
        const currentUrl = window.location.href;
        const normalizedUrl = currentUrl.replace(/127\.0\.0\.1|\[?::1\]?/, 'localhost');
        const { error } = await supabase.auth.exchangeCodeForSession(normalizedUrl);
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
        if (error) {
          alert(error.message);
          setLoading(false);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    })();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN' && session) {
        navigate(from);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [from, navigate]);

  async function signInWithProvider(provider: 'google' | 'facebook') {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });
    if (error) {
      alert(error.message);
      setLoading(false);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: username.trim() || undefined,
            },
          },
        });
        if (error) throw error;
        alert(t('login_signup_success'));
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : t('login_auth_failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#FDFBF9] dark:bg-[#0E0818]">
      <Navbar isDark={isDark} onToggleDark={toggle} />

      <div className="pt-24 pb-20">
      <div className="max-w-xl mx-auto px-4">
        <Link
          to={from}
          className="inline-flex items-center gap-2 text-[#7A7068] dark:text-[#B89FD8] hover:text-coral transition-colors mb-8 font-semibold text-sm"
        >
          <i className="ri-arrow-left-line"></i>
          {t('login_back')}
        </Link>

        {showUrlWarning && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl">
            <p className="text-amber-800 dark:text-amber-200 text-sm font-medium" style={{ fontFamily }}>
              <i className="ri-alert-line mr-2"></i>
              For OAuth login to work, please use <code className="bg-amber-100 dark:bg-amber-800 px-1 py-0.5 rounded">localhost:5173</code> instead of <code className="bg-amber-100 dark:bg-amber-800 px-1 py-0.5 rounded">127.0.0.1:5173</code>
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-[#1E0D38] rounded-3xl border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 p-8">
          <h1 className="text-3xl font-extrabold text-[#1A1410] dark:text-[#E8E0F5] mb-2" style={{ fontFamily }}>
            {t('login_title')}
          </h1>
          <p className="text-[#7A7068] dark:text-[#C4A8E8] mb-8" style={{ fontFamily }}>
            {t('login_subtitle')}
          </p>

          {user ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#F0EBE3] dark:bg-[#130A22] p-4 border border-[#D4C8BC]/60 dark:border-[#3B2060]/60">
                <p className="text-sm text-[#4A4440] dark:text-[#C4A8E8]" style={{ fontFamily }}>
                  {t('login_logged_in_as')}
                </p>
                <p className="text-sm font-bold text-[#1A1410] dark:text-[#E8E0F5]" style={{ fontFamily }}>
                  {user.email || user.id}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate(from)}
                  className="flex-1 px-6 py-3 rounded-2xl bg-coral text-white font-bold text-sm hover:opacity-90 transition-all"
                  style={{ fontFamily }}
                  disabled={loading}
                >
                  {t('login_continue')}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-6 py-3 rounded-2xl bg-white dark:bg-[#130A22] text-[#7A7068] dark:text-[#C4A8E8] border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 font-bold text-sm hover:bg-[#F0EBE3] dark:hover:bg-[#1A0A2E] transition-all"
                  style={{ fontFamily }}
                  disabled={loading}
                >
                  {t('login_logout')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div className="flex items-center gap-1 bg-[#F0EBE3] dark:bg-[#130A22] border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 rounded-2xl p-1 w-fit">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      mode === 'login' ? 'bg-white dark:bg-[#1E0D38] text-[#1A1410] dark:text-[#E8E0F5] shadow-sm' : 'text-[#7A7068] dark:text-[#C4A8E8]'
                    }`}
                    style={{ fontFamily }}
                  >
                    {t('login_tab_login')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      mode === 'signup' ? 'bg-white dark:bg-[#1E0D38] text-[#1A1410] dark:text-[#E8E0F5] shadow-sm' : 'text-[#7A7068] dark:text-[#C4A8E8]'
                    }`}
                    style={{ fontFamily }}
                  >
                    {t('login_tab_signup')}
                  </button>
                </div>

                {mode === 'signup' && (
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('login_username_optional')}
                    className="w-full px-4 py-3 rounded-2xl border border-[#D4C8BC]/80 dark:border-[#3B2060]/50 bg-white dark:bg-[#130A22] text-[#1A1410] dark:text-[#E8E0F5] text-sm focus:outline-none focus:border-coral transition-colors duration-200"
                    style={{ fontFamily }}
                    autoComplete="nickname"
                  />
                )}

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login_email')}
                  type="email"
                  className="w-full px-4 py-3 rounded-2xl border border-[#D4C8BC]/80 dark:border-[#3B2060]/50 bg-white dark:bg-[#130A22] text-[#1A1410] dark:text-[#E8E0F5] text-sm focus:outline-none focus:border-coral transition-colors duration-200"
                  style={{ fontFamily }}
                  autoComplete="email"
                />

                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login_password')}
                  type="password"
                  className="w-full px-4 py-3 rounded-2xl border border-[#D4C8BC]/80 dark:border-[#3B2060]/50 bg-white dark:bg-[#130A22] text-[#1A1410] dark:text-[#E8E0F5] text-sm focus:outline-none focus:border-coral transition-colors duration-200"
                  style={{ fontFamily }}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />

                <button
                  type="submit"
                  disabled={loading || !email.trim() || !password}
                  className="w-full px-6 py-3 rounded-2xl bg-coral text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                  style={{ fontFamily }}
                >
                  {loading
                    ? t('login_please_wait')
                    : mode === 'signup'
                      ? t('login_create_account')
                      : t('login_submit_login')}
                </button>
              </form>

              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-[#D4C8BC]/60 dark:bg-[#3B2060]/60"></div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#7A7068] dark:text-[#C4A8E8]" style={{ fontFamily }}>
                  {t('login_or')}
                </span>
                <div className="flex-1 h-px bg-[#D4C8BC]/60 dark:bg-[#3B2060]/60"></div>
              </div>

              <button
                onClick={() => signInWithProvider('google')}
                disabled={loading}
                className="w-full px-6 py-3 rounded-2xl bg-white border border-[#D4C8BC]/70 text-[#1A1410] font-bold text-sm hover:bg-[#F6F2ED] transition-all flex items-center justify-center gap-3 shadow-sm"
                style={{ fontFamily }}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.69 1.22 9.2 3.6l6.9-6.9C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.03 6.24C12.5 13.58 17.77 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.5 24.5c0-1.64-.15-3.21-.43-4.72H24v9.02h12.64c-.54 2.93-2.2 5.41-4.69 7.07l7.25 5.62c4.23-3.9 7.3-9.64 7.3-17z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.59 28.54A14.5 14.5 0 0 1 9.5 24c0-1.57.28-3.09.78-4.46l-8.03-6.24A24 24 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l8.03-6.24z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.47 0 11.9-2.13 15.87-5.8l-7.25-5.62c-2.01 1.35-4.6 2.14-8.62 2.14-6.23 0-11.5-4.08-13.41-9.76l-8.03 6.24C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                </span>
                {t('login_continue_google')}
              </button>

              <button
                onClick={() => signInWithProvider('facebook')}
                disabled={loading}
                className="w-full px-6 py-3 rounded-2xl bg-[#1877F2] text-white font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                style={{ fontFamily }}
              >
                <i className="ri-facebook-fill text-lg"></i>
                {t('login_continue_facebook')}
              </button>
            </div>
          )}
        </div>
      </div>

      </div>

      <Footer />
    </div>
  );
}
