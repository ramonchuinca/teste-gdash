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

const API = import.meta.env.VITE_API_URL || 'http://api:3001'

export default function Dashboard() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 30_000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  async function fetchLogs() {
    setLoading(true)
    setError(null)
    try {
      // our NestJS endpoint is /weather (in the API service)
      const res = await axios.get(`${API}/weather`)
      setLogs(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar logs. Verifique se a API está no ar.')
    } finally {
      setLoading(false)
    }
  }

  const temps = logs
    .slice()
    .reverse()
    .map((l) => (l.temperature ?? l.temp ?? null))
    .filter((v) => v !== null)

  const labels = logs
    .slice()
    .reverse()
    .map((l) => new Date(l.time ?? l.createdAt).toLocaleTimeString())

  const data = {
    labels: labels,
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
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-medium mb-2">Visão Geral</h2>
        <p className="text-sm text-slate-600">
          Dados coletados via pipeline Python → RabbitMQ → Go → NestJS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Temperatura última série</h3>
          {loading ? (
            <div>Carregando gráfico...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <Line data={data} />
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Últimos registros</h3>

          <div className="overflow-auto max-h-64">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="pb-2">Horário</th>
                  <th className="pb-2">Temp (°C)</th>
                  <th className="pb-2">Wind (m/s)</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2">
                      {new Date(l.time ?? l.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2">{l.temperature ?? l.temp ?? '-'}</td>
                    <td className="py-2">{l.windspeed ?? l.wind_speed ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                // try to download CSV from API
                window.open(`${API}/weather/export.csv`, '_blank')
              }}
              className="px-3 py-2 bg-slate-800 text-white rounded"
            >
              Exportar CSV
            </button>
            <button
              onClick={() => fetchLogs()}
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
