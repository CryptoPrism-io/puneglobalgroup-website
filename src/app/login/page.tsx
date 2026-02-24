"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

const T = {
  bg: "#08090a",
  surface: "#0f1012",
  surfaceAlt: "#141618",
  border: "rgba(255,255,255,0.06)",
  accent: "#00c46a",
  accentDim: "rgba(0,196,106,0.12)",
  white: "#f5f5f0",
  muted: "rgba(245,245,240,0.45)",
  display: "'Cormorant Garamond', Georgia, serif",
  body: "'Plus Jakarta Sans', system-ui, sans-serif",
};

const FONT_LINK = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/admin/");
  }, [user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/admin/");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: T.surfaceAlt, border: `1px solid ${T.border}`,
    borderRadius: 8, padding: "0.85rem 1rem", color: T.white,
    fontFamily: T.body, fontSize: "0.9rem", outline: "none",
    boxSizing: "border-box",
  };

  return (
    <>
      <style>{FONT_LINK}</style>
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: T.body }}>
        {/* Background glow */}
        <div style={{ position: "fixed", top: "30%", left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: `radial-gradient(ellipse, rgba(0,196,106,0.08), transparent)`, pointerEvents: "none" }} />

        <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: `linear-gradient(135deg, ${T.accent}, #00a857)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", boxShadow: `0 0 32px rgba(0,196,106,0.3)` }}>
              <Lock size={22} color="#000" />
            </div>
            <h1 style={{ fontFamily: T.display, fontSize: "2rem", fontWeight: 600, color: T.white, marginBottom: "0.25rem" }}>Admin Portal</h1>
            <p style={{ fontSize: "0.85rem", color: T.muted }}>Pune Global Group — Secure Access</p>
          </div>

          {/* Card */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "2.5rem" }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.75rem", color: T.muted, marginBottom: "0.4rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Email</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@puneglobalgroup.in"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = T.accent)}
                  onBlur={e => (e.target.style.borderColor = T.border)}
                />
              </div>

              <div style={{ marginBottom: "1.75rem" }}>
                <label style={{ display: "block", fontSize: "0.75rem", color: T.muted, marginBottom: "0.4rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: "3rem" }}
                    onFocus={e => (e.target.style.borderColor = T.accent)}
                    onBlur={e => (e.target.style.borderColor = T.border)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex" }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1.25rem", padding: "0.75rem 1rem", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, fontSize: "0.875rem", color: "#f87171" }}>
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: T.accent, color: "#000", border: "none", borderRadius: 8, padding: "0.9rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: T.body, fontSize: "0.95rem", fontWeight: 600, opacity: loading ? 0.75 : 1, transition: "all 0.2s" }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#00e07a"; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.accent; }}
              >
                {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Signing in…</> : "Sign In"}
              </button>
            </form>
          </div>

          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem", color: T.muted }}>
            <a href="/" style={{ color: T.accent, textDecoration: "none" }}>← Back to website</a>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
