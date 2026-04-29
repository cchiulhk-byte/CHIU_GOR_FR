import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface Comment {
  id: string;
  user_name: string;
  content: string;
  created_at: string;
  user_id: string;
}

export default function CommentSection({ postId }: { postId: string }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingSaving, setEditingSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fontFamily = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComments(data);
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchComments();

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchComments]);

  async function handleLogin() {
    navigate('/login', { state: { from: window.location.pathname } });
  }

  async function handleStartEdit(comment: Comment) {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      alert(sessionError.message);
      return;
    }
    const currentUser = sessionData.session?.user ?? null;
    if (!currentUser) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    if (currentUser.id !== comment.user_id) return;
    setEditingId(comment.id);
    setEditingContent(comment.content);
  }

  async function handleCancelEdit() {
    setEditingId(null);
    setEditingContent('');
  }

  async function handleSaveEdit(commentId: string) {
    if (!editingContent.trim()) return;
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      alert(sessionError.message);
      return;
    }
    const currentUser = sessionData.session?.user ?? null;
    if (!currentUser) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setEditingSaving(true);
    const { error } = await supabase
      .from('blog_comments')
      .update({ content: editingContent.trim() })
      .eq('id', commentId)
      .eq('user_id', currentUser.id);

    if (error) {
      alert(error.message);
      setEditingSaving(false);
      return;
    }

    setEditingId(null);
    setEditingContent('');
    await fetchComments();
    setEditingSaving(false);
  }

  async function handleDeleteComment(comment: Comment) {
    const ok = window.confirm(t('blog_comments_delete_confirm'));
    if (!ok) return;

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      alert(sessionError.message);
      return;
    }
    const currentUser = sessionData.session?.user ?? null;
    if (!currentUser) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    if (currentUser.id !== comment.user_id) return;

    setDeletingId(comment.id);
    const { error } = await supabase
      .from('blog_comments')
      .delete()
      .eq('id', comment.id)
      .eq('user_id', currentUser.id);

    if (error) {
      alert(error.message);
      setDeletingId(null);
      return;
    }

    if (editingId === comment.id) {
      setEditingId(null);
      setEditingContent('');
    }
    await fetchComments();
    setDeletingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      alert(sessionError.message);
      return;
    }
    const currentUser = sessionData.session?.user ?? null;
    if (!currentUser) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setSubmitting(true);
    const displayName =
      (currentUser.user_metadata?.username as string | undefined) ||
      (currentUser.email ? String(currentUser.email).split('@')[0] : 'User');
    const { error } = await supabase.from('blog_comments').insert({
      post_id: postId,
      user_id: currentUser.id,
      user_name: displayName,
      content: newComment.trim(),
    });

    if (error) {
      alert(error.message);
      setSubmitting(false);
      return;
    }

    setNewComment('');
    fetchComments();
    setSubmitting(false);
  }

  return (
    <div className="mt-12 pt-12 border-t border-[#D4C8BC]/60 dark:border-[#3B2060]/60">
      <h3 className="text-2xl font-bold text-[#1A1410] dark:text-[#E8E0F5] mb-8" style={{ fontFamily }}>
        {t('blog_comments_title')} ({comments.length})
      </h3>

      {/* Post a comment */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('blog_comments_placeholder')}
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
            {submitting ? t('blog_comments_posting') : t('blog_comments_post')}
          </button>
        </form>
      ) : (
        <div className="bg-coral/5 dark:bg-[#CC0000]/5 border border-coral/20 rounded-2xl p-6 text-center mb-10">
          <p className="text-[#7A7068] dark:text-[#C4A8E8] mb-4 font-medium" style={{ fontFamily }}>
            {t('blog_comments_login_required')}
          </p>
          <button
            onClick={handleLogin}
            className="px-8 py-2.5 rounded-full bg-coral text-white font-bold text-sm hover:opacity-90 transition-all"
            style={{ fontFamily }}
          >
            {t('blog_comments_login_button')}
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
          <p className="text-[#7A7068] dark:text-[#C4A8E8] italic">{t('blog_comments_empty')}</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white dark:bg-[#1E0D38] p-5 rounded-2xl border border-[#D4C8BC]/40 dark:border-[#3B2060]/40">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-coral text-sm" style={{ fontFamily }}>@{comment.user_name}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {new Date(comment.created_at).toLocaleDateString(i18n.language)}
                </span>
              </div>

              {editingId === comment.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[#D4C8BC]/80 dark:border-[#3B2060]/50 bg-white dark:bg-[#130A22] text-[#1A1410] dark:text-[#E8E0F5] text-sm focus:outline-none focus:border-coral transition-colors duration-200 resize-none"
                    rows={3}
                    style={{ fontFamily }}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={editingSaving || !editingContent.trim()}
                      className="px-5 py-2 rounded-full bg-coral text-white font-bold text-xs hover:opacity-90 transition-all disabled:opacity-50"
                      style={{ fontFamily }}
                    >
                      {editingSaving ? t('blog_comments_posting') : t('blog_comments_save')}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={editingSaving}
                      className="px-5 py-2 rounded-full bg-[#F0EBE3] dark:bg-[#130A22] text-[#7A7068] dark:text-[#C4A8E8] font-bold text-xs hover:opacity-90 transition-all disabled:opacity-50"
                      style={{ fontFamily }}
                    >
                      {t('blog_comments_cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-[#4A4440] dark:text-[#C4A8E8] leading-relaxed" style={{ fontFamily }}>
                    {comment.content}
                  </p>

                  {user?.id === comment.user_id && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(comment)}
                        className="px-4 py-1.5 rounded-full bg-[#F0EBE3] dark:bg-[#130A22] text-[#7A7068] dark:text-[#C4A8E8] font-bold text-xs hover:opacity-90 transition-all"
                        style={{ fontFamily }}
                      >
                        {t('blog_comments_edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment)}
                        disabled={deletingId === comment.id}
                        className="px-4 py-1.5 rounded-full bg-white dark:bg-[#130A22] text-coral border border-coral/30 font-bold text-xs hover:bg-coral/5 transition-all disabled:opacity-50"
                        style={{ fontFamily }}
                      >
                        {deletingId === comment.id ? t('blog_comments_deleting') : t('blog_comments_delete')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
