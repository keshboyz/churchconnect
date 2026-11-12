
"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
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
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

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
        .select("full_name, phone, ministry, bio, avatar_url, member_status")
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

  async function handleAvatarUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setMessage("");
    setMessageType("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select a JPG, PNG, or WebP image.");
      setMessageType("error");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Please select an image smaller than 2 MB.");
      setMessageType("error");
      e.target.value = "";
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

      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
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
      e.target.value = "";
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
      <main className="profile-page">
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading your profile...</p>
        </div>

        <style jsx>{`
          .profile-page {
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #f5f9ff;
            color: #6c879d;
          }

          .loading-container {
            text-align: center;
          }

          .spinner {
            width: 42px;
            height: 42px;
            margin: 0 auto 15px;
            border: 4px solid #dceeff;
            border-top-color: #3182ce;
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

  if (memberStatus !== "approved") {
    return (
      <main className="profile-page">
        <div className="restricted-container">
          <div className="restricted-icon">🔒</div>

          <p className="eyebrow">MY PROFILE</p>

          <h1>Profile Access Restricted</h1>

          <p className="subtitle">
            You can edit your profile after your church membership has been
            approved.
          </p>

          <div className="restricted-card">
            <div className="status-row">
              <span>Current membership status</span>
              <span className={`status-badge ${memberStatus}`}>
                {memberStatus.toUpperCase()}
              </span>
            </div>

            <p>
              Please contact the church administration if you believe your
              membership status needs to be reviewed.
            </p>
          </div>

          <a href="/dashboard" className="back-button">
            ← Back to Dashboard
          </a>
        </div>

        <style jsx>{`
          .profile-page {
            min-height: 100vh;
            padding: 50px 20px;
            background: #f5f9ff;
            color: #17324d;
          }

          .restricted-container {
            width: 100%;
            max-width: 650px;
            margin: 30px auto;
            text-align: center;
          }

          .restricted-icon {
            width: 75px;
            height: 75px;
            margin: 0 auto 22px;
            display: grid;
            place-items: center;
            border-radius: 24px;
            background: #eaf5ff;
            font-size: 32px;
          }

          .eyebrow {
            color: #5b8bb1;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 1.8px;
          }

          h1 {
            color: #1f4f91;
            font-size: clamp(28px, 5vw, 42px);
          }

          .subtitle {
            color: #66829b;
            line-height: 1.6;
          }

          .restricted-card {
            margin: 30px 0 24px;
            padding: 25px;
            border: 1px solid #dcebf6;
            border-radius: 20px;
            background: white;
            text-align: left;
          }

          .status-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
          }

          .status-badge {
            padding: 8px 12px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 800;
          }

          .pending {
            background: #fef3c7;
            color: #92400e;
          }

          .rejected {
            background: #fee2e2;
            color: #991b1b;
          }

          .suspended {
            background: #e5e7eb;
            color: #374151;
          }

          .restricted-card p {
            margin-top: 20px;
            padding-top: 18px;
            border-top: 1px solid #e8f1f7;
            color: #7890a2;
            line-height: 1.6;
          }

          .back-button {
            color: #2d75b8;
            font-weight: 700;
            text-decoration: none;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="page-header">
          <p className="eyebrow">ACCOUNT SETTINGS</p>
          <h1>My Profile</h1>
          <p className="subtitle">
            Keep your church community profile up to date.
          </p>
        </header>

        <div className="profile-layout">
          <section className="photo-card">
            <div className="card-top-line" />

            <p className="card-eyebrow">PROFILE PHOTO</p>

            <div className="photo-wrapper">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Your profile"
                  className="profile-photo"
                  onError={() => {
                    setMessage(
                      "The image could not be loaded. Please check your Supabase Storage settings.",
                    );
                    setMessageType("error");
                  }}
                />
              ) : (
                <div className="photo-placeholder">{initial}</div>
              )}
            </div>

            <h2 className="photo-name">{displayName}</h2>

            <p className="photo-role">
              {ministry || "Church Community Member"}
            </p>

            <label
              htmlFor="avatar"
              className={`upload-button ${uploading ? "disabled" : ""}`}
            >
              {uploading ? "Uploading..." : "Choose Profile Photo"}
            </label>

            <input
              id="avatar"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarUpload}
              disabled={uploading}
              className="hidden-file-input"
            />

            <p className="upload-help">
              JPG, JPEG, PNG, or WebP
              <br />
              Maximum size: 2 MB
            </p>

            <div className="photo-tip">
              <span>💡</span>
              <p>Use a clear photo so other members can recognize you.</p>
            </div>
          </section>

          <section className="form-card">
            <div className="form-header">
              <div>
                <p className="card-eyebrow">PERSONAL INFORMATION</p>
                <h2>Update your details</h2>
              </div>

              <div className="approved-badge">✓ APPROVED MEMBER</div>
            </div>

            <div className="form-divider" />

            <form onSubmit={handleSave}>
              <div className="field-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="field-group">
                <label htmlFor="ministry">Ministry</label>
                <input
                  type="text"
                  id="ministry"
                  value={ministry}
                  onChange={(e) => setMinistry(e.target.value)}
                  placeholder="e.g. Youth, Worship, Media, Ushering"
                />
                <p className="field-hint">
                  Enter the ministry or church department you serve in.
                </p>
              </div>

              <div className="field-group">
                <label htmlFor="bio">About Me</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the church community a little about yourself"
                  rows={6}
                />
                <p className="field-hint">
                  Share a short introduction that other approved members can
                  see.
                </p>
              </div>

              {message && (
                <div className={`message-box ${messageType}`}>
                  <span>{messageType === "error" ? "⚠️" : "✓"}</span>
                  <p>{message}</p>
                </div>
              )}

              <div className="form-actions">
                <a href="/dashboard" className="cancel-button">
                  Cancel
                </a>

                <button type="submit" disabled={saving}>
                  {saving ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </form>
          </section>
        </div>

        <section className="privacy-card">
          <div className="privacy-icon">🛡️</div>
          <div>
            <h2>Your information is protected</h2>
            <p>
              Your profile information is intended for the ChurchConnect
              community and is managed according to the church&apos;s privacy
              guidelines.
            </p>
          </div>
        </section>
      </div>

      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          padding: 50px 20px 80px;
          background: #f5f9ff;
          color: #17324d;
          overflow-x: hidden;
        }

        .profile-container {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 38px;
          text-align: center;
        }

        .eyebrow {
          margin: 0 0 10px;
          color: #5b8bb1;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.8px;
        }

        .page-header h1 {
          margin: 0;
          color: #1f4f91;
          font-size: clamp(32px, 5vw, 48px);
          line-height: 1.15;
        }

        .subtitle {
          margin: 14px 0 0;
          color: #66829b;
          font-size: 16px;
          line-height: 1.6;
        }

        .profile-layout {
          display: grid;
          grid-template-columns: 330px minmax(0, 1fr);
          align-items: start;
          gap: 24px;
        }

        .photo-card,
        .form-card {
          min-width: 0;
          box-sizing: border-box;
          border: 1px solid #dcebf6;
          border-radius: 24px;
          background: white;
          box-shadow: 0 12px 35px rgba(42, 108, 157, 0.07);
        }

        .photo-card {
          position: relative;
          overflow: hidden;
          padding: 30px 25px;
          text-align: center;
        }

        .card-top-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, #3182ce, #72c7f5);
        }

        .card-eyebrow {
          margin: 0;
          color: #7194ae;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .photo-wrapper {
          display: flex;
          justify-content: center;
          margin: 25px 0 18px;
        }

        .profile-photo,
        .photo-placeholder {
          width: 160px;
          height: 160px;
          box-sizing: border-box;
          border: 6px solid #edf7ff;
          border-radius: 50%;
          box-shadow: 0 8px 25px rgba(33, 91, 132, 0.15);
        }

        .profile-photo {
          object-fit: cover;
        }

        .photo-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3182ce, #76c8f2);
          color: white;
          font-size: 58px;
          font-weight: 700;
        }

        .photo-name {
          margin: 0 0 7px;
          color: #214b6c;
          font-size: 22px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .photo-role {
          margin: 0 0 24px;
          color: #7791a5;
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .upload-button {
          display: inline-block;
          max-width: 100%;
          box-sizing: border-box;
          padding: 12px 18px;
          border: 1px solid #cce7fa;
          border-radius: 12px;
          background: #e8f4ff;
          color: #2166a3;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .upload-button:hover {
          background: #d8edff;
          transform: translateY(-1px);
        }

        .upload-button.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .hidden-file-input {
          display: none;
        }

        .upload-help {
          margin: 13px 0 0;
          color: #8aa0b2;
          font-size: 12px;
          line-height: 1.6;
        }

        .photo-tip {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-top: 24px;
          padding: 13px;
          border: 1px solid #e0f0fa;
          border-radius: 12px;
          background: #f4faff;
          text-align: left;
        }

        .photo-tip p {
          margin: 0;
          color: #66829b;
          font-size: 12px;
          line-height: 1.6;
        }

        .form-card {
          padding: 32px;
        }

        .form-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .form-header h2 {
          margin: 8px 0 0;
          color: #214b6c;
          font-size: 25px;
          font-weight: 700;
        }

        .approved-badge {
          padding: 9px 13px;
          border-radius: 999px;
          background: #dcfce7;
          color: #16733a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.6px;
          white-space: nowrap;
        }

        .form-divider {
          height: 1px;
          margin: 25px 0;
          background: #e8f1f7;
        }

        .field-group {
          margin-bottom: 23px;
        }

        .field-group label {
          display: block;
          margin-bottom: 9px;
          color: #315672;
          font-size: 14px;
          font-weight: 700;
        }

        .field-group input,
        .field-group textarea {
          display: block;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border: 1px solid #d6e5ef;
          border-radius: 12px;
          background: #fbfdff;
          color: #244962;
          font-family: inherit;
          font-size: 14px;
        }

        .field-group input {
          min-height: 48px;
        }

        .field-group textarea {
          min-height: 140px;
          resize: vertical;
          line-height: 1.6;
        }

        .field-group input:focus,
        .field-group textarea:focus {
          outline: none;
          border-color: #3182ce;
          box-shadow: 0 0 0 4px rgba(49, 130, 206, 0.1);
        }

        .field-hint {
          margin: 8px 0 0;
          color: #8aa0b2;
          font-size: 12px;
          line-height: 1.5;
        }

        .message-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 22px;
          padding: 13px 15px;
          border-radius: 12px;
        }

        .message-box p {
          margin: 0;
          overflow-wrap: anywhere;
        }

        .message-box.success {
          border: 1px solid #bbf7d0;
          background: #ecfdf3;
          color: #166534;
        }

        .message-box.error {
          border: 1px solid #fecdd3;
          background: #fff1f2;
          color: #9f1239;
        }

        .form-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 10px;
        }

        .cancel-button,
        .form-actions button {
          display: inline-block;
          box-sizing: border-box;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          text-align: center;
          text-decoration: none;
          transition: 0.2s ease;
        }

        .cancel-button {
          border: 1px solid #d8e7f1;
          background: white;
          color: #5e7b92;
        }

        .form-actions button {
          border: none;
          background: #3182ce;
          color: white;
          cursor: pointer;
          box-shadow: 0 6px 15px rgba(49, 130, 206, 0.2);
        }

        .form-actions button:hover:not(:disabled) {
          background: #256caf;
          transform: translateY(-1px);
        }

        .form-actions button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .privacy-card {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          margin-top: 24px;
          padding: 22px;
          border: 1px solid #d8edf9;
          border-radius: 18px;
          background: #edf8ff;
        }

        .privacy-icon {
          display: grid;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 12px;
          background: white;
          font-size: 21px;
        }

        .privacy-card h2 {
          margin: 0 0 6px;
          color: #28516d;
          font-size: 16px;
        }

        .privacy-card p {
          margin: 0;
          color: #6b879c;
          font-size: 13px;
          line-height: 1.6;
        }

        @media (max-width: 850px) {
          .profile-layout {
            grid-template-columns: minmax(0, 1fr);
            gap: 20px;
          }

          .photo-card,
          .form-card {
            width: 100%;
          }

          .photo-card {
            padding: 28px 22px;
          }
        }

        @media (max-width: 550px) {
          .profile-page {
            padding: 30px 14px 50px;
          }

          .page-header {
            margin-bottom: 25px;
            text-align: center;
          }

          .page-header h1 {
            font-size: 34px;
          }

          .subtitle {
            font-size: 14px;
          }

          .photo-card,
          .form-card {
            border-radius: 18px;
          }

          .form-card {
            padding: 22px 17px;
          }

          .form-header {
            flex-direction: column;
            gap: 13px;
          }

          .form-header h2 {
            font-size: 21px;
          }

          .approved-badge {
            white-space: normal;
          }

          .form-actions {
            flex-direction: column-reverse;
            align-items: stretch;
          }

          .form-actions a,
          .form-actions button {
            width: 100%;
          }

          .privacy-card {
            padding: 17px;
          }
        }
      `}</style>
    </main>
  );
}
