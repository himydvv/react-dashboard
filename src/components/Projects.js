import React, { useState, useCallback } from 'react';
import Modal from './Modal';
import {
  createProject, updateProject, deleteProject,
  fetchProjectMembers, addMemberToProject, removeMemberFromProject,
} from '../lib/api';

const STATUS_OPTIONS   = ['Planned', 'In progress', 'At risk', 'On hold', 'Completed'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];
const ROLE_OPTIONS     = ['Lead', 'Contributor', 'Reviewer', 'Observer'];

const STATUS_COLOR = {
  'In progress': 'blue',
  'At risk':     'red',
  'Completed':   'green',
  'Planned':     'gray',
  'On hold':     'yellow',
};

const PRIORITY_COLOR = {
  'Critical': 'red',
  'High':     'orange',
  'Medium':   'yellow',
  'Low':      'gray',
};

const EMPTY_FORM = {
  name: '', owner: '', team: '', status: 'Planned', priority: 'Medium',
  progress: 0, budget: '', due_date: '', summary: '',
};

// ── Project Form ──────────────────────────────────────────────────────────────

function ProjectForm({ initial, onSave, onCancel }) {
  const [form, setForm]     = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Project name is required.'); return; }
    setSaving(true); setError('');
    try { await onSave(form); }
    catch (err) { setError(err.message || 'Failed to save. Please try again.'); setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="form-error">{error}</div>}
      <div className="form-grid-2">
        <div className="field span-2">
          <label>Project Name *</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Website Redesign"
            autoFocus
          />
        </div>
        <div className="field">
          <label>Owner</label>
          <input value={form.owner} onChange={e => set('owner', e.target.value)} placeholder="e.g. Jane Smith" />
        </div>
        <div className="field">
          <label>Department / Team</label>
          <input value={form.team} onChange={e => set('team', e.target.value)} placeholder="e.g. Engineering" />
        </div>
        <div className="field">
          <label>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Priority</label>
          <select value={form.priority} onChange={e => set('priority', e.target.value)}>
            {PRIORITY_OPTIONS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Progress (%)</label>
          <input
            type="number" min={0} max={100}
            value={form.progress}
            onChange={e => set('progress', Math.min(100, Math.max(0, Number(e.target.value))))}
          />
        </div>
        <div className="field">
          <label>Budget (USD)</label>
          <input type="number" min={0} value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="0" />
        </div>
        <div className="field">
          <label>Due Date</label>
          <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
        </div>
        <div className="field span-2">
          <label>Summary</label>
          <textarea
            rows={3}
            value={form.summary}
            onChange={e => set('summary', e.target.value)}
            placeholder="Brief description of this project…"
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Project'}
        </button>
      </div>
    </form>
  );
}

// ── Project Detail (members panel) ────────────────────────────────────────────

