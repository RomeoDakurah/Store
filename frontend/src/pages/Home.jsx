// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getProducts, api } from "../api/api";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import placeholder from "../assets/placeholder.png";
import Navbar from "../components/Navbar";
import getImageUrl from "../utils/getImageUrl";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.is_admin === true;
  const { cart } = useCart();

  // Track selected variant and image per product
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedImageIndices, setSelectedImageIndices] = useState({});

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await getProducts();
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    if (!loading && products.length > 0) {
      const initialSelection = {};
      products.forEach(p => {
        if (p.variants?.length > 0) {
          initialSelection[p.id] = p.variants[0].id; // first variant selected by default
        }
      });
      setSelectedVariants(initialSelection);
    }
  }, [loading, products]);

  // Admin actions
  const handleDelete = async (productId) => {
    try {
      await api().delete(`/products/${productId}`);
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Failed to delete product:", err.response?.data || err.message);
      alert("Failed to delete product");
    }
  };

  const handleEdit = (productId) => {
    navigate(`/admin/edit-product/${productId}`);
  };

  const handleVariantClick = (productId, variantId) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variantId }));
  
    setSelectedImageIndices(prev => ({ ...prev, [productId]: 0 }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight">Your online store, made simple</h1>
        <p className="mt-4 text-gray-600">
          Discover products and manage your store with CornerStore.
        </p>
      </section>

      {/* Products Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-20 flex-1">
        {loading && <p>Loading products…</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && products.length === 0 && <p>No products available yet.</p>}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const selectedVariantId = selectedVariants[product.id] || null;
            const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);

            // Determine images array: variant images first, fallback to product images
            let imagesArray = [];
            if (selectedVariant?.images?.length > 0) imagesArray = selectedVariant.images;
            else if (product.images?.length > 0) imagesArray = product.images;
            else imagesArray = [{ image: placeholder }];
            console.log(imagesArray);

            const imageIndex = selectedImageIndices[product.id] || 0;
            const mainImage = getImageUrl(imagesArray[imageIndex]?.image_url) || placeholder;

            return (
              <div
                key={product.id}
                className="rounded-xl border bg-white shadow-sm hover:shadow-md transition p-4 flex flex-col w-full sm:w-80"
              >
                {/* Main Product Image with arrows */}
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover object-center"
                  />

                  {imagesArray.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedImageIndices(prev => ({
                            ...prev,
                            [product.id]: (imageIndex - 1 + imagesArray.length) % imagesArray.length
                          }))
                        }
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md"
                      >
                        ◀
                      </button>
                      <button
                        onClick={() =>
                          setSelectedImageIndices(prev => ({
                            ...prev,
                            [product.id]: (imageIndex + 1) % imagesArray.length
                          }))
                        }
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md"
                      >
                        ▶
                      </button>
                    </>
                  )}
                  {/* Dots */}
                  {imagesArray.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {imagesArray.map((_, idx) => (
                        <span
                          key={idx}
                          className={`h-2 w-2 rounded-full ${idx === imageIndex ? "bg-black" : "bg-gray-300"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>


                {/* Product Info */}
                <div className="mt-4 flex-1">
                  <h3 className="font-medium text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    ${product.base_price.toFixed(2)}
                  </p>

                  {/* Variant Previews */}
                  {product.variants?.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto">
                      {product.variants.map((v) => {
                        const imgUrl =
                          (v.images?.[0]?.image_url) ||
                          (product.images?.[0]?.image_url) ||
                          placeholder;
                        return (
                          <img
                            key={v.id}
                            src={getImageUrl(imgUrl)}
                            alt={`${product.name} - ${v.size}`}
                            className={`h-10 w-10 rounded border object-cover flex-shrink-0 cursor-pointer ${
                              selectedVariantId === v.id ? "border-2 border-black" : "border"
                            }`}
                            title={`${v.size}${v.color ? ` - ${v.color}` : ""}`}
                            onClick={() => handleVariantClick(product.id, v.id)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 space-y-2">
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product.id)}
                        className="flex-1 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 rounded-md border border-red-500 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() =>
                      navigate(
                        `/products/${product.id}${
                          selectedVariantId ? `?variant=${selectedVariantId}` : ""
                        }`
                      )
                    }
                    className="w-full rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
                  >
                    View Product
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
