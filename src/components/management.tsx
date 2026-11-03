import {
  useEffect,
  useState,
  type SubmitEvent,
} from "react";
import type { Product, User } from "../types";
import { EmptyState, LoadingState, StatusMessage } from "./shared";

export function Management({ products }: { products: Product[] }) {
  const [activeSection, setActiveSection] = useState<"products" | "users">(
    "products",
  );

  return (
    <section className="management">
      <div className="management-tabs" role="tablist" aria-label="Manage">
        <button
          type="button"
          role="tab"
          aria-selected={activeSection === "products"}
          className={`management-tab${activeSection === "products" ? " is-active" : ""}`}
          onClick={() => setActiveSection("products")}
        >
          Products
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSection === "users"}
          className={`management-tab${activeSection === "users" ? " is-active" : ""}`}
          onClick={() => setActiveSection("users")}
        >
          Users
        </button>
      </div>
      <div role="tabpanel">
        {activeSection === "products" ? (
          <ProductsManagement products={products} />
        ) : (
          <UserManagement />
        )}
      </div>
    </section>
  );
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getUsers() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("https://fakestoreapi.com/users");
        if (!response.ok) throw new Error("Failed to fetch users.");
        const data: User[] = await response.json();
        setUsers(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    getUsers();
  }, []);

  async function handleUserRemove(userId: number) {
    try {
      const response = await fetch(
        `https://fakestoreapi.com/users/${userId}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Failed to remove user.");
      setUsers((previous) => previous.filter((user) => user.id !== userId));
      if (selectedUserId === userId) setSelectedUserId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (loading) return <LoadingState message="Loading users..." />;
  if (error) return <StatusMessage type="error" message={error} />;

  return (
    <div className="management-content">
      {users.length === 0 && <EmptyState>No users found</EmptyState>}
      <div className="management-layout">
        <div className="management-grid">
          {users.map((user) => (
            <article key={user.id} className="management-card">
              <header className="management-card-header">
                <span className="avatar">
                  {user.username.charAt(0).toUpperCase()}
                </span>
                <h2>{user.username}</h2>
              </header>
              <dl className="description-list">
                <div>
                  <dt>User ID</dt>
                  <dd>{user.id}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{user.email}</dd>
                </div>
              </dl>
              <div className="button-row">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setSelectedUserId(user.id)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="button button-danger"
                  onClick={() => void handleUserRemove(user.id)}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
        <aside className="management-aside">
          {selectedUserId !== null ? (
            <EditUser
              userId={selectedUserId}
              onCancel={() => setSelectedUserId(null)}
            />
          ) : (
            <EmptyState>Select a user to edit</EmptyState>
          )}
        </aside>
      </div>
    </div>
  );
}

export function EditUser({
  userId,
  onCancel,
}: {
  userId: number;
  onCancel: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUserEdit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://fakestoreapi.com/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });
      if (!response.ok) throw new Error("Failed to update user.");
      await response.json();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel edit-card">
      <h2>Edit user</h2>
      <form className="form-stack" onSubmit={handleUserEdit}>
        <label className="field">
          <span>Username</span>
          <input
            placeholder="Enter username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        {error && <StatusMessage type="error" message={error} />}
        <div className="button-row">
          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export function ProductsManagement({ products }: { products: Product[] }) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [removedProducts, setRemovedProducts] = useState<number[]>([]);
  const visibleProducts = products.filter(
    (product) => !removedProducts.includes(product.id),
  );

  async function onRemoveProduct(productId: number) {
    try {
      const response = await fetch(
        `https://fakestoreapi.com/products/${productId}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Failed to remove product.");
      setRemovedProducts((current) => [...current, productId]);
    } catch (err: unknown) {
      window.alert(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  }

  return (
    <div className="management-content">
      <div className="management-layout">
        <div className="management-grid">
          {visibleProducts.map((product) => (
            <article key={product.id} className="management-card">
              <h2>{product.title}</h2>
              <span className="tag">Product #{product.id}</span>
              <strong className="management-price">
                ${product.price.toFixed(2)}
              </strong>
              <div className="button-row">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setEditingProduct(product)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="button button-danger"
                  onClick={() => void onRemoveProduct(product.id)}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
        <aside className="management-aside">
          {editingProduct && (
            <EditProduct
              key={editingProduct.id}
              product={editingProduct}
              onCancel={() => setEditingProduct(null)}
            />
          )}
          <AddNewProduct />
        </aside>
      </div>
    </div>
  );
}

export function EditProduct({
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

  async function onEditProduct(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
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
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      await response.json();
      onCancel();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel edit-card">
      <h2>Edit product</h2>
      <form className="form-stack" onSubmit={onEditProduct}>
        <label className="field">
          <span>Title</span>
          <input
            value={title}
            placeholder="Product title"
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Price</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
          />
        </label>
        {error && <StatusMessage type="error" message={error} />}
        <div className="button-row">
          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export function AddNewProduct() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function postNewProduct(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericPrice = Number(price);
    if (!price.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("https://fakestoreapi.com/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          price: numericPrice,
          description,
          category,
          image,
        }),
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      await response.json();
      setSuccess("Product added.");
      setTitle("");
      setPrice("");
      setDescription("");
      setCategory("");
      setImage("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel edit-card add-product-card">
      <h2>Add a product</h2>
      <form className="form-stack" onSubmit={postNewProduct}>
        <label className="field">
          <span>Product title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Product title"
            required
          />
        </label>
        <label className="field">
          <span>Price</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Product price"
            required
          />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Product description"
          />
        </label>
        <label className="field">
          <span>Category</span>
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Product category"
          />
        </label>
        <label className="field">
          <span>Image URL</span>
          <input
            type="url"
            value={image}
            onChange={(event) => setImage(event.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </label>
        {error && <StatusMessage type="error" message={error} />}
        {success && <StatusMessage type="success" message={success} />}
        <button
          type="submit"
          className="button button-primary"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add product"}
        </button>
      </form>
    </section>
  );
}
