import React, { useEffect, useState } from 'react';
import { getEvents, getEventSummary } from '../api';

export default function EventSummaryPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [summary, setSummary] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getEvents().then(r => setEvents(r.data)).catch(() => {});
  }, []);

  const handleSelect = async e => {
    setSelectedEvent(e.target.value);
    setSummary(null);
    setMsg('');
    if (!e.target.value) return;
    try {
      const r = await getEventSummary(e.target.value);
      setSummary(r.data);
    } catch {
      setMsg('Failed to load summary.');
    }
  };

  return (
    <div>
      <h1 className="page-title">Event Summary</h1>
      <div className="card" style={{ maxWidth: 400, marginBottom: 20 }}>
        <div className="form-group">
          <label>Select Event</label>
          <select value={selectedEvent} onChange={handleSelect}>
            <option value="">-- Select Event --</option>
            {events.map(e => (
              <option key={e.eventId} value={e.eventId}>
                #{e.eventId} — {e.eventName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {msg && <div className="msg msg-error">{msg}</div>}

      {summary && (
        <>
          <div className="card">
            <h2 style={{ marginBottom: 8 }}>{summary.eventName}</h2>
            <p style={{ color: '#666', marginBottom: 16 }}>Date: {summary.date} &nbsp;|&nbsp; Status: <span className={`badge badge-${summary.status?.toLowerCase()}`}>{summary.status}</span></p>
          </div>
          <div className="stat-grid">
            <div className="stat-box">
              <div className="num">{summary.maximumCapacity}</div>
              <div className="lbl">Total Capacity</div>
            </div>
            <div className="stat-box">
              <div className="num">{summary.totalBookings}</div>
              <div className="lbl">Active Bookings</div>
            </div>
            <div className="stat-box">
              <div className="num">{summary.presentCount}</div>
              <div className="lbl">Present</div>
            </div>
            <div className="stat-box">
              <div className="num">{summary.absentCount}</div>
              <div className="lbl">Absent</div>
            </div>
            <div className="stat-box">
              <div className="num">{summary.cancelledCount}</div>
              <div className="lbl">Cancelled</div>
            </div>
            <div className="stat-box">
              <div className="num">{summary.availableSlots}</div>
              <div className="lbl">Available Slots</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
