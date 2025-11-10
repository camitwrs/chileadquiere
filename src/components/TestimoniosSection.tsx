import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

interface Testimonio {
  nombre: string;
  rol: string;
  empresa: string;
  texto: string;
  avatar: string;
}

const testimonios: Testimonio[] = [
  {
    nombre: "María González",
    rol: "Directora de Compras",
    empresa: "Hospital Regional de Valparaíso",
    texto: "ChileAdquiere transformó completamente nuestro proceso de adquisiciones. Ahora somos más eficientes y transparentes en cada compra.",
    avatar: "/MariaGonzalez.jpg",
  },
  {
    nombre: "Carlos Ramírez",
    rol: "Gerente General",
    empresa: "Constructora del Sur",
    texto: "La plataforma nos permitió acceder a más oportunidades de negocio. El proceso es claro y la comunicación con los organismos es fluida.",
    avatar: "/CarlosRamirez.jpg",
  },
  {
    nombre: "Andrea Silva",
    rol: "Jefa de Licitaciones",
    empresa: "Ministerio de Obras Públicas",
    texto: "Hemos reducido los tiempos de gestión en un 60%. La transparencia y trazabilidad son incomparables con cualquier sistema anterior.",
    avatar: "/AndreaSilva.jpg",
  },
];

export default function TestimoniosSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonios.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Lo Que Dicen Nuestros Usuarios
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Historias reales de organizaciones que confían en ChileAdquiere
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col items-center text-center">
                <Quote className="h-12 w-12 text-primary mb-6" />
                
                <p className="text-lg md:text-xl mb-8 leading-relaxed">
                  "{testimonios[currentIndex].texto}"
                </p>

                <div className="flex items-center gap-4">
                  <img
                    src={testimonios[currentIndex].avatar} // Usa la ruta de la imagen
                    //alt={`Avatar de ${testimonios[currentIndex].nombre}`} // Texto alternativo accesible
                    // Clases de Tailwind para mantener el estilo circular:
                    className="h-16 w-16 rounded-full object-cover border-2 border-primary" 
                  />
                  <div className="text-left">
                    <p className="font-bold text-lg">{testimonios[currentIndex].nombre}</p>
                    <p className="text-sm text-muted-foreground">{testimonios[currentIndex].rol}</p>
                    <p className="text-sm font-medium text-primary">{testimonios[currentIndex].empresa}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonios.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
