import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const handleCheckout = async () => {
    const shopper_name = user?.name || guestName;
    const shopper_email = user?.email || guestEmail;

    if (!shopper_name || !shopper_email) {
      alert("Please enter name and email or sign in.");
      return;
    }

    try {
      await api().post("/orders", {
        shopper_name,
        shopper_email,
        status: "pending",
        items: cart.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id,
          quantity: i.quantity,
          price: i.unit_price,
          name: i.name,
        })),
      });

      alert("Order placed successfully!");
      clearCart();
      navigate("/"); // you can later navigate to a confirmation page
    } catch (err) {
      console.error(err);
      alert("Checkout failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />
    <div className="container py-4">
      <h2>Checkout</h2>

      {user ? (
        <p>Signed in as {user.name} ({user.email})</p>
      ) : (
        <div className="mb-3">
          <h5>Guest Checkout</h5>
          <input
            className="form-control mb-2"
            placeholder="Name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
          <input
            className="form-control"
            placeholder="Email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
          />
        </div>
      )}

      <h5>Order Summary</h5>
      <ul className="list-group mb-3">
        {cart.map((item) => (
          <li
            key={item.variant_id}
            className="list-group-item d-flex justify-content-between"
          >
            {item.name} ({item.variant_label}) x {item.quantity}
            <span>${(item.quantity * item.unit_price).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <strong>
        Total: $
        {cart.reduce((sum, i) => sum + i.quantity * i.unit_price, 0).toFixed(2)}
      </strong>

      <div className="mt-3">
        <button
          className="btn btn-success"
          disabled={cart.length === 0}
          onClick={handleCheckout}
        >
          Place Order
        </button>
      </div>
    </div>
    </div>
  );
}
