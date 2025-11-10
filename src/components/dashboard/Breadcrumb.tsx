import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb() {
  const [location] = useLocation();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = location.split("/").filter(Boolean);
    
    // Always start with Dashboard
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Dashboard", href: "/dashboard" }
    ];

    // Map routes to breadcrumb labels
    const routeMap: Record<string, string> = {
      oportunidades: "Oportunidades ", // Licitaciones para Proveedor
      "mis-licitaciones": "Licitaciones", // Licitaciones para Comprador
      ordenes: "Órdenes de Compra",

      proveedores: "Proveedores",
      analytics: "Analytics",
      mensajes: "Mensajes",
      documentos: "Documentos",
      "mis-documentos": "Documentos",
      configuracion: "Configuración",
      ayuda: "Ayuda",
      perfil: "Mi Perfil",
      gestion: "Gestión",
      facturacion: "Facturación e Ingresos",
      // Nuevas etiquetas específicas para consistencia
      "nueva-licitacion": "Nueva Licitación", // Usada bajo /mis-licitaciones
      "nueva-oferta": "Nueva Oferta", 
      "ordenes-recibidas": "Órdenes Recibidas",
      "mis-ofertas": "Ofertas",
      "mi-empresa": "Mi Empresa",
      estadisticas: "Estadísticas",
      "mi-perfil": "Mi Perfil",


    };

    let currentPath = "";
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      // Skip dashboard as it's already added
      if (path === "dashboard") return;

      let label = routeMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
      
      // Ajuste para rutas de parámetros como /licitaciones/:tab
      if (index === paths.length - 1 && paths[index - 1] === 'licitaciones' && !routeMap[path]) {
        // Asume que el último segmento es un tab (e.g., abiertas, cerradas) si el anterior es 'licitaciones'
        label = path.charAt(0).toUpperCase() + path.slice(1);
        breadcrumbs.push({ label: label, href: currentPath });
        return;
      }

      // CAMBIO: Si estamos en /mis-licitaciones/nueva, aseguramos el breadcrumb correcto
      if (path === "nueva" && paths[index - 1] === "mis-licitaciones") {
         label = routeMap[path]; // Usa 'Nueva Licitación'
      } else if (path === "mis-licitaciones") {
         label = routeMap[path]; // Usa 'Mis Licitaciones'
      }
      

      breadcrumbs.push({
        label: label,
        // Solo el último elemento no debe tener un href
        href: index < paths.length - 1 || path === "mis-licitaciones" ? currentPath : undefined,
      });
    });

    return breadcrumbs.filter(b => b.label); // Filtra por si alguna etiqueta está vacía
  };

  const breadcrumbs = getBreadcrumbs();
  
  // Lógica para manejar la visibilidad de los breadcrumbs en diferentes tamaños de pantalla
  const responsiveBreadcrumbs = {
    full: breadcrumbs,
    tablet: breadcrumbs.length > 3 ? [{ label: "...", href: breadcrumbs[breadcrumbs.length - 4]?.href }, ...breadcrumbs.slice(-3)] : breadcrumbs,
    mobile: breadcrumbs.length > 2 ? [{ label: "...", href: breadcrumbs[breadcrumbs.length - 3]?.href }, ...breadcrumbs.slice(-2)] : breadcrumbs,
  }


  const renderBreadcrumbs = (items: BreadcrumbItem[]) => (
    <>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          {item.href ? (
            <Link href={item.href}>
              <a className="text-sm text-primary hover:underline transition-all">
                {item.label}
              </a>
            </Link>
          ) : (
            <span className="text-sm text-foreground font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </>
  );

  return (
    <nav className="h-10 flex items-center px-6 border-b border-border bg-background">
      {/* Desktop: show all breadcrumbs */}
      <div className="hidden lg:flex items-center gap-2">
        {renderBreadcrumbs(Array.isArray(responsiveBreadcrumbs) ? responsiveBreadcrumbs : responsiveBreadcrumbs.full)}
      </div>

      {/* Tablet: show last 3 items */}
      <div className="hidden md:flex lg:hidden items-center gap-2">
        {renderBreadcrumbs(Array.isArray(responsiveBreadcrumbs) ? responsiveBreadcrumbs : responsiveBreadcrumbs.tablet)}
      </div>

      {/* Mobile: show last 2 items */}
      <div className="flex md:hidden items-center gap-2">
        {renderBreadcrumbs(Array.isArray(responsiveBreadcrumbs) ? responsiveBreadcrumbs : responsiveBreadcrumbs.mobile)}
      </div>
    </nav>
  );
}