import { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";
import "../../styles/pages/AdminLogin.css";
import logoMasjid from "../../assets/images/logo-kmi.png";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const loginAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await http.post("/api/admin/login", {
        email,
        password,
      });

      const data = res.data;

      if (!data?.token) {
        setMsg("Login gagal: token tidak ditemukan.");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("token", data.token);

      if (data.admin) {
        localStorage.setItem("admin", JSON.stringify(data.admin));
      }

      setMsg("Login sukses, mengalihkan...");

      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 300);
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      const message =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        "Tidak dapat terhubung ke server";

      setMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card shadow-lg">
        <button
          type="button"
          className="admin-logo-btn"
          onClick={() => navigate("/")}
          aria-label="Kembali ke Home"
          title="Kembali ke Home"
        >
          <img src={logoMasjid} alt="Logo Masjid" className="admin-login-logo" />
        </button>

        <h2 className="admin-login-title">Admin Panel</h2>
        <p className="admin-login-subtitle">Masjid Kagawa • KMI Japan</p>

        <form onSubmit={loginAdmin} className="admin-login-form">
          <input
            type="email"
            placeholder="Email"
            className="admin-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Password"
            className="admin-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <button className="admin-login-btn" disabled={loading}>
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        {msg && <p className="admin-login-msg">{msg}</p>}

        <button
          type="button"
          className="admin-back-home"
          onClick={() => navigate("/")}
        >
          Kembali ke Home
        </button>
      </div>
    </div>
  );
}