import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../auth/AuthContext";   // <-- no trailing dot, exact casing

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div style={{ maxWidth: 640, margin: "4rem auto", display: "grid", gap: 12 }}>
      <h1>Welcome, {user?.displayName || user?.email}</h1>
      <p>This is where your fridge scanner & recipes UI will go.</p>
      <button onClick={() => signOut(auth)}>Log out</button>
    </div>
  );
}
