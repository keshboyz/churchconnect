"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  image_url: string | null;
};

function formatEventDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return {
    day: date.toLocaleDateString("en-GB", { day: "2-digit" }),
    month: date.toLocaleDateString("en-GB", { month: "short" }),
    weekday: date.toLocaleDateString("en-GB", { weekday: "long" }),
    fullDate: date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}

function formatTime(time: string | null) {
  if (!time) return "";

  const [hours, minutes] = time.split(":");
  const date = new Date();

  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadEvents() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("events")
        .select(
          "id, title, description, event_date, start_time, end_time, location, image_url"
        )
        .eq("status", "approved")
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Events error:", error);
        setErrorMessage("Unable to load events at the moment.");
      } else {
        setEvents(data || []);
      }

      setLoading(false);
    }

    loadEvents();
  }, []);

  return (
    <main className="church-events-page">
      <div className="events-container">
        <section className="events-hero">
          <div className="events-hero-content">
            <span className="events-kicker">CHURCHCONNECT / WHAT'S ON</span>
            <h1>
              Moments that
              <br />
              <span>bring us together.</span>
            </h1>
            <p>
              From worship and fellowship to serving our community,
              discover what's happening and find your next opportunity
              to connect.
            </p>
            <a href="#events-list" className="events-hero-link">
              Explore church events <span>↓</span>
            </a>
          </div>

          <div className="events-hero-side">
            <div className="events-hero-symbol">✦</div>
            <p>Come together.</p>
            <span>Worship · Connect · Grow</span>
          </div>
        </section>

        <section className="events-section" id="events-list">
          <div className="events-section-heading">
            <div>
              <span className="events-kicker">SAVE YOUR PLACE</span>
              <h2>Church calendar</h2>
              <p>
                Make time for the moments that matter.
              </p>
            </div>

            <div className="events-total">
              <strong>{events.length}</strong>
              <span>{events.length === 1 ? "Event" : "Events"}</span>
            </div>
          </div>

          {loading && (
            <div className="events-state-card">
              <div className="directory-spinner" />
              <h3>Loading the calendar</h3>
              <p>Just a moment while we gather the latest events.</p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="events-state-card events-state-error">
              <span className="events-state-icon">!</span>
              <h3>Events unavailable</h3>
              <p>{errorMessage}</p>
            </div>
          )}

          {!loading && !errorMessage && events.length === 0 && (
            <div className="events-state-card">
              <span className="events-state-icon">✦</span>
              <h3>Nothing on the calendar just yet</h3>
              <p>
                There are currently no approved events. Please check back
                soon for updates from our church community.
              </p>
              <Link href="/" className="events-return-link">
                Return home <span>→</span>
              </Link>
            </div>
          )}

          {!loading && !errorMessage && events.length > 0 && (
            <div className="events-grid">
              {events.map((event) => {
                const dateInfo = formatEventDate(event.event_date);

                return (
                  <article className="church-event-card" key={event.id}>
                    <div className="church-event-image-wrap">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="church-event-image"
                        />
                      ) : (
                        <div className="church-event-image-placeholder">
                          <span>✦</span>
                          <p>CHURCHCONNECT</p>
                        </div>
                      )}

                      <div className="church-event-date">
                        <strong>{dateInfo.day}</strong>
                        <span>{dateInfo.month}</span>
                      </div>
                    </div>

                    <div className="church-event-content">
                      <span className="church-event-weekday">
                        {dateInfo.weekday}
                      </span>

                      <h3>{event.title}</h3>

                      {event.description && (
                        <p className="church-event-description">
                          {event.description}
                        </p>
                      )}

                      <div className="church-event-divider" />

                      <div className="church-event-meta">
                        <div>
                          <span className="church-event-meta-icon">▦</span>
                          <span>{dateInfo.fullDate}</span>
                        </div>

                        {(event.start_time || event.end_time) && (
                          <div>
                            <span className="church-event-meta-icon">◷</span>
                            <span>
                              {formatTime(event.start_time)}
                              {event.end_time &&
                                ` – ${formatTime(event.end_time)}`}
                            </span>
                          </div>
                        )}

                        {event.location && (
                          <div>
                            <span className="church-event-meta-icon">⌖</span>
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="church-event-card-footer">
                      <span>Be part of it</span>
                      <span>✦</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="events-bottom-cta">
          <div>
            <span className="events-kicker">LIFE IS BETTER TOGETHER</span>
            <h2>We look forward to seeing you.</h2>
            <p>
              Join us for worship, fellowship, and the opportunity to
              build meaningful connections.
            </p>
          </div>

          <Link href="/community" className="events-cta-button">
            Meet the community <span>→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}