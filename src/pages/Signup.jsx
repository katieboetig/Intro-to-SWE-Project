import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pw);
      if (name) await updateProfile(cred.user, { displayName: name });
      navigate("/dashboard");
    } catch (e) {
      let message;
      switch (e.code) {
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;
        case "auth/email-already-in-use":
          message = "Email address already has an account associated with it.";
          break;
        case "auth/weak-password":
          message = "Password too weak. Use at least 6 characters.";
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
      <h1>Create account</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
        <input placeholder="name (optional)" value={name} onChange={(e)=>setName(e.target.value)} />
        <input type="email" placeholder="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <input type="password" placeholder="password (min 6 chars)" value={pw} onChange={(e)=>setPw(e.target.value)} required />
        <button type="submit">Sign up</button>
      </form>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
