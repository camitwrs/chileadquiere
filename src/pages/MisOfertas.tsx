import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Oferta = {
  id: string;
  licitacion: string;
  organismo: { id: string; nombre: string; logo?: string };
  fechaEnvio?: string | null;
  monto?: number | null;
  estado: 'borrador'|'enviada'|'en_evaluacion'|'adjudicada'|'rechazada'|'descalificada'|'retirada';
  ranking?: number | null;
  puntaje?: number | null;
};

function fmtCurrency(v?: number|null){
  if(!v) return '-';
  return new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'}).format(v);
}

function sampleOfertas(): Oferta[]{
  return Array.from({ length: 45 }).map((_, i)=>{
    const estados: Oferta['estado'][] = ['borrador','enviada','en_evaluacion','adjudicada','rechazada','descalificada','retirada'];
    const estado = estados[i%estados.length];
    const monto = 4800000 + (i%5)*1000000;
    return {
      id: `OFE-2024-${String(i+1).padStart(3,'0')}`,
      licitacion: `LIC-2024-${String((i%12)+1).padStart(3,'0')} - Suministro de equipos y servicios varios`,
      organismo: { id: `ORG-${i%5}`, nombre: ['Ministerio de Educación','Municipalidad de Providencia','Servicio Salud','Universidad de Chile','Gobernación'][i%5] },
      fechaEnvio: estado==='borrador' ? null : new Date(Date.now() - i*86400000).toISOString(),
      monto: monto,
      estado: estado,
      ranking: (i%7===3||i%7===4) ? (Math.round(Math.random()*10)+1) : null,
      puntaje: (i%7===3||i%7===4) ? Math.round((60 + Math.random()*40)*10)/10 : null,
    };
  });
}

