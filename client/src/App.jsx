import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// COMMON COMPONENTS
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

// PUBLIC PAGES
import Home from "./pages/public/Home";
import JadwalShalat from "./pages/public/JadwalShalat";
import Pengumuman from "./pages/public/Pengumuman";
import PengumumanDetail from "./pages/public/PengumumanDetail";
import TentangMasjid from "./pages/public/TentangMasjid";
import Donasi from "./pages/public/Donasi";
import KegiatanMasjid from "./pages/public/KegiatanMasjid";
import KegiatanDetail from "./pages/public/KegiatanDetail";
import KajianMingguIni from "./pages/public/KajianMingguIni";
import KajianDetail from "./pages/public/KajianDetail";
import Artikel from "./pages/public/Artikel";
import ArtikelDetail from "./pages/public/ArtikelDetail";

// ADMIN PAGES
import RegisterAdmin from "./pages/admin/RegisterAdmin";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPrayer from "./pages/admin/AdminPrayer";
import AdminKegiatan from "./pages/admin/AdminKegiatan";
import AdminPengumuman from "./pages/admin/AdminPengumuman";
import AdminKajian from "./pages/admin/AdminKajian";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminDonasi from "./pages/admin/AdminDonasi";
import AdminSettings from "./pages/admin/AdminSettings";

import AOS from "aos";
import "aos/dist/aos.css";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    window.scrollTo(0, 0);
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
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/jadwal" element={<JadwalShalat />} />
        <Route path="/pengumuman" element={<Pengumuman />} />
        <Route path="/pengumuman/:id" element={<PengumumanDetail />} />
        <Route path="/tentang" element={<TentangMasjid />} />
        <Route path="/donasi" element={<Donasi />} />
        <Route path="/kajian" element={<KajianMingguIni />} />
        <Route path="/kajian/:id" element={<KajianDetail />} />
        <Route path="/kegiatan" element={<KegiatanMasjid />} />
        <Route path="/kegiatan/:id" element={<KegiatanDetail />} />
        <Route path="/artikel" element={<Artikel />} />
        <Route path="/artikel/:slug" element={<ArtikelDetail />} />

        {/* ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<RegisterAdmin />} />

        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/admin/prayer" element={<AdminPrayer />} />
        <Route path="/admin/kegiatan" element={<AdminKegiatan />} />
        <Route path="/admin/pengumuman" element={<AdminPengumuman />} />
        <Route path="/admin/kajian" element={<AdminKajian />} />
        <Route path="/admin/posts" element={<AdminPosts />} />
        <Route path="/admin/donasi" element={<AdminDonasi />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;