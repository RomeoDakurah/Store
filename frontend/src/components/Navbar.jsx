import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import logo from "../assets/logo.png"

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const isAdmin = user?.is_admin === true

  return (
    <header className="border-b bg-blue-50">
      <div className="mx-auto flex flex-wrap items-center justify-between px-4 py-2 max-w-full">
        
        {/* Left: Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src={logo}
            alt="CornerStore"
            className="h-10 w-auto sm:h-12 md:h-15"
          />
          <span className="text-base sm:text-lg font-semibold tracking-tight">
            CornerStore
          </span>
        </div>
  
        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            onClick={() => navigate("/cart")}
            className="rounded-md border px-2 py-1 sm:px-3 sm:py-1.5 hover:bg-gray-50"
          >
            Cart ({cart.length})
          </button>
  
          {user ? (
            <>
              {isAdmin && (
                <button
                  onClick={() => navigate("/admin/product/new")}
                  className="rounded-md border px-2 py-1 sm:px-3 sm:py-1.5 hover:bg-gray-50"
                >
                  Add product
                </button>
              )}
              <button
                onClick={logout}
                className="text-muted-foreground hover:text-black px-2 py-1 sm:px-3 sm:py-1.5"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-muted-foreground hover:text-black px-2 py-1 sm:px-3 sm:py-1.5"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="rounded-md bg-black px-3 py-1 sm:px-4 sm:py-2 text-white hover:bg-gray-800"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}