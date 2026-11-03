export type Product = {
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

export type CartProduct = {
  productId: number;
  quantity: number;
};

export type UserCredentials = {
  id: number;
  username: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
};

export type Tab = "home" | "management" | "cart" | "wishlists" | "profile";
