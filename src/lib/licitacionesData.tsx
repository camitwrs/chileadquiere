export type EstadoLicitacion =
  | "Abierta"
  | "Cierre Próximo"
  | "Cerrada"
  | "Evaluación"
  | "Adjudicada"
  | "Anulada";

export type RubroLicitacion =
  | "Tecnología"
  | "Servicios"
  | "Productos"
  | "Consultoría"
  | "Logística"
  | "Construcción"
  | "Mantenimiento"
  | "Otros";

export type TipoLicitacion = "Abierta" | "Cerrada" | "Inversa" | "Quick";

export interface Responsable {
  nombre: string;
  avatar: string;
}

export interface Licitacion {
  id: string;
  titulo: string;
  rubro: RubroLicitacion;
  monto: number;
  estado: EstadoLicitacion;
  fechaCierre: Date;
  diasRestantes: number;
  ofertasRecibidas: number;
  responsable: Responsable;
  tipo: TipoLicitacion;
  organismo: string;
  createdAt: Date;
}

export interface Organismo {
  id: string;
  nombre: string;
  logo: string;
}

// Datos mock de organismos públicos
export const organismosMock: Organismo[] = [
  { id: "1", nombre: "Ministerio de Salud", logo: "🏥" },
  { id: "2", nombre: "Ministerio de Educación", logo: "📚" },
  { id: "3", nombre: "Ministerio de Obras Públicas", logo: "🏗️" },
  { id: "4", nombre: "Ministerio del Interior", logo: "🏛️" },
  { id: "5", nombre: "Ministerio de Hacienda", logo: "💰" },
  { id: "6", nombre: "Ministerio de Economía", logo: "📊" },
  { id: "7", nombre: "Ministerio de Transportes", logo: "🚗" },
  { id: "8", nombre: "Ministerio de Justicia", logo: "⚖️" },
  { id: "9", nombre: "Ministerio de Defensa", logo: "🛡️" },
  { id: "10", nombre: "Ministerio de Agricultura", logo: "🌾" },
  { id: "11", nombre: "Hospital Regional de Valparaíso", logo: "🏥" },
  { id: "12", nombre: "Universidad de Chile", logo: "🎓" },
  { id: "13", nombre: "Municipalidad de Santiago", logo: "🏛️" },
  { id: "14", nombre: "Carabineros de Chile", logo: "👮" },
  { id: "15", nombre: "PDI", logo: "🔍" },
  { id: "16", nombre: "Servicio de Salud Metropolitano", logo: "🏥" },
  { id: "17", nombre: "JUNAEB", logo: "🍎" },
  { id: "18", nombre: "INDAP", logo: "🌱" },
  { id: "19", nombre: "SERNAC", logo: "🛡️" },
  { id: "20", nombre: "Contraloría General", logo: "📋" },
];

// Datos mock de usuarios responsables
export const usuariosMock: Responsable[] = [
  { nombre: "Juan Pérez", avatar: "https://i.pravatar.cc/150?img=12" },
  { nombre: "María González", avatar: "https://i.pravatar.cc/150?img=45" },
  { nombre: "Carlos Rodríguez", avatar: "https://i.pravatar.cc/150?img=33" },
  { nombre: "Ana Martínez", avatar: "https://i.pravatar.cc/150?img=47" },
  { nombre: "Pedro Sánchez", avatar: "https://i.pravatar.cc/150?img=68" },
  { nombre: "Laura Torres", avatar: "https://i.pravatar.cc/150?img=23" },
  { nombre: "Diego Fernández", avatar: "https://i.pravatar.cc/150?img=51" },
  { nombre: "Carmen Silva", avatar: "https://i.pravatar.cc/150?img=29" },
];

