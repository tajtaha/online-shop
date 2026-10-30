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

type Tab = "home" | "management" | "cart" | "wishlists" | "profile";

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
  const [newUser, setNewUser] = useState<boolean>(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [userData, setUserData] = useState<User>();
  const [sort, setSort] = useState<"desc" | "asc">("desc");

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

  return (
    <div>
      <NavBar setTab={setTab} />
      <main>
        {tab === "home" && (
          <>
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
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
            />
          </>
        )}

        {tab === "management" && <Management products={products} />}

        {tab === "cart" && (
          <>
            <UserCart
              cart={cart}
              products={products}
              setCart={setCart}
              handleRemoveFromCart={handleRemoveFromCart}
            />
            <Checkout
              cart={cart}
              handleRemoveFromCart={handleRemoveFromCart}
              products={products}
            />
          </>
        )}

        {tab === "wishlists" && (
          <Wishlist
            wishlist={wishlist}
            setWishlist={setWishlist}
            handleAddToCart={handleAddToCart}
          />
        )}

        {tab === "profile" && (
          <>
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
          </>
        )}
      </main>
    </div>
  );
}

function NavBar({ setTab }: { setTab: Dispatch<SetStateAction<Tab>> }) {
  return (
    <div>
      <Logo setTab={setTab} />
      <Tabs setTab={setTab} />
      <button onClick={() => setTab("profile")}>Profile</button>
    </div>
  );
}

function Logo({ setTab }: { setTab: Dispatch<SetStateAction<Tab>> }) {
  return (
    <div onClick={() => setTab("home")}>
      <img src="./assets/logo.svg" />
      <h1>Online Shop</h1>
    </div>
  );
}

function Tabs({ setTab }: { setTab: Dispatch<SetStateAction<Tab>> }) {
  return (
    <div>
      <button onClick={() => setTab("home")}>Discover</button>
      <button onClick={() => setTab("management")}>Management</button>
      <button onClick={() => setTab("cart")}>Cart</button>
      <button onClick={() => setTab("wishlists")}>Wishlists</button>
    </div>
  );
}

function ProductsList({
  products,
  wishlist,
  onAddToCart,
  onAddToWishlist,
}: {
  products: Product[];
  wishlist: Product[];
  onAddToCart: (productId: number) => void;
  onAddToWishlist: (productId: number) => void;
}) {
  if (products.length === 0) {
    return <p>No products found.</p>;
  }

  return (
    <div className="products">
      {products.map((product) => {
        const isWishlisted = wishlist.some((item) => item.id === product.id);

        return (
          <article key={product.id} className="product">
            <img src={product.image} alt={product.title} />
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <p>${product.price.toFixed(2)}</p>
            <p>
              Rating: {product.rating.rate} ({product.rating.count} reviews)
            </p>

            <button onClick={() => onAddToCart(product.id)}>
              Add to Cart +
            </button>

            <button
              onClick={() => onAddToWishlist(product.id)}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              {isWishlisted ? "★" : "☆"}
            </button>
          </article>
        );
      })}
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
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div>
      <input
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}

function SortProducts({
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
    <div>
      <select
        value={selectedCategory ?? "all"}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="all">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <button
        onClick={() =>
          setSort((current) => (current === "asc" ? "desc" : "asc"))
        }
      >
        {sort === "asc" ? "Price: Low to High ↑" : "Price: High to Low ↓"}
      </button>
    </div>
  );
}

function UserCart({
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
  function handleIncrease(productId: number) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }

  function handleDecrease(productId: number) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.productId === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  }

  const totalPrice = cart.reduce((total, item) => {
    const product = products.find((product) => product.id === item.productId);

    return product ? total + product.price * item.quantity : total;
  }, 0);

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

            <button onClick={() => handleDecrease(item.productId)}>-</button>
            <button onClick={() => handleIncrease(item.productId)}>+</button>
            <button onClick={() => handleRemoveFromCart(item.productId)}>
              Remove
            </button>
          </div>
        );
      })}

      <h3>Total: ${totalPrice.toFixed(2)}</h3>
      <h3>{products.length} Products</h3>
      <button onClick={() => setCart([])}>Clear Cart</button>
    </div>
  );
}

