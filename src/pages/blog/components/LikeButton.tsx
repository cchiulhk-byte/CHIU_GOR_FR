import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface LikeButtonProps {
  postId: string;
}

export default function LikeButton({ postId }: LikeButtonProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState<any>(null);

  const fetchLikesCount = useCallback(async () => {
    const { count, error } = await supabase
      .from('blog_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (!error && count !== null) {
      setLikesCount(count);
    }
  }, [postId]);

  const checkIfLiked = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from('blog_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setIsLiked(true);
      }
    },
    [postId]
  );

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      if (session?.user) checkIfLiked(session.user.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkIfLiked(session.user.id);
      } else {
        setIsLiked(false);
      }
    });

    fetchLikesCount();

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [checkIfLiked, fetchLikesCount]);

  async function handleLike() {
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

    if (isLiked) {
      // Unlike
      const { error } = await supabase
        .from('blog_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUser.id);

      if (error) {
        alert(error.message);
        return;
      }

      setIsLiked(false);
      setLikesCount(prev => Math.max(0, prev - 1));
    } else {
      // Like
      const { error } = await supabase
        .from('blog_likes')
        .insert({ post_id: postId, user_id: currentUser.id });

      if (error) {
        alert(error.message);
        return;
      }

      setIsLiked(true);
      setLikesCount(prev => prev + 1);
    }
  }

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 font-bold text-sm ${
        isLiked 
          ? 'bg-coral text-white shadow-lg shadow-coral/30' 
          : 'bg-white dark:bg-[#1E0D38] text-coral border border-coral/20 hover:bg-coral/5'
      }`}
    >
      <i className={isLiked ? 'ri-heart-fill' : 'ri-heart-line'}></i>
      {likesCount} {t('blog_likes')}
    </button>
  );
}
