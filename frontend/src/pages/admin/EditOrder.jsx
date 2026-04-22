import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/api";
import CartTable from "../../components/CartTable";
import Navbar from "../../components/Navbar";
import BottomBar from "../../components/BottonBar";
import { useNavigate } from "react-router-dom";

export default function AdminEditOrder() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await api().get(`/orders/${orderId}`);

      const items = res.data.items || [];

      setCart(
      items.map((i) => ({
            variant_id: i.variant_id,
            name: i.product_name,
            variant_label: i.variant_name,
            quantity: i.quantity,
            unit_price: i.price,
      }))
      );
    }

    load();
  }, [orderId]);

  const save = async () => {
    await api().put(`/orders/${orderId}`, {
      shopper_name: "Admin",
      shopper_email: null,
      status: "pending",
      items: cart.map((i) => ({
        variant_id: i.variant_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
    });

    alert("Order updated");
    navigate("/orders");
  };

  const deleteOrder = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this order?");
    if (!confirmDelete) return;
  
    try {
      await api().delete(`/orders/${orderId}`);
      alert("Order deleted");
      navigate("/orders");
    } catch (err) {
      console.error(err);
      alert("Failed to delete order");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
  
      <div className="container py-4">
  
        {/* 1. ORDER SECTION */}
        <h3>Editing Order #{orderId}</h3>
  
        <CartTable
          cart={cart}
          setCart={setCart}
          removeItem={(id) =>
            setCart((prev) => prev.filter((i) => i.variant_id !== id))
          }
        />
  
        {/* 2. ACTIONS */}
        <div className="d-flex justify-content-end align-items-center gap-2 mt-4">

        <button
            className="btn btn-outline-danger btn-sm px-3 py-1 fw-semibold"
            onClick={deleteOrder}
        >
            Delete Order
        </button>

        <button
            className="btn btn-outline-secondary btn-sm px-3 py-1 fw-medium"
            onClick={() => navigate("/orders")}
        >
            Cancel
        </button>

        <button
            className="btn btn-primary btn-sm px-3 py-1 fw-semibold shadow-sm"
            onClick={save}
        >
            Save Changes
        </button>

        </div>
  
      </div>
  
      <BottomBar />
    </div>
  );}