import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { VITE_APP_LOGO } from "@/const";
import { CheckCircle } from "lucide-react";

export default function ResetSuccess() {
  const [, setLocation] = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsAnimating(true), 100);
  }, []);

  const handleGoToLogin = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-[400px] bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={VITE_APP_LOGO} alt="ChileAdquiere" className="h-10 w-auto" />
        </div>

        {/* Success Icon with Animation */}
        <div className="flex justify-center mb-6">
          <div
            className={`transition-all duration-500 ${
              isAnimating
                ? "scale-100 opacity-100 animate-bounce"
                : "scale-50 opacity-0"
            }`}
          >
            <CheckCircle className="w-20 h-20 text-green-600" strokeWidth={2} />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-green-600 mb-2">
            ¡Contraseña Restablecida!
          </h1>
          <p className="text-sm text-gray-600">
            Tu contraseña se ha actualizado correctamente
          </p>
        </div>

        {/* Message */}
        <div className="mb-8">
          <p className="text-gray-700">
            Ya puedes iniciar sesión con tu nueva contraseña
          </p>
        </div>

        {/* Go to Login Button */}
        <Button
          onClick={handleGoToLogin}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base"
        >
          Ir a Iniciar Sesión
        </Button>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Consejo de seguridad:</strong> Asegúrate de no compartir tu contraseña con nadie y utiliza una contraseña única para cada servicio.
          </p>
        </div>
      </div>
    </div>
  );
}
