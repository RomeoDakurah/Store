import ProductVariant from "./ProductVariant";

export default function ProductList({ products }) {
  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          {product.variants.map((v) => (
            <ProductVariant key={v.id} variant={v} />
          ))}
        </div>
      ))}
    </div>
  );
}
