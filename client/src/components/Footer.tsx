import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { VITE_APP_LOGO } from "@/const";

const footerSections = [
  {
    title: "Empresa",
    links: [
      { label: "Sobre Nosotros", href: "#sobre-nosotros" },
      { label: "Misión y Visión", href: "#" },
      { label: "Equipo", href: "#" },
      { label: "Carreras", href: "#" },
      { label: "Prensa", href: "#" },
    ],
  },
  {
    title: "Productos",
    links: [
      { label: "Plataforma de Licitaciones", href: "#" },
      { label: "Portal de Proveedores", href: "#" },
      { label: "Sistema de Gestión", href: "#" },
      { label: "API y Desarrolladores", href: "#" },
      { label: "Integraciones", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos y Condiciones", href: "#" },
      { label: "Política de Privacidad", href: "#" },
      { label: "Política de Cookies", href: "#" },
      { label: "Cumplimiento Normativo", href: "#" },
      { label: "Transparencia", href: "#" },
    ],
  },
  {
    title: "Contacto",
    links: [
      { label: "Soporte Técnico", href: "#" },
      { label: "Ventas", href: "#" },
      { label: "Capacitación", href: "#" },
      { label: "Centro de Ayuda", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
];

const socialLinks = [
  { icon: Facebook, href: "", label: "Facebook" },
  { icon: Twitter, href: "", label: "Twitter" },
  { icon: Linkedin, href: "", label: "LinkedIn" },
  { icon: Instagram, href: "", label: "Instagram" },
];

export default function Footer() {
  return (
    <footer id="contacto" className="bg-muted/50 border-t border-border">
      <div className="container py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-bold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={VITE_APP_LOGO} alt="ChileAdquiere" className="h-8 w-auto" />
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ChileAdquiere. Todos los derechos reservados.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                aria-label={social.label}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
