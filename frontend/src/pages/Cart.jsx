import { useCart } from "../context/CartContext";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomBar from "../components/BottonBar";
import CartTable from "../components/CartTable";

export default function Cart() {
  const { cart, setCart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, i) => sum + i.quantity * i.unit_price,
    0
  );

  const handleCheckout = async () => {navigate("/checkout")}

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />
    <div className="container py-4">
      <h2>Your Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <CartTable
            cart={cart}
            setCart={setCart}
            removeItem={(variant_id) =>
              setCart((prev) => prev.filter((i) => i.variant_id !== variant_id))
            }
          />

          <div className="d-flex justify-content-between align-items-center">
            <h4>Total: ${total.toFixed(2)}</h4>
            <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/")}
            >
              Add To Cart
            </button>

            <button
              className="btn btn-success btn-sm"
              onClick={handleCheckout}
            >
              Checkout
            </button>
            </div>
          </div>
        </>
      )}
      </div>
      <div className="mt-auto">
        <BottomBar />
      </div>
    </div>
  );
}
