import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import MobileMenu from "./MobileMenu";
import "../../styles/components/Navbar.css";
import logo from "../../assets/images/logo-kmi3.png";

export default function Navbar() {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById("home-hero");

      // ✅ HALAMAN HOME → pakai trigger dari hero
      if (hero) {
        const heroBottom = hero.offsetTop + hero.offsetHeight;
        setIsSticky(window.scrollY >= heroBottom - 70);
      } 
      // ✅ HALAMAN LAIN → langsung sticky saat scroll sedikit
      else {
        setIsSticky(window.scrollY > 10);
      }
    };

    handleScroll(); // penting → set initial state

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar-main ${isSticky ? "sticky" : ""}`}>
      <div className="nav-container">
        <div className="brand-wrapper">
          <NavLink to="/" className="brand-home-link">
            <img src={logo} alt="Logo" className="logo-img" />

            <div className="brand-text-group">
              <span className="brand-title">Masjid Kagawa</span>
              <span className="brand-subtitle">
                Keluarga Muslim Indonesia Kagawa
              </span>
            </div>
          </NavLink>
        </div>

        <ul className="nav-links">
          <li><NavLink to="/">Beranda</NavLink></li>
          <li><NavLink to="/jadwal">Jadwal</NavLink></li>
          <li><NavLink to="/kegiatan">Kegiatan</NavLink></li>
          <li><NavLink to="/pengumuman">Pengumuman</NavLink></li>
          <li><NavLink to="/kajian">Kajian</NavLink></li>
          <li><NavLink to="/artikel">Artikel</NavLink></li>
          <li><NavLink to="/donasi">Donasi</NavLink></li>
          <li><NavLink to="/tentang">Tentang</NavLink></li>

          <li className="nav-cta">
            <NavLink to="/contact">Hubungi Kami</NavLink>
          </li>
        </ul>

        <div className="mobile-only">
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}