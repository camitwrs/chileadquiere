import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { VITE_APP_LOGO } from "@/const";
import { useLocation } from "wouter";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: "Inicio", href: "#inicio" },
    { label: "Sobre Nosotros", href: "#sobre-nosotros" },
    { label: "Características", href: "#caracteristicas" },
    { label: "Licitaciones Públicas", href: "#licitaciones" },
    { label: "Proveedores", href: "#proveedores" },
    { label: "Contacto", href: "#contacto" },
  ];

  return (
  <header className="bg-background border-b border-border sticky top-0 z-50 w-full overflow-visible">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img
              src={VITE_APP_LOGO}
              alt="ChileAdquiere"
              className="h-9 w-auto sm:h-10"
            />
            <span className="text-xl sm:text-2xl font-black tracking-tight hidden sm:block">
              ChileAdquiere
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Button size="sm" asChild>
              <a href="/register">Registrarse</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/login">Iniciar Sesión</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation (absolute overlay to avoid being clipped/covered) */}
        {isMenuOpen && (
          <div className="lg:hidden absolute left-0 right-0 top-full z-[9999] border-t border-border bg-background shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <nav className="flex flex-col space-y-3">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
                <div className="flex flex-col sm:flex-row sm:space-x-3 sm:space-y-0 space-y-2 pt-3 border-white   mt-3">
                 <Button size="sm" asChild>
              <a href="/register">Registrarse</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/login">Iniciar Sesión</a>
            </Button>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
