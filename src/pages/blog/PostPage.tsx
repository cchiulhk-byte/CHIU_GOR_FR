import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import LikeButton from './components/LikeButton';
import CommentSection from './components/CommentSection';
import Navbar from '@/pages/home/components/Navbar';
import Footer from '@/pages/home/components/Footer';
import { useDarkMode } from '@/hooks/useDarkMode';
import { tokens } from '@/design-system/tokens';
import { Card } from '@/design-system/atoms/Card';
import { Button } from '@/design-system/atoms/Button';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image_url: string;
  published_at: string;
  view_count: number;
}

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDark, toggle } = useDarkMode();

  const fontFamily = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";

  useEffect(() => {
    async function fetchPost() {
      if (!slug) {
        setLoading(false);
        return;
      }

      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/blog-public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ action: 'get', slug }),
      });
      const json = await res.json();
      if (json?.success && json.post) {
        setPost(json.post);
        await supabase.rpc('increment_view_count', { post_id: json.post.id });
      }
      setLoading(false);
    }
    fetchPost();
  }, [slug]);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (loading) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(timer);
            return 90;
          }
          return prev + 10;
        });
      }, 150);
      return () => clearInterval(timer);
    } else {
      setProgress(100);
    }
  }, [loading]);

  const digits = String(progress).padStart(3, ' ').split('');

  if (loading || progress < 100) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] dark:bg-[#0E0818]">
        <Navbar isDark={isDark} onToggleDark={toggle} />
        <div className="pt-24 pb-20 flex flex-col items-center justify-center min-h-[60vh]">
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

          <div className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 mb-8">
             <div className="absolute inset-0 rounded-full bg-coral/5 animate-pulse"></div>
             <img 
               src="https://static.readdy.ai/image/c3c070ed3a92273f043678549554b0d6/e3451f52961636b2aea237770c224254.png" 
               className="w-full h-full object-contain animate-float opacity-80"
               alt="Loading..."
             />
          </div>
          
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
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] dark:bg-[#0E0818]">
        <Navbar isDark={isDark} onToggleDark={toggle} />
        <div className="pt-32 min-h-screen text-center">
          <h2 className="text-2xl font-bold mb-4">{t('blog_article_not_found')}</h2>
          <Link to="/blog" className="text-coral font-bold hover:underline">{t('blog_back_to_blog')}</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const date = new Date(post.published_at).toLocaleDateString(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#FDFBF9] dark:bg-[#0E0818]">
      <Navbar isDark={isDark} onToggleDark={toggle} />

      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          {/* Back link */}
          <Link to="/blog" className="inline-flex items-center gap-2 text-[#7A7068] dark:text-[#B89FD8] hover:text-coral transition-colors mb-8 font-semibold text-sm">
            <i className="ri-arrow-left-line"></i>
            {t('blog_back_to_blog')}
          </Link>

          <header className="mb-12">
            <div className="flex items-center gap-3 text-sm text-[#7A7068] dark:text-[#C4A8E8] font-bold uppercase tracking-widest mb-4" style={{ fontFamily: tokens.typography.fontFamily }}>
              <span>{date}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-coral/40"></span>
              <span>{post.view_count + 1} {t('blog_views')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1A1410] dark:text-[#E8E0F5] leading-tight mb-8 tracking-tight" style={{ fontFamily: tokens.typography.fontFamily }}>
              {post.title}
            </h1>
          </header>

        {/* Featured Image */}
        <div className="rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-coral/5 bg-[#F0EBE3] dark:bg-[#130A22]">
          <img
            src={post.image_url || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop'}
            alt={post.title}
            className="w-full max-h-[70vh] object-contain"
          />
        </div>

        {/* Content */}
        <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none" style={{ fontFamily: tokens.typography.fontFamily }}>
          <div className="whitespace-pre-wrap text-[#4A4440] dark:text-[#C4A8E8] leading-[1.8] text-lg md:text-xl">
            {post.content}
          </div>
        </div>

        {/* Footer actions */}
        {/* Footer actions */}
        <Card className="mt-16 p-6 flex items-center justify-between border-[#D4C8BC]/40 dark:border-[#3B2060]/40">
           <LikeButton postId={post.id} />
           
           <div className="flex items-center gap-4">
             <Button 
               variant="ghost"
               onClick={() => {
                 if (navigator.share) {
                   navigator.share({
                     title: post.title,
                     url: window.location.href
                   });
                 } else {
                   navigator.clipboard.writeText(window.location.href);
                   alert(t('blog_share_copied'));
                 }
               }}
               className="w-12 h-12 !p-0 !rounded-full"
             >
               <i className="ri-share-line text-xl"></i>
             </Button>
           </div>
        </Card>

        {/* Comments Section */}
        <CommentSection postId={post.id} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
