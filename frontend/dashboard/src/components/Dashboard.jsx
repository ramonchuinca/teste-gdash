import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

// ✅ VARIÁVEL DE AMBIENTE NO VITE
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'




export default function Dashboard() {
  const [logs, setLogs] = useState([])
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAll()
    const interval = setInterval(loadAll, 30_000)
    return () => clearInterval(interval)
  }, [])

  async function loadAll() {
    setLoading(true)
    setError(null)
    try {
      // 🔥 1) LISTA TODOS OS REGISTROS
      const resLogs = await axios.get(`${API_URL}/weather/all`)
      setLogs(Array.isArray(resLogs.data) ? resLogs.data : [])

      // 🔥 2) BUSCA O CLIMA ATUAL
      const resCurrent = await axios.get(
        `${API_URL}/weather/current?city=Porto Velho&lat=-8.7611&lon=-63.9039`
      )
      setCurrent(resCurrent.data.data)

    } catch (err) {
      console.error(err)
      setError('Erro ao carregar dados da API. Verifique se está no ar.')
    } finally {
      setLoading(false)
    }
  }

  // ------------------------------
  // 🔥 GRÁFICO DE TEMPERATURA
  // ------------------------------
  const temps = logs
    .slice()
    .reverse()
    .map((l) => l.temperature ?? null)

  const labels = logs
    .slice()
    .reverse()
    .map((l) =>
      new Date(l.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    )

  const data = {
    labels,
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: temps,
        tension: 0.3,
        fill: false,
      },
    ],
  }

  return (
    <div className="space-y-6">
      
      {/* ---------------------------
          🔥 WIDGET GOOGLE WEATHER 
      ---------------------------- */}
      {current && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Porto Velho</h2>
            <p className="text-lg opacity-90">
              {new Date(current.createdAt).toLocaleString()}
            </p>
            <p className="text-6xl font-semibold mt-3">
              {current.temperature}°C
            </p>
            <p className="mt-2 opacity-90">
              Vento: {current.windSpeed} m/s • Umidade: {current.humidity}%
            </p>
          </div>

          <div className="text-7xl opacity-90">
            ☀️
          </div>
        </div>
      )}

      {/* ---------------------------
          🔥 CARD VISÃO GERAL
      ---------------------------- */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-medium mb-2">Visão Geral</h2>
        <p className="text-sm text-slate-600">
          Pipeline: Python → RabbitMQ → Go → NestJS → Dashboard React.
        </p>
      </div>

      {/* ---------------------------
          🔥 GRÁFICO + TABELA
      ---------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* GRÁFICO */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Temperatura - Últimas Leituras</h3>

          {loading ? (
            <div>Carregando gráfico...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <Line data={data} />
          )}
        </div>

        {/* TABELA */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Últimos registros</h3>

          <div className="overflow-auto max-h-64">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="pb-2">Horário</th>
                  <th className="pb-2">Temp (°C)</th>
                  <th className="pb-2">Vento</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2">{l.temperature ?? '-'}</td>
                    <td className="py-2">{l.windSpeed ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => window.open(`${API_URL}/weather/export.csv`, '_blank')}
              className="px-3 py-2 bg-blue-600 text-white rounded"
            >
              Exportar CSV
            </button>

            <button
              onClick={loadAll}
              className="px-3 py-2 border rounded"
            >
              Atualizar
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
