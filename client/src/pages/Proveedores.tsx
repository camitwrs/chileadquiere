import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { MoreVertical, Mail, Star, Edit2, Trash2, X, Heart } from "lucide-react";
import { toast } from "sonner";

type EstadoProv = "Activo" | "Inactivo" | "En Revisión" | "Bloqueado";

type Proveedor = {
  id: string;
  nombre: string;
  rut: string;
  rubros: string[];
  region: string;
  rating: number; // 1-5
  reviews: number;
  certificaciones: string[];
  ultimaTransaccionDaysAgo: number;
  estado: EstadoProv;
  avatar?: string;
};

const rubrosList = ["Tecnología","Servicios","Productos","Consultoría","Logística","Construcción","Mantenimiento","Otros"];
const regiones = ["Metropolitana","Valparaíso","Biobío","Araucanía","Antofagasta"];

const mockProveedores: Proveedor[] = Array.from({ length: 28 }).map((_, i) => ({
  id: `P-${1000 + i}`,
  nombre: ["Innova Ltda.", "Soluciones SA", "Construcciones XYZ", "Servicios Globales", "Logística Chile"][i % 5] + ` ${i}`,
  rut: `76.000.${100 + i}-8`,
  rubros: [rubrosList[i % rubrosList.length]],
  region: regiones[i % regiones.length],
  rating: Math.round((3 + (i % 3) + Math.random()) * 10) / 10,
  reviews: 3 + (i % 20),
  certificaciones: i % 3 === 0 ? ["ISO 9001"] : i % 5 === 0 ? ["ISO 27001"] : [],
  ultimaTransaccionDaysAgo: (i * 7) % 45,
  estado: (i % 7 === 0 ? "En Revisión" : i % 9 === 0 ? "Bloqueado" : i % 2 === 0 ? "Activo" : "Inactivo") as EstadoProv,
  avatar: undefined,
}));

