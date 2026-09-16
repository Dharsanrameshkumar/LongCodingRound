import React, { useEffect, useState } from 'react';
import { getEvents } from '../api';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getEvents()
      .then(r => setEvents(r.data))
      .catch(() => setError('Failed to load events.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading events...</p>;

  return (
    <div>
      <h1 className="page-title">Events</h1>
      {error && <div className="msg msg-error">{error}</div>}
      {events.length === 0 ? (
        <div className="card"><p>No events found. Create one first.</p></div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Event Name</th>
                <th>Date</th>
                <th>Organizer</th>
                <th>Capacity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.eventId}>
                  <td>{e.eventId}</td>
                  <td>{e.eventName}</td>
                  <td>{e.date}</td>
                  <td>{e.organizer?.user?.name || e.organizer?.organizerId}</td>
                  <td>{e.maximumCapacity}</td>
                  <td>
                    <span className={`badge badge-${e.status?.toLowerCase()}`}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
