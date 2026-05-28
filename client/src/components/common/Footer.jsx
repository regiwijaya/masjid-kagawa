import { useEffect, useState } from "react";
import "../../styles/components/Footer.css";
import http from "../../api/http";

export default function Footer() {
  const [data, setData] = useState({
    footerDescription:
      "Pusat ibadah, dakwah, pendidikan, dan kegiatan sosial bagi komunitas Muslim di Kagawa, Jepang.",
    address: "Kagawa, Jepang",
    email: "",
    phone: "",
    imamDuty: "",
    muadzinDuty: "",
    social: {
      facebook: "",
      instagram: "",
      youtube: "",
    },
  });

  useEffect(() => {
    let alive = true;

    const fetchFooterData = async () => {
      try {
        const res = await http.get("/api/about-settings");
        const payload = res?.data || {};

        if (!alive) return;

        setData({
          footerDescription:
            payload.footerDescription ||
            "Pusat ibadah, dakwah, pendidikan, dan kegiatan sosial bagi komunitas Muslim di Kagawa, Jepang.",
          address: payload.address || "Kagawa, Jepang",
          email: payload.email || "",
          phone: payload.phone || "",
          imamDuty: payload.imamDuty || "",
          muadzinDuty: payload.muadzinDuty || "",
          social: {
            facebook: payload?.social?.facebook || "",
            instagram: payload?.social?.instagram || "",
            youtube: payload?.social?.youtube || "",
          },
        });
      } catch (err) {
        console.error("Gagal memuat footer settings:", err);
      }
    };

    fetchFooterData();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <footer className="footer-dark">
      <div className="site-shell">
        <div className="footer-grid">

          {/* BRAND */}
          <div className="footer-col">
            <h4 className="footer-brand-title">Masjid Kagawa</h4>
            <p className="footer-description">{data.footerDescription}</p>

            <div className="footer-socials">
              {data.social.facebook && (
                <a href={data.social.facebook} className="social-icon" target="_blank" rel="noreferrer">
                  <i className="bi bi-facebook"></i>
                </a>
              )}

              {data.social.instagram && (
                <a href={data.social.instagram} className="social-icon" target="_blank" rel="noreferrer">
                  <i className="bi bi-instagram"></i>
                </a>
              )}

              {data.social.youtube && (
                <a href={data.social.youtube} className="social-icon" target="_blank" rel="noreferrer">
                  <i className="bi bi-youtube"></i>
                </a>
              )}
            </div>
          </div>

          {/* NAV */}
          <div className="footer-col">
            <h5 className="footer-col-title">Navigasi</h5>
            <ul className="footer-links">
              <li><a href="/">Beranda</a></li>
              <li><a href="/jadwal">Jadwal Shalat</a></li>
              <li><a href="/kegiatan">Kegiatan</a></li>
              <li><a href="/pengumuman">Pengumuman</a></li>
              <li><a href="/artikel">Artikel</a></li>
              <li><a href="/donasi">Donasi</a></li>
              <li><a href="/tentang">Tentang</a></li>
            </ul>
          </div>

          {/* CONTACT */}
          <div className="footer-col">
            <h5 className="footer-col-title">Kontak</h5>
            <ul className="footer-contact-list">

              {data.address && (
                <li>
                  <i className="bi bi-geo-alt-fill"></i>
                  <span>{data.address}</span>
                </li>
              )}

              {data.email && (
                <li>
                  <i className="bi bi-envelope-fill"></i>
                  <span>{data.email}</span>
                </li>
              )}

              {data.phone && (
                <li>
                  <i className="bi bi-telephone-fill"></i>
                  <span>{data.phone}</span>
                </li>
              )}

            </ul>

            {(data.imamDuty || data.muadzinDuty) && (
              <div className="footer-duty">

                {data.imamDuty && (
                  <>
                    <h6>Imam On-Duty</h6>
                    <div className="badge-box">{data.imamDuty}</div>
                  </>
                )}

                {data.muadzinDuty && (
                  <>
                    <h6>Muadzin On-Duty</h6>
                    <div className="badge-box">{data.muadzinDuty}</div>
                  </>
                )}

              </div>
            )}
          </div>

        </div>

        <div className="footer-bottom">
          ©️ {new Date().getFullYear()} Masjid Kagawa — All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}