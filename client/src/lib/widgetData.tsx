import { UserRole } from "@/contexts/AuthContext";

export interface Widget {
  id: string;
  type: "kpi" | "list" | "timeline" | "table" | "chart";
  title: string;
  color: string;
  data: any;
}

export const getWidgetsByRole = (role: UserRole): Widget[] => {
  const widgetsByRole: Record<UserRole, Widget[]> = {
    comprador: [
      {
        id: "licitaciones-activas",
        type: "kpi",
        title: "Licitaciones Activas",
        color: "bg-blue-500",
        data: {
          value: 24,
          change: "+12%",
          trend: "up",
        },
      },
      {
        id: "ordenes-recientes",
        type: "list",
        title: "Órdenes Recientes",
        color: "bg-green-500",
        data: [
          { id: 1, name: "Orden #1234", status: "Aprobada", date: "Hoy" },
          { id: 2, name: "Orden #1235", status: "Pendiente", date: "Ayer" },
          { id: 3, name: "Orden #1236", status: "En Proceso", date: "2 días" },
        ],
      },
      {
        id: "presupuesto",
        type: "kpi",
        title: "Presupuesto Gastado",
        color: "bg-orange-500",
        data: {
          value: "$2.4M",
          change: "68% del total",
          trend: "neutral",
        },
      },
      {
        id: "proveedores-activos",
        type: "kpi",
        title: "Proveedores Activos",
        color: "bg-purple-500",
        data: {
          value: 156,
          change: "+8 este mes",
          trend: "up",
        },
      },
      {
        id: "vencimientos",
        type: "timeline",
        title: "Próximos Vencimientos",
        color: "bg-red-500",
        data: [
          { id: 1, title: "Licitación #456", date: "En 2 días" },
          { id: 2, title: "Evaluación proveedores", date: "En 5 días" },
          { id: 3, title: "Cierre Q4", date: "En 7 días" },
        ],
      },
      {
        id: "actividad",
        type: "chart",
        title: "Actividad del Mes",
        color: "bg-teal-500",
        data: {
          labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
          values: [12, 19, 15, 24],
        },
      },
    ],
    proveedor: [
      {
        id: "oportunidades",
        type: "kpi",
        title: "Oportunidades Disponibles",
        color: "bg-blue-500",
        data: {
          value: 38,
          change: "+5 nuevas",
          trend: "up",
        },
      },
      {
        id: "mis-ofertas",
        type: "list",
        title: "Mis Ofertas",
        color: "bg-green-500",
        data: [
          { id: 1, name: "Licitación #789", status: "En Evaluación", date: "Hoy" },
          { id: 2, name: "Licitación #790", status: "Ganada", date: "Ayer" },
          { id: 3, name: "Licitación #791", status: "Enviada", date: "3 días" },
        ],
      },
      {
        id: "ingresos",
        type: "kpi",
        title: "Ingresos Este Mes",
        color: "bg-green-600",
        data: {
          value: "$850K",
          change: "+22%",
          trend: "up",
        },
      },
      {
        id: "historial",
        type: "table",
        title: "Historial Reciente",
        color: "bg-purple-500",
        data: [
          { id: 1, concepto: "Pago recibido", monto: "$120K", fecha: "15 Nov" },
          { id: 2, concepto: "Oferta enviada", monto: "-", fecha: "14 Nov" },
          { id: 3, concepto: "Licitación ganada", monto: "$450K", fecha: "12 Nov" },
        ],
      },
      {
        id: "evaluaciones",
        type: "kpi",
        title: "Calificación Promedio",
        color: "bg-yellow-500",
        data: {
          value: "4.8",
          change: "⭐⭐⭐⭐⭐",
          trend: "up",
        },
      },
      {
        id: "documentos-pendientes",
        type: "timeline",
        title: "Documentos Pendientes",
        color: "bg-red-500",
        data: [
          { id: 1, title: "Certificado tributario", date: "Vence en 10 días" },
          { id: 2, title: "Balance financiero", date: "Vence en 15 días" },
        ],
      },
    ],
    administrador: [
      {
        id: "usuarios-activos",
        type: "kpi",
        title: "Usuarios Activos",
        color: "bg-blue-500",
        data: {
          value: 1247,
          change: "+34 hoy",
          trend: "up",
        },
      },
      {
        id: "transacciones",
        type: "kpi",
        title: "Transacciones Hoy",
        color: "bg-green-500",
        data: {
          value: 89,
          change: "+15%",
          trend: "up",
        },
      },
      {
        id: "alertas",
        type: "list",
        title: "Alertas del Sistema",
        color: "bg-red-500",
        data: [
          { id: 1, name: "Uso CPU alto", status: "Crítico", date: "Hace 5 min" },
          { id: 2, name: "Login fallido", status: "Advertencia", date: "Hace 15 min" },
          { id: 3, name: "Backup completado", status: "Info", date: "Hace 1 hora" },
        ],
      },
      {
        id: "health",
        type: "table",
        title: "Health Check",
        color: "bg-teal-500",
        data: [
          { id: 1, servicio: "API", estado: "✅ Operativo", uptime: "99.9%" },
          { id: 2, servicio: "Base de Datos", estado: "✅ Operativo", uptime: "100%" },
          { id: 3, servicio: "Storage", estado: "⚠️ Degradado", uptime: "98.5%" },
        ],
      },
      {
        id: "nuevos-usuarios",
        type: "chart",
        title: "Nuevos Usuarios",
        color: "bg-purple-500",
        data: {
          labels: ["Lun", "Mar", "Mié", "Jue", "Vie"],
          values: [12, 18, 15, 22, 19],
        },
      },
      {
        id: "actividad-sistema",
        type: "kpi",
        title: "Carga del Sistema",
        color: "bg-orange-500",
        data: {
          value: "42%",
          change: "Normal",
          trend: "neutral",
        },
      },
    ],
  };

  return widgetsByRole[role];
};
