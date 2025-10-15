import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      navigate("/dashboard");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "4rem auto", display: "grid", gap: 12 }}>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
        <input
          type="email" placeholder="email"
          value={email} onChange={(e) => setEmail(e.target.value)} required
        />
        <input
          type="password" placeholder="password"
          value={pw} onChange={(e) => setPw(e.target.value)} required
        />
        <button type="submit">Log in</button>
      </form>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      <p>New here? <Link to="/signup">Create an account</Link></p>
    </div>
  );
}
