export default function CartTable({
    cart,
    setCart,
    removeItem,
    mode = "customer",
  }) {
    const updateQty = (variant_id, delta) => {
        setCart((prev) =>
          prev.map((i) => {
            if (i.variant_id !== variant_id) return i;
      
            const newQty = i.quantity + delta;
      
            const clampedQty = Math.max(
              1,
              Math.min(newQty, i.available_quantity ?? Infinity)
            );
      
            return { ...i, quantity: clampedQty };
          })
        );
      };
  
    return (
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
            {cart.map((item) => (
              <tr key={item.variant_id}>
                <td>
                  {item.name}
                  <br />
                  <small className="text-muted">
                    {item.variant_label}
                  </small>
                </td>
  
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <button onClick={() => updateQty(item.variant_id, -1)}>-</button>
                    {item.quantity}
                    <button
                    onClick={() => updateQty(item.variant_id, 1)}
                    disabled={item.quantity >= item.available_quantity}
                    >
                    +
                    </button>
                  </div>
                </td>
  
                <td>${item.unit_price.toFixed(2)}</td>
  
                <td>${(item.quantity * item.unit_price).toFixed(2)}</td>
  
                <td>
                  <button onClick={() => removeItem(item.variant_id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }