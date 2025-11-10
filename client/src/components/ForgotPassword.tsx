import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VITE_APP_LOGO } from "@/const";
import { Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@/contexts/AuthContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  // Mock users database
  const mockUsers = [
    "admin@example.com",
    "comprador@example.com",
    "proveedor@example.com",
  ];

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Formato de email inválido");
    } else {
      setEmailError("");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Por favor ingresa tu email");
      return;
    }

    if (emailError) {
      toast.error("Por favor corrige los errores antes de continuar");
      return;
    }

    // Check if email exists in mock database
    if (!mockUsers.includes(email.toLowerCase())) {
      setEmailError("Este email no está registrado en el sistema");
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);
    toast.success("Código de verificación enviado");
    
    // Navigate to verify email page with email as state
    setLocation(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-[400px] bg-white rounded-lg shadow-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={VITE_APP_LOGO} alt="ChileAdquiere" className="h-10 w-auto" />
        </div>

      

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold text-gray-900 mb-2">
            ¿Olvidaste tu Contraseña?
          </h1>
          <p className="text-sm text-gray-600">
            Ingresa tu email para recibir instrucciones de recuperación
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-gray-700">
              Email <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={handleEmailChange}
                className={`h-10 pl-10 border ${
                  emailError ? "border-red-500" : "border-gray-300"
                } focus:border-blue-600 focus:ring-1 focus:ring-blue-600`}
                disabled={isLoading}
              />
            </div>
            {emailError && (
              <p className="text-xs text-red-500">{emailError}</p>
            )}
          </div>

          {/* Role Selector */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-700">
              ¿Accedías como? (opcional pero recomendado)
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole("comprador")}
                className={`h-10 rounded border-2 text-sm transition-all ${
                  selectedRole === "comprador"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
                disabled={isLoading}
              >
                Comprador
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("proveedor")}
                className={`h-10 rounded border-2 text-sm transition-all ${
                  selectedRole === "proveedor"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
                disabled={isLoading}
              >
                Proveedor
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("administrador")}
                className={`h-10 rounded border-2 text-sm transition-all ${
                  selectedRole === "administrador"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
                disabled={isLoading}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enviando...
              </span>
            ) : (
              "Enviar Instrucciones"
            )}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <a
            href="/login"
            className="text-xs text-gray-600 hover:text-blue-600 hover:underline"
          >
            Volver a Iniciar Sesión
          </a>
        </div>
      </div>
    </div>
  );
}
