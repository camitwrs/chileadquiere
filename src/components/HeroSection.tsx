import React from 'react';

// --- COMPONENTE BUTTON PLACEHOLDER ---
// Se ha incluido el componente Button aquí para resolver el error de importación 
// "Could not resolve './ui/button'" y hacer que el archivo sea autónomo.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'secondary' | 'outline';
  size?: 'lg';
}

const Button: React.FC<ButtonProps> = ({ variant, size, className, children, ...props }) => {
  let baseStyles = "font-semibold py-3 px-6 rounded-xl transition duration-300 shadow-lg active:scale-[0.98]";
  
  if (variant === 'secondary') {
    // Estilos para el botón principal (Explorar Licitaciones)
    baseStyles += " bg-[#FF6B35] hover:bg-[#E55A28] text-white"; // He cambiado el color para destacar más
  } else if (variant === 'outline') {
    // Estilos para el botón de contorno (Regístrate Aquí)
    baseStyles += " bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0066CC]";
  } else {
    // Estilos por defecto
    baseStyles += " bg-gray-500 hover:bg-gray-700 text-white";
  }

  if (size === 'lg') {
    baseStyles += " text-lg";
  }

  // Combina estilos base con clases pasadas por la prop className
  const finalClassName = `${baseStyles} ${className || ''}`;

  return (
    <button className={finalClassName} {...props}>
      {children}
    </button>
  );
};
// --- FIN COMPONENTE BUTTON PLACEHOLDER ---


// Se define el componente como una constante local
const HeroSection: React.FC = () => {
  const handleExploreClick = () => {
    // Scroll suave al ID 'tenders' (asumiendo que está más abajo en la página)
    const tendersSection = document.querySelector('#tenders');
    if (tendersSection) {
      tendersSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-[#0066CC] via-[#0052A3] to-[#003D7A] text-white overflow-hidden min-h-[60vh] flex items-center">
      {/* Background Pattern (Usando un patrón SVG codificado en base64) */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex flex-col items-center justify-center text-center py-16 md:py-24 lg:py-32">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 max-w-4xl tracking-tight">
            La Plataforma de Adquisiciones Más Transparente
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl mb-12 max-w-3xl text-blue-100 font-light">
            Conectando compradores y proveedores en un ecosistema digital seguro y eficiente.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="secondary" 
              size="lg"
              onClick={handleExploreClick}
              className="min-w-[220px]"
            >
              Explorar Licitaciones
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="min-w-[260px]"
            >
              <a href="/register">¿Eres Proveedor? Regístrate Aquí</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Wave Divider (SVG para dar un corte limpio a la siguiente sección) */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" 
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

// Se exporta el componente como la EXPORTACIÓN POR DEFECTO
export default HeroSection;