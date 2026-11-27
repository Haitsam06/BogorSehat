/** @type {import('next').NextConfig} */
const backendHost = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";

/**
 * Host gambar galeri faskes. API mengembalikan URL absolut berdasarkan
 * `APP_URL` backend (default `http://localhost:8000`), sedangkan
 * `BACKEND_INTERNAL_URL` biasanya `127.0.0.1` — dua host berbeda walau
 * menunjuk server yang sama. Keduanya harus didaftarkan, kalau tidak
 * `next/image` menolak dengan "hostname is not configured".
 */
function backendImagePatterns() {
  const hosts = new Set([backendHost, "http://localhost:8000", "http://127.0.0.1:8000"]);

  const patterns = [];
  for (const host of hosts) {
    try {
      const url = new URL(host);
      patterns.push({
        protocol: url.protocol.replace(":", ""),
        hostname: url.hostname,
        port: url.port || "",
        pathname: "/storage/**",
      });
    } catch {
      // Abaikan nilai env yang tidak valid.
    }
  }

  return patterns;
}

const nextConfig = {
  reactStrictMode: true,
  // `lucide-react` sudah termasuk default `optimizePackageImports` Next, jadi
  // tidak perlu didaftarkan lagi di sini.
  images: {
    remotePatterns: backendImagePatterns(),
    // WebP sudah menjadi format sumber, jadi konversi ulang tidak berguna.
    formats: ["image/webp"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendHost}/api/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${backendHost}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
