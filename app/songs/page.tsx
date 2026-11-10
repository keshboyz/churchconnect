"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "./songs.css";

type Song = {
  id: string;
  title: string;
  artist: string | null;
  description: string | null;
  audio_url: string;
  cover_url: string | null;
  created_at: string;
};

export default function SongsPage() {
  const supabase = createClient();

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSongs();
  }, []);

  async function fetchSongs() {
    setLoading(true);

    const { data, error } = await supabase
      .from("songs")
      .select(
        "id, title, artist, description, audio_url, cover_url, created_at",
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching songs:", error);
    } else {
      setSongs(data || []);
    }

    setLoading(false);
  }

  const filteredSongs = songs.filter((song) => {
    const search = searchTerm.toLowerCase();

    return (
      song.title.toLowerCase().includes(search) ||
      song.artist?.toLowerCase().includes(search) ||
      song.description?.toLowerCase().includes(search)
    );
  });

  return (
    <main className="songs-page">
      <section className="songs-hero">
        <div>
          <p className="songs-eyebrow">ChurchConnect Music</p>
          <h1>Church Songs</h1>
          <p>
            Listen to worship songs, praise music, choir recordings, and other
            songs shared by our church community.
          </p>
        </div>
      </section>

      <section className="songs-content">
        <div className="songs-heading-row">
          <div>
            <h2>Music library</h2>
            <p>
              {songs.length} {songs.length === 1 ? "song" : "songs"} available
            </p>
          </div>

          <input
            type="search"
            placeholder="Search songs..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="songs-search"
          />
        </div>

        {loading ? (
          <div className="songs-message">Loading songs...</div>
        ) : filteredSongs.length === 0 ? (
          <div className="songs-empty">
            <div className="songs-empty-icon">♪</div>
            <h3>
              {searchTerm ? "No songs found" : "No songs available yet"}
            </h3>
            <p>
              {searchTerm
                ? "Try using a different search term."
                : "Songs uploaded by the church will appear here."}
            </p>
          </div>
        ) : (
          <div className="songs-grid">
            {filteredSongs.map((song) => (
              <article className="song-card" key={song.id}>
                <div className="song-cover">
                  {song.cover_url ? (
                    <img src={song.cover_url} alt={`${song.title} cover`} />
                  ) : (
                    <div className="song-cover-placeholder">♪</div>
                  )}
                </div>

                <div className="song-card-body">
                  <h3>{song.title}</h3>

                  {song.artist && (
                    <p className="song-artist">{song.artist}</p>
                  )}

                  {song.description && (
                    <p className="song-description">{song.description}</p>
                  )}

                  <audio
                    className="song-audio-player"
                    controls
                    preload="metadata"
                  >
                    <source src={song.audio_url} />
                    Your browser does not support audio playback.
                  </audio>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}