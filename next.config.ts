import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // Whiteboard scenes (admin scratchpad) can exceed the 1MB default.
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // The optimizer rejects SVG unless this is set, which 400s every local
    // /technology-icon/*.svg and /project-image/*.svg. All SVGs here are
    // first-party or from pinned CDNs; the CSP below strips any active content.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "www.vectorlogo.zone" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "opengraph.githubassets.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "miro.medium.com" },
    ],
  },
};

export default nextConfig;
