import heroJadwal from "../assets/hero/hero-jadwal.jpg";
import heroKegiatan from "../assets/hero/hero-kegiatan.jpg";
import heroPengumuman from "../assets/hero/hero-pengumuman.jpg";
import heroKajian from "../assets/hero/hero-kajian.jpg";
import heroArtikel from "../assets/hero/hero-artikel.jpg";
import heroDonasi from "../assets/hero/hero-donasi.jpg";
import heroTentang from "../assets/hero/hero-tentang.jpg";

const defaultOverlay =
  "linear-gradient(180deg, rgba(7,24,18,0.30) 0%, rgba(8,23,18,0.54) 48%, rgba(8,20,16,0.76) 100%), rgba(19,111,65,0.16)";

export const heroConfig = {
  jadwal: {
    image: heroJadwal,
    eyebrow: "Jadwal Shalat",
    title: "Jadwal Shalat & Iqamah",
    subtitle:
      "Waktu adzan diperbarui otomatis setiap hari dan jadwal iqamah mengikuti pengaturan resmi Masjid Kagawa.",
    overlay:
      "linear-gradient(180deg, rgba(7,24,18,0.28) 0%, rgba(8,23,18,0.52) 48%, rgba(8,20,16,0.74) 100%), rgba(19,111,65,0.16)",
  },

  kegiatan: {
    image: heroKegiatan,
    eyebrow: "Program Masjid",
    title: "Kegiatan Masjid",
    subtitle:
      "Program pembinaan, edukasi, sosial, dan penguatan komunitas Muslim di Kagawa.",
    overlay:
      "linear-gradient(180deg, rgba(7,24,18,0.30) 0%, rgba(8,23,18,0.54) 48%, rgba(8,20,16,0.74) 100%), rgba(19,111,65,0.20)",
  },

  pengumuman: {
    image: heroPengumuman,
    eyebrow: "Informasi Masjid",
    title: "Pengumuman",
    subtitle:
      "Informasi terbaru, layanan, dan hal-hal penting dari Masjid Kagawa.",
    overlay:
      "linear-gradient(180deg, rgba(7,24,18,0.32) 0%, rgba(8,23,18,0.56) 48%, rgba(8,20,16,0.76) 100%), rgba(15,23,42,0.12)",
  },

  kajian: {
    image: heroKajian,
    eyebrow: "Ilmu & Pembinaan",
    title: "Kajian Masjid",
    subtitle:
      "Informasi kajian rutin, tematik, dan pembinaan ilmu di Masjid Kagawa.",
    overlay:
      "linear-gradient(180deg, rgba(7,24,18,0.28) 0%, rgba(8,23,18,0.55) 48%, rgba(8,20,16,0.76) 100%), rgba(19,111,65,0.18)",
  },

  artikel: {
    image: heroArtikel,
    eyebrow: "Tulisan & Wawasan",
    title: "Artikel",
    subtitle:
      "Tulisan dakwah, pembinaan, dan informasi bermanfaat dari Masjid Kagawa.",
    overlay:
      "linear-gradient(180deg, rgba(7,24,18,0.30) 0%, rgba(8,23,18,0.56) 48%, rgba(8,20,16,0.78) 100%), rgba(15,23,42,0.16)",
  },

  donasi: {
    image: heroDonasi,
    eyebrow: "Dukungan Jamaah",
    title: "Donasi Masjid",
    subtitle:
      "Salurkan dukungan terbaik Anda untuk operasional, dakwah, dan pelayanan umat.",
    overlay:
      "linear-gradient(180deg, rgba(7,24,18,0.30) 0%, rgba(8,23,18,0.55) 48%, rgba(8,20,16,0.76) 100%), rgba(122,89,20,0.16)",
  },

  tentang: {
    image: heroTentang,
    eyebrow: "Profil Masjid",
    title: "Tentang Masjid Kagawa",
    subtitle: "Sejarah • Visi Misi • Struktur Pengurus",
    overlay:
      "linear-gradient(180deg, rgba(7,24,18,0.30) 0%, rgba(8,23,18,0.53) 48%, rgba(8,20,16,0.74) 100%), rgba(19,111,65,0.16)",
  },

  fallback: {
    image: heroTentang,
    eyebrow: "Masjid Kagawa",
    title: "Masjid Kagawa",
    subtitle: "Keluarga Muslim Indonesia Kagawa",
    overlay: defaultOverlay,
  },
};