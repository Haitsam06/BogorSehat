import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import FooterUtama from "@/components/layout/footer_utama";

export const metadata: Metadata = {
  title: "Bogor Sehat — Direktori Fasilitas Kesehatan & WebGIS Kota/Kab. Bogor",
  description:
    "Layanan informasi resmi untuk menemukan lokasi IGD, Puskesmas, dan Klinik terakreditasi BPJS di Kota & Kabupaten Bogor.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className="min-h-screen flex flex-col bg-white"
        suppressHydrationWarning
      >
        <Navbar />
        <main className="flex-1 flex flex-col min-h-0">{children}</main>
        <FooterUtama />
      </body>
    </html>
  );
}
