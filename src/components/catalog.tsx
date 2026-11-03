import type { Dispatch, SetStateAction } from "react";
import type { CartProduct, Product } from "../types";
import { EmptyState } from "./shared";
import { QuantityControl } from "./cart";

export function ProductsList({
  products,
  wishlist,
  cart,
  setCart,
  onAddToCart,
  onAddToWishlist,
  removeFromCart,
}: {
  products: Product[];
  wishlist: Product[];
  cart: CartProduct[];
  setCart: Dispatch<SetStateAction<CartProduct[]>>;
  onAddToCart: (productId: number) => void;
  onAddToWishlist: (productId: number) => void;
  removeFromCart: (productId: number) => void;
}) {
  if (products.length === 0) {
    return <EmptyState>No products found</EmptyState>;
  }

  return (
    <div className="products-grid">
      {products.map((product) => {
        const isWishlisted = wishlist.some((item) => item.id === product.id);
        const cartItem = cart.find((item) => item.productId === product.id);

        return (
          <article key={product.id} className="product-card">
            <div className="product-image-wrap">
              <img src={product.image} alt={product.title} />
            </div>
            <div className="product-card-content">
              <h2 className="product-title">{product.title}</h2>
              <p className="product-description">{product.description}</p>
              <div className="product-meta">
                <strong className="product-price">
                  ${product.price.toFixed(2)}
                </strong>
                <span className="rating">
                  ★ {product.rating.rate} ({product.rating.count})
                </span>
              </div>
              <div className="product-actions">
                {cartItem ? (
                  <QuantityControl
                    quantity={cartItem.quantity}
                    productId={product.id}
                    setCart={setCart}
                    removeFromCart={removeFromCart}
                  />
                ) : (
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => onAddToCart(product.id)}
                  >
                    Add to cart
                  </button>
                )}
                <button
                  type="button"
                  className={`button ${isWishlisted ? "button-danger" : "button-secondary"}`}
                  onClick={() => onAddToWishlist(product.id)}
                  aria-label={
                    isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  {isWishlisted ? "★ Wishlisted" : "☆ Wishlist"}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="search-bar">
      <label className="visually-hidden" htmlFor="product-search">
        Search products
      </label>
      <input
        id="product-search"
        className="search-input"
        type="search"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
      />
      <span className="search-icon" aria-hidden="true">
        ⌕
      </span>
    </div>
  );
}

export function SortProducts({
  categories,
  selectedCategory,
  setSelectedCategory,
  sort,
  setSort,
}: {
  categories: string[];
  selectedCategory: string | null;
  setSelectedCategory: Dispatch<SetStateAction<string | null>>;
  sort: "asc" | "desc";
  setSort: Dispatch<SetStateAction<"asc" | "desc">>;
}) {
  return (
    <div className="product-filters">
      <label className="visually-hidden" htmlFor="category-filter">
        Filter by category
      </label>
      <select
        id="category-filter"
        className="category-select"
        value={selectedCategory ?? "all"}
        onChange={(event) =>
          setSelectedCategory(
            event.target.value === "all" ? null : event.target.value,
          )
        }
      >
        <option value="all">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="button button-secondary sort-button"
        onClick={() =>
          setSort((current) => (current === "asc" ? "desc" : "asc"))
        }
        aria-label={`Sort by price ${sort === "asc" ? "low to high" : "high to low"}`}
      >
        <span aria-hidden="true">{sort === "asc" ? "↑" : "↓"}</span>
        {sort === "asc" ? "Price: Low to High" : "Price: High to Low"}
      </button>
    </div>
  );
}
