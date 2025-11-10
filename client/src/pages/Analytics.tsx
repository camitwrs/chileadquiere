import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
// avatar not used here (kept for other pages)
import { Star } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart as ReBarChart,
  Bar,
  ScatterChart as ReScatterChart,
  Scatter,
} from "recharts";

// Lightweight placeholder chart helpers (SVG)
function Sparkline({ data = [], color = "#0ea5e9" }: { data: number[]; color?: string }) {
  const w = 100, h = 24;
  const max = Math.max(...data, 1);
  const points = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - (d / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth={2} points={points} />
    </svg>
  );
}

function MiniBars({ values = [], color = "#10b981" }: { values: number[]; color?: string }) {
  const w = 80, h = 28;
  const max = Math.max(...values, 1);
  const bw = w / values.length - 3;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {values.map((v, i) => (
        <rect key={i} x={i * (bw + 3)} y={h - (v / max) * h} width={bw} height={(v / max) * h} fill={color} />
      ))}
    </svg>
  );
}

// Mock data
const months = Array.from({ length: 12 }).map((_, i) => `M-${i + 1}`);

function generateMockSeries() {
  return months.map((_, i) => 10 + Math.round(Math.random() * 40 + i * 2));
}

export default function Analytics() {
  // Global filters
  const [dateRange, setDateRange] = useState("last30");
  const [regions, setRegions] = useState<string[]>([]);
  const [rubros, setRubros] = useState<string[]>([]);

  // Simulated metric series (updates every 30s)
  const [publishedSeries, setPublishedSeries] = useState<number[]>(() => generateMockSeries());
  const [adjudicatedSeries, setAdjudicatedSeries] = useState<number[]>(() => generateMockSeries());
  const [canceledSeries, setCanceledSeries] = useState<number[]>(() => generateMockSeries());

  // KPIs derived
  const totalLicitaciones = useMemo(() => publishedSeries.reduce((s, x) => s + x, 0), [publishedSeries]);
  const ahorroGenerado = useMemo(() => Math.round(Math.random() * 20000000 + 2000000), []); // placeholder
  const proveedoresActivos = 156; // stub
  const tiempoPromedio = 18; // days

  // Tables data (mock top providers and tenders)
  const [topProviders] = useState(() =>
    Array.from({ length: 20 }).map((_, i) => ({
      id: `P-${100 + i}`,
      nombre: `Proveedor ${i + 1}`,
      participaciones: Math.round(Math.random() * 80 + 5),
      adjudicadas: Math.round(Math.random() * 30),
      tasa: Math.round(Math.random() * 10000) / 100,
      monto: Math.round(Math.random() * 500000000) / 100,
      rating: (Math.random() * 2 + 3).toFixed(1),
    }))
  );

  const [highlightedTender] = useState(() =>
    Array.from({ length: 50 }).map((_, i) => ({
      id: `L-${200 + i}`,
      titulo: `Licitación ${i + 1}`,
      monto: Math.round(Math.random() * 100000000),
      ofertas: Math.round(Math.random() * 10 + 1),
      ahorro: Math.round(Math.random() * 15000000),
      tiempo: Math.round(Math.random() * 30 + 5),
      estado: ['Abierta','Adjudicada','Cerrada'][i%3]
    }))
  );

  // Prepare chart data
  const lineData = months.map((m, i) => ({
    month: m,
    Publicadas: publishedSeries[i] || 0,
    Adjudicadas: adjudicatedSeries[i] || 0,
    Canceladas: canceledSeries[i] || 0,
  }));

  const pieData = [
    { name: 'Tecnología', value: 40 },
    { name: 'Servicios', value: 30 },
    { name: 'Productos', value: 15 },
    { name: 'Consultoría', value: 10 },
    { name: 'Logística', value: 5 },
  ];

  const horizData = Array.from({ length: 8 }).map((_, i) => ({
    name: `Org ${i + 1}`,
    ahorro: (8 - i) * 1200000 + Math.round(Math.random() * 300000),
  }));

  const scatterPoints = (topProviders || []).slice(0, 12).map((p) => ({
    x: p.participaciones,
    y: Number(p.tasa),
    r: Math.max(20, Math.round((p.monto / 1000000) * 3)),
    name: p.nombre,
  }));

  const ganttItems = highlightedTender.slice(0, 8).map((t, i) => ({
    id: t.id,
    label: t.titulo,
    start: i * 5,
    duration: Math.max(3, Math.round(t.tiempo / 2)),
    color: i % 2 === 0 ? '#60a5fa' : '#34d399',
  }));

  const groupedData = groupedLabelsToData();

  function groupedLabelsToData() {
    const labels = ['<$1M', '$1M-$5M', '$5M-$10M', '>$10M'];
    const pub = [12, 24, 8, 6];
    const adj = [8, 18, 6, 4];
    return labels.map((lab, i) => ({ name: lab, Publicadas: pub[i], Adjudicadas: adj[i] }));
  }

  // Real-time update simulation
  useEffect(() => {
    const id = setInterval(() => {
      setPublishedSeries((s) => [...s.slice(1), Math.max(5, Math.round(10 + Math.random() * 60))]);
      setAdjudicatedSeries((s) => [...s.slice(1), Math.max(2, Math.round(5 + Math.random() * 40))]);
      setCanceledSeries((s) => [...s.slice(1), Math.max(0, Math.round(Math.random() * 10))]);
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const handleExportPDF = () => {
    // Placeholder action
    alert('Exportando reporte PDF... (simulado)');
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header with filters */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics y Reportes</h1>
            <p className="text-sm text-muted-foreground">Métricas clave y reportes de adquisición</p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={(v)=> setDateRange(v)}>
              <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="last7">Últimos 7 días</SelectItem>
                <SelectItem value="last30">Últimos 30 días</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            <Input placeholder="Región (opcional)" className="w-56" />
            <Input placeholder="Rubro (opcional)" className="w-56" />

            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleExportPDF}>Exportar Reporte PDF</Button>
          </div>
        </div>

        {/* KPIs row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-[140px]">
            <div className="text-sm text-gray-600">Total Licitaciones</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{totalLicitaciones}</div>
            <div className="mt-2 text-sm text-green-600">↑ 12% vs período anterior</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 h-[140px]">
            <div className="text-sm text-gray-600">Ahorro Generado</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(ahorroGenerado)}</div>
            <div className="mt-2 text-sm text-gray-700">8.3% del presupuesto</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 h-[140px]">
            <div className="text-sm text-gray-600">Proveedores Activos</div>
            <div className="text-3xl font-bold text-orange-600 mt-2">{proveedoresActivos}</div>
            <div className="mt-2 text-sm text-gray-700">+15 este mes</div>
            <div className="mt-3 flex -space-x-2">
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 h-[140px]">
            <div className="text-sm text-gray-600">Tiempo Promedio Proceso</div>
            <div className="text-3xl font-bold text-gray-700 mt-2">{tiempoPromedio} días</div>
            <div className="mt-2 text-sm text-green-600">↓ 2 días vs anterior</div>
            <div className="mt-3 flex items-center justify-center">
            </div>
          </div>
        </div>

        {/* Main charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left column large line chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Licitaciones en el Tiempo</h3>
              <div className="text-sm text-muted-foreground">Últimos 12 meses</div>
            </div>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Publicadas" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Adjudicadas" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Canceladas" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Legend: Publicadas (azul) · Adjudicadas (verde) · Canceladas (rojo)</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Distribución por Rubro</h3>
              <div className="text-sm text-muted-foreground">Porcentaje y cantidad</div>
            </div>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#7c3aed"][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Ahorro por Organismo</h3>
            </div>
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height={350}>
                <ReBarChart layout="vertical" data={horizData} margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip formatter={(val:number) => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(val)} />
                  <Bar dataKey="ahorro" fill="#60a5fa" />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Tasa Adjudicación Proveedores</h3>
            </div>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <ReScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="x" name="Participaciones" />
                  <YAxis type="number" dataKey="y" name="Tasa" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={scatterPoints} fill="#10b981" />
                </ReScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Timeline Procesos</h3>
            </div>
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height={250}>
                <ReBarChart layout="vertical" data={ganttItems.map(g => ({ name: g.label, start: g.start, duration: g.duration, color: g.color }))} margin={{ top: 5, right: 20, left: 140, bottom: 5 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip formatter={(val:number) => val} />
                  {/* base (invisible) to offset the start */}
                  <Bar dataKey="start" stackId="a" fill="#f3f4f6" />
                  <Bar dataKey="duration" stackId="a">
                    {ganttItems.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Montos por Rango</h3>
            </div>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <ReBarChart data={groupedData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Publicadas" fill="#0ea5e9" />
                  <Bar dataKey="Adjudicadas" fill="#10b981" />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabs with detail tables */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-3">
              <button className="text-sm font-medium">Top Proveedores</button>
              <button className="text-sm text-muted-foreground">Licitaciones Destacadas</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left">Proveedor</th>
                  <th className="px-3 py-2 text-left">Participaciones</th>
                  <th className="px-3 py-2 text-left">Adjudicadas</th>
                  <th className="px-3 py-2 text-left">Tasa %</th>
                  <th className="px-3 py-2 text-left">Monto Total</th>
                  <th className="px-3 py-2 text-left">Rating</th>
                </tr>
              </thead>
              <tbody>
                {topProviders.slice(0, 12).map((p) => (
                  <tr key={p.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2">{p.nombre}</td>
                    <td className="px-3 py-2">{p.participaciones}</td>
                    <td className="px-3 py-2">{p.adjudicadas}</td>
                    <td className="px-3 py-2">{p.tasa}%</td>
                    <td className="px-3 py-2">{new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(p.monto)}</td>
                    <td className="px-3 py-2">{p.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
