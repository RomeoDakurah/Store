// src/pages/admin/AddProduct.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import Navbar from "../../components/Navbar";
import getImageUrl from "../../utils/getImageUrl";

// Helper: generate slug from name
const generateSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // spaces → dash
    .replace(/[^a-z0-9-]/g, ""); // remove invalid chars

export default function AddProduct() {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    slug: "",
    description: "",
    base_price: "",
    active: true,
    image_url: "",
    images: [],
  });

  const [variants, setVariants] = useState([
    { size: "", color: "", quantity: "", image_url: "", images: [] },
  ]);

  const [loading, setLoading] = useState(false);

  // Update product fields
  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "name") {
      const slug = generateSlug(value);
      setProduct((prev) => ({ ...prev, name: value, slug }));
    } else {
      setProduct((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Update a variant
  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const newVariants = [...variants];
    newVariants[index][name] = value;
    setVariants(newVariants);
  };

  const addVariant = () =>
    setVariants([...variants, { size: "", color: "", quantity: null }]);

  const removeVariant = (index) =>
    setVariants(variants.filter((_, i) => i !== index));

  const [productFiles, setProductFiles] = useState([]);
  const [variantFiles, setVariantFiles] = useState({});

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setProductFiles((prev) => [...prev, file]);

    const previewUrl = URL.createObjectURL(file);
    setProduct((prev) => ({ ...prev, image_url: previewUrl }));
  };

  const handleVariantImageSelect = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setVariantFiles((prev) => ({
      ...prev,
      [index]: [...(prev[index] || []), file],
    }));

    const previewUrl = URL.createObjectURL(file);
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], image_url: previewUrl };
      return updated;
    });
  };


  // Submit product + variants
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // 1️⃣ Create product
      const productResp = await api().post("/products", product);
      const productId = productResp.data.id;
  
      // 2️⃣ Upload product images
      for (let i = 0; i < productFiles.length; i++) {
        const formData = new FormData();
        formData.append("file", productFiles[i]);
        formData.append("position", i);
  
        await api().post(`/products/${productId}/upload-image`, formData);
      }
  
      // 3️⃣ Create variants
      for (let vIndex = 0; vIndex < variants.length; vIndex++) {
        const variant = variants[vIndex];
  
        const sku = `${product.slug.toUpperCase()}${
          variant.color ? "-" + variant.color.toUpperCase() : ""
        }-${variant.size.toUpperCase()}`;
  
        const payload = {
          ...variant,
          sku,
          active: true,
        };
  
        const variantResp = await api().post(
          `/variants/product/${productId}`,
          payload
        );
  
        const variantId = variantResp.data.id;
  
        // 4️⃣ Upload variant images
        const filesForVariant = variantFiles[vIndex] || [];
  
        for (let i = 0; i < filesForVariant.length; i++) {
          const formData = new FormData();
          formData.append("file", filesForVariant[i]);
          formData.append("position", i);
  
          await api().post(
            `/variants/${variantId}/upload-image`,
            formData
          );
        }
      }
  
      navigate("/");
    } catch (err) {
      console.error("Error creating product:", err.response?.data || err.message);
      alert(err.response?.data?.detail || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />
    <div className="container py-4" style={{ maxWidth: "700px" }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="card-title mb-4">Add New Product</h3>
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
                <input
                  type="text"
                  className="form-control"
                  name="slug"
                  value={product.slug}
                  placeholder="Slug (auto-generated)"
                  readOnly
                />
              </div>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  name="description"
                  value={product.description}
                  onChange={handleProductChange}
                  placeholder="Description"
                  required
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
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Product Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </div>

              {product.image_url && (
                <div className="mb-3">
                  <img
                    src={getImageUrl(product.image_url)}
                    alt="Preview"
                    style={{ maxHeight: "150px", objectFit: "cover" }}
                    className="rounded"
                  />
                </div>
              )}

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
                <div key={i} className="card mb-3 p-3 shadow-sm">
                  <div className="row g-2">
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        name="size"
                        value={v.size}
                        onChange={(e) => handleVariantChange(i, e)}
                        placeholder="Size (e.g., M, L)"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        name="color"
                        value={v.color || ""}
                        onChange={(e) => handleVariantChange(i, e)}
                        placeholder="Color (optional)"
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="number"
                        className="form-control"
                        name="quantity"
                        value={v.quantity}
                        onChange={(e) => handleVariantChange(i, e)}
                        placeholder="Quantity"
                        required
                      />
                    </div>
                    <div className="col-md-12 mt-2">
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => handleVariantImageSelect(e, i)}
                      />

                      {v.image_url && (
                        <img
                          src={getImageUrl(v.image_url)}
                          alt="Variant Preview"
                          style={{ maxHeight: "120px", marginTop: "10px" }}
                          className="rounded"
                        />
                      )}
                    </div>

                  </div>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm mt-2"
                      onClick={() => removeVariant(i)}
                    >
                      Remove Variant
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary mb-3" onClick={addVariant}>
                Add Variant
              </button>
            </fieldset>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}
