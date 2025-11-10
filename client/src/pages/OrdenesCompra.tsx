import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { useLocation } from "wouter";
import { MoreVertical, Download, Mail, Eye } from "lucide-react";
import { toast } from "sonner";

type EstadoOC =
  | "Borrador"
  | "Pendiente"
  | "Aprobada"
  | "Rechazada"
  | "En Proceso"
  | "Completada"
  | "Cancelada";

type Orden = {
  id: string;
  proveedor: { name: string; avatar?: string };
  licitacionId?: string | null;
  monto: number;
  estado: EstadoOC;
  fechaEmision: string; // ISO
  fechaEntrega: string; // ISO
  responsable: { name: string; avatar?: string };
};

const mock: Orden[] = [
  {
    id: "OC-2024-001",
    proveedor: { name: "Innova Ltda.", avatar: "" },
    licitacionId: "L-2024-1001",
    monto: 12500000,
    estado: "Pendiente",
    fechaEmision: "2024-08-01",
    fechaEntrega: "2024-09-01",
    responsable: { name: "María López", avatar: "" },
  },
  {
    id: "OC-2024-002",
    proveedor: { name: "Soluciones SA", avatar: "" },
    licitacionId: null,
    monto: 4200000,
    estado: "Aprobada",
    fechaEmision: "2024-07-11",
    fechaEntrega: "2024-08-12",
    responsable: { name: "Juan Pérez", avatar: "" },
  },
  {
    id: "OC-2024-003",
    proveedor: { name: "Construcciones XYZ", avatar: "" },
    licitacionId: "L-2024-095",
    monto: 98000000,
    estado: "En Proceso",
    fechaEmision: "2024-06-20",
    fechaEntrega: "2024-12-01",
    responsable: { name: "Ana Torres", avatar: "" },
  },
  {
    id: "OC-2024-004",
    proveedor: { name: "Servicios Globales", avatar: "" },
    licitacionId: null,
    monto: 7500000,
    estado: "Borrador",
    fechaEmision: "2024-09-10",
    fechaEntrega: "2024-10-10",
    responsable: { name: "Carlos Díaz", avatar: "" },
  },
  {
    id: "OC-2024-005",
    proveedor: { name: "Logística Chile", avatar: "" },
    licitacionId: "L-2024-077",
    monto: 3200000,
    estado: "Completada",
    fechaEmision: "2024-03-18",
    fechaEntrega: "2024-04-20",
    responsable: { name: "Patricia Soto", avatar: "" },
  },
];

const estadoColors: Record<EstadoOC, string> = {
  Borrador: "bg-gray-100 text-gray-700",
  Pendiente: "bg-yellow-100 text-yellow-800",
  Aprobada: "bg-emerald-100 text-emerald-700",
  Rechazada: "bg-red-100 text-red-700",
  "En Proceso": "bg-blue-100 text-blue-700",
  Completada: "bg-green-100 text-green-700",
  Cancelada: "bg-gray-100 text-gray-700",
};

