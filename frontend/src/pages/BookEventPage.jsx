import React, { useEffect, useState } from 'react';
import { getStudents, getEvents, createBooking } from '../api';

export default function BookEventPage() {
  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ studentId: '', eventId: '' });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    getStudents().then(r => setStudents(r.data)).catch(() => {});
    getEvents().then(r => setEvents(r.data.filter(e => e.status === 'OPEN'))).catch(() => {});
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await createBooking({ studentId: Number(form.studentId), eventId: Number(form.eventId) });
      setMsg({ type: 'success', text: `Booking created (ID: ${res.data.bookingId}) — Status: ${res.data.status}` });
      setForm({ studentId: '', eventId: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Booking failed.' });
    }
  };

  return (
    <div>
      <h1 className="page-title">Book Event</h1>
      <div className="card" style={{ maxWidth: 480 }}>
        {msg && <div className={`msg msg-${msg.type}`}>{msg.text}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Student</label>
            <select name="studentId" value={form.studentId} onChange={handleChange} required>
              <option value="">-- Select Student --</option>
              {students.map(s => (
                <option key={s.studentId} value={s.studentId}>
                  #{s.studentId} — {s.user?.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Event (OPEN only)</label>
            <select name="eventId" value={form.eventId} onChange={handleChange} required>
              <option value="">-- Select Event --</option>
              {events.map(e => (
                <option key={e.eventId} value={e.eventId}>
                  #{e.eventId} — {e.eventName} ({e.date})
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" type="submit">Book Now</button>
        </form>
      </div>
    </div>
  );
}
