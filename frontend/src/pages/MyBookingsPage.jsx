import React, { useEffect, useState } from 'react';
import { getStudents, getBookingsByStudent, checkIn, checkOut, cancelBooking } from '../api';

export default function MyBookingsPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [bookings, setBookings] = useState([]);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    getStudents().then(r => setStudents(r.data)).catch(() => {});
  }, []);

  const loadBookings = async (studentId) => {
    try {
      const r = await getBookingsByStudent(studentId);
      setBookings(r.data);
    } catch {
      setMsg({ type: 'error', text: 'Failed to load bookings.' });
    }
  };

  const handleStudentChange = e => {
    setSelectedStudent(e.target.value);
    setMsg(null);
    setBookings([]);
    if (e.target.value) loadBookings(e.target.value);
  };

  const act = async (action, id) => {
    setMsg(null);
    try {
      if (action === 'checkin') await checkIn(id);
      else if (action === 'checkout') await checkOut(id);
      else if (action === 'cancel') await cancelBooking(id);
      setMsg({ type: 'success', text: 'Action completed successfully.' });
      loadBookings(selectedStudent);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Action failed.' });
    }
  };

  return (
    <div>
      <h1 className="page-title">My Bookings</h1>
      <div className="card" style={{ maxWidth: 400, marginBottom: 20 }}>
        <div className="form-group">
          <label>Select Student</label>
          <select value={selectedStudent} onChange={handleStudentChange}>
            <option value="">-- Select Student --</option>
            {students.map(s => (
              <option key={s.studentId} value={s.studentId}>
                #{s.studentId} — {s.user?.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {msg && <div className={`msg msg-${msg.type}`}>{msg.text}</div>}

      {bookings.length > 0 && (
        <div className="card">
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
                  <td>{b.bookingId}</td>
                  <td>{b.event?.eventName}</td>
                  <td>{b.event?.date}</td>
                  <td><span className={`badge badge-${b.status?.toLowerCase()}`}>{b.status}</span></td>
                  <td>{b.checkInTime ? new Date(b.checkInTime).toLocaleTimeString() : '—'}</td>
                  <td>{b.checkOutTime ? new Date(b.checkOutTime).toLocaleTimeString() : '—'}</td>
                  <td>
                    <div className="actions">
                      {b.status === 'ABSENT' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => act('checkin', b.bookingId)}>Check In</button>
                          <button className="btn btn-danger btn-sm" onClick={() => act('cancel', b.bookingId)}>Cancel</button>
                        </>
                      )}
                      {b.status === 'PRESENT' && !b.checkOutTime && (
                        <button className="btn btn-warning btn-sm" onClick={() => act('checkout', b.bookingId)}>Check Out</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedStudent && bookings.length === 0 && (
        <div className="card"><p>No bookings found for this student.</p></div>
      )}
    </div>
  );
}
