import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Share2,
  Heart,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Download,
  MessageSquare,
  Bell,
} from "lucide-react";

type Requisito = { id: string; label: string; estado: "cumple" | "pendiente" | "no"; accion?: string };

const mockLicitacion = {
  id: "LIC-2024-001",
  titulo: "Suministro de Equipos de Oficina",
  descripcion:
    "Suministro e instalación de mobiliario y equipos de oficina para sedes públicas. Se requiere cumplimiento de especificaciones técnicas detalladas en las bases. Incluye transporte y puesta en servicio.",
  organismo: { nombre: "Ministerio de Educación", logo: "🏫" },
  presupuestoBase: 5000000,
  presupuestoMax: 6000000,
  fechaCierre: "2024-11-15T18:00:00",
  documentos: [
    { id: "d1", nombre: "Bases_Tecnicas_Administrativas.pdf", tamaño: "3.2 MB", publicado: "2024-11-01" },
  ],
  especificaciones: [],
  cronograma: [],
  preguntas: [],
  requisitos: [
    { id: "r1", label: "Certificación ISO 9001", estado: "cumple" },
    { id: "r2", label: "Experiencia >2 años", estado: "cumple" },
    { id: "r3", label: "Garantía Seriedad", estado: "pendiente", accion: "Subir garantía" },
    { id: "r4", label: "Documentos Legales", estado: "cumple" },
  ] as Requisito[],
  matchScore: 85,
  yaParticipe: false,
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
  const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);
  const isExpired = diff === 0;
  return { days, hours, minutes, seconds, isExpired, diff };
}

