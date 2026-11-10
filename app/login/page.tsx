"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        <section className="auth-visual login-visual">
          <div className="auth-visual-overlay" />

          <div className="auth-visual-content">
            <span className="auth-eyebrow">WELCOME BACK</span>

            <h1>
              Your community.
              <br />
              <span>Your family.</span>
            </h1>

            <p>
              Stay connected with your church family, grow in faith,
              and discover new opportunities to serve.
            </p>

            <div className="auth-visual-footer">
              <span className="auth-visual-line" />
              <span>FAITH · FELLOWSHIP · SERVICE</span>
            </div>
          </div>
        </section>

        <section className="auth-form-section">
          <div className="auth-form-wrapper">
            <div className="auth-form-heading">
              <span className="auth-small-label">CHURCHCONNECT</span>

              <h2>Welcome back!</h2>

              <p>
                Sign in to access your church community account.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-field">
                <label htmlFor="email">Email Address</label>

                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password">Password</label>

                  <Link href="/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <div className="auth-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
                        <path d="M9.9 5.2A10.8 10.8 0 0112 5c5.5 0 9 7 9 7a16 16 0 01-3.1 3.9M6.2 6.2C3.8 7.8 2 12 2 12s3.5 7 10 7a10.5 10.5 0 004-.8" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {message && (
                <div className="auth-message auth-error" role="alert">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <span>→</span>}
              </button>
            </form>

            <div className="auth-form-bottom">
              Don't have an account?{" "}
              <Link href="/signup">Create an account</Link>
            </div>

            <div className="auth-security-note">
              <span>✦</span>
              A place to connect, worship, and grow together.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}