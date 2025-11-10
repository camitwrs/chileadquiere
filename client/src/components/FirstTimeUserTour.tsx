import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

type TourStep = {
  target: string; // CSS selector or 'center'/'body'
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  width?: number;
  height?: number;
  icon?: string; // optional emoji or svg name
  highlightStyle?: React.CSSProperties;
  animate?: "pulse" | "bounce" | "none";
};

// Bump storage key so previous opt-outs (from before this change) don't hide the tour.
// New behavior: tour shows by default unless the user explicitly checks "No mostrar este tour nuevamente".
const STORAGE_KEY = "hasSeenTour_v2";

const defaultSteps: TourStep[] = [
  {
    target: "body",
    title: "¡Bienvenido a ChileAdquiere!",
    description: "Te mostraremos las funcionalidades principales en 8 pasos. Puedes saltarte este tour en cualquier momento haciendo clic en 'Saltar'.",
    position: "center",
    width: 380,
    height: 280,
    icon: "👋",
  },
  {
    target: "#sidebar",
    title: "Menú Principal",
    description: "Desde aquí accedes a todas las funcionalidades: Licitaciones, Órdenes, Proveedores, Analytics y más.",
    position: "right",
    width: 360,
    height: 200,
    highlightStyle: { borderRadius: 8 },
    animate: "pulse",
  },
  {
    target: ".topbar .bell, .icon-bell, #notifications",
    title: "Notificaciones",
    description: "Aquí recibirás alertas sobre licitaciones, órdenes y eventos importantes.",
    position: "bottom",
    width: 340,
    height: 160,
    highlightStyle: { borderRadius: 9999 },
  },
  {
    target: ".topbar .avatar, .user-avatar, #userProfile",
    title: "Tu Perfil",
    description: "Accede a tu perfil, configuración y cierra sesión aquí.",
    position: "bottom",
    width: 320,
    height: 160,
    highlightStyle: { borderRadius: 8 },
  },
  {
    target: ".dashboard .widget, .widget",
    title: "Widgets Personalizables",
    description: "Estos widgets muestran información clave. Puedes reordenarlos, minimizarlos o agregar nuevos según tus necesidades.",
    position: "right",
    width: 380,
    height: 200,
    highlightStyle: { borderRadius: 8 },
    animate: "bounce",
  },
  {
    target: ".fab, .floating-action-button, #fab",
    title: "Acciones Rápidas",
    description: "Acceso directo a las funciones más comunes como crear licitaciones u órdenes.",
    position: "left",
    width: 340,
    height: 180,
    highlightStyle: { borderRadius: 9999 },
  },
  {
    target: ".topbar .search, #globalSearch, .search-input",
    title: "Búsqueda Global",
    description: "Busca licitaciones, órdenes, proveedores y documentos desde cualquier lugar.",
    position: "bottom",
    width: 380,
    height: 140,
    highlightStyle: { borderRadius: 8 },
  },
  {
    target: "body",
    title: "¡Listo para comenzar!",
    description: "Ya conoces las funcionalidades principales. Te recomendamos explorar la documentación o contactar al equipo de soporte si tienes dudas.",
    position: "center",
    width: 400,
    height: 300,
    icon: "🚀",
  },
];

export const resetTour = () => {
  try {
    // remove both the new key and the legacy key if present
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("hasSeenTour");
  } catch {}
};

