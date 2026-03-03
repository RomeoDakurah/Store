import { Link } from "react-router-dom";

export default function Header({ user, logout, isAdmin }) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "32px",
      }}
    >
      <h1>🛒 Store</h1>

      <nav>
        {user ? (
          <>
            <span style={{ marginRight: "16px" }}>
              Hello, {user.name}
            </span>
            <button onClick={logout}>Logout</button>

            {isAdmin && (
              <Link to="/admin/products/new" style={{ marginLeft: "16px" }}>
                  ➕ Add Product
              </Link>
            )}
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: "16px" }}>
              Login
            </Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </nav>
    </header>
  );
}
