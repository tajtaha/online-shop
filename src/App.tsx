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

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchProducts, setSearchProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
      <Login />
      <SearchBar products={products} setSearchProducts={setSearchProducts} />
      <SortProducts
        categories={categories}
        setSelectedCategory={setSelectedCategory}
      />
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

function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  async function postCredentials() {
    const response = await fetch("https://fakestoreapi.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    console.log(data);
  }

  return (
    <div>
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

      <button onClick={postCredentials}>Sign in</button>
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
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
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
