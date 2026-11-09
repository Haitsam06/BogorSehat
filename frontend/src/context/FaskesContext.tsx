"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  api,
  ApiUser,
  getAuthToken,
  getAuthUser,
  removeAuthToken,
  setAuthToken,
  setAuthUser,
} from "@/lib/api";
import { lokasi_default_pengguna } from "@/data/data_faskes";

interface LokasiPengguna {
  nama_jalan: string;
  latitude: number;
  longitude: number;
}

interface FaskesContextType {
  lokasiPengguna: LokasiPengguna;
  aturLokasiPengguna: (lokasi: LokasiPengguna) => void;
  deteksiLokasiGPS: () => void;
  memuatGPS: boolean;
  pengguna: ApiUser | null;
  sudahLogin: boolean;
  masuk: (email: string, sandi: string) => Promise<void>;
  keluar: () => Promise<void>;
}

const FaskesContext = createContext<FaskesContextType | undefined>(undefined);

export function FaskesProvider({ children }: { children: React.ReactNode }) {
  const [lokasiPengguna, setLokasiPengguna] = useState<LokasiPengguna>(
    lokasi_default_pengguna
  );
  const [memuatGPS, setMemuatGPS] = useState(false);
  const [pengguna, setPengguna] = useState<ApiUser | null>(null);

  // Sync user from local storage on mount
  useEffect(() => {
    const user = getAuthUser();
    if (user) {
      setPengguna(user);
    }
  }, []);

  const deteksiLokasiGPS = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;
    setMemuatGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLokasiPengguna({
          nama_jalan: "Lokasi GPS Anda Saat Ini",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setMemuatGPS(false);
      },
      () => {
        setMemuatGPS(false);
      },
      { timeout: 8000 }
    );
  };

  const masuk = async (email: string, sandi: string) => {
    const res = await api.login(email, sandi);
    setPengguna(res.data);
  };

  const keluar = async () => {
    await api.logout();
    setPengguna(null);
  };

  return (
    <FaskesContext.Provider
      value={{
        lokasiPengguna,
        aturLokasiPengguna: setLokasiPengguna,
        deteksiLokasiGPS,
        memuatGPS,
        pengguna,
        sudahLogin: Boolean(pengguna && getAuthToken()),
        masuk,
        keluar,
      }}
    >
      {children}
    </FaskesContext.Provider>
  );
}

export function useFaskes() {
  const context = useContext(FaskesContext);
  if (!context) {
    // Return safe fallback so components don't crash if rendered outside provider
    return {
      lokasiPengguna: lokasi_default_pengguna,
      aturLokasiPengguna: () => {},
      deteksiLokasiGPS: () => {},
      memuatGPS: false,
      pengguna: null,
      sudahLogin: false,
      masuk: async () => {},
      keluar: async () => {},
    };
  }
  return context;
}