export default function LicitacionDetalle() {
  const lic = mockLicitacion;
  const countdown = useCountdown(lic.fechaCierre);
  const [favorito, setFavorito] = useState(false || lic.yaParticipe);
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [descExpanded, setDescExpanded] = useState(false);

  const requisitosPendientes = useMemo(() => lic.requisitos.filter(r => r.estado !== 'cumple'), [lic.requisitos]);

  const tiempoTexto = useMemo(() => {
    if (countdown.isExpired) return "Cerrada";
    return `${countdown.days} días ${countdown.hours}h ${countdown.minutes}m`;
  }, [countdown]);

  const canPresentar = requisitosPendientes.length === 0 && !countdown.isExpired;

  const tabs = [
    "Resumen",
    "Bases y Documentos",
    "Especificaciones Técnicas",
    "Cronograma",
    "Preguntas y Respuestas",
    "Historial",
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        

        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="lg:w-2/3">
              <div className="text-sm text-gray-600">{lic.id}</div>
              <h1 className="text-2xl lg:text-3xl font-bold mt-1">{lic.titulo}</h1>
              <div className="flex items-center gap-3 mt-3">
                <Badge className={cn("px-3 py-1 text-sm", countdown.diff > 0 && countdown.diff < 2 * 24 * 3600 * 1000 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800')}>{countdown.diff > 0 && countdown.diff < 2 * 24 * 3600 * 1000 ? 'Cierre Próximo' : 'Abierta'}</Badge>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-2xl">{lic.organismo.logo}</span>
                  <div>{lic.organismo.nombre}</div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/3 flex flex-col items-start lg:items-end gap-3">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-300 flex items-center justify-center text-white text-lg font-bold">{lic.matchScore}%</div>
                  <div className="text-xs text-gray-600 mt-1">Match</div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant={favorito ? 'default' : 'outline'} size="sm" onClick={() => setFavorito(v => !v)}>
                    {favorito ? '💚 En Favoritos' : '❤️ Agregar a Favoritos'}
                  </Button>
                  <Button variant="outline" size="sm"><Share2 className="mr-2" /> Compartir</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="mt-4">
            {!canPresentar && requisitosPendientes.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-300 p-3 rounded flex items-center gap-3">
                <AlertTriangle className="text-yellow-700" />
                <div>
                  Completa los requisitos pendientes para presentar tu oferta: {requisitosPendientes.map(r => r.label).join(', ')}
                </div>
              </div>
            )}

            {!lic.yaParticipe && countdown.diff > 0 && countdown.diff < 2 * 24 * 3600 * 1000 && (
              <div className="bg-orange-50 border-l-4 border-orange-300 p-3 rounded flex items-center gap-3 mt-3">
                <AlertTriangle /> <div>⚠️ Esta licitación cierra en {tiempoTexto}</div>
              </div>
            )}

            {lic.yaParticipe && (
              <div className="bg-blue-50 border-l-4 border-blue-300 p-3 rounded flex items-center gap-3 mt-3">
                <Info /> <div>Ya presentaste una oferta el 05/11/2024. <a className="underline">Ver mi oferta</a></div>
              </div>
            )}
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

        <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
          {/* Main */}
          <main>
            {activeTab === 0 && (
              <div className="space-y-4">
                {/* Descripción */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold">Descripción de la Licitación</h3>
                  <p className="mt-2 text-sm text-gray-700">{descExpanded ? lic.descripcion.repeat(6) : lic.descripcion}</p>
                  {lic.descripcion.length > 500 && (
                    <button className="text-blue-600 text-sm mt-2" onClick={() => setDescExpanded(v => !v)}>{descExpanded ? 'Leer menos' : 'Leer más'}</button>
                  )}
                </Card>

                {/* Información General */}
                <Card className="p-4">
                  <h4 className="font-semibold">Información General</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-sm text-gray-700">
                    <div><strong>Rubro:</strong> <Badge>{'Tecnología'}</Badge></div>
                    <div><strong>Tipo Licitación:</strong> Licitación Pública Abierta</div>
                    <div><strong>Modalidad:</strong> Suma Alzada</div>
                    <div><strong>Región:</strong> Región Metropolitana</div>
                    <div><strong>Lugar Entrega:</strong> Bodega Central, Santiago</div>
                    <div><strong>Unidad Responsable:</strong> Departamento de Compras</div>
                    <div><strong>Contacto:</strong> Juan Pérez — <a className="underline">juan.perez@ministerio.cl</a> — +56 9 1234 5678</div>
                  </div>
                </Card>

                {/* Presupuesto y Condiciones */}
                <Card className="p-4">
                  <h4 className="font-semibold">Presupuesto y Condiciones</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-600">Presupuesto Base</div>
                      <div className="text-2xl font-bold mt-1">{formatMoney(lic.presupuestoBase)}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-600">Presupuesto Máximo</div>
                      <div className="text-2xl font-bold mt-1">{formatMoney(lic.presupuestoMax)}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-600">Modalidad Pago</div>
                      <div className="mt-1">Plazo 30 días</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-600">Plazo Entrega</div>
                      <div className="mt-1">25 días desde adjudicación</div>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <div className="text-sm font-semibold">Garantías Requeridas</div>
                      <ul className="mt-2 text-sm text-gray-700 space-y-1">
                        <li>✓ Seriedad Oferta: 5% ({formatMoney(Math.round(lic.presupuestoBase * 0.05))})</li>
                        <li>✓ Fiel Cumplimiento: 10% ({formatMoney(Math.round(lic.presupuestoBase * 0.1))})</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Requisitos */}
                <Card className="p-4">
                  <h4 className="font-semibold">Requisitos para Participar</h4>
                  {requisitosPendientes.length > 0 && (
                    <div className="bg-yellow-50 p-3 rounded mt-3 text-sm">Completa los requisitos pendientes para presentar tu oferta</div>
                  )}
                  <div className="mt-3 space-y-2">
                    {lic.requisitos.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-3">
                          <div>
                            {r.estado === 'cumple' && <CheckCircle className="text-green-600" />}
                            {r.estado === 'pendiente' && <AlertTriangle className="text-yellow-600" />}
                            {r.estado === 'no' && <Info className="text-red-600" />}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{r.label}</div>
                            <div className="text-xs text-gray-500">{r.estado === 'cumple' ? 'Cumple' : r.estado === 'pendiente' ? 'Pendiente' : 'No cumple'}</div>
                          </div>
                        </div>
                        <div>
                          {r.accion ? <button className="text-sm text-blue-600">{r.accion}</button> : <span className="text-sm text-gray-500">—</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Criterios */}
                <Card className="p-4">
                  <h4 className="font-semibold">¿Cómo se evaluarán las ofertas?</h4>
                  <div className="mt-3 overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-600 border-b">
                          <th>Criterio</th>
                          <th>Ponderación</th>
                          <th>Puntaje Mín</th>
                          <th>Cómo te evalúan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Precio</td>
                          <td>40%</td>
                          <td>—</td>
                          <td>Automático: mejor precio gana 100 pts</td>
                        </tr>
                        <tr>
                          <td>Experiencia</td>
                          <td>30%</td>
                          <td>50 pts</td>
                          <td>Manual: años experiencia y proyectos</td>
                        </tr>
                        <tr>
                          <td>Propuesta Técnica</td>
                          <td>20%</td>
                          <td>40 pts</td>
                          <td>Manual: calidad y viabilidad</td>
                        </tr>
                        <tr>
                          <td>Referencias</td>
                          <td>10%</td>
                          <td>—</td>
                          <td>Manual: experiencia previa</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* Other tabs placeholders */}
            {activeTab === 1 && (
              <Card className="p-4">{/* Documents list */}
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Bases y Documentos</h4>
                  <Button variant="outline"><Download className="mr-2"/>Descargar Todo (ZIP)</Button>
                </div>
                <div className="mt-4 space-y-3">
                  {lic.documentos.map(d => (
                    <div key={d.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">📄</div>
                        <div>
                          <div className="font-medium">{d.nombre}</div>
                          <div className="text-xs text-gray-500">{d.tamaño} · {d.publicado}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button>Vista Previa</Button>
                        <Button variant="outline">Descargar</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === 2 && (
              <Card className="p-4">Especificaciones técnicas (tabla / export)</Card>
            )}

            {activeTab === 3 && (
              <Card className="p-4">Cronograma (timeline)</Card>
            )}

            {activeTab === 4 && (
              <Card className="p-4">
                <h4 className="font-semibold">Preguntas y Respuestas</h4>
                <div className="mt-3 bg-blue-50 p-3 rounded">
                  <h5 className="font-medium">¿Tienes dudas? Haz tu consulta</h5>
                  <Textarea placeholder="Escribe tu pregunta aquí..." className="mt-2" />
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500">Las respuestas se publicarán dentro de 48 horas</div>
                    <Button>Enviar Pregunta</Button>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 5 && (
              <Card className="p-4">Historial (timeline)</Card>
            )}
          </main>

          {/* Sidebar derecho */}
          <aside>
            <div className="space-y-4 sticky top-24">
              <Card className="p-4 text-center">
                <div className="text-xs text-gray-600">Cierra en:</div>
                <div className="text-2xl font-bold mt-1" style={{ color: countdown.diff < 2 * 24 * 3600 * 1000 ? '#b45309' : '#065f46' }}>{tiempoTexto}</div>
                <div className="text-sm text-gray-500 mt-1">{new Date(lic.fechaCierre).toLocaleString()}</div>
              </Card>

              <Card className="p-4">
                <div className="space-y-2">
                  <Button size="lg" className="w-full" disabled={!canPresentar} onClick={() => { if (canPresentar) setLocation(`/ofertas/nueva-oferta/${lic.id}`); }}>Presentar Oferta</Button>
                  <Button variant="outline" className="w-full">Hacer Pregunta</Button>
                  <Button variant="outline" className="w-full">Descargar Bases Completas</Button>
                  <Button variant="ghost" className="w-full"><Bell className="mr-2"/>Agregar Recordatorio</Button>
                </div>
              </Card>

              <Card className="p-4">
                <h5 className="font-semibold">Estadísticas</h5>
                <div className="mt-3 text-sm text-gray-700 space-y-1">
                  <div>Proveedores interesados: <strong>45</strong></div>
                  <div>Ofertas presentadas: <strong>12</strong></div>
                  <div>Preguntas realizadas: <strong>8</strong></div>
                  <div>Descargas bases: <strong>23</strong></div>
                </div>
              </Card>

              <Card className="p-4">
                <h5 className="font-semibold">Análisis de Competencia</h5>
                <div className="mt-3 text-sm">Rango ofertas esperadas: <strong>{formatMoney(4500000)} - {formatMoney(5500000)}</strong></div>
                <div className="mt-2">
                  <div className="text-sm">Tu oferta estimada:</div>
                  <Input defaultValue={formatMoney(4800000)} className="mt-2" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <span>JG</span>
                  </Avatar>
                  <div>
                    <div className="font-medium">Juan García</div>
                    <div className="text-sm text-gray-600">Responsable Compras</div>
                    <div className="text-sm text-gray-600 mt-1">juan.garcia@ministerio.cl · +56 9 9876 5432</div>
                    <div className="text-xs text-gray-500">Lun-Vie 08:00-17:00</div>
                    <div className="mt-2"><Button size="sm">Enviar Mensaje</Button></div>
                  </div>
                </div>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
