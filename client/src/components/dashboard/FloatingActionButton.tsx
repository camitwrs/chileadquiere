import { useState } from "react";
import { useLocation } from "wouter";
import {
  Plus,
  FileText,
  ShoppingCart,
  Users,
  HelpCircle,
  Search,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QuickAction {
  icon: any;
  label: string;
  onClick: () => void;
}

// ✅ getQuickActionsByRole ahora recibe setLocation correctamente
const getQuickActionsByRole = (
  role: UserRole,
  setLocation: (path: string) => void
): QuickAction[] => {
  const actionsByRole: Record<UserRole, QuickAction[]> = {
    comprador: [
      {
        icon: FileText,
        label: "Nueva Licitación",
        onClick: () => {
          setLocation("/mis-licitaciones/nueva-licitacion");
      
        },
      },
      {
        icon: ShoppingCart,
        label: "Nueva Orden",
        onClick: () => toast.info("Abriendo formulario de nueva orden..."),
      },
      {
        icon: Users,
        label: "Nuevo Proveedor",
        onClick: () => toast.info("Abriendo registro de proveedor..."),
      },
      {
        icon: HelpCircle,
        label: "Ayuda",
        onClick: () => toast.info("Abriendo centro de ayuda..."),
      },
    ],
    proveedor: [
     
      {
        icon: ClipboardList,
        label: "Nueva Oferta",
        onClick: () => setLocation("/ofertas/nueva-oferta"),
      },
      {
        icon: FileText,
        label: "Subir Documento",
        onClick: () => toast.info("Abriendo gestor de documentos..."),
      },
      {
        icon: HelpCircle,
        label: "Ayuda",
        onClick: () => toast.info("Abriendo centro de ayuda..."),
      },
    ],
    administrador: [
      {
        icon: Users,
        label: "Nuevo Usuario",
        onClick: () => toast.info("Abriendo formulario de usuario..."),
      },
      {
        icon: FileText,
        label: "Nuevo Reporte",
        onClick: () => toast.info("Abriendo generador de reportes..."),
      },
      {
        icon: HelpCircle,
        label: "Ayuda",
        onClick: () => toast.info("Abriendo centro de ayuda..."),
      },
    ],
  };

  return actionsByRole[role] || [];
};

export default function FloatingActionButton() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  // ✅ obtener role con fallback seguro
  const role: UserRole = (user.rol as UserRole) || "comprador";

  // ✅ pasar setLocation correctamente
  const quickActions = getQuickActionsByRole(role, setLocation);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Quick Actions */}
      <div
        className={cn(
          "absolute bottom-16 right-0 flex flex-col-reverse gap-3 transition-all duration-300",
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {quickActions.map((action, index) => (
          <div
            key={index}
            className="flex items-center gap-3 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="bg-background border border-border px-3 py-2 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap">
              {action.label}
            </span>
            <Button
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg"
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
            >
              <action.icon className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        id="fab"
        size="icon"
        className={cn(
          "fab floating-action-button h-14 w-14 rounded-full shadow-xl transition-transform",
          isOpen && "rotate-45"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
