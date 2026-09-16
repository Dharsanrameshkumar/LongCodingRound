import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { getEvents, getBookingsByStudent, createBooking, cancelBooking, checkIn, checkOut } from '../api';

function AvailableEvents({ user }) {
  const [events, setEvents] = useState([]);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents()
      .then(r => setEvents(r.data.filter(e => e.status === 'OPEN')))
      .finally(() => setLoading(false));
  }, []);

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 4000); };

  const book = async (eventId) => {
    try {
      await createBooking({ studentId: user.profileId, eventId });
      flash('success', 'Booking created successfully! Status: ABSENT');
    } catch (err) {
      flash('error', err.response?.data?.error || 'Booking failed.');
    }
  };

  if (loading) return <p style={{ color: '#888' }}>Loading events…</p>;

  return (
    <div>
      <h2 className="section-title">Available Events</h2>
      {msg && <div className={`msg msg-${msg.type}`}>{msg.text}</div>}
      {events.length === 0
        ? <p className="empty">No open events available right now.</p>
        : (
          <div className="event-grid">
            {events.map(e => {
              const booked = e.maximumCapacity;
              return (
                <div className="event-card" key={e.eventId}>
                  <h3>{e.eventName}</h3>
                  <div className="meta">Date: <span>{e.date}</span></div>
                  <div className="meta">Capacity: <span>{e.maximumCapacity}</span></div>
                  <div className="meta" style={{ marginBottom: 14 }}>
                    Status: <span className={`badge badge-${e.status?.toLowerCase()}`}>{e.status}</span>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => book(e.eventId)}>
                    Book Event
                  </button>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}

function MyBooking({ user }) {
  const [bookings, setBookings] = useState([]);
  const [msg, setMsg] = useState(null);

  const load = () => {
    getBookingsByStudent(user.profileId).then(r => setBookings(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 4000); };

  const act = async (action, id) => {
    try {
      if (action === 'checkin') await checkIn(id);
      else if (action === 'checkout') await checkOut(id);
      else if (action === 'cancel') await cancelBooking(id);
      flash('success', 'Action completed successfully.');
      load();
    } catch (err) {
      flash('error', err.response?.data?.error || 'Action failed.');
    }
  };

  return (
    <div>
      <h2 className="section-title">My Booking</h2>
      {msg && <div className={`msg msg-${msg.type}`}>{msg.text}</div>}
      {bookings.length === 0
        ? <p className="empty">You have no bookings yet. Go to Events to book one.</p>
        : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.bookingId}>
                    <td>#{b.bookingId}</td>
                    <td>{b.event?.eventName}</td>
                    <td>{b.event?.date}</td>
                    <td><span className={`badge badge-${b.status?.toLowerCase()}`}>{b.status}</span></td>
                    <td>{b.checkInTime ? new Date(b.checkInTime).toLocaleString() : '—'}</td>
                    <td>{b.checkOutTime ? new Date(b.checkOutTime).toLocaleString() : '—'}</td>
                    <td>
                      <div className="actions">
                        {b.status === 'ABSENT' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => act('checkin', b.bookingId)}>
                              Check In
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => act('cancel', b.bookingId)}>
                              Cancel
                            </button>
                          </>
                        )}
                        {b.status === 'PRESENT' && !b.checkOutTime && (
                          <button className="btn btn-warning btn-sm" onClick={() => act('checkout', b.bookingId)}>
                            Check Out
                          </button>
                        )}
                        {b.status === 'CANCELLED' && <span style={{ color: '#aaa', fontSize: '.8rem' }}>Cancelled</span>}
                        {b.status === 'PRESENT' && b.checkOutTime && <span style={{ color: '#16a34a', fontSize: '.8rem' }}>Completed</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}

export default function StudentDashboard({ user }) {
  return (
    <div className="content">
      <div className="dash-header">
        <div>
          <div className="page-title">Student Dashboard</div>
          <div className="dash-welcome">Welcome, <strong>{user.name}</strong></div>
        </div>
      </div>

      <Routes>
        <Route index element={<AvailableEvents user={user} />} />
        <Route path="my-booking" element={<MyBooking user={user} />} />
      </Routes>
    </div>
  );
}
