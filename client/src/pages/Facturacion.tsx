import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Factura = {
  id: string;
  fecha: string;
  comprador: { id: string; nombre: string };
  oc?: string | null;
  monto: number;
  estado: 'pagada'|'pendiente'|'vencida'|'anulada';
  vencimiento?: string;
};

type Pago = {
  fecha: string;
  facturaId: string;
  comprador: string;
  monto: number;
  metodo: string;
  comprobante?: string;
};

function sampleFacturas(): Factura[]{
  return Array.from({ length: 25 }).map((_,i)=>{
    const estados: Factura['estado'][] = ['pagada','pendiente','vencida','anulada'];
    const estado = estados[i%estados.length];
    return {
      id: `F-${202400+i}`,
      fecha: new Date(Date.now() - i*86400000).toISOString(),
      comprador: { id: `BUY-${i%6}`, nombre: ['Ministerio de Educación','Municipalidad','Empresa Salud','Universidad','Gobierno Regional','Proveedor'][i%6] },
      oc: i%3===0? `OC-2024-${String(i%15+1).padStart(3,'0')}`: null,
      monto: 1500000 + (i%7)*300000,
      estado,
      vencimiento: new Date(Date.now() + (15 - i%20)*86400000).toISOString(),
    };
  });
}

function samplePagos(): Pago[]{
  return Array.from({ length: 12 }).map((_,i)=>({
    fecha: new Date(Date.now() - i*86400000).toISOString(),
    facturaId: `F-${202400+i}`,
    comprador: ['Ministerio de Educación','Municipalidad','Empresa Salud'][i%3],
    monto: 1500000 + (i%5)*200000,
    metodo: ['Transferencia','Tarjeta','Cheque'][i%3],
    comprobante: i%2===0? `REC-${i}.pdf` : undefined,
  }));
}

function fmtCurrency(v:number){
  return new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(v);
}

