"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  status: string;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
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
      .from("events")
      .select(
        "id, title, description, event_date, start_time, end_time, location, status"
      )
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Admin events error:", error);
      setErrorMessage("Unable to load events.");
    } else {
      setEvents(data || []);
    }

    setLoading(false);
  }

  async function handleCreateEvent() {
    setMessage("");
    setErrorMessage("");

    if (!title.trim() || !eventDate) {
      setErrorMessage("Please enter an event title and date.");
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

    const { error } = await supabase.from("events").insert({
      title: title.trim(),
      description: description.trim() || null,
      event_date: eventDate,
      start_time: startTime || null,
      end_time: endTime || null,
      location: location.trim() || null,
      status: "approved",
      created_by: user.id,
    });

    if (error) {
      console.error("Create event error:", error);
      setErrorMessage("Unable to create event.");
    } else {
      setMessage("Event created successfully.");

      setTitle("");
      setDescription("");
      setEventDate("");
      setStartTime("");
      setEndTime("");
      setLocation("");

      await loadEvents();
    }

    setSaving(false);
  }

  async function handleDeleteEvent(eventId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error("Delete event error:", error);
      setErrorMessage("Unable to delete event.");
    } else {
      setEvents((currentEvents) =>
        currentEvents.filter((event) => event.id !== eventId)
      );
      setMessage("Event deleted successfully.");
    }
  }

  return (
    <main>
      <div className="page-container admin-events-page">
        <section className="admin-page-header">
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>Manage events</h1>
          <p>
            Create and manage church events that will appear on the public
            Events page.
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

        <section className="admin-event-form-card">
          <div className="admin-section-heading">
            <h2>Create a new event</h2>
            <p>Enter the details of the upcoming church activity.</p>
          </div>

          <div className="admin-form-grid">
            <div className="form-field form-field-full">
              <label htmlFor="event-title">Event title</label>
              <input
                id="event-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Sunday Worship Service"
              />
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="event-description">
                Description
              </label>
              <textarea
                id="event-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe the event..."
                rows={4}
              />
            </div>

            <div className="form-field">
              <label htmlFor="event-date">Date</label>
              <input
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="event-location">Location</label>
              <input
                id="event-location"
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Example: Main Sanctuary"
              />
            </div>

            <div className="form-field">
              <label htmlFor="event-start-time">
                Start time
              </label>
              <input
                id="event-start-time"
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="event-end-time">End time</label>
              <input
                id="event-end-time"
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={handleCreateEvent}
            disabled={saving}
          >
            {saving ? "Creating event..." : "Create event"}
          </button>
        </section>

        <section className="admin-events-list-section">
          <div className="admin-section-heading">
            <h2>Existing events</h2>
            <p>Review or remove events from the calendar.</p>
          </div>

          {loading ? (
            <section className="notice-card">
              <h2>Loading events...</h2>
            </section>
          ) : events.length === 0 ? (
            <section className="empty-card">
              <h2>No events created yet</h2>
              <p>Create your first event using the form above.</p>
            </section>
          ) : (
            <div className="admin-events-table-wrapper">
              <table className="admin-events-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>{event.title}</td>
                      <td>{event.event_date}</td>
                      <td>{event.location || "Not specified"}</td>
                      <td>
                        <span className="admin-event-status">
                          {event.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}