function ProjectDetail({ project, teamMembers, onClose, onEdit }) {
  const [members, setMembers]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [addMemberId, setAddMemberId]     = useState('');
  const [addMemberRole, setAddMemberRole] = useState('Contributor');
  const [adding, setAdding]               = useState(false);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    const { data } = await fetchProjectMembers(project.id);
    setMembers(data || []);
    setLoading(false);
  }, [project.id]);

  React.useEffect(() => { loadMembers(); }, [loadMembers]);

  const handleAdd = async () => {
    if (!addMemberId) return;
    setAdding(true);
    const { error } = await addMemberToProject(project.id, addMemberId, addMemberRole);
    if (error) alert('Failed to add: ' + error.message);
    else { await loadMembers(); setAddMemberId(''); }
    setAdding(false);
  };

  const handleRemove = async (memberId) => {
    const { error } = await removeMemberFromProject(project.id, memberId);
    if (error) alert('Failed to remove: ' + error.message);
    else loadMembers();
  };

  const linkedIds    = new Set(members.map(m => m.member_id));
  const available    = teamMembers.filter(m => !linkedIds.has(m.id));
  const isOverdue    = project.due_date && new Date(project.due_date) < new Date();

  return (
    <div className="detail-view">
      <div className="detail-top">
        <div className="detail-badges">
          <span className={`badge badge-${STATUS_COLOR[project.status] || 'gray'}`}>{project.status}</span>
          <span className={`badge badge-${PRIORITY_COLOR[project.priority] || 'gray'}`}>{project.priority}</span>
          {isOverdue && project.status !== 'Completed' && (
            <span className="badge badge-red">Overdue</span>
          )}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onEdit}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
      </div>

      {project.summary && <p className="detail-summary">{project.summary}</p>}

      <div className="detail-grid">
        <div className="detail-field">
          <span className="detail-label">Owner</span>
          <span className="detail-value">{project.owner || '—'}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Department</span>
          <span className="detail-value">{project.team || '—'}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Progress</span>
          <span className="detail-value">{project.progress || 0}%</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Due Date</span>
          <span className={`detail-value${isOverdue ? ' text-red' : ''}`}>
            {project.due_date
              ? new Date(project.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'}
          </span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Budget</span>
          <span className="detail-value">
            {project.budget ? `$${Number(project.budget).toLocaleString()}` : '—'}
          </span>
        </div>
      </div>

      <div className="detail-section">
        <h3 className="detail-section-title">Team Members</h3>

        {loading ? (
          <div className="spinner-sm" />
        ) : (
          <>
            {members.length > 0 && (
              <div className="detail-member-list">
                {members.map(pm => (
                  <div key={pm.id} className="detail-member-item">
                    <div
                      className="avatar"
                      style={{ background: pm.team_members?.avatar_color || '#4f46e5' }}
                    >
                      {pm.team_members?.name?.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="member-info">
                      <span className="member-name">{pm.team_members?.name}</span>
                      <span className="member-role">
                        {pm.role_in_project}
                        {pm.team_members?.role ? ` · ${pm.team_members.role}` : ''}
                      </span>
                    </div>
                    <button
                      className="icon-btn icon-btn-danger"
                      onClick={() => handleRemove(pm.member_id)}
                      title="Remove from project"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {available.length > 0 ? (
              <div className="add-member-row">
                <select
                  className="filter-select flex-1"
                  value={addMemberId}
                  onChange={e => setAddMemberId(e.target.value)}
                >
                  <option value="">Add a team member…</option>
                  {available.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}{m.role ? ` (${m.role})` : ''}
                    </option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={addMemberRole}
                  onChange={e => setAddMemberRole(e.target.value)}
                >
                  {ROLE_OPTIONS.map(r => <option key={r}>{r}</option>)}
                </select>
                <button
                  className="btn btn-primary"
                  onClick={handleAdd}
                  disabled={!addMemberId || adding}
                >
                  {adding ? '…' : 'Add'}
                </button>
              </div>
            ) : teamMembers.length === 0 ? (
              <p className="text-muted">No team members in workspace yet.</p>
            ) : members.length === available.length + members.length ? (
              <p className="text-muted">All team members are already linked to this project.</p>
            ) : null}

            {members.length === 0 && available.length === 0 && teamMembers.length > 0 && (
              <p className="text-muted">All team members are linked to this project.</p>
            )}
            {members.length === 0 && available.length > 0 && (
              <p className="text-muted small">No members linked yet — add one above.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Projects View ─────────────────────────────────────────────────────────────

export default function Projects({ projects, teamMembers, allProjectMembers, onRefresh }) {
  const [showCreate, setShowCreate]     = useState(false);
  const [editProject, setEditProject]   = useState(null);
  const [detailProject, setDetailProject] = useState(null);
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch]               = useState('');

  const projectMemberCount = {};
  (allProjectMembers || []).forEach(pm => {
    projectMemberCount[pm.project_id] = (projectMemberCount[pm.project_id] || 0) + 1;
  });

  const handleCreate = async (form) => {
    const { error } = await createProject({
      name:     form.name.trim(),
      owner:    form.owner.trim() || null,
      team:     form.team.trim()  || null,
      status:   form.status,
      priority: form.priority,
      progress: Number(form.progress),
      budget:   form.budget  ? Number(form.budget)  : null,
      due_date: form.due_date || null,
      summary:  form.summary.trim() || null,
    });
    if (error) throw error;
    setShowCreate(false);
    onRefresh();
  };

  const handleUpdate = async (form) => {
    const { error } = await updateProject(editProject.id, {
      name:     form.name.trim(),
      owner:    form.owner.trim() || null,
      team:     form.team.trim()  || null,
      status:   form.status,
      priority: form.priority,
      progress: Number(form.progress),
      budget:   form.budget  ? Number(form.budget)  : null,
      due_date: form.due_date || null,
      summary:  form.summary.trim() || null,
    });
    if (error) throw error;
    // also update detailProject if open
    if (detailProject?.id === editProject.id) {
      setDetailProject({ ...editProject, ...form });
    }
    setEditProject(null);
    onRefresh();
  };

  const handleDelete = async (project, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    const { error } = await deleteProject(project.id);
    if (error) { alert('Delete failed: ' + error.message); return; }
    if (detailProject?.id === project.id) setDetailProject(null);
    onRefresh();
  };

  const filtered = projects.filter(p => {
    if (filterStatus   && p.status   !== filterStatus)   return false;
    if (filterPriority && p.priority !== filterPriority) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">Projects</h1>
          <p className="view-sub">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
            {filtered.length !== projects.length ? ` · ${filtered.length} shown` : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Project
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-input"
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All priorities</option>
          {PRIORITY_OPTIONS.map(p => <option key={p}>{p}</option>)}
        </select>
        {(filterStatus || filterPriority || search) && (
          <button className="btn-clear" onClick={() => { setFilterStatus(''); setFilterPriority(''); setSearch(''); }}>
            Clear filters
          </button>
        )}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="empty-title">
              {projects.length === 0 ? 'No projects yet' : 'No matching projects'}
            </p>
            <p className="empty-sub">
              {projects.length === 0
                ? 'Create your first project to start tracking progress.'
                : 'Try adjusting your search or filters.'}
            </p>
            {projects.length === 0 && (
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Progress</th>
                  <th>Owner</th>
                  <th>Due Date</th>
                  <th>Budget</th>
                  <th>Members</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const isOverdue = p.due_date && new Date(p.due_date) < new Date() && p.status !== 'Completed';
                  return (
                    <tr
                      key={p.id}
                      className="table-row-clickable"
                      onClick={() => setDetailProject(p)}
                    >
                      <td>
                        <div className="cell-name">{p.name}</div>
                        {p.team && <div className="cell-sub">{p.team}</div>}
                      </td>
                      <td>
                        <span className={`badge badge-${STATUS_COLOR[p.status] || 'gray'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${PRIORITY_COLOR[p.priority] || 'gray'}`}>
                          {p.priority}
                        </span>
                      </td>
                      <td>
                        <div className="progress-wrap">
                          <div className="mini-progress">
                            <div className="mini-progress-fill" style={{ width: `${p.progress || 0}%` }} />
                          </div>
                          <span className="progress-pct">{p.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="text-secondary">{p.owner || '—'}</td>
                      <td className={isOverdue ? 'text-red' : 'text-secondary'}>
                        {p.due_date
                          ? new Date(p.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="text-secondary">
                        {p.budget ? `$${Number(p.budget).toLocaleString()}` : '—'}
                      </td>
                      <td className="text-secondary">
                        {projectMemberCount[p.id] || 0}
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="row-actions">
                          <button
                            className="icon-btn"
                            title="Edit project"
                            onClick={() => setEditProject(p)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="icon-btn icon-btn-danger"
                            title="Delete project"
                            onClick={e => handleDelete(p, e)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Project" size="lg">
        <ProjectForm onSave={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      {/* Edit */}
      <Modal isOpen={!!editProject} onClose={() => setEditProject(null)} title="Edit Project" size="lg">
        {editProject && (
          <ProjectForm
            initial={{
              name:     editProject.name     || '',
              owner:    editProject.owner    || '',
              team:     editProject.team     || '',
              status:   editProject.status   || 'Planned',
              priority: editProject.priority || 'Medium',
              progress: editProject.progress || 0,
              budget:   editProject.budget   || '',
              due_date: editProject.due_date || '',
              summary:  editProject.summary  || '',
            }}
            onSave={handleUpdate}
            onCancel={() => setEditProject(null)}
          />
        )}
      </Modal>

      {/* Detail */}
      <Modal
        isOpen={!!detailProject}
        onClose={() => setDetailProject(null)}
        title={detailProject?.name}
        size="lg"
      >
        {detailProject && (
          <ProjectDetail
            project={detailProject}
            teamMembers={teamMembers}
            onClose={() => setDetailProject(null)}
            onEdit={() => { setEditProject(detailProject); setDetailProject(null); }}
          />
        )}
      </Modal>
    </div>
  );
}
