"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import CanvasPreview from "@/app/components/canvas";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SharePage({ params }: { params: { token: string } }) {
  const [publicUrl, setPublicUrl] = useState<string>("");
  const [status, setStatus] = useState<"loading" | "ready" | "expired">(
    "loading"
  );
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    async function fetchAndMark() {
      const { data } = await supabase
        .from("share_tokens")
        .select("path, used, expires_at")
        .eq("token", params.token)
        .single();

      if (!data || data.used || new Date(data.expires_at) < new Date()) {
        setStatus("expired");
        return;
      }

      await supabase
        .from("share_tokens")
        .update({ used: true })
        .eq("token", params.token);

      const { data: urlData } = supabase.storage
        .from("photos")
        .getPublicUrl(data.path);

      setPublicUrl(urlData.publicUrl);
      setStatus("ready");
    }

    fetchAndMark();
  }, [params.token]);

  useEffect(() => {
    const blockContext = (e: MouseEvent) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey && ["s", "p", "u"].includes(e.key.toLowerCase()))
      )
        e.preventDefault();
    };
    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("keydown", blockKeys);

    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  useEffect(() => {
    if (status !== "ready") return;
    timerRef.current = window.setTimeout(() => {
      setStatus("expired");
    }, 15_000);
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [status]);

  if (status === "loading") {
    return (
      <p className="p-8 text-center font-bold text-pink-500">Loading... 🥳</p>
    );
  }

  if (status === "expired") {
    return (
      <p className="p-8 text-center font-bold text-red-600">
        Photo already viewed! 🤧
      </p>
    );
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black">
      <CanvasPreview src={publicUrl} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-white text-2xl opacity-50 font-bold">
          Shared by @skycarly
        </span>
      </div>
    </div>
  );
}
