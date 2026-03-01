/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dynamic-addition-ee01c0a27a.strapiapp.com",
      },
      {
        protocol: "https",
        hostname: "dynamic-addition-ee01c0a27a.media.strapiapp.com",
      },
    ],
  },
};

export default nextConfig;
