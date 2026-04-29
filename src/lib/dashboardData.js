import { dashboardTable, hasSupabaseConfig, supabase } from './supabaseClient';

export { dashboardTable };

const fallbackSourceMessage =
  'Preview projects are shown until Supabase credentials are configured.';

function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export const fallbackDashboardRows = [
  {
    id: 'project-1',
    name: 'Client Portal Refresh',
    owner: 'A. Kumar',
    status: 'In progress',
    priority: 'High',
    progress: 72,
    due_date: daysFromNow(12),
    budget: 82000,
    summary: 'Refreshing the client workspace and onboarding flows.',
    team: 'Product',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'project-2',
    name: 'Warehouse Analytics Rollout',
    owner: 'R. Singh',
    status: 'At risk',
    priority: 'Medium',
    progress: 44,
    due_date: daysFromNow(4),
    budget: 54000,
    summary: 'Phase-two rollout for forecasting and operations reporting.',
    team: 'Operations',
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'project-3',
    name: 'Support Automation Sprint',
    owner: 'T. Roy',
    status: 'Completed',
    priority: 'Low',
    progress: 100,
    due_date: daysFromNow(-2),
    budget: 26000,
    summary: 'Automated ticket tagging and escalation routing.',
    team: 'Support',
    updated_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
];

export const previewProjectRows = sortRows(fallbackDashboardRows.map(normalizeProjectRow));

function pickFirstDefined(row, keys) {
  for (const key of keys) {
    const value = row[key];

    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return null;
}

function toTitleCase(value) {
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function toNumeric(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toPercentValue(value) {
  const numeric = toNumeric(value);

  if (numeric === null) {
    return 0;
  }

  if (numeric <= 1) {
    return Math.round(numeric * 100);
  }

  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function resolveStatusTone(status) {
  const normalized = String(status).toLowerCase();

  if (
    normalized.includes('risk') ||
    normalized.includes('delay') ||
    normalized.includes('block') ||
    normalized.includes('hold')
  ) {
    return 'warn';
  }

  if (
    normalized.includes('complete') ||
    normalized.includes('done') ||
    normalized.includes('healthy')
  ) {
    return 'good';
  }

  if (
    normalized.includes('progress') ||
    normalized.includes('active') ||
    normalized.includes('plan')
  ) {
    return 'active';
  }

  return 'neutral';
}

function formatCurrency(value) {
  const numeric = toNumeric(value);

  if (numeric === null) {
    return '--';
  }

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(numeric);
}

function formatDateLabel(value) {
  if (!value) {
    return 'No deadline';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDaysUntilDue(value) {
  if (!value) {
    return null;
  }

  const dueDate = new Date(value);

  if (Number.isNaN(dueDate.getTime())) {
    return null;
  }

  const diff = dueDate.getTime() - Date.now();
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

function buildDueLabel(value) {
  const daysUntilDue = getDaysUntilDue(value);

  if (daysUntilDue === null) {
    return 'No deadline';
  }

  if (daysUntilDue < 0) {
    return `${Math.abs(daysUntilDue)}d overdue`;
  }

  if (daysUntilDue === 0) {
    return 'Due today';
  }

  return `${daysUntilDue}d left`;
}

function normalizeProjectRow(row, index) {
  const name =
    pickFirstDefined(row, ['name', 'title', 'project_name']) || `Project ${index + 1}`;
  const owner =
    pickFirstDefined(row, ['owner', 'project_owner', 'lead', 'manager']) ||
    'Unassigned';
  const status =
    pickFirstDefined(row, ['status', 'state', 'phase']) || 'Planned';
  const priority =
    pickFirstDefined(row, ['priority', 'priority_level']) || 'Medium';
  const progress = toPercentValue(
    pickFirstDefined(row, ['progress', 'completion', 'percent_complete'])
  );
  const dueDate = pickFirstDefined(row, ['due_date', 'deadline', 'target_date']);
  const budget = pickFirstDefined(row, ['budget', 'amount', 'cost']);
  const summary =
    pickFirstDefined(row, ['summary', 'description', 'notes']) || 'No summary provided.';
  const team = pickFirstDefined(row, ['team', 'department', 'group']) || 'General';
  const updatedAt = pickFirstDefined(row, [
    'updated_at',
    'updatedAt',
    'created_at',
    'createdAt',
  ]);

  return {
    id: row.id || row.uuid || `${name}-${index}`,
    name: toTitleCase(name),
    owner: toTitleCase(owner),
    status: toTitleCase(status),
    statusTone: resolveStatusTone(status),
    priority: toTitleCase(priority),
    progressValue: progress,
    progressLabel: `${progress}%`,
    dueDateLabel: formatDateLabel(dueDate),
    dueRelativeLabel: buildDueLabel(dueDate),
    dueDateSortValue: dueDate || '',
    budgetLabel: formatCurrency(budget),
    budgetValue: toNumeric(budget),
    summary,
    team: toTitleCase(team),
    updatedLabel: formatDateLabel(updatedAt),
    updatedSortValue: updatedAt || '',
    isOverdue: (getDaysUntilDue(dueDate) || 0) < 0 && progress < 100,
  };
}

function sortRows(rows) {
  return [...rows].sort((left, right) =>
    String(right.updatedSortValue).localeCompare(String(left.updatedSortValue))
  );
}

function toProjectPayload(project) {
  return {
    name: project.name.trim(),
    owner: project.owner.trim(),
    status: project.status,
    priority: project.priority,
    progress: Number(project.progress),
    due_date: project.dueDate || null,
    budget: project.budget ? Number(project.budget) : null,
    summary: project.summary.trim(),
    team: project.team.trim(),
  };
}

export function summarizeRows(rows) {
  const activeProjects = rows.filter((row) => row.statusTone === 'active').length;
  const atRiskProjects = rows.filter(
    (row) => row.statusTone === 'warn' || row.isOverdue
  ).length;
  const completedProjects = rows.filter((row) => row.progressValue >= 100).length;
  const overdueProjects = rows.filter((row) => row.isOverdue).length;
  const budgetValues = rows
    .map((row) => row.budgetValue)
    .filter((value) => value !== null && value !== undefined);
  const progressValues = rows
    .map((row) => row.progressValue)
    .filter((value) => value !== null && value !== undefined);

  return {
    totalProjects: rows.length,
    activeProjects,
    atRiskProjects,
    completedProjects,
    overdueProjects,
    totalBudget: budgetValues.reduce((total, value) => total + value, 0),
    averageProgress: progressValues.length
      ? Math.round(
          progressValues.reduce((total, value) => total + value, 0) /
            progressValues.length
        )
      : 0,
  };
}

export async function fetchDashboardRows() {
  if (!hasSupabaseConfig || !supabase) {
    return {
      rows: previewProjectRows,
      source: 'preview',
      message: fallbackSourceMessage,
    };
  }

  try {
    const { data, error } = await supabase
      .from(dashboardTable)
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(20);

    if (error) {
      return {
        rows: previewProjectRows,
        source: 'preview',
        message: `Supabase query failed for "${dashboardTable}". Showing preview projects instead.`,
      };
    }

    const normalizedRows = sortRows((data || []).map(normalizeProjectRow));

    return {
      rows: normalizedRows.length
        ? normalizedRows
        : previewProjectRows,
      source: normalizedRows.length ? 'supabase' : 'preview',
      message: normalizedRows.length
        ? `Connected to the "${dashboardTable}" table in Supabase.`
        : `No projects were returned from "${dashboardTable}". Showing preview projects instead.`,
    };
  } catch {
    return {
      rows: previewProjectRows,
      source: 'preview',
      message: 'Supabase request failed. Showing preview projects instead.',
    };
  }
}

export async function createProject(project) {
  const payload = toProjectPayload(project);

  if (!hasSupabaseConfig || !supabase) {
    return {
      row: normalizeProjectRow(
        {
          id: `local-${Date.now()}`,
          ...payload,
          updated_at: new Date().toISOString(),
        },
        0
      ),
      source: 'preview',
      message:
        'Supabase is not configured. The project was added locally for preview only.',
    };
  }

  const { data, error } = await supabase
    .from(dashboardTable)
    .insert(payload)
    .select()
    .single();

  if (error) {
    return {
      row: normalizeProjectRow(
        {
          id: `local-${Date.now()}`,
          ...payload,
          updated_at: new Date().toISOString(),
        },
        0
      ),
      source: 'preview',
      message:
        'Supabase could not save the project. The project was added locally for preview.',
    };
  }

  return {
    row: normalizeProjectRow(data, 0),
    source: 'supabase',
    message: `Project saved to "${dashboardTable}" in Supabase.`,
  };
}
