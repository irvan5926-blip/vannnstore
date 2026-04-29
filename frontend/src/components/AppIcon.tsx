import { useState } from "react";

type Props = {
  name: string;
  imageUrl?: string | null;
  brandColor?: string | null;
  size?: number;
  rounded?: "lg" | "xl" | "2xl" | "full";
  className?: string;
};

/**
 * Renders a brand-colored tile with the app's logo on top.
 * Falls back to the first letter of `name` if the image fails to load.
 */
export default function AppIcon({
  name,
  imageUrl,
  brandColor,
  size = 56,
  rounded = "2xl",
  className = "",
}: Props) {
  const [imgErr, setImgErr] = useState(false);
  const bg = brandColor ?? "#1745e0";
  const initial = (name?.trim()?.charAt(0) || "?").toUpperCase();

  const radiusClass = {
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  }[rounded];

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center overflow-hidden ${radiusClass} ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 16px rgba(0,0,0,0.3)",
      }}
      aria-label={name}
    >
      {imageUrl && !imgErr ? (
        <img
          src={imageUrl}
          alt={name}
          onError={() => setImgErr(true)}
          className="object-contain"
          style={{ width: size * 0.6, height: size * 0.6 }}
        />
      ) : (
        <span
          className="font-black text-white"
          style={{ fontSize: size * 0.45, lineHeight: 1 }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
