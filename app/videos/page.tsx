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

export default function VideosPage() {
  const supabase = createClient();

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    setLoading(true);

    const { data, error } = await supabase
      .from("videos")
      .select(
        "id, title, description, video_url, thumbnail_url, created_at",
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching videos:", error);
    } else {
      setVideos(data || []);
    }

    setLoading(false);
  }

  const filteredVideos = videos.filter((video) => {
    const search = searchTerm.toLowerCase();

    return (
      video.title.toLowerCase().includes(search) ||
      video.description?.toLowerCase().includes(search)
    );
  });

  return (
    <main className="public-videos-page">
      <section className="videos-hero">
        <div className="videos-hero-content">
          <p className="videos-eyebrow">ChurchConnect Media</p>

          <h1>Church Videos</h1>

          <p>
            Watch sermons, worship services, teachings, testimonies, and other
            videos shared by our church community.
          </p>
        </div>
      </section>

      <section className="videos-content">
        <div className="videos-heading-row">
          <div>
            <p className="videos-section-label">Media library</p>
            <h2>Watch and grow together</h2>
            <p className="videos-count">
              {videos.length}{" "}
              {videos.length === 1 ? "video" : "videos"} available
            </p>
          </div>

          <input
            type="search"
            className="videos-search"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        {loading ? (
          <div className="videos-message">Loading videos...</div>
        ) : filteredVideos.length === 0 ? (
          <div className="videos-empty">
            <div className="videos-empty-icon">▶</div>

            <h3>
              {searchTerm ? "No videos found" : "No videos available yet"}
            </h3>

            <p>
              {searchTerm
                ? "Try using a different search term."
                : "Uploaded church videos will appear here."}
            </p>
          </div>
        ) : (
          <div className="videos-grid">
            {filteredVideos.map((video) => (
              <article className="public-video-card" key={video.id}>
                <div className="public-video-player-wrapper">
                  <video
                    className="public-video-player"
                    controls
                    preload="metadata"
                    poster={video.thumbnail_url || undefined}
                  >
                    <source src={video.video_url} />
                    Your browser does not support video playback.
                  </video>
                </div>

                <div className="public-video-card-body">
                  <div className="public-video-tag">Video</div>

                  <h3>{video.title}</h3>

                  {video.description && (
                    <p className="public-video-description">
                      {video.description}
                    </p>
                  )}

                  <div className="public-video-footer">
                    <span>
                      {new Date(video.created_at).toLocaleDateString()}
                    </span>

                    <span className="public-video-watch-label">
                      Watch anytime
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && filteredVideos.length > 0 && (
          <div className="videos-bottom-note">
            <span></span>
            <p>More church videos coming soon</p>
            <span></span>
          </div>
        )}
      </section>
    </main>
  );
}