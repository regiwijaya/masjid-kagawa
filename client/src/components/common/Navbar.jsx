import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import MobileMenu from "./MobileMenu";
import "../../styles/components/Navbar.css";
import logo from "../../assets/images/logo-kmi3.png";

export default function Navbar() {
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsFloating(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar-premium ${isFloating ? "floating" : ""}`}>
      <div className="nav-container">
        <div className="brand-wrapper">
          <NavLink to="/" className="brand-home-link">
            <img src={logo} alt="Logo Masjid" className="logo-img" />

            <div className="brand-text-group">
              <span className="brand-title">MASJID KAGAWA</span>
              <span className="brand-subtitle">
                Keluarga Muslim Indonesia Kagawa
              </span>
            </div>
          </NavLink>
        </div>

        <ul className="nav-links">
          <li>
            <NavLink to="/" end>
              Beranda
            </NavLink>
          </li>
          <li>
            <NavLink to="/jadwal">Jadwal</NavLink>
          </li>
          <li>
            <NavLink to="/kegiatan">Kegiatan</NavLink>
          </li>
          <li>
            <NavLink to="/pengumuman">Pengumuman</NavLink>
          </li>
          <li>
            <NavLink to="/kajian">Kajian</NavLink>
          </li>
          <li>
            <NavLink to="/artikel">Artikel</NavLink>
          </li>
          <li>
            <NavLink to="/donasi">Donasi</NavLink>
          </li>
          <li>
            <NavLink to="/tentang">Tentang</NavLink>
          </li>
        </ul>

        <div className="mobile-only">
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}