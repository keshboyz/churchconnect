"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import "./admin.css";

type Stats = {
  members: number;
  pendingMembers: number;
  events: number;
  opportunities: number;
  songs: number;
  videos: number;
};

export default function AdminDashboardPage() {
  const supabase = createClient();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const [stats, setStats] = useState<Stats>({
    members: 0,
    pendingMembers: 0,
    events: 0,
    opportunities: 0,
    songs: 0,
    videos: 0,
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    setCheckingAdmin(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCheckingAdmin(false);
      return;
    }

    const { data: adminRecord, error } = await supabase
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Admin verification error:", error);
    }

    if (adminRecord) {
      setIsAdmin(true);
      await fetchStats();
    }

    setCheckingAdmin(false);
  }

  async function fetchStats() {
    setLoadingStats(true);

    const [
      membersResult,
      pendingMembersResult,
      eventsResult,
      opportunitiesResult,
      songsResult,
      videosResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("member_status", "pending"),

      supabase
        .from("events")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("opportunities")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("songs")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("videos")
        .select("id", { count: "exact", head: true }),
    ]);

    setStats({
      members: membersResult.count || 0,
      pendingMembers: pendingMembersResult.count || 0,
      events: eventsResult.count || 0,
      opportunities: opportunitiesResult.count || 0,
      songs: songsResult.count || 0,
      videos: videosResult.count || 0,
    });

    setLoadingStats(false);
  }

  if (checkingAdmin) {
    return (
      <main className="admin-page">
        <div className="admin-status-message">
          Checking administrator access...
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="admin-page">
        <div className="admin-status-message">
          <h2>Access denied</h2>
          <p>You must be an administrator to access this page.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div className="admin-hero-content">
          <p className="admin-eyebrow">CHURCHCONNECT ADMINISTRATION</p>

          <h1>Admin Dashboard</h1>

          <p>
            Manage your church community, events, opportunities, music, and
            videos from one central place.
          </p>
        </div>
      </section>

      <section className="admin-content">
        <div className="admin-section-title">
          <div>
            <h2>Platform overview</h2>
            <p>View the current activity across your church platform.</p>
          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={fetchStats}
          >
            Refresh
          </button>
        </div>

        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon members-icon">👥</div>
            <div>
              <p>Total members</p>
              <h3>{loadingStats ? "—" : stats.members}</h3>
            </div>
          </div>

          <div className="admin-stat-card pending-stat-card">
            <div className="admin-stat-icon pending-icon">⏳</div>
            <div>
              <p>Pending approvals</p>
              <h3>{loadingStats ? "—" : stats.pendingMembers}</h3>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon events-icon">📅</div>
            <div>
              <p>Events</p>
              <h3>{loadingStats ? "—" : stats.events}</h3>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon opportunities-icon">💼</div>
            <div>
              <p>Opportunities</p>
              <h3>{loadingStats ? "—" : stats.opportunities}</h3>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon songs-icon">🎵</div>
            <div>
              <p>Songs</p>
              <h3>{loadingStats ? "—" : stats.songs}</h3>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon videos-icon">🎥</div>
            <div>
              <p>Videos</p>
              <h3>{loadingStats ? "—" : stats.videos}</h3>
            </div>
          </div>
        </div>

        <div className="admin-section-title management-title">
          <div>
            <h2>Content management</h2>
            <p>Open a section to manage its content.</p>
          </div>
        </div>

        <div className="admin-management-grid">
          <Link href="/admin/members" className="admin-management-card">
            <div className="management-card-icon">👥</div>
            <div className="management-card-content">
              <h3>Manage members</h3>
              <p>Review registrations and approve or update members.</p>
            </div>
            <span className="management-arrow">→</span>
          </Link>

          <Link href="/admin/events" className="admin-management-card">
            <div className="management-card-icon">📅</div>
            <div className="management-card-content">
              <h3>Manage events</h3>
              <p>Create, update, and remove church events.</p>
            </div>
            <span className="management-arrow">→</span>
          </Link>

          <Link
            href="/admin/opportunities"
            className="admin-management-card"
          >
            <div className="management-card-icon">💼</div>
            <div className="management-card-content">
              <h3>Manage opportunities</h3>
              <p>Review and approve opportunities submitted by members.</p>
            </div>
            <span className="management-arrow">→</span>
          </Link>

          <Link href="/admin/songs" className="admin-management-card">
            <div className="management-card-icon">🎵</div>
            <div className="management-card-content">
              <h3>Manage songs</h3>
              <p>Upload and manage worship and praise music.</p>
            </div>
            <span className="management-arrow">→</span>
          </Link>

          <Link href="/admin/videos" className="admin-management-card">
            <div className="management-card-icon">🎥</div>
            <div className="management-card-content">
              <h3>Manage videos</h3>
              <p>Upload sermons, worship recordings, and teachings.</p>
            </div>
            <span className="management-arrow">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}