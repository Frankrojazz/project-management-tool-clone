import express from "express";
import cors from "cors";

const app = express();
app.set('json spaces', 2);

app.disable("etag");

app.use(cors());
app.use(express.json());

type DB = {
  users: any[];
  projects: any[];
  tasks: any[];
  goals: any[];
  inbox: any[];
};

const initialData: DB = {
  users: [
    { id: 'u1', name: 'Sarah Chen', avatar: 'SC', color: '#8B5CF6', type: 'human', email: 'sarah@fcmanager.io' },
    { id: 'u2', name: 'Alex Rivera', avatar: 'AR', color: '#3B82F6', type: 'human', email: 'alex@fcmanager.io' },
    { id: 'u3', name: 'Jordan Lee', avatar: 'JL', color: '#10B981', type: 'human', email: 'jordan@fcmanager.io' },
    { id: 'u4', name: 'Morgan Kim', avatar: 'MK', color: '#F59E0B', type: 'human', email: 'morgan@fcmanager.io' },
    { id: 'u5', name: 'Taylor Swift', avatar: 'TS', color: '#EF4444', type: 'human', email: 'taylor@fcmanager.io' },
  ],
  projects: [
    { id: 'p1', name: 'Website Redesign', color: '#8B5CF6', icon: '🎨', description: 'Complete overhaul of the company website', isFavorite: true, memberIds: ['u1', 'u2', 'u3'] },
    { id: 'p2', name: 'Mobile App', color: '#3B82F6', icon: '📱', description: 'Native mobile application', isFavorite: true, memberIds: ['u1', 'u2', 'u3'] },
    { id: 'p3', name: 'Marketing Campaign', color: '#10B981', icon: '📢', description: 'Q4 marketing campaign', isFavorite: false, memberIds: ['u1', 'u2', 'u3'] },
    { id: 'p4', name: 'API Integration', color: '#F59E0B', icon: '🔗', description: 'Third-party API integrations', isFavorite: false, memberIds: ['u1', 'u2', 'u3'] },
  ],
  tasks: [
    { id: 'task-100', title: 'Design new homepage layout', description: 'Create wireframes and mockups', status: 'in_progress', priority: 'high', assigneeId: 'u1', projectId: 'p1', dueDate: '2025-07-15', startDate: '2025-07-01', tags: ['design'], completed: false, createdAt: '2025-06-10', subtasks: [] },
    { id: 'task-101', title: 'Achieve 90+ Lighthouse score', description: 'Optimize performance', status: 'todo', priority: 'high', assigneeId: 'u3', projectId: 'p1', dueDate: '2025-07-25', startDate: '2025-07-10', tags: ['performance'], completed: false, createdAt: '2025-06-20', subtasks: [] },
  ],
  goals: [
    { id: 'g1', title: 'Launch new website', description: 'Complete website redesign', status: 'on_track', progress: 65, owner: 'Sarah Chen', dueDate: '2025-08-01', projectIds: ['p1'], keyResults: [], parentGoalId: null },
  ],
  inbox: [],
};

let db: DB = JSON.parse(JSON.stringify(initialData));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "factocero-manager-api" });
});

app.get("/api/bootstrap", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  return res.json(db);
});

app.post("/api/tasks", (req, res) => {
  const body = req.body ?? {};

  const task = {
    id: body.id ?? `task-${Date.now()}`,
    title: String(body.title ?? "").trim(),
    description: String(body.description ?? ""),
    status: body.status ?? "todo",
    priority: body.priority ?? "medium",
    projectId: body.projectId ?? "p1",
    assigneeId: body.assigneeId ?? null,
    assigneeIds: Array.isArray(body.assigneeIds) ? body.assigneeIds : [],
    dueDate: body.dueDate ?? null,
    startDate: body.startDate ?? null,
    tags: Array.isArray(body.tags) ? body.tags : [],
    goalId: body.goalId,
    keyResultId: body.keyResultId,
    completed: Boolean(body.completed),
    createdAt: body.createdAt ?? new Date().toISOString().split("T")[0],
    subtasks: Array.isArray(body.subtasks) ? body.subtasks : [],
    collaboratorIds: Array.isArray(body.collaboratorIds) ? body.collaboratorIds : [],
    checklist: Array.isArray(body.checklist) ? body.checklist : [],
  };

  if (!task.title) {
    return res.status(400).json({ error: "title is required" });
  }

  db.tasks.unshift(task);
  res.setHeader("Cache-Control", "no-store");
  return res.status(201).json(task);
});

app.patch("/api/tasks/:id", (req, res) => {
  const id = String(req.params.id);

  const idx = db.tasks.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, error: "Task not found" });

  const updates = req.body ?? {};
  console.log("PATCH body:", req.body);

  const prev = db.tasks[idx];
  const next = { ...prev, ...updates };

  if (typeof updates.status === "string") next.completed = updates.status === "done";
  if (typeof updates.completed === "boolean") next.status = updates.completed ? "done" : prev.status;

  db.tasks[idx] = next;

  res.setHeader("Cache-Control", "no-store");
  return res.json(next);
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
