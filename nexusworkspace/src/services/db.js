// REST API and database simulation backed by localStorage.
const STORAGE_KEYS = {
  USERS: 'nexus_rb_users',
  PROJECTS: 'nexus_rb_projects',
  TASKS: 'nexus_rb_tasks',
  CURRENT_USER: 'nexus_rb_current_user'
};

const DEFAULT_USERS = [
  { id: 'u1', email: 'admin@nexus.com', name: 'Sarah Admin', role: 'admin', password: 'password123', avatar: 'SA' },
  { id: 'u2', email: 'member@nexus.com', name: 'John Dev', role: 'member', password: 'password123', avatar: 'JD' },
  { id: 'u3', email: 'designer@nexus.com', name: 'Mia Design', role: 'member', password: 'password123', avatar: 'MD' }
];

const DEFAULT_PROJECTS = [
  { id: 'p1', name: 'Nexus Cloud Hub', description: 'Redesign of the client-facing management cloud architecture.', client: 'Stark Labs', deadline: '2026-06-15', createdBy: 'u1', members: ['u1', 'u2', 'u3'] },
  { id: 'p2', name: 'E-Commerce Pipeline', description: 'Development of robust checkout systems and integrations.', client: 'ShopX', deadline: '2026-04-20', createdBy: 'u1', members: ['u1', 'u2'] }
];

const DEFAULT_TASKS = [
  { id: 't1', projectId: 'p1', title: 'Draft API Schemas', description: 'Establish foundational data flow templates.', assignedTo: 'u2', createdBy: 'u1', status: 'in_progress', priority: 'high', dueDate: '2026-03-01' },
  { id: 't2', projectId: 'p1', title: 'UI Moodboard Creation', description: 'Consolidate color choices for dynamic rendering.', assignedTo: 'u3', createdBy: 'u1', status: 'done', priority: 'medium', dueDate: '2026-02-15' },
  { id: 't3', projectId: 'p2', title: 'Integrate Stripe API', description: 'Set up credit tokens and validation protocols.', assignedTo: 'u2', createdBy: 'u1', status: 'backlog', priority: 'high', dueDate: '2026-02-28' },
  { id: 't4', projectId: 'p1', title: 'Final Security Audit', description: 'Conduct end-to-end testing against SQL injections.', assignedTo: 'u1', createdBy: 'u1', status: 'review', priority: 'high', dueDate: '2026-02-22' }
];

const ALLOWED_STATUSES = ['backlog', 'in_progress', 'review', 'done'];
const ALLOWED_PRIORITIES = ['low', 'medium', 'high'];

const get = (key, fallback) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const set = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

if (!localStorage.getItem(STORAGE_KEYS.USERS)) set(STORAGE_KEYS.USERS, DEFAULT_USERS);
if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) set(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
if (!localStorage.getItem(STORAGE_KEYS.TASKS)) set(STORAGE_KEYS.TASKS, DEFAULT_TASKS);

const delay = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));
const sanitizeText = (value) => String(value || '').trim();

const withoutPassword = (user) => {
  const { password, ...rest } = user;
  return rest;
};

const requireCurrentUser = () => {
  const currentUser = get(STORAGE_KEYS.CURRENT_USER, null);
  if (!currentUser) throw new Error('Authentication required');
  return currentUser;
};

const canManageProject = (currentUser, project) => {
  return currentUser.role === 'admin' || String(project.createdBy) === String(currentUser.id);
};

const normalizeMembers = (creatorId, members = []) => {
  return Array.from(new Set([String(creatorId), ...members.map(String)]));
};

