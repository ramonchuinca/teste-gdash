import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/axios";
import { SkeletonCard } from "./SkeletonCard";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  zoomPlugin
);

export default function Dashboard() {
  const [cards, setCards] = useState(null);
  const [chart, setChart] = useState({ labels: [], data: [] });
  const [table, setTable] = useState([]);
  const [insights, setInsights] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cacheRef = useRef({ data: null, timestamp: 0 });
  const debounceRef = useRef(null);
  const chartRef = useRef(null);

  const loadDashboard = useCallback(async (force = false) => {
    const now = Date.now();

    if (
      !force &&
      cacheRef.current.data &&
      now - cacheRef.current.timestamp < 30_000
    ) {
      const cached = cacheRef.current.data;
      setCards(cached.cards);
      setChart(cached.chart);
      setTable(cached.table);
      setInsights(cached.insights);
      setLoading(false);
      return;
    }

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/dashboard");

        cacheRef.current = {
          data: res.data,
          timestamp: Date.now(),
        };

        setCards(res.data?.cards ?? null);
        setChart(res.data?.chart ?? { labels: [], data: [] });
        setTable(Array.isArray(res.data?.table) ? res.data.table : []);
        setInsights(Array.isArray(res.data?.insights) ? res.data.insights : []);
      } catch (e) {
        console.error(e);
        setError("Erro ao carregar dashboard");
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    loadDashboard(true);
    const interval = setInterval(() => loadDashboard(), 30_000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  /* 🎨 CORES DINÂMICAS */
  const getTempColor = (temp = 0) => {
    if (temp >= 35) return "rgb(239, 68, 68)";
    if (temp >= 30) return "rgb(249, 115, 22)";
    if (temp >= 20) return "rgb(34, 197, 94)";
    return "rgb(59, 130, 246)";
  };

  const maxTemp = chart.data.length ? Math.max(...chart.data) : 0;

  const chartData = {
    labels: chart.labels,
    datasets: [
      {
        label: "Temperatura (°C)",
        data: chart.data,
        tension: 0.3,
        borderColor: getTempColor(maxTemp),
        backgroundColor: "rgba(59,130,246,0.1)",
        pointBackgroundColor: chart.data.map(getTempColor),
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const t = ctx.parsed.y;
            let status = "Confortável";
            if (t >= 35) status = "🔥 Calor extremo";
            else if (t >= 30) status = "🌡️ Quente";
            else if (t <= 10) status = "❄️ Frio";
            return `${t}°C — ${status}`;
          },
        },
      },
      zoom: {
        pan: { enabled: true, mode: "x" },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "x",
        },
      },
    },
  };

  /* 📤 EXPORTAR CSV */
  const exportCSV = () => {
    if (!table.length) return;

    const headers = ["Data/Hora", "Temperatura", "Vento", "Umidade"];
    const rows = table.map((r) => [
      new Date(r.time).toLocaleString(),
      r.temperature,
      r.windSpeed,
      r.humidity,
    ]);

    const csv =
      headers.join(";") + "\n" + rows.map((r) => r.join(";")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "weather_dashboard.csv";
    link.click();
  };

  return (
    <div className="space-y-6 p-6">
      {error && <div className="text-red-600">{error}</div>}

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          : cards && (
              <>
                <Card title="Atual" value={`${cards.current}°C`} />
                <Card title="Média" value={`${cards.avg}°C`} />
                <Card title="Máxima" value={`${cards.max}°C`} />
                <Card
                  title="Tendência"
                  value={
                    cards.trend === "up"
                      ? "⬆ Subindo"
                      : cards.trend === "down"
                      ? "⬇ Caindo"
                      : "➖ Estável"
                  }
                />
              </>
            )}
      </div>

      {/* GRÁFICO */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Temperatura — Últimas leituras</h3>

          <div className="flex gap-2">
            <button
              onClick={() => chartRef.current?.resetZoom?.()}
              className="px-3 py-1 text-sm bg-slate-200 rounded"
            >
              Reset Zoom
            </button>
            <button
              onClick={exportCSV}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
            >
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="relative h-64">
          {loading && (
            <div className="absolute inset-0 bg-slate-200 rounded-lg animate-pulse z-10" />
          )}

          <Line ref={chartRef} data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* TABELA */}
      {!loading && (
        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
          <h3 className="font-semibold mb-4">Histórico</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2">Data/Hora</th>
                <th>Temp</th>
                <th>Vento</th>
                <th>Umidade</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2">
                    {new Date(row.time).toLocaleString()}
                  </td>
                  <td>{row.temperature}°C</td>
                  <td>{row.windSpeed} m/s</td>
                  <td>{row.humidity}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* INSIGHTS */}
      {!loading && insights.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Insights</h3>
          {insights.map((insight, i) => (
            <Insight key={i} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}

/* COMPONENTES */
function Card({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 transition hover:scale-[1.02]">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function Insight({ insight }) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    danger: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div className={`border rounded-lg p-3 ${styles[insight.type]}`}>
      {insight.message}
    </div>
  );
}
