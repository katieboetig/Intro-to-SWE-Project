import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";        // <-- same folder, exact casing

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}
