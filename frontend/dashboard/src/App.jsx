import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Login from './pages/Login';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  if (!user) return <Login onLogin={(u) => setUser(u)} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Clima — Dashboard</h1>
          <div>
            <span className="mr-4">Olá, {user.name}</span>
            <button onClick={() => { localStorage.removeItem('access_token'); localStorage.removeItem('user'); window.location.reload(); }} className="px-3 py-1 border rounded">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <Dashboard />
      </main>
    </div>
  );
}
