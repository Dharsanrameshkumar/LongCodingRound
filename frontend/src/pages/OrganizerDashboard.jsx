import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { createEvent, getEventsByOrganizer, getEventSummary } from '../api';

function CreateEventSection({ user, onCreated }) {
  const [form, setForm] = useState({ eventName: '', date: '', maximumCapacity: '' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 5000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createEvent({
        organizerId: user.profileId,
        eventName: form.eventName,
        date: form.date,
        maximumCapacity: Number(form.maximumCapacity),
      });
      flash('success', `Event "${res.data.eventName}" created! ID: ${res.data.eventId}`);
      setForm({ eventName: '', date: '', maximumCapacity: '' });
      onCreated();
    } catch (err) {
      flash('error', err.response?.data?.error || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h2 className="section-title">Create Event</h2>
      {msg && <div className={`msg msg-${msg.type}`}>{msg.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Event Name</label>
          <input value={form.eventName} onChange={e => set('eventName', e.target.value)}
            placeholder="e.g. Java Workshop" required />
        </div>
        <div className="form-group">
          <label>Event Date</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Maximum Capacity</label>
          <input type="number" min="1" value={form.maximumCapacity}
            onChange={e => set('maximumCapacity', e.target.value)} required />
        </div>
        <button className="btn btn-purple" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}

function MyEventsSection({ events }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '18px 22px 10px' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>My Events</h2>
      </div>
      {events.length === 0
        ? <p className="empty" style={{ padding: 24 }}>No events yet. Create your first event above.</p>
        : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Event Name</th>
                <th>Date</th>
                <th>Capacity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.eventId}>
                  <td>#{e.eventId}</td>
                  <td>{e.eventName}</td>
                  <td>{e.date}</td>
                  <td>{e.maximumCapacity}</td>
                  <td><span className={`badge badge-${e.status?.toLowerCase()}`}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
    </div>
  );
}

function CreateAndMyEvents({ user }) {
  const [events, setEvents] = useState([]);

  const loadEvents = () => {
    getEventsByOrganizer(user.profileId).then(r => setEvents(r.data)).catch(() => {});
  };

  useEffect(() => { loadEvents(); }, []);

  return (
    <>
      <CreateEventSection user={user} onCreated={loadEvents} />
      <MyEventsSection events={events} />
    </>
  );
}

function EventSummarySection({ user }) {
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [summary, setSummary] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getEventsByOrganizer(user.profileId).then(r => setEvents(r.data)).catch(() => {});
  }, []);

  const handleSelect = async (e) => {
    const id = e.target.value;
    setSelectedId(id);
    setSummary(null);
    setMsg('');
    if (!id) return;
    try {
      const r = await getEventSummary(id);
      setSummary(r.data);
    } catch {
      setMsg('Failed to load summary.');
    }
  };

  return (
    <div>
      <div className="card" style={{ maxWidth: 400 }}>
        <h2 className="section-title">Event Summary</h2>
        <div className="form-group">
          <label>Select Event</label>
          <select value={selectedId} onChange={handleSelect}>
            <option value="">-- Select one of your events --</option>
            {events.map(e => (
              <option key={e.eventId} value={e.eventId}>#{e.eventId} — {e.eventName}</option>
            ))}
          </select>
        </div>
      </div>

      {msg && <div className="msg msg-error">{msg}</div>}

      {summary && (
        <>
          <div className="card">
            <h2 style={{ marginBottom: 6 }}>{summary.eventName}</h2>
            <p style={{ color: '#666' }}>
              Date: {summary.date} &nbsp;|&nbsp;
              Status: <span className={`badge badge-${summary.status?.toLowerCase()}`}>{summary.status}</span>
            </p>
          </div>
          <div className="stat-grid">
            {[
              { num: summary.maximumCapacity, lbl: 'Max Capacity' },
              { num: summary.totalBookings,   lbl: 'Registered' },
              { num: summary.presentCount,    lbl: 'Checked In' },
              { num: summary.absentCount,     lbl: 'Absent' },
              { num: summary.cancelledCount,  lbl: 'Cancelled' },
              { num: summary.availableSlots,  lbl: 'Available' },
            ].map(s => (
              <div className="stat-box" key={s.lbl}>
                <div className="num">{s.num}</div>
                <div className="lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function OrganizerDashboard({ user }) {
  return (
    <div className="content">
      <div className="dash-header">
        <div>
          <div className="page-title">Organizer Dashboard</div>
          <div className="dash-welcome">Welcome, <strong>{user.name}</strong></div>
        </div>
      </div>

      <Routes>
        <Route index element={<CreateAndMyEvents user={user} />} />
        <Route path="my-events" element={<CreateAndMyEvents user={user} />} />
        <Route path="summary" element={<EventSummarySection user={user} />} />
      </Routes>
    </div>
  );
}
