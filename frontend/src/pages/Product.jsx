import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { api } from "../api/api";
import { useCart } from "../context/CartContext";
import placeholder from "../assets/placeholder.png";
import Navbar from "../components/Navbar";
import BottomBar from "../components/BottonBar";
import getImageUrl from "../utils/getImageUrl";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, setCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState("");
  const [mainImage, setMainImage] = useState(placeholder);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialVariantId = Number(searchParams.get("variant"));

  useEffect(() => {
    if (!product) return;
  
    // Determine initial selected variant
    let initialVariant = null;
    if (initialVariantId) {
      initialVariant = product.variants.find(v => v.id === initialVariantId);
    }
    if (!initialVariant && product.variants.length > 0) {
      initialVariant = product.variants[0];
    }
  
    selectVariant(initialVariant);
  }, [product, initialVariantId]);

  useEffect(() => {
    api().get(`/products/${id}`).then((res) => {
      setProduct(res.data);
    });
  }, [id]);

  const selectVariant = (v) => {
    setSelectedVariant(v);
    setMainImage(getImageUrl(v.image_url) || getImageUrl(product.image_url) || placeholder);
    setMainImageIndex(0);

    // Update URL
    setSearchParams({ variant: v.id });
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    console.log(product);
  
    // Find current quantity of this variant in the cart
    const existingItem = cart.find((i) => i.variant_id === selectedVariant.id);
    const existingQty = existingItem ? existingItem.quantity : 0;
  
    // Check if adding would exceed stock
    if (existingQty + quantity > selectedVariant.quantity) {
      setQuantityError(
        `Only ${selectedVariant.quantity} units available. You already have ${existingQty} in your cart.`
      );
      return;
    }
    // Add to cart
    if (existingItem) {
      // update existing cart item quantity
      setCart((prev) =>
        prev.map((i) =>
          i.variant_id === selectedVariant.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      );
    } else {
      // add new item
      setCart((prev) => [
        ...prev,
        {
          product_id: product.id,
          variant_id: selectedVariant.id,
          quantity,
          unit_price: selectedVariant.price || product.base_price,
          name: product.name,
          variant_label: `${selectedVariant.color} / ${selectedVariant.size}`,
          available_quantity: selectedVariant.quantity,
        },
      ]);
    }
    alert("Product added to cart!");
    navigate("/");
    setQuantityError(""); // clear any previous error
  };
  
  

  if (!product) return <p>Loading product…</p>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="container py-4">
        <div className="row">
          {/* Main Image */}
          <div className="col-md-6">
            {selectedVariant && selectedVariant.images?.length > 0 ? (
              <div>
                <img
                  src={getImageUrl(selectedVariant.images[mainImageIndex].image_url)}
                  alt={`${selectedVariant.color} ${selectedVariant.size}`}
                  className="img-fluid rounded mb-2"
                  style={{ width: "540px", height: "540px", objectFit: "cover" }}
                />

                {/* Small thumbnails for images of the selected variant */}
                <div className="d-flex gap-2 flex-wrap mt-2">
                  {selectedVariant.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={getImageUrl(img.image_url)}
                      alt={`${selectedVariant.color} ${selectedVariant.size} ${idx}`}
                      className={`rounded border ${mainImageIndex === idx ? "border-2 border-black" : "border"}`}
                      style={{ width: "60px", height: "60px", objectFit: "cover", cursor: "pointer" }}
                      onClick={() => setMainImageIndex(idx)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // fallback if no images for this variant
              <img
                src={getImageUrl(product.images?.[0]?.image_url) || placeholder}
                alt={product.name}
                className="img-fluid rounded"
                style={{ maxHeight: "500px", objectFit: "contain" }}
              />
            )}
          </div>

          {/* Product Info */}
          <div className="col-md-6">
            <h2>{product.name}</h2>
            <p className="fs-4">${product.base_price.toFixed(2)}</p>

            {/* Variant dropdown */}
            {product.variants?.length > 0 && (
              <div className="mb-3">
                <label className="form-label">Choose variant</label>
                <select
                  className="form-select"
                  value={selectedVariant?.id || ""}
                  onChange={(e) => {
                    const v = product.variants.find((v) => v.id === Number(e.target.value));
                    if (v) selectVariant(v);
                  }}
                >
                  {product.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.color} {v.size} ({v.quantity ?? 0} in stock)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Variant Thumbnails */}
            <div className="d-flex gap-2 mt-3 flex-wrap">
              {product.variants?.map((v) => {
                const variantThumbnail =
                  v.images?.[0]?.image_url || product.images?.[0]?.image_url || placeholder;
                return (
                  <img
                    key={v.id}
                    src={getImageUrl(variantThumbnail)}
                    alt={`${v.color} ${v.size}`}
                    className={`rounded border ${selectedVariant?.id === v.id ? "border-2 border-black" : "border"}`}
                    style={{ width: "60px", height: "60px", objectFit: "cover", cursor: "pointer" }}
                    onClick={() => selectVariant(v)}
                    title={`${v.color} / ${v.size}`}
                  />
                );
              })}
            </div>

            {/* Quantity */}
            <div className="mb-3">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  const valueStr = e.target.value.replace(/^0+/, "");
                  const value = Number(valueStr);
                  if (!valueStr) setQuantity("");
                  else if (value >= 1) setQuantity(value);
                  setQuantityError("");
                }}
                onBlur={() => { if (!quantity || quantity < 1) setQuantity(1); }}
                className="form-control"
                disabled={!selectedVariant}
              />
              {quantityError && <div className="text-danger mt-1">{quantityError}</div>}
            </div>

            <button
              className="btn btn-success"
              disabled={!selectedVariant}
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>

            <div className="mt-4">
              <p className="fs-5 text-muted">
                {product.description || "[No description]"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <BottomBar />
    </div>
  );
}