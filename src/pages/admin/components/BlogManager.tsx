import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/design-system/atoms/Card';
import { Button } from '@/design-system/atoms/Button';
import { tokens } from '@/design-system/tokens';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  published_at: string;
  is_featured?: boolean;
}

interface BlogManagerProps {
  adminSecret: string;
}

export default function BlogManager({ adminSecret }: BlogManagerProps) {
  const { t } = useTranslation();
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

  function stripMarkdown(input: string) {
    return input
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '')
      .replace(/>\s?/g, '')
      .replace(/\r\n/g, '\n');
  }

  function generateExcerptFromContent(content: string) {
    const plain = stripMarkdown(content)
      .replace(/\s+/g, ' ')
      .trim();
    if (!plain) return '';
    const maxLen = 160;
    if (plain.length <= maxLen) return plain;
    const sliced = plain.slice(0, maxLen);
    const lastSpace = sliced.lastIndexOf(' ');
    return `${(lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).trim()}…`;
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
      alert(t("admin_blog_required_error")); // Added this to i18n
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
          excerpt:
            (editingPost.excerpt || '').trim() ||
            generateExcerptFromContent(String(editingPost.content || '')),
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
    if (!window.confirm(t("admin_blog_delete_confirm"))) return;

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

  async function handleSetFeatured(postId: string, isFeatured: boolean) {
    try {
      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseAnonKey) {
        alert('Missing VITE_PUBLIC_SUPABASE_ANON_KEY');
        return;
      }

      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, is_featured: isFeatured } : p)));

      const res = await fetch(`${supabaseUrl}/functions/v1/blog-manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          action: 'set_featured',
          admin_secret: adminSecret,
          post_id: postId,
          is_featured: isFeatured,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || `Failed to update featured (HTTP ${res.status})`);
      }

      fetchPosts();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update featured');
      fetchPosts();
    }
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

  async function handleEdit(post: BlogPost) {
    // If it's a new post (no ID), just set it
    if (!post.id) {
      setEditingPost(post);
      return;
    }

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
        body: JSON.stringify({ action: 'get', slug: post.slug }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && json.post) {
        setEditingPost(json.post);
      } else {
        // Fallback to the partial post data if fetch fails
        setEditingPost(post);
      }
    } catch {
      setEditingPost(post);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1A1410] dark:text-[#E8E0F5]" style={{ fontFamily: tokens.typography.fontFamily }}>{t("admin_blog_title")}</h2>
        <Button
          onClick={() => setEditingPost({ title: '', content: '', slug: '', excerpt: '', image_url: '' })}
          variant="primary"
          className="!px-5 !py-2.5 !text-sm flex items-center gap-2"
        >
          <i className="ri-add-line"></i>
          {t("admin_blog_new")}
        </Button>
      </div>

      {editingPost ? (
        <Card className="p-6 space-y-6 !rounded-[2rem]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1A1410] dark:text-[#E8E0F5] text-lg" style={{ fontFamily: tokens.typography.fontFamily }}>
              {editingPost.id ? t("admin_blog_edit") : t("admin_blog_new")}
            </h3>
            <Button variant="ghost" onClick={() => setEditingPost(null)} className="!p-2">
              <i className="ri-close-line text-xl"></i>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#7A7068] dark:text-[#B89FD8] ml-1">Titre</label>
              <input
                type="text"
                placeholder={t("admin_blog_title_placeholder")}
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
                className="w-full px-4 py-3 bg-[#F7F4EF] dark:bg-[#0E0818] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 rounded-xl text-sm text-[#1A1410] dark:text-[#E8E0F5] focus:outline-none focus:border-coral transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#7A7068] dark:text-[#B89FD8] ml-1">URL Slug</label>
              <input
                type="text"
                placeholder={t("admin_blog_slug_placeholder")}
                value={editingPost.slug || ''}
                onChange={(e) => {
                  setSlugEdited(true);
                  setEditingPost({ ...editingPost, slug: e.target.value });
                }}
                className="w-full px-4 py-3 bg-[#F7F4EF] dark:bg-[#0E0818] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 rounded-xl text-sm text-[#1A1410] dark:text-[#E8E0F5] focus:outline-none focus:border-coral transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#7A7068] dark:text-[#B89FD8] ml-1">Image URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t("admin_blog_image_placeholder")}
                value={editingPost.image_url || ''}
                onChange={(e) => setEditingPost({ ...editingPost, image_url: e.target.value })}
                className="flex-1 px-4 py-3 bg-[#F7F4EF] dark:bg-[#0E0818] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 rounded-xl text-sm text-[#1A1410] dark:text-[#E8E0F5] focus:outline-none focus:border-coral transition-all"
              />
            </div>
          </div>

          <div
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
            onDrop={(e) => {
              e.preventDefault(); e.stopPropagation(); setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleImageUpload(file);
            }}
            className={`rounded-2xl border-2 border-dashed p-6 transition-all ${
              dragOver ? 'border-coral bg-coral/5 scale-[1.01]' : 'border-[#D4C8BC]/40 dark:border-[#3B2060]/40 bg-[#F7F4EF]/50 dark:bg-[#0E0818]/50'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${dragOver ? 'bg-coral text-white' : 'bg-white dark:bg-[#1E0D38] text-[#7A7068] dark:text-[#B89FD8]'}`}>
                  <i className="ri-image-add-line text-xl"></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1A1410] dark:text-[#E8E0F5]">{t("admin_blog_drag_drop")}</p>
                  <p className="text-xs text-[#7A7068] dark:text-[#B89FD8]">{t("admin_blog_upload_hint")}</p>
                </div>
              </div>
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                className="hidden"
              />
              <label 
                htmlFor="file-upload"
                className="px-4 py-2 rounded-xl bg-white dark:bg-[#1E0D38] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 text-xs font-bold text-[#1A1410] dark:text-[#E8E0F5] hover:bg-gray-50 dark:hover:bg-[#2D1B4E] cursor-pointer transition-all"
              >
                Choisir
              </label>
              {uploadingImage && (
                <span className="text-xs text-coral font-bold flex items-center gap-2 animate-pulse">
                  <i className="ri-loader-4-line animate-spin"></i>
                  {t("admin_blog_uploading")}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#7A7068] dark:text-[#B89FD8] ml-1">Extrait (Excerpt)</label>
              <Button
                variant="ghost"
                onClick={() =>
                  setEditingPost((prev) => {
                    if (!prev) return prev;
                    const nextExcerpt = generateExcerptFromContent(String(prev.content || ''));
                    return { ...prev, excerpt: nextExcerpt };
                  })
                }
                className="!px-3 !py-1 !text-[10px] !rounded-lg"
              >
                {t("admin_blog_auto_excerpt")}
              </Button>
            </div>
            <textarea
              placeholder={t("admin_blog_excerpt_placeholder")}
              value={editingPost.excerpt || ''}
              onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-[#130A22] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 rounded-xl text-sm text-[#1A1410] dark:text-[#E8E0F5] focus:outline-none focus:border-coral transition-all min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#7A7068] dark:text-[#B89FD8] ml-1">Contenu (Full Post Content)</label>
            <textarea
              placeholder={t("admin_blog_content_placeholder")}
              value={editingPost.content || ''}
              onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
              className="w-full px-5 py-4 bg-white dark:bg-[#130A22] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 rounded-2xl text-base leading-relaxed text-[#1A1410] dark:text-[#E8E0F5] focus:outline-none focus:border-coral transition-all min-h-[600px] font-medium"
              style={{ fontFamily: tokens.typography.fontFamily }}
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-[#D4C8BC]/20 dark:border-[#3B2060]/20">
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="primary"
              className="!px-8 !py-3"
            >
              {saving ? t("admin_blog_saving") : t("admin_blog_save")}
            </Button>
            <Button
              onClick={() => setEditingPost(null)}
              variant="outline"
              className="!px-8 !py-3"
            >
              {t("admin_blog_cancel")}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10">
              <i className="ri-loader-4-line animate-spin text-2xl text-gray-300"></i>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 italic text-gray-400">
              {t("admin_blog_no_posts")}
            </div>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="p-4 flex items-center justify-between group !rounded-2xl border-[#D4C8BC]/40 dark:border-[#3B2060]/40">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F7F4EF] dark:bg-[#0E0818] flex-shrink-0 shadow-inner">
                    {post.image_url && <img src={post.image_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1A1410] dark:text-[#E8E0F5] text-sm group-hover:text-coral transition-colors" style={{ fontFamily: tokens.typography.fontFamily }}>{post.title}</h4>
                    <p className="text-[10px] font-bold text-[#7A7068] dark:text-[#B89FD8] uppercase tracking-widest mt-1">/{post.slug} • {new Date(post.published_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => handleSetFeatured(post.id, !post.is_featured)}
                    className={`!w-10 !h-10 !p-0 !rounded-xl ${
                      post.is_featured
                        ? '!text-yellow-500 !bg-yellow-500/10'
                        : '!text-[#7A7068] dark:!text-[#B89FD8]'
                    }`}
                  >
                    <i className={post.is_featured ? 'ri-star-fill' : 'ri-star-line text-lg'}></i>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleEdit(post)}
                    className="!w-10 !h-10 !p-0 !rounded-xl !text-[#7A7068] dark:!text-[#B89FD8]"
                  >
                    <i className="ri-edit-line text-lg"></i>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(post.id)}
                    className="!w-10 !h-10 !p-0 !rounded-xl !text-[#7A7068] dark:!text-[#B89FD8] hover:!text-red-500"
                  >
                    <i className="ri-delete-bin-line text-lg"></i>
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
