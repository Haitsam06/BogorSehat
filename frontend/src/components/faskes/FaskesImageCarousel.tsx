"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { FaskesThumbnail } from "@/components/ui/faskes_thumbnail";

export interface FaskesCarouselImage {
  url: string;
  is_banner?: boolean;
  is_thumbnail?: boolean;
}

interface FaskesImageCarouselProps {
  images?: FaskesCarouselImage[];
  bannerUrl?: string | null;
  namaFaskes: string;
  kategoriFaskes?: string | null;
}

export default function FaskesImageCarousel({
  images,
  bannerUrl,
  namaFaskes,
  kategoriFaskes,
}: FaskesImageCarouselProps) {
  const slides = useMemo(() => {
    const raw = (images ?? [])
      .filter((img) => Boolean(img?.url && img.url.trim() !== ""))
      .slice(0, 5);

    if (raw.length === 0) {
      if (bannerUrl && bannerUrl.trim() !== "") {
        return [{ url: bannerUrl, is_banner: true, is_thumbnail: false }];
      }
      return [];
    }

    const bannerIdx = raw.findIndex(
      (img) => img.is_banner || (bannerUrl && img.url === bannerUrl)
    );

    if (bannerIdx <= 0) {
      return raw;
    }

    return [raw[bannerIdx], ...raw.slice(0, bannerIdx), ...raw.slice(bannerIdx + 1)];
  }, [images, bannerUrl]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setActiveIndex(0);
    setFailedUrls({});
  }, [slides]);

  if (slides.length === 0) {
    return (
      <div className="w-full h-[260px] sm:h-[340px] rounded-xl overflow-hidden border border-slate-200/80">
        <FaskesThumbnail
          gambar_faskes={null}
          nama_faskes={namaFaskes}
          kategori_faskes={kategoriFaskes}
          className="w-full h-full"
        />
      </div>
    );
  }

  const currentSlide = slides[activeIndex] ?? slides[0];
  const currentFailed = Boolean(failedUrls[currentSlide.url]);

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="space-y-3">
      <div className="relative w-full h-[260px] sm:h-[340px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 group">
        {currentFailed ? (
          <FaskesThumbnail
            gambar_faskes={null}
            nama_faskes={namaFaskes}
            kategori_faskes={kategoriFaskes}
            className="w-full h-full"
          />
        ) : (
          <img
            src={currentSlide.url}
            alt={`${namaFaskes} — Foto ${activeIndex + 1}`}
            // Slide utama above-the-fold: jangan lazy, beri prioritas unduh.
            fetchPriority="high"
            decoding="async"
            onError={() =>
              setFailedUrls((prev) => ({ ...prev, [currentSlide.url]: true }))
            }
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          {currentSlide.is_banner && (
            <span className="px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-bold tracking-wide flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-teal-300" />
              <span>Banner Utama</span>
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-bold pointer-events-none">
          {activeIndex + 1} / {slides.length}
        </div>

        {/* Controls */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Foto sebelumnya"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Foto berikutnya"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {slides.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {slides.map((slide, idx) => {
            const aktif = idx === activeIndex;
            const thumbFailed = Boolean(failedUrls[slide.url]);
            return (
              <button
                key={`${slide.url}-${idx}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Tampilkan foto ${idx + 1}`}
                className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${
                  aktif
                    ? "border-[#007E7A] ring-2 ring-[#007E7A]/20"
                    : "border-slate-200 opacity-75 hover:opacity-100"
                }`}
              >
                {thumbFailed ? (
                  <FaskesThumbnail
                    gambar_faskes={null}
                    nama_faskes={namaFaskes}
                    kategori_faskes={kategoriFaskes}
                    className="w-full h-full"
                  />
                ) : (
                  <img
                    src={slide.url}
                    alt={`${namaFaskes} thumbnail ${idx + 1}`}
                    // Strip ini memuat sampai 5 foto resolusi penuh, padahal
                    // hanya satu slide yang tampil besar. Tunda sisanya.
                    loading={aktif ? "eager" : "lazy"}
                    decoding="async"
                    width={80}
                    height={56}
                    onError={() =>
                      setFailedUrls((prev) => ({ ...prev, [slide.url]: true }))
                    }
                    className="w-full h-full object-cover"
                  />
                )}
                {slide.is_banner && (
                  <span className="absolute bottom-0.5 left-0.5 px-1 py-0.5 rounded bg-slate-900/80 text-white text-[8px] font-bold leading-none">
                    Banner
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
