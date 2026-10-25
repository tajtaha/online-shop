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
  const [cart, setCart] = useState<CartProduct[]>([]);
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

  return (
    <div>
      <ProductsList
        products={searchProducts ?? products}
        selectedCategory={selectedCategory}
        onAddToCart={handleAddToCart}
      />
      <Login newUser={newUser} setNewUser={setNewUser} setUserId={setUserId} />
      <SearchBar products={products} setSearchProducts={setSearchProducts} />
      <SortProducts
        categories={categories}
        setSelectedCategory={setSelectedCategory}
      />
      <UserCart cart={cart} products={products} setCart={setCart} />
      <AddNewProduct />
    </div>
  );
}

function ProductsList({
  products,
  selectedCategory,
  onAddToCart,
}: {
  products: Product[];
  selectedCategory: string | null;
  onAddToCart: (productId: number) => void;
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
          <button onClick={() => onAddToCart(product.id)}>Add to Cart +</button>
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

      const users: User[] = await usersResponse.json();
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

      <button onClick={onLogin} disabled={loading}>
        {loading ? "Please wait..." : newUser ? "Sign up" : "Log in"}
      </button>

      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}
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

function UserCart({
  cart,
  products,
  setCart,
}: {
  cart: CartProduct[];
  products: Product[];
  setCart: Dispatch<SetStateAction<CartProduct[]>>;
}) {
  function handleRemoveFromCart(productId: number) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.productId !== productId),
    );
  }
  return (
    <div>
      <h2>Your Cart</h2>

      {cart.length === 0 && <p>Your cart is empty.</p>}

      {cart.map((item) => {
        const product = products.find(
          (product) => product.id === item.productId,
        );

        if (!product) return null;

        return (
          <div key={item.productId}>
            <img src={product.image} alt={product.title} width={80} />
            <h3>{product.title}</h3>
            <p>Price: ${product.price.toFixed(2)}</p>
            <p>Quantity: {item.quantity}</p>
            <p>Subtotal: ${(product.price * item.quantity).toFixed(2)}</p>
            <button onClick={() => handleRemoveFromCart(product.id)}>
              remove from cart
            </button>
          </div>
        );
      })}
    </div>
  );
}

function AddNewProduct() {
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  async function PostNewProduct() {
    setLoading(true);
    const numericPrice = Number(price);

    if (!price.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }
    try {
      const response = await fetch("https://fakestoreapi.com/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          price: Number(price),
          description,
          category,
          image,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <input
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="Product Title: "
      />
      <input
        onChange={(e) => setPrice(e.target.value)}
        required
        placeholder="Product Price"
      />
      <input
        onChange={(e) => setDescription(e.target.value)}
        placeholder="description"
      />
      <input
        onChange={(e) => setCategory(e.target.value)}
        placeholder="category"
      />
      <input
        onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        type="file"
        placeholder="Image"
      />

      <p>{error}</p>
      <p>{loading ? "loading" : ""}</p>

      <button disabled={loading} onClick={PostNewProduct}>
        Add Product
      </button>
    </div>
  );
}
