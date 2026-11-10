"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Your account has been created successfully! Check your email if confirmation is required."
    );

    setSuccess(true);
    setLoading(false);
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        <section className="auth-visual signup-visual">
          <div className="auth-visual-overlay" />

          <div className="auth-visual-content">
            <span className="auth-eyebrow">BECOME PART OF US</span>

            <h1>
              Find your place.
              <br />
              <span>Grow in faith.</span>
            </h1>

            <p>
              Join a community built on faith, love, fellowship,
              and the desire to make a difference.
            </p>

            <div className="auth-visual-footer">
              <span className="auth-visual-line" />
              <span>ONE COMMUNITY · ONE FAITH</span>
            </div>
          </div>
        </section>

        <section className="auth-form-section">
          <div className="auth-form-wrapper signup-form-wrapper">
            <div className="auth-form-heading">
              <span className="auth-small-label">CHURCHCONNECT</span>

              <h2>Create an account</h2>

              <p>
                We are glad you are here. Join our church community today.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSignup}>
              <div className="auth-field">
                <label htmlFor="name">Full Name</label>

                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>

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
                <label htmlFor="password">Password</label>

                <div className="auth-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
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

              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm Password</label>

                <div className="auth-password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                    title={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
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
                <div
                  className={`auth-message ${
                    success ? "auth-success" : "auth-error"
                  }`}
                  role="status"
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading || success}
              >
                {loading
                  ? "Creating account..."
                  : success
                    ? "Account Created"
                    : "Create Account"}
                {!loading && !success && <span>→</span>}
              </button>
            </form>

            <div className="auth-form-bottom">
              Already have an account?{" "}
              <Link href="/login">Sign in</Link>
            </div>

            <div className="auth-security-note">
              <span>✦</span>
              We look forward to welcoming you into our community.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}