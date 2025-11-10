import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowLeft, Download, Share2, MoreHorizontal } from "lucide-react";

// Buyer-facing detail view for a licitación (frontend-only, UI only)
const mockLicitacion = {
  id: "LIC-2024-001",
  titulo: "Suministro de Equipos de Oficina",
  estado: "Abierta",
  descripcion:
    "Suministro e instalación de mobiliario y equipos de oficina para sedes públicas. Se requiere cumplimiento de especificaciones técnicas detalladas en las bases. Incluye transporte y puesta en servicio.",
  organismo: "Ministerio de Educación",
  rubro: "Tecnología",
  tipo: "Licitación Pública Abierta",
  unidad: "Departamento de Compras",
  responsable: "Juan García",
  presupuestoBase: 5000000,
  presupuestoMax: 6000000,
  fechaCreacion: "2024-10-01",
  fechaCierre: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
  ofertasRecibidas: 12,
  vistas: 45,
  descargas: 23,
};

function formatMoney(n: number) {
  return "$ " + n.toLocaleString("es-CL");
}

function useCountdown(targetIso: string) {
  const target = new Date(targetIso).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / (24 * 3600 * 1000));
  const hours = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
  return { days, hours, diff };
}

export default function LicitacionDetalleComprador() {
  const [match, params] = useRoute("/mis-licitaciones/:id");
  const id = (params as any)?.id ?? mockLicitacion.id;
  // In a real app, fetch by id. For now use mock
  const lic = mockLicitacion;
  const countdown = useCountdown(lic.fechaCierre);

  const tabs = ["Resumen", "Especificaciones", "Documentos", "Cronograma", "Ofertas", "Historial"];
  const [activeTab, setActiveTab] = useState(0);

  const porcentajeProgreso = Math.round(((1) / tabs.length) * 100);

  return (
    <DashboardLayout>
      <div className="p-6">
      

        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="text-sm text-gray-500">{lic.id}</div>
              <h1 className="text-3xl font-bold mt-1">{lic.titulo}</h1>
              <div className="flex items-center gap-3 mt-3">
                <Badge className={cn("px-4 py-2 text-base font-medium", lic.estado === 'Abierta' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700')}>{lic.estado}</Badge>
                <div className="text-sm text-gray-600">Creada: {lic.fechaCreacion}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline"><Share2 className="mr-2"/>Compartir</Button>
              <Button variant="outline"><Download className="mr-2"/>Descargar Bases</Button>
              <Button><MoreHorizontal/></Button>
            </div>
          </div>

          {/* Progress bar / timeline summary */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-2">
                <div>Publicación</div>
                <div>Ofertas</div>
                <div>Cierre</div>
                <div>Evaluación</div>
                <div>Adjudicación</div>
              </div>
              <div className="text-orange-600">Faltan {countdown.days} días para cierre</div>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded">
              <div className="h-2 bg-blue-600 rounded" style={{ width: `${porcentajeProgreso}%` }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex overflow-auto gap-2">
            {tabs.map((t, i) => (
              <button key={t} onClick={() => setActiveTab(i)} className={cn("px-3 py-2 rounded-md text-sm", activeTab === i ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700')}>{t}</button>
            ))}
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
          <main>
            {activeTab === 0 && (
              <div className="space-y-4">
                {/* Info General */}
                <Card className="p-4">
                  <h4 className="font-semibold">Información General</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-sm text-gray-700">
                    <div><strong>Rubro:</strong> {lic.rubro}</div>
                    <div><strong>Tipo:</strong> {lic.tipo}</div>
                    <div><strong>Organismo:</strong> {lic.organismo}</div>
                    <div><strong>Unidad:</strong> {lic.unidad}</div>
                    <div><strong>Responsable:</strong> {lic.responsable}</div>
                  </div>
                </Card>

                {/* Descripción */}
                <Card className="p-4">
                  <h4 className="font-semibold">Descripción</h4>
                  <p className="text-sm text-gray-700 mt-2">{lic.descripcion}</p>
                </Card>

                {/* Presupuesto */}
                <Card className="p-4">
                  <h4 className="font-semibold">Presupuesto</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                    <div>
                      <div className="text-xs text-gray-500">Base</div>
                      <div className="font-medium">{formatMoney(lic.presupuestoBase)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Máximo</div>
                      <div className="font-medium">{formatMoney(lic.presupuestoMax)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Condiciones</div>
                      <div className="font-medium">Plazo 30 días · Garantías requeridas</div>
                    </div>
                  </div>
                </Card>

                {/* Criterios */}
                <Card className="p-4">
                  <h4 className="font-semibold">Criterios de Evaluación</h4>
                  <div className="mt-3 overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-600 border-b">
                          <th>Criterio</th>
                          <th>Ponderación</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td>Precio</td><td>40%</td></tr>
                        <tr><td>Experiencia</td><td>30%</td></tr>
                        <tr><td>Técnica</td><td>20%</td></tr>
                        <tr><td>Referencias</td><td>10%</td></tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* Other tabs basic placeholders without new components */}
            {activeTab === 1 && <Card className="p-4">Especificaciones — tabla editable (UI-only)</Card>}
            {activeTab === 2 && <Card className="p-4">Documentos — grid de documentos</Card>}
            {activeTab === 3 && <Card className="p-4">Cronograma — timeline visual</Card>}
            {activeTab === 4 && <Card className="p-4">Ofertas Recibidas — tabla con filtros</Card>}
            {activeTab === 5 && <Card className="p-4">Historial — eventos y filtros</Card>}
          </main>

          <aside>
            <div className="space-y-4 sticky top-24">
              <Card className="p-4 text-center">
                <div className="text-xs text-gray-600">Cierra en:</div>
                <div className="text-2xl font-bold mt-1 text-orange-600">{countdown.days} días {countdown.hours}h</div>
                <div className="text-sm text-gray-500 mt-1">{new Date(lic.fechaCierre).toLocaleString()}</div>
                <div className="mt-3 text-sm"><a className="text-blue-600 underline">{lic.ofertasRecibidas} ofertas recibidas</a></div>
              </Card>

              <Card className="p-4">
                <h5 className="font-semibold">Acciones</h5>
                <div className="mt-3 flex flex-col gap-2">
                  <Button>Ver Ofertas</Button>
                  <Button variant="outline">Descargar Bases</Button>
                  <Button variant="ghost">Compartir</Button>
                  <Button variant="outline">Agregar Recordatorio</Button>
                </div>
              </Card>

              <Card className="p-4">
                <h5 className="font-semibold">Estadísticas</h5>
                <div className="mt-3 text-sm text-gray-700 space-y-1">
                  <div>Proveedores vieron: <strong>{lic.vistas}</strong></div>
                  <div>Descargaron: <strong>{lic.descargas}</strong></div>
                  <div>Ofertas: <strong>{lic.ofertasRecibidas}</strong></div>
                </div>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
