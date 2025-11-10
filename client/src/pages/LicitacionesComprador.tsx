import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Plus,
  Grid3x3,
  List,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
} from "lucide-react";
import {
  licitacionesMock,
  estadisticasLicitaciones,
  contadoresPorRubro,
  type Licitacion,
  type EstadoLicitacion,
  type RubroLicitacion,
} from "@/lib/licitacionesData";
import { toast } from "sonner";

export default function LicitacionesComprador() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedLicitaciones, setSelectedLicitaciones] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
    const [, setLocation] = useLocation();

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<EstadoLicitacion | "Todos">("Todos");
  const [filtroRubro, setFiltroRubro] = useState<RubroLicitacion[]>([]);
  const [filtroMontoMin, setFiltroMontoMin] = useState("");
  const [filtroMontoMax, setFiltroMontoMax] = useState("");

  // Filtrar y buscar licitaciones
  const licitacionesFiltradas = useMemo(() => {
    return licitacionesMock.filter((lic) => {
      // Búsqueda
      const matchSearch =
        searchQuery === "" ||
        lic.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lic.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lic.rubro.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro estado
      const matchEstado = filtroEstado === "Todos" || lic.estado === filtroEstado;

      // Filtro rubro
      const matchRubro = filtroRubro.length === 0 || filtroRubro.includes(lic.rubro);

      // Filtro monto
      const montoMin = filtroMontoMin ? parseFloat(filtroMontoMin) : 0;
      const montoMax = filtroMontoMax ? parseFloat(filtroMontoMax) : Infinity;
      const matchMonto = lic.monto >= montoMin && lic.monto <= montoMax;

      return matchSearch && matchEstado && matchRubro && matchMonto;
    });
  }, [searchQuery, filtroEstado, filtroRubro, filtroMontoMin, filtroMontoMax]);

  // Paginación
  const totalPages = Math.ceil(licitacionesFiltradas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const licitacionesPaginadas = licitacionesFiltradas.slice(startIndex, endIndex);

  // Funciones helper
  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(monto);
  };

  const formatFecha = (fecha: Date) => {
    return fecha.toLocaleDateString("es-CL");
  };

  const getEstadoBadgeColor = (estado: EstadoLicitacion) => {
    switch (estado) {
      case "Abierta":
        return "bg-green-100 text-green-700 border-green-300";
      case "Cierre Próximo":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "Cerrada":
        return "bg-red-100 text-red-700 border-red-300";
      case "Evaluación":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "Adjudicada":
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case "Anulada":
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getRubroBadgeColor = (rubro: RubroLicitacion) => {
    const colors: Record<RubroLicitacion, string> = {
      Tecnología: "bg-blue-100 text-blue-700",
      Servicios: "bg-purple-100 text-purple-700",
      Productos: "bg-green-100 text-green-700",
      Consultoría: "bg-yellow-100 text-yellow-700",
      Logística: "bg-orange-100 text-orange-700",
      Construcción: "bg-red-100 text-red-700",
      Mantenimiento: "bg-teal-100 text-teal-700",
      Otros: "bg-gray-100 text-gray-700",
    };
    return colors[rubro];
  };

  const getDiasRestantesColor = (dias: number) => {
    if (dias < 0) return "text-gray-500";
    if (dias === 0) return "text-red-700 font-bold";
    if (dias <= 7) return "text-red-600";
    if (dias <= 30) return "text-orange-600";
    return "text-gray-700";
  };

  const getDiasRestantesTexto = (dias: number) => {
    if (dias < 0) return "—";
    if (dias === 0) return "Cierra hoy";
    return `${dias} días`;
  };

  const handleSelectAll = () => {
    if (selectedLicitaciones.length === licitacionesPaginadas.length) {
      setSelectedLicitaciones([]);
    } else {
      setSelectedLicitaciones(licitacionesPaginadas.map((l) => l.id));
    }
  };

  const handleSelectLicitacion = (id: string) => {
    setSelectedLicitaciones((prev) =>
      prev.includes(id) ? prev.filter((licId) => licId !== id) : [...prev, id]
    );
  };

  const limpiarFiltros = () => {
    setFiltroEstado("Todos");
    setFiltroRubro([]);
    setFiltroMontoMin("");
    setFiltroMontoMax("");
    setSearchQuery("");
  };

  const handleAccion = (accion: string, licitacion?: Licitacion) => {
    if (accion === "Ver" && licitacion) {
      setLocation(`/mis-licitaciones/${licitacion.id}`);
      return;
    }
    toast.info(`Acción "${accion}" ${licitacion ? `para ${licitacion.id}` : ""}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Encabezado con estadísticas */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Mis Licitaciones</h1>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() =>  setLocation("/mis-licitaciones/nueva-licitacion")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Licitación
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="text-3xl font-bold text-blue-600">{estadisticasLicitaciones.activas}</div>
              <div className="text-sm text-gray-600 mt-1">Licitaciones abiertas</div>
              <div className="text-xs text-gray-500 mt-0.5">Activas</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="text-3xl font-bold text-gray-600">{estadisticasLicitaciones.cerradas}</div>
              <div className="text-sm text-gray-600 mt-1">Licitaciones cerradas</div>
              <div className="text-xs text-gray-500 mt-0.5">Cerradas</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="text-3xl font-bold text-orange-600">{estadisticasLicitaciones.porEvaluar}</div>
              <div className="text-sm text-gray-600 mt-1">Esperando evaluación</div>
              <div className="text-xs text-gray-500 mt-0.5">Por Evaluar</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="text-3xl font-bold text-green-600">{estadisticasLicitaciones.adjudicadas}</div>
              <div className="text-sm text-gray-600 mt-1">Ya asignadas</div>
              <div className="text-xs text-gray-500 mt-0.5">Adjudicadas</div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          {/* Búsqueda */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por ID, título, rubro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Botones de filtros */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-600"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avanzados
            </Button>
            <Button variant="outline" size="sm" className="text-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Filtro
            </Button>
          </div>

          {/* Filtros expandibles */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Filtro Estado */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Estado</label>
                <Select value={filtroEstado} onValueChange={(value) => setFiltroEstado(value as EstadoLicitacion | "Todos")}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Abierta">Abierta</SelectItem>
                    <SelectItem value="Cierre Próximo">Cierre Próximo</SelectItem>
                    <SelectItem value="Cerrada">Cerrada</SelectItem>
                    <SelectItem value="Evaluación">Evaluación</SelectItem>
                    <SelectItem value="Adjudicada">Adjudicada</SelectItem>
                    <SelectItem value="Anulada">Anulada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro Rubro */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                  Rubro ({filtroRubro.length} seleccionados)
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full h-9 justify-start text-sm">
                      Seleccionar rubros
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {(Object.keys(contadoresPorRubro) as RubroLicitacion[]).map((rubro) => (
                      <DropdownMenuItem
                        key={rubro}
                        onClick={(e) => e.preventDefault()}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          checked={filtroRubro.includes(rubro)}
                          onCheckedChange={(checked) => {
                            setFiltroRubro((prev) =>
                              checked ? [...prev, rubro] : prev.filter((r) => r !== rubro)
                            );
                          }}
                        />
                        <span className="flex-1">
                          {rubro} ({contadoresPorRubro[rubro]})
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Filtro Monto */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Monto Desde</label>
                <Input
                  type="number"
                  placeholder="$ 0"
                  value={filtroMontoMin}
                  onChange={(e) => setFiltroMontoMin(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Monto Hasta</label>
                <Input
                  type="number"
                  placeholder="$ 100.000.000"
                  value={filtroMontoMax}
                  onChange={(e) => setFiltroMontoMax(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          )}

          {/* Botones de acción de filtros */}
          {showFilters && (
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Aplicar Filtros
              </Button>
              <Button size="sm" variant="outline" onClick={limpiarFiltros}>
                Limpiar Filtros
              </Button>
              <Button size="sm" variant="outline">
                Guardar Búsqueda
              </Button>
            </div>
          )}
        </div>

        {/* Toggle Vista y acciones */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Mostrando {startIndex + 1} a {Math.min(endIndex, licitacionesFiltradas.length)} de{" "}
            {licitacionesFiltradas.length} resultados
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Vista Tabla */}
        {viewMode === "table" && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {isLoading ? (
              // Loading state
              <div className="p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="h-12 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            ) : licitacionesPaginadas.length === 0 ? (
              // Empty state
              <div className="p-12 text-center">
                <FileText className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No hay licitaciones</h3>
                <p className="text-sm text-gray-600 mb-6">Crea tu primera licitación para empezar</p>
                <div className="flex gap-3 justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Licitación
                  </Button>
                  <Button variant="outline">Explorar Guía</Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <Checkbox
                          checked={selectedLicitaciones.length === licitacionesPaginadas.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Título</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Rubro</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Monto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Fecha Cierre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 hidden lg:table-cell">
                        Días Restantes
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licitacionesPaginadas.map((lic) => (
                      <tr key={lic.id} className="border-b last:border-b-0">
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedLicitaciones.includes(lic.id)}
                            onCheckedChange={() => handleSelectLicitacion(lic.id)}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{lic.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{lic.titulo}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`${getRubroBadgeColor(lic.rubro)} px-2 py-1 rounded-full text-xs`}>{lic.rubro}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-700">{formatMonto(lic.monto)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`${getEstadoBadgeColor(lic.estado)} px-2 py-1 rounded-full text-xs`}>{lic.estado}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatFecha(lic.fechaCierre)}</td>
                        <td className="px-4 py-3 text-sm hidden lg:table-cell">
                          <span className={getDiasRestantesColor(lic.diasRestantes)}>{getDiasRestantesTexto(lic.diasRestantes)}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {/* Show a direct 'Ver' action button instead of a dropdown so it's always visible */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 bg-transparent hover:underline"
                            onClick={() => setLocation(`/mis-licitaciones/${lic.id}`)}
                          >
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Vista Grid (opcional, minimal) */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {licitacionesPaginadas.map((lic) => (
              <div key={lic.id} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="font-medium text-gray-800">{lic.titulo}</div>
                <div className="text-sm text-gray-500">{lic.rubro} · {formatMonto(lic.monto)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación simple */}
        <div className="mt-6 flex items-center gap-2">
          <div className="text-sm text-gray-600">Página {currentPage} de {totalPages}</div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}