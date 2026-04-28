import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  published_at: string;
  view_count: number;
  is_featured?: boolean;
}

export default function FeaturedBlogCarousel() {
  const { i18n, t } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const fontFamily = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";

  useEffect(() => {
    async function fetchFeatured() {
      setLoading(true);
      try {
        const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        };

        const featuredRes = await fetch(`${supabaseUrl}/functions/v1/blog-public`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: 'featured' }),
        });
        const featuredJson = await featuredRes.json().catch(() => null);
        const featured = (featuredRes.ok && featuredJson?.success && Array.isArray(featuredJson.posts)
          ? (featuredJson.posts as BlogPost[])
          : [])
          .slice(0, 7);

        if (featured.length >= 7) {
          setPosts(featured);
          return;
        }

        const listRes = await fetch(`${supabaseUrl}/functions/v1/blog-public`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: 'list' }),
        });
        const listJson = await listRes.json().catch(() => null);
        const all = (listRes.ok && listJson?.success && Array.isArray(listJson.posts) ? (listJson.posts as BlogPost[]) : []);

        const byId = new Set(featured.map((p) => p.id));
        const filled = [...featured, ...all.filter((p) => !byId.has(p.id))].slice(0, 7);
        setPosts(filled);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  const header = useMemo(() => {
    return {
      label: t('nav_blog'),
      title: i18n.language === 'fr' ? 'À la une' : i18n.language === 'zh-HK' || i18n.language === 'zh' ? '精選文章' : 'Featured Posts',
    };
  }, [i18n.language, t]);

  const scrollByCards = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-card="featured-blog-card"]');
    const cardWidth = card ? card.offsetWidth : 320;
    el.scrollBy({ left: direction * (cardWidth + 24), behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-coral font-bold text-xs uppercase tracking-widest mb-2" style={{ fontFamily }}>
                {header.label}
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1410] dark:text-[#E8E0F5]" style={{ fontFamily }}>
                {header.title}
              </h2>
            </div>
          </div>
          <div className="rounded-3xl border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 bg-white/60 dark:bg-[#1E0D38]/60 backdrop-blur-sm p-10 text-center">
            <i className="ri-loader-4-line animate-spin text-3xl text-coral"></i>
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-coral font-bold text-xs uppercase tracking-widest mb-2" style={{ fontFamily }}>
              {header.label}
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1410] dark:text-[#E8E0F5]" style={{ fontFamily }}>
              {header.title}
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              className="w-10 h-10 rounded-full border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 bg-white/80 dark:bg-[#1E0D38]/70 backdrop-blur-sm text-[#4A4440] dark:text-[#D4B8F0] hover:bg-coral hover:text-white transition-all cursor-pointer"
              aria-label="Previous"
            >
              <i className="ri-arrow-left-s-line text-xl"></i>
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              className="w-10 h-10 rounded-full border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 bg-white/80 dark:bg-[#1E0D38]/70 backdrop-blur-sm text-[#4A4440] dark:text-[#D4B8F0] hover:bg-coral hover:text-white transition-all cursor-pointer"
              aria-label="Next"
            >
              <i className="ri-arrow-right-s-line text-xl"></i>
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-6 overflow-x-auto pb-3 scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {posts.map((post) => {
            const date = new Date(post.published_at).toLocaleDateString(i18n.language, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                data-card="featured-blog-card"
                className="group min-w-[280px] max-w-[280px] sm:min-w-[320px] sm:max-w-[320px] bg-white dark:bg-[#1E0D38] rounded-2xl overflow-hidden border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={post.image_url || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop'}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/55 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                    {date}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-extrabold text-[#1A1410] dark:text-[#E8E0F5] mb-2 group-hover:text-coral transition-colors line-clamp-2" style={{ fontFamily }}>
                    {post.title}
                  </h3>
                  <p className="text-[#4A4440] dark:text-[#C4A8E8] text-sm leading-relaxed line-clamp-3" style={{ fontFamily }}>
                    {post.excerpt}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs text-[#7A7068] dark:text-[#B89FD8] font-semibold">
                    <span className="flex items-center gap-1">
                      <i className="ri-eye-line"></i>
                      {post.view_count}
                    </span>
                    <span className="text-coral font-bold flex items-center gap-1">
                      <span>{i18n.language === 'fr' ? 'Lire' : i18n.language === 'zh-HK' || i18n.language === 'zh' ? '閱讀' : 'Read'}</span>
                      <i className="ri-arrow-right-line"></i>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="sm:hidden flex items-center justify-center gap-3 mt-5">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            className="px-4 py-2 rounded-full border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 bg-white/80 dark:bg-[#1E0D38]/70 backdrop-blur-sm text-[#4A4440] dark:text-[#D4B8F0] hover:bg-coral hover:text-white transition-all cursor-pointer font-bold text-sm"
            style={{ fontFamily }}
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            className="px-4 py-2 rounded-full border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 bg-white/80 dark:bg-[#1E0D38]/70 backdrop-blur-sm text-[#4A4440] dark:text-[#D4B8F0] hover:bg-coral hover:text-white transition-all cursor-pointer font-bold text-sm"
            style={{ fontFamily }}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
