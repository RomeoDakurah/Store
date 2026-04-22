import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";
import Navbar from "../components/Navbar";
import BottomBar from "../components/BottonBar";

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.is_admin === true;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api().get("/orders");
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api().patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleAdminEdit = async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
  
    const newName = prompt("Shopper Name:", order.shopper_name);
    const newEmail = prompt("Shopper Email:", order.shopper_email || "");
  
    if (newName === null || newEmail === null) return;
  
    try {
      await api().put(`/orders/${orderId}`, {
        shopper_name: newName,
        shopper_email: newEmail,
        status: order.status,
        items: order.items.map((i) => ({
          variant_id: i.variant_id,
          quantity: i.quantity,
          unit_price: i.price, // backend expects unit_price
        })),
      });
  
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                shopper_name: newName,
                shopper_email: newEmail,
              }
            : o
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update order");
    }
  };

  if (loading) return <p>Loading orders…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <h2 className="mb-4">Orders</h2>
      {orders.length === 0 && <p>No orders yet.</p>}

      {orders.map((order) => (
        <div key={order.id} className="card mb-4 shadow-sm">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Order #{order.id}</span>
            <span>Status: {order.status}</span>
          </div>
          <div className="card-body">
            <p>
              <strong>Shopper:</strong> {order.shopper_name}{" "}
              {order.shopper_email && <>({order.shopper_email})</>}
            </p>

            <table className="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Variant</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.product_name}</td>
                    <td>{item.variant_name}</td>
                    <td>{item.quantity}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-end">
              <strong>
                Total: $
                {order.items
                  .reduce((sum, i) => sum + i.quantity * i.price, 0)
                  .toFixed(2)}
              </strong>
            </p>

            {isAdmin && (
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleStatusChange(order.id, "shipped")}
                  disabled={order.status === "shipped" || order.status === "completed"}
                >
                  Mark Shipped
                </button>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleStatusChange(order.id, "completed")}
                  disabled={order.status === "completed"}
                >
                  Mark Completed
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/admin/orders/${order.id}/edit`)}
                >
                  Edit Order
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
      <div className="mt-auto">
        <BottomBar />
      </div>
    </div>
  );
}

