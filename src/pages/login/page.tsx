import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Navbar from '@/pages/home/components/Navbar';
import Footer from '@/pages/home/components/Footer';
import { useDarkMode } from '@/hooks/useDarkMode';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { isDark, toggle } = useDarkMode();

  const fontFamily = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";

  const redirectTo = `${window.location.origin}${__IS_PREVIEW__ ? '/#' : ''}/login`;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const from = (location.state as any)?.from || '/blog';

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
        alert('Account created. Please check your email to confirm your account if required.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Authentication failed');
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
          Back
        </Link>

        <div className="bg-white dark:bg-[#1E0D38] rounded-3xl border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 p-8">
          <h1 className="text-3xl font-extrabold text-[#1A1410] dark:text-[#E8E0F5] mb-2" style={{ fontFamily }}>
            Log in
          </h1>
          <p className="text-[#7A7068] dark:text-[#C4A8E8] mb-8" style={{ fontFamily }}>
            Log in to like and comment on blog posts.
          </p>

          {user ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#F0EBE3] dark:bg-[#130A22] p-4 border border-[#D4C8BC]/60 dark:border-[#3B2060]/60">
                <p className="text-sm text-[#4A4440] dark:text-[#C4A8E8]" style={{ fontFamily }}>
                  Logged in as
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
                  Continue
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-6 py-3 rounded-2xl bg-white dark:bg-[#130A22] text-[#7A7068] dark:text-[#C4A8E8] border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 font-bold text-sm hover:bg-[#F0EBE3] dark:hover:bg-[#1A0A2E] transition-all"
                  style={{ fontFamily }}
                  disabled={loading}
                >
                  Log out
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
                    Log in
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      mode === 'signup' ? 'bg-white dark:bg-[#1E0D38] text-[#1A1410] dark:text-[#E8E0F5] shadow-sm' : 'text-[#7A7068] dark:text-[#C4A8E8]'
                    }`}
                    style={{ fontFamily }}
                  >
                    Sign up
                  </button>
                </div>

                {mode === 'signup' && (
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username (optional)"
                    className="w-full px-4 py-3 rounded-2xl border border-[#D4C8BC]/80 dark:border-[#3B2060]/50 bg-white dark:bg-[#130A22] text-[#1A1410] dark:text-[#E8E0F5] text-sm focus:outline-none focus:border-coral transition-colors duration-200"
                    style={{ fontFamily }}
                    autoComplete="nickname"
                  />
                )}

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                  className="w-full px-4 py-3 rounded-2xl border border-[#D4C8BC]/80 dark:border-[#3B2060]/50 bg-white dark:bg-[#130A22] text-[#1A1410] dark:text-[#E8E0F5] text-sm focus:outline-none focus:border-coral transition-colors duration-200"
                  style={{ fontFamily }}
                  autoComplete="email"
                />

                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
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
                  {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Log in'}
                </button>
              </form>

              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-[#D4C8BC]/60 dark:bg-[#3B2060]/60"></div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#7A7068] dark:text-[#C4A8E8]" style={{ fontFamily }}>
                  or
                </span>
                <div className="flex-1 h-px bg-[#D4C8BC]/60 dark:bg-[#3B2060]/60"></div>
              </div>

              <button
                onClick={() => signInWithProvider('google')}
                disabled={loading}
                className="w-full px-6 py-3 rounded-2xl bg-white dark:bg-[#130A22] border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 text-[#1A1410] dark:text-[#E8E0F5] font-bold text-sm hover:bg-[#F0EBE3] dark:hover:bg-[#1A0A2E] transition-all flex items-center justify-center gap-2"
                style={{ fontFamily }}
              >
                <i className="ri-google-fill text-lg"></i>
                Continue with Google
              </button>

              <button
                onClick={() => signInWithProvider('facebook')}
                disabled={loading}
                className="w-full px-6 py-3 rounded-2xl bg-[#1877F2] text-white font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                style={{ fontFamily }}
              >
                <i className="ri-facebook-fill text-lg"></i>
                Continue with Facebook
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
