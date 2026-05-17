import type { MetadataRoute } from "next";

/** Returns the PWA web app manifest for the site. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vedanshu Joshi",
    short_name: "Vedanshu",
    description:
      "Software Engineer with MS from Purdue University. Full-stack systems across .NET, React, Node.js, and cloud.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
