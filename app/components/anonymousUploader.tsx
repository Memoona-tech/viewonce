// components/AnonymousUploader.tsx
"use client";

import { useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import Image from "next/image";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AnonymousUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState<string>("");

  const onSelect = useCallback((f: File) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setLink("");
    setUploadedUrl("");
    setCopySuccess("");
  }, []);

  const uploadAndShare = async () => {
    if (!file) return;

    // 1️⃣ upload to Storage
    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}.${ext}`;
    const path = `photos/${filename}`;
    const { error: upErr } = await supabase.storage
      .from("photos")
      .upload(path, file);
    if (upErr) {
      alert("Upload failed: " + upErr.message);
      return;
    }

    // 2️⃣ create token in DB
    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 min
    const { error: insErr } = await supabase
      .from("share_tokens")
      .insert([{ token, path, expires_at: expiresAt.toISOString() }]);
    if (insErr) {
      console.error("Token INSERT error:", insErr);
      alert("Token creation failed: " + (insErr.message || JSON.stringify(insErr)));
      return;
    }

    // 3️⃣ set the link
    const newLink = `${window.location.origin}/s/${token}`;
    setLink(newLink);

    // 4️⃣ get public URL for preview
    const { data: urlData } = supabase.storage
      .from("photos")
      .getPublicUrl(path);
    setUploadedUrl(urlData.publicUrl);
  };

  const copyToClipboard = () => {
    if (!link) return;
    navigator.clipboard
      .writeText(link)
      .then(() => setCopySuccess("Link copied!"))
      .catch(() => setCopySuccess("Copy failed"));
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex flex-col items-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0])}
        />
        {previewUrl && (
          <Image
            src={previewUrl}
            alt="preview"
            width={192}
            height={192}
            className="mt-4 w-48 h-48 object-contain rounded border"
          />
        )}
      </div>

      <button
        onClick={uploadAndShare}
        disabled={!file}
        className={`px-4 py-2 rounded-full ${
          file
            ? "bg-white text-pink-800 cursor-pointer"
            : "bg-white/80 text-pink-700 cursor-not-allowed"
        }`}
      >
        Upload & Create Link
      </button>

      {link && (
        <div className="flex flex-col items-center space-y-2">
          <Link href={link} className="text-blue-500 underline break-all text-center">
            {link}
          </Link>
          <button
            onClick={copyToClipboard}
            className="px-3 py-1 bg-white rounded-full text-pink-800 hover:bg-gray-300 cursor-pointer"
          >
            Copy Link
          </button>
          {copySuccess && <p className="text-sm text-green-600">{copySuccess}</p>}
        </div>
      )}

      {uploadedUrl && (
        <div className="flex flex-col items-center">
          <p className="text-gray-700 mb-2">Uploaded Image Preview:</p>
          <Image
            src={uploadedUrl}
            alt="Uploaded preview"
            width={192}
            height={192}
            className="w-48 h-48 object-contain rounded border"
          />
        </div>
      )}
    </div>
  );
}
