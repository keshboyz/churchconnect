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

export default function MySubmissionsPage() {
  const supabase = createClient();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    setUserName(profile?.full_name || "Member");

    const { data, error: submissionsError } = await supabase
      .from("opportunities")
      .select(
        "id, title, description, category, organization, location, application_url, deadline, status, created_at"
      )
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (submissionsError) {
      console.error(submissionsError);
      setError(submissionsError.message);
    } else {
      setOpportunities((data || []) as Opportunity[]);
    }

    setLoading(false);
  }

  function formatDate(date: string | null) {
    if (!date) return "No deadline";

    return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatSubmittedDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function statusText(status: Opportunity["status"]) {
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return "Pending Review";
  }

  const pendingCount = opportunities.filter(
    (item) => item.status === "pending"
  ).length;

  const approvedCount = opportunities.filter(
    (item) => item.status === "approved"
  ).length;

  const rejectedCount = opportunities.filter(
    (item) => item.status === "rejected"
  ).length;

  if (loading) {
    return (
      <main className="submissions-page">
        <div className="loading-box">
          <div className="loader"></div>
          <p>Loading your submissions...</p>
        </div>

        <style jsx>{`
          .submissions-page {
            min-height: calc(100vh - 76px);
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f9ff;
          }

          .loading-box {
            text-align: center;
            color: #64748b;
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

  return (
    <main className="submissions-page">
      <div className="page-container">
        <Link href="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>

        <header className="page-header">
          <div>
            <div className="eyebrow">YOUR CONTRIBUTIONS</div>

            <h1>My Submissions</h1>

            <p>
              Welcome, {userName}. Track the opportunities you have submitted
              to the church community.
            </p>
          </div>

          <Link href="/opportunities/submit" className="submit-button">
            + Submit Opportunity
          </Link>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">💼</div>

            <div>
              <span>Total</span>
              <strong>{opportunities.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>

            <div>
              <span>Pending</span>
              <strong>{pendingCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon approved">✓</div>

            <div>
              <span>Approved</span>
              <strong>{approvedCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rejected">✕</div>

            <div>
              <span>Rejected</span>
              <strong>{rejectedCount}</strong>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <strong>Unable to load submissions</strong>
            <p>{error}</p>
          </div>
        )}

        {!error && opportunities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💼</div>

            <h2>You haven't submitted anything yet</h2>

            <p>
              Share a useful job, internship, scholarship, training
              opportunity, or volunteer position with the church community.
            </p>

            <Link href="/opportunities/submit" className="empty-button">
              Submit Your First Opportunity
            </Link>
          </div>
        ) : (
          <section className="submissions-section">
            <div className="section-header">
              <div>
                <h2>Your opportunity submissions</h2>
                <p>
                  Review the status of each opportunity you have submitted.
                </p>
              </div>
            </div>

            <div className="submission-list">
              {opportunities.map((opportunity) => (
                <article
                  className="submission-card"
                  key={opportunity.id}
                >
                  <div className="submission-content">
                    <div className="title-row">
                      <div>
                        <span className="category-badge">
                          {opportunity.category}
                        </span>

                        <h3>{opportunity.title}</h3>
                      </div>

                      <span
                        className={`status-badge ${opportunity.status}`}
                      >
                        {opportunity.status === "approved" && "✓ "}
                        {opportunity.status === "pending" && "⏳ "}
                        {opportunity.status === "rejected" && "✕ "}
                        {statusText(opportunity.status)}
                      </span>
                    </div>

                    {opportunity.organization && (
                      <div className="organization">
                        🏢 {opportunity.organization}
                      </div>
                    )}

                    <p className="description">
                      {opportunity.description}
                    </p>

                    <div className="details">
                      {opportunity.location && (
                        <span>📍 {opportunity.location}</span>
                      )}

                      {opportunity.deadline && (
                        <span>
                          📅 Deadline: {formatDate(opportunity.deadline)}
                        </span>
                      )}

                      <span>
                        🕐 Submitted:{" "}
                        {formatSubmittedDate(opportunity.created_at)}
                      </span>
                    </div>

                    {opportunity.status === "pending" && (
                      <div className="status-message pending-message">
                        Your opportunity is currently being reviewed by an
                        administrator.
                      </div>
                    )}

                    {opportunity.status === "approved" && (
                      <div className="status-message approved-message">
                        Your opportunity has been approved and is now visible
                        to the church community.
                      </div>
                    )}

                    {opportunity.status === "rejected" && (
                      <div className="status-message rejected-message">
                        This opportunity was not approved for publication.
                        You may contact an administrator if you need more
                        information.
                      </div>
                    )}
                  </div>

                  {opportunity.status === "approved" &&
                    opportunity.application_url && (
                      <div className="card-action">
                        <a
                          href={opportunity.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="view-button"
                        >
                          View Application →
                        </a>
                      </div>
                    )}
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      <style jsx>{`
        .submissions-page {
          min-height: calc(100vh - 76px);
          padding: 42px 20px 80px;
          background: #f5f9ff;
        }

        .page-container {
          width: 100%;
          max-width: 1150px;
          margin: 0 auto;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 22px;
          color: #2563eb;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
        }

        .page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 30px;
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
          max-width: 680px;
          margin: 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.6;
        }

        .submit-button {
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

        .submit-button:hover {
          background: #1d4ed8;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 19px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 8px 25px rgba(30, 64, 175, 0.04);
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 19px;
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

        .stat-card span {
          display: block;
          margin-bottom: 4px;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .stat-card strong {
          color: #173f91;
          font-size: 24px;
        }

        .error-message {
          margin-bottom: 22px;
          padding: 16px 18px;
          border: 1px solid #fecdd3;
          border-radius: 12px;
          background: #fff1f2;
          color: #be123c;
        }

        .error-message p {
          margin: 5px 0 0;
          font-size: 13px;
        }

        .submissions-section {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(30, 64, 175, 0.05);
        }

        .section-header {
          padding: 25px 28px;
          border-bottom: 1px solid #eef2f7;
        }

        .section-header h2 {
          margin: 0 0 5px;
          color: #173f91;
          font-size: 21px;
        }

        .section-header p {
          margin: 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .submission-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 24px 28px 30px;
        }

        .submission-card {
          display: flex;
          justify-content: space-between;
          gap: 22px;
          padding: 22px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #ffffff;
        }

        .submission-content {
          flex: 1;
          min-width: 0;
        }

        .title-row {
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

        .title-row h3 {
          margin: 9px 0 0;
          color: #173f91;
          font-size: 20px;
          line-height: 1.35;
        }

        .status-badge {
          flex-shrink: 0;
          padding: 7px 11px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
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

        .organization {
          margin-top: 11px;
          color: #475569;
          font-size: 13px;
          font-weight: 600;
        }

        .description {
          display: -webkit-box;
          overflow: hidden;
          max-width: 850px;
          margin: 14px 0 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.65;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }

        .details {
          display: flex;
          flex-wrap: wrap;
          gap: 9px 18px;
          margin-top: 15px;
          color: #64748b;
          font-size: 12px;
        }

        .status-message {
          margin-top: 16px;
          padding: 11px 13px;
          border-radius: 9px;
          font-size: 12px;
          line-height: 1.5;
        }

        .pending-message {
          background: #fff7ed;
          color: #9a3412;
        }

        .approved-message {
          background: #ecfdf5;
          color: #166534;
        }

        .rejected-message {
          background: #fff1f2;
          color: #9f1239;
        }

        .card-action {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .view-button {
          padding: 10px 14px;
          border-radius: 9px;
          background: #2563eb;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
        }

        .view-button:hover {
          background: #1d4ed8;
        }

        .empty-state {
          padding: 75px 25px;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          background: #ffffff;
          text-align: center;
          box-shadow: 0 10px 30px rgba(30, 64, 175, 0.05);
        }

        .empty-icon {
          margin-bottom: 14px;
          font-size: 44px;
        }

        .empty-state h2 {
          margin: 0 0 9px;
          color: #173f91;
          font-size: 22px;
        }

        .empty-state p {
          max-width: 570px;
          margin: 0 auto;
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
        }

        .empty-button {
          display: inline-block;
          margin-top: 20px;
          padding: 11px 18px;
          border-radius: 10px;
          background: #2563eb;
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
        }

        @media (max-width: 850px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .submission-card {
            flex-direction: column;
          }

          .card-action {
            justify-content: flex-start;
          }
        }

        @media (max-width: 650px) {
          .submissions-page {
            padding: 30px 14px 60px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .page-header h1 {
            font-size: 30px;
          }

          .submit-button {
            width: 100%;
            box-sizing: border-box;
            text-align: center;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .stat-card {
            padding: 14px;
          }

          .stat-icon {
            width: 37px;
            height: 37px;
            font-size: 16px;
          }

          .stat-card strong {
            font-size: 21px;
          }

          .section-header,
          .submission-list {
            padding-left: 16px;
            padding-right: 16px;
          }

          .title-row {
            flex-direction: column;
          }

          .status-badge {
            align-self: flex-start;
          }
        }
      `}</style>
    </main>
  );
}