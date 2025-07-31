"use client";
import { useEffect, useRef } from "react";

export default function ShareClient() {
  const timerRef = useRef<number | null>(null);

  // about right-click and certain keys
  useEffect(() => {
    const blockContext = (e: MouseEvent) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey && ["s", "p", "u"].includes(e.key.toLowerCase()))
      ) e.preventDefault();
    };

    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("keydown", blockKeys);

    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  // blur after 5s, expire after 10s
  useEffect(() => {
    const blurT = window.setTimeout(() => {
      const canvas = document.querySelector("canvas");
      if (canvas) canvas.classList.add("blur-md");
    }, 5000);

    timerRef.current = window.setTimeout(() => {
      // reload or navigate to expired
      window.location.reload();
    }, 10000);

    return () => {
      clearTimeout(blurT);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
