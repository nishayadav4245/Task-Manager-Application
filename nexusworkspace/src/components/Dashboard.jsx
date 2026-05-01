import React from 'react';
import { Layout, CheckSquare, Clock, AlertTriangle, Users, ArrowUpRight } from 'lucide-react';

export default function Dashboard({ user, projects, tasks, users, setActiveTab }) {
  // Date evaluation
  const isOverdue = (dueDate, status) => {
    if (status === 'done') return false;
    const due = new Date(`${dueDate}T23:59:59`);
    return due < new Date();
  };

  // Metrics computation
  const myTasks = user.role === 'admin'
    ? tasks
    : tasks.filter(t => String(t.assignedTo) === String(user.id) || String(t.createdBy) === String(user.id));
  const doneTasks = myTasks.filter(t => t.status === 'done');
  const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
  const overdueTasks = myTasks.filter(t => isOverdue(t.dueDate, t.status));

  // Admin global aggregates
  const totalProjects = projects.length;
  const totalUsers = users.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Welcome back, {user.name} {user.avatar}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {user.role === 'admin' 
              ? 'Administrator workspace. Monitor health and progress metrics effortlessly.' 
              : 'Contributor workspace. Track assigned tasks and completion targets.'
            }
          </p>
        </div>
        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border self-start md:self-auto ${
          user.role === 'admin' 
            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
            : 'bg-slate-800 border-slate-700 text-slate-400'
        }`}>
          Role: {user.role}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => setActiveTab('tasks')} className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-between text-left hover:border-indigo-500/50 transition">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              {user.role === 'admin' ? 'Managed Tasks' : 'My Tasks'}
            </span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{myTasks.length}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Layout className="h-6 w-6" />
          </div>
        </button>

        <button onClick={() => setActiveTab('tasks')} className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-between text-left hover:border-emerald-500/50 transition">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Completed</span>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{doneTasks.length}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckSquare className="h-6 w-6" />
          </div>
        </button>

        <button onClick={() => setActiveTab('tasks')} className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-between text-left hover:border-amber-500/50 transition">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <h3 className="text-3xl font-extrabold text-amber-400 mt-1">{inProgressTasks.length}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
        </button>

        <button onClick={() => setActiveTab('tasks')} className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-between text-left hover:border-rose-500/50 transition">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Overdue</span>
            <h3 className="text-3xl font-extrabold text-rose-400 mt-1">{overdueTasks.length}</h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent/Overdue Tasks */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col lg:col-span-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" /> Overdue & Pending Actions
          </h2>
          <p className="text-slate-400 text-xs mt-1">Items that need attention to stay on schedule</p>

          <div className="mt-4 space-y-3 flex-1">
            {overdueTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-600 border border-dashed border-slate-800 rounded-xl">
                <CheckSquare className="h-8 w-8 text-slate-700 mb-2" />
                <span className="text-sm">{myTasks.length ? 'Excellent! No overdue milestones.' : 'No tasks yet. Add a project and create your first task.'}</span>
                {!myTasks.length && (
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="mt-3 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    Add project
                  </button>
                )}
              </div>
            ) : (
              overdueTasks.map(task => {
                const project = projects.find(p => p.id === task.projectId);
                const assignee = users.find(u => u.id === task.assignedTo);
                return (
                  <div key={task.id} className="flex items-center justify-between bg-slate-950 border border-slate-800/80 px-4 py-3 rounded-xl hover:border-slate-700 transition">
                    <div>
                      <h4 className="text-slate-200 font-semibold text-sm">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <span className="text-indigo-400">{project?.name}</span>
                        <span>•</span>
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-lg border border-rose-500/20 font-semibold">
                        Overdue
                      </span>
                      {user.role === 'admin' && assignee && (
                        <span className="block text-[10px] text-slate-400 mt-1">Assignee: {assignee.name}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Global Admin Insights OR Quick Navigation for Members */}
        {user.role === 'admin' ? (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-400" /> Team Health
              </h2>
              <p className="text-slate-400 text-xs mt-1">Quick operational breakdown</p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/40">
                  <span className="text-slate-400 text-sm">Active Projects</span>
                  <span className="text-base font-bold text-slate-200">{totalProjects}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/40">
                  <span className="text-slate-400 text-sm">Total Contributors</span>
                  <span className="text-base font-bold text-slate-200">{totalUsers}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('projects')}
              className="mt-6 w-full py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
            >
              Manage Workspace <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                🚀 Action Center
              </h2>
              <p className="text-slate-400 text-xs mt-1">Get to your relevant workflows</p>
              
              <div className="mt-6 text-slate-300 text-sm space-y-2">
                <p>Welcome to your operational dashboard. Use alternative views to track schedules.</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('tasks')}
              className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-2"
            >
              Start Working <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
