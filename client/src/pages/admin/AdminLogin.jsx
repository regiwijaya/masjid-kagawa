// client/src/pages/admin/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data.msg || "Login gagal");
        return;
      }

      localStorage.setItem("adminToken", data.token);

      setMsg("Login sukses, mengalihkan...");
      setTimeout(() => {
        navigate("/admin/dashboard", { replace: true });
      }, 400);
    } catch (err) {
      setMsg("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card shadow-lg">
        {/* ✅ Logo clickable: kembali ke Home */}
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

        {/* Link text optional (juga via CSS) */}
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