export default function OrdenesCompra() {
  const [location, setLocation] = useLocation();

  // Header stats would normally come from API
  const estadisticas = useMemo(() => ({
    pendientes: mock.filter((m) => m.estado === "Pendiente").length,
    activas: mock.filter((m) => ["Aprobada", "En Proceso"].includes(m.estado)).length,
    completadas: mock.filter((m) => m.estado === "Completada").length,
    totalMonto: mock.reduce((s, o) => s + o.monto, 0),
  }), []);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEstados, setSelectedEstados] = useState<EstadoOC[]>([]);
  const [proveedorQuery, setProveedorQuery] = useState("");
  const [amountRange, setAmountRange] = useState<number[]>([0, 100000000]);
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");

  // Table state
  const [selected, setSelected] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return mock.filter((o) => {
      if (searchQuery && ![o.id, o.proveedor.name, o.licitacionId ?? ""].join(" ").toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedEstados.length && !selectedEstados.includes(o.estado)) return false;
      if (proveedorQuery && !o.proveedor.name.toLowerCase().includes(proveedorQuery.toLowerCase())) return false;
      if (o.monto < amountRange[0] || o.monto > amountRange[1]) return false;
      if (fechaDesde && new Date(o.fechaEmision) < new Date(fechaDesde)) return false;
      if (fechaHasta && new Date(o.fechaEmision) > new Date(fechaHasta)) return false;
      return true;
    });
  }, [searchQuery, selectedEstados, proveedorQuery, amountRange, fechaDesde, fechaHasta]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelect = (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const selectAllPage = () =>
    setSelected((prev) => {
      const allOnPage = pageItems.every((p) => prev.includes(p.id));
      if (allOnPage) {
        // remove page items
        return prev.filter((id) => !pageItems.some((pi) => pi.id === id));
      }
      // add page items that aren't already selected
      const toAdd = pageItems.map((pi) => pi.id).filter((id) => !prev.includes(id));
      return [...prev, ...toAdd];
    });

  const handleAction = (action: string, orden: Orden) => {
    switch (action) {
      case "Ver":
        setLocation(`/ordenes/${orden.id}`);
        break;
      case "Aprobar":
      case "Rechazar":
      case "Cancelar":
      case "Confirmar Recepción":
      case "Editar":
      case "Descargar":
      case "EnviarEmail":
        toast(`Acción ${action} para ${orden.id}`);
        break;
      default:
        toast.info(`Acción ${action}`);
    }
  };

  const handleMass = (action: string) => {
    toast(`Acción masiva ${action} para ${selected.length} Orden(es) de Compra`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Órdenes de Compra</h1>
              <p className="text-sm text-muted-foreground mt-1">Visualiza y gestiona tus órdenes</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="grid grid-cols-4 gap-3">
                <div className="w-[220px] h-[100px] bg-white border border-gray-200 rounded p-4">
                  <div className="text-sm text-gray-600">Pendientes Aprobación</div>
                  <div className="text-2xl font-bold text-orange-600 mt-2">{estadisticas.pendientes}</div>
                </div>
                <div className="w-[220px] h-[100px] bg-white border border-gray-200 rounded p-4">
                  <div className="text-sm text-gray-600">Activas</div>
                  <div className="text-2xl font-bold text-blue-600 mt-2">{estadisticas.activas}</div>
                </div>
                <div className="w-[220px] h-[100px] bg-white border border-gray-200 rounded p-4">
                  <div className="text-sm text-gray-600">Completadas</div>
                  <div className="text-2xl font-bold text-green-600 mt-2">{estadisticas.completadas}</div>
                </div>
                <div className="w-[220px] h-[100px] bg-white border border-gray-200 rounded p-4">
                  <div className="text-sm text-gray-600">Total Monto</div>
                  <div className="text-2xl font-bold text-gray-700 mt-2">{new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(estadisticas.totalMonto)}</div>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 ml-6" onClick={() => setLocation("/ordenes/nueva") }>
                + Nueva Orden
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Buscar Orden Compra..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Estado</label>
              <div className="flex flex-wrap gap-2">
                {(["Borrador","Pendiente","Aprobada","Rechazada","En Proceso","Completada","Cancelada"] as EstadoOC[]).map((s)=> (
                  <label key={s} className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedEstados.includes(s)} onChange={(e)=>{
                      setSelectedEstados((prev)=> e.target.checked ? [...prev,s] : prev.filter(x=>x!==s));
                    }} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <Input placeholder="Proveedor" value={proveedorQuery} onChange={(e)=>setProveedorQuery(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Rango Monto</label>
              <div className="flex items-center gap-3">
                <Slider className="w-full" defaultValue={[0, 100000000]} min={0} max={100000000} onValueChange={(v:any)=> setAmountRange(v)} />
                <div className="text-sm text-gray-600">{new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(amountRange[0])} - {new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(amountRange[1])}</div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Fecha Desde</label>
              <Input type="date" value={fechaDesde} onChange={(e)=>setFechaDesde(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Fecha Hasta</label>
              <Input type="date" value={fechaHasta} onChange={(e)=>setFechaHasta(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700">Aplicar</Button>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedEstados([]); setProveedorQuery(""); setAmountRange([0,100000000]); setFechaDesde(""); setFechaHasta(""); }}>Limpiar</Button>
          </div>
        </div>

        {/* Table / Grid Toggle */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filtered.length)} de {filtered.length} resultados</div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant={viewMode === "table" ? "default" : "outline"} onClick={()=>setViewMode("table")}>Tabla</Button>
            <Button size="sm" variant={viewMode === "grid" ? "default" : "outline"} onClick={()=>setViewMode("grid")}>Grid</Button>
            <Select value={String(itemsPerPage)} onValueChange={(v)=>{ setItemsPerPage(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table view */}
        {viewMode === "table" && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3"><Checkbox checked={pageItems.every(p=>selected.includes(p.id))} onCheckedChange={selectAllPage} /></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">ID Orden Compra</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Proveedor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Licitación</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Monto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 hidden md:table-cell">Fecha Emisión</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 hidden lg:table-cell">Fecha Entrega</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 hidden lg:table-cell">Responsable</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((o) => (
                    <tr key={o.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3"><Checkbox checked={selected.includes(o.id)} onCheckedChange={()=>toggleSelect(o.id)} /></td>
                      <td className="px-4 py-3 text-sm text-blue-600 hover:underline cursor-pointer" onClick={()=>setLocation(`/ordenes/${o.id}`)}>{o.id}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={o.proveedor.avatar || getAvatarUrl(o.proveedor.name)} alt={o.proveedor.name} />
                          </Avatar>
                          <span>{o.proveedor.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600">{o.licitacionId ? <a onClick={()=> setLocation(`/oportunidades/${o.licitacionId}`)}>{o.licitacionId}</a> : "—"}</td>
                      <td className="px-4 py-3 text-right text-sm">{new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(o.monto)}</td>
                      <td className="px-4 py-3 text-sm"><span className={`${estadoColors[o.estado]} px-2 py-1 rounded-full text-xs`}>{o.estado}</span></td>
                      <td className="px-4 py-3 text-sm hidden md:table-cell">{new Date(o.fechaEmision).toLocaleDateString('es-CL')}</td>
                      <td className="px-4 py-3 text-sm hidden lg:table-cell">{new Date(o.fechaEntrega).toLocaleDateString('es-CL')}</td>
                      <td className="px-4 py-3 text-sm hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={o.responsable.avatar || getAvatarUrl(o.responsable.name)} alt={o.responsable.name} />
                          </Avatar>
                          <span>{o.responsable.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={()=>handleAction('Ver', o)}><Eye className="h-4 w-4 mr-2 inline" />Ver Detalles</DropdownMenuItem>
                            {o.estado === 'Pendiente' && <DropdownMenuItem onClick={()=>handleAction('Aprobar', o)}>Aprobar</DropdownMenuItem>}
                            {o.estado === 'Pendiente' && <DropdownMenuItem onClick={()=>handleAction('Rechazar', o)}>Rechazar</DropdownMenuItem>}
                            {o.estado === 'Borrador' && <DropdownMenuItem onClick={()=>handleAction('Editar', o)}>Editar</DropdownMenuItem>}
                            {o.estado === 'Aprobada' && <DropdownMenuItem onClick={()=>handleAction('Cancelar', o)}>Cancelar</DropdownMenuItem>}
                            {o.estado === 'En Proceso' && <DropdownMenuItem onClick={()=>handleAction('Confirmar Recepción', o)}>Confirmar Recepción</DropdownMenuItem>}
                            <DropdownMenuItem onClick={()=>handleAction('Descargar', o)}><Download className="h-4 w-4 mr-2 inline"/>Descargar PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={()=>handleAction('EnviarEmail', o)}><Mail className="h-4 w-4 mr-2 inline"/>Enviar Email</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">Página {currentPage} de {totalPages}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={()=>setCurrentPage((p)=>Math.max(1,p-1))} disabled={currentPage===1}>Anterior</Button>
                <Button size="sm" onClick={()=>setCurrentPage((p)=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages}>Siguiente</Button>
              </div>
            </div>
          </div>
        )}

        {/* Grid view */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(o=> (
              <div key={o.id} className="bg-white border border-gray-200 rounded-lg p-4 h-[240px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={o.proveedor.avatar || getAvatarUrl(o.proveedor.name)} alt={o.proveedor.name} />
                    </Avatar>
                    <div className="text-sm font-medium">{o.proveedor.name}</div>
                  </div>
                  <div className="text-sm text-blue-600 font-semibold">{o.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mt-2">{new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(o.monto)}</div>
                  <div className="mt-2"><span className={`${estadoColors[o.estado]} px-2 py-1 rounded-full text-xs`}>{o.estado}</span></div>
                  <div className="text-sm text-gray-500 mt-2">Emisión: {new Date(o.fechaEmision).toLocaleDateString('es-CL')}</div>
                  <div className="text-sm text-gray-500 mt-1">Licitación: {o.licitacionId || '—'}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={()=>handleAction('Ver', o)}>Ver</Button>
                  <Button size="sm" variant="outline" onClick={()=>handleAction('Descargar', o)}>PDF</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mass actions toolbar */}
        {selected.length >= 2 && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-6 bg-white shadow-lg border border-gray-200 rounded p-3 flex items-center gap-4 z-50">
            <div className="text-sm">{selected.length} seleccionadas</div>
            <div className="flex gap-2">
              <Button size="sm" onClick={()=>handleMass('Aprobar')}>Aprobar</Button>
              <Button size="sm" variant="destructive" onClick={()=>handleMass('Rechazar')}>Rechazar</Button>
              <Button size="sm" onClick={()=>handleMass('Exportar')}>Exportar</Button>
              <Button size="sm" onClick={()=>handleMass('Enviar')}>Enviar</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
