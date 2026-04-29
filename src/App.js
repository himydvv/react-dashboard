import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import Projects from './components/Projects';
import Team from './components/Team';
import { fetchProjects, fetchTeamMembers, fetchAllProjectMembers } from './lib/api';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [view, setView]                           = useState('overview');
  const [projects, setProjects]                   = useState([]);
  const [teamMembers, setTeamMembers]             = useState([]);
  const [allProjectMembers, setAllProjectMembers] = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pr, tm, pm] = await Promise.all([
        fetchProjects(),
        fetchTeamMembers(),
        fetchAllProjectMembers(),
      ]);
      if (pr.error) throw pr.error;
      if (tm.error) throw tm.error;
      setProjects(pr.data || []);
      setTeamMembers(tm.data || []);
      setAllProjectMembers(pm.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const sidebarCounts = {
    projects: projects.length || undefined,
    team:     teamMembers.length || undefined,
  };

  return (
    <div className="app">
      <Sidebar activeView={view} onNavigate={setView} counts={sidebarCounts} />

      <main className="main">
        {!supabase && (
          <div className="notice-banner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            <span>
              Supabase is not configured — data will not persist.
              Copy <code>.env.example</code> to <code>.env.local</code> and add your credentials.
            </span>
          </div>
        )}

        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
            <p className="loading-text">Loading workspace…</p>
          </div>
        ) : error ? (
          <div className="error-screen">
            <p className="error-title">Failed to load data</p>
            <p className="error-sub">{error}</p>
            <button className="btn btn-primary" onClick={loadData}>Try again</button>
          </div>
        ) : (
          <>
            {view === 'overview' && (
              <Overview
                projects={projects}
                teamMembers={teamMembers}
                allProjectMembers={allProjectMembers}
                onNavigate={setView}
              />
            )}
            {view === 'projects' && (
              <Projects
                projects={projects}
                teamMembers={teamMembers}
                allProjectMembers={allProjectMembers}
                onRefresh={loadData}
              />
            )}
            {view === 'team' && (
              <Team
                teamMembers={teamMembers}
                allProjectMembers={allProjectMembers}
                onRefresh={loadData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
