import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { VITE_APP_LOGO } from "@/const";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  // Password requirements
  const requirements = {
    minLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecial: /[@#$%^&*]/.test(newPassword),
  };

  const allRequirementsMet = Object.values(requirements).every(Boolean);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  // Calculate password strength
  const getPasswordStrength = () => {
    const metCount = Object.values(requirements).filter(Boolean).length;
    if (metCount <= 2) return { label: "Débil", color: "bg-red-500", width: "33%" };
    if (metCount <= 4) return { label: "Media", color: "bg-yellow-500", width: "66%" };
    return { label: "Fuerte", color: "bg-green-500", width: "100%" };
  };

  const strength = newPassword ? getPasswordStrength() : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (!allRequirementsMet) {
      toast.error("La contraseña no cumple con todos los requisitos");
      return;
    }

    if (!passwordsMatch) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    toast.success("Contraseña restablecida correctamente");
    
    setTimeout(() => {
      setLocation("/reset-success");
    }, 500);
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
            Restablecer tu Contraseña
          </h1>
          <p className="text-sm text-gray-600">
            Crea una contraseña fuerte para proteger tu cuenta
          </p>
        </div>

    

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm text-gray-700">
              Nueva Contraseña <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 pr-10 border border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Password Strength Meter */}
            {newPassword && strength && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Seguridad:</span>
                  <span className={`font-medium ${
                    strength.label === "Débil" ? "text-red-600" :
                    strength.label === "Media" ? "text-yellow-600" :
                    "text-green-600"
                  }`}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: strength.width }}
                  />
                </div>
              </div>
            )}

            {/* Requirements List */}
            {newPassword && (
              <div className="space-y-1 text-xs">
                <RequirementItem met={requirements.minLength}>
                  Mínimo 8 caracteres
                </RequirementItem>
                <RequirementItem met={requirements.hasUppercase}>
                  Al menos una mayúscula
                </RequirementItem>
                <RequirementItem met={requirements.hasLowercase}>
                  Al menos una minúscula
                </RequirementItem>
                <RequirementItem met={requirements.hasNumber}>
                  Al menos un número
                </RequirementItem>
                <RequirementItem met={requirements.hasSpecial}>
                  Al menos un carácter especial (@#$%^&*)
                </RequirementItem>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm text-gray-700">
              Confirmar Contraseña <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`h-10 border ${
                confirmPassword && !passwordsMatch
                  ? "border-red-500"
                  : "border-gray-300"
              } focus:border-blue-600 focus:ring-1 focus:ring-blue-600`}
              disabled={isLoading}
            />
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
            )}
            {confirmPassword && passwordsMatch && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Las contraseñas coinciden
              </p>
            )}
          </div>

          {/* Show Password Toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="showPassword"
              checked={showPassword}
              onCheckedChange={(checked) => setShowPassword(checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="showPassword" className="text-sm text-gray-700 cursor-pointer">
              Mostrar contraseña
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading || !allRequirementsMet || !passwordsMatch}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Restableciendo...
              </span>
            ) : (
              "Restablecer Contraseña"
            )}
          </Button>

              {/* Back button to previous page */}
        <div className="mb-4">
          <button
            type="button"
            className="text-sm text-gray-600 hover:underline"
            onClick={() => window.history.back()}
          >
            ← Volver
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}

function RequirementItem({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2 ${met ? "text-green-600" : "text-gray-500"}`}>
      {met ? (
        <Check className="w-3 h-3 shrink-0" />
      ) : (
        <X className="w-3 h-3 shrink-0" />
      )}
      <span>{children}</span>
    </div>
  );
}