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
      let message;
      switch (e.code) {
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;
        case "auth/user-not-found":
          message = "No account found with that email.";
          break;
        case "auth/invalid-credential":
          message = "Incorrect password. Please try again.";
          break;
        case "auth/too-many-requests":
          message = "Too many failed attempts. Please wait and try again later.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Check your internet connection.";
          break;
        default:
          message = "An unexpected error occurred. Please try again.";
      }
      setErr(message);
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
