/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images served from the backend's static file server
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/static/**",
      },
    ],
  },
  // Proxy /api and /ws to the FastAPI backend during development.
  // In production, configure a reverse proxy (nginx, Caddy) instead.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/:path*`,
      },
    ];
  },
};

// Replace line 26:
export default nextConfig;