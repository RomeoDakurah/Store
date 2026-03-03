import { useCart } from "../context/CartContext";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

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
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    {item.name}
                    <br />
                    <small className="text-muted">
                        {item.variant_label}
                    </small>
                  </td>
                  <td>
                  <div className="d-flex align-items-center gap-2">
                    <button
                    className="btn btn-sm btn-outline-secondary"
                    style={{ border: "none" }}
                    onClick={() =>
                        setCart((prev) =>
                        prev.map((i) =>
                            i.variant_id === item.variant_id && i.quantity > 1
                            ? { ...i, quantity: i.quantity - 1 }
                            : i
                        )
                        )
                    }
                    >
                    -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                    className="btn btn-sm btn-outline-secondary"
                    style={{ border: "none" }}
                    onClick={() => {
                        let reachedMax = false;

                        setCart((prev) =>
                        prev.map((i) => {
                            if (i.variant_id === item.variant_id) {
                            if (i.quantity < i.available_quantity) {
                                return { ...i, quantity: i.quantity + 1 };
                            } else {
                                reachedMax = true; // flag to show alert later
                            }
                            }
                            return i;
                        })
                        );

                        if (reachedMax) alert("Reached max available quantity");
                    }}
                    >
                    +
                    </button>

                </div>
                  </td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td>${(item.quantity * item.unit_price).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => removeFromCart(idx)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-between align-items-center">
            <h4>Total: ${total.toFixed(2)}</h4>
            <button className="btn btn-success" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
    </div>
  );
}
