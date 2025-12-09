import React from 'react'
import Dashboard from './components/Dashboard'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">Clima — Dashboard</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <Dashboard />
      </main>
    </div>
  )
}
