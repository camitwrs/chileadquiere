import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Orden = {
  id: string;
  comprador: { id: string; nombre: string; logo?: string };
  licitacion?: string | null;
  monto: number;
  estado: 'pendiente'|'confirmada'|'en_proceso'|'en_transito'|'entregada'|'completada';
  fechaEmision: string;
  fechaEntregaEstimada?: string;
};

function sampleOrdenes(): Orden[]{
  return Array.from({ length: 34 }).map((_, i)=>{
    const estados: Orden['estado'][] = ['pendiente','confirmada','en_proceso','en_transito','entregada','completada'];
    const estado = estados[i % estados.length];
    const monto = 2000000 + (i%10)*500000;
    return {
      id: `OC-2024-${String(i+1).padStart(3,'0')}`,
      comprador: { id: `BUY-${i%6}`, nombre: ['Ministerio de Educación','Municipalidad Santiago','Empresa Salud','Universidad de Valparaiso','Gobierno Regional','Servicio Público'][i%6] },
      licitacion: i%3===0? `LIC-2024-${String((i%6)+1).padStart(3,'0')}` : null,
      monto,
      estado,
      fechaEmision: new Date(Date.now() - i*86400000).toISOString(),
      fechaEntregaEstimada: new Date(Date.now() + (5 + i%10)*86400000).toISOString(),
    };
  });
}

function fmtCurrency(v:number){
  return new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(v);
}

function EstadoBadge({ estado }: { estado: Orden['estado'] }){
  const map: Record<Orden['estado'], { label:string; cls:string }> = {
    pendiente: { label: 'Pendiente Confirmación', cls: 'bg-yellow-100 text-yellow-800' },
    confirmada: { label: 'Confirmada', cls: 'bg-green-100 text-green-800' },
    en_proceso: { label: 'En Proceso', cls: 'bg-blue-100 text-blue-800' },
    en_transito: { label: 'En Tránsito', cls: 'bg-blue-700 text-white' },
    entregada: { label: 'Entregada', cls: 'bg-green-100 text-green-800' },
    completada: { label: 'Completada', cls: 'bg-green-800 text-white' },
  };
  const m = map[estado];
  return <span className={`${m.cls} px-2 py-1 rounded text-sm`}>{m.label}</span>;
}

