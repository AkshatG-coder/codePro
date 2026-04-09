"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) { setError("Invalid email or password."); return; }
    router.push("/");
    router.refresh();
  };

  const handleGoogle = () => signIn("google", { callbackUrl: "/" });

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-base)", padding: "2rem",
    }}>
      <div style={{
        width: "100%", maxWidth: 400,
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        padding: "2.5rem",
        boxShadow: "var(--shadow-lg)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{ fontSize: "1.5rem", fontWeight: 800 }}>
            <span style={{
              background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>{"</>"}</span>{" "}
            <span style={{ color: "var(--text-primary)" }}>CodePro</span>
          </Link>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "1rem" }}>Welcome back</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Sign in to continue competing</p>
        </div>

        {/* Google OAuth */}
        <button onClick={handleGoogle} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
          padding: "0.75rem", borderRadius: "var(--radius-md)",
          background: "var(--bg-elevated)", border: "1px solid var(--border)",
          color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem",
          cursor: "pointer", transition: "border-color 0.2s",
          marginBottom: "1.25rem",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Credentials */}
        <form onSubmit={handleCredentials} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.375rem" }}>
              Email
            </label>
            <input id="email" className="input" type="email" required placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.375rem" }}>
              Password
            </label>
            <input id="password" className="input" type="password" required placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>

          {error && <p style={{ color: "var(--accent-red)", fontSize: "0.85rem" }}>{error}</p>}

          <button id="login-btn" type="submit" disabled={loading} className="btn btn-primary"
            style={{ padding: "0.75rem", fontSize: "0.95rem", marginTop: "0.25rem", justifyContent: "center" }}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</> : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "1.5rem" }}>
          No account?{" "}
          <Link href="/register" style={{ color: "var(--accent-blue)", fontWeight: 600 }}>Register →</Link>
        </p>
      </div>
    </div>
  );
}
