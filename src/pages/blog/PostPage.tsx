import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import LikeButton from './components/LikeButton';
import CommentSection from './components/CommentSection';
import Navbar from '@/pages/home/components/Navbar';
import Footer from '@/pages/home/components/Footer';
import { useDarkMode } from '@/hooks/useDarkMode';

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
  const { i18n } = useTranslation();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] dark:bg-[#0E0818]">
        <Navbar isDark={isDark} onToggleDark={toggle} />
        <div className="pt-24 pb-20 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-4xl text-coral"></i>
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
          <h2 className="text-2xl font-bold mb-4">Article not found</h2>
          <Link to="/blog" className="text-coral font-bold hover:underline">Back to Blog</Link>
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
            Back to Blog
          </Link>

          <header className="mb-12">
            <div className="flex items-center gap-3 text-sm text-[#7A7068] dark:text-[#C4A8E8] font-semibold uppercase tracking-wider mb-4" style={{ fontFamily }}>
              <span>{date}</span>
              <span className="w-1 h-1 rounded-full bg-coral/40"></span>
              <span>{post.view_count + 1} Views</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1A1410] dark:text-[#E8E0F5] leading-tight mb-6" style={{ fontFamily }}>
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
        <div className="prose prose-lg dark:prose-invert max-w-none" style={{ fontFamily }}>
          {/* We use a simple strategy to render the content for now. 
              In a real app, you'd use a markdown parser. */}
          <div className="whitespace-pre-wrap text-[#4A4440] dark:text-[#C4A8E8] leading-relaxed">
            {post.content}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-16 pt-8 border-t border-[#D4C8BC]/60 dark:border-[#3B2060]/60 flex items-center justify-between">
           <LikeButton postId={post.id} />
           
           <div className="flex items-center gap-4">
             <button 
               onClick={() => {
                 if (navigator.share) {
                   navigator.share({
                     title: post.title,
                     url: window.location.href
                   });
                 } else {
                   navigator.clipboard.writeText(window.location.href);
                   alert('Link copied to clipboard!');
                 }
               }}
               className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F0EBE3] dark:bg-[#130A22] text-[#7A7068] dark:text-[#C4A8E8] hover:bg-coral hover:text-white transition-all cursor-pointer"
             >
               <i className="ri-share-line"></i>
             </button>
           </div>
        </div>

        {/* Comments Section */}
        <CommentSection postId={post.id} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