export default function OrdenesRecibidas(){
  const [query, setQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [compradorFilter, setCompradorFilter] = useState('');
  const [minMonto, setMinMonto] = useState<number|undefined>(undefined);
  const [maxMonto, setMaxMonto] = useState<number|undefined>(undefined);
  const [page, setPage] = useState(1);

  const data = useMemo(()=> sampleOrdenes(), []);

  // alerts
  const vencen = data.filter(o=> {
    const diff = new Date(o.fechaEntregaEstimada!).getTime() - Date.now();
    return diff>0 && diff < 24*3600*1000;
  }).length;
  const requierenConfirm = data.filter(o=> o.estado==='pendiente').length;

  const filtered = data.filter(o=>{
    if(query){ const q = query.toLowerCase(); if(!(o.id.toLowerCase().includes(q) || o.comprador.nombre.toLowerCase().includes(q) || (o.licitacion||'').toLowerCase().includes(q))) return false; }
    if(estadoFilter!=='all' && o.estado!==estadoFilter) return false;
    if(compradorFilter && !o.comprador.nombre.toLowerCase().includes(compradorFilter.toLowerCase())) return false;
    if(minMonto!==undefined && o.monto < minMonto) return false;
    if(maxMonto!==undefined && o.monto > maxMonto) return false;
    return true;
  });

  const pageSize = 15;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
       
            <h1 className="text-2xl font-bold">Órdenes Recibidas</h1>
          </div>
          <div className="flex items-center gap-3">
            <Input placeholder="Buscar OC..." value={query} onChange={(e)=>{ setQuery(e.target.value); setPage(1); }} className="w-72" />
            <Select onValueChange={(v)=> setEstadoFilter(v)}>
              <SelectTrigger className="h-9 w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendiente">Pendiente Confirmación</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="en_transito">En Tránsito</SelectItem>
                <SelectItem value="entregada">Entregada</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Comprador" className="w-56" value={compradorFilter} onChange={(e)=> setCompradorFilter(e.target.value)} />
            <Input type="date" className="w-40" />
            <Input type="date" className="w-40" />
            <Input placeholder="Min Monto" className="w-40" onChange={(e)=> setMinMonto(e.target.value? Number(e.target.value): undefined)} />
            <Input placeholder="Max Monto" className="w-40" onChange={(e)=> setMaxMonto(e.target.value? Number(e.target.value): undefined)} />
            <Button className="bg-blue-600">Filtrar</Button>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-2">
          {vencen>0 && <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded cursor-pointer" onClick={()=>{ setEstadoFilter('all'); setQuery(''); /* apply automatic filter if needed */ }}> {vencen} OC vencen en &lt;24h — Ver</div>}
          {requierenConfirm>0 && <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded cursor-pointer" onClick={()=>{ setEstadoFilter('pendiente'); }}> {requierenConfirm} Ordenes de Compra requieren confirmación — Filtrar</div>}
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border rounded p-4 h-24">
            <div className="text-sm text-gray-600">Pendientes Confirmación</div>
            <div className="text-2xl font-bold text-orange-500">{requierenConfirm}</div>
          </div>
          <div className="bg-white border rounded p-4 h-24">
            <div className="text-sm text-gray-600">En Proceso</div>
            <div className="text-2xl font-bold text-blue-600">{data.filter(d=>d.estado==='en_proceso').length}</div>
          </div>
          <div className="bg-white border rounded p-4 h-24">
            <div className="text-sm text-gray-600">Entregadas</div>
            <div className="text-2xl font-bold text-green-600">{data.filter(d=>d.estado==='entregada').length}</div>
          </div>
          <div className="bg-white border rounded p-4 h-24">
            <div className="text-sm text-gray-600">Ingresos Totales</div>
            <div className="text-2xl font-bold text-gray-800">{fmtCurrency(data.reduce((s,d)=>s+d.monto,0))}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">ID OC</th>
                <th className="px-3 py-2 text-left">Comprador</th>
                <th className="px-3 py-2 text-left">Licitación</th>
                <th className="px-3 py-2 text-right">Monto</th>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="px-3 py-2 text-left">Fecha Emisión</th>
                <th className="px-3 py-2 text-left">Entrega Estimada</th>
                <th className="px-3 py-2 text-center">Días Restantes</th>
                <th className="px-3 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(o=> (
                <tr key={o.id} className="border-b">
                  <td className="px-3 py-2 text-blue-600"><a href="#">{o.id}</a></td>
                  <td className="px-3 py-2 flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarImage src={o.comprador.logo || getAvatarUrl(o.comprador.nombre)} alt={o.comprador.nombre} /></Avatar>{o.comprador.nombre}</td>
                  <td className="px-3 py-2">{o.licitacion? <a href="#" className="text-blue-600">{o.licitacion}</a> : '—'}</td>
                  <td className="px-3 py-2 text-right">{fmtCurrency(o.monto)}</td>
                  <td className="px-3 py-2"><EstadoBadge estado={o.estado} /></td>
                  <td className="px-3 py-2">{new Date(o.fechaEmision).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{o.fechaEntregaEstimada? new Date(o.fechaEntregaEstimada).toLocaleDateString(): '—'}</td>
                  <td className="px-3 py-2 text-center">{o.fechaEntregaEstimada? Math.max(0, Math.ceil((new Date(o.fechaEntregaEstimada).getTime() - Date.now())/(24*3600*1000))) : '—'}</td>
                  <td className="px-3 py-2 text-center"><button className="px-2 py-1 rounded hover:bg-gray-100" onClick={()=> alert('Acciones (simulado)')}>...</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">Mostrando {pageData.length} de {filtered.length}</div>
            <div className="flex items-center gap-2">
              <Button onClick={()=> setPage(p=> Math.max(1,p-1))} disabled={page===1}>Anterior</Button>
              <div>Pagina {page} / {totalPages}</div>
              <Button onClick={()=> setPage(p=> Math.min(totalPages,p+1))} disabled={page===totalPages}>Siguiente</Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