export default function Proveedores() {
  const [, setLocation] = useLocation();

  // stats
  const stats = useMemo(() => ({
    activos: mockProveedores.filter((p) => p.estado === "Activo").length,
    nuevos: mockProveedores.slice(0, 5).length,
    certificados: mockProveedores.filter((p) => p.certificaciones.length > 0).length,
    avgRating:
      mockProveedores.reduce((s, p) => s + p.rating, 0) / (mockProveedores.length || 1),
  }), []);

  // filters
  const [query, setQuery] = useState("");
  const [estados, setEstados] = useState<EstadoProv[]>([]);
  const [selectedRubros, setSelectedRubros] = useState<string[]>([]);
  const [selectedRegiones, setSelectedRegiones] = useState<string[]>([]);
  const [certificaciones, setCertificaciones] = useState<string[]>([]);
  const [ratingRange, setRatingRange] = useState<number[]>([1, 5]);

  // advanced
  const [experienceRange, setExperienceRange] = useState<number[]>([0, 30]);
  const [employeesRange, setEmployeesRange] = useState<string>("");
  const [turnoverRange, setTurnoverRange] = useState<string>("");
  const [conLicitaciones, setConLicitaciones] = useState(false);
  const [conOcPendientes, setConOcPendientes] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // view
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const itemsPerPage = 15; // fixed per spec

  const filtered = useMemo(() => {
    return mockProveedores.filter((p) => {
      if (query) {
        const q = query.toLowerCase();
        if (!`${p.nombre} ${p.rut} ${p.rubros.join(" ")}`.toLowerCase().includes(q)) return false;
      }
      if (estados.length && !estados.includes(p.estado)) return false;
      if (selectedRubros.length && !selectedRubros.some((r) => p.rubros.includes(r))) return false;
      if (selectedRegiones.length && !selectedRegiones.includes(p.region)) return false;
      if (certificaciones.length && !certificaciones.some((c) => p.certificaciones.includes(c))) return false;
      if (p.rating < ratingRange[0] || p.rating > ratingRange[1]) return false;
      if (conLicitaciones && p.ultimaTransaccionDaysAgo > 60) return false; // naive
      return true;
    });
  }, [query, estados, selectedRubros, selectedRegiones, certificaciones, ratingRange, conLicitaciones]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pageItems = filtered.slice((page - 1) * itemsPerPage, (page - 1) * itemsPerPage + itemsPerPage);

  const toggleEstado = (s: EstadoProv) => setEstados((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const handleAction = (action: string, prov: Proveedor) => {
    switch (action) {
      case "Ver":
        setLocation(`/proveedores/${prov.id}`);
        break;
      default:
        toast(`${action} ${prov.nombre}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Directorio de Proveedores</h1>
              <p className="text-sm text-muted-foreground mt-1">Gestiona tu base de proveedores</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="w-[220px] h-[100px] bg-white border border-gray-200 rounded p-4">
                  <div className="text-sm text-gray-600">Total Activos</div>
                  <div className="text-2xl font-bold text-green-600 mt-2">{stats.activos}</div>
                </div>
                <div className="w-[220px] h-[100px] bg-white border border-gray-200 rounded p-4">
                  <div className="text-sm text-gray-600">Nuevos Este Mes</div>
                  <div className="text-2xl font-bold text-blue-600 mt-2">{stats.nuevos}</div>
                </div>
                <div className="w-[220px] h-[100px] bg-white border border-gray-200 rounded p-4">
                  <div className="text-sm text-gray-600">Certificados</div>
                  <div className="text-2xl font-bold text-orange-600 mt-2">{stats.certificados}</div>
                </div>
                <div className="w-[220px] h-[100px] bg-white border border-gray-200 rounded p-4">
                  <div className="text-sm text-gray-600">Evaluación Promedio</div>
                  <div className="text-2xl font-bold text-gray-700 mt-2">{stats.avgRating.toFixed(1)} <Star className="inline-block ml-2" /></div>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 ml-6" onClick={() => setLocation("/proveedores/nuevo") }>
                + Registrar Proveedor
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <Input placeholder="Buscar por nombre, RUT, rubro..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Estado</label>
              <div className="flex gap-2 flex-wrap">
                {(["Activo","Inactivo","En Revisión","Bloqueado"] as EstadoProv[]).map((s)=> (
                  <label key={s} className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={estados.includes(s)} onChange={()=>toggleEstado(s)} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Rubros</label>
              <div className="flex gap-2 flex-wrap">
                {rubrosList.map((r)=> (
                  <button key={r} className={`text-sm px-2 py-1 rounded ${selectedRubros.includes(r)?'bg-blue-600 text-white':'bg-white border border-gray-200'}`} onClick={()=> setSelectedRubros(prev=> prev.includes(r)? prev.filter(x=>x!==r) : [...prev,r])}>{r}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Región</label>
              <div className="flex gap-2 flex-wrap">
                {regiones.map((rg)=> (
                  <button key={rg} className={`text-sm px-2 py-1 rounded ${selectedRegiones.includes(rg)?'bg-blue-600 text-white':'bg-white border border-gray-200'}`} onClick={()=> setSelectedRegiones(prev=> prev.includes(rg)? prev.filter(x=>x!==rg) : [...prev,rg])}>{rg}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Certificaciones</label>
              <div className="flex gap-2">
                {(["ISO 9001","ISO 27001","Otra"]).map((c)=> (
                  <label key={c} className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={certificaciones.includes(c)} onChange={(e)=> setCertificaciones(prev=> e.target.checked ? [...prev,c] : prev.filter(x=>x!==c))} /> <span>{c}</span></label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Evaluación</label>
              <div className="flex items-center gap-3">
                <Slider className="w-full" min={1} max={5} defaultValue={[1,5]} onValueChange={(v:any)=> setRatingRange(v)} />
                <div className="text-sm text-gray-600">{ratingRange[0]} - {ratingRange[1]}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <Button className="bg-blue-600 hover:bg-blue-700">Aplicar</Button>
            <Button variant="outline" onClick={() => { setQuery(""); setEstados([]); setSelectedRubros([]); setSelectedRegiones([]); setCertificaciones([]); setRatingRange([1,5]); }}>Limpiar</Button>
            <Button variant="outline" onClick={()=> toast('Exportar CSV')}>Exportar</Button>
            <button className="ml-auto text-sm text-gray-600 hover:underline" onClick={()=> setShowAdvanced(!showAdvanced)}>{showAdvanced ? 'Ocultar filtros avanzados' : 'Mostrar filtros avanzados'}</button>
          </div>

          {/* Advanced */}
          {showAdvanced && (
            <div className="mt-4 bg-white p-3 border border-gray-100 rounded">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Experiencia (años)</label>
                  <Slider min={0} max={50} defaultValue={[0,30]} onValueChange={(v:any)=> setExperienceRange(v)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Empleados</label>
                  <Select value={employeesRange} onValueChange={(v)=> setEmployeesRange(v)}>
                    <SelectTrigger className="h-8 w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-10">0-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value=">200">200+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Facturación</label>
                  <Select value={turnoverRange} onValueChange={(v)=> setTurnoverRange(v)}>
                    <SelectTrigger className="h-8 w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<1M">&lt; 1M</SelectItem>
                      <SelectItem value="1-10M">1-10M</SelectItem>
                      <SelectItem value=">10M">&gt; 10M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 mt-3">
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={conLicitaciones} onChange={(e)=> setConLicitaciones(e.target.checked)} /> Con Licitaciones Activas</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={conOcPendientes} onChange={(e)=> setConOcPendientes(e.target.checked)} /> Con OC Pendientes</label>
              </div>
            </div>
          )}
        </div>

        {/* View toggle */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">Mostrando {(page - 1) * itemsPerPage + 1} a {Math.min(page * itemsPerPage, filtered.length)} de {filtered.length} proveedores</div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant={view === 'grid' ? 'default' : 'outline'} onClick={()=> setView('grid')}>Grid</Button>
            <Button size="sm" variant={view === 'list' ? 'default' : 'outline'} onClick={()=> setView('list')}>Lista</Button>
          </div>
        </div>

        {/* Grid */}
        {view === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageItems.map((p)=> (
              <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4 h-[280px] flex flex-col justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={p.avatar || getAvatarUrl(p.nombre)} alt={p.nombre} />
                    </Avatar>
                    <div>
                      <div className="text-lg font-semibold">{p.nombre}</div>
                      <div className="text-sm text-gray-500">{p.rut}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {p.rubros.map(r=> <Badge key={r}>{r}</Badge>)}
                  </div>

                  <div className="mt-3 text-sm text-gray-600">{p.region} · Última transacción hace {p.ultimaTransaccionDaysAgo} días</div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="text-sm font-semibold">{p.rating.toFixed(1)}</div>
                    <div className="flex items-center text-sm text-yellow-600">
                      {Array.from({ length: 5 }).map((_,i)=> (
                        <Star key={i} className={`h-4 w-4 ${i < Math.round(p.rating) ? 'text-yellow-500' : 'text-gray-200'}`} />
                      ))}
                      <div className="text-sm text-gray-500 ml-2">({p.reviews} evaluaciones)</div>
                    </div>
                  </div>

                  <div className="mt-2 flex gap-2 flex-wrap">
                    {p.certificaciones.map(c=> <Badge key={c} className="bg-orange-100 text-orange-700">{c}</Badge>)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={()=> handleAction('Ver', p)}>Ver Perfil</Button>
                    <Button size="sm" variant="outline" onClick={()=> handleAction('Contactar', p)}>Contactar</Button>
                  </div>
                  <Button size="sm" variant="ghost"><Heart className="h-4 w-4 text-red-500" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List */}
        {view === 'list' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Logo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">RUT</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Rubros</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Región</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Certificaciones</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map(p=> (
                    <tr key={p.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3"><Avatar className="h-10 w-10"><AvatarImage src={p.avatar || getAvatarUrl(p.nombre)} alt={p.nombre} /></Avatar></td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600 hover:underline cursor-pointer" onClick={()=> setLocation(`/proveedores/${p.id}`)}>{p.nombre}</td>
                      <td className="px-4 py-3 text-sm">{p.rut}</td>
                      <td className="px-4 py-3 text-sm">{p.rubros.map(r=> <Badge key={r} className="mr-1">{r}</Badge>)}</td>
                      <td className="px-4 py-3 text-sm">{p.region}</td>
                      <td className="px-4 py-3 text-sm">{p.rating.toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm">{p.certificaciones.map(c=> <Badge key={c}>{c}</Badge>)}</td>
                      <td className="px-4 py-3 text-sm">{p.estado}</td>
                      <td className="px-4 py-3 text-sm">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={()=> handleAction('Ver', p)}>Ver</DropdownMenuItem>
                            <DropdownMenuItem onClick={()=> handleAction('Editar', p)}><Edit2 className="h-4 w-4 mr-2 inline"/>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={()=> handleAction('Evaluar', p)}>Evaluar</DropdownMenuItem>
                            <DropdownMenuItem onClick={()=> handleAction('Bloquear', p)}>Bloquear</DropdownMenuItem>
                            <DropdownMenuItem onClick={()=> handleAction('Eliminar', p)}><Trash2 className="h-4 w-4 mr-2 inline"/>Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">Página {page} de {totalPages}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={()=> setPage((p)=> Math.max(1, p-1))} disabled={page===1}>Anterior</Button>
                <Button size="sm" onClick={()=> setPage((p)=> Math.min(totalPages, p+1))} disabled={page===totalPages}>Siguiente</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
