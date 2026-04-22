import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"

export default function BottomBar() {
  const { user } = useAuth()
  const isAdmin = user?.is_admin === true

  return (
    <footer
      style={{
        display: "flex",
        padding: "10px 20px",
        fontSize: "12px",
        borderTop: "1px solid #ddd",
        color: "bg-gray-50",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "16px",
          alignItems: "center",
        }}
      >
        <Link style={{ color: "#888", textDecoration: "none" }} to="/">
          Home
        </Link>

        <Link style={{ color: "#888", textDecoration: "none" }} to="/products">
          Products
        </Link>

        {user ? (
          <Link style={{ color: "#888", textDecoration: "none" }} to="/orders">
            My Orders
          </Link>
        ) : (
          <Link style={{ color: "#888", textDecoration: "none" }} to="/login">
            Account
          </Link>
        )}

        {isAdmin && (
          <Link style={{ color: "#888", textDecoration: "none" }} to="/admin">
            Admin
          </Link>
        )}
      </div>
    </footer>
  );
}