import React, { useState } from 'react';
import Modal from './Modal';
import { createTeamMember, updateTeamMember, deleteTeamMember } from '../lib/api';

const AVATAR_COLORS = [
  '#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626',
  '#7c3aed', '#db2777', '#0284c7', '#16a34a', '#ea580c',
];

const EMPTY_FORM = {
  name: '', email: '', role: '', department: '', bio: '',
  avatar_color: AVATAR_COLORS[0],
};

// ── Member Form ───────────────────────────────────────────────────────────────

function MemberForm({ initial, onSave, onCancel }) {
  const [form, setForm]     = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try { await onSave(form); }
    catch (err) { setError(err.message || 'Failed to save. Please try again.'); setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="form-error">{error}</div>}

      <div className="field">
        <label>Avatar Color</label>
        <div className="color-picker">
          {AVATAR_COLORS.map(c => (
            <button
              type="button"
              key={c}
              className={`color-swatch${form.avatar_color === c ? ' selected' : ''}`}
              style={{ background: c }}
              onClick={() => set('avatar_color', c)}
              aria-label={`Color ${c}`}
            />
          ))}
          <div className="avatar avatar-preview" style={{ background: form.avatar_color }}>
            {form.name ? form.name.slice(0, 1).toUpperCase() : '?'}
          </div>
        </div>
      </div>

      <div className="form-grid-2">
        <div className="field">
          <label>Full Name *</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Jane Smith"
            autoFocus
          />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="jane@company.com"
          />
        </div>
        <div className="field">
          <label>Job Title / Role</label>
          <input value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Senior Engineer" />
        </div>
        <div className="field">
          <label>Department</label>
          <input value={form.department} onChange={e => set('department', e.target.value)} placeholder="e.g. Engineering" />
        </div>
        <div className="field span-2">
          <label>Bio / Notes</label>
          <textarea
            rows={2}
            value={form.bio}
            onChange={e => set('bio', e.target.value)}
            placeholder="Short bio or any relevant notes…"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Member'}
        </button>
      </div>
    </form>
  );
}

// ── Team View ─────────────────────────────────────────────────────────────────

export default function Team({ teamMembers, allProjectMembers, onRefresh }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [search, setSearch]         = useState('');
  const [filterDept, setFilterDept] = useState('');

  const memberProjectCount = {};
  (allProjectMembers || []).forEach(pm => {
    memberProjectCount[pm.member_id] = (memberProjectCount[pm.member_id] || 0) + 1;
  });

  const departments = [...new Set(teamMembers.map(m => m.department).filter(Boolean))].sort();

  const handleCreate = async (form) => {
    const { error } = await createTeamMember({
      name:         form.name.trim(),
      email:        form.email.trim() || null,
      role:         form.role.trim()       || 'Team Member',
      department:   form.department.trim() || 'General',
      bio:          form.bio.trim()        || null,
      avatar_color: form.avatar_color,
    });
    if (error) throw error;
    setShowCreate(false);
    onRefresh();
  };

  const handleUpdate = async (form) => {
    const { error } = await updateTeamMember(editMember.id, {
      name:         form.name.trim(),
      email:        form.email.trim() || null,
      role:         form.role.trim()       || 'Team Member',
      department:   form.department.trim() || 'General',
      bio:          form.bio.trim()        || null,
      avatar_color: form.avatar_color,
    });
    if (error) throw error;
    setEditMember(null);
    onRefresh();
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Remove "${member.name}" from the team? They will also be unlinked from all projects.`)) return;
    const { error } = await deleteTeamMember(member.id);
    if (error) { alert('Delete failed: ' + error.message); return; }
    onRefresh();
  };

  const filtered = teamMembers.filter(m => {
    if (filterDept && m.department !== filterDept) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.role?.toLowerCase().includes(q) && !m.department?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">Team</h1>
          <p className="view-sub">
            {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
            {filtered.length !== teamMembers.length ? ` · ${filtered.length} shown` : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Member
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-input"
            placeholder="Search team…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {departments.length > 1 && (
          <select className="filter-select" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">All departments</option>
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
        )}
        {(filterDept || search) && (
          <button className="btn-clear" onClick={() => { setFilterDept(''); setSearch(''); }}>
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="empty-title">
            {teamMembers.length === 0 ? 'No team members yet' : 'No matching members'}
          </p>
          <p className="empty-sub">
            {teamMembers.length === 0
              ? 'Add your first team member to start linking them to projects.'
              : 'Try a different search or filter.'}
          </p>
          {teamMembers.length === 0 && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              Add Team Member
            </button>
          )}
        </div>
      ) : (
        <div className="member-grid">
          {filtered.map(m => {
            const pCount = memberProjectCount[m.id] || 0;
            return (
              <div key={m.id} className="member-card">
                <div className="member-card-header">
                  <div className="avatar avatar-lg" style={{ background: m.avatar_color || '#4f46e5' }}>
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="member-card-actions">
                    <button className="icon-btn" onClick={() => setEditMember(m)} title="Edit member">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(m)} title="Remove member">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="member-card-body">
                  <h3 className="member-card-name">{m.name}</h3>
                  {m.role && <p className="member-card-role">{m.role}</p>}
                  {m.department && <p className="member-card-dept">{m.department}</p>}
                  {m.email && (
                    <p className="member-card-email">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      {m.email}
                    </p>
                  )}
                  {m.bio && <p className="member-card-bio">{m.bio}</p>}
                </div>
                <div className="member-card-footer">
                  <span className="member-card-stat">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    {pCount} project{pCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Team Member" size="md">
        <MemberForm onSave={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      <Modal isOpen={!!editMember} onClose={() => setEditMember(null)} title="Edit Team Member" size="md">
        {editMember && (
          <MemberForm
            initial={{
              name:         editMember.name         || '',
              email:        editMember.email        || '',
              role:         editMember.role         || '',
              department:   editMember.department   || '',
              bio:          editMember.bio          || '',
              avatar_color: editMember.avatar_color || AVATAR_COLORS[0],
            }}
            onSave={handleUpdate}
            onCancel={() => setEditMember(null)}
          />
        )}
      </Modal>
    </div>
  );
}
