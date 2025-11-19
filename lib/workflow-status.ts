// Simple in-memory store for workflow status tracking
// In production, this should use a database or Redis

interface WorkflowStatusData {
  runId: string;
  status: "running" | "completed" | "failed";
  error?: {
    message: string;
    step?: string;
  };
  steps: Array<{
    id: string;
    status: "pending" | "running" | "completed" | "failed";
    startedAt?: string;
    completedAt?: string;
    error?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// In-memory store (will reset on server restart)
const workflowStatuses = new Map<string, WorkflowStatusData>();

export function createWorkflowStatus(runId: string): WorkflowStatusData {
  const status: WorkflowStatusData = {
    runId,
    status: "running",
    steps: [
      { id: "initializeSandbox", status: "pending" },
      { id: "analyzeRepository", status: "pending" },
      { id: "executeChanges", status: "pending" },
      { id: "createPullRequest", status: "pending" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  workflowStatuses.set(runId, status);
  return status;
}

export function updateWorkflowStatus(
  runId: string,
  updates: Partial<WorkflowStatusData>
): WorkflowStatusData | null {
  const existing = workflowStatuses.get(runId);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  workflowStatuses.set(runId, updated);
  return updated;
}

export function updateWorkflowStep(
  runId: string,
  stepId: string,
  stepStatus: "pending" | "running" | "completed" | "failed",
  error?: string
): WorkflowStatusData | null {
  const existing = workflowStatuses.get(runId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const steps = existing.steps.map((step) => {
    if (step.id === stepId) {
      const updated = { ...step, status: stepStatus };
      if (stepStatus === "running" && !step.startedAt) {
        updated.startedAt = now;
      }
      if (stepStatus === "completed" || stepStatus === "failed") {
        updated.completedAt = now;
      }
      if (error) {
        updated.error = error;
      }
      return updated;
    }
    return step;
  });

  const updated = {
    ...existing,
    steps,
    updatedAt: now,
  };

  workflowStatuses.set(runId, updated);
  return updated;
}

export function setWorkflowError(
  runId: string,
  errorMessage: string,
  stepId?: string
): WorkflowStatusData | null {
  const existing = workflowStatuses.get(runId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: WorkflowStatusData = {
    ...existing,
    status: "failed",
    error: {
      message: errorMessage,
      step: stepId,
    },
    updatedAt: now,
    completedAt: now,
  };

  // Mark the failed step
  if (stepId) {
    updated.steps = existing.steps.map((step) =>
      step.id === stepId
        ? { ...step, status: "failed" as const, error: errorMessage, completedAt: now }
        : step
    );
  }

  workflowStatuses.set(runId, updated);
  return updated;
}

export function completeWorkflow(runId: string): WorkflowStatusData | null {
  const existing = workflowStatuses.get(runId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: WorkflowStatusData = {
    ...existing,
    status: "completed",
    updatedAt: now,
    completedAt: now,
    steps: existing.steps.map((step) => ({
      ...step,
      status: step.status === "pending" ? "completed" : step.status,
      completedAt: step.completedAt || now,
    })),
  };

  workflowStatuses.set(runId, updated);
  return updated;
}

export function getWorkflowStatus(runId: string): WorkflowStatusData | null {
  return workflowStatuses.get(runId) || null;
}

export function deleteWorkflowStatus(runId: string): void {
  workflowStatuses.delete(runId);
}

