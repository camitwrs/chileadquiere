import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { VITE_APP_LOGO } from "@/const";
import { Mail, Smartphone, QrCode } from "lucide-react";

type TwoFactorMethod = "email" | "sms" | "authenticator";

export default function TwoFactorSelect() {
  const [, setLocation] = useLocation();
  const [selectedMethod, setSelectedMethod] = useState<TwoFactorMethod | null>(
    null
  );

  // Mock user data - en producción vendría del contexto de autenticación
  const userEmail = "juan@empresa.cl";
  const userPhone = "+56 9 1234 56**";
  const hasAuthenticator = true; // Simula si el usuario tiene configurado authenticator

  const handleNext = () => {
    if (!selectedMethod) return;
    
    // Navegar a la pantalla de verificación correspondiente
    setLocation(`/two-factor-verify?method=${selectedMethod}`);
  };

  const methods = [
    {
      id: "email" as TwoFactorMethod,
      icon: Mail,
      title: "Código por Email",
      description: `Te enviaremos un código a ${userEmail.substring(0, 4)}...${userEmail.substring(userEmail.indexOf("@"))}`,
      available: true,
    },
    {
      id: "sms" as TwoFactorMethod,
      icon: Smartphone,
      title: "Código por SMS",
      description: `Recibirás un código en ${userPhone}`,
      available: true,
    },
    {
      id: "authenticator" as TwoFactorMethod,
      icon: QrCode,
      title: "App Authenticator",
      description: "Usa Google Authenticator o similar",
      available: hasAuthenticator,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-[600px] bg-white rounded-lg shadow-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={VITE_APP_LOGO} alt="ChileAdquiere" className="h-10 w-auto" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-bold text-gray-900 mb-2">
            Verificación Adicional
          </h1>
          <p className="text-sm text-gray-600">
            Selecciona cómo deseas recibir tu código de verificación
          </p>
        </div>

        {/* Method Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {methods
            .filter((method) => method.available)
            .map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;

              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`
                    relative p-6 rounded-lg border-2 transition-all duration-200
                    hover:bg-gray-50 hover:border-blue-300
                    ${
                      isSelected
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }
                  `}
                  style={{ minHeight: "140px" }}
                >
                  {/* Radio Button */}
                  <div className="absolute top-4 right-4">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-3">
                    <Icon
                      className={`w-10 h-10 ${
                        isSelected ? "text-blue-600" : "text-gray-600"
                      }`}
                    />
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-base font-semibold mb-2 ${
                      isSelected ? "text-blue-900" : "text-gray-900"
                    }`}
                  >
                    {method.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {method.description}
                  </p>
                </button>
              );
            })}
        </div>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          disabled={!selectedMethod}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Siguiente
        </Button>

        {/* Back to Login */}
        <div className="text-center mt-4">
          <a
            href="/login"
            className="text-sm text-gray-600 hover:text-blue-600 hover:underline"
          >
            Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  );
}