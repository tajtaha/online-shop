import { useEffect, useState, type Dispatch, type SetStateAction, type SubmitEvent } from "react";
import type { User, UserCredentials } from "../types";
import { EmptyState, StatusMessage } from "./shared";

export function Login({
  newUser,
  setNewUser,
  setUserId,
}: {
  newUser: boolean;
  setNewUser: Dispatch<SetStateAction<boolean>>;
  setUserId: Dispatch<SetStateAction<number | null>>;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
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
      await response.json();
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

      const usersResponse = await fetch("https://fakestoreapi.com/users");
      if (!usersResponse.ok) throw new Error("Could not fetch users.");
      const users: UserCredentials[] = await usersResponse.json();
      const user = users.find((item) => item.username === username);
      if (!user) throw new Error("Could not find this demo user.");

      setUserId(user.id);
      setNewUser(false);
      setSuccess("Login successful.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function onLogin(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newUser) void postCredentials();
    else void authenticateUser();
  }

  return (
    <section className="panel auth-card">
      <h2>{newUser ? "Create your account" : "Welcome back"}</h2>
      <form className="form-stack" onSubmit={onLogin}>
        <label className="field">
          <span>Username</span>
          <input
            autoComplete="username"
            placeholder="Enter username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete={newUser ? "new-password" : "current-password"}
            placeholder="Enter password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {newUser && (
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="Enter email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
        )}
        <button
          type="submit"
          className="button button-primary button-block"
          disabled={loading}
        >
          {loading ? "Please wait..." : newUser ? "Sign up" : "Log in"}
        </button>
        {error && <StatusMessage type="error" message={error} />}
        {success && <StatusMessage type="success" message={success} />}
        <button
          type="button"
          className="button button-link"
          onClick={() => setNewUser(!newUser)}
        >
          {newUser ? "Already have an account? Log in" : "New user? Sign up"}
        </button>
      </form>
    </section>
  );
}

export function Profile({
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
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data: User = await response.json();
        setUserData(data);
      } catch (err: unknown) {
        console.error(err);
      }
    }

    getSingleUser();
  }, [userId, setUserData]);

  if (!userData) {
    return <EmptyState>No user loaded. Log in to view your profile.</EmptyState>;
  }

  return (
    <section className="panel profile-card">
      <h2>Your profile</h2>
      <dl className="description-list">
        <div>
          <dt>Username</dt>
          <dd>{userData.username}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{userData.email}</dd>
        </div>
      </dl>
    </section>
  );
}
