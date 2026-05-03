import axios from "axios";
import { useState } from "react";

export default function RegisterAdmin() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleRegister() {
    try {
      const res = await axios.post("http://localhost:5000/api/admin/register", {
        name,
        email,
        password
      });

      setMsg(res.data.msg);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Error");
    }
  }

  return (
    <>
      <h1>Register Admin Pertama</h1>

      <input
        placeholder="Nama"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleRegister}>Register</button>

      <p>{msg}</p>
    </>
  );
}
