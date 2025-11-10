import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { VITE_APP_LOGO } from "@/const";
import { CheckCircle } from "lucide-react";

export default function TwoFactorSuccess() {
  const [, setLocation] = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsAnimating(true), 100);

    // Redirect to dashboard after 2 seconds
    const timer = setTimeout(() => {
      setLocation("/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [setLocation]);

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
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-green-600 mb-2">
            ¡Verificación exitosa!
          </h1>
          <p className="text-base text-gray-700">Iniciando sesión...</p>
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
