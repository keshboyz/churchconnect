"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

type Opportunity = {
  id: string;
  title: string;
  description: string;
  category: string;
  organization: string | null;
  location: string | null;
  application_url: string | null;
  deadline: string | null;
  status: string;
  created_at: string;
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadPage() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      const { data, error } = await supabase
        .from("opportunities")
        .select(
          "id, title, description, category, organization, location, application_url, deadline, status, created_at"
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading opportunities:", error);
        setErrorMessage("Unable to load opportunities at the moment.");
      } else {
        setOpportunities(data || []);
      }

      setLoading(false);
    }

    loadPage();
  }, []);

  function formatDate(date: string | null) {
    if (!date) return "No deadline";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function isDeadlinePassed(date: string | null) {
    if (!date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return new Date(`${date}T00:00:00`) < today;
  }

  const categories = [
    "All",
    ...Array.from(new Set(opportunities.map((item) => item.category))).sort(),
  ];

  const searchText = search.toLowerCase().trim();

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesSearch =
      !searchText ||
      opportunity.title.toLowerCase().includes(searchText) ||
      opportunity.description.toLowerCase().includes(searchText) ||
      opportunity.category.toLowerCase().includes(searchText) ||
      (opportunity.organization || "").toLowerCase().includes(searchText) ||
      (opportunity.location || "").toLowerCase().includes(searchText);

    const matchesCategory =
      category === "All" || opportunity.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="opportunities-page">
      <div className="opp-container">
        <section className="opp-hero">
          <div className="opp-hero-decoration opp-decoration-one" />
          <div className="opp-hero-decoration opp-decoration-two" />

          <div className="opp-hero-content">
            <span className="opp-eyebrow">
              <span className="opp-eyebrow-dot" />
              GROW • DISCOVER • ACHIEVE
            </span>

            <h1>
              Opportunities
              <br />
              <span>for your next step.</span>
            </h1>

            <p>
              Discover jobs, internships, scholarships, training programs,
              and ways to serve. Find opportunities that help you grow and
              make a difference.
            </p>

            <div className="opp-hero-actions">
              <a href="#opportunity-list" className="opp-primary-action">
                Explore opportunities <span>↓</span>
              </a>

              {user && (
                <Link
                  href="/opportunities/submit"
                  className="opp-secondary-action"
                >
                  + Share an opportunity
                </Link>
              )}
            </div>
          </div>

          <div className="opp-hero-art" aria-hidden="true">
            <div className="opp-art-ring opp-art-ring-one" />
            <div className="opp-art-ring opp-art-ring-two" />
            <div className="opp-art-center">
              <span>✦</span>
            </div>
            <div className="opp-art-caption">
              <strong>Discover your potential.</strong>
              <span>Take your next step with confidence.</span>
            </div>
          </div>

          <div className="opp-hero-bottom">
            <span>JOBS</span>
            <span>INTERNSHIPS</span>
            <span>SCHOLARSHIPS</span>
            <span>VOLUNTEERING</span>
          </div>
        </section>

        <section className="opp-intro-row">
          <div>
            <span className="opp-section-label">YOUR NEXT OPPORTUNITY</span>
            <h2>Find something worth pursuing.</h2>
          </div>

          <p>
            Explore opportunities shared with our church community. Use the
            search and categories to find what interests you.
          </p>
        </section>

        <section className="opp-filter-panel">
          <div className="opp-search-wrap">
            <span className="opp-search-icon" aria-hidden="true">
              ⌕
            </span>

            <input
              type="search"
              aria-label="Search opportunities"
              placeholder="Search by title, organization, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                className="opp-clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="opp-filter-divider" />

          <div className="opp-category-area">
            <span className="opp-filter-label">FILTER BY CATEGORY</span>

            <div className="opp-category-list">
              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`opp-category-button ${
                    category === item ? "selected" : ""
                  }`}
                  aria-pressed={category === item}
                >
                  {item === "All" ? "All opportunities" : item}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="opportunity-list" className="opp-list-section">
          <div className="opp-results-heading">
            <div>
              <span className="opp-section-label">EXPLORE THE LISTINGS</span>
              <h2>Available opportunities</h2>
            </div>

            {!loading && !errorMessage && (
              <span className="opp-results-count">
                {filteredOpportunities.length}{" "}
                {filteredOpportunities.length === 1 ? "listing" : "listings"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="opp-state-card">
              <div className="opp-loader" />
              <h3>Finding opportunities</h3>
              <p>Please wait while we load the latest listings.</p>
            </div>
          ) : errorMessage ? (
            <div className="opp-state-card">
              <div className="opp-empty-symbol">!</div>
              <h3>Something went wrong</h3>
              <p>{errorMessage}</p>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="opp-state-card">
              <div className="opp-empty-symbol">✦</div>
              <h3>No opportunities found</h3>
              <p>
                {search || category !== "All"
                  ? "Try a different search term or select another category."
                  : "There are currently no approved opportunities. Please check again later."}
              </p>

              {(search || category !== "All") && (
                <button
                  type="button"
                  className="opp-reset-button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                >
                  Clear filters
                </button>
              )}

              {user && (
                <Link
                  href="/opportunities/submit"
                  className="opp-empty-submit"
                >
                  Share an opportunity
                </Link>
              )}
            </div>
          ) : (
            <div className="opp-grid">
              {filteredOpportunities.map((opportunity) => {
                const expired = isDeadlinePassed(opportunity.deadline);

                return (
                  <article className="opp-card" key={opportunity.id}>
                    <div className="opp-card-top">
                      <span className="opp-card-category">
                        {opportunity.category}
                      </span>

                      <span
                        className={`opp-status ${
                          expired
                            ? "opp-status-expired"
                            : "opp-status-open"
                        }`}
                      >
                        <span />
                        {expired ? "Closed" : "Open"}
                      </span>
                    </div>

                    <div className="opp-card-main">
                      <h3>{opportunity.title}</h3>

                      {opportunity.organization && (
                        <p className="opp-organization">
                          <span aria-hidden="true">▦</span>
                          {opportunity.organization}
                        </p>
                      )}

                      <p className="opp-description">
                        {opportunity.description}
                      </p>
                    </div>

                    <div className="opp-card-details">
                      {opportunity.location && (
                        <div className="opp-detail-row">
                          <span className="opp-detail-icon">⌖</span>
                          <span>{opportunity.location}</span>
                        </div>
                      )}

                      <div className="opp-detail-row">
                        <span className="opp-detail-icon">◷</span>
                        <span>
                          {opportunity.deadline
                            ? `Deadline: ${formatDate(opportunity.deadline)}`
                            : "No deadline specified"}
                        </span>
                      </div>
                    </div>

                    <div className="opp-card-footer">
                      {opportunity.application_url && !expired ? (
                        <a
                          href={opportunity.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opp-apply-button"
                        >
                          View opportunity <span>↗</span>
                        </a>
                      ) : expired ? (
                        <span className="opp-closed-button">
                          Applications closed
                        </span>
                      ) : (
                        <span className="opp-no-link">
                          Contact details not provided
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {user && (
          <section className="opp-bottom-cta">
            <div>
              <span className="opp-section-label">HELP SOMEONE GROW</span>
              <h2>Know of a great opportunity?</h2>
              <p>
                Share it with the church community. Your discovery could be
                someone else's next big step.
              </p>
            </div>

            <Link href="/opportunities/submit" className="opp-cta-button">
              Submit an opportunity <span>→</span>
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}