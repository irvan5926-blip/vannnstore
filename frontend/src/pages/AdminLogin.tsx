import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { login } from "../lib/api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      nav("/admin");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Link to="/" className="mb-6 hover:opacity-90">
        <Logo size={42} />
      </Link>
      <form
        onSubmit={onSubmit}
        className="card p-6 w-full max-w-sm space-y-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Login Admin</h1>
          <p className="text-sm text-white/60 mt-1">
            Masuk untuk mengelola produk & harga.
          </p>
        </div>
        {error && (
          <div className="bg-rose-500/15 border border-rose-400/30 text-rose-200 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider text-white/60">
            Username
          </label>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider text-white/60">
            Password
          </label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Masuk..." : "Masuk"}
        </button>
        <p className="text-xs text-center text-white/50">
          Default: admin / vannnstore2025 — segera ganti setelah login pertama.
        </p>
      </form>
      <Link to="/" className="mt-6 text-sm text-white/70 hover:text-white">
        ← Kembali ke storefront
      </Link>
    </div>
  );
}
