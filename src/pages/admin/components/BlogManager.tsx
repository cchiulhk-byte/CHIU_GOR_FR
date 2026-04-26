import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  published_at: string;
}

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!editingPost?.title || !editingPost?.content || !editingPost?.slug) {
      alert('Title, Content and Slug are required!');
      return;
    }

    setSaving(true);
    const postData = {
      ...editingPost,
      published_at: editingPost.published_at || new Date().toISOString(),
    };

    let error;
    if (editingPost.id) {
      // Update
      const { error: err } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', editingPost.id);
      error = err;
    } else {
      // Insert
      const { error: err } = await supabase
        .from('blog_posts')
        .insert(postData);
      error = err;
    }

    if (!error) {
      setEditingPost(null);
      fetchPosts();
    } else {
      alert(error.message);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchPosts();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Blog Posts</h2>
        <button
          onClick={() => setEditingPost({ title: '', content: '', slug: '', excerpt: '', image_url: '' })}
          className="px-4 py-2 bg-coral text-white rounded-lg font-bold text-sm hover:opacity-90 transition-all cursor-pointer flex items-center gap-2"
        >
          <i className="ri-add-line"></i>
          New Post
        </button>
      </div>

      {editingPost ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-gray-800">{editingPost.id ? 'Edit Post' : 'New Post'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              value={editingPost.title || ''}
              onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Slug (e.g. my-first-post)"
              value={editingPost.slug || ''}
              onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <input
            type="text"
            placeholder="Image URL"
            value={editingPost.image_url || ''}
            onChange={(e) => setEditingPost({ ...editingPost, image_url: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <textarea
            placeholder="Excerpt (short summary)"
            value={editingPost.excerpt || ''}
            onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
            rows={2}
          />
          <textarea
            placeholder="Content (Markdown supported)"
            value={editingPost.content || ''}
            onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
            rows={10}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg font-bold text-sm hover:opacity-90 transition-all cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Post'}
            </button>
            <button
              onClick={() => setEditingPost(null)}
              className="px-6 py-2 border border-gray-200 text-gray-500 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10">
              <i className="ri-loader-4-line animate-spin text-2xl text-gray-300"></i>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 italic text-gray-400">
              No posts found.
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {post.image_url && <img src={post.image_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm group-hover:text-coral transition-colors">{post.title}</h4>
                    <p className="text-xs text-gray-400">/{post.slug} • {new Date(post.published_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingPost(post)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 text-gray-400 hover:text-teal hover:border-teal/30 transition-all cursor-pointer"
                  >
                    <i className="ri-edit-line"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-200 transition-all cursor-pointer"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
