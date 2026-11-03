import type { Dispatch, SetStateAction } from "react";
import type { CartProduct, Tab } from "../types";
import logo from "../assets/logo.svg";

export function NavBar({
  tab,
  setTab,
  cart,
}: {
  tab: Tab;
  setTab: Dispatch<SetStateAction<Tab>>;
  cart: CartProduct[];
}) {
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const tabs: { key: Tab; label: string }[] = [
    { key: "home", label: "Discover" },
    { key: "management", label: "Management" },
    { key: "cart", label: "Cart" },
    { key: "wishlists", label: "Wishlists" },
    { key: "profile", label: "Profile" },
  ];

  return (
    <div className="nav-content">
      <button
        type="button"
        className="brand-button"
        onClick={() => setTab("home")}
        aria-label="Online Shop home"
      >
        <img src={logo} alt="" />
        <span>Online Shop</span>
      </button>
      <nav className="main-tabs" aria-label="Main navigation">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`nav-tab${tab === key ? " is-active" : ""}`}
            aria-current={tab === key ? "page" : undefined}
            onClick={() => setTab(key)}
          >
            {label}
            {key === "cart" && cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
