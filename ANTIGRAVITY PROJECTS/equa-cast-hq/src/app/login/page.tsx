"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result && result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result && result.success) {
      router.push("/");
      // Force reload to update RootLayout session state
      window.location.href = "/";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#0A0A0B",
        backgroundImage: "radial-gradient(circle at top right, rgba(255, 90, 31, 0.05), transparent)",
        padding: "1rem",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "#121214",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          border: "1px solid #26262B",
          padding: "2.5rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              fontFamily: "Outfit, sans-serif",
              letterSpacing: "-0.03em",
              color: "#F4F4F6",
            }}
          >
            EQUACAST<span style={{ color: "#FF5A1F" }}>HQ</span>
          </h1>
          <p
            style={{
              fontSize: "0.8rem",
              color: "#A1A1AA",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginTop: "0.25rem",
              fontWeight: 600,
            }}
          >
            Content Command
          </p>
        </div>

        {error && (
          <div
            className="alert-banner alert-danger"
            style={{ padding: "0.75rem", fontSize: "0.85rem", marginBottom: "1.25rem" }}
          >
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              className="form-input"
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              placeholder="e.g. chris"
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "2rem" }}>
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              className="form-input"
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            style={{ width: "100%", padding: "0.85rem" }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Login to HQ"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.75rem", color: "#52525B" }}>
          Initial Credentials:<br />
          Chris: <code style={{ color: "#A1A1AA" }}>chris</code> / <code style={{ color: "#A1A1AA" }}>chris123</code><br />
          Byron: <code style={{ color: "#A1A1AA" }}>byron</code> / <code style={{ color: "#A1A1AA" }}>byron123</code>
        </div>
      </div>
    </div>
  );
}
