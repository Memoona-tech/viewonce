"use client";
import { useEffect, useRef } from "react";
export default function CanvasPreview({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      canvasRef.current!.width = img.width;
      canvasRef.current!.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      className={`rounded-lg ${className}`}
      height={430}
      width={430}
    />
  );
}
