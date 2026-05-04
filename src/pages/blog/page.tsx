import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BlogCard from './components/BlogCard';
import Navbar from '@/pages/home/components/Navbar';
import Footer from '@/pages/home/components/Footer';
import { useDarkMode } from '@/hooks/useDarkMode';

import { tokens } from '@/design-system/tokens';
import { Card } from '@/design-system/atoms/Card';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  published_at: string;
  view_count: number;
}

export default function BlogPage() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDark, toggle } = useDarkMode();

  const fontFamily = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (loading) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(timer);
            return 90;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(timer);
    } else {
      setProgress(100);
    }
  }, [loading]);

  const digits = String(progress).padStart(3, ' ').split('');

  useEffect(() => {
    async function fetchPosts() {
      try {
        const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
        const res = await fetch(`${supabaseUrl}/functions/v1/blog-public`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({ action: 'list' }),
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.success && json.posts) {
          setPosts(json.posts);
        } else {
          setPosts([]);
        }
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF9] dark:bg-[#0E0818]">
      <Navbar isDark={isDark} onToggleDark={toggle} />

      <div className="pt-24 pb-20">
      {/* Hero Header */}
      <div className="relative py-16 mb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-coral/5 to-teal/5 dark:from-coral/10 dark:to-teal/10"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
          <p className="text-coral font-bold text-sm uppercase tracking-widest mb-3" style={{ fontFamily: tokens.typography.fontFamily }}>
            {t('nav_blog')}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1410] dark:text-[#E8E0F5] mb-6" style={{ fontFamily: tokens.typography.fontFamily }}>
            {t('blog_title')}
          </h1>
          <p className="max-w-2xl mx-auto text-[#7A7068] dark:text-[#C4A8E8] text-lg" style={{ fontFamily: tokens.typography.fontFamily }}>
            {t('blog_subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {loading || progress < 100 ? (
          <div className="flex flex-col items-center justify-center py-10">
            {/* Percentage counter */}
            <div
              className="mb-6 flex items-baseline gap-0.5"
              style={{ fontFamily: tokens.typography.fontFamilyEn }}
            >
              {digits.map((d, i) => (
                <span
                  key={`${i}-${d}`}
                  className="text-[#3A2A1A] dark:text-[#E8E0F5] font-bold"
                  style={{
                    fontSize: d === ' ' ? '0' : '1.5rem',
                    width: d === ' ' ? '0' : 'auto',
                    opacity: d === ' ' ? 0 : 1,
                    display: 'inline-block',
                    minWidth: d === ' ' ? '0' : '0.9rem',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {d === ' ' ? '' : d}
                </span>
              ))}
              <span
                className="text-[#3A2A1A] dark:text-[#E8E0F5] font-bold ml-0.5"
                style={{ fontSize: '1.1rem' }}
              >
                %
              </span>
            </div>

            {/* Brand Icon */}
            <div className="relative w-40 h-40 md:w-48 md:h-48 mb-8">
               <div className="absolute inset-0 rounded-full bg-coral/5 animate-pulse"></div>
               <img 
                 src="https://static.readdy.ai/image/c3c070ed3a92273f043678549554b0d6/e3451f52961636b2aea237770c224254.png" 
                 className="w-full h-full object-contain animate-float opacity-80"
                 alt="Loading..."
               />
            </div>

            {/* Loading Bar */}
            <div className="w-56 h-2 rounded-full bg-[#E8D5C0] dark:bg-[#130A22] overflow-hidden shadow-inner">
              <div 
                className="h-full bg-coral transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
              </div>
            </div>
            <p className="mt-6 text-[#8A6A4A] dark:text-[#B89FD8] text-xs tracking-[0.25em] uppercase font-semibold animate-pulse" style={{ fontFamily: tokens.typography.fontFamily }}>
              {t('blog_loading')}
            </p>
          </div>
        ) : posts.length === 0 ? (
          <Card className="text-center py-20 px-6">
            <i className="ri-article-line text-5xl text-gray-200 dark:text-gray-700 mb-4"></i>
            <p className="text-[#7A7068] dark:text-[#C4A8E8] text-lg font-medium" style={{ fontFamily: tokens.typography.fontFamily }}>
              {t('blog_no_articles')}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </div>

      </div>

      <Footer />
    </div>
  );
}
