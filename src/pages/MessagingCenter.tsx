import React, { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Paperclip, Phone, MoreVertical } from "lucide-react";

// Mock types
type User = { id: string; nombre: string; rol: "comprador" | "proveedor" | "organismo"; avatar?: string; online?: boolean };
type Message = {
  id: string;
  conversacionId: string;
  remitenteId: string;
  texto?: string;
  timestamp: string;
  leido?: boolean;
  tipo?: "texto" | "archivo" | "sistema";
  archivos?: { nombre: string; tamaño: number; url?: string }[];
};
type Conversacion = {
  id: string;
  participantes: User[];
  licitacionId?: string | null;
  ultimoMensaje: { texto: string; timestamp: string; enviadoPorMi?: boolean };
  mensajesNoLeidos: number;
  pinneada?: boolean;
  silenciada?: boolean;
  archivada?: boolean;
  mensajes: Message[];
};

// small helpers
const nowIso = (d = new Date()) => d.toISOString();
const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `Hace ${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  return new Date(iso).toLocaleDateString();
};

function generateMockConversations(): Conversacion[] {
  const users: User[] = [
    { id: "USER-001", nombre: "Juan García", rol: "comprador", avatar: "" , online: true},
    { id: "USER-002", nombre: "TechSupply SpA", rol: "proveedor", avatar: "", online: false },
    { id: "ORG-01", nombre: "Ministerio de Educación", rol: "organismo", avatar: "", online: true },
  ];

  return Array.from({ length: 10 }).map((_, i) => {
    const p = i % 3;
    const userA = users[p];
    const userB = users[(p + 1) % users.length];
    const id = `CONV-${100 + i}`;
    const msgs: Message[] = Array.from({ length: 6 }).map((__, j) => ({
      id: `${id}-MSG-${j}`,
      conversacionId: id,
      remitenteId: j % 2 === 0 ? userA.id : userB.id,
      texto: j % 5 === 0 ? "Adjunto el documento" : `Mensaje de prueba ${j + 1}`,
      timestamp: new Date(Date.now() - (i * 3600 + j * 60) * 1000).toISOString(),
      leido: j % 3 === 0,
      tipo: 'texto'
    }));

    return {
      id,
      participantes: [userA, userB],
      licitacionId: i % 2 === 0 ? `LIC-2024-00${i + 1}` : null,
      ultimoMensaje: { texto: msgs[msgs.length - 1].texto || "", timestamp: msgs[msgs.length - 1].timestamp, enviadoPorMi: (msgs[msgs.length - 1].remitenteId === userA.id) },
      mensajesNoLeidos: Math.round(Math.random() * 3),
      pinneada: i === 2,
      silenciada: false,
      archivada: false,
      mensajes: msgs.reverse(),
    };
  }).sort((a,b)=> (b.pinneada ? 1:0) - (a.pinneada?1:0));
}

export default function MessagingCenter() {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>(() => generateMockConversations());
  const [activeConvId, setActiveConvId] = useState<string | null>(conversaciones[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<'todas'|'directos'|'grupos'|'archivadas'>('todas');
  const [filter, setFilter] = useState<'all'|'unread'|'archived'>('all');
  const [showNewModal, setShowNewModal] = useState(false);

  // Drafts per conversation
  useEffect(()=>{
    const saved = localStorage.getItem('mensajes_drafts_v1');
    if(saved){
      try{ const map = JSON.parse(saved); /* not used for mock demo */ }catch(e){}
    }
  },[]);

  const activeConv = useMemo(()=> conversationsById(conversaciones)[activeConvId || ''] || null, [conversaciones, activeConvId]);

  // search & filter
  const visibleConvs = useMemo(()=>{
    const q = query.trim().toLowerCase();
    return conversaciones.filter(c=>{
      if(tab==='archivadas' && !c.archivada) return false;
      if(tab==='directos' && c.participantes.length>2) return false;
      if(tab==='grupos' && c.participantes.length<=2) return false;
      if(filter==='unread' && c.mensajesNoLeidos===0) return false;
      if(filter==='archived' && !c.archivada) return false;
      if(!q) return true;
      return c.participantes.some(p=>p.nombre.toLowerCase().includes(q)) || c.ultimoMensaje.texto.toLowerCase().includes(q) || (c.licitacionId||'').toLowerCase().includes(q);
    });
  },[conversaciones, query, tab, filter]);

  // Mock send message
  function sendMessage(convId: string, text: string) {
    if(!text.trim()) return;
    setConversaciones(prev=> prev.map(c=>{
      if(c.id!==convId) return c;
      const msg: Message = { id: `${c.id}-MSG-${Date.now()}`, conversacionId: c.id, remitenteId: 'ME', texto: text, timestamp: nowIso(), leido: false, tipo:'texto'};
  return { ...c, mensajes: [...c.mensajes, msg], ultimoMensaje: { texto: text, timestamp: msg.timestamp, enviadoPorMi: true } };
    }));
    // optimistic UI: scroll handled in ChatPane
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Breadcrumb + header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-muted-foreground">Dashboard &gt; Mensajes</div>
            <h1 className="text-2xl font-bold">Mensajes <Badge variant="destructive" className="ml-2">3 sin leer</Badge></h1>
          </div>

          <div className="flex items-center gap-3">
            <Input placeholder="Buscar conversaciones..." className="w-72" value={query} onChange={(e)=>setQuery(e.target.value)} />
            <Select onValueChange={(v)=> setFilter(v as any)}>
              <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">No Leídas</SelectItem>
                <SelectItem value="archived">Archivadas</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={()=>setShowNewModal(true)} className="bg-blue-600 hover:bg-blue-700">+ Nuevo Mensaje</Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Left column */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3 max-h-[80vh] overflow-hidden">
            <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={()=>setTab('todas')} className={`px-3 py-1 rounded ${tab==='todas'?'bg-blue-100':'hover:bg-gray-50'}`}>Todas</button>
                  <button onClick={()=>setTab('directos')} className={`px-3 py-1 rounded ${tab==='directos'?'bg-blue-100':'hover:bg-gray-50'}`}>Directos</button>
                  <button onClick={()=>setTab('grupos')} className={`px-3 py-1 rounded ${tab==='grupos'?'bg-blue-100':'hover:bg-gray-50'}`}>Grupos</button>
                  <button onClick={()=>setTab('archivadas')} className={`px-3 py-1 rounded ${tab==='archivadas'?'bg-blue-100':'hover:bg-gray-50'}`}>Archivadas</button>
                </div>
                <div className="flex items-center gap-2">
                  <Input placeholder="Buscar..." className="w-40" value={query} onChange={(e)=>setQuery(e.target.value)} />
                </div>
              </div>

              <div className="overflow-auto" style={{maxHeight: 'calc(80vh - 120px)'}}>
                {visibleConvs.length===0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <div className="mx-auto mb-4 w-20 h-20 border rounded-full flex items-center justify-center text-3xl text-gray-300">💬</div>
                    <div className="text-lg font-semibold">No tienes conversaciones</div>
                    <div className="mt-2 text-sm">Inicia una conversación haciendo clic en + Nuevo Mensaje</div>
                    <div className="mt-4"><Button onClick={()=>setShowNewModal(true)}>+ Nuevo Mensaje</Button></div>
                  </div>
                ) : (
                  visibleConvs.map(c=> (
                    <ConversationCard key={c.id} c={c} active={c.id===activeConvId} onOpen={()=>{ setActiveConvId(c.id); /* mark read */ }} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right column chat pane */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9">
            <div className="bg-white rounded-lg border border-gray-200 h-[80vh] flex flex-col">
              {activeConv ? (
                <ChatPane conv={activeConv} onSend={sendMessage} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">Selecciona una conversación</div>
              )}
            </div>
          </div>
        </div>

        <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
          <DialogContent className="w-[600px]">
            <DialogHeader>
              <DialogTitle>Nuevo Mensaje</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <label className="block text-sm font-medium">Para:</label>
              <Input placeholder="Buscar usuarios/organismos..." />
              <label className="block text-sm font-medium">Asunto:</label>
              <Input placeholder="Asunto" />
              <label className="block text-sm font-medium">Mensaje:</label>
              <textarea className="w-full border rounded p-2 min-h-[120px]" />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={()=>setShowNewModal(false)}>Cancelar</Button>
              <Button onClick={()=>{ setShowNewModal(false); alert('Mensaje enviado (simulado)'); }}>Enviar Mensaje</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function conversationsById(list: Conversacion[]) {
  return list.reduce<Record<string, Conversacion>>((acc, c) => { acc[c.id] = c; return acc; }, {});
}

function ConversationCard({ c, active, onOpen }: { c: Conversacion; active?: boolean; onOpen?: ()=>void }){
  const other = c.participantes[0];
  return (
    <div onClick={onOpen} role="button" tabIndex={0} className={`p-3 flex items-center gap-3 border-b hover:bg-gray-50 ${active? 'bg-blue-50':''} ${c.mensajesNoLeidos? 'border-l-4 border-blue-400':''} ${c.archivada? 'opacity-60':''}`}>
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={other.avatar || getAvatarUrl(other.nombre)} alt={other.nombre} />
        </Avatar>
        {other.online && <span className="absolute right-0 bottom-0 w-3 h-3 bg-green-500 rounded-full border border-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium truncate">{other.nombre} <span className="ml-2 text-xs px-1 rounded bg-gray-100 text-gray-600">{other.rol==='comprador'?'Comprador':other.rol==='proveedor'?'Proveedor':'Organismo'}</span></div>
          <div className="text-xs text-gray-500">{timeAgo(c.ultimoMensaje.timestamp)}</div>
        </div>
        <div className="text-xs text-gray-600 truncate">{c.ultimoMensaje.enviadoPorMi? 'Tú: ': ''}{c.ultimoMensaje.texto}</div>
        <div className="text-xs text-blue-600 truncate mt-1">{c.licitacionId? `Re: ${c.licitacionId} - Suministro...` : ''}</div>
      </div>
      <div className="ml-2 flex flex-col items-end">
        {c.mensajesNoLeidos>0 && <div className="bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">{c.mensajesNoLeidos}</div>}
        {c.pinneada && <div className="text-xs mt-1">📌</div>}
      </div>
    </div>
  );
}

function ChatPane({ conv, onSend }: { conv: Conversacion; onSend: (convId:string, text: string)=>void }){
  const [text, setText] = useState("");
  const messagesRef = useRef<HTMLDivElement | null>(null);
  useEffect(()=>{ messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight }); }, [conv]);

  function handleSend(){
    if(!text.trim()) return;
    onSend(conv.id, text.trim());
    setText('');
    // optimistic scroll
    setTimeout(()=> messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' }), 50);
  }

  return (
      <div className="flex-1 flex flex-col">
        <div className="p-3 border-b flex items-center justify-between h-[70px]">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12"><AvatarImage src={conv.participantes[0].avatar || getAvatarUrl(conv.participantes[0].nombre)} alt={conv.participantes[0].nombre} /></Avatar>
          <div>
            <div className="text-lg font-semibold">{conv.participantes[0].nombre}</div>
            <div className="text-xs text-gray-500">{conv.participantes[0].rol==='comprador'?'Comprador': 'Proveedor'} • {conv.participantes[0].online? 'Conectado':'Desconectado'}</div>
            <div className="text-xs text-blue-600">{conv.licitacionId? `Re: ${conv.licitacionId} - Suministro...`: ''}</div>
          </div>
        </div>
       <div className="flex gap-2">
  <Button variant="ghost" size="icon" aria-label="Buscar">
    <Search className="h-4 w-4" />
  </Button>
  <Button variant="ghost" size="icon" aria-label="Adjuntar">
    <Paperclip className="h-4 w-4" />
  </Button>
  <Button variant="ghost" size="icon" disabled aria-label="Llamar">
    <Phone className="h-4 w-4" />
  </Button>
  <Button variant="ghost" size="icon" aria-label="Más opciones">
    <MoreVertical className="h-4 w-4" />
  </Button>
</div>
      </div>

      <div ref={messagesRef} className="p-4 overflow-auto flex-1 space-y-3" tabIndex={0} aria-live="polite">
        {/* temporal separators and grouping basic implementation */}
        {conv.mensajes.map((m, idx)=>{
          const me = m.remitenteId==='ME';
          if(m.tipo==='sistema'){
            return <div key={m.id} className="text-center text-sm text-gray-500 py-2">{m.texto}</div>;
          }
          return (
            <div key={m.id} className={`flex ${me? 'justify-end':'justify-start'}`}>
              {!me && <div className="mr-2"><Avatar className="h-8 w-8"><AvatarImage src={(() => { const u = conv.participantes.find(p=>p.id===m.remitenteId); return u?.avatar || getAvatarUrl(u?.nombre || m.remitenteId); })()} alt={m.remitenteId} /></Avatar></div>}
              <div>
                <div className={`${me? 'bg-blue-600 text-white':'bg-gray-100 text-gray-900'} rounded-lg p-3 max-w-[70%]`}>{m.texto}</div>
                <div className={`text-xs text-gray-500 mt-1 ${me? 'text-right':''}`}>{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} {me? '✓✓':' '}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t flex items-center gap-3 h-[80px]">
        <Button variant="ghost"> <Paperclip className="h-4 w-4" /></Button>
        <div className="flex-1">
          <textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder="Escribe un mensaje..." className="w-full border rounded-full p-3 min-h-[40px] max-h-[120px]" onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleSend(); } }} />
        </div>
        <Button onClick={handleSend} className={`h-10 w-10 rounded-full ${text.trim()? 'bg-blue-600 text-white':'bg-gray-300 text-gray-600'}`}>➤</Button>
      </div>
    </div>
  );
}
