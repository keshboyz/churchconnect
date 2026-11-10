"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/client";

type Opportunity = {
  id: string;
  title: string;
  description: string;
  category: string;
  organization: string | null;
  location: string | null;
  application_url: string | null;
  deadline: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function AdminOpportunitiesPage() {
  const supabase = createClient();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<
    Opportunity[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  useEffect(() => {
    filterOpportunities();
  }, [opportunities, search, statusFilter, categoryFilter]);

  async function checkAdminAndLoad() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: adminRecord, error: adminError } = await supabase
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (adminError || !adminRecord) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);

    const { data, error: opportunitiesError } = await supabase
      .from("opportunities")
      .select(
        "id, title, description, category, organization, location, application_url, deadline, status, created_at"
      )
      .order("created_at", { ascending: false });

    if (opportunitiesError) {
      console.error(opportunitiesError);
      setError(opportunitiesError.message);
    } else {
      setOpportunities((data || []) as Opportunity[]);
    }

    setLoading(false);
  }

  function filterOpportunities() {
    const searchText = search.toLowerCase().trim();

    const filtered = opportunities.filter((opportunity) => {
      const matchesSearch =
        !searchText ||
        opportunity.title.toLowerCase().includes(searchText) ||
        opportunity.description.toLowerCase().includes(searchText) ||
        opportunity.category.toLowerCase().includes(searchText) ||
        (opportunity.organization || "")
          .toLowerCase()
          .includes(searchText) ||
        (opportunity.location || "").toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" || opportunity.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        opportunity.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    setFilteredOpportunities(filtered);
  }

  async function updateStatus(
    id: string,
    status: "pending" | "approved" | "rejected"
  ) {
    setUpdatingId(id);
    setMessage("");
    setError("");

    const { error: updateError } = await supabase
      .from("opportunities")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      console.error(updateError);
      setError(updateError.message);
    } else {
      setOpportunities((current) =>
        current.map((opportunity) =>
          opportunity.id === id ? { ...opportunity, status } : opportunity
        )
      );

      setMessage(`Opportunity marked as ${status}.`);
    }

    setUpdatingId(null);
  }

  async function deleteOpportunity(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this opportunity?"
    );

    if (!confirmed) return;

    setUpdatingId(id);
    setMessage("");
    setError("");

    const { error: deleteError } = await supabase
      .from("opportunities")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error(deleteError);
      setError(deleteError.message);
    } else {
      setOpportunities((current) =>
        current.filter((opportunity) => opportunity.id !== id)
      );

      setMessage("Opportunity deleted successfully.");
    }

    setUpdatingId(null);
  }

  function formatDate(date: string | null) {
    if (!date) return "No deadline";

    return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatCreatedDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const categories = Array.from(
    new Set(opportunities.map((opportunity) => opportunity.category))
  );

  const pendingCount = opportunities.filter(
    (opportunity) => opportunity.status === "pending"
  ).length;

  const approvedCount = opportunities.filter(
    (opportunity) => opportunity.status === "approved"
  ).length;

  const rejectedCount = opportunities.filter(
    (opportunity) => opportunity.status === "rejected"
  ).length;

  if (loading) {
    return (
      <main className="admin-opportunities-page">
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading opportunities...</p>
        </div>

        <style jsx>{`
          .admin-opportunities-page {
            min-height: calc(100vh - 76px);
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f9ff;
          }

          .loading-state {
            color: #64748b;
            text-align: center;
          }

          .loader {
            width: 36px;
            height: 36px;
            margin: 0 auto 14px;
            border: 4px solid #dbeafe;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="admin-opportunities-page">
        <div className="access-denied">
          <div className="access-icon">🔒</div>
          <h1>Access denied</h1>
          <p>You do not have permission to manage opportunities.</p>
          <Link href="/dashboard" className="back-button">
            Return to Dashboard
          </Link>
        </div>

        <style jsx>{`
          .admin-opportunities-page {
            min-height: calc(100vh - 76px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px;
            background: #f5f9ff;
          }

          .access-denied {
            max-width: 450px;
            padding: 45px 30px;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            background: #ffffff;
            text-align: center;
          }

          .access-icon {
            font-size: 42px;
            margin-bottom: 15px;
          }

          .access-denied h1 {
            margin: 0 0 10px;
            color: #173f91;
          }

          .access-denied p {
            margin: 0 0 24px;
            color: #64748b;
          }

          .back-button {
            display: inline-block;
            padding: 11px 18px;
            border-radius: 10px;
            background: #2563eb;
            color: #ffffff;
            font-size: 14px;
            font-weight: 700;
            text-decoration: none;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="admin-opportunities-page">
      <div className="admin-container">
        <div className="page-header">
          <div>
            <Link href="/admin" className="back-link">
              ← Admin Dashboard
            </Link>

            <div className="eyebrow">CONTENT MANAGEMENT</div>

            <h1>Manage Opportunities</h1>

            <p>
              Review, approve, reject, and manage opportunities submitted by
              church members.
            </p>
          </div>

          <Link href="/opportunities/submit" className="view-public-button">
            + Add Opportunity
          </Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">💼</div>
            <div>
              <span className="stat-label">Total</span>
              <strong>{opportunities.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>
            <div>
              <span className="stat-label">Pending</span>
              <strong>{pendingCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon approved">✓</div>
            <div>
              <span className="stat-label">Approved</span>
              <strong>{approvedCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rejected">✕</div>
            <div>
              <span className="stat-label">Rejected</span>
              <strong>{rejectedCount}</strong>
            </div>
          </div>
        </div>

        {message && <div className="alert success-alert">{message}</div>}

        {error && <div className="alert error-alert">{error}</div>}

        <section className="management-card">
          <div className="management-header">
            <div>
              <h2>Opportunity submissions</h2>
              <p>
                {filteredOpportunities.length} result
                {filteredOpportunities.length === 1 ? "" : "s"} displayed
              </p>
            </div>
          </div>

          <div className="filters">
            <div className="search-wrapper">
              <span>🔎</span>

              <input
                type="text"
                placeholder="Search by title, organization, category..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">All categories</option>

              {categories.map((category) => (
                <option value={category} key={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {filteredOpportunities.length === 0 ? (
            <div className="empty-state">
              <div>💼</div>
              <h3>No opportunities found</h3>
              <p>Try changing your filters or search terms.</p>
            </div>
          ) : (
            <div className="opportunity-list">
              {filteredOpportunities.map((opportunity) => (
                <article className="admin-opportunity-card" key={opportunity.id}>
                  <div className="opportunity-main">
                    <div className="opportunity-card-header">
                      <div>
                        <span className="category-badge">
                          {opportunity.category}
                        </span>

                        <h3>{opportunity.title}</h3>
                      </div>

                      <span
                        className={`status-badge ${opportunity.status}`}
                      >
                        {opportunity.status}
                      </span>
                    </div>

                    <div className="meta-row">
                      {opportunity.organization && (
                        <span>🏢 {opportunity.organization}</span>
                      )}

                      {opportunity.location && (
                        <span>📍 {opportunity.location}</span>
                      )}

                      <span>
                        📅 Submitted{" "}
                        {formatCreatedDate(opportunity.created_at)}
                      </span>

                      {opportunity.deadline && (
                        <span>
                          ⏰ Deadline {formatDate(opportunity.deadline)}
                        </span>
                      )}
                    </div>

                    <p className="description">{opportunity.description}</p>

                    {opportunity.application_url && (
                      <a
                        href={opportunity.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="application-link"
                      >
                        View application link →
                      </a>
                    )}
                  </div>

                  <div className="opportunity-actions">
                    <button
                      className="approve-button"
                      disabled={
                        updatingId === opportunity.id ||
                        opportunity.status === "approved"
                      }
                      onClick={() =>
                        updateStatus(opportunity.id, "approved")
                      }
                    >
                      ✓ Approve
                    </button>

                    <button
                      className="pending-button"
                      disabled={
                        updatingId === opportunity.id ||
                        opportunity.status === "pending"
                      }
                      onClick={() =>
                        updateStatus(opportunity.id, "pending")
                      }
                    >
                      ⏳ Pending
                    </button>

                    <button
                      className="reject-button"
                      disabled={
                        updatingId === opportunity.id ||
                        opportunity.status === "rejected"
                      }
                      onClick={() =>
                        updateStatus(opportunity.id, "rejected")
                      }
                    >
                      ✕ Reject
                    </button>

                    <button
                      className="delete-button"
                      disabled={updatingId === opportunity.id}
                      onClick={() => deleteOpportunity(opportunity.id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .admin-opportunities-page {
          min-height: calc(100vh - 76px);
          padding: 42px 20px 80px;
          background: #f5f9ff;
        }

        .admin-container {
          width: 100%;
          max-width: 1250px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 30px;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 18px;
          color: #2563eb;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
        }

        .eyebrow {
          margin-bottom: 9px;
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .page-header h1 {
          margin: 0 0 10px;
          color: #173f91;
          font-size: 38px;
          line-height: 1.15;
        }

        .page-header p {
          max-width: 650px;
          margin: 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.6;
        }

        .view-public-button {
          flex-shrink: 0;
          padding: 12px 18px;
          border-radius: 10px;
          background: #2563eb;
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
        }

        .view-public-button:hover {
          background: #1d4ed8;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 25px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 8px 25px rgba(30, 64, 175, 0.04);
        }

        .stat-icon {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          font-size: 20px;
          font-weight: 800;
        }

        .stat-icon.total {
          background: #eaf2ff;
        }

        .stat-icon.pending {
          background: #fff7ed;
        }

        .stat-icon.approved {
          background: #ecfdf5;
          color: #15803d;
        }

        .stat-icon.rejected {
          background: #fff1f2;
          color: #be123c;
        }

        .stat-label {
          display: block;
          margin-bottom: 4px;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .stat-card strong {
          color: #173f91;
          font-size: 25px;
        }

        .alert {
          margin-bottom: 20px;
          padding: 14px 17px;
          border-radius: 12px;
          font-size: 14px;
        }

        .success-alert {
          border: 1px solid #bbf7d0;
          background: #ecfdf5;
          color: #166534;
        }

        .error-alert {
          border: 1px solid #fecdd3;
          background: #fff1f2;
          color: #be123c;
        }

        .management-card {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(30, 64, 175, 0.05);
        }

        .management-header {
          padding: 25px 28px 20px;
          border-bottom: 1px solid #eef2f7;
        }

        .management-header h2 {
          margin: 0 0 5px;
          color: #173f91;
          font-size: 21px;
        }

        .management-header p {
          margin: 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .filters {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 180px 180px;
          gap: 12px;
          padding: 20px 28px;
          background: #f8fafc;
          border-bottom: 1px solid #eef2f7;
        }

        .search-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 13px;
          border: 1px solid #d6deea;
          border-radius: 10px;
          background: #ffffff;
        }

        .search-wrapper input {
          width: 100%;
          min-width: 0;
          padding: 12px 0;
          border: none;
          outline: none;
          background: transparent;
          color: #1e293b;
          font-family: inherit;
          font-size: 13px;
        }

        .filters select {
          width: 100%;
          padding: 12px;
          border: 1px solid #d6deea;
          border-radius: 10px;
          background: #ffffff;
          color: #475569;
          outline: none;
          font-family: inherit;
          font-size: 13px;
        }

        .opportunity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 24px 28px 30px;
        }

        .admin-opportunity-card {
          display: flex;
          justify-content: space-between;
          gap: 25px;
          padding: 22px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #ffffff;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .admin-opportunity-card:hover {
          border-color: #bfdbfe;
          box-shadow: 0 8px 20px rgba(30, 64, 175, 0.05);
        }

        .opportunity-main {
          min-width: 0;
          flex: 1;
        }

        .opportunity-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
        }

        .category-badge {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 999px;
          background: #eaf2ff;
          color: #2563eb;
          font-size: 11px;
          font-weight: 800;
        }

        .opportunity-card-header h3 {
          margin: 10px 0 0;
          color: #173f91;
          font-size: 20px;
          line-height: 1.35;
        }

        .status-badge {
          flex-shrink: 0;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .status-badge.pending {
          background: #fff7ed;
          color: #c2410c;
        }

        .status-badge.approved {
          background: #ecfdf5;
          color: #15803d;
        }

        .status-badge.rejected {
          background: #fff1f2;
          color: #be123c;
        }

        .meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 18px;
          margin-top: 14px;
          color: #64748b;
          font-size: 12px;
        }

        .description {
          display: -webkit-box;
          overflow: hidden;
          max-width: 850px;
          margin: 16px 0 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.65;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }

        .application-link {
          display: inline-block;
          margin-top: 14px;
          color: #2563eb;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }

        .opportunity-actions {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          width: 125px;
          flex-shrink: 0;
        }

        .opportunity-actions button {
          width: 100%;
          padding: 9px 10px;
          border-radius: 9px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .opportunity-actions button:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        .approve-button {
          border: 1px solid #bbf7d0;
          background: #ecfdf5;
          color: #15803d;
        }

        .pending-button {
          border: 1px solid #fed7aa;
          background: #fff7ed;
          color: #c2410c;
        }

        .reject-button {
          border: 1px solid #fecdd3;
          background: #fff1f2;
          color: #be123c;
        }

        .delete-button {
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #64748b;
        }

        .delete-button:hover {
          border-color: #fda4af;
          background: #fff1f2;
          color: #be123c;
        }

        .empty-state {
          padding: 70px 20px;
          text-align: center;
        }

        .empty-state > div {
          font-size: 42px;
          margin-bottom: 12px;
        }

        .empty-state h3 {
          margin: 0 0 8px;
          color: #173f91;
          font-size: 20px;
        }

        .empty-state p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        @media (max-width: 950px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .filters {
            grid-template-columns: 1fr 1fr;
          }

          .search-wrapper {
            grid-column: 1 / -1;
          }

          .admin-opportunity-card {
            flex-direction: column;
          }

          .opportunity-actions {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            width: 100%;
          }
        }

        @media (max-width: 650px) {
          .admin-opportunities-page {
            padding: 30px 14px 60px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .page-header h1 {
            font-size: 30px;
          }

          .view-public-button {
            width: 100%;
            box-sizing: border-box;
            text-align: center;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .stat-card {
            padding: 15px;
          }

          .stat-icon {
            width: 38px;
            height: 38px;
            font-size: 17px;
          }

          .stat-card strong {
            font-size: 22px;
          }

          .management-header,
          .filters,
          .opportunity-list {
            padding-left: 16px;
            padding-right: 16px;
          }

          .filters {
            grid-template-columns: 1fr;
          }

          .search-wrapper {
            grid-column: auto;
          }

          .opportunity-card-header {
            flex-direction: column;
          }

          .opportunity-actions {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </main>
  );
}