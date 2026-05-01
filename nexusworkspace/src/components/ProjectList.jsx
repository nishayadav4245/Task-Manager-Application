import React, { useState } from 'react';
import { dbService } from '../services/db';
import { Folder, Plus, Calendar, Briefcase, Edit2, Trash2, X } from 'lucide-react';

export default function ProjectList({ user, projects, users, tasks = [], onUpdate }) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editClient, setEditClient] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editMembers, setEditMembers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = user.role === 'admin';

  const canManageProject = (project) => {
    return isAdmin || String(project.createdBy) === String(user.id);
  };

  const resetCreateForm = () => {
    setName('');
    setDescription('');
    setClient('');
    setDeadline('');
    setSelectedMembers([]);
    setError('');
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !client.trim() || !deadline) {
      setError('Project name, client, and deadline are required.');
      return;
    }

    setLoading(true);
    try {
      await dbService.createProject({
        name,
        description,
        client,
        deadline,
        members: isAdmin ? selectedMembers : [user.id]
      }, user.id);

      resetCreateForm();
      setIsCreating(false);
      await onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditProject = (project) => {
    if (!canManageProject(project)) return;
    setEditingProject(project);
    setEditName(project.name || '');
    setEditDescription(project.description || '');
    setEditClient(project.client || '');
    setEditDeadline(project.deadline || '');
    setEditMembers(project.members || []);
    setError('');
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setError('');

    if (!editName.trim() || !editClient.trim() || !editDeadline) {
      setError('Project name, client, and deadline are required.');
      return;
    }

    setLoading(true);
    try {
      await dbService.updateProject(editingProject.id, {
        name: editName,
        description: editDescription,
        client: editClient,
        deadline: editDeadline,
        members: editMembers
      });

      setEditingProject(null);
      await onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (project) => {
    if (!canManageProject(project)) return;
    if (!window.confirm('Delete this project and all related tasks?')) return;

    setLoading(true);
    try {
      await dbService.deleteProject(project.id);
      await onUpdate();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberSelection = (userId, mode = 'create') => {
    const setter = mode === 'edit' ? setEditMembers : setSelectedMembers;
    setter(prev => (
      prev.map(String).includes(String(userId))
        ? prev.filter(id => String(id) !== String(userId))
        : [...prev, userId]
    ));
  };

  const renderMemberPicker = (selected, mode) => (
    <div className="flex flex-wrap gap-2 mt-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800 max-h-[120px] overflow-y-auto">
      {users.map(member => (
        <button
          type="button"
          key={member.id}
          onClick={() => toggleMemberSelection(member.id, mode)}
          className={`text-xs font-medium px-2 py-1 rounded-lg border transition flex items-center gap-1 ${
            selected.map(String).includes(String(member.id))
              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
              : 'border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">{member.avatar}</span>
          <span>{member.name}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Folder className="h-6 w-6 text-indigo-500" /> Projects Directory
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Create projects, update scope, and manage workspace ownership.
          </p>
        </div>
        <button
          onClick={() => {
            resetCreateForm();
            setIsCreating(!isCreating);
          }}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl transition shadow-md self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          {isCreating ? 'Close Project Form' : 'Add Project'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateProject} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-indigo-400" /> Add New Project
          </h3>

          {error && <div className="text-xs text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Project Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Website Revamp"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Client *</label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Internal or client name"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add project scope and goals"
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Deadline *</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Project Team</label>
              {isAdmin ? (
                renderMemberPicker(selectedMembers, 'create')
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-400">
                  Member projects are automatically assigned to you. Admin can add more teammates.
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow"
            >
              {loading ? 'Saving...' : 'Create Project'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.length === 0 ? (
          <div className="md:col-span-2 text-center py-12 text-slate-500 font-medium border border-dashed border-slate-800 rounded-xl">
            No projects yet. Use Add Project to create your first workspace.
          </div>
        ) : (
          projects.map((project) => {
            const projectMembers = users.filter(member => project.members?.map(String).includes(String(member.id)));
            const projectTasks = tasks.filter(task => String(task.projectId) === String(project.id));
            const completedTasks = projectTasks.filter(task => task.status === 'done').length;
            const progress = projectTasks.length ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
            const manageable = canManageProject(project);

            return (
              <div key={project.id} className="bg-slate-900 border border-slate-800/80 hover:border-slate-700 p-6 rounded-2xl shadow-sm transition flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 px-2.5 py-1 bg-indigo-500/10 rounded-lg truncate">
                      Client: {project.client}
                    </span>
                    <span className="text-slate-500 text-xs flex items-center gap-1 shrink-0">
                      <Calendar className="h-3.5 w-3.5" /> {project.deadline}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-200 mt-4 tracking-tight group-hover:text-white transition">
                    {project.name}
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed min-h-10">
                    {project.description || 'No project description added yet.'}
                  </p>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-slate-500 text-[10px] font-semibold tracking-wider uppercase block">Team</span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {projectMembers.length ? projectMembers.slice(0, 5).map(member => (
                        <span key={member.id} title={member.name} className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300">
                          {member.avatar}
                        </span>
                      )) : (
                        <span className="text-xs text-slate-600">No members</span>
                      )}
                    </div>
                  </div>
                  {manageable ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditProject(project)}
                        className="p-2 bg-slate-950 border border-slate-800 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 rounded-xl transition"
                        title="Manage project"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project)}
                        className="p-2 bg-slate-950 border border-slate-800 hover:border-rose-500 text-slate-400 hover:text-rose-400 rounded-xl transition"
                        title="Delete project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600">View only</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {editingProject && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <form onSubmit={handleUpdateProject} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-indigo-400" /> Manage Project
              </h3>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="p-1.5 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && <div className="text-xs text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Project Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Client *</label>
                <input
                  type="text"
                  value={editClient}
                  onChange={(e) => setEditClient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Deadline *</label>
                <input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Team Members</label>
                {isAdmin ? renderMemberPicker(editMembers, 'edit') : (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-400">
                    Member accounts can edit scope. Admin accounts manage team assignment.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow"
              >
                {loading ? 'Saving...' : 'Update Project'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}