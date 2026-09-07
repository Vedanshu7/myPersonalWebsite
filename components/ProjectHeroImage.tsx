"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK_IMG = "/project-image/fallback.svg";

/** Hero image that degrades to the placeholder instead of an empty box when the source fails. */
export default function ProjectHeroImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      onError={() => setImgSrc(FALLBACK_IMG)}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 768px"
    />
  );
}