// Función helper para calcular días restantes
function calcularDiasRestantes(fechaCierre: Date): number {
  const hoy = new Date();
  const diff = fechaCierre.getTime() - hoy.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Función helper para determinar estado basado en días restantes
function determinarEstado(diasRestantes: number, estadoBase: EstadoLicitacion): EstadoLicitacion {
  if (diasRestantes < 0) return "Cerrada";
  if (diasRestantes <= 7 && estadoBase === "Abierta") return "Cierre Próximo";
  return estadoBase;
}

// Datos mock de licitaciones
const licitacionesBase: Omit<Licitacion, "diasRestantes" | "estado">[] = [
  {
    id: "LIC-2024-001",
    titulo: "Suministro de Equipamiento Tecnológico para Hospitales Públicos",
    rubro: "Tecnología",
    monto: 45000000,
    fechaCierre: new Date(2025, 0, 15),
    ofertasRecibidas: 12,
    responsable: usuariosMock[0],
    tipo: "Abierta",
    organismo: "Ministerio de Salud",
    createdAt: new Date(2024, 10, 1),
  },
  {
    id: "LIC-2024-002",
    titulo: "Construcción de Infraestructura Vial Región Metropolitana",
    rubro: "Construcción",
    monto: 2400000000,
    fechaCierre: new Date(2024, 11, 20),
    ofertasRecibidas: 8,
    responsable: usuariosMock[1],
    tipo: "Cerrada",
    organismo: "Ministerio de Obras Públicas",
    createdAt: new Date(2024, 9, 15),
  },
  {
    id: "LIC-2024-003",
    titulo: "Servicios de Consultoría en Transformación Digital",
    rubro: "Consultoría",
    monto: 18500000,
    fechaCierre: new Date(2024, 11, 12),
    ofertasRecibidas: 15,
    responsable: usuariosMock[2],
    tipo: "Abierta",
    organismo: "Ministerio de Economía",
    createdAt: new Date(2024, 10, 5),
  },
  {
    id: "LIC-2024-004",
    titulo: "Adquisición de Material de Oficina y Papelería",
    rubro: "Productos",
    monto: 3200000,
    fechaCierre: new Date(2024, 11, 25),
    ofertasRecibidas: 22,
    responsable: usuariosMock[3],
    tipo: "Quick",
    organismo: "Municipalidad de Santiago",
    createdAt: new Date(2024, 10, 10),
  },
  {
    id: "LIC-2024-005",
    titulo: "Mantenimiento de Sistemas Informáticos Gubernamentales",
    rubro: "Mantenimiento",
    monto: 12800000,
    fechaCierre: new Date(2024, 11, 8),
    ofertasRecibidas: 6,
    responsable: usuariosMock[4],
    tipo: "Abierta",
    organismo: "Ministerio del Interior",
    createdAt: new Date(2024, 9, 20),
  },
  {
    id: "LIC-2024-006",
    titulo: "Servicios de Logística y Transporte de Medicamentos",
    rubro: "Logística",
    monto: 28000000,
    fechaCierre: new Date(2025, 0, 30),
    ofertasRecibidas: 9,
    responsable: usuariosMock[5],
    tipo: "Abierta",
    organismo: "Servicio de Salud Metropolitano",
    createdAt: new Date(2024, 10, 12),
  },
  {
    id: "LIC-2024-007",
    titulo: "Implementación de Sistema de Gestión Documental",
    rubro: "Tecnología",
    monto: 35000000,
    fechaCierre: new Date(2024, 10, 28),
    ofertasRecibidas: 18,
    responsable: usuariosMock[6],
    tipo: "Cerrada",
    organismo: "Contraloría General",
    createdAt: new Date(2024, 9, 1),
  },
  {
    id: "LIC-2024-008",
    titulo: "Servicios de Capacitación en Seguridad Laboral",
    rubro: "Servicios",
    monto: 8500000,
    fechaCierre: new Date(2024, 11, 18),
    ofertasRecibidas: 11,
    responsable: usuariosMock[7],
    tipo: "Abierta",
    organismo: "Ministerio de Trabajo",
    createdAt: new Date(2024, 10, 8),
  },
  {
    id: "LIC-2024-009",
    titulo: "Adquisición de Vehículos para Servicios Públicos",
    rubro: "Productos",
    monto: 156000000,
    fechaCierre: new Date(2025, 1, 10),
    ofertasRecibidas: 7,
    responsable: usuariosMock[0],
    tipo: "Abierta",
    organismo: "Ministerio de Transportes",
    createdAt: new Date(2024, 10, 15),
  },
  {
    id: "LIC-2024-010",
    titulo: "Consultoría para Evaluación de Proyectos de Inversión",
    rubro: "Consultoría",
    monto: 22000000,
    fechaCierre: new Date(2024, 11, 22),
    ofertasRecibidas: 13,
    responsable: usuariosMock[1],
    tipo: "Abierta",
    organismo: "Ministerio de Hacienda",
    createdAt: new Date(2024, 10, 3),
  },
  {
    id: "LIC-2024-011",
    titulo: "Mantenimiento de Infraestructura Educacional",
    rubro: "Mantenimiento",
    monto: 42000000,
    fechaCierre: new Date(2024, 10, 25),
    ofertasRecibidas: 24,
    responsable: usuariosMock[2],
    tipo: "Cerrada",
    organismo: "Ministerio de Educación",
    createdAt: new Date(2024, 9, 10),
  },
  {
    id: "LIC-2024-012",
    titulo: "Servicios de Alimentación para Establecimientos Educacionales",
    rubro: "Servicios",
    monto: 68000000,
    fechaCierre: new Date(2025, 0, 20),
    ofertasRecibidas: 16,
    responsable: usuariosMock[3],
    tipo: "Abierta",
    organismo: "JUNAEB",
    createdAt: new Date(2024, 10, 18),
  },
  {
    id: "LIC-2024-013",
    titulo: "Construcción de Centro de Salud Familiar",
    rubro: "Construcción",
    monto: 890000000,
    fechaCierre: new Date(2025, 1, 28),
    ofertasRecibidas: 5,
    responsable: usuariosMock[4],
    tipo: "Cerrada",
    organismo: "Hospital Regional de Valparaíso",
    createdAt: new Date(2024, 10, 20),
  },
  {
    id: "LIC-2024-014",
    titulo: "Adquisición de Software de Gestión Financiera",
    rubro: "Tecnología",
    monto: 25000000,
    fechaCierre: new Date(2024, 11, 15),
    ofertasRecibidas: 10,
    responsable: usuariosMock[5],
    tipo: "Abierta",
    organismo: "Universidad de Chile",
    createdAt: new Date(2024, 10, 7),
  },
  {
    id: "LIC-2024-015",
    titulo: "Servicios de Seguridad y Vigilancia",
    rubro: "Servicios",
    monto: 15600000,
    fechaCierre: new Date(2024, 11, 30),
    ofertasRecibidas: 19,
    responsable: usuariosMock[6],
    tipo: "Abierta",
    organismo: "Ministerio de Justicia",
    createdAt: new Date(2024, 10, 14),
  },
  {
    id: "LIC-2024-016",
    titulo: "Suministro de Equipamiento Agrícola",
    rubro: "Productos",
    monto: 38000000,
    fechaCierre: new Date(2025, 0, 25),
    ofertasRecibidas: 8,
    responsable: usuariosMock[7],
    tipo: "Abierta",
    organismo: "INDAP",
    createdAt: new Date(2024, 10, 22),
  },
  {
    id: "LIC-2024-017",
    titulo: "Consultoría en Gestión de Proyectos Tecnológicos",
    rubro: "Consultoría",
    monto: 19500000,
    fechaCierre: new Date(2024, 11, 10),
    ofertasRecibidas: 14,
    responsable: usuariosMock[0],
    tipo: "Abierta",
    organismo: "Ministerio de Ciencia",
    createdAt: new Date(2024, 10, 2),
  },
  {
    id: "LIC-2024-018",
    titulo: "Logística para Distribución de Material Electoral",
    rubro: "Logística",
    monto: 52000000,
    fechaCierre: new Date(2024, 10, 30),
    ofertasRecibidas: 21,
    responsable: usuariosMock[1],
    tipo: "Cerrada",
    organismo: "SERVEL",
    createdAt: new Date(2024, 9, 25),
  },
];

// Generar licitaciones con estado y días restantes calculados
export const licitacionesMock: Licitacion[] = licitacionesBase.map((lic) => {
  const diasRestantes = calcularDiasRestantes(lic.fechaCierre);
  const estadoInicial: EstadoLicitacion = 
    diasRestantes < 0 ? "Cerrada" :
    Math.random() > 0.7 ? "Evaluación" :
    Math.random() > 0.8 ? "Adjudicada" :
    "Abierta";
  
  return {
    ...lic,
    diasRestantes,
    estado: determinarEstado(diasRestantes, estadoInicial),
  };
});

// Contadores por estado
export const estadisticasLicitaciones = {
  activas: licitacionesMock.filter((l) => l.estado === "Abierta" || l.estado === "Cierre Próximo").length,
  cerradas: licitacionesMock.filter((l) => l.estado === "Cerrada").length,
  porEvaluar: licitacionesMock.filter((l) => l.estado === "Evaluación").length,
  adjudicadas: licitacionesMock.filter((l) => l.estado === "Adjudicada").length,
};

// Contadores por rubro
export const contadoresPorRubro: Record<RubroLicitacion, number> = {
  Tecnología: licitacionesMock.filter((l) => l.rubro === "Tecnología").length,
  Servicios: licitacionesMock.filter((l) => l.rubro === "Servicios").length,
  Productos: licitacionesMock.filter((l) => l.rubro === "Productos").length,
  Consultoría: licitacionesMock.filter((l) => l.rubro === "Consultoría").length,
  Logística: licitacionesMock.filter((l) => l.rubro === "Logística").length,
  Construcción: licitacionesMock.filter((l) => l.rubro === "Construcción").length,
  Mantenimiento: licitacionesMock.filter((l) => l.rubro === "Mantenimiento").length,
  Otros: licitacionesMock.filter((l) => l.rubro === "Otros").length,
};
