import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Empresa = {
  nombre: string;
  rut: string;
  giro: string;
  email: string;
  telefono: string;
  sitio: string;
  direccion: { calle: string; numero: string; comuna: string; ciudad: string; region: string; codigoPostal: string; pais: string };
  verificada: boolean;
  rating: number;
  ratingCount: number;
};

const defaultEmpresa: Empresa = {
  nombre: 'TechSupply SpA',
  rut: '76.123.456-7',
  giro: 'Suministro de equipos tecnológicos',
  email: 'contacto@techsupply.cl',
  telefono: '+56 2 2345 6789',
  sitio: 'https://techsupply.cl',
  direccion: { calle: 'Av. Apoquindo', numero: '3000', comuna: 'Las Condes', ciudad: 'Santiago', region: 'Metropolitana', codigoPostal: '7550000', pais: 'Chile' },
  verificada: true,
  rating: 4.2,
  ratingCount: 12,
};

export default function MiEmpresa(){
  const [empresa, setEmpresa] = useState<Empresa>(defaultEmpresa);
  const [tab, setTab] = useState(1);
  const [desc, setDesc] = useState('');

  const rubros = ['Tecnología','Servicios','Productos','Consultoría','Logística'];
  const [selectedRubros, setSelectedRubros] = useState<string[]>([rubros[0]]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded overflow-hidden border"><Avatar className="h-24 w-24"><AvatarImage src={getAvatarUrl(empresa.nombre)} alt={empresa.nombre} /></Avatar></div>
          <div>
            <div className="text-2xl font-bold">{empresa.nombre}</div>
            <div className="text-sm text-gray-600">RUT: {empresa.rut} • <Badge variant={empresa.verificada? 'default':'secondary'}>{empresa.verificada? 'Verificada ✓':'En Revisión'}</Badge></div>
            <div className="mt-2">⭐ {empresa.rating} ({empresa.ratingCount} evaluaciones)</div>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost">Vista Previa Pública</Button>
            <Button className="bg-blue-600">Editar Perfil</Button>
          </div>
        </div>

        <div className="flex gap-3 border-b pb-3">
          {[1,2,3,4,5,6].map(i=> (
            <button key={i} onClick={()=> setTab(i)} className={`px-3 py-2 ${tab===i? 'border-b-2 border-blue-600':''}`}> {['Información General','Certificaciones','Documentos Legales','Referencias','Estadísticas','Configuración'][i-1]} </button>
          ))}
        </div>

        {tab===1 && (
          <div className="space-y-4">
            <div className="bg-white border rounded p-4">
              <h3 className="font-semibold">Datos Básicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <Input value={empresa.nombre} onChange={(e)=> setEmpresa(s=> ({...s, nombre: e.target.value}))} placeholder="Razón Social*" />
                <Input value={empresa.rut} onChange={(e)=> setEmpresa(s=> ({...s, rut: e.target.value}))} placeholder="RUT*" />
                <Input value={empresa.giro} onChange={(e)=> setEmpresa(s=> ({...s, giro: e.target.value}))} placeholder="Giro Comercial*" />
                <Input value={empresa.email} onChange={(e)=> setEmpresa(s=> ({...s, email: e.target.value}))} placeholder="Email Corporativo*" />
                <Input value={empresa.telefono} onChange={(e)=> setEmpresa(s=> ({...s, telefono: e.target.value}))} placeholder="Teléfono Principal*" />
                <Input value={empresa.sitio} onChange={(e)=> setEmpresa(s=> ({...s, sitio: e.target.value}))} placeholder="Sitio Web" />
                <Input value={empresa.direccion.calle} onChange={(e)=> setEmpresa(s=> ({...s, direccion: {...s.direccion, calle: e.target.value}}))} placeholder="Calle y Número*" />
                <Input value={empresa.direccion.comuna} onChange={(e)=> setEmpresa(s=> ({...s, direccion: {...s.direccion, comuna: e.target.value}}))} placeholder="Comuna*" />
                <Input value={empresa.direccion.ciudad} onChange={(e)=> setEmpresa(s=> ({...s, direccion: {...s.direccion, ciudad: e.target.value}}))} placeholder="Ciudad*" />
                <Input value={empresa.direccion.region} onChange={(e)=> setEmpresa(s=> ({...s, direccion: {...s.direccion, region: e.target.value}}))} placeholder="Región*" />
                <Input value={empresa.direccion.codigoPostal} onChange={(e)=> setEmpresa(s=> ({...s, direccion: {...s.direccion, codigoPostal: e.target.value}}))} placeholder="Código Postal" />
              </div>
            </div>

            <div className="bg-white border rounded p-4">
              <h3 className="font-semibold">Perfil Comercial</h3>
              <div className="mt-3">
                <div className="text-sm mb-2">Rubros Principales (máx 5)</div>
                <div className="flex gap-2 flex-wrap">
                  {rubros.map(r=> (
                    <button key={r} onClick={()=> setSelectedRubros(s=> s.includes(r)? s.filter(x=>x!==r): [...s,r].slice(0,5))} className={`px-3 py-1 rounded ${selectedRubros.includes(r)? 'bg-blue-600 text-white':'bg-gray-100'}`}>{r}</button>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input type="number" placeholder="Años Experiencia*" min={1} />
                  <Select>
                    <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5</SelectItem>
                      <SelectItem value="6-20">6-20</SelectItem>
                      <SelectItem value="21-50">21-50</SelectItem>
                      <SelectItem value="51-100">51-100</SelectItem>
                      <SelectItem value="101-500">101-500</SelectItem>
                      <SelectItem value=">500">&gt;500</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<$1M">&lt;$1M</SelectItem>
                      <SelectItem value="$1M-$5M">$1M-$5M</SelectItem>
                      <SelectItem value="$5M-$10M">$5M-$10M</SelectItem>
                      <SelectItem value="$10M-$50M">$10M-$50M</SelectItem>
                      <SelectItem value=">$50M">&gt;$50M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-3">
                  <div className="text-sm">Descripción (max 500)</div>
                  <textarea value={desc} onChange={(e)=> setDesc(e.target.value)} className="w-full border rounded p-2 min-h-[120px]" maxLength={500} />
                  <div className="text-xs text-gray-500 mt-1">{desc.length}/500</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="ghost">Cancelar</Button>
              <Button className="bg-blue-600">Guardar Cambios</Button>
            </div>
          </div>
        )}

        {tab===2 && (
          <div className="space-y-4">
            <div className="flex justify-between"><div className="text-lg font-semibold">Certificaciones</div><Button>+ Agregar Certificación</Button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* sample certification card */}
              <div className="border rounded p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded">📜</div><div>
                    <div className="font-semibold">ISO 9001:2015</div>
                    <div className="text-sm text-gray-600">Calidad</div>
                  </div></div>
                  <div><Badge>Vigente ✓</Badge></div>
                </div>
                <div className="mt-3 text-sm">Emisión: 01/05/2022</div>
                <div className="text-sm">Vencimiento: 01/05/2025</div>
                <div className="mt-3 flex gap-2"><Button variant="outline">Ver Certificado</Button><Button variant="ghost">Descargar</Button></div>
              </div>
            </div>
          </div>
        )}

        {tab===3 && (
          <div>
            <div className="text-lg font-semibold mb-3">Documentos Legales</div>
            <div className="bg-white border rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><th className="px-3 py-2">Documento</th><th className="px-3 py-2">Estado</th><th className="px-3 py-2">Fecha Subida</th><th className="px-3 py-2">Vencimiento</th><th className="px-3 py-2">Acciones</th></tr></thead>
                <tbody>
                  <tr className="border-b"><td className="px-3 py-2">RUT Empresa</td><td className="px-3 py-2">✓ Vigente</td><td className="px-3 py-2">01/01/2024</td><td className="px-3 py-2">-</td><td className="px-3 py-2"><Button>Ver</Button><Button variant="ghost">Descargar</Button></td></tr>
                  <tr className="border-b"><td className="px-3 py-2">Certificado Vigencia SII</td><td className="px-3 py-2">⚠️ Vence en 15 días</td><td className="px-3 py-2">01/11/2024</td><td className="px-3 py-2">25/11/2024</td><td className="px-3 py-2"><Button>Ver</Button><Button variant="ghost">Actualizar</Button></td></tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 bg-yellow-50 border rounded p-3">Completa los documentos requeridos para participar en todas las licitaciones <Button className="ml-3">Completar Ahora</Button></div>
          </div>
        )}

        {tab===4 && (
          <div>
            <div className="flex justify-between"><div className="text-lg font-semibold">Referencias Comerciales</div><Button>+ Agregar Referencia</Button></div>
            <div className="space-y-4 mt-3">
              <div className="border rounded p-4">
                <div className="text-sm font-medium">Referencia #1</div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input placeholder="Empresa Cliente*" defaultValue="Ministerio de Educación" />
                  <Input placeholder="Contacto (Nombre)" defaultValue="Juan García Pérez" />
                  <Input placeholder="Cargo" defaultValue="Jefe de Compras" />
                  <Input placeholder="Email" defaultValue="jgarcia@mineduc.cl" />
                  <Input placeholder="Teléfono" defaultValue="+56 2 2345 6789" />
                  <Input placeholder="Proyecto Ejecutado" defaultValue="Suministro e instalación de 200 computadores" />
                </div>
                <div className="mt-3 flex gap-2"><Button>✏️ Editar</Button><Button variant="destructive">🗑️ Eliminar</Button></div>
              </div>
            </div>
          </div>
        )}

        {tab===5 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border rounded p-4">Total Participaciones<div className="text-2xl font-bold">45</div></div>
              <div className="bg-white border rounded p-4">Tasa Adjudicación<div className="text-2xl font-bold">33%</div></div>
              <div className="bg-white border rounded p-4">Ingresos Totales<div className="text-2xl font-bold">{fmtCurrency(45800000)}</div></div>
              <div className="bg-white border rounded p-4">Rating Promedio<div className="text-2xl font-bold">4.2 ⭐</div></div>
            </div>
            <div className="mt-4">Gráficos (placeholder)</div>
            <div className="mt-4 bg-white border rounded"><div className="p-4">Tabla: Últimas 10 Transacciones (placeholder)</div></div>
          </div>
        )}

        {tab===6 && (
          <div>
            <div className="bg-white border rounded p-4">
              <h3 className="font-semibold">Notificaciones</h3>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <label><input type="checkbox" defaultChecked /> Nuevas licitaciones coincidentes</label>
                <label><input type="checkbox" defaultChecked /> Actualizaciones de mis ofertas</label>
                <label><input type="checkbox" defaultChecked /> Órdenes de compra recibidas</label>
                <label><input type="checkbox" /> Newsletter semanal</label>
                <label><input type="checkbox" defaultChecked /> Alertas de documentos por vencer</label>
              </div>
            </div>
            <div className="mt-4 bg-white border rounded p-4">
              <h3 className="font-semibold">Privacidad</h3>
              <div className="mt-3">
                <label><input type="radio" name="visibilidad" defaultChecked /> Público</label>
                <label className="ml-4"><input type="radio" name="visibilidad" /> Solo compradores</label>
                <label className="ml-4"><input type="radio" name="visibilidad" /> Privado</label>
              </div>
            </div>
            <div className="mt-4 flex gap-2 justify-end"><Button variant="ghost">Cancelar</Button><Button className="bg-blue-600">Guardar Configuración</Button></div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function fmtCurrency(v:number){
  return new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(v);
}
