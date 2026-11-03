import { useEffect, useState } from "react";
import type { CartProduct, Product, Tab, User } from "./types";
import { NavBar } from "./components/navigation";
import { ProductsList, SearchBar, SortProducts } from "./components/catalog";
import { Login, Profile } from "./components/account";
import { Checkout, UserCart, Wishlist } from "./components/cart";
import { Management } from "./components/management";
import { StatusMessage } from "./components/shared";
import "./App.css";

export default function App() {
  const [cart, setCart] = useState<CartProduct[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [tab, setTab] = useState<Tab>("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newUser, setNewUser] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [userData, setUserData] = useState<User>();
  const [sort, setSort] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("https://fakestoreapi.com/products");
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

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
  }, []);

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

  const visibleProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategory === null ||
        selectedCategory === "all" ||
        product.category === selectedCategory;
      const matchesSearch = product.title
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => (sort === "asc" ? a.price - b.price : b.price - a.price));

  if (loading) {
    return (
      <div className="app-state" role="status">
        <span className="spinner" aria-hidden="true" />
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-state">
        <StatusMessage
          type="error"
          title="Couldn't load products"
          message={error}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <NavBar tab={tab} setTab={setTab} cart={cart} />
      </header>
      <main className="page-content">
        {tab === "home" && (
          <section aria-label="Discover products">
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
            />
            <ProductsList
              products={visibleProducts}
              wishlist={wishlist}
              cart={cart}
              setCart={setCart}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              removeFromCart={handleRemoveFromCart}
            />
          </section>
        )}

        {tab === "management" && <Management products={products} />}

        {tab === "cart" && (
          <section className="cart-page">
            <UserCart
              cart={cart}
              products={products}
              setCart={setCart}
              handleRemoveFromCart={handleRemoveFromCart}
            />
            <Checkout
              cart={cart}
              products={products}
              onAddToCart={handleAddToCart}
            />
          </section>
        )}

        {tab === "wishlists" && (
          <Wishlist
            wishlist={wishlist}
            setWishlist={setWishlist}
            cart={cart}
            setCart={setCart}
            handleAddToCart={handleAddToCart}
            removeFromCart={handleRemoveFromCart}
          />
        )}

        {tab === "profile" && (
          <section className="profile-page">
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
          </section>
        )}
      </main>
    </div>
  );
}
