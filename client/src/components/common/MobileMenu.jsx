import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../../styles/components/MobileMenu.css";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <>
      <div className="burger-btn" onClick={() => setOpen(true)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div
        className={`menu-overlay ${open ? "show" : ""}`}
        onClick={closeMenu}
      ></div>

      <div className={`side-menu ${open ? "open" : ""}`}>
        <button className="close-btn" onClick={closeMenu}>
          ✕
        </button>

        <ul>
          <li>
            <NavLink to="/" onClick={closeMenu}>
              Beranda
            </NavLink>
          </li>
          <li>
            <NavLink to="/jadwal" onClick={closeMenu}>
              Jadwal Shalat
            </NavLink>
          </li>
          <li>
            <NavLink to="/pengumuman" onClick={closeMenu}>
              Pengumuman
            </NavLink>
          </li>
          <li>
            <NavLink to="/kegiatan" onClick={closeMenu}>
              Kegiatan Masjid
            </NavLink>
          </li>
          <li>
            <NavLink to="/kajian" onClick={closeMenu}>
              Kajian
            </NavLink>
          </li>
          <li>
            <NavLink to="/artikel" onClick={closeMenu}>
              Artikel
            </NavLink>
          </li>
          <li>
            <NavLink to="/donasi" onClick={closeMenu}>
              Donasi
            </NavLink>
          </li>
          <li>
            <NavLink to="/tentang" onClick={closeMenu}>
              Tentang Masjid
            </NavLink>
          </li>
        </ul>
      </div>
    </>
  );
}