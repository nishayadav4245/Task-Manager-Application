import React, { useState } from 'react';
import { dbService } from '../services/db';
import { LogIn, UserPlus, Shield, User, AlertCircle, Sparkles } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('member'); // Default to member
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick Switch for testing roles
  const handleQuickLogin = async (targetEmail) => {
    setLoading(true);
    setError('');
    try {
      const user = await dbService.login(targetEmail, 'password123');
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await dbService.login(email, password);
      } else {
        if (!name.trim()) throw new Error('Name is required');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        user = await dbService.signup(name, email, password, role);
      }
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 mb-4 animate-bounce-short">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">NEXUS Workspaces</h1>
          <p className="text-slate-400 text-sm mt-2">Team workflows & task distribution system</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 border-b-2 ${
                isLogin 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 border-b-2 ${
                !isLogin 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 pl-10 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Select Role</label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setRole('member')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                        role === 'member' 
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <User className="h-4 w-4" />
                      Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                        role === 'admin' 
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                placeholder="you@nexus.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm p-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isLogin ? 'Log In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Quick Access Helper */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <span className="text-[10px] text-slate-600 font-bold tracking-widest uppercase block mb-3">Quick Login (Testing)</span>
            <div className="flex justify-center gap-2">
              <button 
                onClick={() => handleQuickLogin('admin@nexus.com')}
                className="text-xs px-3 py-1.5 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded-lg font-medium transition"
              >
                Log Admin
              </button>
              <button 
                onClick={() => handleQuickLogin('member@nexus.com')}
                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded-lg font-medium transition"
              >
                Log Member
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
