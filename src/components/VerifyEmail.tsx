import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VITE_APP_LOGO } from "@/const";
import { Mail } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get email from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email") || "usuario@ejemplo.com";

  // Mock verification code
  const MOCK_CODE = "123456";

  // Timer for code expiration
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Timer for resend countdown
  useEffect(() => {
    if (resendCountdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all fields are filled
    if (newCode.every((digit) => digit !== "") && !isVerifying) {
      handleVerify(newCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
    setCode(newCode);

    // Focus last filled input or first empty
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();

    // Auto-verify if complete
    if (pastedData.length === 6) {
      handleVerify(newCode);
    }
  };

  const handleVerify = async (codeToVerify: string[] = code) => {
    const codeString = codeToVerify.join("");

    if (codeString.length !== 6) {
      toast.error("Por favor ingresa el código completo");
      return;
    }

    setIsVerifying(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (codeString === MOCK_CODE) {
      toast.success("Código verificado correctamente");
      setTimeout(() => {
        setLocation("/reset-password");
      }, 500);
    } else {
      toast.error("Código incorrecto. Intenta nuevamente.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }

    setIsVerifying(false);
  };

  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendCountdown(30);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    toast.success("Código reenviado a tu email");
    
    // Reset timer
    setTimeLeft(600);
  };

  const handleUseAnotherEmail = () => {
    setLocation("/forgot-password");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-[500px] bg-white rounded-lg shadow-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={VITE_APP_LOGO} alt="ChileAdquiere" className="h-10 w-auto" />
        </div>

    

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold text-gray-900 mb-2">
            Verifica tu Email
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            Hemos enviado un código de verificación a{" "}
            <span className="font-medium text-gray-900">{email}</span>
          </p>
          <p className="text-xs text-gray-500">
            Revisa tu bandeja de entrada (incluir spam si es necesario)
          </p>
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-1">El código expira en:</p>
          <p
            className={`text-2xl font-bold ${
              timeLeft < 120 ? "text-red-600" : "text-blue-600"
            }`}
          >
            {formatTime(timeLeft)}
          </p>
        </div>

        {/* Code Input */}
        <div className="mb-6">
          <div className="flex justify-center gap-2 mb-4">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-10 h-10 text-center text-lg font-bold border-2 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600"
                disabled={isVerifying || timeLeft <= 0}
              />
            ))}
          </div>

          {/* Verify Button */}
          <Button
            onClick={() => handleVerify()}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isVerifying || code.some((d) => !d) || timeLeft <= 0}
          >
            {isVerifying ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verificando...
              </span>
            ) : (
              "Verificar Código"
            )}
          </Button>
        </div>

        {/* Helper text */}
        <div className="text-center mb-4">
          <p className="text-xs text-gray-500 mb-2">
            Código de prueba: <span className="font-mono font-bold">123456</span>
          </p>
        </div>

        {/* Resend Link */}
        <div className="text-center mb-4">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-sm text-blue-600 hover:underline"
            >
              ¿No recibiste el código? Reenviar
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Reenviar en {resendCountdown}s
            </p>
          )}
        </div>

        {/* Use Another Email */}
        <div className="text-center">
          <button
            onClick={handleUseAnotherEmail}
            className="text-xs text-gray-600 hover:text-blue-600 hover:underline"
          >
            Usar otra dirección email
          </button>
        </div>
      </div>
    </div>
  );
}