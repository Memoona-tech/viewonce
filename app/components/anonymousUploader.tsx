"use client";

import { useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import Link from "next/link";
import { UploadCloud } from "lucide-react";
import Image from "next/image";

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

    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10);
    const { error: insErr } = await supabase
      .from("share_tokens")
      .insert([{ token, path, expires_at: expiresAt.toISOString() }]);
    if (insErr) {
      alert("Token creation failed");
      return;
    }

    const newLink = `${window.location.origin}/s/${token}`;
    setLink(newLink);

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
    <div className="min-h-screen  flex items-center justify-center p-6">
      <div className="bg-gradient-to-br from-blue-400 to-white backdrop-blur-xl border border-blue-800/40 rounded-2xl shadow-lg p-8 w-full max-w-md text-white space-y-6">
        <h1 className="text-3xl font-bold text-white text-center drop-shadow-sm">
          🔐 One-Time Upload
        </h1>

        {/* Drop zone */}
        <div
          onClick={() => document.getElementById("file-input")?.click()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) onSelect(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => e.preventDefault()}
          className="w-full h-48 border-2 border-dashed border-blue-400 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-pink-800/10 transition duration-300"
        >

          {file ? (
            <Image
              src={previewUrl}
              alt="preview"
              width={384}
              height={192}
              className="w-full h-full object-contain rounded-xl"
              unoptimized
            />
          ) : (
            <>
              <UploadCloud size={40} className="text-pink-400 mb-2" />
              <p className="text-pink-300 font-medium">
                Click or Drop an Image
              </p>
            </>
          )}
          <input
            id="file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0])}
          />
        </div>

        {/* Upload button */}
        <button
          onClick={uploadAndShare}
          disabled={!file}
          className={`w-full py-2 rounded-xl font-semibold transition-all cursor-pointer ${
            file
              ? "bg-pink-500 hover:bg-pink-400 text-white"
              : "bg-pink-300/30 text-white cursor-not-allowed"
          }`}
        >
          Upload & Create Link
        </button>

        {/* Link display */}
        {link && (
          <div className="bg-pink-900/30 p-3 rounded-xl space-y-2">
            <Link
              href={link}
              className="block text-pink-200 underline break-all text-center"
            >
              {link}
            </Link>
            <button
              onClick={copyToClipboard}
              className="w-full py-1 bg-pink-500 hover:bg-pink-400 text-white transition-all rounded-full text-sm cursor-pointer"
            >
              Copy Link
            </button>
            {copySuccess && (
              <p className="text-green-300 text-center text-sm">
                {copySuccess}
              </p>
            )}
          </div>
        )}

        {/* Uploaded Preview */}
        {uploadedUrl && (
          <div className="flex flex-col items-center">
            <Image
              src={uploadedUrl}
              alt="Uploaded preview"
              width={128}
              height={128}
              className="w-32 h-32 rounded-lg object-cover border-2 border-pink-400 shadow"
              unoptimized
            />
          </div>
        )}
      </div>
    </div>
  );
}