export default function Facturacion(){
  const [tab, setTab] = useState<1|2|3>(1);
  const [query, setQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'all'|Factura['estado']>('all');
  const facturas = useMemo(()=> sampleFacturas(), []);
  const pagos = useMemo(()=> samplePagos(), []);

  const ingresosEsteMes = facturas.slice(0,6).reduce((s,f)=> s + (f.estado==='pagada'? f.monto:0), 0);
  const pagosPendientesMonto = facturas.filter(f=> f.estado==='pendiente').reduce((s,f)=> s+f.monto,0);
  const facturasEmitidasCount = facturas.length;
  const promedioDiasPago = 32;

  const filteredFacturas = facturas.filter(f=>{
    if(estadoFilter!=='all' && f.estado!==estadoFilter) return false;
    if(query && !(f.id.toLowerCase().includes(query.toLowerCase()) || f.comprador.nombre.toLowerCase().includes(query.toLowerCase()) || (f.oc||'').toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Dashboard &gt; Facturación e Ingresos</div>
            <h1 className="text-2xl font-bold">Facturación e Ingresos</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-blue-600">+ Nueva Factura</Button>
            <Button variant="ghost">Exportar Excel</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border rounded p-4">
            <div className="text-sm text-gray-600">Ingresos Este Mes</div>
            <div className="text-2xl font-bold text-green-600">{fmtCurrency(ingresosEsteMes)}</div>
            <div className="text-sm text-green-600">+18% vs anterior</div>
          </div>
          <div className="bg-white border rounded p-4">
            <div className="text-sm text-gray-600">Pagos Pendientes</div>
            <div className="text-2xl font-bold text-orange-500">{fmtCurrency(pagosPendientesMonto)}</div>
            <div className="text-sm text-gray-600">3 facturas vencidas</div>
            <div className="mt-2"><a href="#" className="text-blue-600">Ver detalles</a></div>
          </div>
          <div className="bg-white border rounded p-4">
            <div className="text-sm text-gray-600">Facturas Emitidas</div>
            <div className="text-2xl font-bold text-blue-600">{facturasEmitidasCount}</div>
            <div className="text-sm">Este mes • 22 pagadas, 3 pendientes</div>
          </div>
          <div className="bg-white border rounded p-4">
            <div className="text-sm text-gray-600">Promedio Días Pago</div>
            <div className="text-2xl font-bold text-gray-800">{promedioDiasPago} días</div>
            <div className="text-sm text-green-600">↓ 5 días • Target: 30 días</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={()=>setTab(1)} className={`px-3 py-2 ${tab===1? 'bg-blue-100':''}`}>Facturas Emitidas</button>
          <button onClick={()=>setTab(2)} className={`px-3 py-2 ${tab===2? 'bg-blue-100':''}`}>Pagos Recibidos</button>
          <button onClick={()=>setTab(3)} className={`px-3 py-2 ${tab===3? 'bg-blue-100':''}`}>Reportes</button>
        </div>

        {tab===1 && (
          <div className="bg-white border rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Input placeholder="Buscar factura/OC/comprador..." value={query} onChange={(e)=> setQuery(e.target.value)} className="w-72" />
                <Select onValueChange={(v)=> setEstadoFilter(v as any)}>
                  <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pagada">Pagada</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="vencida">Vencida</SelectItem>
                    <SelectItem value="anulada">Anulada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2"><Button className="bg-blue-600">Exportar Excel</Button></div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><th className="px-3 py-2">N° Factura</th><th className="px-3 py-2">Fecha</th><th className="px-3 py-2">Comprador</th><th className="px-3 py-2">OC</th><th className="px-3 py-2 text-right">Monto</th><th className="px-3 py-2">Estado</th><th className="px-3 py-2">Vencimiento</th><th className="px-3 py-2">Días</th><th className="px-3 py-2">Acciones</th></tr></thead>
                <tbody>
                  {filteredFacturas.map(f=> (
                    <tr key={f.id} className="border-b">
                      <td className="px-3 py-2 text-blue-600"><a href="#">{f.id}</a></td>
                      <td className="px-3 py-2">{new Date(f.fecha).toLocaleDateString()}</td>
                      <td className="px-3 py-2">{f.comprador.nombre}</td>
                      <td className="px-3 py-2">{f.oc || '—'}</td>
                      <td className="px-3 py-2 text-right">{fmtCurrency(f.monto)}</td>
                      <td className="px-3 py-2">{renderEstadoBadge(f.estado)}</td>
                      <td className="px-3 py-2">{f.vencimiento? new Date(f.vencimiento).toLocaleDateString(): '—'}</td>
                      <td className="px-3 py-2">{f.vencimiento? Math.max(0, Math.ceil((new Date(f.vencimiento).getTime()-Date.now())/(24*3600*1000))) : '—'}</td>
                      <td className="px-3 py-2"><button className="px-2 py-1 rounded hover:bg-gray-100" onClick={()=> alert('Acción (simulado)')}>...</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab===2 && (
          <div className="bg-white border rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium">Historial de Pagos</div>
              <div><Button className="bg-blue-600">Exportar Excel</Button></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><th className="px-3 py-2">Fecha Pago</th><th className="px-3 py-2">Factura</th><th className="px-3 py-2">Comprador</th><th className="px-3 py-2 text-right">Monto</th><th className="px-3 py-2">Método</th><th className="px-3 py-2">Comprobante</th></tr></thead>
                <tbody>
                  {pagos.map((p,idx)=> (
                    <tr key={idx} className="border-b">
                      <td className="px-3 py-2">{new Date(p.fecha).toLocaleDateString()}</td>
                      <td className="px-3 py-2">{p.facturaId}</td>
                      <td className="px-3 py-2">{p.comprador}</td>
                      <td className="px-3 py-2 text-right">{fmtCurrency(p.monto)}</td>
                      <td className="px-3 py-2">{p.metodo}</td>
                      <td className="px-3 py-2">{p.comprobante? <a href="#" className="text-blue-600">{p.comprobante}</a>: '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab===3 && (
          <div className="bg-white border rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium">Reportes</div>
              <div><Button className="bg-blue-600">Generar Reporte PDF</Button></div>
            </div>
            <div className="space-y-3">
              <div className="text-sm">Filtros (fecha, comprador, tipo)</div>
              <div className="text-sm text-gray-600">Reportes Disponibles: Ingresos por Período, Facturas por Estado, Pagos Recibidos, Análisis Compradores, Proyección Flujo Caja</div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function renderEstadoBadge(e: Factura['estado']){
  switch(e){
    case 'pagada': return <Badge className="bg-green-100 text-green-800">Pagada</Badge>;
    case 'pendiente': return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
    case 'vencida': return <Badge className="bg-red-100 text-red-800">Vencida</Badge>;
    case 'anulada': return <Badge className="bg-gray-200 text-gray-700">Anulada</Badge>;
  }
}
