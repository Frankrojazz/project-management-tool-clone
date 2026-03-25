import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import morgan from "morgan";
import passport from "passport";
import { initializePassport } from "./auth/passport";
import { setupOAuthRoutes } from "./auth/routes";
import { 
  securityMiddleware, 
  rateLimiter, 
  authRateLimiter, 
  registerRateLimiter,
  authValidations,
  taskValidations,
  validateRequest
} from "./middleware/security";

const app = express();
app.set('json spaces', 2);

app.disable("etag");

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      process.env.CLIENT_URL_DEV,
      process.env.CLIENT_URL,
      "https://*.vercel.app",
    ].filter(Boolean);

    if (!origin || allowedOrigins.some(allowed => 
      origin === allowed || 
      (allowed.includes('*') && new RegExp(allowed.replace('*', '.*')).test(origin))
    )) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(securityMiddleware);
app.use(morgan("tiny"));
app.use(rateLimiter);
app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" }));

if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is required');
  console.error('   Please set JWT_SECRET in your .env file');
  console.error('   Example: JWT_SECRET=your-secure-random-string-at-least-32-chars');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = Number(process.env.PORT) || 4000;

const db = new Database("data/projectify.db");

db.pragma("journal_mode = WAL");

// Initialize Passport OAuth
initializePassport(db);
app.use(passport.initialize());
const oauthRouter = setupOAuthRoutes(app, db);
app.use('/auth', oauthRouter);

app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true, service: 'fc-manager-api' });
});

type DB = {
  users: any[];
  projects: any[];
  tasks: any[];
  goals: any[];
  inbox: any[];
};

type InvitationRecord = {
  token: string;
  projectId: string;
  email: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired' | 'rejected';
  expiresAt: string;
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

let inMemoryDb: DB = JSON.parse(JSON.stringify(initialData));
let inMemoryInvitations: InvitationRecord[] = [];

function getInMemoryData() {
  try {
    const users = db.prepare("SELECT id, name, email, avatar, color, role, joined_date as joinedDate FROM users").all();
    const projects = db.prepare("SELECT * FROM projects").all();
    const tasks = db.prepare("SELECT * FROM tasks").all();
    const goals = db.prepare("SELECT * FROM goals").all();
    const inbox = db.prepare("SELECT * FROM inbox").all();
    return { users, projects, tasks, goals, inbox };
  } catch (e) {
    return inMemoryDb;
  }
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "factocero-manager-api" });
});

app.post("/api/auth/register", registerRateLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    if (name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({ error: "Name must be 2-50 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    if (password.length < 6 || password.length > 100) {
      return res.status(400).json({ error: "Password must be 6-100 characters" });
    }

    const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const avatar = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);
    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    db.prepare(`
      INSERT INTO users (id, name, email, password, avatar, color, role, joined_date)
      VALUES (?, ?, ?, ?, ?, ?, 'member', datetime('now'))
    `).run(userId, name, email, hashedPassword, avatar, color);

    const user = db.prepare("SELECT id, name, email, avatar, color, role, joined_date as joinedDate FROM users WHERE id = ?").get(userId) as any;

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token, user });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        color: user.color,
        role: user.role,
        joinedDate: user.joined_date,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.get("/api/auth/me", authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = db.prepare("SELECT id, name, email, avatar, color, role, joined_date as joinedDate FROM users WHERE id = ?").get(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

app.post("/api/auth/logout", authMiddleware, (req: express.Request, res: express.Response) => {
  res.json({ message: "Logged out successfully" });
});

app.get("/api/bootstrap", authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user.userId;
    
    const users = db.prepare("SELECT id, name, email, avatar, color, role FROM users").all();

    const userProjectIds = db.prepare(`
      SELECT project_id FROM project_members WHERE user_id = ?
    `).all(userId) as { project_id: string }[];

    const accessibleProjectIds = userProjectIds.map(p => p.project_id);
    const projectIdsStr = accessibleProjectIds.length > 0 
      ? accessibleProjectIds.map(id => `'${id}'`).join(',') 
      : "''";

    const projects = accessibleProjectIds.length > 0
      ? db.prepare(`SELECT * FROM projects WHERE id IN (${projectIdsStr})`).all()
      : [];

    const tasks = accessibleProjectIds.length > 0
      ? db.prepare(`SELECT * FROM tasks WHERE project_id IN (${projectIdsStr}) ORDER BY created_at DESC`).all()
      : [];

    const goals = db.prepare("SELECT * FROM goals").all();
    const filteredGoals = goals.filter((g: any) => 
      !g.projectIds || g.projectIds.length === 0 || 
      JSON.parse(g.projectIds || '[]').some((pid: string) => accessibleProjectIds.includes(pid))
    );

    const inbox = db.prepare("SELECT * FROM inbox WHERE recipient_id = ? OR recipient_id = ?").all(userId, 'all');

    console.log(`[BOOTSTRAP] userId=${userId} | projects=${projects.length} | tasks=${tasks.length} | goals=${filteredGoals.length}`);

    res.setHeader("Cache-Control", "no-store");
    res.json({
      users,
      projects,
      tasks,
      goals: filteredGoals,
      inbox,
    });
  } catch (error) {
    console.error("Bootstrap error:", error);
    res.status(500).json({ error: "Failed to load data" });
  }
});