export default function MisOfertas(){
  const [view, setView] = useState<'table'|'grid'>('table');
  const [tab, setTab] = useState<'todas'|'borradores'|'enviadas'|'en_evaluacion'|'adjudicadas'|'rechazadas'>('todas');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);

  const data = useMemo(()=> sampleOfertas(), []);

  // KPI cards
  const total = data.length;
  const enEvaluacion = data.filter(d=>d.estado==='en_evaluacion').length;
  const adjudicadas = data.filter(d=>d.estado==='adjudicada').length;
  const rechazadas = data.filter(d=>d.estado==='rechazada').length;
  const borradores = data.filter(d=>d.estado==='borrador').length;

  const filtered = data.filter(o=>{
    if(tab==='borradores' && o.estado!=='borrador') return false;
    if(tab==='enviadas' && o.estado!=='enviada') return false;
    if(tab==='en_evaluacion' && o.estado!=='en_evaluacion') return false;
    if(tab==='adjudicadas' && o.estado!=='adjudicada') return false;
    if(tab==='rechazadas' && o.estado!=='rechazada') return false;
    if(query){
      const q = query.toLowerCase();
      return o.id.toLowerCase().includes(q) || o.licitacion.toLowerCase().includes(q) || o.organismo.nombre.toLowerCase().includes(q);
    }
    return true;
  });

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>

            <h1 className="text-2xl font-bold">Mis Ofertas</h1>
          </div>
          <div className="flex items-center gap-3">
            <Input placeholder="Buscar por ID, licitación..." value={query} onChange={(e)=>{ setQuery(e.target.value); setPage(1); }} className="w-96" />
            <Select onValueChange={(v)=> setSort(v)}>
              <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Más Recientes</SelectItem>
                <SelectItem value="monto">Monto</SelectItem>
                <SelectItem value="estado">Estado</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-blue-600">Exportar Excel</Button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border rounded p-4 h-24">
            <div className="text-sm text-gray-600">Total Ofertas</div>
            <div className="text-2xl font-bold text-blue-600">{total}</div>
            <div className="text-sm text-green-600 mt-1">+5 este mes</div>
          </div>

          <div className="bg-white border rounded p-4 h-24">
            <div className="text-sm text-gray-600">En Evaluación</div>
            <div className="text-2xl font-bold text-orange-500">{enEvaluacion}</div>
            <div className="text-sm"><Badge variant="secondary">{Math.min(4,enEvaluacion)} urgentes</Badge></div>
          </div>

          <div className="bg-white border rounded p-4 h-24">
            <div className="text-sm text-gray-600">Adjudicadas</div>
            <div className="text-2xl font-bold text-green-600">{adjudicadas}</div>
            <div className="text-sm">Tasa: {Math.round((adjudicadas/Math.max(1,total))*100)}%</div>
          </div>

          <div className="bg-white border rounded p-4 h-24">
            <div className="text-sm text-gray-600">Rechazadas</div>
            <div className="text-2xl font-bold text-red-600">{rechazadas}</div>
            <div className="text-sm text-blue-600">Ver Análisis</div>
          </div>

          <div className="bg-white border rounded p-4 h-24">
            <div className="text-sm text-gray-600">Borradores</div>
            <div className="text-2xl font-bold text-gray-600">{borradores}</div>
            <div className="mt-2"><Button variant="ghost">Completar</Button></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {['todas','borradores','enviadas','en_evaluacion','adjudicadas','rechazadas'].map(t=> (
            <button key={t} onClick={()=>{ setTab(t as any); setPage(1); }} className={`px-3 py-2 rounded ${tab===t? 'bg-blue-100':''}`}>{tabLabel(t)} <span className="ml-2 text-sm text-gray-500">({data.filter(d=>matchTab(d,t as any)).length})</span></button>
          ))}
          <div className="ml-auto">Vista: <button onClick={()=>setView('table')} className={`px-2 ${view==='table'?'font-bold':''}`}>Tabla</button> <button onClick={()=>setView('grid')} className={`px-2 ${view==='grid'?'font-bold':''}`}>Grid</button></div>
        </div>

        {/* Content */}
        {view==='table' ? (
          <div className="bg-white border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left" style={{width:80}}>Fecha</th>
                  <th className="px-3 py-2 text-left" style={{width:140}}>ID Oferta</th>
                  <th className="px-3 py-2 text-left" style={{width:300}}>Licitación</th>
                  <th className="px-3 py-2 text-left" style={{width:150}}>Organismo</th>
                  <th className="px-3 py-2 text-right" style={{width:120}}>Monto</th>
                  <th className="px-3 py-2 text-left" style={{width:120}}>Estado</th>
                  <th className="px-3 py-2 text-right" style={{width:80}}>Ranking</th>
                  <th className="px-3 py-2 text-right" style={{width:80}}>Puntaje</th>
                  <th className="px-3 py-2 text-center" style={{width:80}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map(o=> (
                  <tr key={o.id} className={`border-b ${o.estado==='borrador'?'bg-gray-50':''}`}>
                    <td className="px-3 py-2">{o.fechaEnvio? new Date(o.fechaEnvio).toLocaleDateString() : '—'}</td>
                    <td className="px-3 py-2 text-blue-600"><a href="#">{o.id}</a></td>
                    <td className="px-3 py-2 truncate" title={o.licitacion}>{o.licitacion}</td>
                    <td className="px-3 py-2 flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarImage src={o.organismo.logo || getAvatarUrl(o.organismo.nombre)} alt={o.organismo.nombre} /></Avatar>{o.organismo.nombre}</td>
                    <td className="px-3 py-2 text-right">{fmtCurrency(o.monto)}</td>
                    <td className="px-3 py-2"><EstadoBadge estado={o.estado} /></td>
                    <td className="px-3 py-2 text-right">{o.ranking? `${o.ranking}º de 12` : '—'}</td>
                    <td className="px-3 py-2 text-right">{o.puntaje? o.puntaje : '—'}</td>
                    <td className="px-3 py-2 text-center"><button className="px-2 py-1 rounded hover:bg-gray-100">...</button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="p-3 flex items-center justify-between">
              <div className="text-sm text-gray-600">Mostrando {pageData.length} de {filtered.length}</div>
              <div className="flex items-center gap-2">
                <Button onClick={()=> setPage(p=> Math.max(1,p-1))} disabled={page===1}>Anterior</Button>
                <div>Pagina {page} / {totalPages}</div>
                <Button onClick={()=> setPage(p=> Math.min(totalPages,p+1))} disabled={page===totalPages}>Siguiente</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(o=> (
              <div key={o.id} className="bg-white border rounded p-4 h-[280px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{o.id}</div>
                    <EstadoBadge estado={o.estado} />
                  </div>
                  <div className="mt-2 font-semibold truncate" title={o.licitacion}>{o.licitacion}</div>
                  <div className="mt-2 flex items-center gap-2 text-sm"><Avatar className="h-6 w-6"><AvatarImage src={o.organismo.logo || getAvatarUrl(o.organismo.nombre)} alt={o.organismo.nombre} /></Avatar>{o.organismo.nombre}</div>
                  <div className="mt-3 text-2xl font-bold">{fmtCurrency(o.monto)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">{o.fechaEnvio? new Date(o.fechaEnvio).toLocaleDateString() : 'Borrador'}</div>
                    <div className="text-sm">{o.ranking? `${o.ranking}º de 12` : ''}</div>
                    <div className="text-sm">{o.puntaje? `${o.puntaje} / 100` : ''}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline">Ver Oferta</Button>
                    <button className="px-2 py-1 rounded hover:bg-gray-100">...</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state if no offers in tab */}
        {filtered.length===0 && (
          <div className="bg-white border rounded p-6 text-center">
            <div className="text-lg font-semibold">No tienes ofertas en {tabLabel(tab)}</div>
            <p className="text-sm text-gray-600 mt-2">Explora oportunidades y presenta tu primera oferta</p>
            <div className="mt-4"><Button className="bg-blue-600">Buscar Licitaciones</Button></div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function matchTab(o: Oferta, t: string){
  if(t==='todas') return true;
  if(t==='borradores') return o.estado==='borrador';
  if(t==='enviadas') return o.estado==='enviada';
  if(t==='en_evaluacion') return o.estado==='en_evaluacion';
  if(t==='adjudicadas') return o.estado==='adjudicada';
  if(t==='rechazadas') return o.estado==='rechazada';
  return true;
}

function tabLabel(t: string){
  switch(t){
    case 'todas': return 'Todas';
    case 'borradores': return 'Borradores';
    case 'enviadas': return 'Enviadas';
    case 'en_evaluacion': return 'En Evaluación';
    case 'adjudicadas': return 'Adjudicadas';
    case 'rechazadas': return 'Rechazadas';
    default: return t;
  }
}

function EstadoBadge({ estado }: { estado: Oferta['estado'] }){
  const map: Record<Oferta['estado'], { label:string; color:string }> = {
    borrador: { label: 'Borrador', color: 'bg-gray-200 text-gray-700' },
    enviada: { label: 'Enviada', color: 'bg-blue-100 text-blue-700' },
    en_evaluacion: { label: 'En Evaluación', color: 'bg-orange-100 text-orange-700' },
    adjudicada: { label: 'Adjudicada', color: 'bg-green-100 text-green-700' },
    rechazada: { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
    descalificada: { label: 'Descalificada', color: 'bg-gray-700 text-white' },
    retirada: { label: 'Retirada', color: 'bg-gray-300 text-gray-700' },
  };
  const m = map[estado];
  return <span className={`${m.color} px-2 py-1 rounded text-sm`}>{m.label}</span>;
}
