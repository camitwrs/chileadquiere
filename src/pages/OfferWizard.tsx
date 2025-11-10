import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useRoute, useLocation } from "wouter";

type OfferDraft = {
  id: string;
  licitacionId: string;
  proveedorId: string;
  estado: "borrador" | "enviada" | "evaluacion" | "adjudicada" | "rechazada";
  infoBasica: any;
  ofertaEconomica: any;
  propuestaTecnica: any;
  documentos: any[];
  fechaCreacion: string;
  fechaEnvio: string | null;
  fechaModificacion: string;
};

const mockLicitacion = {
  id: "LIC-2024-001",
  titulo: "Suministro de Equipos de Oficina",
  presupuestoBase: 5000000,
  presupuestoMax: 6000000,
  fechaCierre: "2024-11-15T18:00:00",
};

function formatMoney(n: number) {
  return "$ " + n.toLocaleString("es-CL");
}

function generateOfferId(licitacionId = "LIC-2024-001", providerId = "PROV-001") {
  const ts = new Date().toISOString().slice(0,10).replace(/-/g,'');
  return `OFE-${ts}-${providerId}-001`;
}

export default function OfferWizard() {
  const [match, params] = useRoute("/ofertas/nueva-oferta/:licitacionId");
  const [, setLocation] = useLocation();
  const licId = params?.licitacionId ?? undefined;
  const lic = useMemo(() => (licId ? { ...mockLicitacion, id: licId } : mockLicitacion), [licId]);

  const { user } = useAuth();

  // wizard state
  const [step, setStep] = useState(1);

  const baseOfferId = useMemo(() => generateOfferId(lic.id, user?.id ?? 'PROV-001'), [lic.id, user]);

  const [draft, setDraft] = useState<OfferDraft>(() => {
    const key = `oferta_draft_${licId || mockLicitacion.id}`;
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved) as OfferDraft;
    const now = new Date().toISOString();
    return {
      id: baseOfferId,
      licitacionId: licId ?? mockLicitacion.id,
      proveedorId: user?.id ?? 'PROV-001',
      estado: 'borrador',
      infoBasica: {
        titulo: `Propuesta Suministro Equipos Oficina - ${user?.nombre ?? 'TechSupply'}`,
        representante: {
          nombre: user ? `${user.nombre} ${user.apellido}` : '',
          rut: '',
          email: user?.email ?? '',
          telefono: '',
        },
        contacto: { nombre: '', cargo: '', email: '', telefono: '', horario: '' },
        validezDias: 30,
        fechaInicio: new Date().toISOString().slice(0,10),
        fechaVencimiento: '',
        moneda: 'CLP',
        tipoCambio: '',
        incluyeIva: true,
      },
      ofertaEconomica: { montoTotal: 0, desglose: [] },
      propuestaTecnica: { specs: [], adicionales: '', garantiaMeses: 12 },
      documentos: [],
      fechaCreacion: now,
      fechaEnvio: null,
      fechaModificacion: now,
    };
  });

  // autosave draft every 30s
  useEffect(() => {
    const key = `oferta_draft_${licId || mockLicitacion.id}`;
    const handler = setInterval(() => {
      localStorage.setItem(key, JSON.stringify(draft));
      // a subtle visual feedback would be implemented in real UI
      console.debug('Draft autosaved', key);
    }, 30000);
    return () => clearInterval(handler);
  }, [draft, licId]);

  // save on step change
  useEffect(() => {
    const key = `oferta_draft_${licId || mockLicitacion.id}`;
    localStorage.setItem(key, JSON.stringify(draft));
  }, [step]);

  function updateInfo(path: string, value: any) {
    setDraft(prev => {
      const next = { ...prev, infoBasica: { ...prev.infoBasica } } as OfferDraft;
      // naive path assign: 'representante.email'
      const parts = path.split('.');
      let cur: any = next.infoBasica;
      for (let i = 0; i < parts.length - 1; i++) {
        cur = cur[parts[i]] = { ...cur[parts[i]] };
      }
      cur[parts[parts.length - 1]] = value;
      next.fechaModificacion = new Date().toISOString();
      return next;
    });
  }

  function saveDraftNow() {
    const key = `oferta_draft_${licId || mockLicitacion.id}`;
    localStorage.setItem(key, JSON.stringify(draft));
    // small feedback
    alert('Borrador guardado');
  }

  function canProceedStep1() {
    const ib = draft.infoBasica;
    if (!ib.titulo) return false;
    if (!ib.representante?.nombre) return false;
    if (!ib.representante?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ib.representante.email)) return false;
    if (!ib.contacto?.nombre) return false;
    if (!ib.contacto?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ib.contacto.email)) return false;
    return true;
  }

  function next() {
    if (step === 1 && !canProceedStep1()) return;
    setStep(s => Math.min(5, s + 1));
  }

  function prev() {
    setStep(s => Math.max(1, s - 1));
  }

  function submitOffer() {
    // simulate send
    const now = new Date().toISOString();
    const sent = { ...draft, estado: 'enviada' as const, fechaEnvio: now };
    const sentKey = `oferta_sent_${sent.id}`;
    localStorage.setItem(sentKey, JSON.stringify(sent));
    // remove draft
    const draftKey = `oferta_draft_${licId || mockLicitacion.id}`;
    localStorage.removeItem(draftKey);
    setLocation(`/ofertas/exito/${sent.id}`);
  }

  // compute fechaVencimiento
  useEffect(() => {
    const ib = draft.infoBasica;
    try {
      const inicio = new Date(ib.fechaInicio);
      inicio.setDate(inicio.getDate() + Number(ib.validezDias || 0));
      const iso = inicio.toISOString().slice(0,10);
      setDraft(prev => ({ ...prev, infoBasica: { ...prev.infoBasica, fechaVencimiento: iso }, fechaModificacion: new Date().toISOString() }));
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto">
        {/* Stepper */}
        <div className="flex items-center gap-3 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex-1 text-center py-2 rounded ${step === i+1 ? 'bg-blue-600 text-white' : step > i+1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>Paso {i+1}</div>
          ))}
        </div>

        {/* Header licitación */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-600">ID Licitación: {lic.id}</div>
              <div className="text-lg font-bold">{lic.titulo}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Cierra en:</div>
              <div className="text-lg font-semibold">{/* simple diff */}{Math.max(0, Math.ceil((new Date(lic.fechaCierre).getTime() - Date.now())/(24*3600*1000)))} días</div>
            </div>
          </div>
        </Card>

        {/* Wizard content */}
        <Card className="p-6 mb-4">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold">Datos Básicos de tu Oferta <span className="text-sm text-gray-500">(Paso 1 de 5)</span></h2>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-600">ID Oferta</label>
                  <div className="flex items-center gap-3 mt-1">
                    <Input value={draft.id} readOnly />
                    <Button variant="outline" onClick={() => { navigator.clipboard?.writeText(draft.id); alert('ID copiado'); }}>Copiar</Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">Título de tu Oferta*</label>
                  <Input placeholder={`Propuesta Suministro Equipos Oficina - ${user?.nombre ?? 'TechSupply'}`} maxLength={100} value={draft.infoBasica.titulo} onChange={(e: any) => updateInfo('titulo', e.target.value)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Representante Legal*</label>
                    <Input placeholder="Nombre completo" value={draft.infoBasica.representante.nombre} onChange={(e:any) => updateInfo('representante.nombre', e.target.value)} />
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Input placeholder="RUT" value={draft.infoBasica.representante.rut} onChange={(e:any)=> updateInfo('representante.rut', e.target.value) } />
                      <Input placeholder="Email" value={draft.infoBasica.representante.email} onChange={(e:any)=> updateInfo('representante.email', e.target.value) } />
                    </div>
                    <div className="mt-2">
                      <Input placeholder="Teléfono" value={draft.infoBasica.representante.telefono} onChange={(e:any)=> updateInfo('representante.telefono', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Contacto Comercial*</label>
                    <Input placeholder="Nombre completo" value={draft.infoBasica.contacto.nombre} onChange={(e:any)=> updateInfo('contacto.nombre', e.target.value)} />
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Input placeholder="Cargo" value={draft.infoBasica.contacto.cargo} onChange={(e:any)=> updateInfo('contacto.cargo', e.target.value)} />
                      <Input placeholder="Email" value={draft.infoBasica.contacto.email} onChange={(e:any)=> updateInfo('contacto.email', e.target.value)} />
                    </div>
                    <div className="mt-2">
                      <Input placeholder="Teléfono directo" value={draft.infoBasica.contacto.telefono} onChange={(e:any)=> updateInfo('contacto.telefono', e.target.value)} />
                      <Input placeholder="Horario disponibilidad" className="mt-2" value={draft.infoBasica.contacto.horario} onChange={(e:any)=> updateInfo('contacto.horario', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium">¿Por cuántos días es válida tu oferta?*</label>
                    <Input type="number" min={30} max={365} value={draft.infoBasica.validezDias} onChange={(e:any)=> updateInfo('validezDias', Number(e.target.value || 0))} />
                    <div className="text-xs text-gray-500 mt-1">Mínimo requerido: 30 días</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Fecha inicio*</label>
                    <Input type="date" value={draft.infoBasica.fechaInicio} onChange={(e:any)=> updateInfo('fechaInicio', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Fecha vencimiento</label>
                    <Input readOnly value={draft.infoBasica.fechaVencimiento || ''} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Moneda*</label>
                    <select className="w-full border rounded px-2 py-2" value={draft.infoBasica.moneda} onChange={(e:any)=> updateInfo('moneda', e.target.value)}>
                      <option>CLP</option>
                      <option>USD</option>
                      <option>EUR</option>
                    </select>
                  </div>
                  {draft.infoBasica.moneda !== 'CLP' && (
                    <div>
                      <label className="block text-sm font-medium">Tipo cambio referencia</label>
                      <Input value={draft.infoBasica.tipoCambio} onChange={(e:any)=> updateInfo('tipoCambio', e.target.value)} />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium">Incluye IVA*</label>
                    <div className="mt-2 flex gap-2">
                      <label className={`px-3 py-2 rounded border ${draft.infoBasica.incluyeIva ? 'bg-blue-600 text-white' : ''}`} onClick={() => updateInfo('incluyeIva', true)}>Sí</label>
                      <label className={`px-3 py-2 rounded border ${!draft.infoBasica.incluyeIva ? 'bg-blue-600 text-white' : ''}`} onClick={() => updateInfo('incluyeIva', false)}>No</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold">Propuesta Económica <span className="text-sm text-gray-500">(Paso 2 de 5)</span></h2>
              <div className="mt-4">
                <div className="p-4 bg-blue-50 rounded">
                  <div className="text-sm text-gray-600">Presupuesto referencial: {formatMoney(lic.presupuestoBase)}</div>
                  <div className="text-sm text-gray-600">Presupuesto máximo: {formatMoney(lic.presupuestoMax)}</div>
                  <div className="text-xs text-red-600 mt-2">Tu oferta debe estar dentro del rango para ser considerada</div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium">Monto Total de tu Oferta*</label>
                  <Input placeholder="$ 0" value={draft.ofertaEconomica.montoTotal} onChange={(e:any) => setDraft(prev => ({ ...prev, ofertaEconomica: { ...prev.ofertaEconomica, montoTotal: Number(e.target.value || 0) } }))} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold">Propuesta Técnica y Especificaciones <span className="text-sm text-gray-500">(Paso 3 de 5)</span></h2>
              <div className="mt-4">
                <label className="block text-sm font-medium">Cumplimiento Especificaciones</label>
                <div className="mt-2 text-sm text-gray-600">Aquí puedes marcar las especificaciones y describir tu propuesta (placeholder)</div>
                <Textarea className="mt-2" placeholder="Describe tu cumplimiento técnico..." value={draft.propuestaTecnica.adicionales} onChange={(e:any)=> setDraft(prev => ({ ...prev, propuestaTecnica: { ...prev.propuestaTecnica, adicionales: e.target.value } }))} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold">Documentos Legales y Certificaciones <span className="text-sm text-gray-500">(Paso 4 de 5)</span></h2>
              <div className="mt-4 text-sm text-gray-600">Sube los documentos obligatorios (placeholder)</div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-xl font-bold">Revisión Final de tu Oferta <span className="text-sm text-gray-500">(Paso 5 de 5)</span></h2>
              <div className="mt-4 space-y-3">
                <Card className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">ID Oferta</div>
                      <div className="font-semibold">{draft.id}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Monto</div>
                      <div className="font-semibold">{formatMoney(draft.ofertaEconomica.montoTotal || 0)}</div>
                    </div>
                  </div>
                </Card>

                <label className="flex items-center gap-2"><input type="checkbox" /> Declaro bajo juramento que la información es veraz</label>
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-3">
              <Button variant="outline" onClick={prev} disabled={step === 1}>Anterior</Button>
              <Button variant="secondary" onClick={saveDraftNow}>Guardar Borrador</Button>
            </div>
            <div className="flex gap-3">
              {step < 5 ? (
                <Button onClick={next} disabled={step === 1 && !canProceedStep1()}>Siguiente</Button>
              ) : (
                <Button onClick={() => { if (confirm('¿Confirmar envío de oferta?')) submitOffer(); }} className="bg-green-600 text-white">Enviar Oferta</Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