app.post("/api/tasks", authMiddleware, taskValidations.create, (req, res) => {
  const body = req.body ?? {};

  if (!body.projectId) {
    return res.status(400).json({ error: "projectId is required" });
  }

  const task = {
    id: body.id ?? `task-${Date.now()}`,
    title: String(body.title ?? "").trim(),
    description: String(body.description ?? ""),
    status: body.status ?? "todo",
    priority: body.priority ?? "medium",
    projectId: body.projectId,
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

  try {
    db.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, projectId, assigneeId, assigneeIds, dueDate, startDate, tags, goalId, keyResultId, completed, createdAt, subtasks, collaboratorIds, checklist)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      task.id, task.title, task.description, task.status, task.priority, task.projectId,
      task.assigneeId, JSON.stringify(task.assigneeIds), task.dueDate, task.startDate,
      JSON.stringify(task.tags), task.goalId, task.keyResultId, task.completed ? 1 : 0,
      task.createdAt, JSON.stringify(task.subtasks), JSON.stringify(task.collaboratorIds),
      JSON.stringify(task.checklist)
    );
  } catch (e) {
    inMemoryDb.tasks.unshift(task);
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(201).json(task);
});

app.patch("/api/tasks/:id", authMiddleware, taskValidations.update, (req, res) => {
  const id = String(req.params.id);
  const updates = req.body ?? {};

  try {
    const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({ ok: false, error: "Task not found" });

    const prev = existing as any;
    const next = { ...prev, ...updates };

    if (typeof updates.status === "string") next.completed = updates.status === "done";
    if (typeof updates.completed === "boolean") next.status = next.completed ? "done" : prev.status;

    const fields = Object.keys(next).filter(k => k !== 'id');
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => {
      const val = next[f];
      if (Array.isArray(val)) return JSON.stringify(val);
      if (typeof val === 'boolean') return val ? 1 : 0;
      return val;
    });

    db.prepare(`UPDATE tasks SET ${setClause} WHERE id = ?`).run(...values, id);

    res.setHeader("Cache-Control", "no-store");
    return res.json(next);
  } catch (e) {
    console.error("Patch task error:", e);
    const idx = inMemoryDb.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return res.status(404).json({ ok: false, error: "Task not found" });

    const prev = inMemoryDb.tasks[idx];
    const next = { ...prev, ...updates };

    if (typeof updates.status === "string") next.completed = updates.status === "done";
    if (typeof updates.completed === "boolean") next.status = next.completed ? "done" : prev.status;

    inMemoryDb.tasks[idx] = next;

    res.setHeader("Cache-Control", "no-store");
    return res.json(next);
  }
});