function Management({ products }: { products: Product[] }) {
  return (
    <div>
      <ProductsManagement products={products} />
      <UserManagement />
    </div>
  );
}

function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getUsers() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("https://fakestoreapi.com/users");

        if (!response.ok) {
          throw new Error("Failed to fetch users.");
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Something went wrong.",
        );
      } finally {
        setLoading(false);
      }
    }

    getUsers();
  }, []);

  function handleUserRemove(userId: number) {
    fetch(`https://fakestoreapi.com/users/${userId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  }

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;
  return (
    <div>
      {users.map((user) => (
        <div>
          <h2>{user.id}</h2>
          <p>{user.username}</p>
          <p>{user.password}</p>
          <p>{user.email}</p>
          <button onClick={() => setSelectedUserId(user.id)}>Edit</button>
          <button onClick={() => handleUserRemove(user.id)}>Remove</button>
        </div>
      ))}
      {selectedUserId && <EditUser userId={selectedUserId} />}
    </div>
  );
}

function EditUser({ userId }: { userId: number }) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleUserEdit() {
    try {
      setLoading(true);
      setError(null);

      const user = {
        username,
        password,
        email,
      };

      const response = await fetch(`https://fakestoreapi.com/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error("Failed to update user.");
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <input
        placeholder="Enter username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Enter password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        placeholder="Enter email"
        onChange={(e) => setEmail(e.target.value)}
      />
      {error && <p>{error}</p>}

      <button onClick={handleUserEdit} disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </button>
      <button>Cancel</button>
    </div>
  );
}

function ProductsManagement({ products }: { products: Product[] }) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  function startEditing(product: Product) {
    setEditingProduct(product);
  }

  function onRemoveProduct(productId: number) {
    fetch(`https://fakestoreapi.com/products/${productId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  }

  return (
    <div>
      {products.map((item) => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.id}</p>
          <p>${item.price.toFixed(2)}</p>

          <button onClick={() => startEditing(item)}>Edit</button>
          <button onClick={() => onRemoveProduct(item.id)}>Remove</button>
        </div>
      ))}

      {editingProduct && (
        <EditProduct
          key={editingProduct.id}
          product={editingProduct}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      <AddNewProduct />
    </div>
  );
}

function EditProduct({
  product,
  onCancel,
}: {
  product: Product;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(String(product.price));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onEditProduct() {
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
        `https://fakestoreapi.com/products/${product.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            price: numericPrice,
            description: product.description,
            category: product.category,
            image: product.image,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      onCancel();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3>Edit {product.title}</h3>

      <input
        value={title}
        placeholder="Title..."
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="number"
        min="0.01"
        step="0.01"
        value={price}
        placeholder="Price..."
        onChange={(e) => setPrice(e.target.value)}
      />

      {error && <p role="alert">{error}</p>}

      <button onClick={onEditProduct} disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </button>

      <button onClick={onCancel} disabled={loading}>
        Cancel
      </button>
    </div>
  );
}

