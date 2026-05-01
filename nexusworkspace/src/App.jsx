import React, { useState, useEffect } from 'react';
import { dbService } from './services/db';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import TaskList from './components/TaskList';
import TeamManagement from './components/TeamManagement';
import { Layout, Folder, CheckSquare, Users, LogOut, Sparkles, Menu, X } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initial load
  useEffect(() => {
    const currentUser = dbService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  // Sync state data on user login or action triggers
  const fetchData = async () => {
    if (!user) return;
    try {
      const [allProjects, allTasks, allUsers] = await Promise.all([
        dbService.getProjects(),
        dbService.getTasks(),
        dbService.getUsers()
      ]);

      // If regular member, show projects they belong to or created.
      if (user.role === 'admin') {
        setProjects(allProjects);
        setTasks(allTasks);
      } else {
        const visibleProjects = allProjects.filter(
          p => p.members.map(String).includes(String(user.id)) || String(p.createdBy) === String(user.id)
        );
        setProjects(visibleProjects);
        
        // Members can view project tasks, but can only update their own assigned tasks.
        const accessibleProjectIds = visibleProjects.map(p => p.id);
        const visibleTasks = allTasks.filter(
          t => String(t.assignedTo) === String(user.id) || String(t.createdBy) === String(user.id) || accessibleProjectIds.map(String).includes(String(t.projectId))
        );
        setTasks(visibleTasks);
      }

      setUsers(allUsers);
    } catch (err) {
      console.error('Failed to sync relational schemas', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleLoginSuccess = (signedInUser) => {
    setUser(signedInUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    dbService.logout();
    setUser(null);
    setProjects([]);
    setTasks([]);
    setUsers([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Layout },
    { id: 'projects', name: 'Projects', icon: Folder },
    { id: 'tasks', name: 'Task Board', icon: CheckSquare },
    { id: 'team', name: 'Team Hub', icon: Users }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            projects={projects} 
            tasks={tasks} 
            users={users} 
            setActiveTab={setActiveTab} 
          />
        );
      case 'projects':
        return (
          <ProjectList 
            user={user} 
            projects={projects} 
            users={users} 
            tasks={tasks}
            onUpdate={fetchData} 
          />
        );
      case 'tasks':
        return (
          <TaskList 
            user={user} 
            projects={projects} 
            tasks={tasks} 
            users={users} 
            onUpdate={fetchData} 
          />
        );
      case 'team':
        return (
          <TeamManagement 
            user={user} 
            users={users} 
            onUpdate={fetchData} 
          />
        );
      default:
        return <Dashboard user={user} projects={projects} tasks={tasks} users={users} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800/80 p-6 space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow">
            N
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">NEXUS</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800/60 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm flex-shrink-0 shadow-inner">
              {user.avatar}
            </span>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-200 truncate">{user.name}</h4>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/5 transition flex-shrink-0"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-sm">
            N
          </div>
          <span className="font-extrabold tracking-tight text-white">NEXUS</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-400 hover:text-slate-200"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 animate-fade-in" onClick={() => setSidebarOpen(false)}>
          <nav 
            className="w-64 bg-slate-900 h-full border-r border-slate-800 p-6 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow">
                    N
                  </div>
                  <span className="font-bold text-lg text-white">NEXUS</span>
                </div>
                <button onClick={() => setSidebarOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
              </div>

              <div className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
                        isActive 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-800/60 pt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-sm shadow-inner">
                  {user.avatar}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">{user.name}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">{user.role}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Framework Area */}
      <main className="flex-1 p-6 lg:p-10 mt-16 lg:mt-0 max-w-7xl mx-auto w-full overflow-x-hidden">
        {renderContent()}
      </main>
    </div>
  );
}
