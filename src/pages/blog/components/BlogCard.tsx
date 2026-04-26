import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    excerpt: string;
    image_url: string;
    published_at: string;
    view_count: number;
    slug: string;
  };
  index: number;
}

export default function BlogCard({ post, index }: BlogCardProps) {
  const { i18n } = useTranslation();
  const fontFamily = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";

  const date = new Date(post.published_at).toLocaleDateString(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group bg-white dark:bg-[#1E0D38] rounded-2xl overflow-hidden border border-[#D4C8BC]/60 dark:border-[#3B2060]/60 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={post.image_url || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop'}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-coral text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
            Article
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3 text-[11px] text-[#7A7068] dark:text-[#B89FD8] font-semibold uppercase tracking-wider" style={{ fontFamily }}>
          <span>{date}</span>
          <span className="w-1 h-1 rounded-full bg-coral/40"></span>
          <span className="flex items-center gap-1">
            <i className="ri-eye-line text-sm"></i>
            {post.view_count} views
          </span>
        </div>

        <h3 className="text-xl font-bold text-[#1A1410] dark:text-[#E8E0F5] mb-3 group-hover:text-coral transition-colors duration-300 line-clamp-2" style={{ fontFamily }}>
          {post.title}
        </h3>

        <p className="text-[#4A4440] dark:text-[#C4A8E8] text-sm leading-relaxed mb-6 line-clamp-3" style={{ fontFamily }}>
          {post.excerpt}
        </p>

        <div className="mt-auto flex items-center text-coral text-sm font-bold gap-2 group-hover:gap-3 transition-all duration-300">
          <span>Read More</span>
          <i className="ri-arrow-right-line"></i>
        </div>
      </div>
    </Link>
  );
}