export const FirstTimeUserTour: React.FC<{ open?: boolean; steps?: TourStep[]; onClose?: () => void }> = ({ open = true, steps = defaultSteps, onClose }) => {
  const [location] = useLocation();
  // Open by default when the DashboardLayout mounts (i.e. whenever this component
  // is rendered) unless the user has already marked the tour as seen. Previously
  // this checked for a literal "/dashboard" pathname which prevented the tour
  // from showing on other dashboard routes such as `/mis-licitaciones`.
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      const seen = JSON.parse(localStorage.getItem(STORAGE_KEY) || "false");
      return open && !seen;
    } catch {
      return false;
    }
  });

  // Track previous location to detect transitions into /dashboard from outside
  const prevLocationRef = useRef<string | null>(null);
  useEffect(() => {
    try {
      const prev = prevLocationRef.current || "";
      const seen = JSON.parse(localStorage.getItem(STORAGE_KEY) || "false");
      // If we transitioned into any route rendered by DashboardLayout and the
      // tour hasn't been seen, open it. We don't rely on a literal
      // '/dashboard' prefix so pages like '/mis-licitaciones' will trigger it.
      if (prev !== location && !seen) {
        setIsOpen(true);
      }
      prevLocationRef.current = location as string;
    } catch (e) {
      // ignore
    }
  }, [location]);
  const [index, setIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [transientMsg, setTransientMsg] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number | null>(null);

  const markSeen = useCallback((value = true) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(!!value));
    } catch {}
  }, []);

  // compute highlight rect for current step
  useLayoutEffect(() => {
    if (!isOpen) return;
    const step = steps[index];
    if (!step) return setHighlightRect(null);

    if (step.target === "body" || step.target === "center") {
      setHighlightRect(null);
      // center tooltip
      setTooltipStyle({});
      return;
    }

    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) {
      setHighlightRect(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setHighlightRect(rect);
    // compute tooltip position roughly
    const spacing = 12;
    const w = step.width || 340;
    const h = step.height || 160;
    let top = 0, left = 0;
    switch (step.position) {
      case "right":
        top = rect.top + window.scrollY + (rect.height - h) / 2;
        left = rect.right + window.scrollX + spacing;
        break;
      case "left":
        top = rect.top + window.scrollY + (rect.height - h) / 2;
        left = rect.left + window.scrollX - w - spacing;
        break;
      case "top":
        top = rect.top + window.scrollY - h - spacing;
        left = rect.left + window.scrollX + (rect.width - w) / 2;
        break;
      case "bottom":
      default:
        top = rect.bottom + window.scrollY + spacing;
        left = rect.left + window.scrollX + (rect.width - w) / 2;
        break;
    }
    // ensure within viewport
    const maxLeft = window.innerWidth - w - 16;
    left = Math.max(16, Math.min(left, maxLeft));
    top = Math.max(16, Math.min(top, window.innerHeight - h - 16 + window.scrollY));
    setTooltipStyle({ position: "absolute", top: Math.round(top) + "px", left: Math.round(left) + "px", width: w, height: h });
  }, [index, isOpen, steps]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      // Escape now closes and marks the tour as seen so it doesn't reappear
      if (e.key === "Escape") {
        close(true);
        return;
      }
      if (e.key === "ArrowRight") setIndex((i) => Math.min(steps.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, steps.length]);

  // Do NOT disable body pointer-events globally. Instead we render masks around the highlight
  // so the highlighted element can still receive clicks while the rest of the UI is blocked.

  const handleMaskClick = (e: React.MouseEvent) => {
    // clicked on the dimmed mask outside the highlight
    setTransientMsg("Haz clic en el elemento destacado");
    window.clearTimeout(animRef.current ?? undefined);
    animRef.current = window.setTimeout(() => setTransientMsg(null), 2000);
  };

  const close = (doNotShowAgain = false) => {
    setIsOpen(false);
    if (doNotShowAgain) markSeen(true);
    onClose?.();
  };

  const next = () => setIndex((i) => Math.min(steps.length - 1, i + 1));
  const prev = () => setIndex((i) => Math.max(0, i - 1));

  if (!isOpen) return null;

  const step = steps[index];

  // If we have a highlightRect we set the top-level overlay to pointer-events: none
  // so clicks can pass through the 'hole' to the underlying target. Masks will
  // have pointer-events:auto to capture outside clicks. If no highlight, overlay
  // keeps pointer-events:auto to block the whole UI.
  const overlayPointerEvents = highlightRect ? 'none' : 'auto';

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50" aria-hidden style={{ pointerEvents: overlayPointerEvents }}>
      {/* dark overlay (either full or masks around highlight) */}
      {highlightRect ? (
        <>
          {/* top mask */}
          <div onClick={handleMaskClick} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: Math.max(0, highlightRect.top + window.scrollY - 6), background: 'rgba(0,0,0,0.7)', pointerEvents: 'auto' }} />
          {/* bottom mask */}
          <div onClick={handleMaskClick} style={{ position: 'absolute', top: (highlightRect.bottom + window.scrollY + 6), left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', pointerEvents: 'auto' }} />
          {/* left mask */}
          <div onClick={handleMaskClick} style={{ position: 'absolute', top: (highlightRect.top + window.scrollY - 6), left: 0, width: Math.max(0, highlightRect.left + window.scrollX - 6), height: Math.max(0, highlightRect.height + 12), background: 'rgba(0,0,0,0.7)', pointerEvents: 'auto' }} />
          {/* right mask */}
          <div onClick={handleMaskClick} style={{ position: 'absolute', top: (highlightRect.top + window.scrollY - 6), left: (highlightRect.right + window.scrollX + 6), right: 0, height: Math.max(0, highlightRect.height + 12), background: 'rgba(0,0,0,0.7)', pointerEvents: 'auto' }} />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/70 transition-opacity duration-300" onClick={handleMaskClick} />
      )}

      {/* highlight box (if any) */}
      {highlightRect && (
        <div
          className={`absolute`} 
          style={{
            top: highlightRect.top + window.scrollY - 6,
            left: highlightRect.left + window.scrollX - 6,
            width: highlightRect.width + 12,
            height: highlightRect.height + 12,
            border: "2px solid #0366CC",
            boxShadow: "0 0 0 8px rgba(3,102,204,0.12)",
            borderRadius: (step.highlightStyle && (step.highlightStyle.borderRadius as number)) ? (step.highlightStyle.borderRadius as number) : 8,
            pointerEvents: "none",
            transition: "all 400ms ease",
          }}
        >
          {/* optional animation overlay */}
          {step.animate === "pulse" && <div className="absolute inset-0 animate-pulse rounded-[inherit]" style={{ pointerEvents: 'none' }} />}
        </div>
      )}

      {/* tooltip box */}
      <div style={step.position === "center" || step.target === "body" ? { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)" } : tooltipStyle}>
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6" style={{ width: step.width || 340, height: step.height || 'auto', maxWidth: 'calc(100vw - 32px)' , pointerEvents: 'auto' }} onClick={(e)=>e.stopPropagation()}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded bg-blue-50 text-2xl">{step.icon || ""}</div>
              <div>
                <div className="text-base font-semibold text-gray-900">{step.title}</div>
                <div className="text-sm text-gray-600 mt-1">{step.description}</div>
              </div>
            </div>
              <div className="text-right">
                {/* Removed the close 'X' to force dismissal via 'Saltar Tour' or completion only */}
                <div className="text-right mt-1"><button className="text-sm text-gray-600 hover:underline" onClick={() => { close(true); }}>Saltar Tour</button></div>
              </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
              <button onClick={prev} className={`px-3 h-9 rounded ${index===0 ? 'text-gray-400 border border-gray-200 bg-white' : 'text-gray-700 border border-gray-200 bg-white hover:bg-gray-50'}`}> &lt; Anterior</button>
              <div className="text-sm text-gray-600">{index + 1}/{steps.length}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2 items-center">
                {steps.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded ${i < index ? 'bg-blue-300' : i === index ? 'bg-blue-600' : 'border border-gray-300'}`} />
                ))}
              </div>
              <button
                onClick={() => {
                  if (index === steps.length - 1) {
                    // finishing the tour: mark as seen so it won't reappear
                    close(true);
                  } else {
                    next();
                  }
                }}
                className="px-4 h-9 bg-blue-600 text-white rounded"
              >
                {index === steps.length - 1 ? "Terminar" : "Siguiente \u003e"}
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <label className="text-sm text-gray-600"><input type="checkbox" className="mr-2" onChange={(e)=>{ if (e.target.checked) markSeen(true); }} />No mostrar este tour nuevamente</label>
            <div className="text-sm">
              <button className="text-sm text-blue-600 hover:underline mr-3" onClick={()=>{ if (index === 0) setIndex(steps.length - 1); else setIndex(0); }}>
                {index === 0 ? 'Ir al final' : 'Volver al Paso 1'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* transient message when clicking outside */}
      {transientMsg && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 bg-black text-white text-sm px-4 py-2 rounded">{transientMsg}</div>
      )}
    </div>
  );
};

export default FirstTimeUserTour;
