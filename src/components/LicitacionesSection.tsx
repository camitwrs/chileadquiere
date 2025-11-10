import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building2 } from "lucide-react";

interface Licitacion {
  id: number;
  titulo: string;
  rubro: string;
  fechaCierre: string;
  estado: "abierta" | "cierre-proximo" | "cerrada";
  monto: string;
  organismo: string;
}

const licitaciones: Licitacion[] = [
  {
    id: 1,
    titulo: "Suministro de Equipamiento Tecnológico para Hospitales Públicos",
    rubro: "Tecnología y Salud",
    fechaCierre: "15 Dic 2025",
    estado: "abierta",
    monto: "$450.000.000",
    organismo: "Ministerio de Salud",
  },
  {
    id: 2,
    titulo: "Construcción de Infraestructura Vial Región Metropolitana",
    rubro: "Obras Públicas",
    fechaCierre: "22 Nov 2025",
    estado: "cierre-proximo",
    monto: "$2.800.000.000",
    organismo: "MOP",
  },
  {
    id: 3,
    titulo: "Servicios de Consultoría en Transformación Digital",
    rubro: "Consultoría TI",
    fechaCierre: "30 Dic 2025",
    estado: "abierta",
    monto: "$180.000.000",
    organismo: "Ministerio de Economía",
  },
];

const estadoConfig = {
  abierta: { label: "Abierta", className: "bg-green-500 hover:bg-green-500" },
  "cierre-proximo": { label: "Cierre Próximo", className: "bg-orange-500 hover:bg-orange-500" },
  cerrada: { label: "Cerrada", className: "bg-red-500 hover:bg-red-500" },
};

export default function LicitacionesSection() {
  return (
    <section id="licitaciones" className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Últimas Licitaciones Públicas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Oportunidades de negocio actualizadas en tiempo real
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {licitaciones.map((licitacion) => (
            <Card key={licitacion.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={estadoConfig[licitacion.estado].className}>
                    {estadoConfig[licitacion.estado].label}
                  </Badge>
                  <span className="text-sm font-semibold text-primary">
                    {licitacion.monto}
                  </span>
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {licitacion.titulo}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{licitacion.organismo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Cierre: {licitacion.fechaCierre}</span>
                  </div>
                  <div className="pt-2">
                    <Badge variant="outline">{licitacion.rubro}</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Ver Detalles</Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg">
            Ver Todas las Licitaciones
          </Button>
        </div>
      </div>
    </section>
  );
}
