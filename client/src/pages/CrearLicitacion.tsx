import DashboardLayout from "@/components/dashboard/DashboardLayout";
import React, { useState, useEffect } from "react";

interface Paso {
  id: string;
  titulo: string;
  descripcion: string;
}

const PASOS: Paso[] = [
  { id: "informacion", titulo: "Información General", descripcion: "Datos básicos de la licitación" },
  { id: "especificaciones", titulo: "Especificaciones", descripcion: "Detalles técnicos y anexos" },
  { id: "montos", titulo: "Montos", descripcion: "Presupuesto y condiciones" },
  { id: "cronograma", titulo: "Cronograma", descripcion: "Fechas y plazos" },
  { id: "criterios", titulo: "Criterios de Evaluación", descripcion: "Parámetros de selección" },
  { id: "revision", titulo: "Revisión Final", descripcion: "Verificar y publicar" },
];

export default function CrearLicitacion() {
  const [pasoActual, setPasoActual] = useState(0);
  const [borrador, setBorrador] = useState<any>(() => {
    const guardado = localStorage.getItem("licitacionDraft");
    return guardado ? JSON.parse(guardado) : {};
  });
  const [validez, setValidez] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  // show a brief "saving" indicator whenever draft changes (frontend-only visual)
  useEffect(() => {
    if (!borrador) return;
    setIsSaving(true);
    const t = setTimeout(() => setIsSaving(false), 800);
    return () => clearTimeout(t);
  }, [borrador]);

  // Guardado automático
  useEffect(() => {
    localStorage.setItem("licitacionDraft", JSON.stringify(borrador));
  }, [borrador]);

  // Validación progresiva
  const actualizarCampo = (campo: string, valor: any) => {
    setBorrador((prev: any) => ({ ...prev, [campo]: valor }));
  };

  const marcarValido = (idPaso: string, esValido: boolean) => {
    setValidez((prev) => ({ ...prev, [idPaso]: esValido }));
  };

  const todosValidos = Object.values(validez).every(Boolean);

  // Render dinámico de cada paso
  const renderPaso = () => {
    switch (pasoActual) {
      case 0:
        return (
          <section>
            <h3 className="text-lg font-medium mb-4">Información General</h3>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Título de la licitación"
              value={borrador.titulo || ""}
              onChange={(e) => actualizarCampo("titulo", e.target.value)}
            />
            <input
              className="border p-2 w-full mb-2"
              placeholder="Rubro o categoría"
              value={borrador.rubro || ""}
              onChange={(e) => actualizarCampo("rubro", e.target.value)}
            />
            <button
              onClick={() => marcarValido("informacion", Boolean(borrador.titulo && borrador.rubro))}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Validar
            </button>
          </section>
        );

      case 1:
        return (
          <section>
            <h3 className="text-lg font-medium mb-4">Especificaciones Técnicas</h3>
            <textarea
              className="border p-2 w-full h-32 mb-2"
              placeholder="Descripción de requerimientos..."
              value={borrador.especificaciones || ""}
              onChange={(e) => actualizarCampo("especificaciones", e.target.value)}
            />
            <button
              onClick={() => marcarValido("especificaciones", Boolean(borrador.especificaciones))}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Validar
            </button>
          </section>
        );

      case 2:
        return (
          <section>
            <h3 className="text-lg font-medium mb-4">Montos</h3>
            <input
              type="number"
              className="border p-2 w-full mb-2"
              placeholder="Presupuesto base"
              value={borrador.presupuestoBase || ""}
              onChange={(e) => actualizarCampo("presupuestoBase", Number(e.target.value))}
            />
            <input
              type="number"
              className="border p-2 w-full mb-2"
              placeholder="Presupuesto máximo"
              value={borrador.presupuestoMaximo || ""}
              onChange={(e) => actualizarCampo("presupuestoMaximo", Number(e.target.value))}
            />
            <button
              onClick={() => marcarValido("montos", Boolean(borrador.presupuestoBase && borrador.presupuestoMaximo))}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Validar
            </button>
          </section>
        );

      case 3:
        return (
          <section>
            <h3 className="text-lg font-medium mb-4">Cronograma</h3>
            <input
              type="date"
              className="border p-2 w-full mb-2"
              value={borrador.fechaPublicacion || ""}
              onChange={(e) => actualizarCampo("fechaPublicacion", e.target.value)}
            />
            <input
              type="date"
              className="border p-2 w-full mb-2"
              value={borrador.fechaCierre || ""}
              onChange={(e) => actualizarCampo("fechaCierre", e.target.value)}
            />
            <button
              onClick={() =>
                marcarValido("cronograma", Boolean(borrador.fechaPublicacion && borrador.fechaCierre))
              }
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Validar
            </button>
          </section>
        );

      case 4:
        return (
          <section>
            <h3 className="text-lg font-medium mb-4">Criterios de Evaluación</h3>
            <textarea
              className="border p-2 w-full h-32 mb-2"
              placeholder="Ej: Experiencia, Precio, Plazo..."
              value={borrador.criterios || ""}
              onChange={(e) => actualizarCampo("criterios", e.target.value)}
            />
            <button
              onClick={() => marcarValido("criterios", Boolean(borrador.criterios))}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Validar
            </button>
          </section>
        );

      case 5:
        return (
          <section>
            <h3 className="text-lg font-medium mb-4">Revisión Final</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 border rounded">
                <h4 className="font-semibold mb-1">Información General</h4>
                <p><strong>Título:</strong> {borrador.titulo || "—"}</p>
                <p><strong>Rubro:</strong> {borrador.rubro || "—"}</p>
              </div>
              <div className="p-4 border rounded">
                <h4 className="font-semibold mb-1">Cronograma</h4>
                <p><strong>Publicación:</strong> {borrador.fechaPublicacion || "—"}</p>
                <p><strong>Cierre:</strong> {borrador.fechaCierre || "—"}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => alert("Borrador guardado")}
                className="px-3 py-1 border rounded"
              >
                Guardar como Borrador
              </button>
              <button
                disabled={!todosValidos}
                onClick={() => alert("Publicación confirmada")}
                className={`px-3 py-1 rounded text-white ${
                  todosValidos ? "bg-green-600" : "bg-gray-400"
                }`}
              >
                Publicar Licitación
              </button>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>

    

    <main className="max-w-4xl mx-auto p-6">
      {/* Stepper */}
      <div className="flex justify-between mb-8">
        {PASOS.map((p, i) => (
          <div
            key={p.id}
            className={`flex-1 text-center cursor-pointer ${
              i === pasoActual ? "font-bold text-blue-700" : "text-gray-500"
            }`}
            onClick={() => i <= pasoActual && setPasoActual(i)}
          >
            <div className="text-sm">{p.titulo}</div>
            <div className="text-xs">{validez[p.id] ? "✅" : "⬜"}</div>
          </div>
        ))}
      </div>

      {/* Contenido */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">{renderPaso()}</div>

          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
              <h3 className="text-lg font-medium">Resumen rápido</h3>
              <div className="text-sm text-slate-700">
                <div className="mb-2">
                  <div className="text-xs text-slate-500">Título</div>
                  <div className="font-medium">{borrador?.titulo || <span className="text-slate-400">(vacío)</span>}</div>
                </div>

                <div className="mb-2">
                  <div className="text-xs text-slate-500">Organismo</div>
                  <div className="font-medium">{borrador?.organismo || <span className="text-slate-400">(vacío)</span>}</div>
                </div>

                <div className="mb-2">
                  <div className="text-xs text-slate-500">Rubro</div>
                  <div className="font-medium">{borrador?.rubro || <span className="text-slate-400">(vacío)</span>}</div>
                </div>

                <div className="mb-2">
                  <div className="text-xs text-slate-500">Tipo</div>
                  <div className="font-medium">{(borrador?.tipoLicitacion as string) || <span className="text-slate-400">(vacío)</span>}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="text-xs text-slate-500 mb-2">Progreso</div>
                <div className="w-full bg-gray-100 rounded h-2">
                  <div className="h-2 bg-blue-500 rounded" style={{ width: `${Math.round(((pasoActual + 1) / PASOS.length) * 100)}%` }} />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button onClick={() => setPasoActual((p) => Math.max(0, p - 1))} className="px-3 py-1 border rounded">
                  Volver
                </button>
                <button onClick={() => setBorrador(borrador)} className="px-3 py-1 border rounded">
                  Guardar borrador
                </button>
              </div>
            </div>
          </aside>
        </div>

      {/* Controles */}
      <div className="flex justify-between mt-6">
        <button
          disabled={pasoActual === 0}
          onClick={() => setPasoActual((p) => Math.max(0, p - 1))}
          className="px-3 py-1 border rounded"
        >
          Anterior
        </button>
        {pasoActual < PASOS.length - 1 && (
          <button
            disabled={validez[PASOS[pasoActual].id] === false}
            onClick={() => setPasoActual((p) => p + 1)}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Siguiente
          </button>
        )}
      </div>
    </main>
    </DashboardLayout>
  );
}
