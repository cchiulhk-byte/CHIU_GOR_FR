import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

type BlogManageAction = "upsert" | "delete" | "upload_image" | "set_featured";

interface BlogManagePayload {
  action: BlogManageAction;
  admin_secret: string;
  post?: {
    id?: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    image_url?: string;
    published_at?: string;
    is_featured?: boolean;
  };
  post_id?: string;
  is_featured?: boolean;
  image?: {
    file_name: string;
    content_type: string;
    base64: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const payload: BlogManagePayload = await req.json();

    const expectedSecret = Deno.env.get("ADMIN_SECRET");
    if (!expectedSecret || payload.admin_secret !== expectedSecret) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (payload.action === "upsert") {
      if (!payload.post?.title || !payload.post?.slug || !payload.post?.content) {
        return new Response(JSON.stringify({ success: false, error: "Missing required post fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const postData = {
        id: payload.post.id,
        title: payload.post.title,
        slug: payload.post.slug,
        excerpt: payload.post.excerpt ?? "",
        content: payload.post.content,
        image_url: payload.post.image_url ?? "",
        published_at: payload.post.published_at ?? new Date().toISOString(),
        ...(typeof payload.post.is_featured === "boolean" ? { is_featured: payload.post.is_featured } : {}),
      };

      const { data, error } = await supabase
        .from("blog_posts")
        .upsert(postData)
        .select("id")
        .maybeSingle();

      if (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, post_id: data?.id ?? payload.post.id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.action === "set_featured") {
      if (!payload.post_id || typeof payload.is_featured !== "boolean") {
        return new Response(JSON.stringify({ success: false, error: "Missing post_id or is_featured" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase
        .from("blog_posts")
        .update({ is_featured: payload.is_featured })
        .eq("id", payload.post_id);

      if (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.action === "delete") {
      if (!payload.post_id) {
        return new Response(JSON.stringify({ success: false, error: "Missing post_id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase.from("blog_posts").delete().eq("id", payload.post_id);
      if (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.action === "upload_image") {
      if (!payload.image?.file_name || !payload.image.base64 || !payload.image.content_type) {
        return new Response(JSON.stringify({ success: false, error: "Missing image payload" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const bucket = Deno.env.get("BLOG_IMAGE_BUCKET") || "blog-images";

      const binary = Uint8Array.from(atob(payload.image.base64), (c) => c.charCodeAt(0));
      const path = `${crypto.randomUUID()}-${payload.image.file_name}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, binary, { contentType: payload.image.content_type, upsert: false });

      if (uploadError) {
        return new Response(JSON.stringify({ success: false, error: uploadError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);

      return new Response(JSON.stringify({ success: true, public_url: data.publicUrl, path }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
