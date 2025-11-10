import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Search, List, LayoutGrid } from "lucide-react";


type Opportunity = {
  id: string;
  titulo: string;
  organismo: { nombre: string; logo?: string };
  rubro: string;
  monto: number;
  fechaCierre: string; // ISO
  diasRestantes: number;
  estado: string;
  nueva?: boolean;
  recomendada?: boolean;
  favorito?: boolean;
  region?: string;
};

const RUBROS = [
  "Tecnología",
  "Servicios",
  "Productos",
  "Consultoría",
  "Logística",
  "Construcción",
  "Mantenimiento",
  "Otros",
];

function formatMoney(n: number) {
  // Asegura que el número se formatee con el separador de miles correcto (ej. 1.958.463)
  return "$ " + n.toLocaleString("es-CL");
}

function generateMock(count = 150): Opportunity[] {
  const orgs = [
    { nombre: "Ministerio de Educación"},
    { nombre: "Ministerio de Salud"},
    { nombre: "Municipalidad Santiago"},
    { nombre: "Universidad del Sur"},
  ];
  const arr: Opportunity[] = [];
  for (let i = 1; i <= count; i++) {
    const rubro = RUBROS[i % RUBROS.length];
    const monto = Math.round((Math.random() * 10000000) + 100000);
    const dias = Math.floor(Math.random() * 60);
    arr.push({
      id: `LIC-2024-${String(i).padStart(3, "0")}`,
      titulo: `${["Suministro de", "Servicios de", "Contratación de"][i % 3]} ${rubro} ${i}`,
      organismo: orgs[i % orgs.length],
      rubro,
      monto,
      fechaCierre: new Date(Date.now() + dias * 24 * 3600 * 1000).toISOString(),
      diasRestantes: dias,
      estado: dias < 7 ? "cierre próximo" : "abierta",
      nueva: i % 12 === 0,
      recomendada: i % 10 === 0,
      favorito: false,
      region: ["Metropolitana", "Valparaíso", "Biobío"][i % 3],
    });
  }
  return arr;
}

