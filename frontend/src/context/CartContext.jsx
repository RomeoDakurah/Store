import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.product_id === item.product_id &&
          i.variant_id === item.variant_id
      );
  
      // If item already exists → increase quantity
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
        };
        return updated;
      }
  
      // Otherwise → add new item
      return [...prev, item];
    });
  };
  

  const removeFromCart = (idx) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, setCart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
