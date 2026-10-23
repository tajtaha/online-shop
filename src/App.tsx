import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
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

type Cart = {
  id: number;
  userId: number;
  date: string;
  products: CartProduct[];
};

type User = {
  id: number;
  username: string;
};

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchProducts, setSearchProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<boolean>(true);
  const [cart, setCart] = useState<Cart[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const URL = "https://fakestoreapi.com/products";

    async function fetchProducts() {
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
  }, []);

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <ProductsList
        products={searchProducts ?? products}
        selectedCategory={selectedCategory}
      />
      <Login newUser={newUser} setNewUser={setNewUser} setUserId={setUserId} />
      <SearchBar products={products} setSearchProducts={setSearchProducts} />
      <SortProducts
        categories={categories}
        setSelectedCategory={setSelectedCategory}
      />
      <Cart userId={userId} setCart={setCart} cart={cart} products={products} />
    </div>
  );
}

function ProductsList({
  products,
  selectedCategory,
}: {
  products: Product[];
  selectedCategory: string | null;
}) {
  const filteredProducts =
    selectedCategory === null || selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  if (filteredProducts.length === 0) {
    return <p>No products found.</p>;
  }

  return (
    <div className="products">
      {filteredProducts.map((product) => (
        <article key={product.id} className="product">
          <img src={product.image} alt={product.title} />
          <h2>{product.title}</h2>
          <p>{product.description}</p>
          <p>${product.price.toFixed(2)}</p>
          <p>
            Rating: {product.rating.rate} ({product.rating.count} reviews)
          </p>
        </article>
      ))}
    </div>
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

  async function postCredentials() {
    const response = await fetch("https://fakestoreapi.com/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email }),
    });
    const data = await response.json();
    console.log(data);
  }

  async function authenticateUser() {
    try {
      const response = await fetch("https://fakestoreapi.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const usersResponse = await fetch("https://fakestoreapi.com/users");

      if (!usersResponse.ok) {
        throw new Error("Could not fetch users");
      }

      const users: User[] = await usersResponse.json();
      const user = users.find((user) => user.username === username);

      if (!user) {
        throw new Error("Could not find this user");
      }

      setUserId(user.id);
      setNewUser(false);
    } catch (err) {
      console.error(err);
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
    <div>
      <p>{newUser ? "Sign up" : "Log in"}</p>
      <input
        placeholder="Enter Username ..."
        onChange={(e) => setUsername(e.target.value)}
        type="text"
      />
      <input
        placeholder="Enter Password ..."
        onChange={(e) => setPassword(e.target.value)}
        type="password"
      />

      {newUser && (
        <input
          placeholder="Enter Email ..."
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
      )}

      <button onClick={onLogin}>{newUser ? "Sign up" : "Log in"}</button>
      <button onClick={() => setNewUser(!newUser)}>
        {newUser ? "Already have an account? Log in" : "New user? Sign up"}
      </button>
    </div>
  );
}

function SearchBar({
  products,
  setSearchProducts,
}: {
  products: Product[];
  setSearchProducts: Dispatch<SetStateAction<Product[] | null>>;
}) {
  function handleSearch(query: string) {
    setSearchProducts(
      query.trim() === ""
        ? null
        : products.filter((product) =>
            product.title.toLowerCase().includes(query.toLowerCase()),
          ),
    );
  }
  return (
    <div>
      <input
        placeholder="Search products..."
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}

function SortProducts({
  categories,
  setSelectedCategory,
}: {
  categories: string[];
  setSelectedCategory: Dispatch<SetStateAction<string | null>>;
}) {
  return (
    <div>
      <select onChange={(e) => setSelectedCategory(e.target.value)}>
        <option value={"all"}>All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}

function Cart({
  userId,
  setCart,
  cart,
  products,
}: {
  userId: number | null;
  setCart: Dispatch<SetStateAction<Cart[]>>;
  cart: Cart[];
  products: Product[];
}) {
  useEffect(() => {
    if (userId === null) return;

    const URL = `https://fakestoreapi.com/carts/user/${userId}`;

    async function fetchCart() {
      try {
        const response = await fetch(URL);

        if (!response.ok) {
          throw new Error("Could not fetch cart");
        }

        const data = await response.json();
        console.log(data);
        setCart(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchCart();
  }, [userId]);

  return (
    <div>
      {cart.map((cartEntry) => (
        <div key={cartEntry.id}>
          {cartEntry.products.map((item) => {
            const product = products.find((p) => p.id === item.productId);

            if (!product) return null;

            return (
              <div key={item.productId}>
                <img src={product.image} alt={product.title} width={80} />
                <h3>{product.title}</h3>
                <p>Price: ${product.price.toFixed(2)}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Subtotal: ${(product.price * item.quantity).toFixed(2)}</p>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
