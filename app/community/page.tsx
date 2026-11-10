"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

type Member = {
  id: string;
  full_name: string | null;
  ministry: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export default function Community() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [ministryFilter, setMinistryFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadMembers() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      const { data: viewerProfile, error: viewerError } = await supabase
        .from("profiles")
        .select("member_status")
        .eq("id", user.id)
        .single();

      if (viewerError) {
        console.error("Viewer profile error:", viewerError);
        setMessage("Unable to verify your membership status.");
        setLoading(false);
        return;
      }

      if (viewerProfile?.member_status !== "approved") {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, ministry, bio, avatar_url")
        .eq("member_status", "approved")
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Members error:", error);
        setMessage("Unable to load community members.");
      } else {
        setMembers(data || []);
        setFilteredMembers(data || []);
      }

      setLoading(false);
    }

    loadMembers();
  }, []);

  useEffect(() => {
    const searchTerm = search.toLowerCase().trim();

    const filtered = members.filter((member) => {
      const name = member.full_name?.toLowerCase() || "";
      const ministry = member.ministry?.toLowerCase() || "";
      const bio = member.bio?.toLowerCase() || "";

      const matchesSearch =
        name.includes(searchTerm) ||
        ministry.includes(searchTerm) ||
        bio.includes(searchTerm);

      const matchesMinistry =
        ministryFilter === "All" || member.ministry === ministryFilter;

      return matchesSearch && matchesMinistry;
    });

    setFilteredMembers(filtered);
  }, [search, ministryFilter, members]);

  const ministries = Array.from(
    new Set(
      members
        .map((member) => member.ministry)
        .filter((ministry): ministry is string => Boolean(ministry))
    )
  ).sort();

  if (loading) {
    return (
      <main className="community-page">
        <div className="directory-container">
          <div className="directory-loading">
            <div className="directory-spinner" />
            <p>Bringing our community together...</p>
          </div>
        </div>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="community-page">
        <div className="directory-container">
          <section className="directory-notice">
            <span className="directory-kicker">CHURCHCONNECT COMMUNITY</span>
            <div className="directory-notice-icon">✦</div>
            <h1>Your community is waiting.</h1>
            <p>
              The member directory is available to approved church members.
              Once your membership is approved, you can connect with the
              rest of the community here.
            </p>
            <Link href="/dashboard" className="directory-primary-button">
              Return to dashboard <span>→</span>
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="community-page">
      <div className="directory-container">
        <section className="directory-hero">
          <div className="directory-hero-copy">
            <span className="directory-kicker">
              CHURCHCONNECT / OUR PEOPLE
            </span>
            <h1>
              Better together.
              <br />
              <span>Stronger in faith.</span>
            </h1>
            <p>
              Get to know the people who make our church a family.
              Discover ministries, make connections, and grow together.
            </p>
            <a href="#member-directory" className="directory-hero-link">
              Explore our community <span>↓</span>
            </a>
          </div>

          <div className="directory-hero-decoration" aria-hidden="true">
            <div className="directory-decoration-circle">
              <span>✦</span>
            </div>
            <div className="directory-decoration-caption">
              <strong>One family.</strong>
              <span>Many stories. One faith.</span>
            </div>
          </div>
        </section>

        <section className="directory-intro" id="member-directory">
          <div>
            <span className="directory-kicker">MEET THE FAMILY</span>
            <h2>Our community</h2>
            <p>
              Every person has a story, a gift, and a place in our community.
            </p>
          </div>

          <div className="directory-member-count">
            <strong>{members.length}</strong>
            <span>
              {members.length === 1 ? "Approved member" : "Approved members"}
            </span>
          </div>
        </section>

        <section className="directory-toolbar">
          <div className="directory-search">
            <label htmlFor="community-search">Find someone</label>
            <div className="directory-input-wrap">
              <span aria-hidden="true">⌕</span>
              <input
                id="community-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ministry, or keyword..."
              />
            </div>
          </div>

          <div className="directory-filter">
            <label htmlFor="community-ministry">Browse by ministry</label>
            <select
              id="community-ministry"
              value={ministryFilter}
              onChange={(e) => setMinistryFilter(e.target.value)}
            >
              <option value="All">All Ministries</option>
              {ministries.map((ministry) => (
                <option key={ministry} value={ministry}>
                  {ministry}
                </option>
              ))}
            </select>
          </div>
        </section>

        <div className="directory-results-heading">
          <span>
            {filteredMembers.length}{" "}
            {filteredMembers.length === 1 ? "person" : "people"} found
          </span>

          {(search || ministryFilter !== "All") && (
            <button
              type="button"
              className="directory-clear-button"
              onClick={() => {
                setSearch("");
                setMinistryFilter("All");
              }}
            >
              Clear filters ×
            </button>
          )}
        </div>

        {message && (
          <div className="directory-error" role="alert">
            {message}
          </div>
        )}

        {filteredMembers.length === 0 ? (
          <section className="directory-empty">
            <div className="directory-empty-icon">⌕</div>
            <h2>No members found</h2>
            <p>
              Try another name or ministry, or clear your filters to see
              everyone.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setMinistryFilter("All");
              }}
            >
              Show all members
            </button>
          </section>
        ) : (
          <section className="directory-grid">
            {filteredMembers.map((member) => (
              <Link
                href={`/community/member/${member.id}`}
                className="directory-card"
                key={member.id}
              >
                <div className="directory-card-top">
                  <span className="directory-card-mark">✦</span>
                  <span className="directory-card-label">COMMUNITY MEMBER</span>
                </div>

                <div className="directory-avatar-wrap">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={`${member.full_name || "Member"} profile`}
                      className="directory-avatar"
                    />
                  ) : (
                    <div className="directory-avatar-placeholder">
                      {(member.full_name || "M").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="directory-card-details">
                  <h3>{member.full_name || "Unnamed Member"}</h3>
                  <span className="directory-ministry">
                    {member.ministry || "Church Member"}
                  </span>
                  <p>
                    {member.bio || "A member of our ChurchConnect family."}
                  </p>
                </div>

                <div className="directory-card-footer">
                  <span>View profile</span>
                  <span className="directory-card-arrow">↗</span>
                </div>
              </Link>
            ))}
          </section>
        )}

        <div className="directory-back">
          <Link href="/dashboard">← Back to dashboard</Link>
        </div>
      </div>
    </main>
  );
}