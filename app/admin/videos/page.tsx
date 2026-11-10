"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "./videos.css";

type Video = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
};

export default function AdminVideosPage() {
  const supabase = createClient();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
      console.error("Admin check error:", error);
    }

    if (adminRecord) {
      setIsAdmin(true);
      await fetchVideos();
    }

    setCheckingAdmin(false);
  }

  async function fetchVideos() {
    setLoadingVideos(true);

    const { data, error } = await supabase
      .from("videos")
      .select(
        "id, title, description, video_url, thumbnail_url, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching videos:", error);
      setErrorMessage("Unable to load videos.");
    } else {
      setVideos(data || []);
    }

    setLoadingVideos(false);
  }

  function handleVideoChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] || null;

    setErrorMessage("");
    setMessage("");

    if (!file) {
      setVideoFile(null);
      return;
    }

    if (!file.type.startsWith("video/")) {
      setErrorMessage("Please select a valid video file.");
      event.target.value = "";
      setVideoFile(null);
      return;
    }

    const maxSize = 200 * 1024 * 1024;

    if (file.size > maxSize) {
      setErrorMessage("Video file must be smaller than 200 MB.");
      event.target.value = "";
      setVideoFile(null);
      return;
    }

    setVideoFile(file);
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Please enter a video title.");
      return;
    }

    if (!videoFile) {
      setErrorMessage("Please select a video file.");
      return;
    }

    setUploading(true);

    const fileExtension =
      videoFile.name.split(".").pop()?.toLowerCase() || "mp4";

    const safeTitle = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const fileName = `${Date.now()}-${safeTitle}.${fileExtension}`;

    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(filePath, videoFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: videoFile.type,
      });

    if (uploadError) {
      console.error("Video upload error:", uploadError);
      setErrorMessage(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("videos")
      .getPublicUrl(filePath);

    const videoUrl = publicUrlData.publicUrl;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("videos").insert({
      title: title.trim(),
      description: description.trim() || null,
      video_url: videoUrl,
      status: "approved",
      created_by: user?.id || null,
    });

    if (insertError) {
      console.error("Database insert error:", insertError);

      await supabase.storage.from("videos").remove([filePath]);

      setErrorMessage(insertError.message);
      setUploading(false);
      return;
    }

    setTitle("");
    setDescription("");
    setVideoFile(null);

    const fileInput = document.getElementById(
      "video-file",
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }

    setMessage("Video uploaded successfully.");
    await fetchVideos();

    setUploading(false);
  }

  async function handleDelete(video: Video) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${video.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setErrorMessage("");

    const videoPath = getStoragePath(video.video_url);

    if (videoPath) {
      const { error: storageError } = await supabase.storage
        .from("videos")
        .remove([videoPath]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
      }
    }

    const { error: deleteError } = await supabase
      .from("videos")
      .delete()
      .eq("id", video.id);

    if (deleteError) {
      console.error("Database delete error:", deleteError);
      setErrorMessage(deleteError.message);
      return;
    }

    setVideos((currentVideos) =>
      currentVideos.filter((item) => item.id !== video.id),
    );

    setMessage("Video deleted successfully.");
  }

  function getStoragePath(videoUrl: string) {
    const marker = "/storage/v1/object/public/videos/";

    const markerIndex = videoUrl.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(
      videoUrl.substring(markerIndex + marker.length),
    );
  }

  if (checkingAdmin) {
    return (
      <main className="admin-videos-page">
        <div className="admin-videos-message">
          Checking administrator access...
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="admin-videos-page">
        <div className="admin-videos-message">
          <h2>Access denied</h2>
          <p>You must be an administrator to manage videos.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-videos-page">
      <section className="admin-videos-header">
        <div>
          <p className="admin-videos-eyebrow">Content management</p>
          <h1>Manage Videos</h1>
          <p>
            Upload and manage church sermons, worship recordings, teachings,
            and community videos.
          </p>
        </div>
      </section>

      <section className="admin-videos-content">
        <div className="admin-video-form-card">
          <div className="admin-section-heading">
            <div>
              <h2>Upload a video</h2>
              <p>Add a video to the public church video library.</p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="admin-video-form">
            <div className="admin-form-field">
              <label htmlFor="video-title">Video title</label>
              <input
                id="video-title"
                type="text"
                placeholder="For example: Sunday Worship Service"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="video-description">
                Description <span>Optional</span>
              </label>
              <textarea
                id="video-description"
                placeholder="Briefly describe this video..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="video-file">Video file</label>
              <input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                required
              />
              <p className="admin-form-help">
                Supported video formats depend on your browser. Maximum file
                size: 200 MB.
              </p>

              {videoFile && (
                <p className="selected-video-file">
                  Selected: <strong>{videoFile.name}</strong>
                </p>
              )}
            </div>

            {message && <div className="admin-success-message">{message}</div>}

            {errorMessage && (
              <div className="admin-error-message">{errorMessage}</div>
            )}

            <button
              type="submit"
              className="admin-upload-button"
              disabled={uploading}
            >
              {uploading ? "Uploading video..." : "Upload video"}
            </button>
          </form>
        </div>

        <section className="admin-videos-list-section">
          <div className="admin-section-heading">
            <div>
              <h2>Uploaded videos</h2>
              <p>
                {videos.length}{" "}
                {videos.length === 1 ? "video" : "videos"} in your library
              </p>
            </div>
          </div>

          {loadingVideos ? (
            <div className="admin-videos-message">Loading videos...</div>
          ) : videos.length === 0 ? (
            <div className="admin-videos-empty">
              <div className="admin-videos-empty-icon">▶</div>
              <h3>No videos uploaded yet</h3>
              <p>Uploaded videos will appear here.</p>
            </div>
          ) : (
            <div className="admin-videos-list">
              {videos.map((video) => (
                <article className="admin-video-row" key={video.id}>
                  <div className="admin-video-preview">
                    <video controls preload="metadata">
                      <source src={video.video_url} />
                      Your browser does not support video playback.
                    </video>
                  </div>

                  <div className="admin-video-information">
                    <h3>{video.title}</h3>

                    {video.description && (
                      <p>{video.description}</p>
                    )}

                    <span>
                      Uploaded{" "}
                      {new Date(video.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="admin-delete-video-button"
                    onClick={() => handleDelete(video)}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}