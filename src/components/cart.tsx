import type { Dispatch, SetStateAction } from "react";
import type { CartProduct, Product } from "../types";
import { EmptyState } from "./shared";

export function UserCart({
  cart,
  products,
  setCart,
  handleRemoveFromCart,
}: {
  cart: CartProduct[];
  products: Product[];
  setCart: Dispatch<SetStateAction<CartProduct[]>>;
  handleRemoveFromCart: (productId: number) => void;
}) {
  const totalPrice = cart.reduce((total, item) => {
    const product = products.find((product) => product.id === item.productId);
    return product ? total + product.price * item.quantity : total;
  }, 0);

  return (
    <section className="cart-section">
      <h1>Your cart</h1>
      {cart.length === 0 ? (
        <EmptyState>Your cart is empty</EmptyState>
      ) : (
        <div className="cart-list">
          {cart.map((item) => {
            const product = products.find(
              (product) => product.id === item.productId,
            );
            if (!product) return null;

            return (
              <article key={item.productId} className="cart-item-card">
                <img
                  src={product.image}
                  alt={product.title}
                  className="cart-product-image"
                />
                <div className="cart-item-details">
                  <h2>{product.title}</h2>
                  <p className="muted">${product.price.toFixed(2)} each</p>
                  <QuantityControl
                    quantity={item.quantity}
                    productId={item.productId}
                    setCart={setCart}
                    removeFromCart={handleRemoveFromCart}
                  />
                </div>
                <div className="cart-item-end">
                  <strong className="cart-item-subtotal">
                    ${(product.price * item.quantity).toFixed(2)}
                  </strong>
                  <button
                    type="button"
                    className="button button-link button-remove"
                    onClick={() => handleRemoveFromCart(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <div className="cart-summary">
        <div>
          <span className="muted">{cart.length} products</span>
          <h2 className="cart-total">Total: ${totalPrice.toFixed(2)}</h2>
        </div>
        <button
          type="button"
          className="button button-danger"
          onClick={() => setCart([])}
          disabled={cart.length === 0}
        >
          Clear cart
        </button>
      </div>
    </section>
  );
}

export function QuantityControl({
  quantity,
  productId,
  setCart,
  removeFromCart,
}: {
  quantity: number;
  productId: number;
  setCart: Dispatch<SetStateAction<CartProduct[]>>;
  removeFromCart: (productId: number) => void;
}) {
  function handleIncrease() {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }

  function handleDecrease() {
    if (quantity === 1) {
      removeFromCart(productId);
    } else {
      setCart((currentCart) =>
        currentCart.map((item) =>
          item.productId === productId && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        ),
      );
    }
  }

  return (
    <div className="quantity-control">
      <button
        type="button"
        className="quantity-button"
        onClick={handleDecrease}
        aria-label={quantity === 1 ? "Remove item" : "Decrease quantity"}
      >
        {quantity === 1 ? "🗑️" : "−"}
      </button>
      <span aria-live="polite">{quantity}</span>
      <button
        type="button"
        className="quantity-button"
        onClick={handleIncrease}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export function Wishlist({
  wishlist,
  setWishlist,
  handleAddToCart,
  cart,
  setCart,
  removeFromCart,
}: {
  wishlist: Product[];
  setWishlist: Dispatch<SetStateAction<Product[]>>;
  handleAddToCart: (productId: number) => void;
  cart: CartProduct[];
  setCart: Dispatch<SetStateAction<CartProduct[]>>;
  removeFromCart: (productId: number) => void;
}) {
  return (
    <section className="wishlist-section">
      <h1>Wishlist ({wishlist.length})</h1>
      {wishlist.length === 0 ? (
        <EmptyState>Your wishlist is empty</EmptyState>
      ) : (
        <div className="products-grid">
          {wishlist.map((product) => {
            const cartItem = cart.find((item) => item.productId === product.id);
            return (
              <article key={product.id} className="product-card">
                <div className="product-image-wrap">
                  <img src={product.image} alt={product.title} />
                </div>
                <div className="product-card-content">
                  <h2 className="product-title">{product.title}</h2>
                  <strong className="product-price">
                    ${product.price.toFixed(2)}
                  </strong>
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
                        onClick={() => handleAddToCart(product.id)}
                      >
                        Add to cart
                      </button>
                    )}
                    <button
                      type="button"
                      className="button button-danger"
                      onClick={() =>
                        setWishlist((current) =>
                          current.filter((item) => item.id !== product.id),
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function Checkout({
  cart,
  products,
  onAddToCart,
}: {
  cart: CartProduct[];
  products: Product[];
  onAddToCart: (productId: number) => void;
}) {
  const cartCategories = cart.map((item) => {
    const product = products.find((product) => product.id === item.productId);
    return product?.category;
  });
  const recommendedProducts = products.filter(
    (product) =>
      cartCategories.includes(product.category) &&
      !cart.some((item) => item.productId === product.id),
  );

  return (
    <section className="checkout-section">
      <CheckoutForm />
      <section className="panel recommendations-section">
        <h2>You might also like</h2>
        {recommendedProducts.length === 0 ? (
          <EmptyState>No recommendations yet</EmptyState>
        ) : (
          <div className="products-grid">
            {recommendedProducts.map((product) => (
              <article key={product.id} className="recommendation-card">
                <div className="recommendation-image-wrap">
                  <img src={product.image} alt={product.title} />
                </div>
                <div className="recommendation-content">
                  <h3>{product.title}</h3>
                  <strong>${product.price.toFixed(2)}</strong>
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => onAddToCart(product.id)}
                  >
                    Add to cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export function CheckoutForm() {
  return (
    <section className="panel checkout-form-card">
      <h2>Delivery details</h2>
      <form className="form-stack" onSubmit={(event) => event.preventDefault()}>
        <label className="field">
          <span>Full name</span>
          <input
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            required
          />
        </label>
        <div className="form-columns">
          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              placeholder="john@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label className="field">
            <span>Phone number</span>
            <input
              type="tel"
              placeholder="+1 234 567 890"
              autoComplete="tel"
              required
            />
          </label>
        </div>
        <label className="field">
          <span>Street address</span>
          <input
            type="text"
            placeholder="123 Main Street"
            autoComplete="street-address"
            required
          />
        </label>
        <div className="form-columns">
          <label className="field">
            <span>City</span>
            <input
              type="text"
              placeholder="New York"
              autoComplete="address-level2"
              required
            />
          </label>
          <label className="field">
            <span>Postal code</span>
            <input
              type="text"
              placeholder="10001"
              autoComplete="postal-code"
              required
            />
          </label>
        </div>
        <label className="field">
          <span>Country</span>
          <select defaultValue="" required>
            <option value="" disabled>
              Select your country
            </option>
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
            <option value="de">Germany</option>
            <option value="ir">Iran</option>
          </select>
        </label>
        <fieldset className="choice-group">
          <legend>Delivery method</legend>
          <label>
            <input type="radio" name="delivery" value="standard" defaultChecked />
            Standard delivery
          </label>
          <label>
            <input type="radio" name="delivery" value="express" />
            Express delivery
          </label>
        </fieldset>
        <fieldset className="choice-group">
          <legend>Payment method</legend>
          <label>
            <input type="radio" name="payment" value="cash" defaultChecked />
            Cash on delivery
          </label>
          <label>
            <input type="radio" name="payment" value="card" />
            Credit or debit card
          </label>
        </fieldset>
        <button type="submit" className="button button-primary button-block">
          Place order
        </button>
      </form>
    </section>
  );
}
