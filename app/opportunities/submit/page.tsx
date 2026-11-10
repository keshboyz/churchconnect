"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/client";

export default function SubmitOpportunityPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    organization: "",
    location: "",
    application_url: "",
    deadline: "",
  });

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setLoading(false);
    }

    checkUser();
  }, [router]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Please enter an opportunity title.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please provide a description.");
      return;
    }

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Your session has expired. Please log in again.");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("opportunities")
      .insert({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        organization: form.organization.trim() || null,
        location: form.location.trim() || null,
        application_url: form.application_url.trim() || null,
        deadline: form.deadline || null,
        created_by: user.id,
        status: "pending",
      });

    if (insertError) {
      console.error("Opportunity submission error:", insertError);

      setError(insertError.message);

      setSubmitting(false);
      return;
    }

    setSuccess(
      "Your opportunity has been submitted successfully. It is now waiting for admin approval."
    );

    setForm({
      title: "",
      description: "",
      category: "",
      organization: "",
      location: "",
      application_url: "",
      deadline: "",
    });

    setSubmitting(false);
  }

  if (loading) {
    return (
      <main className="submit-page">
        <div className="loading-box">
          <div className="loader"></div>
          <p>Loading...</p>
        </div>

        <style jsx>{`
          .submit-page {
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
            width: 34px;
            height: 34px;
            margin: 0 auto 12px;
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
    <main className="submit-page">
      <div className="submit-container">
        <Link href="/opportunities" className="back-link">
          ← Back to Opportunities
        </Link>

        <div className="header">
          <div className="icon">💼</div>

          <div>
            <h1>Submit an Opportunity</h1>

            <p>
              Share a job, internship, scholarship, training, volunteer
              position, or other useful opportunity with the church community.
            </p>
          </div>
        </div>

        <div className="notice">
          <strong>How it works</strong>

          <p>
            Your opportunity will be reviewed by an administrator before it
            becomes visible to the church community.
          </p>
        </div>

        {error && (
          <div className="message error">
            <strong>Submission failed</strong>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="message success">
            <strong>Submission successful!</strong>
            <p>{success}</p>

            <Link href="/opportunities">
              Return to Opportunities →
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <section>
            <div className="section-title">
              <span>1</span>

              <div>
                <h2>Opportunity details</h2>
                <p>Provide the main information about the opportunity.</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="title">
                Opportunity title <span>*</span>
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. GIS Intern"
                required
              />
            </div>

            <div className="two-columns">
              <div className="form-group">
                <label htmlFor="category">
                  Category <span>*</span>
                </label>

                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Job">Job</option>
                  <option value="Internship">Internship</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Scholarship">Scholarship</option>
                  <option value="Training">Training</option>
                  <option value="Fellowship">Fellowship</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="organization">Organization</label>

                <input
                  id="organization"
                  name="organization"
                  type="text"
                  value={form.organization}
                  onChange={handleChange}
                  placeholder="e.g. Grimora Tech Hub"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description <span>*</span>
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the opportunity, requirements, qualifications, responsibilities, and other important information."
                rows={7}
                required
              />
            </div>
          </section>

          <section>
            <div className="section-title">
              <span>2</span>

              <div>
                <h2>Application information</h2>
                <p>Tell members where and when they can apply.</p>
              </div>
            </div>

            <div className="two-columns">
              <div className="form-group">
                <label htmlFor="location">Location</label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Nairobi / Remote / Hybrid"
                />
              </div>

              <div className="form-group">
                <label htmlFor="deadline">Application deadline</label>

                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="application_url">
                Application link
              </label>

              <input
                id="application_url"
                name="application_url"
                type="url"
                value={form.application_url}
                onChange={handleChange}
                placeholder="https://example.com/apply"
              />

              <small>
                Add the website or application form where members can apply.
              </small>
            </div>
          </section>

          <div className="actions">
            <Link href="/opportunities" className="cancel">
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="submit"
            >
              {submitting ? "Submitting..." : "Submit Opportunity"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .submit-page {
          min-height: calc(100vh - 76px);
          background: #f5f9ff;
          padding: 45px 20px 80px;
        }

        .submit-container {
          width: 100%;
          max-width: 900px;
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

        .header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 25px;
        }

        .icon {
          width: 58px;
          height: 58px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: #e8f1ff;
          font-size: 28px;
        }

        h1 {
          margin: 0 0 8px;
          color: #173f91;
          font-size: 34px;
        }

        .header p {
          margin: 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.6;
        }

        .notice {
          margin-bottom: 22px;
          padding: 18px 20px;
          border: 1px solid #cfe2ff;
          border-radius: 14px;
          background: #eef6ff;
        }

        .notice strong {
          color: #174ea6;
        }

        .notice p {
          margin: 6px 0 0;
          color: #53657d;
          font-size: 14px;
          line-height: 1.6;
        }

        .message {
          margin-bottom: 22px;
          padding: 16px 18px;
          border-radius: 14px;
          font-size: 14px;
        }

        .message p {
          margin: 5px 0 0;
          line-height: 1.5;
        }

        .message a {
          display: inline-block;
          margin-top: 10px;
          color: inherit;
          font-weight: 700;
          text-decoration: none;
        }

        .error {
          border: 1px solid #fecdd3;
          background: #fff1f2;
          color: #be123c;
        }

        .success {
          border: 1px solid #bbf7d0;
          background: #ecfdf5;
          color: #166534;
        }

        .form {
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(30, 64, 175, 0.06);
        }

        section {
          padding: 30px;
          border-bottom: 1px solid #e5e7eb;
        }

        .section-title {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 25px;
        }

        .section-title > span {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #2563eb;
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
        }

        .section-title h2 {
          margin: 0 0 4px;
          color: #173f91;
          font-size: 20px;
        }

        .section-title p {
          margin: 0;
          color: #718096;
          font-size: 13px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .two-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          color: #334155;
          font-size: 14px;
          font-weight: 700;
        }

        label span {
          color: #dc2626;
        }

        input,
        textarea,
        select {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border: 1px solid #d6deea;
          border-radius: 10px;
          background: #ffffff;
          color: #1e293b;
          outline: none;
          font-family: inherit;
          font-size: 14px;
        }

        input:focus,
        textarea:focus,
        select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        textarea {
          min-height: 150px;
          resize: vertical;
        }

        small {
          display: block;
          margin-top: 7px;
          color: #94a3b8;
          font-size: 12px;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 22px 30px;
          background: #f8fafc;
        }

        .cancel,
        .submit {
          padding: 11px 20px;
          border-radius: 10px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
        }

        .cancel {
          border: 1px solid #d6deea;
          background: #ffffff;
          color: #475569;
        }

        .submit {
          border: 1px solid #2563eb;
          background: #2563eb;
          color: #ffffff;
        }

        .submit:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        @media (max-width: 650px) {
          .submit-page {
            padding: 30px 14px 60px;
          }

          h1 {
            font-size: 28px;
          }

          section {
            padding: 22px 18px;
          }

          .two-columns {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .actions {
            flex-direction: column-reverse;
            padding: 18px;
          }

          .cancel,
          .submit {
            width: 100%;
            box-sizing: border-box;
            text-align: center;
          }
        }
      `}</style>
    </main>
  );
}