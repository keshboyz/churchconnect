"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

type Song = {
  id: string;
  title: string;
  artist: string | null;
  description: string | null;
  audio_url: string;
  status: string;
};

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);

  useEffect(() => {
    loadSongs();
  }, []);

  async function loadSongs() {
    const supabase = createClient();

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
      .single();

    if (!adminRecord) {
      setErrorMessage("You do not have permission to access this page.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("songs")
      .select(
        "id, title, artist, description, audio_url, status"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load songs error:", error);
      setErrorMessage("Unable to load songs.");
    } else {
      setSongs(data || []);
    }

    setLoading(false);
  }

  async function handleUploadSong() {
    setMessage("");
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Please enter a song title.");
      return;
    }

    if (!audioFile) {
      setErrorMessage("Please select an audio file.");
      return;
    }

    if (!audioFile.type.startsWith("audio/")) {
      setErrorMessage("Please select a valid audio file.");
      return;
    }

    const maxSize = 50 * 1024 * 1024;

    if (audioFile.size > maxSize) {
      setErrorMessage("The audio file must be smaller than 50 MB.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("You must be logged in.");
      setSaving(false);
      return;
    }

    const fileExtension =
      audioFile.name.split(".").pop()?.toLowerCase() || "mp3";

    const safeTitle = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const filePath = `${Date.now()}-${safeTitle}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("audio")
      .upload(filePath, audioFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Audio upload error:", uploadError);
      setErrorMessage(
        "Unable to upload the audio file. Check your Storage policies."
      );
      setSaving(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("audio")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase
      .from("songs")
      .insert({
        title: title.trim(),
        artist: artist.trim() || null,
        description: description.trim() || null,
        audio_url: publicUrl,
        status: "approved",
        created_by: user.id,
      });

    if (insertError) {
      console.error("Song database error:", insertError);

      await supabase.storage
        .from("audio")
        .remove([filePath]);

      setErrorMessage(
        "The audio uploaded, but the song record could not be saved."
      );
    } else {
      setMessage("Song uploaded successfully.");

      setTitle("");
      setArtist("");
      setDescription("");
      setAudioFile(null);

      const fileInput = document.getElementById(
        "audio-file"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      await loadSongs();
    }

    setSaving(false);
  }

  async function handleDeleteSong(song: Song) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this song?"
    );

    if (!confirmed) return;

    const supabase = createClient();

    const fileUrl = song.audio_url;
    const audioMarker = "/storage/v1/object/public/audio/";

    const markerIndex = fileUrl.indexOf(audioMarker);

    if (markerIndex !== -1) {
      const filePath = fileUrl.substring(
        markerIndex + audioMarker.length
      );

      await supabase.storage.from("audio").remove([filePath]);
    }

    const { error } = await supabase
      .from("songs")
      .delete()
      .eq("id", song.id);

    if (error) {
      console.error("Delete song error:", error);
      setErrorMessage("Unable to delete song.");
    } else {
      setSongs((currentSongs) =>
        currentSongs.filter((item) => item.id !== song.id)
      );
      setMessage("Song deleted successfully.");
    }
  }

  return (
    <main>
      <div className="page-container admin-songs-page">
        <section className="admin-page-header">
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>Manage worship songs</h1>
          <p>
            Upload worship audio files and make them available to church
            members.
          </p>
        </section>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}

        <section className="admin-song-form-card">
          <div className="admin-section-heading">
            <h2>Upload a worship song</h2>
            <p>
              Select an audio file from your computer and add its details.
            </p>
          </div>

          <div className="admin-form-grid">
            <div className="form-field">
              <label htmlFor="song-title">Song title</label>
              <input
                id="song-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Great Is Thy Faithfulness"
              />
            </div>

            <div className="form-field">
              <label htmlFor="song-artist">
                Artist or worship team
              </label>
              <input
                id="song-artist"
                type="text"
                value={artist}
                onChange={(event) => setArtist(event.target.value)}
                placeholder="Example: Church Worship Team"
              />
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="song-description">
                Description
              </label>
              <textarea
                id="song-description"
                rows={4}
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Add a short description..."
              />
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="audio-file">Audio file</label>
              <input
                id="audio-file"
                type="file"
                accept="audio/*"
                onChange={(event) =>
                  setAudioFile(event.target.files?.[0] || null)
                }
              />

              <small className="form-help-text">
                Maximum file size: 50 MB.
              </small>
            </div>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={handleUploadSong}
            disabled={saving}
          >
            {saving ? "Uploading song..." : "Upload song"}
          </button>
        </section>

        <section className="admin-songs-list-section">
          <div className="admin-section-heading">
            <h2>Uploaded songs</h2>
            <p>Manage the worship audio available on the platform.</p>
          </div>

          {loading ? (
            <section className="notice-card">
              <h2>Loading songs...</h2>
            </section>
          ) : songs.length === 0 ? (
            <section className="empty-card">
              <h2>No songs uploaded yet</h2>
              <p>Upload your first worship song using the form above.</p>
            </section>
          ) : (
            <div className="admin-songs-list">
              {songs.map((song) => (
                <article className="admin-song-row" key={song.id}>
                  <div className="admin-song-row-information">
                    <h3>{song.title}</h3>
                    <p>{song.artist || "Artist not specified"}</p>
                  </div>

                  <audio
                    controls
                    src={song.audio_url}
                    className="admin-audio-player"
                  />

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDeleteSong(song)}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}