export default function Licitaciones() {
  const all = useMemo(() => generateMock(150), []);
  const [data, setData] = useState<Opportunity[]>(all);
  const [query, setQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedRubros, setSelectedRubros] = useState<string[]>(["Tecnología", "Servicios"]);
  const [estadoFilter, setEstadoFilter] = useState<string>("abierta");
  const [regionFilter, setRegionFilter] = useState<string[]>(["Metropolitana"]);
  const [minMonto, setMinMonto] = useState<number>(500000);
  const [maxMonto, setMaxMonto] = useState<number>(10000000);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [loading, setLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Debounced search effect
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const q = query.trim().toLowerCase();
      let filtered = all.filter(item => {
        const matchesQuery = q === "" || item.titulo.toLowerCase().includes(q) || item.rubro.toLowerCase().includes(q) || item.organismo.nombre.toLowerCase().includes(q);
        const matchesRubro = selectedRubros.length === 0 || selectedRubros.includes(item.rubro);
        const matchesEstado = estadoFilter === "todas" ? true : (estadoFilter === "abierta" ? item.estado === "abierta" : estadoFilter === item.estado);
        const matchesRegion = regionFilter.length === 0 || regionFilter.includes(item.region || "");
        const matchesMonto = item.monto >= minMonto && item.monto <= maxMonto;
        return matchesQuery && matchesRubro && matchesEstado && matchesRegion && matchesMonto;
      });
      setData(filtered);
      setPage(1);
      setLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [query, selectedRubros, estadoFilter, regionFilter, minMonto, maxMonto, all]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  const toggleRubro = useCallback((r: string) => {
    setSelectedRubros(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  }, []);

  const suggestions = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    const results: string[] = [];
    for (const it of all) {
      if (results.length >= 8) break;
      if (it.titulo.toLowerCase().includes(q)) results.push(it.titulo);
    }
    for (const r of RUBROS) {
      if (results.length >= 8) break;
      if (r.toLowerCase().includes(q)) results.push(r);
    }
    for (const o of Array.from(new Set(all.map(a => a.organismo.nombre)))) {
      if (results.length >= 8) break;
      if (o.toLowerCase().includes(q)) results.push(o);
    }
    return results;
  }, [query, all]);

  const [, setLocation] = useLocation();

  return (
    <DashboardLayout>
      <div className="p-6">


        {/* Hero */}
        <div className="rounded-lg overflow-hidden mb-6">
          <div className="bg-primary text-white" style={{ height: 'auto', padding: '2rem 0' }}>
            <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
                {/* Títulos y Subtítulos */}
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    Encuentra Oportunidades de Negocio
                </h1>
                <p className="text-lg text-white/90 mb-8">
                    Miles de licitaciones públicas esperando tu oferta
                </p>

                {/* Barra de Búsqueda y Opciones */}
                <div className="w-full max-w-4xl flex gap-4 items-start">
                    <div className="relative flex-1">
                        {/* INICIO DE MEJORA VISUAL: Mayor altura, shadow-xl y focus ring */}
                        <div className="flex items-center bg-white rounded-lg px-4 shadow-xl h-14 focus-within:ring-2 focus-within:ring-white/50 transition-all duration-300">
                            <span className="text-gray-400 text-xl mr-3"><Search></Search></span>
                            <Input
                                placeholder="Busca por palabra clave, rubro, organismo..."
                                className="border-0 bg-transparent h-full text-base flex-1 placeholder-gray-500 text-gray-800"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <div className="ml-3">
                                <Button 
                                    onClick={() => { /* search is live */ }} 
                                    className="h-11 px-6 rounded-md font-semibold transition duration-200 hover:opacity-90" 
                                    style={{ backgroundColor: '#2563eb', color: 'white', width: 140 }}
                                >
                                    Buscar
                                </Button>
                            </div>
                        </div>

                        {/* Suggestions */}
                        {suggestions.length > 0 && (
                            <ul className="absolute left-0 right-0 bg-white shadow-lg border border-gray-200 rounded-b-lg mt-2 max-h-64 overflow-auto z-30">
                                {suggestions.map((s, i) => (
                                    <li 
                                        key={i} 
                                        className="px-4 py-3 text-gray-800 hover:bg-gray-50 cursor-pointer transition duration-150" 
                                        onClick={() => setQuery(s)} 
                                        dangerouslySetInnerHTML={{ __html: s.replace(new RegExp(query, 'ig'), (m) => `<strong class='bg-yellow-200 rounded px-1'>${m}</strong>`) }} 
                                    />
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <a className="text-sm text-white underline cursor-pointer hover:text-white/80 transition duration-150" onClick={() => setShowAdvanced(v => !v)}>Búsqueda Avanzada</a>
                    </div>
                </div>

                {/* Quick stats (Métricas) */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
                    {/* MEJORA VISUAL: Borde sutil y padding más uniforme */}
                    <div className="bg-white/20 rounded-lg p-4 text-center border border-white/30 backdrop-blur-sm">
                        <div className="text-3xl font-bold">248</div>
                        <div className="text-sm mt-1 text-white/90">licitaciones activas</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 text-center border border-white/30 backdrop-blur-sm">
                        <div className="text-3xl font-bold">1.2M</div>
                        <div className="text-sm mt-1 text-white/90">en oportunidades</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 text-center border border-white/30 backdrop-blur-sm">
                        <div className="text-3xl font-bold">15</div>
                        <div className="text-sm mt-1 text-white/90">nuevas hoy</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 text-center border border-white/30 backdrop-blur-sm">
                        <div className="text-3xl font-bold">42</div>
                        <div className="text-sm mt-1 text-white/90">cierran esta semana</div>
                    </div>
                </div>
            </div>
        </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="space-y-4">
              {/* MEJORA VISUAL: Se quita bg-blue-50 para una mejor integración, se deja solo el fondo de Card (blanco) */}
              <Card className="p-4 border-l-4 border-blue-600">
                <h4 className="font-semibold">¿Qué te interesa?</h4>
                <p className="text-sm text-gray-600">Te mostraremos primero lo que te interesa</p>
                <div className="mt-3 space-y-2">
                  {RUBROS.map(r => (
                    <label key={r} className="flex items-center justify-between gap-2 text-sm cursor-pointer hover:text-blue-600">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={selectedRubros.includes(r)} onChange={() => toggleRubro(r)} className="form-checkbox text-blue-600 rounded" />
                        <span>{r}</span>
                      </div>
                      {/* MEJORA VISUAL: Mejor estilo para el contador */}
                      <span className="text-xs text-gray-700 bg-gray-200 px-2 py-0.5 rounded-full font-medium">45</span>
                    </label>
                  ))}
                </div>
                <a className="text-sm text-blue-600 mt-3 inline-block font-medium cursor-pointer hover:underline">Guardar preferencias</a>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold">Estado</h4>
                <div className="mt-2 space-y-1 text-sm">
                  {/* MEJORA VISUAL: Se añade cursor-pointer y hover para mejor UX en los radios */}
                  <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="radio" checked={estadoFilter === 'todas'} onChange={() => setEstadoFilter('todas')} className="form-radio text-blue-600" /> Todas (248)</label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="radio" checked={estadoFilter === 'abierta'} onChange={() => setEstadoFilter('abierta')} className="form-radio text-blue-600" /> Abiertas (156)</label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="radio" checked={estadoFilter === 'cierre próximo'} onChange={() => setEstadoFilter('cierre próximo')} className="form-radio text-blue-600" /> Cierre Próximo (42)</label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600"><input type="radio" checked={estadoFilter === 'nuevas'} onChange={() => setEstadoFilter('nuevas')} className="form-radio text-blue-600" /> Nuevas (15)</label>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold">Presupuesto</h4>
                <div className="mt-2 text-sm font-medium text-gray-700">{formatMoney(minMonto)} - {formatMoney(maxMonto)}</div>
                <div className="mt-3 flex gap-2">
                  {/* MEJORA VISUAL: Inputs de monto con mejor estilo de focus */}
                  <input type="number" className="border p-2 rounded w-1/2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" value={minMonto} onChange={(e) => setMinMonto(Number(e.target.value || 0))} />
                  <input type="number" className="border p-2 rounded w-1/2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" value={maxMonto} onChange={(e) => setMaxMonto(Number(e.target.value || 0))} />
                </div>
              </Card>
            </div>
          </aside>

          {/* Content */}
          <main>
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-700 text-sm font-medium">{data.length} oportunidades encontradas</div>
              <div className="flex items-center gap-3">
                <select className="border rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500">
                  <option>Más Recientes</option>
                  <option>Cierre Próximo</option>
                  <option>Mayor Monto</option>
                  <option>Menor Monto</option>
                  <option>Relevancia</option>
                </select>
                <div className="flex items-center gap-2 border rounded p-1">
                  {/* MEJORA VISUAL: Iconos de vista más claros */}
                  <button className={cn("p-1 rounded transition-colors", viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100')} onClick={() => setViewMode('grid')}>
                    <span className="text-lg"><LayoutGrid></LayoutGrid></span>
                  </button>
                  <button className={cn("p-1 rounded transition-colors", viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100')} onClick={() => setViewMode('list')}>
                    <span className="text-lg"><List></List></span>
                  </button>
                </div>
                {/* MEJORA VISUAL: Botón "Guardar Búsqueda" como acción primaria */}
                <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-8" onClick={() => setShowSaveModal(true)}>
                    Guardar Búsqueda
                </Button>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 text-sm h-8">
                    Exportar Resultados
                </Button>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-60 rounded" />
                ))}
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginated.map(item => (
                      <Card key={item.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                        {/* MEJORA VISUAL: Altura de banda de color reducida a h-16 (antes h-20) */}
                        <div className="h-16 flex flex-col justify-between" style={{ background: item.rubro === 'Tecnología' ? '#1e40af' : '#0ea5a0' }}>
                          <div className="p-2 text-white text-xs flex justify-between items-center font-medium">
                            <div>{item.id}</div>
                            <div className="flex gap-2">
                              {item.nueva && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">NUEVA</span>}
                              {item.diasRestantes < 7 && <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs">CIERRA PRONTO</span>}
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-white h-44 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-base line-clamp-2">{item.titulo}</h3>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                              <span className="text-lg">{item.organismo.logo}</span>
                              <span>{item.organismo.nombre}</span>
                            </div>
                            <div className="mt-3 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">{item.rubro}</div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="text-blue-600 font-bold text-lg">{formatMoney(item.monto)}</div>
                            <div className="text-xs text-gray-600">Cierra: {new Date(item.fechaCierre).toLocaleDateString()}</div>
                          </div>
                        </div>
                                <div className="p-3 bg-gray-50 flex gap-2">
                                  {/* MEJORA VISUAL: Botón de detalle con estilo outline más claro */}
                                  <button className="w-1/2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded py-2 text-sm font-medium" onClick={() => setLocation(`/oportunidades/${item.id}`)}>Ver Detalles</button>
                                  <button className="w-1/2 bg-blue-600 text-white hover:bg-blue-700 rounded py-2 text-sm font-medium" onClick={() => setLocation(`/ofertas/nueva-oferta/${item.id}`)}>Ofertar</button>
                                </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="text-left text-xs text-gray-600 border-b border-gray-200">
                          <th className="px-4 py-3" style={{ width: 40 }}></th>
                          <th className="px-4 py-3" style={{ width: 120 }}>ID</th>
                          <th className="px-4 py-3">Título</th>
                          <th className="px-4 py-3" style={{ width: 180 }}>Organismo</th>
                          <th className="px-4 py-3" style={{ width: 100 }}>Rubro</th>
                          <th className="px-4 py-3" style={{ width: 120 }}>Monto</th>
                          <th className="px-4 py-3" style={{ width: 140 }}>Cierre</th>
                          <th className="px-4 py-3" style={{ width: 100 }}>Estado</th>
                          <th className="px-4 py-3" style={{ width: 160 }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.map(it => (
                          <tr key={it.id} className="hover:bg-blue-50/50 border-b border-gray-100 transition-colors">
                            <td className="px-4 py-3"><button className="text-gray-500 hover:text-yellow-500 transition-colors">★</button></td>
                            <td className="px-4 py-3"><a className="text-blue-600 font-medium hover:underline cursor-pointer" onClick={() => setLocation(`/licitaciones/${it.id}`)}>{it.id}</a></td>
                            <td className="px-4 py-3 truncate" style={{ maxWidth: 300 }}>{it.titulo}</td>
                            <td className="px-4 py-3 flex items-center gap-2"><span>{it.organismo.logo}</span>{it.organismo.nombre}</td>
                            <td className="px-4 py-3"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">{it.rubro}</span></td>
                            <td className="px-4 py-3 font-semibold">{formatMoney(it.monto)}</td>
                            <td className="px-4 py-3">{new Date(it.fechaCierre).toLocaleDateString()} <div className="text-xs text-orange-500 font-medium">{it.diasRestantes} días</div></td>
                            <td className="px-4 py-3"><span className={cn("px-2 py-1 rounded text-xs font-medium", it.estado === 'abierta' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700')}>{it.estado.toUpperCase()}</span></td>
                            <td className="px-4 py-3 flex gap-2">
                                <button className="border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1 rounded text-xs font-medium" onClick={() => setLocation(`/licitaciones/${it.id}`)}>Ver</button>
                                <button className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded text-xs font-medium" onClick={() => setLocation(`/ofertas/nueva-oferta/${it.id}`)}>Ofertar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Página {page} de {totalPages}</div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 border rounded text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                      ← Anterior
                    </button>
                    <button className="px-4 py-2 border rounded text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                      Siguiente →
                    </button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>

        {/* Save Search Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800">Crear Alerta de Oportunidades</h3>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre búsqueda</label>
                <input className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: Licitaciones Tecnología Santiago" />
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600 border">
                <p className="font-semibold mb-1">Filtros Activos:</p>
                <div>Rubro: {selectedRubros.join(', ')}</div>
                <div>Región: {regionFilter.join(', ') || 'Todas'}</div>
                <div>Monto: {formatMoney(minMonto)} - {formatMoney(maxMonto)}</div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia de Alerta:</label>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="freq" defaultChecked className="form-radio text-blue-600" /> Inmediato (Notificación al instante)</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="freq" className="form-radio text-blue-600" /> Diario (Resumen una vez al día)</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="freq" className="form-radio text-blue-600" /> Semanal (Resumen los lunes)</label>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 font-medium transition-colors" onClick={() => setShowSaveModal(false)}>
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition-colors" onClick={() => { setShowSaveModal(false); }}>
                  Crear Alerta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}