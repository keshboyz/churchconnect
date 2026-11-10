"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  ministry: string | null;
  bio: string | null;
  avatar_url: string | null;
  member_status: "pending" | "approved" | "rejected" | "suspended";
};

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, phone, ministry, bio, avatar_url, member_status"
        )
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
      }

      if (data) {
        setProfile(data);
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router, supabase]);

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>
          <p>Loading your dashboard...</p>
        </div>

        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  const fullName = profile?.full_name || "Member";
  const firstName = fullName.split(" ")[0];

  const completionFields = [
    profile?.full_name,
    profile?.phone,
    profile?.ministry,
    profile?.bio,
    profile?.avatar_url,
  ];

  const completedFields = completionFields.filter(
    (field) => field && field.trim() !== ""
  ).length;

  const completionPercentage = Math.round(
    (completedFields / completionFields.length) * 100
  );

  const missingFields: string[] = [];

  if (!profile?.full_name) missingFields.push("Full name");
  if (!profile?.phone) missingFields.push("Phone number");
  if (!profile?.ministry) missingFields.push("Ministry");
  if (!profile?.bio) missingFields.push("Bio");
  if (!profile?.avatar_url) missingFields.push("Profile picture");

  const membershipStatus = profile?.member_status || "pending";

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* WELCOME SECTION */}
        <section style={styles.welcomeCard}>
          <div style={styles.welcomeContent}>
            <div style={styles.avatarWrapper}>
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={fullName}
                  style={styles.avatar}
                />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <p style={styles.welcomeSmall}>WELCOME BACK</p>

              <h1 style={styles.welcomeTitle}>
                Hello, {firstName}! 👋
              </h1>

              <p style={styles.welcomeText}>
                It&apos;s great to have you with us. Stay connected with your
                church community.
              </p>
            </div>
          </div>
        </section>

        {/* MEMBERSHIP STATUS */}
        <section style={styles.statusCard}>
          <div>
            <p style={styles.sectionLabel}>MEMBERSHIP STATUS</p>

            <h2 style={styles.statusTitle}>
              {membershipStatus === "approved"
                ? "Approved Member"
                : membershipStatus === "rejected"
                ? "Membership Rejected"
                : membershipStatus === "suspended"
                ? "Membership Suspended"
                : "Membership Pending"}
            </h2>

            <p style={styles.statusDescription}>
              {membershipStatus === "approved"
                ? "Your membership has been approved. You can access the church community and member features."
                : membershipStatus === "rejected"
                ? "Your membership application has not been approved."
                : membershipStatus === "suspended"
                ? "Your membership is currently suspended."
                : "Your membership is currently being reviewed by the church administration."}
            </p>
          </div>

          <div
            style={{
              ...styles.statusBadge,
              ...(membershipStatus === "approved"
                ? styles.statusApproved
                : membershipStatus === "rejected"
                ? styles.statusRejected
                : membershipStatus === "suspended"
                ? styles.statusSuspended
                : styles.statusPending),
            }}
          >
            {membershipStatus === "approved"
              ? "APPROVED"
              : membershipStatus === "rejected"
              ? "REJECTED"
              : membershipStatus === "suspended"
              ? "SUSPENDED"
              : "PENDING"}
          </div>
        </section>

        {/* PROFILE COMPLETION */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.sectionLabel}>YOUR PROFILE</p>
              <h2 style={styles.cardTitle}>Profile completion</h2>
            </div>

            <div style={styles.percentage}>
              {completionPercentage}%
            </div>
          </div>

          <div style={styles.progressBackground}>
            <div
              style={{
                ...styles.progressBar,
                width: `${completionPercentage}%`,
              }}
            />
          </div>

          {completionPercentage === 100 ? (
            <p style={styles.successText}>
              ✓ Your profile is complete. Great job!
            </p>
          ) : (
            <div style={styles.missingBox}>
              <p style={styles.missingTitle}>
                Complete your profile
              </p>

              <p style={styles.missingText}>
                Missing: {missingFields.join(", ")}
              </p>

              <Link href="/profile" style={styles.profileButton}>
                Update Profile →
              </Link>
            </div>
          )}
        </section>

        {/* PROFILE SUMMARY */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.sectionLabel}>ACCOUNT</p>
              <h2 style={styles.cardTitle}>Your profile</h2>
            </div>

            <Link href="/profile" style={styles.viewLink}>
              Edit Profile →
            </Link>
          </div>

          <div style={styles.profileGrid}>
            <div style={styles.profileItem}>
              <span style={styles.profileLabel}>Name</span>
              <span style={styles.profileValue}>
                {profile?.full_name || "Not provided"}
              </span>
            </div>

            <div style={styles.profileItem}>
              <span style={styles.profileLabel}>Phone</span>
              <span style={styles.profileValue}>
                {profile?.phone || "Not provided"}
              </span>
            </div>

            <div style={styles.profileItem}>
              <span style={styles.profileLabel}>Ministry</span>
              <span style={styles.profileValue}>
                {profile?.ministry || "Not provided"}
              </span>
            </div>

            <div style={styles.profileItem}>
              <span style={styles.profileLabel}>About you</span>
              <span style={styles.profileValue}>
                {profile?.bio || "Not provided"}
              </span>
            </div>
          </div>
        </section>

        {/* QUICK ACCESS */}
        <section>
          <div style={styles.quickHeader}>
            <p style={styles.sectionLabel}>EXPLORE</p>
            <h2 style={styles.quickTitle}>Quick access</h2>
          </div>

          <div style={styles.quickGrid}>
            <Link href="/community" style={styles.quickCard}>
              <div style={styles.quickIcon}>👥</div>

              <div style={styles.quickContent}>
                <h3 style={styles.quickCardTitle}>Community</h3>
                <p style={styles.quickCardText}>
                  Connect with other church members.
                </p>
              </div>

              <span style={styles.quickArrow}>→</span>
            </Link>

            <Link href="/events" style={styles.quickCard}>
              <div style={styles.quickIcon}>📅</div>

              <div style={styles.quickContent}>
                <h3 style={styles.quickCardTitle}>Events</h3>
                <p style={styles.quickCardText}>
                  See upcoming church events and activities.
                </p>
              </div>

              <span style={styles.quickArrow}>→</span>
            </Link>

            <Link href="/opportunities" style={styles.quickCard}>
              <div style={styles.quickIcon}>💼</div>

              <div style={styles.quickContent}>
                <h3 style={styles.quickCardTitle}>Opportunities</h3>
                <p style={styles.quickCardText}>
                  Discover jobs, internships and opportunities.
                </p>
              </div>

              <span style={styles.quickArrow}>→</span>
            </Link>

            <Link href="/dashboard/my-submissions" style={styles.quickCard}>
              <div style={styles.quickIcon}>📋</div>

              <div style={styles.quickContent}>
                <h3 style={styles.quickCardTitle}>My Submissions</h3>
                <p style={styles.quickCardText}>
                  Track opportunities you have submitted.
                </p>
              </div>

              <span style={styles.quickArrow}>→</span>
            </Link>

            <Link href="/songs" style={styles.quickCard}>
              <div style={styles.quickIcon}>🎵</div>

              <div style={styles.quickContent}>
                <h3 style={styles.quickCardTitle}>Songs</h3>
                <p style={styles.quickCardText}>
                  Listen to worship songs and music.
                </p>
              </div>

              <span style={styles.quickArrow}>→</span>
            </Link>

            <Link href="/videos" style={styles.quickCard}>
              <div style={styles.quickIcon}>🎥</div>

              <div style={styles.quickContent}>
                <h3 style={styles.quickCardTitle}>Videos</h3>
                <p style={styles.quickCardText}>
                  Watch church videos and messages.
                </p>
              </div>

              <span style={styles.quickArrow}>→</span>
            </Link>

            <Link href="/profile" style={styles.quickCard}>
              <div style={styles.quickIcon}>👤</div>

              <div style={styles.quickContent}>
                <h3 style={styles.quickCardTitle}>My Profile</h3>
                <p style={styles.quickCardText}>
                  View and update your personal information.
                </p>
              </div>

              <span style={styles.quickArrow}>→</span>
            </Link>
          </div>
        </section>

        {/* STAY CONNECTED */}
        <section style={styles.bottomCard}>
          <div style={styles.bottomIcon}>🙏</div>

          <div>
            <h2 style={styles.bottomTitle}>Stay connected</h2>

            <p style={styles.bottomText}>
              Keep your profile updated and check the platform regularly for
              new church events, community updates, worship content, and
              opportunities.
            </p>
          </div>
        </section>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        a {
          text-decoration: none;
        }

        @media (max-width: 700px) {
          .dashboard-container {
            padding: 20px;
          }
        }
      `}</style>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f9ff",
    padding: "40px 20px 70px",
    color: "#17324d",
  },

  container: {
    width: "100%",
    maxWidth: "1150px",
    margin: "0 auto",
  },

  loadingCard: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "15px",
    color: "#52708d",
  },

  spinner: {
    width: "38px",
    height: "38px",
    border: "4px solid #dbeafe",
    borderTop: "4px solid #2d7ff9",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  welcomeCard: {
    background: "linear-gradient(135deg, #dff1ff, #eef7ff)",
    border: "1px solid #cde7fb",
    borderRadius: "24px",
    padding: "32px",
    marginBottom: "22px",
    boxShadow: "0 10px 30px rgba(36, 105, 160, 0.08)",
  },

  welcomeContent: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },

  avatarWrapper: {
    flexShrink: 0,
  },

  avatar: {
    width: "92px",
    height: "92px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid white",
    boxShadow: "0 5px 18px rgba(0,0,0,0.10)",
  },

  avatarPlaceholder: {
    width: "92px",
    height: "92px",
    borderRadius: "50%",
    background: "#2d7ff9",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "38px",
    fontWeight: 700,
    border: "4px solid white",
    boxShadow: "0 5px 18px rgba(0,0,0,0.10)",
  },

  welcomeSmall: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "1.5px",
    color: "#3973a5",
  },

  welcomeTitle: {
    margin: "7px 0 8px",
    fontSize: "32px",
    lineHeight: 1.2,
    color: "#173b5c",
  },

  welcomeText: {
    margin: 0,
    color: "#52708d",
    fontSize: "15px",
    lineHeight: 1.6,
  },

  statusCard: {
    background: "white",
    border: "1px solid #e0edf7",
    borderRadius: "20px",
    padding: "24px 26px",
    marginBottom: "22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 7px 25px rgba(36, 105, 160, 0.06)",
  },

  sectionLabel: {
    margin: 0,
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1.4px",
    color: "#6590b1",
  },

  statusTitle: {
    margin: "7px 0 5px",
    fontSize: "20px",
    color: "#173b5c",
  },

  statusDescription: {
    margin: 0,
    color: "#6b8298",
    fontSize: "14px",
    lineHeight: 1.5,
    maxWidth: "720px",
  },

  statusBadge: {
    padding: "9px 15px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.8px",
    whiteSpace: "nowrap",
  },

  statusApproved: {
    background: "#dcfce7",
    color: "#166534",
  },

  statusPending: {
    background: "#fef3c7",
    color: "#92400e",
  },

  statusRejected: {
    background: "#fee2e2",
    color: "#991b1b",
  },

  statusSuspended: {
    background: "#e5e7eb",
    color: "#374151",
  },

  card: {
    background: "white",
    border: "1px solid #e0edf7",
    borderRadius: "20px",
    padding: "26px",
    marginBottom: "22px",
    boxShadow: "0 7px 25px rgba(36, 105, 160, 0.06)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "20px",
  },

  cardTitle: {
    margin: "6px 0 0",
    fontSize: "21px",
    color: "#173b5c",
  },

  percentage: {
    fontSize: "25px",
    fontWeight: 800,
    color: "#2d7ff9",
  },

  progressBackground: {
    width: "100%",
    height: "10px",
    background: "#e8f1f8",
    borderRadius: "999px",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    background: "#2d7ff9",
    borderRadius: "999px",
    transition: "width 0.4s ease",
  },

  successText: {
    margin: "15px 0 0",
    color: "#15803d",
    fontSize: "14px",
    fontWeight: 600,
  },

  missingBox: {
    marginTop: "18px",
    padding: "17px",
    background: "#f5faff",
    borderRadius: "14px",
    border: "1px solid #dceefb",
  },

  missingTitle: {
    margin: "0 0 5px",
    fontWeight: 700,
    color: "#244d6d",
  },

  missingText: {
    margin: "0 0 14px",
    color: "#6b8298",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  profileButton: {
    display: "inline-block",
    padding: "10px 16px",
    borderRadius: "10px",
    background: "#2d7ff9",
    color: "white",
    fontSize: "13px",
    fontWeight: 700,
  },

  viewLink: {
    color: "#2d7ff9",
    fontWeight: 700,
    fontSize: "13px",
  },

  profileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "14px",
  },

  profileItem: {
    background: "#f8fbfe",
    border: "1px solid #e4eff7",
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  profileLabel: {
    fontSize: "11px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    color: "#7b96aa",
  },

  profileValue: {
    fontSize: "14px",
    color: "#274b67",
    lineHeight: 1.5,
    wordBreak: "break-word",
  },

  quickHeader: {
    marginBottom: "16px",
  },

  quickTitle: {
    margin: "6px 0 0",
    fontSize: "23px",
    color: "#173b5c",
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "14px",
  },

  quickCard: {
    background: "white",
    border: "1px solid #e0edf7",
    borderRadius: "18px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 7px 20px rgba(36, 105, 160, 0.05)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },

  quickIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "#eaf5ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    flexShrink: 0,
  },

  quickContent: {
    flex: 1,
  },

  quickCardTitle: {
    margin: 0,
    color: "#214966",
    fontSize: "16px",
  },

  quickCardText: {
    margin: "5px 0 0",
    color: "#758ca0",
    fontSize: "13px",
    lineHeight: 1.45,
  },

  quickArrow: {
    color: "#2d7ff9",
    fontSize: "22px",
    fontWeight: 600,
  },

  bottomCard: {
    marginTop: "22px",
    background: "linear-gradient(135deg, #edf8ff, #f7fbff)",
    border: "1px solid #d8ecfa",
    borderRadius: "20px",
    padding: "25px",
    display: "flex",
    alignItems: "flex-start",
    gap: "18px",
  },

  bottomIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    flexShrink: 0,
  },

  bottomTitle: {
    margin: "0 0 6px",
    fontSize: "19px",
    color: "#214966",
  },

  bottomText: {
    margin: 0,
    color: "#668097",
    fontSize: "14px",
    lineHeight: 1.6,
  },
};