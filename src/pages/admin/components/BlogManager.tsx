import { useState, useEffect } from 'react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  published_at: string;
}

interface BlogManagerProps {
  adminSecret: string;
}

export default function BlogManager({ adminSecret }: BlogManagerProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!editingPost) return;
    setSlugEdited(!!editingPost.id);
  }, [editingPost]);

  function slugify(input: string) {
    return input
      .toLowerCase()
      .trim()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function fetchPosts() {
    setLoading(true);
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
      if (res.ok && json?.success) setPosts(json.posts || []);
      else setPosts([]);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!editingPost?.title || !editingPost?.content || !editingPost?.slug) {
      alert('Title, Content and Slug are required!');
      return;
    }

    setSaving(true);
    const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseAnonKey) {
      alert('Missing VITE_PUBLIC_SUPABASE_ANON_KEY');
      setSaving(false);
      return;
    }
    const res = await fetch(`${supabaseUrl}/functions/v1/blog-manage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        action: 'upsert',
        admin_secret: adminSecret,
        post: {
          ...editingPost,
          published_at: editingPost.published_at || new Date().toISOString(),
        },
      }),
    });
    const json = await res.json().catch(() => null);
    if (json?.success) {
      setEditingPost(null);
      fetchPosts();
    } else {
      alert(json?.error || `Failed to save post (HTTP ${res.status})`);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseAnonKey) {
      alert('Missing VITE_PUBLIC_SUPABASE_ANON_KEY');
      return;
    }
    const res = await fetch(`${supabaseUrl}/functions/v1/blog-manage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ action: 'delete', admin_secret: adminSecret, post_id: id }),
    });
    const json = await res.json().catch(() => null);
    if (json?.success) fetchPosts();
    else alert(json?.error || `Failed to delete post (HTTP ${res.status})`);
  }

  async function handleImageUpload(file: File) {
    setUploadingImage(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || '');
          const comma = result.indexOf(',');
          resolve(comma >= 0 ? result.slice(comma + 1) : result);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseAnonKey) {
        throw new Error('Missing VITE_PUBLIC_SUPABASE_ANON_KEY');
      }
      const res = await fetch(`${supabaseUrl}/functions/v1/blog-manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          action: 'upload_image',
          admin_secret: adminSecret,
          image: {
            file_name: file.name,
            content_type: file.type || 'application/octet-stream',
            base64,
          },
        }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.success || !json?.public_url) {
        throw new Error(json?.error || `Upload failed (HTTP ${res.status})`);
      }

      setEditingPost((prev) => (prev ? { ...prev, image_url: json.public_url } : prev));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploadingImage(false);
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
              onChange={(e) => {
                const title = e.target.value;
                setEditingPost((prev) => {
                  if (!prev) return prev;
                  const next = { ...prev, title };
                  if (!slugEdited) {
                    next.slug = slugify(title);
                  }
                  return next;
                });
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Slug (e.g. my-first-post)"
              value={editingPost.slug || ''}
              onChange={(e) => {
                setSlugEdited(true);
                setEditingPost({ ...editingPost, slug: e.target.value });
              }}
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
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleImageUpload(file);
            }}
            className={`rounded-xl border-2 border-dashed p-4 transition-all ${
              dragOver ? 'border-coral bg-coral/5' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dragOver ? 'bg-coral text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
                  <i className="ri-image-add-line text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Drag & drop an image here</p>
                  <p className="text-xs text-gray-500">or use the file picker below</p>
                </div>
              </div>
              {uploadingImage && (
                <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
                  <i className="ri-loader-4-line animate-spin"></i>
                  Uploading...
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
            />
          </div>
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
