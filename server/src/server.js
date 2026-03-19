const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.set('json spaces', 2);

app.disable("etag");

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CLIENT_URL_DEV || "http://localhost:5173",
      process.env.CLIENT_URL || "http://localhost:5173",
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

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));

// ============================================
// Configuration
// ============================================

if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is required');
  console.error('   Please set JWT_SECRET in your .env file');
  console.error('   Example: JWT_SECRET=your-secure-random-string-at-least-32-chars');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, '..', 'data', 'projectify.db');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);
console.log('📦 SQLite database initialized at:', DB_PATH);

// ============================================
// Database Setup
// ============================================

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT,
    color TEXT,
    role TEXT DEFAULT 'member',
    joined_date TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    icon TEXT,
    is_favorite INTEGER DEFAULT 0,
    member_ids TEXT DEFAULT '[]',
    owner_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    project_id TEXT,
    assignee_id TEXT,
    assignee_ids TEXT DEFAULT '[]',
    due_date TEXT,
    start_date TEXT,
    tags TEXT DEFAULT '[]',
    goal_id TEXT,
    key_result_id TEXT,
    completed INTEGER DEFAULT 0,
    created_at TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    subtasks TEXT DEFAULT '[]',
    collaborator_ids TEXT DEFAULT '[]',
    checklist TEXT DEFAULT '[]',
    created_by TEXT
  );

  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'on_track',
    progress INTEGER DEFAULT 0,
    owner TEXT,
    due_date TEXT,
    project_ids TEXT DEFAULT '[]',
    key_results TEXT DEFAULT '[]',
    parent_goal_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT
  );

  CREATE TABLE IF NOT EXISTS inbox (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    sender_id TEXT,
    recipient_id TEXT,
    read INTEGER DEFAULT 0,
    task_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS project_members (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    invited_by TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT
  );
`);

// ============================================
// Helper Functions
// ============================================

function parseJSON(str, defaultValue) {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

function getOne(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.get(...params);
}

function getAll(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

function run(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Seed initial data
// ============================================

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  console.log('🌱 Seeding initial data...');
  
  const hashedPassword = bcrypt.hashSync('demo123', 10);
  
  // Seed users
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, avatar, color, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertUser.run('u1', 'Sarah Chen', 'sarah@fcmanager.io', hashedPassword, 'SC', '#8B5CF6', 'admin');
  insertUser.run('u2', 'Alex Rivera', 'alex@fcmanager.io', hashedPassword, 'AR', '#3B82F6', 'member');
  insertUser.run('u3', 'Jordan Lee', 'jordan@fcmanager.io', hashedPassword, 'JL', '#10B981', 'member');
  insertUser.run('u4', 'Morgan Kim', 'morgan@fcmanager.io', hashedPassword, 'MK', '#F59E0B', 'member');
  insertUser.run('u5', 'Taylor Swift', 'taylor@fcmanager.io', hashedPassword, 'TS', '#EF4444', 'member');

  // Seed projects
  const insertProject = db.prepare(`
    INSERT INTO projects (id, name, description, color, icon, is_favorite, member_ids, owner_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertProject.run('p1', 'Website Redesign', 'Complete overhaul of the company website', '#8B5CF6', '🎨', 1, '["u1","u2","u3"]', 'u1');
  insertProject.run('p2', 'Mobile App', 'Native mobile application', '#3B82F6', '📱', 1, '["u1","u2","u3"]', 'u1');
  insertProject.run('p3', 'Marketing Campaign', 'Q4 marketing campaign', '#10B981', '📢', 0, '["u1","u2","u3"]', 'u1');
  insertProject.run('p4', 'API Integration', 'Third-party API integrations', '#F59E0B', '🔗', 0, '["u1","u2","u3"]', 'u1');

  // Seed project members
  const insertMember = db.prepare(`
    INSERT INTO project_members (id, project_id, user_id, role, joined_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);
  
  // p1 - Website Redesign (owner: u1)
  insertMember.run('m1', 'p1', 'u1', 'owner');
  insertMember.run('m2', 'p1', 'u2', 'member');
  insertMember.run('m3', 'p1', 'u3', 'member');
  
  // p2 - Mobile App (owner: u1)
  insertMember.run('m4', 'p2', 'u1', 'owner');
  insertMember.run('m5', 'p2', 'u2', 'member');
  insertMember.run('m6', 'p2', 'u3', 'member');
  
  // p3 - Marketing Campaign (owner: u1)
  insertMember.run('m7', 'p3', 'u1', 'owner');
  insertMember.run('m8', 'p3', 'u2', 'member');
  insertMember.run('m9', 'p3', 'u3', 'member');
  
  // p4 - API Integration (owner: u1)
  insertMember.run('m10', 'p4', 'u1', 'owner');
  insertMember.run('m11', 'p4', 'u2', 'member');
  insertMember.run('m12', 'p4', 'u3', 'member');

  // Seed tasks
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, due_date, start_date, tags, completed, created_at, subtasks, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertTask.run('task-100', 'Design new homepage layout', 'Create wireframes and mockups', 'in_progress', 'high', 'p1', 'u1', '2025-07-15', '2025-07-01', '["design"]', 0, '2025-06-10', '[]', 'u1');
  insertTask.run('task-101', 'Achieve 90+ Lighthouse score', 'Optimize performance', 'todo', 'high', 'p1', 'u3', '2025-07-25', '2025-07-10', '["performance"]', 0, '2025-06-20', '[]', 'u1');

  // Seed goals
  const insertGoal = db.prepare(`
    INSERT INTO goals (id, title, description, status, progress, owner, due_date, project_ids, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertGoal.run('g1', 'Launch new website', 'Complete website redesign', 'on_track', 65, 'Sarah Chen', '2025-08-01', '["p1"]', 'u1');

  console.log('✅ Initial data seeded');
  console.log('📝 Demo login: sarah@projectify.io / demo123');
}

// ============================================
// Transform functions
// ============================================

function transformUser(row, includePassword = false) {
  if (!row) return null;
  const user = {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    color: row.color,
    role: row.role,
    joinedDate: row.joined_date,
  };
  if (includePassword) {
    user.password = row.password;
  }
  return user;
}

function transformProject(row) {
  if (!row) return null;
  
  // Get members from project_members table
  const members = getAll(`
    SELECT u.id, u.name, u.email, u.avatar, u.color, pm.role, pm.joined_at
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
  `, [row.id]);
  
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color: row.color,
    icon: row.icon,
    isFavorite: !!row.is_favorite,
    memberIds: parseJSON(row.member_ids, []),
    ownerId: row.owner_id,
    members: members.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      avatar: m.avatar,
      color: m.color,
      role: m.role,
      joinedAt: m.joined_at,
    })),
  };
}

function transformTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    projectId: row.project_id,
    assigneeId: row.assignee_id,
    assigneeIds: parseJSON(row.assignee_ids, []),
    dueDate: row.due_date,
    startDate: row.start_date,
    tags: parseJSON(row.tags, []),
    goalId: row.goal_id,
    keyResultId: row.key_result_id,
    completed: !!row.completed,
    createdAt: row.created_at,
    subtasks: parseJSON(row.subtasks, []),
    collaboratorIds: parseJSON(row.collaborator_ids, []),
    checklist: parseJSON(row.checklist, []),
  };
}

function transformGoal(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    progress: row.progress,
    owner: row.owner,
    dueDate: row.due_date,
    projectIds: parseJSON(row.project_ids, []),
    keyResults: parseJSON(row.key_results, []),
    parentGoalId: row.parent_goal_id,
  };
}

function transformInbox(row) {
  if (!row) return null;
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    read: !!row.read,
    taskId: row.task_id,
    createdAt: row.created_at,
  };
}

// ============================================
// Auth Middleware
// ============================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  });
}

// ============================================
// Public Routes
// ============================================

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "factocero-manager-api", database: "sqlite", auth: "jwt" });
});

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = getOne('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId('user');

    // Generate avatar from name
    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Insert user
    run(`
      INSERT INTO users (id, name, email, password, avatar, color, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [userId, name, email, hashedPassword, avatar, color, 'member']);

    // Get user without password
    const user = getOne('SELECT * FROM users WHERE id = ?', [userId]);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: transformUser(user)
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = getOne('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: transformUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
app.get("/api/auth/me", authenticateToken, (req, res) => {
  try {
    const user = getOne('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: transformUser(user) });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Bootstrap - get all data (authenticated)
app.get("/api/bootstrap", authenticateToken, (req, res) => {
  try {
    const userId = req.userId;
    const users = getAll('SELECT * FROM users').map(u => transformUser(u));
    const projects = getAll(`
      SELECT DISTINCT p.* FROM projects p
      INNER JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = ?
    `, [userId]).map(transformProject);
    const projectIds = projects.map(p => p.id);
    const tasks = getAll('SELECT * FROM tasks ORDER BY created_at DESC').map(transformTask);
    const goals = getAll('SELECT * FROM goals').map(transformGoal);
    const inbox = getAll('SELECT * FROM inbox WHERE recipient_id = ? OR recipient_id IS NULL ORDER BY created_at DESC', [userId]).map(transformInbox);

    res.setHeader("Cache-Control", "no-store");
    return res.json({ users, projects, tasks, goals, inbox });
  } catch (err) {
    console.error('Bootstrap error:', err);
    return res.status(500).json({ ok: false, error: 'Failed to load data' });
  }
});

// ============================================
// Tasks CRUD (Protected)
// ============================================

app.post("/api/tasks", authenticateToken, (req, res) => {
  try {
    const body = req.body || {};
    
    const id = body.id || generateId('task');
    const title = String(body.title || "").trim();
    const description = String(body.description || "");
    const status = body.status || "todo";
    const priority = body.priority || "medium";
    const projectId = body.projectId || null;
    const assigneeId = body.assigneeId || null;
    const assigneeIds = JSON.stringify(Array.isArray(body.assigneeIds) ? body.assigneeIds : []);
    const dueDate = body.dueDate || null;
    const startDate = body.startDate || null;
    const tags = JSON.stringify(Array.isArray(body.tags) ? body.tags : []);
    const goalId = body.goalId || null;
    const keyResultId = body.keyResultId || null;
    const completed = body.completed ? 1 : 0;
    const createdAt = body.createdAt || new Date().toISOString().split("T")[0];
    const subtasks = JSON.stringify(Array.isArray(body.subtasks) ? body.subtasks : []);
    const collaboratorIds = JSON.stringify(Array.isArray(body.collaboratorIds) ? body.collaboratorIds : []);
    const checklist = JSON.stringify(Array.isArray(body.checklist) ? body.checklist : []);

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    run(`
      INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, assignee_ids, due_date, start_date, tags, goal_id, key_result_id, completed, created_at, subtasks, collaborator_ids, checklist, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, title, description, status, priority, projectId, assigneeId, assigneeIds, dueDate, startDate, tags, goalId, keyResultId, completed, createdAt, subtasks, collaboratorIds, checklist, req.userId]);

    const task = getOne('SELECT * FROM tasks WHERE id = ?', [id]);
    
    res.setHeader("Cache-Control", "no-store");
    return res.status(201).json(transformTask(task));
  } catch (err) {
    console.error('Create task error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.patch("/api/tasks/:id", authenticateToken, (req, res) => {
  try {
    const id = String(req.params.id);
    const updates = req.body || {};

    const existing = getOne('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ ok: false, error: "Task not found" });
    }

    const status = updates.status !== undefined ? updates.status : existing.status;
    const completed = updates.completed !== undefined ? (updates.completed ? 1 : 0) : existing.completed;
    const finalStatus = status === 'done' || completed ? 'done' : status;
    const finalCompleted = status === 'done' || completed ? 1 : 0;

    const fields = [];
    const values = [];

    if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
    if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
    fields.push('status = ?'); values.push(finalStatus);
    fields.push('completed = ?'); values.push(finalCompleted);
    if (updates.priority !== undefined) { fields.push('priority = ?'); values.push(updates.priority); }
    if (updates.projectId !== undefined) { fields.push('project_id = ?'); values.push(updates.projectId); }
    if (updates.assigneeId !== undefined) { fields.push('assignee_id = ?'); values.push(updates.assigneeId); }
    if (updates.assigneeIds !== undefined) { fields.push('assignee_ids = ?'); values.push(JSON.stringify(updates.assigneeIds)); }
    if (updates.dueDate !== undefined) { fields.push('due_date = ?'); values.push(updates.dueDate); }
    if (updates.startDate !== undefined) { fields.push('start_date = ?'); values.push(updates.startDate); }
    if (updates.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(updates.tags)); }
    if (updates.subtasks !== undefined) { fields.push('subtasks = ?'); values.push(JSON.stringify(updates.subtasks)); }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    run(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);

    const task = getOne('SELECT * FROM tasks WHERE id = ?', [id]);

    res.setHeader("Cache-Control", "no-store");
    return res.json(transformTask(task));
  } catch (err) {
    console.error('Update task error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/api/tasks/:id", authenticateToken, (req, res) => {
  try {
    const id = String(req.params.id);
    const existing = getOne('SELECT * FROM tasks WHERE id = ?', [id]);
    
    if (!existing) {
      return res.status(404).json({ ok: false, error: "Task not found" });
    }

    run('DELETE FROM tasks WHERE id = ?', [id]);

    res.setHeader("Cache-Control", "no-store");
    return res.json({ ok: true });
  } catch (err) {
    console.error('Delete task error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ============================================
// Projects CRUD (Protected)
// ============================================

app.post("/api/projects", authenticateToken, (req, res) => {
  try {
    const body = req.body || {};
    
    const id = generateId('project');
    const name = String(body.name || "").trim();
    const description = body.description || "";
    const color = body.color || "#8B5CF6";
    const icon = body.icon || "📁";
    const isFavorite = body.isFavorite ? 1 : 0;
    const memberIds = JSON.stringify([req.userId, ...(Array.isArray(body.memberIds) ? body.memberIds : [])]);

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    run(`
      INSERT INTO projects (id, name, description, color, icon, is_favorite, member_ids, owner_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, description, color, icon, isFavorite, memberIds, req.userId]);

    // Add owner as project member with 'owner' role
    const memberId = generateId('member');
    run(`
      INSERT INTO project_members (id, project_id, user_id, role, joined_at)
      VALUES (?, ?, ?, 'owner', datetime('now'))
    `, [memberId, id, req.userId]);

    const project = getOne('SELECT * FROM projects WHERE id = ?', [id]);
    
    res.setHeader("Cache-Control", "no-store");
    return res.status(201).json(transformProject(project));
  } catch (err) {
    console.error('Create project error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.patch("/api/projects/:id", authenticateToken, (req, res) => {
  try {
    const id = String(req.params.id);
    const updates = req.body || {};

    const existing = getOne('SELECT * FROM projects WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ ok: false, error: "Project not found" });
    }

    const fields = [];
    const values = [];

    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
    if (updates.color !== undefined) { fields.push('color = ?'); values.push(updates.color); }
    if (updates.icon !== undefined) { fields.push('icon = ?'); values.push(updates.icon); }
    if (updates.isFavorite !== undefined) { fields.push('is_favorite = ?'); values.push(updates.isFavorite ? 1 : 0); }
    if (updates.memberIds !== undefined) { fields.push('member_ids = ?'); values.push(JSON.stringify(updates.memberIds)); }

    values.push(id);

    run(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);

    const project = getOne('SELECT * FROM projects WHERE id = ?', [id]);

    res.setHeader("Cache-Control", "no-store");
    return res.json(transformProject(project));
  } catch (err) {
    console.error('Update project error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/api/projects/:id", authenticateToken, (req, res) => {
  try {
    const id = String(req.params.id);
    const existing = getOne('SELECT * FROM projects WHERE id = ?', [id]);
    
    if (!existing) {
      return res.status(404).json({ ok: false, error: "Project not found" });
    }

    // Only owner can delete
    if (existing.owner_id !== req.userId) {
      return res.status(403).json({ error: "Only the owner can delete this project" });
    }

    run('DELETE FROM tasks WHERE project_id = ?', [id]);
    run('DELETE FROM projects WHERE id = ?', [id]);

    res.setHeader("Cache-Control", "no-store");
    return res.json({ ok: true });
  } catch (err) {
    console.error('Delete project error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ============================================
// Goals CRUD (Protected)
// ============================================

app.post("/api/goals", authenticateToken, (req, res) => {
  try {
    const body = req.body || {};
    
    const id = generateId('goal');
    const title = String(body.title || "").trim();
    const description = body.description || "";
    const status = body.status || "on_track";
    const progress = body.progress || 0;
    const owner = body.owner || "";
    const dueDate = body.dueDate || null;
    const projectIds = JSON.stringify(Array.isArray(body.projectIds) ? body.projectIds : []);
    const keyResults = JSON.stringify(Array.isArray(body.keyResults) ? body.keyResults : []);

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    run(`
      INSERT INTO goals (id, title, description, status, progress, owner, due_date, project_ids, key_results, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, title, description, status, progress, owner, dueDate, projectIds, keyResults, req.userId]);

    const goal = getOne('SELECT * FROM goals WHERE id = ?', [id]);
    
    res.setHeader("Cache-Control", "no-store");
    return res.status(201).json(transformGoal(goal));
  } catch (err) {
    console.error('Create goal error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.patch("/api/goals/:id", authenticateToken, (req, res) => {
  try {
    const id = String(req.params.id);
    const updates = req.body || {};

    const existing = getOne('SELECT * FROM goals WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ ok: false, error: "Goal not found" });
    }

    const fields = [];
    const values = [];

    if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
    if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
    if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
    if (updates.progress !== undefined) { fields.push('progress = ?'); values.push(updates.progress); }
    if (updates.owner !== undefined) { fields.push('owner = ?'); values.push(updates.owner); }
    if (updates.dueDate !== undefined) { fields.push('due_date = ?'); values.push(updates.dueDate); }
    if (updates.projectIds !== undefined) { fields.push('project_ids = ?'); values.push(JSON.stringify(updates.projectIds)); }
    if (updates.keyResults !== undefined) { fields.push('key_results = ?'); values.push(JSON.stringify(updates.keyResults)); }

    values.push(id);

    run(`UPDATE goals SET ${fields.join(', ')} WHERE id = ?`, values);

    const goal = getOne('SELECT * FROM goals WHERE id = ?', [id]);

    res.setHeader("Cache-Control", "no-store");
    return res.json(transformGoal(goal));
  } catch (err) {
    console.error('Update goal error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/api/goals/:id", authenticateToken, (req, res) => {
  try {
    const id = String(req.params.id);
    const existing = getOne('SELECT * FROM goals WHERE id = ?', [id]);
    
    if (!existing) {
      return res.status(404).json({ ok: false, error: "Goal not found" });
    }

    run('DELETE FROM goals WHERE id = ?', [id]);

    res.setHeader("Cache-Control", "no-store");
    return res.json({ ok: true });
  } catch (err) {
    console.error('Delete goal error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ============================================
// Project Collaboration System
// ============================================

// Constants
const INVITATION_EXPIRY_DAYS = 7;
const INVITATION_EXPIRY_MS = INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// ============================================
// Email Service (Resend)
// ============================================
let resend = null;

function initEmailService() {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const SENDER_EMAIL = process.env.SENDER_EMAIL || 'FC Manager <noreply@fcmanager.io>';
  
  if (!RESEND_API_KEY) {
    console.log('⚠️  RESEND_API_KEY not set - emails will be simulated');
    return null;
  }
  
  try {
    const { Resend } = require('resend');
    resend = new Resend(RESEND_API_KEY);
    console.log('📧 Resend email service initialized');
    console.log(`   Sender: ${SENDER_EMAIL}`);
    return { apiKey: RESEND_API_KEY, senderEmail: SENDER_EMAIL };
  } catch (err) {
    console.error('❌ Failed to initialize Resend:', err.message);
    return null;
  }
}

const emailConfig = initEmailService();

async function sendProjectInvitationEmail({ email, projectName, inviterName, inviteUrl }) {
  const senderEmail = emailConfig?.senderEmail || 'FC Manager <noreply@fcmanager.io>';
  
  // Fallback: console log if no API key
  if (!emailConfig) {
    console.log(`
   📧 EMAIL (Simulated - no RESEND_API_KEY)
   --------------------------------
   To: ${email}
   Subject: You've been invited to join "${projectName}"
   
   Hi!
   
   ${inviterName} has invited you to join their project "${projectName}".
   
   Click the link below to accept the invitation:
   ${inviteUrl}
   
   This invitation expires in 7 days.
   --------------------------------
   `);
    return { success: true, simulated: true };
  }
  
  try {
    const result = await resend.emails.send({
      from: senderEmail,
      to: email,
      subject: `You've been invited to join "${projectName}"`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); padding: 40px 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">FC Manager</h1>
                      </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px; font-weight: 600;">You've been invited!</h2>
                        <p style="margin: 0 0 24px; color: #64748b; font-size: 16px; line-height: 1.6;">
                          <strong style="color: #1e293b;">${inviterName}</strong> has invited you to join their project 
                          <strong style="color: #1e293b;">"${projectName}"</strong>
                        </p>
                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center">
                              <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                                Accept Invitation
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 24px 0 0; color: #94a3b8; font-size: 14px;">
                          This invitation expires in 7 days.
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 20px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                          You're receiving this email because someone invited you to join a project on FC Manager.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
        </body>
        </html>
      `,
    });
    
    console.log(`✅ Email sent to ${email}: ${result.data?.id || 'unknown ID'}`);
    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error(`❌ Failed to send email to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
}

// Helper: Check if user is owner of project
function isProjectOwner(projectId, userId) {
  const project = getOne('SELECT owner_id FROM projects WHERE id = ?', [projectId]);
  return project && project.owner_id === userId;
}

// Helper: Check if user is member of project
function isProjectMember(projectId, userId) {
  const member = getOne(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
    [projectId, userId]
  );
  return member ? member.role : null;
}

// Helper: Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper: Send invitation email (uses Resend if configured, otherwise simulates)
async function sendInvitationEmail(email, projectName, inviterName, token, isResend = false) {
  const inviteUrl = `${APP_URL}/accept-invite?token=${token}`;
  const type = isResend ? 'INVITATION RESENT' : 'NEW INVITATION';
  
  const result = await sendProjectInvitationEmail({
    email,
    projectName,
    inviterName,
    inviteUrl
  });
  
  if (!result.success && !result.simulated) {
    console.error(`   ⚠️  Email may not have been delivered: ${result.error}`);
  }
  
  return result;
}

// Helper: Transform invitation
function transformInvitation(row) {
  if (!row) return null;
  return {
    id: row.id,
    projectId: row.project_id,
    email: row.email,
    token: row.token,
    status: row.status,
    invitedBy: row.invited_by,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

// Helper: Transform project member
function transformMember(row) {
  if (!row) return null;
  return {
    id: row.user_id,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    color: row.color,
    role: row.role,
    joinedAt: row.joined_at,
  };
}

// ============================================
// INVITATION SYSTEM - Modular Architecture
// ============================================

// ─────────────────────────────────────────────
// Main Handler
// ─────────────────────────────────────────────
app.post("/api/projects/:projectId/invite", authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;
    const inviterId = req.userId;

    // 1. Validate input & permissions
    const validation = validateInviteInput(email, projectId, inviterId);
    if (!validation.valid) {
      return res.status(validation.status).json({ error: validation.error });
    }

    const { project, inviterName } = validation;

    // 2. Find user by email
    const user = findUserByEmail(email);

    // 3. If user exists, check if they're trying to invite themselves
    if (user) {
      // Edge case: Check if inviting self (by comparing IDs or emails)
      const inviterEmail = getUserEmail(inviterId);
      if (user.id === inviterId || (email.toLowerCase() === inviterEmail?.toLowerCase())) {
        return res.status(400).json({ error: 'You cannot invite yourself' });
      }

      const existingMember = findProjectMember(projectId, user.id);
      
      if (existingMember) {
        return res.status(400).json({
          error: 'User is already a member',
          code: 'ALREADY_MEMBER',
          user: { id: user.id, name: user.name, email: user.email }
        });
      }

      return addMemberIfExists(project, user, inviterId, inviterName, res);
    }

    // 4. User doesn't exist - check for pending invitation FIRST
    const existingInvite = findPendingInvitation(projectId, email);

    if (existingInvite) {
      return resendInvitation(existingInvite, project, inviterId, inviterName, res);
    }

    // 5. Check for rejected/expired invitations - allow creating new one
    const oldInvite = findAnyInvitation(projectId, email);
    if (oldInvite) {
      // Delete old invitation first
      deleteInvitation(oldInvite.id);
    }

    return createNewInvitation(project, email, inviterId, inviterName, res);

  } catch (err) {
    console.error('Invite error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────
function validateInviteInput(email, projectId, inviterId) {
  if (!email || !isValidEmail(email)) {
    return { valid: false, status: 400, error: 'Valid email is required' };
  }

  const project = getOne(
    'SELECT id, name, member_ids, owner_id FROM projects WHERE id = ?',
    [projectId]
  );
  if (!project) {
    return { valid: false, status: 404, error: 'Project not found' };
  }

  if (!isProjectOwner(projectId, inviterId)) {
    return { valid: false, status: 403, error: 'Only the project owner can invite members' };
  }

  return { 
    valid: true, 
    project,
    inviterName: getUserName(inviterId)
  };
}

// ─────────────────────────────────────────────
// Domain Functions
// ─────────────────────────────────────────────

function addMemberIfExists(project, user, inviterId, inviterName, res) {
  const memberId = generateId('member');

  try {
    run('BEGIN TRANSACTION');

    run(
      'INSERT INTO project_members (id, project_id, user_id, role, joined_at) VALUES (?, ?, ?, ?, datetime(\'now\'))',
      [memberId, project.id, user.id, 'member']
    );

    const memberIds = parseJSON(project.member_ids, []);
    if (!memberIds.includes(user.id)) {
      memberIds.push(user.id);
      run('UPDATE projects SET member_ids = ? WHERE id = ?', [JSON.stringify(memberIds), project.id]);
    }

    run(
      'INSERT INTO inbox (id, type, title, message, sender_id, recipient_id, read, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, datetime(\'now\'))',
      [generateId('inb'), 'info', `You were added to "${project.name}"`, `${inviterName} added you to "${project.name}"`, inviterId, user.id]
    );

    run('COMMIT');

    return res.status(200).json({
      message: 'User added to project',
      addedDirectly: true,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    run('ROLLBACK');
    throw err;
  }
}

async function resendInvitation(invite, project, inviterId, inviterName, res) {
  const newToken = require('crypto').randomBytes(32).toString('hex');
  const newExpiresAt = new Date(Date.now() + INVITATION_EXPIRY_MS).toISOString();

  run(
    'UPDATE invitations SET token = ?, expires_at = ?, created_at = datetime(\'now\') WHERE id = ?',
    [newToken, newExpiresAt, invite.id]
  );

  await sendInvitationEmail(invite.email, project.name, inviterName, newToken, true);
  const updated = getOne('SELECT * FROM invitations WHERE id = ?', [invite.id]);

  return res.status(200).json({
    message: 'Invitation resent',
    invitation: transformInvitation(updated),
    resend: true
  });
}

async function createNewInvitation(project, email, inviterId, inviterName, res) {
  const token = require('crypto').randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_MS).toISOString();
  const invitationId = generateId('invite');

  run(
    'INSERT INTO invitations (id, project_id, email, token, status, invited_by, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [invitationId, project.id, email, token, 'pending', inviterId, expiresAt]
  );

  await sendInvitationEmail(email, project.name, inviterName, token, false);
  const invitation = getOne('SELECT * FROM invitations WHERE id = ?', [invitationId]);

  const inviteLink = `/accept-invite?token=${token}`;

  res.setHeader('Cache-Control', 'no-store');
  return res.status(201).json({
    message: 'Invitation sent',
    invitation: transformInvitation(invitation),
    inviteLink
  });
}

// ─────────────────────────────────────────────
// Query Helpers
// ─────────────────────────────────────────────
function findUserByEmail(email) {
  return getOne('SELECT id, name, email FROM users WHERE LOWER(email) = LOWER(?)', [email]);
}

function findProjectMember(projectId, userId) {
  return getOne('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, userId]);
}

function findPendingInvitation(projectId, email) {
  return getOne(
    'SELECT id, token, email FROM invitations WHERE project_id = ? AND LOWER(email) = LOWER(?) AND status = ?',
    [projectId, email, 'pending']
  );
}

function findAnyInvitation(projectId, email) {
  return getOne(
    'SELECT id, status FROM invitations WHERE project_id = ? AND LOWER(email) = LOWER(?) AND status != ?',
    [projectId, email, 'pending']
  );
}

function deleteInvitation(invitationId) {
  run('DELETE FROM invitations WHERE id = ?', [invitationId]);
}

function getUserName(userId) {
  const user = getOne('SELECT name FROM users WHERE id = ?', [userId]);
  return user?.name || 'Someone';
}

function getUserEmail(userId) {
  const user = getOne('SELECT email FROM users WHERE id = ?', [userId]);
  return user?.email || null;
}

// ============================================
// GET /api/projects/:id/members - Get project members
// ============================================
app.get("/api/projects/:projectId/members", authenticateToken, (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    // Check if project exists
    const project = getOne('SELECT id FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is member or owner
    const userRole = isProjectMember(projectId, userId);
    const isOwner = isProjectOwner(projectId, userId);

    if (!userRole && !isOwner) {
      return res.status(403).json({ error: 'You are not a member of this project' });
    }

    // Get all members
    const members = getAll(`
      SELECT pm.user_id, pm.role, pm.joined_at, u.name, u.email, u.avatar, u.color
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
      ORDER BY pm.role DESC, pm.joined_at ASC
    `, [projectId]);

    res.setHeader('Cache-Control', 'no-store');
    return res.json({
      members: members.map(transformMember),
      isOwner
    });

  } catch (err) {
    console.error('Get members error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ============================================
// DELETE /api/projects/:id/members/:memberId - Remove member (owner only)
// ============================================
app.delete("/api/projects/:projectId/members/:memberId", authenticateToken, (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const currentUserId = req.userId;

    // Check if project exists
    const project = getOne('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only owner can remove members
    if (!isProjectOwner(projectId, currentUserId)) {
      return res.status(403).json({ error: 'Only the project owner can remove members' });
    }

    // Cannot remove yourself (owner)
    if (memberId === currentUserId) {
      return res.status(400).json({ error: 'Cannot remove yourself from the project. Transfer ownership first.' });
    }

    // Check if member exists
    const member = getOne(
      'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, memberId]
    );

    if (!member) {
      return res.status(404).json({ error: 'Member not found in this project' });
    }

    // Remove member
    run('DELETE FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, memberId]);

    // Update project's member_ids
    const memberIds = parseJSON(project.member_ids, []);
    const updatedIds = memberIds.filter(id => id !== memberId);
    run('UPDATE projects SET member_ids = ? WHERE id = ?', [JSON.stringify(updatedIds), projectId]);

    res.setHeader("Cache-Control", "no-store");
    return res.json({ message: 'Member removed successfully' });

  } catch (err) {
    console.error('Remove member error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ============================================
// POST /api/invitations/:token/accept - Accept invitation
// ============================================
app.post("/api/invitations/:token/accept", authenticateToken, (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.userId;
    const user = getOne('SELECT * FROM users WHERE id = ?', [userId]);

    // Find invitation
    const invitation = getOne(
      'SELECT * FROM invitations WHERE token = ? AND status = ?',
      [token, 'pending']
    );

    if (!invitation) {
      return res.status(404).json({ 
        error: 'Invitation not found or already processed',
        message: 'Invitation not found or already processed',
        projectId: null
      });
    }

    // Check if invitation matches user's email
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({ 
        error: 'This invitation was sent to a different email address',
        message: 'This invitation was sent to a different email address',
        projectId: invitation.project_id
      });
    }

    // Check if expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      run('UPDATE invitations SET status = ? WHERE id = ?', ['expired', invitation.id]);
      return res.status(400).json({ 
        error: 'Invitation has expired',
        message: 'Invitation has expired',
        projectId: invitation.project_id
      });
    }

    // Check if already a member
    const existingMember = getOne(
      'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?',
      [invitation.project_id, userId]
    );

    if (existingMember) {
      run('UPDATE invitations SET status = ? WHERE id = ?', ['accepted', invitation.id]);
      return res.status(400).json({ 
        error: 'You are already a member of this project',
        message: 'You are already a member of this project',
        projectId: invitation.project_id
      });
    }

    // Add user to project members
    const memberId = generateId('member');
    run(`
      INSERT INTO project_members (id, project_id, user_id, role, joined_at)
      VALUES (?, ?, ?, 'member', datetime('now'))
    `, [memberId, invitation.project_id, userId]);

    // Update invitation status
    run('UPDATE invitations SET status = ? WHERE id = ?', ['accepted', invitation.id]);

    // Update project's member_ids JSON (for backwards compatibility)
    const project = getOne('SELECT member_ids FROM projects WHERE id = ?', [invitation.project_id]);
    const memberIds = parseJSON(project.member_ids, []);
    if (!memberIds.includes(userId)) {
      memberIds.push(userId);
      run('UPDATE projects SET member_ids = ? WHERE id = ?', [JSON.stringify(memberIds), invitation.project_id]);
    }

    const projectInfo = getOne('SELECT name FROM projects WHERE id = ?', [invitation.project_id]);

    res.setHeader("Cache-Control", "no-store");
    return res.json({
      message: `You have joined "${projectInfo.name}" successfully`,
      projectId: invitation.project_id
    });
  } catch (err) {
    console.error('Accept invitation error:', err);
    return res.status(500).json({ 
      error: err.message,
      message: 'An error occurred while accepting the invitation',
      projectId: null
    });
  }
});

// ============================================
// GET /api/invitations - Get user's pending invitations
// ============================================
app.get("/api/invitations", authenticateToken, (req, res) => {
  try {
    const userId = req.userId;
    const user = getOne('SELECT * FROM users WHERE id = ?', [userId]);

    // Get pending invitations for user's email
    const invitations = getAll(
      'SELECT * FROM invitations WHERE LOWER(email) = LOWER(?) AND status = ? ORDER BY created_at DESC',
      [user.email, 'pending']
    );

    // Enrich with project info
    const enrichedInvitations = invitations.map(inv => {
      const project = getOne('SELECT name, color, icon, description FROM projects WHERE id = ?', [inv.project_id]);
      const inviter = getOne('SELECT name FROM users WHERE id = ?', [inv.invited_by]);
      return {
        ...transformInvitation(inv),
        projectName: project?.name,
        projectColor: project?.color,
        projectIcon: project?.icon,
        projectDescription: project?.description,
        inviterName: inviter?.name,
      };
    });

    res.setHeader("Cache-Control", "no-store");
    return res.json({ invitations: enrichedInvitations });
  } catch (err) {
    console.error('Get invitations error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/invitations/:token/reject - Reject invitation
app.post("/api/invitations/:token/reject", authenticateToken, (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.userId;
    const user = getOne('SELECT * FROM users WHERE id = ?', [userId]);

    const invitation = getOne(
      'SELECT * FROM invitations WHERE token = ? AND status = ?',
      [token, 'pending']
    );

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found or already processed' });
    }

    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({ error: 'This invitation was sent to a different email address' });
    }

    run('UPDATE invitations SET status = ? WHERE id = ?', ['rejected', invitation.id]);

    res.setHeader("Cache-Control", "no-store");
    return res.json({ message: 'Invitation rejected' });
  } catch (err) {
    console.error('Reject invitation error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/invitations/verify/:token - Verify invitation token (public)
app.get("/api/invitations/verify/:token", (req, res) => {
  try {
    const { token } = req.params;

    const invitation = getOne('SELECT * FROM invitations WHERE token = ?', [token]);

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ 
        error: `Invitation is ${invitation.status}`,
        status: invitation.status 
      });
    }

    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      run('UPDATE invitations SET status = ? WHERE id = ?', ['expired', invitation.id]);
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    const project = getOne('SELECT name, color, icon, description FROM projects WHERE id = ?', [invitation.project_id]);
    const inviter = getOne('SELECT name FROM users WHERE id = ?', [invitation.invited_by]);

    res.setHeader("Cache-Control", "no-store");
    return res.json({
      valid: true,
      email: invitation.email,
      project: {
        id: invitation.project_id,
        name: project?.name,
        color: project?.color,
        icon: project?.icon,
        description: project?.description,
      },
      inviterName: inviter?.name,
      expiresAt: invitation.expires_at,
    });
  } catch (err) {
    console.error('Verify invitation error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/invites/validate - Validate invitation token (public)
app.post("/api/invites/validate", (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const invitation = getOne('SELECT * FROM invitations WHERE token = ?', [token]);

    if (!invitation) {
      return res.status(404).json({ error: 'Invitación no encontrada' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ 
        error: `Invitación ${invitation.status === 'accepted' ? 'ya acceptada' : invitation.status === 'rejected' ? 'rechazada' : 'expirada'}`,
      });
    }

    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      run('UPDATE invitations SET status = ? WHERE id = ?', ['expired', invitation.id]);
      return res.status(400).json({ error: 'La invitación ha expirado' });
    }

    const project = getOne('SELECT name, color, icon, description FROM projects WHERE id = ?', [invitation.project_id]);
    const inviter = getOne('SELECT name FROM users WHERE id = ?', [invitation.invited_by]);

    res.setHeader("Cache-Control", "no-store");
    return res.json({
      email: invitation.email,
      projectName: project?.name,
      projectId: invitation.project_id,
      inviterName: inviter?.name || 'Someone',
    });
  } catch (err) {
    console.error('Validate invitation error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/invites/accept - Accept invitation (requires auth)
app.post("/api/invites/accept", authenticateToken, (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const invitation = getOne('SELECT * FROM invitations WHERE token = ? AND email = ?', [token, req.user.email]);

    if (!invitation) {
      return res.status(404).json({ error: 'Invitación no encontrada' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: `Invitación ya procesada` });
    }

    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      run('UPDATE invitations SET status = ? WHERE id = ?', ['expired', invitation.id]);
      return res.status(400).json({ error: 'La invitación ha expirado' });
    }

    const transaction = db.transaction(() => {
      run('UPDATE invitations SET status = ?, accepted_at = datetime("now") WHERE id = ?', ['accepted', invitation.id]);

      const existingMember = getOne(
        'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
        [invitation.project_id, userId]
      );

      if (!existingMember) {
        run(
          'INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES (?, ?, ?, datetime("now"))',
          [invitation.project_id, userId, 'member']
        );
      }
    });

    transaction();

    res.setHeader("Cache-Control", "no-store");
    return res.json({ 
      success: true, 
      projectId: invitation.project_id,
      message: 'Invitation accepted' 
    });
  } catch (err) {
    console.error('Accept invitation error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ============================================
// Server Start
// ============================================

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
  console.log(`📦 Database: ${DB_PATH}`);
  console.log(`🔐 JWT authentication enabled`);
  console.log(`📝 Demo login: sarah@projectify.io / demo123`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Closing database...');
  db.close();
  process.exit(0);
});
