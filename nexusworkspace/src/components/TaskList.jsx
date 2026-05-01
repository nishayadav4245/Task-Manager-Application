import React, { useState } from 'react';
import { dbService } from '../services/db';
import { CheckSquare, Plus, Trash2, CheckCircle, Edit2, Clock, AlertTriangle, Calendar, User, X } from 'lucide-react';

export default function TaskList({ user, projects, tasks, users, onUpdate }) {
  // Task Creation State
  const [isCreating, setIsCreating] = useState(false);
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Task Editing State
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editDueDate, setEditDueDate] = useState('');

  const isAdmin = user.role === 'admin';

  const canUpdateProgress = (task) => {
    return isAdmin || String(task.assignedTo) === String(user.id);
  };

  const canManageTask = (task) => {
    return isAdmin || String(task.createdBy) === String(user.id);
  };

  // Status Columns definitions
  const columns = [
    { id: 'backlog', title: 'Backlog', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    { id: 'review', title: 'Review', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { id: 'done', title: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
  ];

  const selectedProject = projects.find(p => String(p.id) === String(projectId));
  const editableProject = projects.find(p => String(p.id) === String(editProjectId));
  const assignableUsers = selectedProject
    ? users.filter(u => selectedProject.members?.map(String).includes(String(u.id)))
    : users;
  const editableAssignableUsers = editableProject
    ? users.filter(u => editableProject.members?.map(String).includes(String(u.id)))
    : users;

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    const targetAssignee = isAdmin ? assignedTo : user.id;
    if (!title.trim() || !projectId || !dueDate || !targetAssignee) {
      setError('Please resolve all standard parameters (Title, Project, Assignee, Date)');
      return;
    }
    setLoading(true);

    try {
      await dbService.createTask({
        projectId,
        title,
        description,
        assignedTo: targetAssignee,
        priority,
        dueDate
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssignedTo('');
      setIsCreating(false);
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditTitle(task.title || '');
    setEditDescription(task.description || '');
    setEditProjectId(task.projectId || '');
    setEditAssignedTo(task.assignedTo || '');
    setEditPriority(task.priority || 'medium');
    setEditDueDate(task.dueDate || '');
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setError('');
    const targetAssignee = isAdmin ? editAssignedTo : user.id;
    if (!editTitle.trim() || !editProjectId || !targetAssignee || !editDueDate) {
      setError('Please fill in all core items.');
      return;
    }
    setLoading(true);

    try {
      await dbService.updateTask(editingTask.id, {
        title: editTitle,
        description: editDescription,
        projectId: editProjectId,
        assignedTo: targetAssignee,
        priority: editPriority,
        dueDate: editDueDate
      });
      setEditingTask(null);
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      await dbService.updateTaskStatus(taskId, newStatus);
      onUpdate();
    } catch (err) {
      alert('Action blocked: ' + err.message);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete task permanently?')) return;
    try {
      await dbService.deleteTask(taskId);
      onUpdate();
    } catch (err) {
      alert('Action blocked: ' + err.message);
    }
  };

  const getPriorityStyle = (p) => {
    switch (p) {
      case 'high': return 'bg-rose-500/10 text-rose-400';
      case 'medium': return 'bg-amber-500/10 text-amber-400';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-indigo-500" /> Task Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Delegate activities and monitor active statuses efficiently.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl transition shadow-md self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          {isCreating ? 'Cancel Creation' : 'New Task'}
        </button>
      </div>

      {/* Task Creation Form */}
      {isCreating && (
        <form onSubmit={handleCreateTask} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-indigo-400" /> Record Granular Action
          </h3>
          
          {error && <div className="text-xs text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Task Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Database Schema Migration"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Target Project *</label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setAssignedTo('');
                }}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose Project --</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline deployment steps..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Assign User *</label>
              {isAdmin ? (
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose User --</option>
                  {assignableUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              ) : (
                <div className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-sm p-2.5 rounded-xl">
                  Assigned to you: {user.name}
                </div>
              )}
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow"
            >
              {loading ? 'Processing...' : 'Save Milestone'}
            </button>
          </div>
        </form>
      )}

      {/* Kanban/Board View */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/40">
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-slate-500 font-bold text-xs">{colTasks.length}</span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="text-center py-10 text-slate-700 text-xs font-medium border border-dashed border-slate-800/40 rounded-xl">
                    No tasks present.
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const assignee = users.find(u => u.id === task.assignedTo);
                    const project = projects.find(p => p.id === task.projectId);
                    return (
                      <div key={task.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-4 rounded-xl shadow-sm transition group">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${getPriorityStyle(task.priority)}`}>
                            {task.priority} Priority
                          </span>
                          
                          <div className="flex items-center gap-1">
                            {/* Admins and task creators can edit task details. */}
                            {canManageTask(task) && (
                              <button
                                onClick={() => openEditModal(task)}
                                className="p-1 hover:text-indigo-400 text-slate-500 rounded transition"
                                title="Edit Task"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {canManageTask(task) && (
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1 hover:text-rose-400 text-slate-500 rounded transition"
                                title="Delete Task"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="text-slate-200 font-semibold text-sm mt-2 leading-relaxed">
                          {task.title}
                        </h4>
                        
                        <p className="text-slate-500 text-xs mt-1 line-clamp-2">
                          {task.description || 'No descriptive guide.'}
                        </p>

                        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 flex items-center justify-center bg-slate-800 rounded-full text-xs" title={`Assigned: ${assignee?.name}`}>
                              {assignee?.avatar || '👤'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[60px]">{assignee?.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {task.dueDate}
                          </span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-800/20">
                          {canUpdateProgress(task) ? (
                            <label className="block">
                              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Update Progress</span>
                              <select
                                value={task.status}
                                onChange={(e) => updateStatus(task.id, e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                              >
                                {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                              </select>
                            </label>
                          ) : (
                            <div className="text-[10px] text-slate-600 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5">
                              Progress is locked to the assignee.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Editing Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <form onSubmit={handleUpdateTask} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-indigo-400" /> Update Task Settings
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingTask(null)}
                className="p-1.5 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && <div className="text-xs text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Task Title *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Target Project *</label>
                <select
                  value={editProjectId}
                  onChange={(e) => {
                    setEditProjectId(e.target.value);
                    setEditAssignedTo('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Assign User *</label>
                {isAdmin ? (
                  <select
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    {editableAssignableUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                  </select>
                ) : (
                  <div className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-sm p-2.5 rounded-xl">
                    Assigned to you: {user.name}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Due Date *</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow"
              >
                {loading ? 'Processing...' : 'Apply Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
