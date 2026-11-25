// Data wilayah Kota Bogor dan Kabupaten Bogor
// berdasarkan GeoJSON kota-bogor.geojson & kab-bogor.geojson

export type JenisWilayah = "kota" | "kabupaten";

export interface DataWilayah {
  id: string;
  nama: string;        // Label tampil UI
  jenis: JenisWilayah;
  geojsonFile: string; // path relatif dari /public
  // kecamatan di dalam wilayah ini (dari property NAMOBJ)
  kecamatan: string[];
  // Bounding box kasar wilayah untuk auto-fit peta
  bounds: [[number, number], [number, number]]; // [[minLat, minLng], [maxLat, maxLng]]
}

/** Batas maksimal keseluruhan Bogor (Kota + Kabupaten) */
export const BOGOR_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-6.85, 106.35], // SW (ujung selatan & barat Kab Bogor)
  [-6.28, 107.25], // NE (ujung utara & timur Kab Bogor)
];

/** Titik tengah default (Bogor Tengah, dekat Istana Bogor) */
export const BOGOR_DEFAULT_CENTER: [number, number] = [-6.5944, 106.7892];
export const BOGOR_DEFAULT_ZOOM = 13;

export const DATA_WILAYAH: DataWilayah[] = [
  {
    id: "kota-bogor",
    nama: "Kota Bogor",
    jenis: "kota",
    geojsonFile: "/kota-bogor.geojson",
    kecamatan: [
      "Bogor Selatan",
      "Bogor Timur",
      "Bogor Tengah",
      "Bogor Barat",
      "Bogor Utara",
      "Tanah Sareal",
    ],
    bounds: [
      [-6.69, 106.72],
      [-6.51, 106.86],
    ],
  },
  {
    id: "kab-bogor",
    nama: "Kabupaten Bogor",
    jenis: "kabupaten",
    geojsonFile: "/kab-bogor.geojson",
    kecamatan: [
      "Cibinong",
      "Gunungputri",
      "Citeureup",
      "Sukaraja",
      "Babakan Madang",
      "Jonggol",
      "Cileungsi",
      "Cariu",
      "Sukamakmur",
      "Parung",
      "Gunungsindur",
      "Kemang",
      "Bojonggede",
      "Leuwiliang",
      "Ciampea",
      "Cibungbulang",
      "Pamijahan",
      "Rumpin",
      "Jasinga",
      "Parungpanjang",
      "Nanggung",
      "Cigudeg",
      "Tenjo",
      "Ciawi",
      "Cisarua",
      "Megamendung",
      "Caringin",
      "Cijeruk",
      "Ciomas",
      "Dramaga",
      "Tamansari",
      "Klapanunggal",
      "Ciseeng",
      "Rancabungur",
      "Sukajaya",
      "Tanjungsari",
      "Tajurhalang",
      "Cigombong",
      "Leuwisadeng",
      "Tenjolaya",
    ],
    bounds: [
      [-6.82, 106.38],
      [-6.29, 107.24],
    ],
  },
];

/** Mencari wilayah berdasarkan nama kecamatan */
export function getWilayahByKecamatan(namaKecamatan: string): DataWilayah | undefined {
  return DATA_WILAYAH.find((w) =>
    w.kecamatan.some(
      (k) => k.toLowerCase() === namaKecamatan.toLowerCase()
    )
  );
}

/** Bounds kecamatan spesifik tidak tersedia di data statik;
 *  gunakan bounds wilayahnya sebagai fallback */
export function getBoundsForKecamatan(
  namaKecamatan: string
): DataWilayah["bounds"] | null {
  const wilayah = getWilayahByKecamatan(namaKecamatan);
  return wilayah?.bounds ?? null;
}

/** Cek apakah koordinat berada di dalam bounding box Bogor (Kota + Kab) */
export function isInsideBogor(lat: number, lng: number): boolean {
  const [[minLat, minLng], [maxLat, maxLng]] = BOGOR_MAX_BOUNDS;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}
