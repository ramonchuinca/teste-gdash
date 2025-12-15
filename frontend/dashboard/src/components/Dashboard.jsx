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
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [cards, setCards] = useState(null);
  const [chart, setChart] = useState({ labels: [], data: [] });
  const [table, setTable] = useState([]);
  const [insights, setInsights] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🧠 Cache + debounce
  const cacheRef = useRef({ data: null, timestamp: 0 });
  const debounceRef = useRef(null);

  const loadDashboard = useCallback(async (force = false) => {
    const now = Date.now();

    // ✅ CACHE (30s)
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

    // ⏳ DEBOUNCE (300ms)
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

  const chartData = {
    labels: chart.labels,
    datasets: [
      {
        label: "Temperatura (°C)",
        data: chart.data,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="space-y-6 p-6">
      {/* ERRO */}
      {error && <div className="text-red-600">{error}</div>}

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          cards && (
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
          )
        )}
      </div>

      {/* GRÁFICO */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-4">
          Temperatura — Últimas leituras
        </h3>

        {loading ? (
          <div className="h-64 bg-slate-200 rounded-lg animate-pulse" />
        ) : (
          <Line data={chartData} />
        )}
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
