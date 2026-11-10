"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const supabase = createClient();

    const redirectTo = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      console.error("Password reset error:", error);
      setError(error.message);
    } else {
      setMessage(
        "If an account exists with that email address, you will receive a password reset link shortly."
      );
      setEmail("");
    }

    setLoading(false);
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>🔐</div>

        <p style={styles.eyebrow}>ACCOUNT RECOVERY</p>

        <h1 style={styles.title}>Forgot your password?</h1>

        <p style={styles.subtitle}>
          Enter the email address you used to create your ChurchConnect
          account and we&apos;ll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email" style={styles.label}>
            Email Address
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            autoComplete="email"
            style={styles.input}
          />

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {message && (
            <div style={styles.successBox}>
              <span>✓</span>
              <p>{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.disabledButton : {}),
            }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div style={styles.divider}></div>

        <Link href="/login" style={styles.backLink}>
          ← Back to Login
        </Link>
      </div>

      <style jsx>{`
        input:focus {
          outline: none;
          border-color: #3182ce;
          box-shadow: 0 0 0 4px rgba(49, 130, 206, 0.1);
        }

        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(49, 130, 206, 0.25);
        }
      `}</style>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f9ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 20px",
  },

  card: {
    width: "100%",
    maxWidth: "470px",
    background: "white",
    border: "1px solid #dcebf6",
    borderRadius: "24px",
    padding: "38px",
    boxShadow: "0 15px 40px rgba(42, 108, 157, 0.09)",
    textAlign: "center",
  },

  icon: {
    width: "65px",
    height: "65px",
    margin: "0 auto 20px",
    borderRadius: "20px",
    background: "#eaf5ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
  },

  eyebrow: {
    margin: "0 0 9px",
    color: "#5b8bb1",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1.5px",
  },

  title: {
    margin: 0,
    color: "#1f4f91",
    fontSize: "30px",
    lineHeight: 1.2,
  },

  subtitle: {
    margin: "14px 0 28px",
    color: "#6b8499",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  label: {
    display: "block",
    textAlign: "left",
    color: "#315672",
    fontSize: "14px",
    fontWeight: 700,
    marginBottom: "9px",
  },

  input: {
    width: "100%",
    minHeight: "49px",
    padding: "12px 14px",
    border: "1px solid #d6e5ef",
    borderRadius: "12px",
    background: "#fbfdff",
    color: "#244962",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    border: "none",
    marginTop: "18px",
    padding: "14px",
    borderRadius: "12px",
    background: "#3182ce",
    color: "white",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 6px 15px rgba(49, 130, 206, 0.18)",
  },

  disabledButton: {
    opacity: 0.65,
    cursor: "not-allowed",
  },

  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    marginTop: "15px",
    padding: "12px 14px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "11px",
    color: "#9f1239",
    textAlign: "left",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  successBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    marginTop: "15px",
    padding: "12px 14px",
    background: "#ecfdf3",
    border: "1px solid #bbf7d0",
    borderRadius: "11px",
    color: "#166534",
    textAlign: "left",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  divider: {
    height: "1px",
    background: "#e7f0f6",
    margin: "27px 0 20px",
  },

  backLink: {
    color: "#2d75b8",
    fontSize: "14px",
    fontWeight: 700,
    textDecoration: "none",
  },
};