import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BlogCard from './components/BlogCard';
import Navbar from '@/pages/home/components/Navbar';
import Footer from '@/pages/home/components/Footer';
import { useDarkMode } from '@/hooks/useDarkMode';

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
          <p className="text-coral font-bold text-sm uppercase tracking-widest mb-3" style={{ fontFamily }}>
            {t('nav_blog')}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1410] dark:text-[#E8E0F5] mb-6" style={{ fontFamily }}>
            Insights & Stories
          </h1>
          <p className="max-w-2xl mx-auto text-[#7A7068] dark:text-[#C4A8E8] text-lg" style={{ fontFamily }}>
            Discover my thoughts on French language learning, Canadian culture, and my teaching journey.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <i className="ri-loader-4-line text-4xl text-coral animate-spin mb-4"></i>
            <p className="text-[#7A7068] dark:text-[#C4A8E8] font-medium">Loading articles...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#1E0D38] rounded-3xl border border-[#D4C8BC]/60 dark:border-[#3B2060]/60">
            <i className="ri-article-line text-5xl text-gray-200 dark:text-gray-700 mb-4"></i>
            <p className="text-[#7A7068] dark:text-[#C4A8E8] text-lg font-medium">No articles yet. Check back soon!</p>
          </div>
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
