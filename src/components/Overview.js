import React from 'react';

const STATUS_COLOR = {
  'In progress': 'blue',
  'At risk':     'red',
  'Completed':   'green',
  'Planned':     'gray',
  'On hold':     'yellow',
};

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className={`stat-value stat-value-${accent || 'default'}`}>{value}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  );
}

export default function Overview({ projects, teamMembers, allProjectMembers, onNavigate }) {
  const total     = projects.length;
  const active    = projects.filter(p => p.status === 'In progress').length;
  const atRisk    = projects.filter(p => p.status === 'At risk').length;
  const completed = projects.filter(p => p.status === 'Completed').length;
  const avgProgress = total > 0
    ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / total)
    : 0;

  const projectMemberCount = {};
  (allProjectMembers || []).forEach(pm => {
    projectMemberCount[pm.project_id] = (projectMemberCount[pm.project_id] || 0) + 1;
  });

  const memberProjectCount = {};
  (allProjectMembers || []).forEach(pm => {
    memberProjectCount[pm.member_id] = (memberProjectCount[pm.member_id] || 0) + 1;
  });

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 6);

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">Overview</h1>
          <p className="view-sub">Your workspace at a glance</p>
        </div>
      </div>

      <div className="stats-row">
        <StatCard label="Total Projects"  value={total}          accent="default" />
        <StatCard label="In Progress"     value={active}         accent="blue" />
        <StatCard label="At Risk"         value={atRisk}         accent="red" />
        <StatCard label="Completed"       value={completed}      accent="green" />
        <StatCard label="Team Members"    value={teamMembers.length} accent="purple" />
        <StatCard label="Avg. Progress"   value={`${avgProgress}%`} accent="default" />
      </div>

      <div className="overview-grid">
        {/* Recent Projects */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Projects</h2>
            <button className="link-btn" onClick={() => onNavigate('projects')}>View all →</button>
          </div>
          {recentProjects.length === 0 ? (
            <div className="empty-state-sm">
              <p>No projects yet.</p>
              <button className="link-btn mt-4" onClick={() => onNavigate('projects')}>
                Create your first project →
              </button>
            </div>
          ) : (
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Members</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map(p => (
                  <tr key={p.id}>
                    <td>
                      <span className="cell-name">{p.name}</span>
                      {p.team && <span className="cell-sub">{p.team}</span>}
                    </td>
                    <td>
                      <span className={`badge badge-${STATUS_COLOR[p.status] || 'gray'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="progress-wrap">
                        <div className="mini-progress">
                          <div
                            className="mini-progress-fill"
                            style={{ width: `${p.progress || 0}%` }}
                          />
                        </div>
                        <span className="progress-pct">{p.progress || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="cell-count">{projectMemberCount[p.id] || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Team */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Team</h2>
            <button className="link-btn" onClick={() => onNavigate('team')}>View all →</button>
          </div>
          {teamMembers.length === 0 ? (
            <div className="empty-state-sm">
              <p>No team members yet.</p>
              <button className="link-btn mt-4" onClick={() => onNavigate('team')}>
                Add team members →
              </button>
            </div>
          ) : (
            <div className="member-list">
              {teamMembers.slice(0, 7).map(m => (
                <div key={m.id} className="member-item">
                  <div className="avatar" style={{ background: m.avatar_color || '#4f46e5' }}>
                    {m.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="member-info">
                    <span className="member-name">{m.name}</span>
                    <span className="member-role">{m.role}{m.department ? ` · ${m.department}` : ''}</span>
                  </div>
                  <span className="member-projects-count">
                    {memberProjectCount[m.id] || 0}p
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status breakdown */}
      {total > 0 && (
        <div className="card mt-20">
          <div className="card-header">
            <h2 className="card-title">Status Breakdown</h2>
          </div>
          <div className="status-breakdown">
            {['Planned', 'In progress', 'At risk', 'On hold', 'Completed'].map(status => {
              const count = projects.filter(p => p.status === status).length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status} className="status-row-item">
                  <div className="status-row-label">
                    <span className={`status-dot status-dot-${STATUS_COLOR[status] || 'gray'}`} />
                    <span className="status-row-name">{status}</span>
                  </div>
                  <div className="status-row-bar">
                    <div
                      className={`status-bar-fill status-bar-${STATUS_COLOR[status] || 'gray'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="status-row-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
