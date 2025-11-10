import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Folder = {
  id: string;
  nombre: string;
  parentId: string | null;
  nivel: number;
  cantidadArchivos?: number;
  sub?: Folder[];
};

type FileItem = {
  id: string;
  nombre: string;
  extension: string;
  tipo: string;
  tamano: number; // bytes
  carpetaId: string;
  fechaSubida: string;
  fechaModificacion: string;
  subidoPor: { id: string; nombre: string };
  compartidoCon?: string[];
  etiquetas?: string[];
  estado?: string;
  fechaVencimiento?: string;
  url?: string;
  thumbnail?: string;
  favorito?: boolean;
};

function fmtSize(bytes: number) {
  if (bytes > 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  if (bytes > 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

function sampleFolders(): Folder[] {
  return [
    {
      id: "F-MIS",
      nombre: "Mis Documentos",
      parentId: null,
      nivel: 0,
      sub: [
        {
          id: "F-LIC",
          nombre: "Licitaciones",
          parentId: "F-MIS",
          nivel: 1,
          sub: [
            { id: "F-LIC-001", nombre: "LIC-2024-001", parentId: "F-LIC", nivel: 2 },
            { id: "F-LIC-002", nombre: "LIC-2024-002", parentId: "F-LIC", nivel: 2 },
            { id: "F-PLANT", nombre: "Plantillas", parentId: "F-LIC", nivel: 2 },
          ],
        },
        {
          id: "F-OC",
          nombre: "Órdenes de Compra",
          parentId: "F-MIS",
          nivel: 1,
          sub: [
            { id: "F-OC-ACT", nombre: "Activas", parentId: "F-OC", nivel: 2 },
            { id: "F-OC-COMP", nombre: "Completadas", parentId: "F-OC", nivel: 2 },
            { id: "F-OC-FAC", nombre: "Facturas", parentId: "F-OC", nivel: 2 },
          ],
        },
        { id: "F-CERT", nombre: "Certificaciones", parentId: "F-MIS", nivel: 1 },
        { id: "F-LEG", nombre: "Legales", parentId: "F-MIS", nivel: 1 },
        { id: "F-REP", nombre: "Reportes", parentId: "F-MIS", nivel: 1 },
        { id: "F-PL", nombre: "Plantillas", parentId: "F-MIS", nivel: 1 },
        { id: "F-COMP", nombre: "Compartidos", parentId: "F-MIS", nivel: 1 },
      ],
    },
  ];
}

function sampleFiles(folders: Folder[]): FileItem[] {
  const files: FileItem[] = [];
  const extensions = ["pdf", "docx", "xlsx", "jpg", "png", "zip"];
  for (let i = 0; i < 36; i++) {
    const ext = extensions[i % extensions.length];
    const folder = i % 3 === 0 ? "F-LIC-001" : i % 5 === 0 ? "F-OC" : "F-CERT";
    files.push({
      id: `FILE-${i + 1}`,
      nombre: `Documento_${i + 1}.${ext}`,
      extension: ext,
      tipo: ext === "pdf" ? "application/pdf" : ext === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/octet-stream",
      tamano: 1024 * (50 + (i % 1000)),
      carpetaId: folder,
      fechaSubida: new Date(Date.now() - i * 86400000).toISOString(),
      fechaModificacion: new Date(Date.now() - i * 3600000).toISOString(),
      subidoPor: { id: `USER-${i % 4}`, nombre: ["Juan García", "María Pérez", "Carlos Ruiz", "Ana Soto"][i % 4] },
      compartidoCon: i % 7 === 0 ? ["USER-002", "USER-003"] : [],
      etiquetas: i % 6 === 0 ? ["urgente"] : [],
      estado: i % 12 === 0 ? "por vencer" : "vigente",
      fechaVencimiento: i % 12 === 0 ? new Date(Date.now() + 20 * 86400000).toISOString() : undefined,
      url: `/#/files/${i + 1}`,
      thumbnail: undefined,
      favorito: i % 8 === 0,
    });
  }
  return files;
}

export default function Documentos() {
  const folders = useMemo(() => sampleFolders(), []);
  const [files] = useState<FileItem[]>(() => sampleFiles(folders));

  const [selectedFolder, setSelectedFolder] = useState<string>("F-LIC-001");
  const [view, setView] = useState<"grid" | "list" | "details">("grid");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilters, setTypeFilters] = useState<Record<string, boolean>>({ pdf: true, docx: true, xlsx: true, jpg: true, png: true, zip: true });
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [sort, setSort] = useState("nombre");
  const [showUpload, setShowUpload] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});

  const filtered = files.filter((f) => {
    // folder
    if (selectedFolder && f.carpetaId !== selectedFolder && !(selectedFolder === "F-LIC" && f.carpetaId.startsWith("F-LIC"))) return false;
    // search
    if (query && !f.nombre.toLowerCase().includes(query.toLowerCase())) return false;
    // type filters
    if (typeFilters && !typeFilters[f.extension]) return false;
    // state
    if (stateFilter !== 'all' && f.estado !== stateFilter) return false;
    // tags
    if (tagFilter.length > 0) {
      const has = (f.etiquetas || []).some(t => tagFilter.includes(t));
      if (!has) return false;
    }
    // date range
    if (dateFrom) {
      const from = new Date(dateFrom);
      if (new Date(f.fechaSubida) < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      if (new Date(f.fechaSubida) > to) return false;
    }
    // size
    if (sizeFilter === '<1MB' && f.tamano >= 1024 * 1024) return false;
    if (sizeFilter === '1-10MB' && (f.tamano < 1024 * 1024 || f.tamano > 10 * 1024 * 1024)) return false;
    if (sizeFilter === '>10MB' && f.tamano <= 10 * 1024 * 1024) return false;

    return true;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Breadcrumb + Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mis Documentos</h1>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl">
              <div className="bg-white border rounded p-4 flex flex-col justify-between h-28 w-52">
                <div className="text-sm text-gray-600">Total Documentos</div>
                <div className="text-2xl font-bold text-blue-600">148</div>
                <div className="text-xs text-gray-500">Archivos almacenados</div>
                <div className="text-xs text-gray-500">2.8 GB / 5 GB</div>
              </div>

              <div className="bg-white border rounded p-4 flex flex-col justify-between h-28 w-52">
                <div className="text-sm text-gray-600">Documentos Recientes</div>
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-xs text-gray-500">Últimos 7 días</div>
                <a href="#" className="text-sm text-blue-600">Ver todos</a>
              </div>

              <div className="bg-white border rounded p-4 flex flex-col justify-between h-28 w-52">
                <div className="text-sm text-gray-600">Compartidos</div>
                <div className="text-2xl font-bold text-orange-500">23</div>
                <div className="text-xs text-gray-500">Compartidos conmigo</div>
                <Badge className="bg-orange-100 text-orange-800">3 nuevos</Badge>
              </div>

              <div className="bg-white border rounded p-4 flex flex-col justify-between h-28 w-52">
                <div className="text-sm text-gray-600">Por Vencer</div>
                <div className="text-2xl font-bold text-red-600">4</div>
                <div className="text-xs text-gray-500">Vencen &lt;30 días</div>
                <a href="#" className="text-sm text-blue-600">Actualizar</a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button className="bg-blue-600" onClick={() => setShowUpload(true)}>+ Subir Documento</Button>
            <Button variant="ghost">Nueva Carpeta</Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 border rounded p-3 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Carpetas</div>
              <button className="text-sm text-blue-600">Expandir</button>
            </div>
            <div className="space-y-1">
              {/* Render folder tree simple recursive */}
              {folders.map((root) => (
                <div key={root.id}>
                  <FolderNode node={root} depth={0} selected={selectedFolder} onSelect={setSelectedFolder} />
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Button variant="ghost" className="w-full">+ Nueva Carpeta</Button>
            </div>

            <div className="mt-6 text-sm text-gray-600">Almacenamiento</div>
            <div className="w-full bg-gray-100 h-3 rounded mt-2 overflow-hidden"><div className="h-3 bg-green-500" style={{ width: '56%' }} /></div>
            <div className="text-xs text-gray-600 mt-1">2.8 GB / 5 GB usados</div>
          </aside>

          {/* Main area */}
          <main className="flex-1">
            <div className="bg-white border rounded p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
              
                <div className="flex items-center gap-2">
                  <Input placeholder="Buscar archivos..." className="w-72" value={query} onChange={(e:any)=> setQuery(e.target.value)} />
                  <button className="px-2 py-1 text-sm" onClick={()=> setShowFilters(s=>!s)}>Filtros</button>
                  <div className="flex items-center gap-1">
                    <button title="Grid" onClick={()=> setView('grid')} className={`px-2 py-1 ${view==='grid' ? 'bg-blue-50 rounded':''}`}>⊞</button>
                    <button title="Lista" onClick={()=> setView('list')} className={`px-2 py-1 ${view==='list' ? 'bg-blue-50 rounded':''}`}>≡</button>
                    <button title="Detalles" onClick={()=> setView('details')} className={`px-2 py-1 ${view==='details' ? 'bg-blue-50 rounded':''}`}>🏢</button>
                  </div>
                  <Select onValueChange={(v)=> setSort(v)}>
                    <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Filtros" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nombre">Nombre (A-Z)</SelectItem>
                      <SelectItem value="fecha">Fecha modificación</SelectItem>
                      <SelectItem value="tamano">Tamaño</SelectItem>
                      <SelectItem value="tipo">Tipo archivo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="px-3 py-1" onClick={()=> setMultiSelect(s=>!s)}>Seleccionar múltiples</Button>
                </div>
              </div>
              {showFilters && (
                <div className="mt-3 bg-gray-50 p-3 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <div className="text-sm font-medium mb-1">Tipo de archivo</div>
                      {Object.keys(typeFilters).map(t=> (
                        <label key={t} className="mr-3 text-sm"><input type="checkbox" checked={!!typeFilters[t]} onChange={(e)=> setTypeFilters(s=>({...s, [t]: e.target.checked}))} /> {t.toUpperCase()}</label>
                      ))}
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Fecha subida</div>
                      <div className="flex gap-2 items-center">
                        <input type="date" value={dateFrom || ''} onChange={(e)=> setDateFrom(e.target.value || null)} className="border p-1" />
                        <span className="text-sm">-</span>
                        <input type="date" value={dateTo || ''} onChange={(e)=> setDateTo(e.target.value || null)} className="border p-1" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Tamaño</div>
                      <select value={sizeFilter} onChange={(e)=> setSizeFilter(e.target.value)} className="border p-1">
                        <option value="all">Todos</option>
                        <option value="<1MB">&lt;1MB</option>
                        <option value="1-10MB">1-10MB</option>
                        <option value=">10MB">&gt;10MB</option>
                      </select>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Estado</div>
                      <select value={stateFilter} onChange={(e)=> setStateFilter(e.target.value)} className="border p-1">
                        <option value="all">Todos</option>
                        <option value="vigente">Vigente</option>
                        <option value="por vencer">Por vencer</option>
                        <option value="vencido">Vencido</option>
                      </select>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Etiquetas</div>
                      <Input placeholder="Filtrar por etiqueta (coma separadas)" value={tagFilter.join(',')} onChange={(e:any)=> setTagFilter(e.target.value ? e.target.value.split(',').map((s:string)=> s.trim()).filter(Boolean) : [])} />
                    </div>
                    <div className="flex items-end">
                      <Button variant="ghost" onClick={()=>{ setTypeFilters({ pdf: true, docx: true, xlsx: true, jpg: true, png: true, zip: true }); setDateFrom(null); setDateTo(null); setSizeFilter('all'); setStateFilter('all'); setTagFilter([]); }}>Limpiar filtros</Button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Grid or List */}
            {view === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((f) => (
                  <div key={f.id} className={`bg-white border rounded overflow-hidden relative ${selectedItems[f.id] ? 'ring-2 ring-blue-400' : ''}`}>
                    <div className="h-40 bg-gray-50 flex items-center justify-center">
                      {/* simple preview icons */}
                      {f.extension === 'pdf' ? (
                        <div className="text-center">
                          <div className="text-6xl text-red-500">PDF</div>
                        </div>
                      ) : f.extension === 'docx' ? (
                        <div className="text-6xl text-blue-600">DOC</div>
                      ) : f.extension === 'xlsx' ? (
                        <div className="text-6xl text-green-600">XLS</div>
                      ) : f.extension === 'jpg' || f.extension === 'png' ? (
                        <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${f.thumbnail || 'https://placehold.co/600x400'}')` }} />
                      ) : (
                        <div className="text-6xl">DOC</div>
                      )}

                     
                    </div>
                    <div className="p-2 flex items-center justify-between">
                      <div className="flex-1 pr-2">
                        <div className="text-sm font-semibold truncate" title={f.nombre}>{f.nombre}</div>
                        <div className="text-xs text-gray-500">{fmtSize(f.tamano)} • {new Date(f.fechaSubida).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {f.estado === 'por vencer' && <div className="text-yellow-600">⚠️</div>}
                        {f.compartidoCon && f.compartidoCon.length > 0 && <div>👥</div>}
                        {multiSelect && <input type="checkbox" checked={!!selectedItems[f.id]} onChange={(e)=> setSelectedItems(s => ({ ...s, [f.id]: e.target.checked }))} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {view === 'list' && (
              <div className="bg-white border rounded">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50"><tr>
                      <th className="px-3 py-2">{multiSelect ? '✓' : ''}</th>
                      <th className="px-3 py-2">Nombre</th>
                      <th className="px-3 py-2">Tipo</th>
                      <th className="px-3 py-2">Tamaño</th>
                      <th className="px-3 py-2">Modificado</th>
                      <th className="px-3 py-2">Compartido</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2">Acciones</th>
                    </tr></thead>
                    <tbody>
                      {filtered.map(f => (
                        <tr key={f.id} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2">{multiSelect ? <input type="checkbox" checked={!!selectedItems[f.id]} onChange={(e)=> setSelectedItems(s=>({...s,[f.id]: e.target.checked}))} /> : null}</td>
                          <td className="px-3 py-2"><a className="text-blue-600" href="#" onClick={(e)=>{ e.preventDefault(); setPreviewFile(f); }}>{f.nombre}</a></td>
                          <td className="px-3 py-2">{f.extension.toUpperCase()}</td>
                          <td className="px-3 py-2">{fmtSize(f.tamano)}</td>
                          <td className="px-3 py-2">{new Date(f.fechaModificacion).toLocaleString()}</td>
                          <td className="px-3 py-2">{f.compartidoCon && f.compartidoCon.length>0 ? <AvatarFallback>{f.compartidoCon.length}</AvatarFallback> : '—'}</td>
                          <td className="px-3 py-2">{f.estado}</td>
                          <td className="px-3 py-2"><button onClick={()=> setPreviewFile(f)} className="px-2 py-1">Vista</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {view === 'details' && (
              <div className="bg-white border rounded p-4">Detalles (vista en columnas) - placeholder</div>
            )}
          </main>
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-[600px] h-[500px] rounded p-4 overflow-auto">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Subir Documentos</h2>
                <button onClick={()=> setShowUpload(false)}>X</button>
              </div>
              <div className="border-dashed border-2 border-gray-300 rounded h-48 flex items-center justify-center bg-gray-50 cursor-pointer">
                <div className="text-center">
                  <div className="text-4xl text-gray-300">☁️⬆️</div>
                  <div className="text-sm text-gray-600">Arrastra archivos aquí o haz clic para seleccionar</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-600">Opciones</div>
                <div className="mt-2 flex gap-2">
                  <Select>
                    <SelectTrigger className="h-9 w-64"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="F-LIC-001">Destino: LIC-2024-001</SelectItem>
                      <SelectItem value="F-OC">Destino: Órdenes de Compra</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Etiquetas (separadas)" />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-2">
                <Button variant="ghost" onClick={()=> setShowUpload(false)}>Cancelar</Button>
                <Button className="bg-blue-600">Subir 3 Archivos</Button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
            <div className="bg-white w-[90%] h-[90%] rounded p-3 overflow-auto">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold">{previewFile.nombre}</div>
                  <div className="text-xs text-gray-500">{fmtSize(previewFile.tamano)} • {new Date(previewFile.fechaSubida).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={previewFile.url} className="text-blue-600">⬇️ Descargar</a>
                  <button onClick={()=> setPreviewFile(null)}>Cerrar</button>
                </div>
              </div>
              <div className="h-[80%] bg-gray-800 flex items-center justify-center text-white">
                {/* simplified preview */}
                {previewFile.extension === 'pdf' ? <div>PDF Viewer placeholder</div> : <div>Vista previa no disponible. Descargue para ver.</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function FolderNode({ node, depth = 0, selected, onSelect }: { node: Folder; depth?: number; selected: string; onSelect: (id: string) => void }){
  const [open, setOpen] = useState<boolean>(node.nivel < 1);
  return (
    <div>
      <div className={`flex items-center gap-2 p-1 rounded hover:bg-gray-50 ${selected === node.id ? 'bg-blue-50 text-blue-600' : ''}`} style={{ paddingLeft: depth * 12 + 4 }}>
        <button onClick={() => setOpen(o => !o)} className="w-4">{open ? '▾' : '▸'}</button>
        <div className="text-sm flex-1" onClick={() => onSelect(node.id)}>{node.nombre} {node.cantidadArchivos ? <span className="text-xs text-gray-400">({node.cantidadArchivos})</span> : null}</div>
        <button className="text-xs text-gray-500">⋮</button>
      </div>
      {open && node.sub && (
        <div>
          {node.sub.map(s => <FolderNode key={s.id} node={s} depth={(depth||0)+1} selected={selected} onSelect={onSelect} />)}
        </div>
      )}
    </div>
  );
}
