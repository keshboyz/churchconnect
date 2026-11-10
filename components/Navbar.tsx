
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "../lib/supabase/client";

export default function Navbar() {
  const [supabase] = useState(() => createClient());

  const [user, setUser] = useState<User | null>(null);
  const [profileName, setProfileName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAccountDetails(currentUser: User | null) {
      if (!currentUser) {
        if (active) {
          setProfileName("");
          setIsAdmin(false);
        }
        return;
      }

      const [profileResult, adminResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", currentUser.id)
          .maybeSingle(),

        supabase
          .from("admins")
          .select("id")
          .eq("id", currentUser.id)
          .maybeSingle(),
      ]);

      if (!active) return;

      setProfileName(
        profileResult.data?.full_name ||
          currentUser.email ||
          "Dashboard"
      );

      setIsAdmin(Boolean(adminResult.data));
    }

    async function loadUser() {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !currentUser) {
        setUser(null);
        setProfileName("");
        setIsAdmin(false);
        return;
      }

      setUser(currentUser);
      await loadAccountDetails(currentUser);
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;

      if (!active) return;

      setUser(currentUser);
      setMenuOpen(false);

      if (!currentUser) {
        setProfileName("");
        setIsAdmin(false);
        return;
      }

      setProfileName(currentUser.email || "Dashboard");

      // Run account queries after the auth callback has completed.
      queueMicrotask(() => {
        if (active) {
          void loadAccountDetails(currentUser);
        }
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    setMenuOpen(false);
    window.location.href = "/";
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link
          href="/"
          className="navbar-logo"
          onClick={closeMenu}
          aria-label="ChurchConnect home"
        >
          <span>Church</span>
          <span>Connect</span>
        </Link>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div
          id="main-navigation"
          className={`navbar-content ${menuOpen ? "show-menu" : ""}`}
        >
          <div className="navbar-links">
            <Link href="/" onClick={closeMenu}>Home</Link>
            <Link href="/about" onClick={closeMenu}>About</Link>
            <Link href="/community" onClick={closeMenu}>Community</Link>
            <Link href="/events" onClick={closeMenu}>Events</Link>
            <Link href="/opportunities" onClick={closeMenu}>Opportunities</Link>
            <Link href="/songs" onClick={closeMenu}>Songs</Link>
            <Link href="/videos" onClick={closeMenu}>Videos</Link>
          </div>

          <div className="navbar-actions">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="navbar-user"
                  onClick={closeMenu}
                >
                  {profileName || "Dashboard"}
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="admin-navbar-link"
                    onClick={closeMenu}
                  >
                    Admin
                  </Link>
                )}

                <button
                  type="button"
                  className="navbar-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="navbar-login"
                  onClick={closeMenu}
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  className="navbar-join-button"
                  onClick={closeMenu}
                >
                  Join us
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
