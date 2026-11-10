"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [checkingSession, setCheckingSession] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(
          "This password reset link is invalid or has expired. Please request a new one."
        );
      }

      setCheckingSession(false);
    }

    checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Your password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error("Password update error:", error);
      setError(error.message);
      setSaving(false);
      return;
    }

    setMessage("Your password has been updated successfully!");

    setPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      router.push("/dashboard");
    }, 1800);

    setSaving(false);
  }

  if (checkingSession) {
    return (
      <main style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>
          <p>Verifying your password reset link...</p>
        </div>

        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>🔑</div>

        <p style={styles.eyebrow}>ACCOUNT RECOVERY</p>

        <h1 style={styles.title}>Create a new password</h1>

        <p style={styles.subtitle}>
          Choose a new password for your ChurchConnect account.
        </p>

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

        {!error && !message && (
          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label htmlFor="password" style={styles.label}>
                New Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                required
                minLength={6}
                autoComplete="new-password"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="confirmPassword" style={styles.label}>
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter your password again"
                required
                minLength={6}
                autoComplete="new-password"
                style={styles.input}
              />
            </div>

            <p style={styles.passwordHint}>
              Use at least 6 characters. A longer password is recommended.
            </p>

            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.button,
                ...(saving ? styles.disabledButton : {}),
              }}
            >
              {saving ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}

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
    margin: "14px 0 27px",
    color: "#6b8499",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  field: {
    marginBottom: "18px",
    textAlign: "left",
  },

  label: {
    display: "block",
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

  passwordHint: {
    margin: "-3px 0 18px",
    color: "#8aa0b2",
    fontSize: "12px",
    lineHeight: 1.5,
    textAlign: "left",
  },

  button: {
    width: "100%",
    border: "none",
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
    marginBottom: "20px",
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
    marginBottom: "20px",
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

  loadingCard: {
    background: "white",
    border: "1px solid #dcebf6",
    borderRadius: "24px",
    padding: "45px",
    textAlign: "center",
    color: "#6b8499",
  },

  spinner: {
    width: "40px",
    height: "40px",
    margin: "0 auto 15px",
    border: "4px solid #dceeff",
    borderTop: "4px solid #3182ce",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};