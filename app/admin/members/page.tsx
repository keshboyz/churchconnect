"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import "./members.css";

type Member = {
  id: string;
  full_name: string | null;
  phone: string | null;
  ministry: string | null;
  bio: string | null;
  avatar_url: string | null;
  member_status: "pending" | "approved" | "rejected" | "suspended";
  created_at: string;
};

export default function AdminMembersPage() {
  const supabase = createClient();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    checkAdminAndLoadMembers();
  }, []);

  async function checkAdminAndLoadMembers() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: adminRecord } = await supabase
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!adminRecord) {
      window.location.href = "/dashboard";
      return;
    }

    await loadMembers();
    setLoading(false);
  }

  async function loadMembers() {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, phone, ministry, bio, avatar_url, member_status, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMembers((data as Member[]) || []);
  }

  async function updateMemberStatus(
    memberId: string,
    status: Member["member_status"]
  ) {
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ member_status: status })
      .eq("id", memberId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === memberId
          ? { ...member, member_status: status }
          : member
      )
    );

    setMessage(`Member status updated to ${status}.`);
  }

  const filteredMembers = members.filter((member) => {
    const matchesFilter =
      filter === "all" || member.member_status === filter;

    const searchText = search.toLowerCase();

    const matchesSearch =
      !searchText ||
      member.full_name?.toLowerCase().includes(searchText) ||
      member.phone?.toLowerCase().includes(searchText) ||
      member.ministry?.toLowerCase().includes(searchText);

    return matchesFilter && matchesSearch;
  });

  function getInitials(name: string | null) {
    if (!name) return "M";

    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="admin-members-page">
        <div className="admin-members-loading">
          Loading members...
        </div>
      </main>
    );
  }

  return (
    <main className="admin-members-page">
      <section className="admin-members-header">
        <div>
          <p className="admin-eyebrow">ADMINISTRATION</p>
          <h1>Manage Members</h1>
          <p>
            Review member accounts and manage their membership status.
          </p>
        </div>

        <div className="member-total-card">
          <span>Total members</span>
          <strong>{members.length}</strong>
        </div>
      </section>

      {message && (
        <div className="admin-members-message">
          {message}
        </div>
      )}

      <section className="member-controls">
        <input
          type="search"
          placeholder="Search by name, phone, or ministry..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">All members</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </section>

      <section className="member-summary">
        <span>
          Showing <strong>{filteredMembers.length}</strong> member
          {filteredMembers.length === 1 ? "" : "s"}
        </span>
      </section>

      {filteredMembers.length === 0 ? (
        <div className="empty-members">
          <h2>No members found</h2>
          <p>Try changing your search or status filter.</p>
        </div>
      ) : (
        <section className="members-grid">
          {filteredMembers.map((member) => (
            <article className="member-admin-card" key={member.id}>
              <div className="member-card-top">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.full_name || "Member"}
                    className="member-admin-avatar"
                  />
                ) : (
                  <div className="member-admin-avatar member-initials">
                    {getInitials(member.full_name)}
                  </div>
                )}

                <div className="member-main-info">
                  <h2>{member.full_name || "Unnamed member"}</h2>

                  <span
                    className={`member-status status-${member.member_status}`}
                  >
                    {member.member_status}
                  </span>
                </div>
              </div>

              <div className="member-details">
                <div className="member-detail-row">
                  <span className="detail-label">Phone</span>
                  <span>
                    {member.phone || "Not provided"}
                  </span>
                </div>

                <div className="member-detail-row">
                  <span className="detail-label">Ministry</span>
                  <span>
                    {member.ministry || "Not specified"}
                  </span>
                </div>

                <div className="member-detail-row">
                  <span className="detail-label">Joined</span>
                  <span>{formatDate(member.created_at)}</span>
                </div>
              </div>

              <div className="member-actions">
                <button
                  onClick={() =>
                    updateMemberStatus(member.id, "approved")
                  }
                  className="approve-button"
                  disabled={member.member_status === "approved"}
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    updateMemberStatus(member.id, "pending")
                  }
                  className="pending-button"
                  disabled={member.member_status === "pending"}
                >
                  Pending
                </button>

                <button
                  onClick={() =>
                    updateMemberStatus(member.id, "rejected")
                  }
                  className="reject-button"
                  disabled={member.member_status === "rejected"}
                >
                  Reject
                </button>

                <button
                  onClick={() =>
                    updateMemberStatus(member.id, "suspended")
                  }
                  className="suspend-button"
                  disabled={member.member_status === "suspended"}
                >
                  Suspend
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}