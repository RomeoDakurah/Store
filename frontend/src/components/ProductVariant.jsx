export default function ProductVariant({ variant }) {
    return (
      <div>
        <span>SKU: {variant.sku}</span>{" "}
        <span>Size: {variant.size}</span>{" "}
        <span>Size: {variant.color}</span>{" "}
        <span>Qty: {variant.quantity}</span>
      </div>
    );
  }
  