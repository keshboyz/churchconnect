"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";

type Member = {
  id: string;
  full_name: string | null;
  ministry: string | null;
  bio: string | null;
  avatar_url: string | null;
  member_status: string | null;
};

export default function MemberProfilePage() {
  const params = useParams();
  const memberId = params.id as string;

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadMemberProfile() {
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
        setMessage(
          "Only approved church members can view member profiles."
        );
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, ministry, bio, avatar_url, member_status"
        )
        .eq("id", memberId)
        .eq("member_status", "approved")
        .single();

      if (error || !data) {
        console.error("Member profile error:", error);
        setNotFound(true);
      } else {
        setMember(data);
      }

      setLoading(false);
    }

    if (memberId) {
      loadMemberProfile();
    }
  }, [memberId]);

  if (loading) {
    return (
      <main className="community-page">
        <div className="directory-container">
          <div className="directory-loading">
            <div className="directory-spinner" />
            <p>Loading member profile...</p>
          </div>
        </div>
      </main>
    );
  }

  if (message) {
    return (
      <main className="community-page">
        <div className="directory-container">
          <section className="directory-notice">
            <div className="directory-notice-icon">✦</div>
            <h1>Access restricted</h1>
            <p>{message}</p>
            <Link href="/community" className="directory-primary-button">
              Back to community <span>→</span>
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (notFound || !member) {
    return (
      <main className="community-page">
        <div className="directory-container">
          <section className="directory-notice">
            <div className="directory-notice-icon">?</div>
            <h1>Member not found</h1>
            <p>
              This profile may not exist or may no longer be an approved
              member of the community.
            </p>
            <Link href="/community" className="directory-primary-button">
              Back to community <span>→</span>
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="community-page">
      <div className="directory-container">
        <div className="member-profile-back">
          <Link href="/community">← Back to community</Link>
        </div>

        <section className="member-profile-modern">
          <div className="member-profile-banner">
            <span>CHURCHCONNECT / OUR PEOPLE</span>
            <div>✦</div>
          </div>

          <div className="member-profile-main">
            <div className="member-profile-avatar">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={`${member.full_name || "Member"} profile`}
                />
              ) : (
                <div>
                  {(member.full_name || "M").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="member-profile-heading">
              <span className="member-profile-kicker">
                CHURCH COMMUNITY MEMBER
              </span>
              <h1>{member.full_name || "Unnamed Member"}</h1>
              <span className="directory-ministry">
                {member.ministry || "Church Member"}
              </span>
            </div>

            <div className="member-profile-about">
              <span className="directory-kicker">GETTING TO KNOW ME</span>
              <h2>A little about me</h2>
              <p>
                {member.bio ||
                  "This member has not added a biography yet."}
              </p>
            </div>

            <div className="member-profile-footer">
              <span>One community. Growing together.</span>
              <Link href="/community">
                Explore other members <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}