export const dbService = {
  async login(email, password) {
    await delay();
    const users = get(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');

    const userNoPass = withoutPassword(user);
    set(STORAGE_KEYS.CURRENT_USER, userNoPass);
    return userNoPass;
  },

  async signup(name, email, password, role = 'member') {
    await delay();
    const users = get(STORAGE_KEYS.USERS, []);
    if (!sanitizeText(name)) throw new Error('Name is required');
    if (!sanitizeText(email)) throw new Error('Email is required');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');
    if (users.find(u => u.email === email)) throw new Error('Email already registered');

    const safeRole = role === 'admin' ? 'admin' : 'member';
    const newUser = {
      id: `u_${Date.now()}`,
      name: sanitizeText(name),
      email: sanitizeText(email),
      password,
      role: safeRole,
      avatar: safeRole === 'admin' ? 'AD' : sanitizeText(name).slice(0, 2).toUpperCase()
    };

    users.push(newUser);
    set(STORAGE_KEYS.USERS, users);

    const userNoPass = withoutPassword(newUser);
    set(STORAGE_KEYS.CURRENT_USER, userNoPass);
    return userNoPass;
  },

  async createUser(userData) {
    await delay();
    const currentUser = requireCurrentUser();
    if (currentUser.role !== 'admin') throw new Error('Only administrators can onboard users');

    const users = get(STORAGE_KEYS.USERS, []);
    const name = sanitizeText(userData.name);
    const email = sanitizeText(userData.email);
    const password = userData.password || 'password123';
    if (!name || !email) throw new Error('Name and email are required');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');
    if (users.find(u => u.email === email)) throw new Error('Email already registered');

    const role = userData.role === 'admin' ? 'admin' : 'member';
    const newUser = {
      id: `u_${Date.now()}`,
      name,
      email,
      password,
      role,
      avatar: role === 'admin' ? 'AD' : name.slice(0, 2).toUpperCase()
    };

    users.push(newUser);
    set(STORAGE_KEYS.USERS, users);
    return withoutPassword(newUser);
  },

  getCurrentUser() {
    return get(STORAGE_KEYS.CURRENT_USER, null);
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  async getUsers() {
    await delay(100);
    const users = get(STORAGE_KEYS.USERS, []);
    return users.map(withoutPassword);
  },

  async getProjects() {
    await delay();
    return get(STORAGE_KEYS.PROJECTS, []);
  },

  async createProject(projectData, creatorId) {
    await delay();
    const currentUser = requireCurrentUser();
    const users = get(STORAGE_KEYS.USERS, []);
    const projects = get(STORAGE_KEYS.PROJECTS, []);
    const name = sanitizeText(projectData.name);
    const client = sanitizeText(projectData.client);
    const deadline = sanitizeText(projectData.deadline);

    if (!name || !client || !deadline) throw new Error('Project name, client, and deadline are required');
    if (!users.some(u => String(u.id) === String(creatorId))) throw new Error('Project owner not found');

    const requestedMembers = currentUser.role === 'admin' ? (projectData.members || []) : [];
    const newProject = {
      id: `p_${Date.now()}`,
      name,
      description: sanitizeText(projectData.description),
      client,
      deadline,
      createdBy: creatorId,
      members: normalizeMembers(creatorId, requestedMembers)
    };

    projects.push(newProject);
    set(STORAGE_KEYS.PROJECTS, projects);
    return newProject;
  },

  async updateProject(projectId, projectData) {
    await delay();
    const currentUser = requireCurrentUser();
    const projects = get(STORAGE_KEYS.PROJECTS, []);
    const projectIndex = projects.findIndex(p => String(p.id) === String(projectId));
    if (projectIndex === -1) throw new Error('Project not found');

    const project = projects[projectIndex];
    if (!canManageProject(currentUser, project)) {
      throw new Error('Access denied: You can only manage projects you own.');
    }

    const name = sanitizeText(projectData.name);
    const client = sanitizeText(projectData.client);
    const deadline = sanitizeText(projectData.deadline);
    if (!name || !client || !deadline) throw new Error('Project name, client, and deadline are required');

    const members = currentUser.role === 'admin'
      ? normalizeMembers(project.createdBy, projectData.members || [])
      : project.members;

    const updatedProject = {
      ...project,
      name,
      description: sanitizeText(projectData.description),
      client,
      deadline,
      members
    };

    projects[projectIndex] = updatedProject;
    set(STORAGE_KEYS.PROJECTS, projects);
    return updatedProject;
  },

  async updateProjectMembers(projectId, memberIds) {
    await delay(100);
    const currentUser = requireCurrentUser();
    const projects = get(STORAGE_KEYS.PROJECTS, []);
    const projectIndex = projects.findIndex(p => String(p.id) === String(projectId));
    if (projectIndex === -1) throw new Error('Project not found');
    if (currentUser.role !== 'admin') throw new Error('Only administrators can assign team members');

    const project = projects[projectIndex];
    const updatedProject = { ...project, members: normalizeMembers(project.createdBy, memberIds) };
    projects[projectIndex] = updatedProject;
    set(STORAGE_KEYS.PROJECTS, projects);
    return updatedProject;
  },

  async deleteProject(projectId) {
    await delay(200);
    const currentUser = requireCurrentUser();
    const projects = get(STORAGE_KEYS.PROJECTS, []);
    const project = projects.find(p => String(p.id) === String(projectId));
    if (!project) throw new Error('Project not found');
    if (!canManageProject(currentUser, project)) {
      throw new Error('Access denied: You can only remove projects you own.');
    }

    const tasks = get(STORAGE_KEYS.TASKS, []);
    set(STORAGE_KEYS.PROJECTS, projects.filter(p => String(p.id) !== String(projectId)));
    set(STORAGE_KEYS.TASKS, tasks.filter(t => String(t.projectId) !== String(projectId)));
    return { success: true };
  },

  async getTasks(projectId = null) {
    await delay();
    const tasks = get(STORAGE_KEYS.TASKS, []);
    if (projectId) return tasks.filter(t => String(t.projectId) === String(projectId));
    return tasks;
  },

  async createTask(taskData) {
    await delay();
    const currentUser = requireCurrentUser();
    const projects = get(STORAGE_KEYS.PROJECTS, []);
    const tasks = get(STORAGE_KEYS.TASKS, []);
    const project = projects.find(p => String(p.id) === String(taskData.projectId));
    if (!project) throw new Error('Project is required');

    const title = sanitizeText(taskData.title);
    const dueDate = sanitizeText(taskData.dueDate);
    if (!title || !dueDate) throw new Error('Task title and due date are required');

    const isProjectMember = project.members.map(String).includes(String(currentUser.id));
    if (currentUser.role !== 'admin' && !isProjectMember) {
      throw new Error('Access denied: You are not a member of this project');
    }

    const assignedTo = currentUser.role === 'admin'
      ? sanitizeText(taskData.assignedTo)
      : currentUser.id;
    if (!assignedTo) throw new Error('Assignee is required');

    if (currentUser.role === 'admin' && !project.members.map(String).includes(String(assignedTo))) {
      throw new Error('Assignee must be part of the selected project team');
    }

    const priority = ALLOWED_PRIORITIES.includes(taskData.priority) ? taskData.priority : 'medium';
    const status = ALLOWED_STATUSES.includes(taskData.status) ? taskData.status : 'backlog';
    const newTask = {
      id: `t_${Date.now()}`,
      projectId: taskData.projectId,
      title,
      description: sanitizeText(taskData.description),
      assignedTo,
      createdBy: currentUser.id,
      status,
      priority,
      dueDate
    };

    tasks.push(newTask);
    set(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  },

  async updateTaskStatus(taskId, status) {
    await delay(200);
    const currentUser = requireCurrentUser();
    if (!ALLOWED_STATUSES.includes(status)) throw new Error('Invalid task status');

    const tasks = get(STORAGE_KEYS.TASKS, []);
    const taskIndex = tasks.findIndex(t => String(t.id) === String(taskId));
    if (taskIndex === -1) throw new Error('Task not found');

    const task = tasks[taskIndex];
    if (currentUser.role !== 'admin' && String(task.assignedTo) !== String(currentUser.id)) {
      throw new Error('Access denied: You can only update progress on tasks assigned to you.');
    }

    const updatedTask = { ...task, status };
    tasks[taskIndex] = updatedTask;
    set(STORAGE_KEYS.TASKS, tasks);
    return updatedTask;
  },

  async updateTask(taskId, updatedData) {
    await delay(200);
    const currentUser = requireCurrentUser();
    const projects = get(STORAGE_KEYS.PROJECTS, []);
    const tasks = get(STORAGE_KEYS.TASKS, []);
    const taskIndex = tasks.findIndex(t => String(t.id) === String(taskId));
    if (taskIndex === -1) throw new Error('Task not found');

    const task = tasks[taskIndex];
    if (currentUser.role !== 'admin' && String(task.createdBy) !== String(currentUser.id)) {
      throw new Error('Access denied: You can only edit tasks you created.');
    }

    const project = projects.find(p => String(p.id) === String(updatedData.projectId || task.projectId));
    if (!project) throw new Error('Project not found');

    const title = sanitizeText(updatedData.title);
    const dueDate = sanitizeText(updatedData.dueDate);
    if (!title || !dueDate) throw new Error('Task title and due date are required');

    const assignedTo = currentUser.role === 'admin'
      ? sanitizeText(updatedData.assignedTo)
      : currentUser.id;

    if (currentUser.role === 'admin' && !project.members.map(String).includes(String(assignedTo))) {
      throw new Error('Assignee must be part of the selected project team');
    }

    const updatedTask = {
      ...task,
      ...updatedData,
      title,
      description: sanitizeText(updatedData.description),
      projectId: project.id,
      assignedTo,
      priority: ALLOWED_PRIORITIES.includes(updatedData.priority) ? updatedData.priority : task.priority,
      dueDate
    };

    tasks[taskIndex] = updatedTask;
    set(STORAGE_KEYS.TASKS, tasks);
    return updatedTask;
  },

  async deleteTask(taskId) {
    await delay(200);
    const currentUser = requireCurrentUser();
    const tasks = get(STORAGE_KEYS.TASKS, []);
    const task = tasks.find(t => String(t.id) === String(taskId));
    if (!task) throw new Error('Task not found');
    if (currentUser.role !== 'admin' && String(task.createdBy) !== String(currentUser.id)) {
      throw new Error('Access denied: You can only delete tasks you created.');
    }

    set(STORAGE_KEYS.TASKS, tasks.filter(t => String(t.id) !== String(taskId)));
    return { success: true };
  }
};