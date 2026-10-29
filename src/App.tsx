import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import "./App.css";

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
};

type CartProduct = {
  productId: number;
  quantity: number;
};

type UserCredentials = {
  id: number;
  username: string;
};

type User = {
  id: number;
  username: string;
  email: string;
  password: string;
};

type DemoOrderItem = {
  productId: number;
  title: string;
  image: string;
  price: number;
  quantity: number;
};

type DemoOrder = {
  id: string;
  createdAt: string;
  items: DemoOrderItem[];
  total: number;
};

type SortMode =
  | "featured"
  | "price-desc"
  | "price-asc"
  | "rating-desc"
  | "title-asc";

export default function App() {
  function getSavedData<T>(key: string, fallback: T): T {
    try {
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  const [cart, setCart] = useState<CartProduct[]>(() =>
    getSavedData<CartProduct[]>("cart", []),
  );
  const [wishlist, setWishlist] = useState<Product[]>(() =>
    getSavedData<Product[]>("wishlist", []),
  );
  const [orderHistory, setOrderHistory] = useState<DemoOrder[]>(() =>
    getSavedData<DemoOrder[]>("demo-orders", []),
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadProducts, setReloadProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
  const [newUser, setNewUser] = useState<boolean>(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [userData, setUserData] = useState<User>();
  const [sort, setSort] = useState<SortMode>("featured");
  const [managementType, setManagementType] = useState<"products" | "users">(
    "products",
  );
  const [accountSection, setAccountSection] = useState<
    "profile" | "cart" | "wishlist"
  >("profile");
  const [openNavMenu, setOpenNavMenu] = useState<
    "management" | "profile" | null
  >(null);
  const managementMenuRef = useRef<HTMLLIElement>(null);
  const profileMenuRef = useRef<HTMLLIElement>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<DemoOrder | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<
    "products" | "management" | "account"
  >("products");

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("demo-orders", JSON.stringify(orderHistory));
  }, [orderHistory]);

  useEffect(() => {
    if (!isCheckoutOpen && !selectedProduct) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsCheckoutOpen(false);
        setSelectedProduct(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isCheckoutOpen, selectedProduct]);

  useEffect(() => {
    if (!openNavMenu) return;

    function closeMenuOnOutsideClick(event: PointerEvent) {
      if (!(event.target instanceof Node)) return;
      if (
        managementMenuRef.current?.contains(event.target) ||
        profileMenuRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpenNavMenu(null);
    }

    function closeMenuOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenNavMenu(null);
    }

    document.addEventListener("pointerdown", closeMenuOnOutsideClick);
    window.addEventListener("keydown", closeMenuOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenuOnOutsideClick);
      window.removeEventListener("keydown", closeMenuOnEscape);
    };
  }, [openNavMenu]);

  function placeDemoOrder() {
    const items = cart.flatMap((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return product
        ? [
            {
              productId: product.id,
              title: product.title,
              image: product.image,
              price: product.price,
              quantity: item.quantity,
            },
          ]
        : [];
    });

    if (items.length === 0) return;

    const order: DemoOrder = {
      id: `DEMO-${Date.now()}`,
      createdAt: new Date().toISOString(),
      items,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };

    setOrderHistory((currentOrders) => [order, ...currentOrders]);
    setOrderConfirmation(order);
    setCart([]);
  }

  useEffect(() => {
    const URL = "https://fakestoreapi.com/products";

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(URL);

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data: Product[] = await response.json();
        setProducts(data);
        setCategories([...new Set(data.map((product) => product.category))]);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [reloadProducts]);

  if (loading) {
    return <ProductSkeleton />;
  }

  if (error) {
    return (
      <div className="app-shell">
        <header className="top-bar">
          <h1 className="app-title">
            <button
              type="button"
              className="app-logo"
              onClick={() => setActiveTab("products")}
              aria-label="Online Shop home"
            >
              Online Shop
            </button>
          </h1>
        </header>
        <main className="content">
          <section className="panel error-panel" role="alert">
            <h2>Couldn’t load products</h2>
            <p>{error}</p>
            <button
              type="button"
              className="button button-primary"
              onClick={() => setReloadProducts((attempt) => attempt + 1)}
            >
              Try again
            </button>
          </section>
        </main>
      </div>
    );
  }

  function handleAddToCart(productId: number) {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.productId === productId,
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentCart, { productId, quantity: 1 }];
    });
  }

  function handleAddToWishlist(productId: number) {
    const product = products.find((item) => item.id === productId);

    if (!product) return;

    setWishlist((currentList) =>
      currentList.some((item) => item.id === productId)
        ? currentList.filter((item) => item.id !== productId)
        : [...currentList, product],
    );
  }

  function handleRemoveFromCart(productId: number) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.productId !== productId),
    );
  }

  function handleDecreaseCartQuantity(productId: number) {
    setCart((currentCart) =>
      currentCart.flatMap((item) => {
        if (item.productId !== productId) return [item];
        if (item.quantity <= 1) return [];
        return [{ ...item, quantity: item.quantity - 1 }];
      }),
    );
  }

  const visibleProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategory === null ||
        selectedCategory === "all" ||
        product.category === selectedCategory;

      const matchesSearch = product.title
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
      const matchesPrice =
        maxPriceFilter === null || product.price <= maxPriceFilter;

      return matchesCategory && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      switch (sort) {
        case "price-desc":
          return b.price - a.price;
        case "price-asc":
          return a.price - b.price;
        case "rating-desc":
          return b.rating.rate - a.rating.rate;
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "featured":
        default:
          return b.rating.rate - a.rating.rate || b.price - a.price;
      }
    });

  const tabs = [
    { key: "products", label: "Products" },
  ] as const;
  const priceCeiling = Math.ceil(
    Math.max(...products.map((product) => product.price), 1),
  );
  const activeFilterCount =
    Number(Boolean(searchQuery.trim())) +
    Number(selectedCategory !== null && selectedCategory !== "all") +
    Number(maxPriceFilter !== null && maxPriceFilter < priceCeiling);

  return (
    <div className="app-shell">
      <header className="top-bar">
        <h1 className="app-title">
          <button
            type="button"
            className="app-logo"
            onClick={() => {
              setActiveTab("products");
              setAccountSection("profile");
            }}
            aria-label="Online Shop home"
          >
            Online Shop
          </button>
        </h1>
        <nav aria-label="Main navigation">
          <ul className="tabs">
            {tabs.map((tab) => (
              <li key={tab.key}>
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  aria-current={activeTab === tab.key ? "page" : undefined}
                  className={`tab-button${activeTab === tab.key ? " is-active" : ""}`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
            <li
              ref={managementMenuRef}
              className={`profile-menu${openNavMenu === "management" ? " is-open" : ""}`}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") {
                  setOpenNavMenu("management");
                }
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") {
                  setOpenNavMenu((current) =>
                    current === "management" ? null : current,
                  );
                }
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveTab("management");
                  const supportsHover = window.matchMedia(
                    "(hover: hover) and (pointer: fine)",
                  ).matches;
                  setOpenNavMenu((current) =>
                    supportsHover || current !== "management"
                      ? "management"
                      : null,
                  );
                }}
                aria-current={activeTab === "management" ? "page" : undefined}
                aria-haspopup="true"
                aria-expanded={openNavMenu === "management"}
                aria-controls="management-submenu"
                className={`tab-button${activeTab === "management" ? " is-active" : ""}`}
              >
                Management{" "}
                <span className="profile-menu-caret" aria-hidden="true">
                  ⌄
                </span>
              </button>
              <div
                id="management-submenu"
                className="profile-submenu"
                aria-label="Management sections"
                hidden={openNavMenu !== "management"}
              >
                {(
                  [
                    ["products", "Products"],
                    ["users", "Users"],
                  ] as const
                ).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    className={`profile-submenu-button${activeTab === "management" && managementType === type ? " is-active" : ""}`}
                    onClick={() => {
                      setManagementType(type);
                      setActiveTab("management");
                      setOpenNavMenu(null);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </li>
            <li
              ref={profileMenuRef}
              className={`profile-menu${openNavMenu === "profile" ? " is-open" : ""}`}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") {
                  setOpenNavMenu("profile");
                }
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") {
                  setOpenNavMenu((current) =>
                    current === "profile" ? null : current,
                  );
                }
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveTab("account");
                  setAccountSection("profile");
                  const supportsHover = window.matchMedia(
                    "(hover: hover) and (pointer: fine)",
                  ).matches;
                  setOpenNavMenu((current) =>
                    supportsHover || current !== "profile" ? "profile" : null,
                  );
                }}
                aria-current={activeTab === "account" ? "page" : undefined}
                aria-haspopup="true"
                aria-expanded={openNavMenu === "profile"}
                aria-controls="profile-submenu"
                className={`tab-button${activeTab === "account" ? " is-active" : ""}`}
              >
                Profile{" "}
                <span className="profile-menu-caret" aria-hidden="true">
                  ⌄
                </span>
              </button>
              <div
                id="profile-submenu"
                className="profile-submenu"
                aria-label="Profile sections"
                hidden={openNavMenu !== "profile"}
              >
                {(
                  [
                    ["profile", "Profile"],
                    ["cart", "Cart"],
                    ["wishlist", "Wishlist"],
                  ] as const
                ).map(([section, label]) => (
                  <button
                    key={section}
                    type="button"
                    className={`profile-submenu-button${activeTab === "account" && accountSection === section ? " is-active" : ""}`}
                    onClick={() => {
                      setActiveTab("account");
                      setAccountSection(section);
                      setOpenNavMenu(null);
                    }}
                  >
                    {label}
                    {section === "cart" && cart.length > 0 && (
                      <span className="submenu-count">
                        {cart.reduce((count, item) => count + item.quantity, 0)}
                      </span>
                    )}
                    {section === "wishlist" && wishlist.length > 0 && (
                      <span className="submenu-count">{wishlist.length}</span>
                    )}
                  </button>
                ))}
              </div>
            </li>
          </ul>
        </nav>
        <div className="header-cart">
          <button
            type="button"
            className="header-cart-button"
            aria-haspopup="true"
            onClick={() => {
              setActiveTab("account");
              setAccountSection("cart");
            }}
          >
            <span aria-hidden="true">▣</span>
            <span>Cart</span>
            <span className="header-cart-count">
              {cart.reduce((count, item) => count + item.quantity, 0)}
            </span>
          </button>
          <div className="cart-preview" aria-label="Cart preview">
            <div className="cart-preview-heading">
              <strong>Your cart</strong>
              <span>
                {cart.reduce((count, item) => count + item.quantity, 0)} items
              </span>
            </div>
            {cart.length === 0 ? (
              <p className="cart-preview-empty">Your cart is empty.</p>
            ) : (
              <>
                <div className="cart-preview-items">
                  {cart.slice(0, 3).map((item) => {
                    const product = products.find(
                      (entry) => entry.id === item.productId,
                    );
                    if (!product) return null;

                    return (
                      <div className="cart-preview-item" key={item.productId}>
                        <img src={product.image} alt="" />
                        <div>
                          <span>{product.title}</span>
                          <small>Qty {item.quantity}</small>
                        </div>
                        <strong>
                          ${(product.price * item.quantity).toFixed(2)}
                        </strong>
                      </div>
                    );
                  })}
                </div>
                {cart.length > 3 && (
                  <p className="cart-preview-more">
                    + {cart.length - 3} more{" "}
                    {cart.length - 3 === 1 ? "item" : "items"}
                  </p>
                )}
                <button
                  type="button"
                  className="button button-primary cart-preview-action"
                  onClick={() => {
                    setActiveTab("account");
                    setAccountSection("cart");
                  }}
                >
                  View cart
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="content">
        {activeTab === "products" && (
          <section className="panel">
            <section className="store-hero">
              <div className="store-hero-copy">
                <p className="store-eyebrow">GOOD FINDS. GREAT EVERY DAY.</p>
                <h2>Make room for something you love.</h2>
                <p>
                  Discover customer favorites across fashion, home, and tech.
                </p>
                <button
                  type="button"
                  className="button hero-button"
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery("");
                    setMaxPriceFilter(null);
                  }}
                >
                  Explore all products <span aria-hidden="true">→</span>
                </button>
              </div>
              <div className="hero-art" aria-hidden="true">
                <span className="hero-orbit hero-orbit-one" />
                <span className="hero-orbit hero-orbit-two" />
                <span className="hero-sparkle">✦</span>
                <span className="hero-bag">✧</span>
                <span className="hero-sparkle hero-sparkle-small">✦</span>
              </div>
            </section>
            <div className="store-benefits" aria-label="Shopping benefits">
              <span>
                <b>✦</b> Curated everyday finds
              </span>
              <span>
                <b>✓</b> Customer-rated favorites
              </span>
              <span>
                <b>♡</b> Save your wish-list picks
              </span>
            </div>
            <div className="catalog-heading-row">
              <div>
                <p className="catalog-kicker">THE COLLECTION</p>
                <h2 className="section-title">Shop all products</h2>
              </div>
              <span className="catalog-result-count">
                {visibleProducts.length} of {products.length} items
              </span>
            </div>
            <div className="catalog-content">
              <div className="category-shortcuts" aria-label="Shop by category">
                <button
                  type="button"
                  className={`category-chip${selectedCategory === null || selectedCategory === "all" ? " is-active" : ""}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  ✦ All finds
                </button>
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    className={`category-chip${selectedCategory === category ? " is-active" : ""}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
              <SortProducts
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                sort={sort}
                setSort={setSort}
                setSearchQuery={setSearchQuery}
                maxPriceFilter={maxPriceFilter}
                setMaxPriceFilter={setMaxPriceFilter}
                priceCeiling={priceCeiling}
                activeFilterCount={activeFilterCount}
              />
              <ProductsList
                products={visibleProducts}
                wishlist={wishlist}
                cart={cart}
                onAddToCart={handleAddToCart}
                onDecreaseCartQuantity={handleDecreaseCartQuantity}
                onAddToWishlist={handleAddToWishlist}
                onViewProduct={setSelectedProduct}
                onClearFilters={() => {
                  setSelectedCategory(null);
                  setSearchQuery("");
                  setMaxPriceFilter(null);
                }}
              />
            </div>
            <StoreInformation />
          </section>
        )}

        {activeTab === "management" && (
          <section className="panel">
            {managementType === "products" ? (
              <ProductsManagement
                products={products}
                setProducts={setProducts}
              />
            ) : (
              <UserManagement />
            )}
          </section>
        )}

        {activeTab === "account" && (
          <section className="panel">
            <h2 className="section-title">
              {accountSection === "profile"
                ? "Profile"
                : accountSection === "cart"
                  ? "Your Cart"
                  : "Wishlist"}
            </h2>
            {accountSection === "profile" && (
              <div className="account-content">
                <Login
                  newUser={newUser}
                  setNewUser={setNewUser}
                  setUserId={setUserId}
                />
                <Profile
                  userId={userId}
                  userData={userData}
                  setUserData={setUserData}
                />
                <OrderHistory
                  orders={orderHistory}
                  onClear={() => setOrderHistory([])}
                />
              </div>
            )}
            {accountSection === "cart" && (
              <div className="account-section">
                <UserCart
                  cart={cart}
                  products={products}
                  setCart={setCart}
                  handleRemoveFromCart={handleRemoveFromCart}
                  handleDecreaseQuantity={handleDecreaseCartQuantity}
                  onCheckout={() => {
                    setOrderConfirmation(null);
                    setIsCheckoutOpen(true);
                  }}
                />
              </div>
            )}
            {accountSection === "wishlist" && (
              <div className="account-section">
                <Wishlist
                  wishlist={wishlist}
                  cart={cart}
                  setWishlist={setWishlist}
                  handleAddToCart={handleAddToCart}
                  handleDecreaseQuantity={handleDecreaseCartQuantity}
                />
              </div>
            )}
          </section>
        )}
      </main>
      {isCheckoutOpen && (
        <div
          className="checkout-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsCheckoutOpen(false);
          }}
        >
          <section
            className="checkout-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-dialog-title"
          >
            <div className="checkout-dialog-header">
              <h2 id="checkout-dialog-title">Checkout</h2>
              <button
                type="button"
                className="button button-icon"
                aria-label="Close checkout"
                onClick={() => setIsCheckoutOpen(false)}
              >
                ×
              </button>
            </div>
            <Checkout
              cart={cart}
              handleRemoveFromCart={handleRemoveFromCart}
              products={products}
              onAddToCart={handleAddToCart}
              onPlaceOrder={placeDemoOrder}
              confirmation={orderConfirmation}
              onViewOrders={() => {
                setIsCheckoutOpen(false);
                setActiveTab("account");
                setAccountSection("profile");
              }}
            />
          </section>
        </div>
      )}
      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          isWishlisted={wishlist.some(
            (item) => item.id === selectedProduct.id,
          )}
          cartQuantity={
            cart.find((item) => item.productId === selectedProduct.id)
              ?.quantity ?? 0
          }
          onClose={() => setSelectedProduct(null)}
          onAddToCart={() => handleAddToCart(selectedProduct.id)}
          onDecreaseFromCart={() =>
            handleDecreaseCartQuantity(selectedProduct.id)
          }
          onAddToWishlist={() => handleAddToWishlist(selectedProduct.id)}
        />
      )}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="skeleton skeleton-brand" />
        <div className="skeleton-tabs" aria-hidden="true">
          <span className="skeleton skeleton-tab" />
          <span className="skeleton skeleton-tab" />
          <span className="skeleton skeleton-tab" />
        </div>
        <div className="skeleton skeleton-cart" aria-hidden="true" />
      </header>

      <main className="content">
        <section
          className="panel"
          aria-busy="true"
          aria-label="Loading products"
        >
          <div className="skeleton skeleton-heading" />
          <div className="skeleton-toolbar">
            <div className="skeleton skeleton-search" />
            <div className="skeleton skeleton-filter" />
            <div className="skeleton skeleton-filter" />
          </div>
          <div className="skeleton-products">
            {Array.from({ length: 8 }, (_, index) => (
              <article className="skeleton-product" key={index}>
                <div className="skeleton skeleton-product-image" />
                <div className="skeleton skeleton-line skeleton-line-title" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line skeleton-line-short" />
                <div className="skeleton-actions">
                  <div className="skeleton skeleton-action" />
                  <div className="skeleton skeleton-action skeleton-action-small" />
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function ProductDetails({
  product,
  isWishlisted,
  cartQuantity,
  onClose,
  onAddToCart,
  onDecreaseFromCart,
  onAddToWishlist,
}: {
  product: Product;
  isWishlisted: boolean;
  cartQuantity: number;
  onClose: () => void;
  onAddToCart: () => void;
  onDecreaseFromCart: () => void;
  onAddToWishlist: () => void;
}) {
  return (
    <div
      className="product-detail-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="product-detail-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
      >
        <button
          type="button"
          className="button button-icon product-detail-close"
          aria-label="Close product details"
          onClick={onClose}
        >
          ×
        </button>
        <div className="product-detail-layout">
          <ProductImage
            src={product.image}
            alt={product.title}
            className="product-detail-image"
          />
          <div className="product-detail-copy">
            <span className="category-tag">{product.category}</span>
            <h2 id="product-detail-title">{product.title}</h2>
            <p
              className="product-rating"
              aria-label={`${product.rating.rate} out of 5 stars`}
            >
              <span aria-hidden="true">★</span> {product.rating.rate}
              <span className="review-count">
                ({product.rating.count} reviews)
              </span>
            </p>
            <p className="product-detail-price">${product.price.toFixed(2)}</p>
            <p className="product-detail-description">{product.description}</p>
            <div className="product-detail-service">
              <span>✓ Demo shipping options at checkout</span>
              <span>↺ Sample 30-day return information</span>
            </div>
            <div className="product-detail-actions">
              {cartQuantity > 0 ? (
                <div
                  className="product-quantity-control"
                  aria-label={`Quantity in cart: ${cartQuantity}`}
                >
                  <button
                    type="button"
                    className="button button-icon"
                    aria-label={`Decrease ${product.title} quantity`}
                    onClick={onDecreaseFromCart}
                  >
                    −
                  </button>
                  <span className="quantity-value">{cartQuantity}</span>
                  <button
                    type="button"
                    className="button button-icon"
                    aria-label={`Increase ${product.title} quantity`}
                    onClick={onAddToCart}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={onAddToCart}
                >
                  Add to cart
                </button>
              )}
              <button
                type="button"
                className={`button button-secondary${isWishlisted ? " is-selected" : ""}`}
                onClick={onAddToWishlist}
                aria-pressed={isWishlisted}
              >
                {isWishlisted ? "♥ Saved to wishlist" : "♡ Add to wishlist"}
              </button>
            </div>
            <p className="demo-disclaimer">
              Demo store: checkout and store policies are illustrative only.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StoreInformation() {
  return (
    <section className="store-information" aria-label="Store information">
      <div>
        <span className="store-information-icon" aria-hidden="true">↗</span>
        <div>
          <h3>Shipping options</h3>
          <p>Standard and express delivery choices are shown at demo checkout.</p>
        </div>
      </div>
      <div>
        <span className="store-information-icon" aria-hidden="true">↺</span>
        <div>
          <h3>Easy returns</h3>
          <p>Sample 30-day returns information for this storefront demo.</p>
        </div>
      </div>
      <div>
        <span className="store-information-icon" aria-hidden="true">?</span>
        <div>
          <h3>Need a hand?</h3>
          <p>Customer support details are illustrative; no real orders are fulfilled.</p>
        </div>
      </div>
    </section>
  );
}

function OrderHistory({
  orders,
  onClear,
}: {
  orders: DemoOrder[];
  onClear: () => void;
}) {
  return (
    <section className="order-history" aria-labelledby="order-history-title">
      <div className="order-history-heading">
        <div>
          <p className="catalog-kicker">YOUR SHOPPING ACTIVITY</p>
          <h2 id="order-history-title" className="subsection-title">
            Demo order history
          </h2>
        </div>
        <div className="order-history-controls">
          <span className="demo-order-label">Saved on this device</span>
          {orders.length > 0 && (
            <button
              type="button"
              className="button button-quiet"
              onClick={onClear}
            >
              Clear history
            </button>
          )}
        </div>
      </div>
      {orders.length === 0 ? (
        <p className="empty-state">
          No demo orders yet. Orders placed through checkout will appear here.
        </p>
      ) : (
        <div className="order-history-list">
          {orders.map((order) => (
            <article key={order.id} className="order-history-card">
              <div className="order-history-card-heading">
                <div>
                  <strong>{order.id}</strong>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <span className="order-demo-status">Demo order</span>
              </div>
              <div className="order-history-items">
                {order.items.map((item) => (
                  <div
                    key={`${order.id}-${item.productId}`}
                    className="order-history-item"
                  >
                    <ProductImage
                      src={item.image}
                      alt={item.title}
                      className="order-item-image"
                    />
                    <span>{item.title}</span>
                    <small>Qty {item.quantity}</small>
                    <strong>
                      ${(item.price * item.quantity).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>
              <p className="order-history-total">
                Total <strong>${order.total.toFixed(2)}</strong>
              </p>
            </article>
          ))}
        </div>
      )}
      <p className="demo-disclaimer">
        Orders are stored only in this browser and are not sent to FakeStoreAPI.
      </p>
    </section>
  );
}

function ProductsList({
  products,
  wishlist,
  cart,
  onAddToCart,
  onDecreaseCartQuantity,
  onAddToWishlist,
  onViewProduct,
  onClearFilters,
}: {
  products: Product[];
  wishlist: Product[];
  cart: CartProduct[];
  onAddToCart: (productId: number) => void;
  onDecreaseCartQuantity: (productId: number) => void;
  onAddToWishlist: (productId: number) => void;
  onViewProduct: (product: Product) => void;
  onClearFilters: () => void;
}) {
  if (products.length === 0) {
    return (
      <div className="empty-results">
        <p className="empty-state">No products match your search or filters.</p>
        <button
          type="button"
          className="button button-secondary"
          onClick={onClearFilters}
        >
          Clear search and filters
        </button>
      </div>
    );
  }

  return (
    <div className="products">
      {products.map((product) => {
        const isWishlisted = wishlist.some((item) => item.id === product.id);
        const isInCart = cart.some((item) => item.productId === product.id);

        return (
          <article key={product.id} className="product-card">
            <div className="product-badges">
              <span className="category-tag">{product.category}</span>
              {product.rating.rate >= 4.5 && product.rating.count >= 100 && (
                <span className="popular-tag">Customer favorite</span>
              )}
              {isInCart && <span className="in-cart-tag">In cart</span>}
              {isWishlisted && <span className="wishlist-tag">Wishlisted</span>}
            </div>
            <ProductImage
              src={product.image}
              alt={product.title}
              className="product-image"
            />
            <h2 className="product-title">{product.title}</h2>
            <p className="product-description">{product.description}</p>
            <p className="product-price">${product.price.toFixed(2)}</p>
            <p
              className="product-rating"
              aria-label={`${product.rating.rate} out of 5 stars`}
            >
              <span aria-hidden="true">★</span> {product.rating.rate}
              <span className="review-count">
                ({product.rating.count} reviews)
              </span>
            </p>

            <button
              type="button"
              className="product-detail-link"
              onClick={() => onViewProduct(product)}
            >
              View product details
            </button>
            <div className="product-actions">
              {isInCart ? (
                <div
                  className="product-quantity-control"
                  aria-label={`Quantity in cart: ${cart.find((item) => item.productId === product.id)?.quantity ?? 0}`}
                >
                  <button
                    type="button"
                    className="button button-icon"
                    aria-label={`Decrease ${product.title} quantity`}
                    onClick={() => onDecreaseCartQuantity(product.id)}
                  >
                    −
                  </button>
                  <span className="quantity-value">
                    {cart.find((item) => item.productId === product.id)
                      ?.quantity ?? 0}
                  </span>
                  <button
                    type="button"
                    className="button button-icon"
                    aria-label={`Increase ${product.title} quantity`}
                    onClick={() => onAddToCart(product.id)}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => onAddToCart(product.id)}
                >
                  Add to Cart
                </button>
              )}

              <button
                type="button"
                className={`button button-star${isWishlisted ? " is-selected" : ""}`}
                onClick={() => onAddToWishlist(product.id)}
                aria-pressed={isWishlisted}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <svg
                  className="wishlist-heart"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.4 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
                    fill={isWishlisted ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ProductImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`${className} product-image-fallback`}
        role="img"
        aria-label={`${alt} image unavailable`}
      >
        <span aria-hidden="true">▧</span>
        <small>Image unavailable</small>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

function Login({
  newUser,
  setNewUser,
  setUserId,
}: {
  newUser: boolean;
  setNewUser: Dispatch<SetStateAction<boolean>>;
  setUserId: Dispatch<SetStateAction<number | null>>;
}) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function postCredentials() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!username.trim() || !password.trim() || !email.trim()) {
        throw new Error("Please fill in all fields.");
      }

      const response = await fetch("https://fakestoreapi.com/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      setSuccess("Registration request completed.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function authenticateUser() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!username.trim() || !password) {
        throw new Error("Enter your username and password.");
      }

      const response = await fetch("https://fakestoreapi.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed. Check your credentials.");
      }

      const data: { token?: string } = await response.json();

      if (typeof data.token !== "string" || data.token.trim() === "") {
        throw new Error("The API did not return a valid token value.");
      }

      console.log("Token received successfully.");

      const usersResponse = await fetch("https://fakestoreapi.com/users");

      if (!usersResponse.ok) {
        throw new Error("Could not fetch users.");
      }

      const users: UserCredentials[] = await usersResponse.json();
      const user = users.find((item) => item.username === username);

      if (!user) {
        throw new Error("Could not find this demo user.");
      }

      setUserId(user.id);
      setNewUser(false);
      setSuccess("Login successful.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function onLogin() {
    if (newUser) {
      postCredentials();
    } else {
      authenticateUser();
    }
  }

  return (
    <div className="login-panel">
      <p className="login-heading">{newUser ? "Sign up" : "Log in"}</p>
      <input
        className="form-input"
        placeholder="Enter Username ..."
        aria-label="Username"
        autoComplete="username"
        required
        onChange={(e) => setUsername(e.target.value)}
        type="text"
      />
      <input
        className="form-input"
        placeholder="Enter Password ..."
        aria-label="Password"
        autoComplete={newUser ? "new-password" : "current-password"}
        required
        onChange={(e) => setPassword(e.target.value)}
        type="password"
      />

      {newUser && (
        <input
          className="form-input"
          placeholder="Enter Email ..."
          aria-label="Email address"
          autoComplete="email"
          required
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
      )}

      <button
        type="button"
        className="button button-primary"
        onClick={onLogin}
        disabled={loading}
      >
        {loading ? "Please wait..." : newUser ? "Sign up" : "Log in"}
      </button>

      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}
      <button
        type="button"
        className="button button-link"
        onClick={() => setNewUser(!newUser)}
      >
        {newUser ? "Already have an account? Log in" : "New user? Sign up"}
      </button>
    </div>
  );
}

function SearchBar({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="search-bar">
      <input
        className="form-input"
        placeholder="Search products..."
        aria-label="Search products"
        value={searchQuery}
        type="text"
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <button
          type="button"
          className="search-clear"
          aria-label="Clear search"
          onClick={() => setSearchQuery("")}
        >
          ×
        </button>
      )}
    </div>
  );
}

function SortProducts({
  categories,
  selectedCategory,
  setSelectedCategory,
  sort,
  setSort,
  setSearchQuery,
  maxPriceFilter,
  setMaxPriceFilter,
  priceCeiling,
  activeFilterCount,
}: {
  categories: string[];
  selectedCategory: string | null;
  setSelectedCategory: Dispatch<SetStateAction<string | null>>;
  sort: SortMode;
  setSort: Dispatch<SetStateAction<SortMode>>;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  maxPriceFilter: number | null;
  setMaxPriceFilter: Dispatch<SetStateAction<number | null>>;
  priceCeiling: number;
  activeFilterCount: number;
}) {
  const sortOptions: Array<{ value: SortMode; label: string }> = [
    { value: "featured", label: "Featured" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "rating-desc", label: "Rating: High to Low" },
    { value: "title-asc", label: "Title: A to Z" },
  ];

  return (
    <div className="product-filters">
      <select
        value={selectedCategory ?? "all"}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="form-input category-select"
      >
        <option value="all">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as SortMode)}
        className="form-input category-select"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label className="price-filter">
        <span className="price-filter-heading">
          <span>Maximum price</span>
          <strong>${(maxPriceFilter ?? priceCeiling).toFixed(0)}</strong>
        </span>
        <input
          type="range"
          min="0"
          max={priceCeiling}
          step={Math.max(1, Math.round(priceCeiling / 100))}
          value={maxPriceFilter ?? priceCeiling}
          aria-label="Maximum product price"
          onChange={(event) => {
            const value = Number(event.target.value);
            setMaxPriceFilter(value >= priceCeiling ? null : value);
          }}
        />
        <span className="price-filter-limits">
          <span>$0</span>
          <span>${priceCeiling}</span>
        </span>
      </label>
      <div className="filter-footer">
        {activeFilterCount > 0 && (
          <span className="active-filter-count">
            {activeFilterCount} active filter
            {activeFilterCount === 1 ? "" : "s"}
          </span>
        )}
        <button
          type="button"
          className="button button-quiet clear-filters"
          disabled={activeFilterCount === 0 && sort === "featured"}
          onClick={() => {
            setSearchQuery("");
            setSelectedCategory(null);
            setMaxPriceFilter(null);
            setSort("featured");
          }}
        >
          Clear all
        </button>
      </div>
    </div>
  );
}

function UserCart({
  cart,
  products,
  setCart,
  handleRemoveFromCart,
  handleDecreaseQuantity,
  onCheckout,
}: {
  cart: CartProduct[];
  products: Product[];
  setCart: Dispatch<SetStateAction<CartProduct[]>>;
  handleRemoveFromCart: (productId: number) => void;
  handleDecreaseQuantity: (productId: number) => void;
  onCheckout: () => void;
}) {
  function handleIncrease(productId: number) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }

  const totalPrice = cart.reduce((total, item) => {
    const product = products.find((product) => product.id === item.productId);

    return product ? total + product.price * item.quantity : total;
  }, 0);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="cart-list">
      <h2 className="subsection-title">Your Cart</h2>
      {cart.length === 0 && <p className="empty-state">Your cart is empty.</p>}

      {cart.map((item) => {
        const product = products.find(
          (product) => product.id === item.productId,
        );

        if (!product) return null;

        return (
          <div key={item.productId} className="cart-item">
            <img src={product.image} alt={product.title} width={80} />
            <div>
              <h3 className="cart-item-title">{product.title}</h3>
              <p className="flush">Price: ${product.price.toFixed(2)}</p>
              <p className="flush">Quantity: {item.quantity}</p>
              <p className="flush">
                Subtotal: ${(product.price * item.quantity).toFixed(2)}
              </p>
            </div>

            <div className="cart-item-actions">
              <div
                className="cart-quantity-control"
                aria-label={`Quantity: ${item.quantity}`}
              >
                <button
                  type="button"
                  className="button button-icon"
                  aria-label={`Decrease ${product.title} quantity`}
                  onClick={() => handleDecreaseQuantity(item.productId)}
                >
                  −
                </button>
                <span className="quantity-value">{item.quantity}</span>
                <button
                  type="button"
                  className="button button-icon"
                  aria-label={`Increase ${product.title} quantity`}
                  onClick={() => handleIncrease(item.productId)}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="button button-quiet"
                onClick={() => handleRemoveFromCart(item.productId)}
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}

      {cart.length > 0 && (
        <>
          <h3 className="flush">Total: ${totalPrice.toFixed(2)}</h3>
          <h3 className="flush">
            {totalItems} item{totalItems === 1 ? "" : "s"}
          </h3>
          <div className="cart-footer-actions">
            <button
              type="button"
              onClick={() => setCart([])}
              className="button button-quiet"
            >
              Clear Cart
            </button>
            <button
              type="button"
              onClick={onCheckout}
              className="button button-primary"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ProductsManagement({
  products,
  setProducts,
}: {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
}) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function startEditing(product: Product) {
    setEditingProduct(product);
    setTitle(product.title);
    setPrice(String(product.price));
    setError("");
  }

  async function onEditProduct() {
    if (!editingProduct) return;

    const numericPrice = Number(price);

    if (
      !title.trim() ||
      !price.trim() ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      setError("Enter a valid title and price.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://fakestoreapi.com/products/${editingProduct.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            price: numericPrice,
            description: editingProduct.description,
            category: editingProduct.category,
            image: editingProduct.image,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const updatedProduct = {
        ...editingProduct,
        title: title.trim(),
        price: numericPrice,
      };

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingProduct.id ? updatedProduct : product,
        ),
      );

      setEditingProduct(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function onRemoveProduct(productId: number) {
    setError("");

    try {
      const response = await fetch(
        `https://fakestoreapi.com/products/${productId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="management-section">
      <div className="management-layout">
        <div className="management-list">
          <h3 className="flush">Product Management</h3>
          {products.map((item) => (
            <div key={item.id} className="management-item">
              <div>
                <h3 className="flush">{item.title}</h3>
                <p className="flush">ID {item.id}</p>
                <p className="flush">${item.price.toFixed(2)}</p>
              </div>

              <div className="management-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => startEditing(item)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="button button-quiet"
                  onClick={() => onRemoveProduct(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="empty-state">No products available.</p>
          )}
          {error && !editingProduct && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
        </div>

        <aside className="management-editor">
          {editingProduct ? (
            <div className="edit-product-form">
              <h3>Edit product</h3>
              <p className="editor-product-name">{editingProduct.title}</p>

              <label>
                Product title
                <input
                  className="form-input"
                  value={title}
                  placeholder="Title..."
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              <label>
                Price
                <input
                  className="form-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  placeholder="Price..."
                  onChange={(e) => setPrice(e.target.value)}
                />
              </label>

              {error && (
                <p className="error-message" role="alert">
                  {error}
                </p>
              )}

              <div className="management-actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={onEditProduct}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setEditingProduct(null)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="editor-placeholder">
              <span className="editor-placeholder-icon">✎</span>
              <h3>Select a product to edit</h3>
              <p>Choose Edit on a product to open its details here.</p>
            </div>
          )}
          <AddNewProduct
            onAddProduct={(newProduct) =>
              setProducts((currentProducts) => {
                const nextId =
                  currentProducts.reduce(
                    (highestId, product) => Math.max(highestId, product.id),
                    0,
                  ) + 1;
                return [{ ...newProduct, id: nextId }, ...currentProducts];
              })
            }
          />
        </aside>
      </div>
    </div>
  );
}

function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadUsers, setReloadUsers] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("https://fakestoreapi.com/users", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const data: User[] = await response.json();
        setUsers(data);
      } catch (fetchError: unknown) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Could not load users.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchUsers();
    return () => controller.abort();
  }, [reloadUsers]);

  function startEditing(user: User) {
    setEditingUser(user);
    setUsername(user.username);
    setEmail(user.email);
    setError(null);
    setNotice(null);
  }

  async function saveUser() {
    if (!editingUser) return;
    if (!username.trim() || !email.trim()) {
      setError("Enter a username and email address.");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);
    const updatedUser = {
      ...editingUser,
      username: username.trim(),
      email: email.trim(),
    };

    try {
      const response = await fetch(
        `https://fakestoreapi.com/users/${editingUser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser),
        },
      );
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === editingUser.id ? updatedUser : user,
        ),
      );
      setEditingUser(null);
      setNotice("User updated for this session. FakeStore does not persist changes.");
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not update user.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeUser(userId: number) {
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`https://fakestoreapi.com/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId),
      );
      if (editingUser?.id === userId) setEditingUser(null);
      setNotice("User removed for this session. FakeStore does not persist changes.");
    } catch (removeError: unknown) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Could not remove user.",
      );
    }
  }

  return (
    <div className="management-section">
      <div className="management-layout">
        <div className="management-list">
          <h3 className="flush">User Management</h3>
          {loading && <p className="empty-state">Loading users...</p>}
          {!loading && error && (
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setReloadUsers((attempt) => attempt + 1)}
            >
              Try loading users again
            </button>
          )}
          {!loading &&
            users.map((user) => (
              <div key={user.id} className="management-item">
                <div>
                  <h3 className="flush">{user.username}</h3>
                  <p className="flush">ID {user.id}</p>
                  <p className="flush">{user.email}</p>
                </div>
                <div className="management-actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => startEditing(user)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button button-quiet"
                    onClick={() => removeUser(user.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          {!loading && users.length === 0 && !error && (
            <p className="empty-state">No users available.</p>
          )}
          {error && <p className="error-message" role="alert">{error}</p>}
          {notice && <p className="status-message" role="status">{notice}</p>}
        </div>

        <aside className="management-editor">
          {editingUser ? (
            <div className="edit-product-form">
              <h3>Edit user</h3>
              <p className="editor-product-name">User ID {editingUser.id}</p>
              <label>
                Username
                <input
                  className="form-input"
                  value={username}
                  autoComplete="off"
                  onChange={(event) => setUsername(event.target.value)}
                />
              </label>
              <label>
                Email
                <input
                  className="form-input"
                  type="email"
                  value={email}
                  autoComplete="off"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              {error && <p className="error-message" role="alert">{error}</p>}
              <div className="management-actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={saveUser}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setEditingUser(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="editor-placeholder">
              <span className="editor-placeholder-icon">✎</span>
              <h3>Select a user to edit</h3>
              <p>Choose Edit on a user to open their details here.</p>
            </div>
          )}
        </aside>
      </div>
      <p className="management-demo-note">
        User changes are only shown in this session. FakeStore is a demo API and
        does not persist edits or removals.
      </p>
    </div>
  );
}

function AddNewProduct({
  onAddProduct,
}: {
  onAddProduct: (product: Product) => void;
}) {
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setImage("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      setError(
        "Choose an image smaller than 1 MB. The demo API does not support file uploads.",
      );
      event.target.value = "";
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
      }
    };
    reader.onerror = () => setError("Could not read the selected image.");
    reader.readAsDataURL(file);
  }

  async function postNewProduct() {
    const numericPrice = Number(price);

    if (
      !title.trim() ||
      !price.trim() ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      setError("Enter a valid title and price greater than zero.");
      return;
    }

    if (!category.trim()) {
      setError("Category is required.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    const newProduct: Product = {
      id: 0,
      title: title.trim(),
      price: numericPrice,
      description: description.trim() || "No description provided.",
      category: category.trim(),
      image:
        image || "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
      rating: { rate: 0, count: 0 },
    };

    onAddProduct(newProduct);
    setTitle("");
    setPrice("");
    setDescription("");
    setCategory("");
    setImage("");

    try {
      const response = await fetch("https://fakestoreapi.com/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProduct,
          image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
        }),
      });

      if (!response.ok) {
        setNotice(
          `Product added for this session, but the demo API returned ${response.status}. FakeStore does not persist additions.`,
        );
        return;
      }

      setNotice(
        "Product added for this session. FakeStore is a demo API and does not persist new products.",
      );
    } catch (error: unknown) {
      setNotice(
        `Product added for this session, but the demo API request failed: ${
          error instanceof Error ? error.message : "Unknown network error"
        }`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="add-product-form">
      <h3>Add a product</h3>
      <p className="add-product-hint">
        Create a product for this session. FakeStore does not persist additions.
      </p>
      <input
        className="form-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="Product Title: "
      />
      <input
        className="form-input"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
        placeholder="Product Price"
      />
      <input
        className="form-input"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="description"
      />
      <input
        className="form-input"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="category"
      />
      <input
        className="form-input"
        aria-label="Product image"
        onChange={handleImageChange}
        type="file"
        accept="image/*"
        placeholder="Image"
      />

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="status-message" role="status">
          {notice}
        </p>
      )}
      <p>{loading ? "loading" : ""}</p>
      {image && (
        <div className="image-preview">
          <img src={image} alt="Product preview" />
          <span>Image preview</span>
        </div>
      )}

      <button
        type="button"
        className="button button-primary"
        disabled={loading}
        onClick={postNewProduct}
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
    </div>
  );
}

function Profile({
  userId,
  userData,
  setUserData,
}: {
  userId: number | null;
  userData: User | undefined;
  setUserData: Dispatch<SetStateAction<User | undefined>>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId === null) {
      setUserData(undefined);
      return;
    }

    async function getSingleUser() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://fakestoreapi.com/users/${userId}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data: User = await response.json();
        setUserData(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Could not load profile.",
        );
      } finally {
        setLoading(false);
      }
    }

    getSingleUser();
  }, [userId, setUserData]);

  if (!userData) {
    return (
      <div className="profile-panel">
        <h2 className="flush">Profile</h2>
        <p
          className={error ? "error-message" : "empty-state"}
          role={error ? "alert" : undefined}
        >
          {error ||
            (loading ? "Loading profile..." : "Sign in to view your profile.")}
        </p>
      </div>
    );
  }

  return (
    <div className="profile-panel">
      <h2 className="flush">Profile</h2>
      <p className="flush">Username: {userData.username}</p>
      <p className="flush">Email: {userData.email}</p>
    </div>
  );
}

function Wishlist({
  wishlist,
  cart,
  setWishlist,
  handleAddToCart,
  handleDecreaseQuantity,
}: {
  wishlist: Product[];
  cart: CartProduct[];
  setWishlist: Dispatch<SetStateAction<Product[]>>;
  handleAddToCart: (productId: number) => void;
  handleDecreaseQuantity: (productId: number) => void;
}) {
  if (wishlist.length === 0) {
    return (
      <section className="wishlist-list">
        <h2 className="subsection-title">Wishlist</h2>
        <p className="empty-state">
          Your wishlist is empty. Save products to find them here.
        </p>
      </section>
    );
  }

  return (
    <section className="wishlist-list">
      <h2 className="subsection-title">Wishlist ({wishlist.length})</h2>
      {wishlist.map((item) => {
        const cartItem = cart.find(
          (cartProduct) => cartProduct.productId === item.id,
        );

        return (
          <article key={item.id} className="wishlist-item">
            <img src={item.image} alt={item.title} width={80} />
            <div>
              <h3 className="flush">{item.title}</h3>
              <p className="flush">${item.price.toFixed(2)}</p>
              {cartItem && (
                <p className="wishlist-cart-status" role="status">
                  In cart · Quantity {cartItem.quantity}
                </p>
              )}
            </div>
            <div className="cart-item-actions">
              {cartItem ? (
                <div
                  className="cart-quantity-control"
                  aria-label={`Quantity in cart: ${cartItem.quantity}`}
                >
                  <button
                    type="button"
                    className="button button-icon"
                    aria-label={`Decrease ${item.title} quantity`}
                    onClick={() => handleDecreaseQuantity(item.id)}
                  >
                    −
                  </button>
                  <span className="quantity-value">{cartItem.quantity}</span>
                  <button
                    type="button"
                    className="button button-icon"
                    aria-label={`Increase ${item.title} quantity`}
                    onClick={() => handleAddToCart(item.id)}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => handleAddToCart(item.id)}
                >
                  Add to cart
                </button>
              )}

              <button
                type="button"
                className="button button-quiet"
                onClick={() =>
                  setWishlist((currentList) =>
                    currentList.filter((product) => product.id !== item.id),
                  )
                }
              >
                Remove
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function Checkout({
  cart,
  products,
  handleRemoveFromCart,
  onAddToCart,
  onPlaceOrder,
  confirmation,
  onViewOrders,
}: {
  cart: CartProduct[];
  handleRemoveFromCart: (productId: number) => void;
  products: Product[];
  onAddToCart: (productId: number) => void;
  onPlaceOrder: () => void;
  confirmation: DemoOrder | null;
  onViewOrders: () => void;
}) {
  const totalPrice = cart.reduce((total, item) => {
    const product = products.find((product) => product.id === item.productId);

    return product ? total + product.price * item.quantity : total;
  }, 0);

  const cartCategories = cart
    .map((item) => {
      const product = products.find((product) => product.id === item.productId);
      return product?.category;
    })
    .filter((category): category is string => Boolean(category));

  const recommendedProducts = products.filter(
    (product) =>
      cartCategories.includes(product.category) &&
      !cart.some((item) => item.productId === product.id),
  );

  if (confirmation) {
    return (
      <div className="order-confirmation" role="status">
        <span className="order-confirmation-icon" aria-hidden="true">✓</span>
        <p className="catalog-kicker">DEMO CHECKOUT COMPLETE</p>
        <h2>Thanks for trying the demo!</h2>
        <p>
          Your sample order <strong>{confirmation.id}</strong> has been saved in
          this browser. No payment was taken and nothing was sent to FakeStoreAPI.
        </p>
        <div className="confirmation-summary">
          <span>{confirmation.items.length} product types</span>
          <strong>${confirmation.total.toFixed(2)}</strong>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={onViewOrders}
        >
          View demo order history
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-content">
        <div className="checkout-intro">
          <h2 className="subsection-title">Checkout</h2>
          <p className="demo-disclaimer">
            Demo checkout only. No payment or real order will be processed.
          </p>
        </div>
        <p className="empty-state">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="checkout-content">
      <h2 className="subsection-title">Checkout</h2>
      {cart.map((item) => {
        const product = products.find(
          (product) => product.id === item.productId,
        );

        if (!product) return null;

        return (
          <div key={item.productId} className="checkout-cart-item">
            <p className="flush">Product: {product.title}</p>
            <button
              type="button"
              className="button button-quiet"
              onClick={() => handleRemoveFromCart(item.productId)}
            >
              delete
            </button>
            <p className="flush">Price: ${product.price.toFixed(2)}</p>
            <span />
            <p className="flush">Quantity: {item.quantity}</p>
            <span />
            <p className="flush">
              Subtotal: ${(product.price * item.quantity).toFixed(2)}
            </p>
            <span />
          </div>
        );
      })}

      <p className="checkout-total">Total: ${totalPrice.toFixed(2)}</p>

      <Form onSubmit={onPlaceOrder} />

      {recommendedProducts.length > 0 && (
        <>
          <h2 className="flush">You might also like</h2>

          <div className="recommended-products">
            {recommendedProducts.map((product) => (
              <div key={product.id} className="recommended-product">
                <ProductImage
                  src={product.image}
                  alt={product.title}
                  className="recommended-product-image"
                />
                <h3 className="flush">{product.title}</h3>
                <p className="flush">${product.price.toFixed(2)}</p>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => onAddToCart(product.id)}
                >
                  Add to cart
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Form({ onSubmit }: { onSubmit: () => void }) {
  return (
    <div className="checkout-form-panel">
      <form
        className="checkout-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <h3 className="flush">Contact Information</h3>

        <label htmlFor="fullName">Full Name</label>
        <input
          className="form-input"
          id="fullName"
          type="text"
          placeholder="John Doe"
          autoComplete="name"
          required
        />

        <label htmlFor="email">Email Address</label>
        <input
          className="form-input"
          id="email"
          type="email"
          placeholder="john@example.com"
          autoComplete="email"
          required
        />

        <label htmlFor="phone">Phone Number</label>
        <input
          className="form-input"
          id="phone"
          type="tel"
          placeholder="+1 234 567 890"
          autoComplete="tel"
          required
        />

        <h3 className="flush">Shipping Address</h3>

        <label htmlFor="address">Street Address</label>
        <input
          className="form-input"
          id="address"
          type="text"
          placeholder="123 Main Street"
          autoComplete="street-address"
          required
        />

        <div className="checkout-row">
          <div>
            <label htmlFor="city">City</label>
            <input
              className="form-input"
              id="city"
              type="text"
              placeholder="New York"
              autoComplete="address-level2"
              required
            />
          </div>

          <div>
            <label htmlFor="postalCode">Postal Code</label>
            <input
              className="form-input"
              id="postalCode"
              type="text"
              placeholder="10001"
              autoComplete="postal-code"
              required
            />
          </div>
        </div>

        <label htmlFor="country">Country</label>
        <select id="country" defaultValue="" className="form-input" required>
          <option value="" disabled>
            Select your country
          </option>
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="de">Germany</option>
          <option value="ir">Iran</option>
        </select>

        <h3 className="flush">Delivery Method</h3>

        <label className="checkout-option">
          <input type="radio" name="delivery" defaultChecked />
          Standard Delivery (demo)
        </label>

        <label className="checkout-option">
          <input type="radio" name="delivery" />
          Express Delivery (demo)
        </label>

        <h3 className="flush">Payment Method</h3>

        <label className="checkout-option">
          <input type="radio" name="payment" defaultChecked />
          Cash on Delivery (demo)
        </label>

        <label className="checkout-option">
          <input type="radio" name="payment" />
          Credit or Debit Card (demo only; no payment is taken)
        </label>

        <button type="submit" className="button button-primary fit-content">
          Place demo order
        </button>
      </form>
    </div>
  );
}