function AddNewProduct() {
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  async function PostNewProduct() {
    const numericPrice = Number(price);

    if (!price.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }
    setLoading(true);
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
        onChange={(e) => setImage(e.target.value)}
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

function Profile({
  userId,
  userData,
  setUserData,
}: {
  userId: number | null;
  userData: User | undefined;
  setUserData: Dispatch<SetStateAction<User | undefined>>;
}) {
  useEffect(() => {
    if (userId === null) {
      setUserData(undefined);
      return;
    }

    async function getSingleUser() {
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
        console.error(error);
      }
    }

    getSingleUser();
  }, [userId, setUserData]);

  if (!userData) {
    return <p>No user loaded.</p>;
  }

  return (
    <div>
      <h2>Profile</h2>
      <p>Username: {userData.username}</p>
      <p>Email: {userData.email}</p>
    </div>
  );
}

function Wishlist({
  wishlist,
  setWishlist,
  handleAddToCart,
}: {
  wishlist: Product[];
  setWishlist: Dispatch<SetStateAction<Product[]>>;
  handleAddToCart: (productId: number) => void;
}) {
  if (wishlist.length === 0) {
    return (
      <section>
        <h2>Wishlist</h2>
        <p>Your wishlist is empty.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Wishlist ({wishlist.length})</h2>

      {wishlist.map((item) => (
        <article key={item.id}>
          <img src={item.image} alt={item.title} width={80} />
          <h3>{item.title}</h3>
          <p>${item.price.toFixed(2)}</p>
          <button onClick={() => handleAddToCart(item.id)}>Add to Cart</button>

          <button
            onClick={() =>
              setWishlist((currentList) =>
                currentList.filter((product) => product.id !== item.id),
              )
            }
          >
            Remove
          </button>
        </article>
      ))}
    </section>
  );
}

function Checkout({
  cart,
  products,
  handleRemoveFromCart,
}: {
  cart: CartProduct[];
  handleRemoveFromCart: (productId: number) => void;
  products: Product[];
}) {
  const totalPrice = cart.reduce((total, item) => {
    const product = products.find((product) => product.id === item.productId);

    return product ? total + product.price * item.quantity : total;
  }, 0);

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
    <div>
      {cart.map((item) => {
        const product = products.find(
          (product) => product.id === item.productId,
        );

        if (!product) return null;

        return (
          <div key={item.productId}>
            <p>Product: {product.title}</p>
            <p>Price: ${product.price.toFixed(2)}</p>
            <p>Quantity: {item.quantity}</p>
            <p>Subtotal: ${(product.price * item.quantity).toFixed(2)}</p>
            <button onClick={() => handleRemoveFromCart(item.productId)}>
              delete
            </button>
          </div>
        );
      })}

      <p>{totalPrice}</p>

      <Form />

      <h2>You might also like</h2>

      {recommendedProducts.map((product) => (
        <div key={product.id}>
          <img src={product.image} alt={product.title} width={80} />
          <h3>{product.title}</h3>
          <p>${product.price.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}

function Form() {
  return (
    <div>
      <form>
        <h3>Contact Information</h3>

        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          type="text"
          placeholder="John Doe"
          autoComplete="name"
        />

        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          placeholder="john@example.com"
          autoComplete="email"
        />

        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          type="tel"
          placeholder="+1 234 567 890"
          autoComplete="tel"
        />

        <h3>Shipping Address</h3>

        <label htmlFor="address">Street Address</label>
        <input
          id="address"
          type="text"
          placeholder="123 Main Street"
          autoComplete="street-address"
        />

        <div className="checkout-row">
          <div>
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              placeholder="New York"
              autoComplete="address-level2"
            />
          </div>

          <div>
            <label htmlFor="postalCode">Postal Code</label>
            <input
              id="postalCode"
              type="text"
              placeholder="10001"
              autoComplete="postal-code"
            />
          </div>
        </div>

        <label htmlFor="country">Country</label>
        <select id="country" defaultValue="">
          <option value="" disabled>
            Select your country
          </option>
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="de">Germany</option>
          <option value="ir">Iran</option>
        </select>

        <h3>Delivery Method</h3>

        <label className="checkout-option">
          <input type="radio" name="delivery" defaultChecked />
          Standard Delivery
        </label>

        <label className="checkout-option">
          <input type="radio" name="delivery" />
          Express Delivery
        </label>

        <h3>Payment Method</h3>

        <label className="checkout-option">
          <input type="radio" name="payment" defaultChecked />
          Cash on Delivery
        </label>

        <label className="checkout-option">
          <input type="radio" name="payment" />
          Credit or Debit Card
        </label>

        <button type="button">Place Order</button>
      </form>
    </div>
  );
}
