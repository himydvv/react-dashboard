import { supabase } from './supabaseClient';

// ── Projects ──────────────────────────────────────────────────────────────────

export async function fetchProjects() {
  if (!supabase) return { data: [], error: null };
  return supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });
}

export async function createProject(data) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.from('projects').insert(data).select().single();
}

export async function updateProject(id, data) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.from('projects').update(data).eq('id', id).select().single();
}

export async function deleteProject(id) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.from('projects').delete().eq('id', id);
}

// ── Team Members ──────────────────────────────────────────────────────────────

export async function fetchTeamMembers() {
  if (!supabase) return { data: [], error: null };
  return supabase
    .from('team_members')
    .select('*')
    .order('name');
}

export async function createTeamMember(data) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.from('team_members').insert(data).select().single();
}

export async function updateTeamMember(id, data) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.from('team_members').update(data).eq('id', id).select().single();
}

export async function deleteTeamMember(id) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.from('team_members').delete().eq('id', id);
}

// ── Project Members ───────────────────────────────────────────────────────────

export async function fetchAllProjectMembers() {
  if (!supabase) return { data: [], error: null };
  return supabase
    .from('project_members')
    .select('*, team_members(*)');
}

export async function fetchProjectMembers(projectId) {
  if (!supabase) return { data: [], error: null };
  return supabase
    .from('project_members')
    .select('*, team_members(*)')
    .eq('project_id', projectId)
    .order('joined_at');
}

export async function addMemberToProject(projectId, memberId, roleInProject = 'Contributor') {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase
    .from('project_members')
    .insert({ project_id: projectId, member_id: memberId, role_in_project: roleInProject })
    .select('*, team_members(*)')
    .single();
}

export async function removeMemberFromProject(projectId, memberId) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('member_id', memberId);
}

export async function updateMemberRole(projectId, memberId, roleInProject) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase
    .from('project_members')
    .update({ role_in_project: roleInProject })
    .eq('project_id', projectId)
    .eq('member_id', memberId)
    .select()
    .single();
}

// ── Activity Log ──────────────────────────────────────────────────────────────

export async function fetchActivityLog(limit = 20) {
  if (!supabase) return { data: [], error: null };
  return supabase
    .from('activity_log')
    .select('*')
    .order('logged_at', { ascending: false })
    .limit(limit);
}
