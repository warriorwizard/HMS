import { AppShell } from "@/app/components/app-shell";
import { EmptyState, Panel, StatusBadge } from "@/app/components/workspace-ui";
import { isApiError } from "@/app/lib/api/errors";
import { fetchDoctorReviewQueue, fetchTechnicianQueue, fetchWorkflowTasks } from "@/app/lib/api/workflow";

export const dynamic = "force-dynamic";

export default async function WorkflowPage() {
  const [tasksResult, techQueueResult, doctorQueueResult] = await Promise.all([
    loadTasks(),
    loadTechnicianQueue(),
    loadDoctorQueue()
  ]);

  if (tasksResult.kind === "error") {
    return (
      <AppShell activePath="/workflow" eyebrow="Operations" title="Workflow Engine">
        <Panel className="wide-panel" title="Workflow unavailable">
          <EmptyState title="Unable to load workflow tasks" description={tasksResult.message} />
        </Panel>
      </AppShell>
    );
  }

  return (
    <AppShell activePath="/workflow" eyebrow="Operations" title="Workflow Engine">
      <section className="workflow-board">
        {tasksResult.items.map((task, index) => (
          <Panel key={task.id} meta={`${task.priority} priority`} title={task.stage.replaceAll("_", " ")}>
            <div className="workflow-card-body">
              <span className="step-index">{index + 1}</span>
              <StatusBadge tone={statusTone(task.status)}>{task.status.replaceAll("_", " ")}</StatusBadge>
              <p>
                {task.id} | {task.patient_id} | {task.assignee_role} | due {task.due_at}
              </p>
            </div>
          </Panel>
        ))}
      </section>

      <section className="main-grid compact-top">
        <Panel title="Technician Queue API">
          {techQueueResult.kind === "ok" ? (
            <div className="signal-list">
              {techQueueResult.items.map((item) => (
                <div key={item.id}>
                  <strong>{item.stage.replaceAll("_", " ")}</strong>
                  <span>
                    {item.patient_id} | {item.status} | {item.priority} | risk {item.risk_level}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Queue unavailable" description={techQueueResult.message} />
          )}
        </Panel>

        <Panel title="Doctor Review Queue API">
          {doctorQueueResult.kind === "ok" ? (
            <div className="signal-list">
              {doctorQueueResult.items.map((item) => (
                <div key={item.id}>
                  <strong>{item.stage.replaceAll("_", " ")}</strong>
                  <span>
                    {item.patient_id} | {item.status} | {item.priority} | due {item.due_at}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Queue unavailable" description={doctorQueueResult.message} />
          )}
        </Panel>
      </section>

      <section className="main-grid compact-top">
        <Panel title="State Transition Service">
          <div className="timeline">
            <div>
              <strong>Task table</strong>
              <span>Task state, stage, role ownership, and SLA metadata are persisted per step.</span>
            </div>
            <div>
              <strong>Transition API</strong>
              <span>`POST /api/v1/workflow/tasks/:id/transition` moves stage and status atomically.</span>
            </div>
            <div>
              <strong>Queue APIs</strong>
              <span>Technician and doctor queues are filterable for operational worklists.</span>
            </div>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}

async function loadTasks() {
  try {
    return { kind: "ok" as const, ...(await fetchWorkflowTasks({ limit: 10 })) };
  } catch (error) {
    return {
      kind: "error" as const,
      message: isApiError(error)
        ? `The workflow API responded with: ${error.message}`
        : "Workflow API is currently unavailable."
    };
  }
}

async function loadTechnicianQueue() {
  try {
    return { kind: "ok" as const, ...(await fetchTechnicianQueue({ limit: 10 })) };
  } catch (error) {
    return {
      kind: "error" as const,
      message: isApiError(error)
        ? `The technician queue API responded with: ${error.message}`
        : "Technician queue is currently unavailable."
    };
  }
}

async function loadDoctorQueue() {
  try {
    return { kind: "ok" as const, ...(await fetchDoctorReviewQueue({ limit: 10 })) };
  } catch (error) {
    return {
      kind: "error" as const,
      message: isApiError(error)
        ? `The doctor queue API responded with: ${error.message}`
        : "Doctor queue is currently unavailable."
    };
  }
}

function statusTone(status: string): "good" | "warning" | "danger" | "neutral" {
  const value = status.toLowerCase();
  if (value.includes("critical") || value.includes("blocked")) {
    return "danger";
  }
  if (value.includes("pending") || value.includes("queued") || value.includes("running")) {
    return "warning";
  }
  if (value.includes("ready") || value.includes("completed") || value.includes("done")) {
    return "good";
  }
  return "neutral";
}
