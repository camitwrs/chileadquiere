import { useState } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Users,
  BarChart3,
  MessageSquare,
  FolderOpen,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Building2,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VITE_APP_LOGO } from "@/const";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: any;
  label: string;
  href: string;
  badge?: number;
  group?: "main" | "secondary" | "bottom";
}

function buildMenuItems(role: string | undefined): MenuItem[] {
  // Default to comprador if role unknown
  const r = role || "comprador";
  if (r === "proveedor") {
    return [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", group: "main" },
      { icon: FileText, label: "Buscar Oportunidades", href: "/oportunidades", group: "main" },
      { icon: ShoppingCart, label: "Mis Ofertas", href: "/mis-ofertas", group: "main" },
      { icon: Users, label: "Órdenes Recibidas", href: "/ordenes-recibidas", group: "main" },
      { icon: Building2, label: "Mi Empresa", href: "/mi-empresa", group: "main" },
      { icon: DollarSign, label: "Facturación e Ingresos", href: "/facturacion", group: "main" },
      { icon: BarChart3, label: "Estadísticas", href: "/estadisticas", group: "main" },
      { icon: MessageSquare, label: "Mensajes", href: "/mensajes", badge: 5, group: "secondary" },
      { icon: FolderOpen, label: "Documentos", href: "/documentos", group: "secondary" },
      { icon: Users, label: "Mi Perfil", href: "/mi-perfil", group: "secondary" },
      { icon: Settings, label: "Configuración", href: "/configuracion", group: "secondary" },
      { icon: HelpCircle, label: "Ayuda y Soporte", href: "/ayuda", group: "secondary" },
    ];
  }

  // comprador (default) and administrador can use buyer menu for now
  return [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", group: "main" },
    { icon: FileText, label: "Mis Licitaciones", href: "/mis-licitaciones", group: "main" },
    { icon: ShoppingCart, label: "Órdenes de Compra", href: "/ordenes", group: "main" },
    { icon: Users, label: "Proveedores", href: "/proveedores", group: "main" },
    { icon: BarChart3, label: "Analytics", href: "/analytics", group: "main" },
    { icon: MessageSquare, label: "Mensajes", href: "/mensajes", badge: 5, group: "secondary" },
    { icon: FolderOpen, label: "Documentos", href: "/documentos", group: "secondary" },
    { icon: Users, label: "Mi Perfil", href: "/mi-perfil", group: "secondary" },
    { icon: Settings, label: "Configuración", href: "/configuracion", group: "secondary" },
    { icon: HelpCircle, label: "Ayuda y Soporte", href: "/ayuda", group: "secondary" },
  ];
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { logout, user } = useAuth();
  const menuItems = buildMenuItems(user?.rol);
  const [location, setLocation] = useLocation();
  const [activeItem, setActiveItem] = useState(location);

  const mainItems = menuItems.filter((item) => item.group === "main");
  const secondaryItems = menuItems.filter((item) => item.group === "secondary");

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b flex flex-row  items-center border-border">
        <img src={VITE_APP_LOGO} alt="ChileAdquiere" className="h-10 w-auto mb-2 " />
        <p className="text-lg font-black tracking-tight text-foreground ml-2">ChileAdquiere</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Main Group */}
        <div className="px-3 space-y-1">
          {mainItems.map((item) => (
            <button
              key={item.href}
              onClick={() => {
                setActiveItem(item.href);
                setLocation(item.href);
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                activeItem === item.href
                  ? "bg-blue-100 text-blue-600 border-l-3 border-blue-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="default" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="my-4 mx-3 border-t border-border" />

        {/* Secondary Group */}
        <div className="px-3 space-y-1">
          {secondaryItems.map((item) => (
            <button
              key={item.href}
              onClick={() => {
                setActiveItem(item.href);
                setLocation(item.href);
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                activeItem === item.href
                  ? "bg-blue-100 text-blue-600 border-l-3 border-blue-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="default" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Separator before Logout */}
        <div className="my-4 mx-3 border-t border-border" />

        {/* Logout */}
        <div className="px-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Salir
          </Button>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-2">
          <p className="font-medium">v2.1.0</p>
          <div className="flex gap-2">
            <a href="#" className="hover:text-primary transition-colors">
              Términos
            </a>
            <span>|</span>
            <a href="#" className="hover:text-primary transition-colors">
              Privacidad
            </a>
          </div>
          <p>© 2025 ChileAdquiere</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[220px] bg-background border-r border-border flex-col transition-all duration-300">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-150"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer */}
          <aside
            className="lg:hidden fixed left-0 top-0 bottom-0 w-[85vw] max-w-[280px] bg-background border-r border-border z-50 flex flex-col transition-transform duration-300"
            style={{ transform: isOpen ? "translateX(0)" : "translateX(-100%)" }}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
