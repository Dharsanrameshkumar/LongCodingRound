import React, { useEffect, useState } from 'react';
import { getTopStudents } from '../api';

export default function TopRegistrationsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getTopStudents()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load top registrations.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="page-title">Top Registrations</h1>
      {error && <div className="msg msg-error">{error}</div>}
      <div className="card">
        {data.length === 0 ? (
          <p>No registrations yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Total Bookings</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s, i) => (
                <tr key={s.studentId}>
                  <td>#{i + 1}</td>
                  <td>{s.studentId}</td>
                  <td>{s.studentName}</td>
                  <td>{s.email}</td>
                  <td>{s.bookingCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
