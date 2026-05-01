import React, { useState } from 'react';
import { dbService } from '../services/db';
import { Users, Plus, Shield, User, AlertCircle, Sparkles } from 'lucide-react';

export default function TeamManagement({ user, users, onUpdate }) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123'); // Default standard pass
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim()) {
      setError('Please provide name and email credentials.');
      return;
    }
    setLoading(true);

    try {
      await dbService.createUser({ name, email, password, role });
      setName('');
      setEmail('');
      setPassword('password123');
      setIsAdding(false);
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-500" /> Team Collaboration Hub
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Maintain access roles, map assignments, and onboard organizational developers.
          </p>
        </div>
        {user.role === 'admin' && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl transition shadow-md self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            {isAdding ? 'Close Onboarding' : 'Onboard Contributor'}
          </button>
        )}
      </div>

      {/* Onboarding Form (Admin Privileges Required) */}
      {isAdding && user.role === 'admin' && (
        <form onSubmit={handleCreateUser} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" /> Grant Workspace Access
          </h3>

          {error && (
            <div className="text-xs text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@nexus.com"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Temporary Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Select Role Profile</label>
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => setRole('member')}
                className={`py-2 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  role === 'member' 
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <User className="h-4 w-4" />
                Member (Standard Scope)
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  role === 'admin' 
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Shield className="h-4 w-4" />
                Administrator
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow"
            >
              {loading ? 'Creating...' : 'Grant Access'}
            </button>
          </div>
        </form>
      )}

      {/* User Directory List */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h2 className="text-base font-bold text-white mb-4">Active Staff / Members</h2>
        
        <div className="divide-y divide-slate-800">
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-full text-lg shadow-inner">
                  {u.avatar}
                </span>
                <div>
                  <h4 className="text-slate-200 font-semibold text-sm">{u.name}</h4>
                  <span className="text-slate-500 text-xs">{u.email}</span>
                </div>
              </div>

              <span className={`px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase rounded-lg border ${
                u.role === 'admin' 
                  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
