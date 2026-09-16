import React, { useEffect, useState } from 'react';
import { getOrganizers, createEvent } from '../api';

export default function CreateEventPage() {
  const [organizers, setOrganizers] = useState([]);
  const [form, setForm] = useState({ organizerId: '', eventName: '', date: '', maximumCapacity: '' });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    getOrganizers().then(r => setOrganizers(r.data)).catch(() => {});
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await createEvent({
        organizerId: Number(form.organizerId),
        eventName: form.eventName,
        date: form.date,
        maximumCapacity: Number(form.maximumCapacity),
      });
      setMsg({ type: 'success', text: `Event "${res.data.eventName}" created (ID: ${res.data.eventId})` });
      setForm({ organizerId: '', eventName: '', date: '', maximumCapacity: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to create event.' });
    }
  };

  return (
    <div>
      <h1 className="page-title">Create Event</h1>
      <div className="card" style={{ maxWidth: 480 }}>
        {msg && <div className={`msg msg-${msg.type}`}>{msg.text}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Organizer</label>
            <select name="organizerId" value={form.organizerId} onChange={handleChange} required>
              <option value="">-- Select Organizer --</option>
              {organizers.map(o => (
                <option key={o.organizerId} value={o.organizerId}>
                  #{o.organizerId} — {o.user?.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Event Name</label>
            <input name="eventName" value={form.eventName} onChange={handleChange} required placeholder="e.g. Java Workshop" />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Maximum Capacity</label>
            <input type="number" name="maximumCapacity" value={form.maximumCapacity} onChange={handleChange} required min="1" />
          </div>
          <button className="btn btn-primary" type="submit">Create Event</button>
        </form>
      </div>
    </div>
  );
}