function generateInvitationToken() {
  return `inv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getProjectMembersFromMemory(projectId: string) {
  const project = inMemoryDb.projects.find((p) => p.id === projectId);
  if (!project) return [];

  const memberIds: string[] = Array.isArray(project.memberIds) ? project.memberIds : [];
  return memberIds
    .map((memberId) => inMemoryDb.users.find((u) => u.id === memberId))
    .filter(Boolean)
    .map((user, index) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      color: user.color,
      role: index === 0 ? 'owner' : 'member',
      joinedAt: new Date().toISOString(),
    }));
}

app.get('/api/projects/:projectId/members', authMiddleware, (req, res) => {
  const projectId = String(req.params.projectId);
  const userId = (req as any).user.userId;

  try {
    const membership = db
      .prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?')
      .get(projectId, userId) as { role: string } | undefined;

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this project' });
    }

    const members = db
      .prepare(`
        SELECT
          pm.user_id as id,
          u.name,
          u.email,
          u.avatar,
          u.color,
          pm.role,
          pm.joined_at as joinedAt
        FROM project_members pm
        JOIN users u ON u.id = pm.user_id
        WHERE pm.project_id = ?
        ORDER BY CASE pm.role WHEN 'owner' THEN 0 ELSE 1 END, pm.joined_at ASC
      `)
      .all(projectId);

    return res.json({ members, isOwner: membership.role === 'owner' });
  } catch (_error) {
    const members = getProjectMembersFromMemory(projectId);
    const current = members.find((m) => m.id === userId);

    if (!current) {
      return res.status(403).json({ error: 'You are not a member of this project' });
    }

    return res.json({ members, isOwner: current.role === 'owner' });
  }
});

app.delete('/api/projects/:projectId/members/:memberId', authMiddleware, (req, res) => {
  const projectId = String(req.params.projectId);
  const memberId = String(req.params.memberId);
  const userId = (req as any).user.userId;

  try {
    const requesterMembership = db
      .prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?')
      .get(projectId, userId) as { role: string } | undefined;

    if (!requesterMembership || requesterMembership.role !== 'owner') {
      return res.status(403).json({ error: 'Only project owners can remove members' });
    }

    const targetMembership = db
      .prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?')
      .get(projectId, memberId) as { role: string } | undefined;

    if (!targetMembership) {
      return res.status(404).json({ error: 'Member not found in project' });
    }

    if (targetMembership.role === 'owner') {
      return res.status(400).json({ error: 'Cannot remove project owner' });
    }

    db.prepare('DELETE FROM project_members WHERE project_id = ? AND user_id = ?').run(projectId, memberId);
    return res.json({ success: true });
  } catch (_error) {
    const project = inMemoryDb.projects.find((p) => p.id === projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const ownerId = Array.isArray(project.memberIds) ? project.memberIds[0] : null;
    if (ownerId !== userId) {
      return res.status(403).json({ error: 'Only project owners can remove members' });
    }
    if (memberId === ownerId) {
      return res.status(400).json({ error: 'Cannot remove project owner' });
    }

    project.memberIds = (project.memberIds || []).filter((id: string) => id !== memberId);
    return res.json({ success: true });
  }
});

app.post('/api/projects/:projectId/invite', authMiddleware, (req, res) => {
  const projectId = String(req.params.projectId);
  const userId = (req as any).user.userId;
  const email = String(req.body?.email || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const requesterMembership = db
      .prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?')
      .get(projectId, userId) as { role: string } | undefined;

    if (!requesterMembership || requesterMembership.role !== 'owner') {
      return res.status(403).json({ error: 'Only project owners can invite members' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE lower(email) = ?').get(email) as { id: string } | undefined;

    if (existingUser) {
      const existingMembership = db
        .prepare('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?')
        .get(projectId, existingUser.id);

      if (existingMembership) {
        return res.status(200).json({ message: 'User is already a member', addedDirectly: false, resend: false });
      }

      db.prepare('INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES (?, ?, ?, datetime("now"))')
        .run(projectId, existingUser.id, 'member');

      return res.status(200).json({ message: 'User added to project', addedDirectly: true, resend: false });
    }

    const token = generateInvitationToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const pending = db
      .prepare('SELECT token FROM invitations WHERE project_id = ? AND lower(email) = ? AND status = ?')
      .get(projectId, email, 'pending') as { token: string } | undefined;

    if (pending) {
      return res.status(200).json({
        message: 'Invitation resent',
        addedDirectly: false,
        resend: true,
        inviteLink: `/accept-invite?token=${pending.token}`,
      });
    }

    db.prepare(`
      INSERT INTO invitations (project_id, email, invited_by, token, status, expires_at, created_at)
      VALUES (?, ?, ?, ?, 'pending', ?, datetime('now'))
    `).run(projectId, email, userId, token, expiresAt);

    return res.status(200).json({
      message: 'Invitation sent',
      addedDirectly: false,
      resend: false,
      inviteLink: `/accept-invite?token=${token}`,
    });
  } catch (_error) {
    const token = generateInvitationToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const pending = inMemoryInvitations.find(
      (inv) => inv.projectId === projectId && inv.email === email && inv.status === 'pending'
    );

    if (pending) {
      return res.status(200).json({
        message: 'Invitation resent',
        addedDirectly: false,
        resend: true,
        inviteLink: `/accept-invite?token=${pending.token}`,
      });
    }

    inMemoryInvitations.push({
      token,
      projectId,
      email,
      invitedBy: userId,
      status: 'pending',
      expiresAt,
    });

    return res.status(200).json({
      message: 'Invitation sent',
      addedDirectly: false,
      resend: false,
      inviteLink: `/accept-invite?token=${token}`,
    });
  }
});

app.get('/api/invitations/verify/:token', (req, res) => {
  const token = String(req.params.token);

  try {
    const invitation = db
      .prepare('SELECT * FROM invitations WHERE token = ?')
      .get(token) as any;

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }
    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: `Invitation is ${invitation.status}`, status: invitation.status });
    }
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      db.prepare('UPDATE invitations SET status = ? WHERE token = ?').run('expired', token);
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    const project = db.prepare('SELECT id, name, color, icon, description FROM projects WHERE id = ?').get(invitation.project_id) as any;
    const inviter = db.prepare('SELECT name FROM users WHERE id = ?').get(invitation.invited_by) as any;

    return res.json({
      valid: true,
      email: invitation.email,
      project,
      inviterName: inviter?.name || 'Someone',
      expiresAt: invitation.expires_at,
    });
  } catch (_error) {
    const invitation = inMemoryInvitations.find((inv) => inv.token === token);
    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: `Invitation is ${invitation.status}`, status: invitation.status });
    }
    if (new Date(invitation.expiresAt) < new Date()) {
      invitation.status = 'expired';
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    const project = inMemoryDb.projects.find((p) => p.id === invitation.projectId);
    const inviter = inMemoryDb.users.find((u) => u.id === invitation.invitedBy);

    return res.json({
      valid: true,
      email: invitation.email,
      project,
      inviterName: inviter?.name || 'Someone',
      expiresAt: invitation.expiresAt,
    });
  }
});

app.post('/api/invitations/:token/accept', authMiddleware, (req, res) => {
  const token = String(req.params.token);
  const userId = (req as any).user.userId;
  const userEmail = String((req as any).user.email || '').toLowerCase();

  try {
    const invitation = db
      .prepare('SELECT * FROM invitations WHERE token = ?')
      .get(token) as any;

    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
    if (invitation.status !== 'pending') return res.status(400).json({ error: 'Invitation already processed' });
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      db.prepare('UPDATE invitations SET status = ? WHERE token = ?').run('expired', token);
      return res.status(400).json({ error: 'Invitation has expired' });
    }
    if (String(invitation.email || '').toLowerCase() !== userEmail) {
      return res.status(403).json({ error: 'This invitation was sent to a different email address' });
    }

    const existingMembership = db
      .prepare('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?')
      .get(invitation.project_id, userId);

    if (!existingMembership) {
      db.prepare('INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES (?, ?, ?, datetime("now"))')
        .run(invitation.project_id, userId, 'member');
    }

    db.prepare('UPDATE invitations SET status = ?, accepted_at = datetime("now") WHERE token = ?')
      .run('accepted', token);

    return res.json({ success: true, projectId: invitation.project_id, message: 'Invitation accepted' });
  } catch (_error) {
    const invitation = inMemoryInvitations.find((inv) => inv.token === token);
    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
    if (invitation.status !== 'pending') return res.status(400).json({ error: 'Invitation already processed' });
    if (new Date(invitation.expiresAt) < new Date()) {
      invitation.status = 'expired';
      return res.status(400).json({ error: 'Invitation has expired' });
    }
    if (invitation.email.toLowerCase() !== userEmail) {
      return res.status(403).json({ error: 'This invitation was sent to a different email address' });
    }

    const project = inMemoryDb.projects.find((p) => p.id === invitation.projectId);
    if (project) {
      const members = Array.isArray(project.memberIds) ? project.memberIds : [];
      if (!members.includes(userId)) {
        members.push(userId);
      }
      project.memberIds = members;
    }

    invitation.status = 'accepted';
    return res.json({ success: true, projectId: invitation.projectId, message: 'Invitation accepted' });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log(`JWT authentication enabled`);
});
