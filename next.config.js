/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  images: {
    domains: [
      'cdn.jsdelivr.net',
      'www.vectorlogo.zone',
      'github.com'
    ],
  },
};

module.exports = nextConfig;
