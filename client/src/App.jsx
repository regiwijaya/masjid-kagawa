import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// COMPONENTS
import TopBar from "./components/common/TopBar";
import Footer from "./components/common/Footer";
import RouteProgress from "./components/common/RouteProgress";

// LAYOUT
import PublicLayout from "./layouts/PublicLayout";

// PUBLIC
import Home from "./pages/public/Home";
import JadwalShalat from "./pages/public/JadwalShalat";
import Pengumuman from "./pages/public/Pengumuman";
import PengumumanDetail from "./pages/public/PengumumanDetail";
import TentangMasjid from "./pages/public/TentangMasjid";
import Donasi from "./pages/public/Donasi";
import KegiatanMasjid from "./pages/public/KegiatanMasjid";
import KegiatanDetail from "./pages/public/KegiatanDetail";
import Artikel from "./pages/public/Artikel";
import ArtikelDetail from "./pages/public/ArtikelDetail";
import ContactPage from "./pages/public/ContactPage";

// ADMIN
import RegisterAdmin from "./pages/admin/RegisterAdmin";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPrayer from "./pages/admin/AdminPrayer";
import AdminKegiatan from "./pages/admin/AdminKegiatan";
import AdminPengumuman from "./pages/admin/AdminPengumuman";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminDonasi from "./pages/admin/AdminDonasi";
import AdminContact from "./pages/admin/AdminContact";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminDonationConfirmations from "./pages/admin/AdminDonationConfirmations";

import AOS from "aos";
import "aos/dist/aos.css";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // =========================
  // PAGE TITLE
  // =========================
  useEffect(() => {
    const path = location.pathname;

    let title = "Masjid Kagawa - Keluarga Muslim Indonesia Kagawa";

    // PUBLIC
    if (path === "/") {
      title = "Masjid Kagawa";
    } else if (path.startsWith("/jadwal")) {
      title = "Jadwal Shalat | Masjid Kagawa";
    } else if (path.startsWith("/pengumuman")) {
      title = "Pengumuman | Masjid Kagawa";
    } else if (path.startsWith("/tentang")) {
      title = "Tentang Masjid | Masjid Kagawa";
    } else if (path.startsWith("/donasi")) {
      title = "Donasi | Masjid Kagawa";
    } else if (path.startsWith("/kegiatan")) {
      title = "Kegiatan Masjid | Masjid Kagawa";
    } else if (path.startsWith("/artikel")) {
      title = "Artikel | Masjid Kagawa";
    } else if (path.startsWith("/contact")) {
      title = "Hubungi Kami | Masjid Kagawa";
    }

    // ADMIN
    else if (path.startsWith("/admin/login")) {
      title = "Login Admin | Masjid Kagawa";
    } else if (path.startsWith("/admin/register")) {
      title = "Register Admin | Masjid Kagawa";
    } else if (path.startsWith("/admin/dashboard")) {
      title = "Dashboard Admin | Masjid Kagawa";
    } else if (path.startsWith("/admin/prayer")) {
      title = "Jadwal Shalat Admin | Masjid Kagawa";
    } else if (path.startsWith("/admin/kegiatan")) {
      title = "Kegiatan Admin | Masjid Kagawa";
    } else if (path.startsWith("/admin/pengumuman")) {
      title = "Pengumuman Admin | Masjid Kagawa";
    } else if (path.startsWith("/admin/posts")) {
      title = "Artikel Admin | Masjid Kagawa";
    } else if (path.startsWith("/admin/donasi")) {
      title = "Donasi Admin | Masjid Kagawa";
    } else if (path.startsWith("/admin/contact")) {
      title = "Pesan Masuk | Masjid Kagawa";
    } else if (path.startsWith("/admin/settings")) {
      title = "Tentang Masjid Admin | Masjid Kagawa";
    } else if (path.startsWith("/admin/donation-confirmations")) {
      title = "Konfirmasi Donasi | Masjid Kagawa";
    }

    document.title = title;
  }, [location.pathname]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      offset: 120,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  return (
    <>
      {!isAdminRoute && <TopBar />}

      {!isAdminRoute && <RouteProgress />}

      <Routes>
        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/jadwal" element={<JadwalShalat />} />
          <Route path="/pengumuman" element={<Pengumuman />} />
          <Route path="/pengumuman/:id" element={<PengumumanDetail />} />
          <Route path="/tentang" element={<TentangMasjid />} />
          <Route path="/donasi" element={<Donasi />} />
          <Route path="/kegiatan" element={<KegiatanMasjid />} />
          <Route path="/kegiatan/:id" element={<KegiatanDetail />} />
          <Route path="/artikel" element={<Artikel />} />
          <Route path="/artikel/:slug" element={<ArtikelDetail />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<RegisterAdmin />} />
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/prayer" element={<AdminPrayer />} />
        <Route path="/admin/kegiatan" element={<AdminKegiatan />} />
        <Route path="/admin/pengumuman" element={<AdminPengumuman />} />
        <Route path="/admin/posts" element={<AdminPosts />} />
        <Route path="/admin/donasi" element={<AdminDonasi />} />
        <Route path="/admin/contact" element={<AdminContact />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route
          path="/admin/donation-confirmations"
          element={<AdminDonationConfirmations />}
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;