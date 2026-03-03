// src/pages/EditProduct.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import Navbar from "../../components/Navbar";
import getImageUrl from "../../utils/getImageUrl";

// Helpers
const generateSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const generateSku = (slug, { color, size }) =>
  `${slug.toUpperCase()}${
    color ? "-" + color.toUpperCase() : ""
  }-${size.toUpperCase()}`;

export default function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch product + variants
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await api().get(`/products/${productId}`);
        setProduct(res.data);
        const normalizedVariants = (res.data.variants || []).map((v) => ({
          ...v,
          color: v.color ?? "",
          size: v.size ?? "",
          sku: v.sku ?? "",
          quantity: v.quantity ?? 0,
          active: true,
          image_url: v.image_url ?? "",
          images: v.images ?? [],
        }));
        setVariants(normalizedVariants);
      } catch (err) {
        console.error(err.response?.data || err.message);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  // Product change
  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "name") {
      const slug = generateSlug(value);

      setProduct((prev) => ({ ...prev, name: value, slug }));

      // Regenerate SKUs when product name changes
      setVariants((prev) =>
        prev.map((v) => ({
          ...v,
          sku: generateSku(slug, v),
        }))
      );
    } else {
      setProduct((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Variant change
  const handleVariantChange = (index, e) => {
    const { name, value, type, checked } = e.target;

    setVariants((prev) => {
      const updated = [...prev];
      const v = updated[index];

      const newValue =
        type === "checkbox"
          ? checked
          : name === "quantity"
          ? Number(value)
          : value;

      const updatedVariant = {
        ...v,
        [name]: newValue,
      };

      // Regenerate SKU if color or size changes
      if (name === "color" || name === "size") {
        updatedVariant.sku = generateSku(product.slug, {
          ...updatedVariant,
          [name]: newValue,
        });
      }

      updated[index] = updatedVariant;
      return updated;
    });
  };

  // Add / remove variants
  const addVariant = () =>
    setVariants([
      ...variants,
      { size: "", color: "", quantity: 0, active: true, image_url: "" },
    ]);

  const removeVariant = (index) =>
    setVariants(variants.filter((_, i) => i !== index));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
  
    // if product.images exists use its length for position
    const position = product.images?.length || 0;
    formData.append("position", position);
  
    try {
      const res = await api().post(
        `/products/${productId}/upload-image`,
        formData
      );
  
      // append to images array instead of replacing single image_url
      setProduct((prev) => ({
        ...prev,
        images: [...(prev.images || []), { image_url: res.data.image_url }],
      }));
    } catch (err) {
      console.error("Upload failed:", err.response?.data || err.message);
      alert("Image upload failed");
    }
  };
  
  const handleRemoveProductImage = async (imageId) => {
    try {
      await api().delete(`/products/product-images/${imageId}`);
  
      // Update local state
      setProduct(prev => ({
        ...prev,
        images: prev.images.filter(img => img.id !== imageId)
      }));
    } catch (err) {
      console.error("Failed to delete image", err);
    }
  };
  
  const handleVariantImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const variant = variants[index];
  
    // If variant has no ID yet, block upload
    if (!variant.id) {
      alert("Save product before uploading images for new variants.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
  
    const position = variant.images?.length || 0;
    formData.append("position", position);
  
    try {
      const res = await api().post(
        `/variants/${variant.id}/upload-image`,
        formData
      );
  
      setVariants((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          images: [...(updated[index].images || []), { image_url: res.data.image_url }],
        };
        return updated;
      });
    } catch (err) {
      console.error("Variant upload failed:", err.response?.data || err.message);
      alert("Variant image upload failed");
    }
  };

  const handleRemoveVariantImage = async (variantIndex, imageId) => {
    try {
      // Call backend delete API
      await api().delete(`/variants/variant-images/${imageId}`);
  
      // Update state
      setVariants(prev => {
        const newVariants = [...prev];
        newVariants[variantIndex].images = newVariants[variantIndex].images.filter(
          img => img.id !== imageId
        );
        return newVariants;
      });
    } catch (err) {
      console.error("Failed to delete variant image", err);
    }
  };
  

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 1️⃣ Update product
      await api().put(`/products/${productId}`, {
        name: product.name,
        slug: product.slug,
        description: product.description,
        base_price: Number(product.base_price),
        active: product.active,
      });

      // 2️⃣ Update / create variants
      for (const v of variants) {
        const payload = {
          size: v.size,
          color: v.color,
          sku: v.sku || generateSku(product.slug, v),
          quantity: Number(v.quantity),
          active: v.active,
        };

        if (v.id) {
          await api().put(`/variants/${v.id}`, payload);
        } else {
          await api().post(`/variants/product/${productId}`, payload);
        }
      }

      alert("Product updated successfully!");
      navigate("/");
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Failed to update product");
    }
  };

  if (loading) return <p>Loading product...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />
    <div className="container py-4" style={{ maxWidth: "700px" }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="card-title mb-4">Edit Product</h3>
          <form onSubmit={handleSubmit}>
            {/* Product Info */}
            <fieldset className="mb-4">
              <legend>Product Info</legend>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={product.name}
                  onChange={handleProductChange}
                  placeholder="Product Name"
                  required
                />
              </div>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  name="description"
                  value={product.description}
                  onChange={handleProductChange}
                  placeholder="Description"
                  rows={3}
                ></textarea>
              </div>
              <div className="mb-3">
                <input
                  type="number"
                  className="form-control"
                  name="base_price"
                  value={product.base_price}
                  onChange={handleProductChange}
                  placeholder="Base Price"
                  step="0.01"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Product Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <div className="d-flex flex-wrap mt-2">
                  {product.images?.map((img, i) => (
                    <div key={i} className="position-relative me-2 mb-2">
                      <img
                        src={getImageUrl(img.image_url)}
                        alt="Product"
                        className="rounded"
                        style={{ width: "120px", height: "120px", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveProductImage(img.id)}
                        className="btn btn-sm btn-danger position-absolute top-0 end-0"
                        style={{ padding: "0 6px" }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="active"
                  checked={product.active}
                  onChange={handleProductChange}
                  id="productActive"
                />
                <label className="form-check-label" htmlFor="productActive">
                  Active
                </label>
              </div>
            </fieldset>

            {/* Variants */}
            <fieldset className="mb-4">
              <legend>Variants</legend>
              {variants.map((v, i) => (
                <div key={v.id || i} className="card mb-3 p-3 shadow-sm">
                  <div className="row g-2">
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        name="color"
                        value={v.color || ""}
                        onChange={(e) => handleVariantChange(i, e)}
                        placeholder="Color"
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        name="size"
                        value={v.size}
                        onChange={(e) => handleVariantChange(i, e)}
                        placeholder="Size"
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="number"
                        className="form-control"
                        name="quantity"
                        value={v.quantity}
                        onChange={(e) => handleVariantChange(i, e)}
                        placeholder="Quantity"
                      />
                    </div>
                    <div className="col-md-12 mt-2">
                      <label className="form-label">Variant Image</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => handleVariantImageUpload(i, e)}
                      />
                      <div className="d-flex flex-wrap mt-2">
                        {v.images?.map((img, idx) => (
                          <div key={idx} className="position-relative me-2 mb-2">
                            <img
                              src={getImageUrl(img.image_url)}
                              alt="Variant"
                              className="rounded"
                              style={{ width: "120px", height: "120px", objectFit: "cover" }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveVariantImage(i, img.id)}
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              style={{ padding: "0 6px" }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <input type="text" className="form-control" value={v.sku || ""} disabled />
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-2">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="active"
                        checked={v.active}
                        onChange={(e) => handleVariantChange(i, e)}
                        id={`variantActive${i}`}
                      />
                      <label className="form-check-label" htmlFor={`variantActive${i}`}>
                        Active
                      </label>
                    </div>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeVariant(i)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-secondary mb-3" onClick={addVariant}>
                Add Variant
              </button>
            </fieldset>

            <button type="submit" className="btn btn-primary w-100">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}
