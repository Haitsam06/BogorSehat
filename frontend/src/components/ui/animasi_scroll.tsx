"use client";

import React, { useEffect, useRef, useState } from "react";

interface AnimasiScrollProps {
  children: React.ReactNode;
  jeda_ms?: number;
  durasi_ms?: number;
  arah?: "bawah" | "atas" | "kiri" | "kanan" | "skala";
  className?: string;
}

export default function AnimasiScroll({
  children,
  jeda_ms = 0,
  durasi_ms = 700,
  arah = "bawah",
  className = "",
}: AnimasiScrollProps) {
  const [apakah_terlihat, set_apakah_terlihat] = useState(false);
  const elemen_ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const elemen = elemen_ref.current;
    if (!elemen) return;

    // Jika browser tidak mendukung IntersectionObserver (fallback langsung tampilkan)
    if (!("IntersectionObserver" in window)) {
      set_apakah_terlihat(true);
      return;
    }

    const pengamat = new IntersectionObserver(
      (entri) => {
        entri.forEach((item) => {
          if (item.isIntersecting) {
            set_apakah_terlihat(true);
            pengamat.unobserve(item.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    pengamat.observe(elemen);

    return () => {
      pengamat.disconnect();
    };
  }, []);

  // Penentuan kelas transformasi awal sebelum elemen masuk viewport
  let kelas_transformasi_awal = "translate-y-7 opacity-0";
  if (arah === "atas") {
    kelas_transformasi_awal = "-translate-y-7 opacity-0";
  } else if (arah === "kiri") {
    kelas_transformasi_awal = "-translate-x-7 opacity-0";
  } else if (arah === "kanan") {
    kelas_transformasi_awal = "translate-x-7 opacity-0";
  } else if (arah === "skala") {
    kelas_transformasi_awal = "scale-95 opacity-0";
  }

  const kelas_keadaan = apakah_terlihat
    ? "opacity-100 translate-x-0 translate-y-0 scale-100"
    : kelas_transformasi_awal;

  return (
    <div
      ref={elemen_ref}
      style={{
        transitionDuration: `${durasi_ms}ms`,
        transitionDelay: `${jeda_ms}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`transition-all ${kelas_keadaan} ${className}`}
    >
      {children}
    </div>
  );
}

