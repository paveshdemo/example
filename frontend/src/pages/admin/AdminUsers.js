import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, createUser, deleteUser } from '../../services/dataService';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'maintenance_staff', phone: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await createUser(newUser);
      setShowCreate(false);
      setNewUser({ name: '', email: '', password: '', role: 'maintenance_staff', phone: '' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally { setCreating(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteModal.user._id);
      setDeleteModal({ show: false, user: null });
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const isNotCustomer = u.role !== 'customer';
    return matchSearch && matchRole && isNotCustomer;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>User Management</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}><FiPlus /> Add User</button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3>Create New User</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group"><label>Name *</label><input type="text" className="form-control" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required /></div>
              <div className="form-group"><label>Email *</label><input type="email" className="form-control" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required /></div>
              <div className="form-group"><label>Password *</label><input type="password" className="form-control" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required minLength="6" /></div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Role *</label>
                <select className="form-control" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="admin">Admin</option>
                  <option value="maintenance_staff">Maintenance Staff</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="property_manager">Property Manager</option>
                  <option value="property_inspector">Property Inspector</option>
                </select>
              </div>
              <div className="form-group"><label>Phone</label><input type="text" className="form-control" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} /></div>
            </div>
            <div className="btn-group"><button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create User'}</button><button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button></div>
          </form>
        </div>
      )}

      <div className="filters-bar">
        <div className="search-box"><FiSearch /><input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select className="form-control" style={{ width: '200px' }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="maintenance_staff">Maintenance Staff</option>
          <option value="receptionist">Receptionist</option>
          <option value="property_manager">Property Manager</option>
          <option value="property_inspector">Property Inspector</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><StatusBadge status={u.role} /></td>
                <td>{u.phone || '-'}</td>
                <td><StatusBadge status={u.isActive ? 'active' : 'inactive'} /></td>
                <td>{formatDate(u.createdAt)}</td>
                <td>
                  <div className="btn-group">
                    <Link to={`/admin/users/${u._id}/edit`} className="btn btn-sm btn-outline"><FiEdit /></Link>
                    {!u.isActive && (
                      <button className="btn btn-sm btn-danger" onClick={() => setDeleteModal({ show: true, user: u })} title="Delete inactive user"><FiTrash2 /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal 
        show={deleteModal.show}
        title="Delete User" 
        message={`Are you sure you want to permanently delete "${deleteModal.user?.name}"? This action cannot be undone.`} 
        onConfirm={handleDelete} 
        onCancel={() => setDeleteModal({ show: false, user: null })} 
        confirmText="Delete"
        danger={true}
      />
    </div>
  );
};

export default AdminUsers;
