import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';

interface Comment {
  id: string;
  user_name: string;
  content: string;
  created_at: string;
  user_id: string;
}

export default function CommentSection({ postId }: { postId: string }) {
  const { t, i18n } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fontFamily = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchComments();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [postId]);

  async function fetchComments() {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComments(data);
    }
    setLoading(false);
  }

  async function handleLogin() {
    // Simple email login or show modal
    // For now, we'll use a simple alert/prompt or redirect to a login page if one existed
    // But since we want it "in-place", let's use Supabase Auth UI or a simple email link
    const email = window.prompt('Enter your email to login:');
    if (email) {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) alert(error.message);
      else alert('Check your email for the login link!');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from('blog_comments').insert({
      post_id: postId,
      user_id: user.id,
      user_name: user.email?.split('@')[0] || 'User',
      content: newComment.trim(),
    });

    if (!error) {
      setNewComment('');
      fetchComments();
    }
    setSubmitting(false);
  }

  return (
    <div className="mt-12 pt-12 border-t border-[#D4C8BC]/60 dark:border-[#3B2060]/60">
      <h3 className="text-2xl font-bold text-[#1A1410] dark:text-[#E8E0F5] mb-8" style={{ fontFamily }}>
        Comments ({comments.length})
      </h3>

      {/* Post a comment */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-4 py-3 rounded-2xl border-2 border-[#D4C8BC]/80 dark:border-[#3B2060]/50 bg-white dark:bg-[#130A22] text-[#1A1410] dark:text-[#E8E0F5] text-sm focus:outline-none focus:border-coral transition-colors duration-200 resize-none mb-4"
            rows={3}
            style={{ fontFamily }}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-8 py-2.5 rounded-full bg-coral text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
            style={{ fontFamily }}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="bg-coral/5 dark:bg-[#CC0000]/5 border border-coral/20 rounded-2xl p-6 text-center mb-10">
          <p className="text-[#7A7068] dark:text-[#C4A8E8] mb-4 font-medium" style={{ fontFamily }}>
            You need to be logged in to post a comment.
          </p>
          <button
            onClick={handleLogin}
            className="px-8 py-2.5 rounded-full bg-coral text-white font-bold text-sm hover:opacity-90 transition-all"
            style={{ fontFamily }}
          >
            Log In to Comment
          </button>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-4">
            <i className="ri-loader-4-line animate-spin text-2xl text-coral"></i>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-[#7A7068] dark:text-[#C4A8E8] italic">No comments yet. Be the first to share!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white dark:bg-[#1E0D38] p-5 rounded-2xl border border-[#D4C8BC]/40 dark:border-[#3B2060]/40">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-coral text-sm" style={{ fontFamily }}>@{comment.user_name}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {new Date(comment.created_at).toLocaleDateString(i18n.language)}
                </span>
              </div>
              <p className="text-sm text-[#4A4440] dark:text-[#C4A8E8] leading-relaxed" style={{ fontFamily }}>
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
