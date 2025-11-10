import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Star } from "lucide-react";

const months12 = Array.from({ length: 12 }).map((_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - (11 - i));
  return d.toLocaleString('default', { month: 'short' });
});

function generateSeries() {
  const participaciones = months12.map(() => Math.round(20 + Math.random() * 80));
  const adjudicadas = participaciones.map((p) => Math.round(p * (0.2 + Math.random() * 0.4)));
  const ingresos = months12.map((_, i) => Math.round(1000000 + Math.random() * 800000 + i * 20000));
  return { participaciones, adjudicadas, ingresos };
}

export default function Estadisticas() {
  const [range, setRange] = useState('12m');
  const dataSeries = useMemo(() => generateSeries(), []);

  const lineData = months12.map((m, i) => ({ month: m, Participaciones: dataSeries.participaciones[i], Adjudicadas: dataSeries.adjudicadas[i] }));

  const pieData = useMemo(() => [
    { name: 'Tecnología', value: 40 },
    { name: 'Servicios', value: 25 },
    { name: 'Productos', value: 20 },
    { name: 'Consultoría', value: 10 },
    { name: 'Logística', value: 5 },
  ], []);

  const ingresosData = months12.map((m, i) => ({ month: m, ingresos: dataSeries.ingresos[i] }));

  const rankingData = Array.from({ length: 6 }).map((_, i) => ({ month: `M-${i+1}`, ranking: Math.round(2 + Math.random() * 3) }));

  const radarData = [
    { subject: 'Precio', A: 4.3, B: 4.8 },
    { subject: 'Experiencia', A: 4.1, B: 4.6 },
    { subject: 'Propuesta', A: 4.0, B: 4.5 },
    { subject: 'Referencias', A: 4.2, B: 4.7 },
  ];

  const compradores = Array.from({ length: 10 }).map((_, i) => ({ name: `Org ${i+1}`, value: Math.round(5 + Math.random()*30) }));

  const kpis = useMemo(()=>({
    participaciones: dataSeries.participaciones.reduce((s,a)=>s+a,0),
    tasa: Math.round((dataSeries.adjudicadas.reduce((s,a)=>s+a,0)/Math.max(1,dataSeries.participaciones.reduce((s,a)=>s+a,0)))*100),
    ingresos: dataSeries.ingresos.reduce((s,a)=>s+a,0),
    ranking: (rankingData.reduce((s,a)=>s+a.ranking,0)/rankingData.length).toFixed(2),
    rating: 4.2,
  }), [dataSeries]);

  const latestParticipaciones = Array.from({ length: 20 }).map((_, i) => ({
    id: `PART-${300+i}`,
    fecha: new Date(Date.now() - i*86400000).toISOString(),
    licitacion: `LIC-2024-${String((i%12)+1).padStart(3,'0')}`,
    rubro: ['Tecnología','Servicios','Productos'][i%3],
    resultado: i%4===0 ? 'Adjudicada' : 'Participada',
    monto: Math.round(1000000 + Math.random()*5000000),
  }));

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mis Estadísticas</h1>
          </div>
          <div className="flex items-center gap-2">
            <Select>
              <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="12m">Últimos 12 meses</SelectItem>
                <SelectItem value="6m">Últimos 6 meses</SelectItem>
                <SelectItem value="3m">Últimos 3 meses</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Buscar..." className="w-64" />
          </div>
        </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white border rounded p-4">Participaciones Totales<div className="text-2xl font-bold">{kpis.participaciones}</div></div>
            <div className="bg-white border rounded p-4">Tasa Adjudicación<div className="text-2xl font-bold">{kpis.tasa}%</div></div>
            <div className="bg-white border rounded p-4">Ingresos Totales<div className="text-2xl font-bold">{new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(kpis.ingresos)}</div></div>
            <div className="bg-white border rounded p-4">Ranking Promedio<div className="text-2xl font-bold">{kpis.ranking}</div></div>
            <div className="bg-white border rounded p-4">
        Rating Promedio
        {/* Usamos 'flex items-center' para alinear el número y el icono verticalmente */}
        <div className="text-2xl font-bold flex items-center gap-1">
            {kpis.rating} 
            <Star className="w-6 h-6 text-yellow-500" /> {/* Se añade una clase para tamaño y color si es necesario */}
        </div>
    </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold mb-2">Participaciones vs Adjudicaciones</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Participaciones" stroke="#0ea5e9" />
                  <Line type="monotone" dataKey="Adjudicadas" stroke="#10b981" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold mb-2">Distribución por Rubro</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <RePieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#7c3aed"][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold mb-2">Ingresos Mensuales</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <ReBarChart data={ingresosData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    stroke="#6b7280" 
                    // Se usa una función para abreviar números grandes (1000000 -> 1M)
                    tickFormatter={(value) => {
                        if (value >= 1000000) {
                            return (value / 1000000).toFixed(1) + 'M';
                        }
                        if (value >= 1000) {
                            return (value / 1000).toFixed(0) + 'K';
                        }
                        // Usar el separador de miles para números más pequeños
                        return new Intl.NumberFormat('es-CL').format(value);
                    }}
                />
                  <Tooltip formatter={(val:number)=> new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(val)} />
                  <Bar dataKey="ingresos" fill="#34d399" />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold mb-2">Ranking Promedio Evolución</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={rankingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="ranking" stroke="#6366f1" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold mb-2">Puntajes Breakdown</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar name="Promedio" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                  <Radar name="Top" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold mb-2">Compradores Frecuentes</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <ReBarChart layout="vertical" data={compradores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#60a5fa" />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold">Últimas 20 participaciones</div>
            <div><Button className="bg-blue-600">Exportar Excel</Button></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="px-3 py-2">ID</th><th className="px-3 py-2">Fecha</th><th className="px-3 py-2">Licitación</th><th className="px-3 py-2">Rubro</th><th className="px-3 py-2">Resultado</th><th className="px-3 py-2 text-right">Monto</th></tr></thead>
              <tbody>
                {latestParticipaciones.map(p=> (
                  <tr key={p.id} className="border-b"><td className="px-3 py-2">{p.id}</td><td className="px-3 py-2">{new Date(p.fecha).toLocaleDateString()}</td><td className="px-3 py-2">{p.licitacion}</td><td className="px-3 py-2">{p.rubro}</td><td className="px-3 py-2">{p.resultado}</td><td className="px-3 py-2 text-right">{fmtCurrency(p.monto)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function fmtCurrency(v:number){
  return new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(v);
}
