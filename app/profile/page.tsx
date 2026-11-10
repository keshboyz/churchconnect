"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent, CSSProperties } from "react";
import { createClient } from "../../lib/supabase/client";

export default function Profile() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ministry, setMinistry] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [memberStatus, setMemberStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">(
    "",
  );

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "full_name, phone, ministry, bio, avatar_url, member_status",
        )
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Profile loading error:", error);
        setMessage("Unable to load your profile.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      if (data) {
        setName(data.full_name || "");
        setPhone(data.phone || "");
        setMinistry(data.ministry || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || "");
        setMemberStatus(data.member_status || "pending");
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  async function handleAvatarUpload(
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setMessage("");
    setMessageType("");

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      setMessageType("error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Please select an image smaller than 2 MB.");
      setMessageType("error");
      return;
    }

    if (memberStatus !== "approved") {
      setMessage("Only approved members can upload a profile photo.");
      setMessageType("error");
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      const fileExtension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${user.id}/avatar-${Date.now()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        setMessage(`Image upload failed: ${uploadError.message}`);
        setMessageType("error");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      if (!publicUrl) {
        setMessage("The image uploaded, but no public URL was generated.");
        setMessageType("error");
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("Profile avatar update error:", profileError);
        setMessage(
          `Image uploaded, but profile update failed: ${profileError.message}`,
        );
        setMessageType("error");
        return;
      }

      setAvatarUrl(`${publicUrl}?v=${Date.now()}`);
      setMessage("Profile photo uploaded successfully!");
      setMessageType("success");
    } catch (error) {
      console.error("Unexpected upload error:", error);
      setMessage("Something went wrong while uploading the image.");
      setMessageType("error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (memberStatus !== "approved") {
      setMessage("Only approved members can update their profile.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");
    setMessageType("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: name,
          phone,
          ministry,
          bio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Profile update error:", error);
        setMessage(error.message);
        setMessageType("error");
      } else {
        setMessage("Profile updated successfully!");
        setMessageType("success");
      }
    } catch (error) {
      console.error("Unexpected profile update error:", error);
      setMessage("Something went wrong while updating your profile.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  const displayName = name || "Church Member";
  const initial = displayName.charAt(0).toUpperCase();

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading your profile...</p>
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

  if (memberStatus !== "approved") {
    return (
      <main style={styles.page}>
        <div style={styles.restrictedContainer}>
          <div style={styles.restrictedIcon}>🔒</div>

          <p style={styles.eyebrow}>MY PROFILE</p>

          <h1 style={styles.pageTitle}>Profile Access Restricted</h1>

          <p style={styles.pageSubtitle}>
            You can edit your profile after your church membership has been
            approved.
          </p>

          <div style={styles.restrictedCard}>
            <div style={styles.restrictedStatusRow}>
              <span style={styles.restrictedLabel}>
                Current membership status
              </span>

              <span
                style={{
                  ...styles.statusBadge,
                  ...(memberStatus === "rejected"
                    ? styles.rejectedBadge
                    : memberStatus === "suspended"
                      ? styles.suspendedBadge
                      : styles.pendingBadge),
                }}
              >
                {memberStatus.toUpperCase()}
              </span>
            </div>

            <p style={styles.restrictedDescription}>
              Please contact the church administration if you believe your
              membership status needs to be reviewed.
            </p>
          </div>

          <a href="/dashboard" style={styles.backButton}>
            ← Back to Dashboard
          </a>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* PAGE HEADER */}
        <section style={styles.pageHeader}>
          <p style={styles.eyebrow}>ACCOUNT SETTINGS</p>

          <h1 style={styles.pageTitle}>My Profile</h1>

          <p style={styles.pageSubtitle}>
            Keep your church community profile up to date.
          </p>
        </section>

        {/* MAIN PROFILE LAYOUT */}
        <div style={styles.profileLayout}>
          {/* PROFILE PHOTO CARD */}
          <section style={styles.photoCard}>
            <div style={styles.cardTopLine}></div>

            <p style={styles.cardEyebrow}>PROFILE PHOTO</p>

            <div style={styles.photoWrapper}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Your profile"
                  style={styles.profilePhoto}
                  onError={() => {
                    setMessage(
                      "The image could not be loaded. Please check your Supabase Storage settings.",
                    );
                    setMessageType("error");
                  }}
                />
              ) : (
                <div style={styles.photoPlaceholder}>{initial}</div>
              )}
            </div>

            <h2 style={styles.photoName}>{displayName}</h2>

            <p style={styles.photoRole}>
              {ministry || "Church Community Member"}
            </p>

            <label
              htmlFor="avatar"
              style={{
                ...styles.uploadButton,
                ...(uploading ? styles.disabledButton : {}),
              }}
            >
              {uploading ? "Uploading..." : "Choose Profile Photo"}
            </label>

            <input
              id="avatar"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleAvatarUpload}
              disabled={uploading}
              style={styles.hiddenFileInput}
            />

            <p style={styles.uploadHelp}>
              JPG, JPEG, PNG, or WebP
              <br />
              Maximum size: 2 MB
            </p>

            <div style={styles.photoTip}>
              <span>💡</span>
              <p>Use a clear photo so other members can recognize you.</p>
            </div>
          </section>

          {/* PROFILE FORM CARD */}
          <section style={styles.formCard}>
            <div style={styles.formHeader}>
              <div>
                <p style={styles.cardEyebrow}>PERSONAL INFORMATION</p>
                <h2 style={styles.formTitle}>Update your details</h2>
              </div>

              <div style={styles.approvedBadge}>✓ APPROVED MEMBER</div>
            </div>

            <div style={styles.formDivider}></div>

            <form onSubmit={handleSave}>
              {/* FULL NAME */}
              <div style={styles.fieldGroup}>
                <label htmlFor="name" style={styles.label}>
                  Full Name
                </label>

                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  style={styles.input}
                />
              </div>

              {/* PHONE */}
              <div style={styles.fieldGroup}>
                <label htmlFor="phone" style={styles.label}>
                  Phone Number
                </label>

                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  style={styles.input}
                />
              </div>

              {/* MINISTRY */}
              <div style={styles.fieldGroup}>
                <label htmlFor="ministry" style={styles.label}>
                  Ministry
                </label>

                <input
                  type="text"
                  id="ministry"
                  value={ministry}
                  onChange={(e) => setMinistry(e.target.value)}
                  placeholder="e.g. Youth, Worship, Media, Ushering"
                  style={styles.input}
                />

                <p style={styles.fieldHint}>
                  Enter the ministry or church department you serve in.
                </p>
              </div>

              {/* BIO */}
              <div style={styles.fieldGroup}>
                <label htmlFor="bio" style={styles.label}>
                  About Me
                </label>

                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the church community a little about yourself"
                  rows={6}
                  style={styles.textarea}
                />

                <p style={styles.fieldHint}>
                  Share a short introduction that other approved members can
                  see.
                </p>
              </div>

              {/* MESSAGE */}
              {message && (
                <div
                  style={{
                    ...styles.messageBox,
                    ...(messageType === "error"
                      ? styles.errorMessage
                      : styles.successMessage),
                  }}
                >
                  <span>
                    {messageType === "error" ? "⚠️" : "✓"}
                  </span>
                  <p>{message}</p>
                </div>
              )}

              {/* ACTIONS */}
              <div style={styles.formActions}>
                <a href="/dashboard" style={styles.cancelButton}>
                  Cancel
                </a>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...styles.saveButton,
                    ...(saving ? styles.disabledButton : {}),
                  }}
                >
                  {saving ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* PRIVACY NOTE */}
        <section style={styles.privacyCard}>
          <div style={styles.privacyIcon}>🛡️</div>

          <div>
            <h2 style={styles.privacyTitle}>Your information is protected</h2>
            <p style={styles.privacyText}>
              Your profile information is intended for the ChurchConnect
              community and is managed according to the church&apos;s privacy
              guidelines.
            </p>
          </div>
        </section>
      </div>

      <style jsx>{`
        input:focus,
        textarea:focus {
          outline: none;
          border-color: #3182ce;
          box-shadow: 0 0 0 4px rgba(49, 130, 206, 0.1);
        }

        button,
        label,
        a {
          transition:
            background 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        button:hover:not(:disabled),
        label:hover:not(:has(+ input:disabled)) {
          transform: translateY(-1px);
        }

        @media (max-width: 850px) {
          .profile-layout {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 550px) {
          .page-header {
            text-align: left;
          }

          .form-actions {
            flex-direction: column-reverse !important;
          }

          .form-actions a,
          .form-actions button {
            width: 100% !important;
            text-align: center;
          }
        }
      `}</style>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f9ff",
    padding: "50px 20px 80px",
    color: "#17324d",
  },

  container: {
    width: "100%",
    maxWidth: "1120px",
    margin: "0 auto",
  },

  pageHeader: {
    textAlign: "center",
    marginBottom: "38px",
  },

  eyebrow: {
    margin: "0 0 10px",
    color: "#5b8bb1",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "1.8px",
  },

  pageTitle: {
    margin: 0,
    color: "#1f4f91",
    fontSize: "clamp(32px, 5vw, 48px)",
    fontWeight: 700,
    lineHeight: 1.15,
  },

  pageSubtitle: {
    margin: "14px 0 0",
    color: "#66829b",
    fontSize: "16px",
    lineHeight: 1.6,
  },

  profileLayout: {
    display: "grid",
    gridTemplateColumns: "330px minmax(0, 1fr)",
    alignItems: "start",
    gap: "24px",
  },

  photoCard: {
    position: "relative",
    background: "white",
    border: "1px solid #dcebf6",
    borderRadius: "24px",
    padding: "30px 25px",
    textAlign: "center",
    boxShadow: "0 12px 35px rgba(42, 108, 157, 0.07)",
    overflow: "hidden",
  },

  cardTopLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "5px",
    background: "linear-gradient(90deg, #3182ce, #72c7f5)",
  },

  cardEyebrow: {
    margin: 0,
    color: "#7194ae",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1.4px",
  },

  photoWrapper: {
    display: "flex",
    justifyContent: "center",
    margin: "25px 0 18px",
  },

  profilePhoto: {
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "6px solid #edf7ff",
    boxShadow: "0 8px 25px rgba(33, 91, 132, 0.15)",
  },

  photoPlaceholder: {
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3182ce, #76c8f2)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "58px",
    fontWeight: 700,
    border: "6px solid #edf7ff",
    boxShadow: "0 8px 25px rgba(33, 91, 132, 0.15)",
  },

  photoName: {
    margin: "0 0 7px",
    color: "#214b6c",
    fontSize: "22px",
    fontWeight: 700,
    wordBreak: "break-word",
  },

  photoRole: {
    margin: "0 0 24px",
    color: "#7791a5",
    fontSize: "14px",
  },

  uploadButton: {
    display: "inline-block",
    padding: "12px 18px",
    background: "#e8f4ff",
    color: "#2166a3",
    border: "1px solid #cce7fa",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },

  hiddenFileInput: {
    display: "none",
  },

  uploadHelp: {
    margin: "13px 0 0",
    color: "#8aa0b2",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  photoTip: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    textAlign: "left",
    background: "#f4faff",
    border: "1px solid #e0f0fa",
    borderRadius: "12px",
    padding: "13px",
    marginTop: "24px",
  },

  formCard: {
    background: "white",
    border: "1px solid #dcebf6",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 12px 35px rgba(42, 108, 157, 0.07)",
  },

  formHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
  },

  formTitle: {
    margin: "8px 0 0",
    color: "#214b6c",
    fontSize: "25px",
    fontWeight: 700,
  },

  approvedBadge: {
    background: "#dcfce7",
    color: "#16733a",
    borderRadius: "999px",
    padding: "9px 13px",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.6px",
    whiteSpace: "nowrap",
  },

  formDivider: {
    height: "1px",
    background: "#e8f1f7",
    margin: "25px 0",
  },

  fieldGroup: {
    marginBottom: "23px",
  },

  label: {
    display: "block",
    color: "#315672",
    fontSize: "14px",
    fontWeight: 700,
    marginBottom: "9px",
  },

  input: {
    width: "100%",
    minHeight: "48px",
    padding: "12px 14px",
    border: "1px solid #d6e5ef",
    borderRadius: "12px",
    background: "#fbfdff",
    color: "#244962",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: "140px",
    padding: "13px 14px",
    border: "1px solid #d6e5ef",
    borderRadius: "12px",
    background: "#fbfdff",
    color: "#244962",
    fontSize: "14px",
    lineHeight: 1.6,
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  fieldHint: {
    margin: "8px 0 0",
    color: "#8aa0b2",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  messageBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "13px 15px",
    borderRadius: "12px",
    marginBottom: "22px",
  },

  messageBoxText: {
    margin: 0,
  },

  successMessage: {
    background: "#ecfdf3",
    border: "1px solid #bbf7d0",
    color: "#166534",
  },

  errorMessage: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
  },

  formActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "10px",
  },

  cancelButton: {
    display: "inline-block",
    padding: "12px 20px",
    borderRadius: "12px",
    border: "1px solid #d8e7f1",
    background: "white",
    color: "#5e7b92",
    fontSize: "14px",
    fontWeight: 700,
  },

  saveButton: {
    border: "none",
    padding: "13px 23px",
    borderRadius: "12px",
    background: "#3182ce",
    color: "white",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 6px 15px rgba(49, 130, 206, 0.2)",
  },

  disabledButton: {
    opacity: 0.65,
    cursor: "not-allowed",
  },

  privacyCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
    background: "#edf8ff",
    border: "1px solid #d8edf9",
    borderRadius: "18px",
    padding: "22px",
    marginTop: "24px",
  },

  privacyIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    flexShrink: 0,
  },

  privacyTitle: {
    margin: "0 0 6px",
    color: "#28516d",
    fontSize: "16px",
  },

  privacyText: {
    margin: 0,
    color: "#6b879c",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  loadingContainer: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
  },

  spinner: {
    width: "42px",
    height: "42px",
    border: "4px solid #dceeff",
    borderTop: "4px solid #3182ce",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  loadingText: {
    color: "#6c879d",
    fontSize: "15px",
  },

  restrictedContainer: {
    width: "100%",
    maxWidth: "650px",
    margin: "60px auto",
    textAlign: "center",
  },

  restrictedIcon: {
    width: "75px",
    height: "75px",
    margin: "0 auto 22px",
    borderRadius: "24px",
    background: "#eaf5ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
  },

  restrictedCard: {
    background: "white",
    border: "1px solid #dcebf6",
    borderRadius: "20px",
    padding: "25px",
    margin: "30px 0 24px",
    textAlign: "left",
    boxShadow: "0 10px 30px rgba(42, 108, 157, 0.06)",
  },

  restrictedStatusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  restrictedLabel: {
    color: "#55758e",
    fontSize: "14px",
    fontWeight: 700,
  },

  restrictedDescription: {
    margin: "20px 0 0",
    paddingTop: "18px",
    borderTop: "1px solid #e8f1f7",
    color: "#7890a2",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  statusBadge: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.7px",
  },

  pendingBadge: {
    background: "#fef3c7",
    color: "#92400e",
  },

  rejectedBadge: {
    background: "#fee2e2",
    color: "#991b1b",
  },

  suspendedBadge: {
    background: "#e5e7eb",
    color: "#374151",
  },

  backButton: {
    display: "inline-block",
    color: "#2d75b8",
    fontSize: "14px",
    fontWeight: 700,
  },
};