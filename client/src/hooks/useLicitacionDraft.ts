import { useCallback, useState, useEffect } from "react";

export interface Licitacion {
  // Step 1: Información General
  id: string;
  titulo: string;
  descripcion: string;
  rubro: string;
  tipoLicitacion: "abierta" | "cerrada" | "inversa" | "quick";
  proveedoresInvitados?: number;
  organismo: string;
  unidadResponsable: string;
  responsableId: string;

  // Step 2: Especificaciones
  especificaciones: Array<{
    especificacion: string;
    valor: string;
    unidad: string;
  }>;
  anexos: Array<{
    nombre: string;
    url: string;
    tipo: string;
    tamano: number;
    fecha: string;
  }>;
  imagenes: Array<{
    url: string;
    nombre: string;
  }>;

  // Step 3: Montos y Términos
  presupuestoBase: number;
  presupuestoMaximo: number;
  variacionPermitida: number;
  modalidadPago: "contado" | "30dias" | "60dias" | "personalizado";
  diasPago?: number;
  otrosTerminos?: string;
  
  garantias: {
    seriedadOferta: boolean;
    seriedadOfertaPorcentaje?: number;
    fielCumplimiento: boolean;
    fielCumplimientoPorcentaje?: number;
    anticipo: boolean;
    anticipoPorcentaje?: number;
    otras: boolean;
    otrasDescripcion?: string;
  };

  plazoValidez: number;
  formasPago: Array<"transferencia" | "cheque" | "efectivo" | "tarjeta">;

  // Step 4: Fechas y Plazos
  fechaPublicacion: Date;
  fechaCierre: Date;
  fechaEvaluacion?: Date;
  fechaAdjudicacion?: Date;
  horarioAtencion: {
    inicio: string;
    fin: string;
  };
  hitos: Array<{
    nombre: string;
    fecha: Date;
    hora: string;
  }>;

  // Step 5: Evaluación
  tipoEvaluacion: "automatica" | "puntaje" | "mixta" | "custom";
  criterios?: Array<{
    criterio: string;
    ponderacion: number;
    minimo: number;
    maximo: number;
    automatico: boolean;
  }>;
  criterioDesempate: "precio" | "orden" | "sorteo" | "manual";
  requisitosMinimos: Array<{
    requisito: string;
    descripcion: string;
    puntajeMinimo: number | "obligatorio";
  }>;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  estado: "borrador" | "publicada" | "cerrada" | "adjudicada" | "anulada";
}

export function useLicitacionDraft() {
  // Start with empty draft to avoid blocking the main thread during initial render.
  // We will lazy-load the stored draft in an effect so heavy JSON.parse work does not freeze navigation.
  const [draft, setDraft] = useState<Partial<Licitacion>>({});

  useEffect(() => {
    // Try to use requestIdleCallback to parse large drafts off critical path when available.
    const load = () => {
      try {
        const saved = localStorage.getItem("licitacionDraft");
        if (saved) {
          const parsed = JSON.parse(saved);
          // Convert date strings back to Date objects
          if (parsed.fechaPublicacion) parsed.fechaPublicacion = new Date(parsed.fechaPublicacion);
          if (parsed.fechaCierre) parsed.fechaCierre = new Date(parsed.fechaCierre);
          if (parsed.fechaEvaluacion) parsed.fechaEvaluacion = new Date(parsed.fechaEvaluacion);
          if (parsed.fechaAdjudicacion) parsed.fechaAdjudicacion = new Date(parsed.fechaAdjudicacion);
          if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
          if (parsed.updatedAt) parsed.updatedAt = new Date(parsed.updatedAt);
          if (parsed.hitos) {
            parsed.hitos = parsed.hitos.map((h: any) => ({
              ...h,
              fecha: new Date(h.fecha)
            }));
          }
          setDraft(parsed);
        }
      } catch (e) {
        console.error("Error loading draft:", e);
      }
    };

    if (typeof (window as any).requestIdleCallback === 'function') {
      const id = (window as any).requestIdleCallback(load, { timeout: 2000 });
      return () => (window as any).cancelIdleCallback?.(id);
    }
    const t = setTimeout(load, 50);
    return () => clearTimeout(t);
  }, []);

  const updateDraft = useCallback((updates: Partial<Licitacion>) => {
    setDraft(prev => {
      const newDraft = {
        ...prev,
        ...updates,
        updatedAt: new Date()
      };
      return newDraft;
    });
  }, []);

  // Persist draft to localStorage with debounce to avoid expensive sync JSON operations on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("licitacionDraft", JSON.stringify(draft));
      } catch (e) {
        console.error("Error saving draft:", e);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [draft]);

  return {
    draft,
    updateDraft,
  };
}