import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import CanvasPreview from "@/app/components/canvas";
import ShareClient from "@/app/components/shareClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SharePageProps {
  params: { token: string };
}

export default async function SharePage({ params }: SharePageProps) {
  // 1️⃣ Fetch the token row
  const { data } = await supabase
    .from("share_tokens")
    .select("path, used, expires_at")
    .eq("token", params.token)
    .single();

  // 2️⃣ If invalid, viewed or expired, show 404
  if (!data || data.used || new Date(data.expires_at) < new Date()) {
    notFound();
  }

  // 3️⃣ Mark as viewed
  await supabase
    .from("share_tokens")
    .update({ used: true })
    .eq("token", params.token);

  // 4️⃣ Get the public URL
  const { data: urlData } = supabase.storage
    .from("photos")
    .getPublicUrl(data.path);

  const publicUrl = urlData.publicUrl;

  // 5️⃣ Render server-side preview + mount client protections
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
