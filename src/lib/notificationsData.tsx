export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
}

export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Nueva licitación publicada",
    message: "Suministro de equipamiento tecnológico para hospitales públicos",
    time: "Hace 5 minutos",
    read: false,
    type: "info",
  },
  {
    id: "2",
    title: "Oferta aceptada",
    message: "Tu oferta para la licitación #1234 ha sido aceptada",
    time: "Hace 1 hora",
    read: false,
    type: "success",
  },
  {
    id: "3",
    title: "Documento pendiente",
    message: "Debes actualizar tu certificado tributario antes del 15 de noviembre",
    time: "Hace 3 horas",
    read: true,
    type: "warning",
  },
  {
    id: "4",
    title: "Orden de compra generada",
    message: "Se ha generado la orden #5678 por $2.4M",
    time: "Ayer",
    read: true,
    type: "success",
  },
  {
    id: "5",
    title: "Cierre de licitación próximo",
    message: "La licitación #456 cierra en 2 días",
    time: "Hace 2 días",
    read: true,
    type: "warning",
  },
];

export const getUnreadCount = (notifications: Notification[]): number => {
  return notifications.filter((n) => !n.read).length;
};
