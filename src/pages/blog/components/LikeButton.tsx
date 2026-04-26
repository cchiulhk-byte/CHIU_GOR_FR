import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface LikeButtonProps {
  postId: string;
}

export default function LikeButton({ postId }: LikeButtonProps) {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkIfLiked(session.user.id);
      }
    });

    fetchLikesCount();
  }, [postId]);

  async function fetchLikesCount() {
    const { count, error } = await supabase
      .from('blog_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (!error && count !== null) {
      setLikesCount(count);
    }
  }

  async function checkIfLiked(userId: string) {
    const { data, error } = await supabase
      .from('blog_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      setIsLiked(true);
    }
  }

  async function handleLike() {
    if (!user) {
      alert('Please log in to like this post!');
      return;
    }

    if (isLiked) {
      // Unlike
      const { error } = await supabase
        .from('blog_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (!error) {
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      }
    } else {
      // Like
      const { error } = await supabase
        .from('blog_likes')
        .insert({ post_id: postId, user_id: user.id });

      if (!error) {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
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
      {likesCount} Likes
    </button>
  );
}
