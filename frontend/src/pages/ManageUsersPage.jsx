import React, { useEffect, useState } from 'react';
import { getUsers, createUser, getOrganizers, createOrganizer, getStudents, createStudent } from '../api';

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [students, setStudents] = useState([]);
  const [userForm, setUserForm] = useState({ name: '', email: '', phoneNo: '', role: 'STUDENT' });
  const [orgForm, setOrgForm] = useState({ userId: '' });
  const [stuForm, setStuForm] = useState({ userId: '' });
  const [msg, setMsg] = useState(null);

  const reload = () => {
    getUsers().then(r => setUsers(r.data)).catch(() => {});
    getOrganizers().then(r => setOrganizers(r.data)).catch(() => {});
    getStudents().then(r => setStudents(r.data)).catch(() => {});
  };

  useEffect(() => { reload(); }, []);

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 4000); };

  const submitUser = async e => {
    e.preventDefault();
    try {
      await createUser(userForm);
      flash('success', 'User created.');
      setUserForm({ name: '', email: '', phoneNo: '', role: 'STUDENT' });
      reload();
    } catch (err) {
      flash('error', err.response?.data?.error || 'Failed to create user.');
    }
  };

  const submitOrg = async e => {
    e.preventDefault();
    try {
      await createOrganizer({ userId: Number(orgForm.userId) });
      flash('success', 'Organizer created.');
      setOrgForm({ userId: '' });
      reload();
    } catch (err) {
      flash('error', err.response?.data?.error || 'Failed to create organizer.');
    }
  };

  const submitStu = async e => {
    e.preventDefault();
    try {
      await createStudent({ userId: Number(stuForm.userId) });
      flash('success', 'Student created.');
      setStuForm({ userId: '' });
      reload();
    } catch (err) {
      flash('error', err.response?.data?.error || 'Failed to create student.');
    }
  };

  return (
    <div>
      <h1 className="page-title">Manage Users</h1>
      {msg && <div className={`msg msg-${msg.type}`}>{msg.text}</div>}

      <div className="split">
        <div>
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Create User</h3>
            <form onSubmit={submitUser}>
              <div className="form-group">
                <label>Name</label>
                <input value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} required placeholder="Full name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} required placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={userForm.phoneNo} onChange={e => setUserForm(f => ({ ...f, phoneNo: e.target.value }))} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="STUDENT">STUDENT</option>
                  <option value="ORGANIZER">ORGANIZER</option>
                </select>
              </div>
              <button className="btn btn-primary" type="submit">Create User</button>
            </form>
          </div>

          <div className="card" style={{ marginTop: 0 }}>
            <h3 style={{ marginBottom: 14 }}>Assign as Organizer</h3>
            <form onSubmit={submitOrg}>
              <div className="form-group">
                <label>User</label>
                <select value={orgForm.userId} onChange={e => setOrgForm({ userId: e.target.value })} required>
                  <option value="">-- Select User --</option>
                  {users.map(u => <option key={u.userId} value={u.userId}>#{u.userId} — {u.name}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" type="submit">Create Organizer</button>
            </form>
          </div>

          <div className="card" style={{ marginTop: 0 }}>
            <h3 style={{ marginBottom: 14 }}>Assign as Student</h3>
            <form onSubmit={submitStu}>
              <div className="form-group">
                <label>User</label>
                <select value={stuForm.userId} onChange={e => setStuForm({ userId: e.target.value })} required>
                  <option value="">-- Select User --</option>
                  {users.map(u => <option key={u.userId} value={u.userId}>#{u.userId} — {u.name}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" type="submit">Create Student</button>
            </form>
          </div>
        </div>

        <div>
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>All Users ({users.length})</h3>
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.userId}>
                    <td>{u.userId}</td><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Organizers ({organizers.length})</h3>
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Email</th></tr></thead>
              <tbody>
                {organizers.map(o => (
                  <tr key={o.organizerId}>
                    <td>{o.organizerId}</td><td>{o.user?.name}</td><td>{o.user?.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Students ({students.length})</h3>
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Email</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.studentId}>
                    <td>{s.studentId}</td><td>{s.user?.name}</td><td>{s.user?.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
