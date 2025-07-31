import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import CanvasPreview from "@/app/components/canvas";
import ShareClient from "@/app/components/shareClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function SharePage({
  params,
}: {
  params: { token: string };
}) {
  // 1 Fetch and validate token
  const { data } = await supabase
    .from("share_tokens")
    .select("path, used, expires_at")
    .eq("token", params.token)
    .single();

  if (!data || data.used || new Date(data.expires_at) < new Date()) {
    // 404 if no valid token
    notFound();
  }

  // mark it as used
  await supabase
    .from("share_tokens")
    .update({ used: true })
    .eq("token", params.token);

  // get the public URL
  const { data: urlData } = supabase.storage
    .from("photos")
    .getPublicUrl(data.path);
  const publicUrl = urlData.publicUrl;

  // render server-side canvas + client protections
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black">
      <CanvasPreview src={publicUrl} />
      <ShareClient />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-white text-2xl opacity-50 font-bold">
          Shared by @you
        </span>
      </div>
    </div>
  );
}
